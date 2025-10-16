import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../database.js';
import { IWorkflow, IWorkflowDb } from '../types/index.js';

export class WorkflowService {
  private db = getDatabase();

  getAllWorkflows(): IWorkflow[] {
    const stmt = this.db.prepare('SELECT * FROM workflows ORDER BY created_at DESC');
    const rows = stmt.all() as IWorkflowDb[];
    return rows.map(this.mapDbToWorkflow);
  }

  getWorkflowById(id: string): IWorkflow | null {
    const stmt = this.db.prepare('SELECT * FROM workflows WHERE id = ?');
    const row = stmt.get(id) as IWorkflowDb | undefined;
    return row ? this.mapDbToWorkflow(row) : null;
  }

  createWorkflow(data: Partial<IWorkflow>): IWorkflow {
    const id = uuidv4();
    const workflow: IWorkflow = {
      id,
      name: data.name || 'Untitled Workflow',
      active: data.active ?? false,
      nodes: data.nodes || [],
      connections: data.connections || {},
      settings: data.settings || {},
    };

    const stmt = this.db.prepare(`
      INSERT INTO workflows (id, name, active, nodes, connections, settings)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      workflow.id,
      workflow.name,
      workflow.active ? 1 : 0,
      JSON.stringify(workflow.nodes),
      JSON.stringify(workflow.connections),
      JSON.stringify(workflow.settings)
    );

    return this.getWorkflowById(id)!;
  }

  updateWorkflow(id: string, data: Partial<IWorkflow>): IWorkflow | null {
    const existing = this.getWorkflowById(id);
    if (!existing) return null;

    const updated: IWorkflow = {
      ...existing,
      ...data,
      id, // Ensure ID doesn't change
    };

    const stmt = this.db.prepare(`
      UPDATE workflows 
      SET name = ?, active = ?, nodes = ?, connections = ?, settings = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      updated.name,
      updated.active ? 1 : 0,
      JSON.stringify(updated.nodes),
      JSON.stringify(updated.connections),
      JSON.stringify(updated.settings),
      id
    );

    return this.getWorkflowById(id);
  }

  deleteWorkflow(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM workflows WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  private mapDbToWorkflow(row: IWorkflowDb): IWorkflow {
    return {
      id: row.id,
      name: row.name,
      active: row.active === 1,
      nodes: JSON.parse(row.nodes),
      connections: JSON.parse(row.connections),
      settings: row.settings ? JSON.parse(row.settings) : {},
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
