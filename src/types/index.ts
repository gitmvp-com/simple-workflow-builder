export interface INode {
  id: string;
  type: string;
  name: string;
  position: [number, number];
  parameters?: Record<string, any>;
}

export interface IConnection {
  node: string;
  type: string;
  index: number;
}

export interface IConnections {
  [key: string]: {
    main?: IConnection[][];
  };
}

export interface IWorkflow {
  id: string;
  name: string;
  active: boolean;
  nodes: INode[];
  connections: IConnections;
  settings?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface IWorkflowDb {
  id: string;
  name: string;
  active: number;
  nodes: string;
  connections: string;
  settings?: string;
  created_at: string;
  updated_at: string;
}

export interface IExecution {
  id: string;
  workflowId: string;
  status: 'running' | 'success' | 'error';
  data?: any;
  error?: string;
  startedAt: string;
  finishedAt?: string;
}

export interface IExecutionDb {
  id: string;
  workflow_id: string;
  status: string;
  data?: string;
  error?: string;
  started_at: string;
  finished_at?: string;
}

export interface INodeExecutionData {
  [key: string]: any;
}

export interface IRunExecutionData {
  resultData: {
    runData: {
      [key: string]: INodeExecutionData[];
    };
  };
}

export interface INodeType {
  execute(parameters: any, inputData: any, context: IExecutionContext): Promise<any>;
}

export interface IExecutionContext {
  workflow: IWorkflow;
  executionId: string;
  getNodeParameter: (name: string, defaultValue?: any) => any;
  getInputData: () => any;
}
