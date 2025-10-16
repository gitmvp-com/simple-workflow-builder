import axios, { AxiosRequestConfig } from 'axios';
import { INodeType, IExecutionContext } from '../types/index.js';

export class HttpRequestNode implements INodeType {
  async execute(parameters: any, inputData: any, context: IExecutionContext): Promise<any> {
    const url = this.resolveExpression(parameters.url, inputData, context);
    const method = (parameters.method || 'GET').toUpperCase();
    const headers = parameters.headers || {};
    const body = parameters.body ? this.resolveExpression(parameters.body, inputData, context) : undefined;

    try {
      const config: AxiosRequestConfig = {
        method,
        url,
        headers,
      };

      if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
        config.data = typeof body === 'string' ? JSON.parse(body) : body;
      }

      const response = await axios(config);

      return {
        statusCode: response.status,
        headers: response.headers,
        json: response.data,
      };
    } catch (error: any) {
      throw new Error(`HTTP Request failed: ${error.message}`);
    }
  }

  private resolveExpression(value: any, inputData: any, context: IExecutionContext): any {
    if (typeof value !== 'string') return value;

    // Simple template replacement for {{$node.nodeId.field}}
    return value.replace(/\{\{\$node\.([^.}]+)\.(.+?)\}\}/g, (match, nodeId, path) => {
      const nodeData = context.executionData[nodeId];
      if (!nodeData) return match;

      const value = this.getNestedValue(nodeData, path);
      return value !== undefined ? value : match;
    });
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}
