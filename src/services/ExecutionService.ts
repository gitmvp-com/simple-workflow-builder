import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../database.js';
import { IWorkflow, IExecution, IExecutionDb, INode, INodeExecutionData } from '../types/index.js';
import { ManualTriggerNode } from '../nodes/ManualTrigger.js';
import { HttpRequestNode } from '../nodes/HttpRequest.js';
import { SetNode } from '../nodes/Set.js';

export class ExecutionService {
  private db = getDatabase();
  private nodeTypes: Map<string, any> = new Map();

  constructor() {
    // Register available node types
    this.nodeTypes.set('manualTrigger', new ManualTriggerNode());
    this.nodeTypes.set('httpRequest', new HttpRequestNode());
    this.nodeTypes.set('set', new SetNode());
  }

  async executeWorkflow(workflow: IWorkflow, inputData: any = {}): Promise<IExecution> {
    const executionId = uuidv4();
    const startedAt = new Date().toISOString();

    // Create execution record
    const createStmt = this.db.prepare(`
      INSERT INTO executions (id, workflow_id, status, started_at)
      VALUES (?, ?, ?, ?)
    `);
    createStmt.run(executionId, workflow.id, 'running', startedAt);

    try {
      // Execute workflow
      const result = await this.runWorkflow(workflow, executionId, inputData);

      // Update execution as successful
      const updateStmt = this.db.prepare(`
        UPDATE executions 
        SET status = ?, data = ?, finished_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      updateStmt.run('success', JSON.stringify(result), executionId);

      return this.getExecutionById(executionId)!;
    } catch (error: any) {
      // Update execution as failed
      const updateStmt = this.db.prepare(`
        UPDATE executions 
        SET status = ?, error = ?, finished_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      updateStmt.run('error', error.message, executionId);

      return this.getExecutionById(executionId)!;
    }
  }

  private async runWorkflow(workflow: IWorkflow, executionId: string, inputData: any): Promise<any> {
    const executionData: { [nodeId: string]: any } = {};

    // Find trigger node (starting point)
    const triggerNode = workflow.nodes.find(n => n.type === 'manualTrigger');
    if (!triggerNode) {
      throw new Error('No trigger node found in workflow');
    }

    // Execute nodes in order based on connections
    await this.executeNode(triggerNode, workflow, executionData, inputData, executionId);

    return executionData;
  }

  private async executeNode(
    node: INode,
    workflow: IWorkflow,
    executionData: { [nodeId: string]: any },
    inputData: any,
    executionId: string
  ): Promise<any> {
    // Get node type implementation
    const nodeType = this.nodeTypes.get(node.type);
    if (!nodeType) {
      throw new Error(`Unknown node type: ${node.type}`);
    }

    // Execute node
    const context = {
      workflow,
      executionId,
      node,
      executionData,
      getNodeParameter: (name: string, defaultValue?: any) => {
        return node.parameters?.[name] ?? defaultValue;
      },
      getInputData: () => inputData,
    };

    const result = await nodeType.execute(node.parameters || {}, inputData, context);
    executionData[node.id] = result;

    // Execute connected nodes
    const connections = workflow.connections[node.id];
    if (connections?.main) {
      for (const connectionGroup of connections.main) {
        for (const connection of connectionGroup) {
          const nextNode = workflow.nodes.find(n => n.id === connection.node);
          if (nextNode) {
            await this.executeNode(nextNode, workflow, executionData, result, executionId);
          }
        }
      }
    }

    return result;
  }

  getAllExecutions(limit: number = 50): IExecution[] {
    const stmt = this.db.prepare('SELECT * FROM executions ORDER BY started_at DESC LIMIT ?');
    const rows = stmt.all(limit) as IExecutionDb[];
    return rows.map(this.mapDbToExecution);
  }

  getExecutionById(id: string): IExecution | null {
    const stmt = this.db.prepare('SELECT * FROM executions WHERE id = ?');
    const row = stmt.get(id) as IExecutionDb | undefined;
    return row ? this.mapDbToExecution(row) : null;
  }

  private mapDbToExecution(row: IExecutionDb): IExecution {
    return {
      id: row.id,
      workflowId: row.workflow_id,
      status: row.status as 'running' | 'success' | 'error',
      data: row.data ? JSON.parse(row.data) : undefined,
      error: row.error,
      startedAt: row.started_at,
      finishedAt: row.finished_at,
    };
  }
}
