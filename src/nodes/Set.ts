import { INodeType, IExecutionContext } from '../types/index.js';

export class SetNode implements INodeType {
  async execute(parameters: any, inputData: any, context: IExecutionContext): Promise<any> {
    const values = parameters.values || {};
    const result: any = {};

    for (const [key, value] of Object.entries(values)) {
      result[key] = this.resolveExpression(value, inputData, context);
    }

    return result;
  }

  private resolveExpression(value: any, inputData: any, context: IExecutionContext): any {
    if (typeof value !== 'string') return value;

    // Simple template replacement for {{$node.nodeId.field}}
    return value.replace(/\{\{\$node\.([^.}]+)\.(.+?)\}\}/g, (match, nodeId, path) => {
      const nodeData = context.executionData[nodeId];
      if (!nodeData) return match;

      const resolvedValue = this.getNestedValue(nodeData, path);
      return resolvedValue !== undefined ? resolvedValue : match;
    });
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}
