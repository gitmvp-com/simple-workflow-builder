import { INodeType, IExecutionContext } from '../types/index.js';

export class ManualTriggerNode implements INodeType {
  async execute(parameters: any, inputData: any, context: IExecutionContext): Promise<any> {
    // Manual trigger simply passes through the input data
    return inputData || { triggered: true, timestamp: new Date().toISOString() };
  }
}
