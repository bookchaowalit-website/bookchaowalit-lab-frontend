import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { method, params } = body;
    let result;

    switch (method) {
      case 'initialize':
        result = {
          protocolVersion: '2024-11-05',
          capabilities: { tools: {}, resources: {} },
          serverInfo: {
            name: 'Lab Experiments',
            version: '1.0.0',
            description: 'Lab Experiments - MCP Server'
          }
        };
        break;

      case 'tools/list':
        result = {
          tools: [
            { name: 'get_all', description: 'Get all items', inputSchema: { type: 'object', properties: {} } },
            { name: 'get_by_id', description: 'Get item by ID', inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] } },
            { name: 'search', description: 'Search items', inputSchema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] } }
          ]
        };
        break;

      case 'tools/call':
        const toolName = params?.name;
        result = { message: 'Tool called: ' + toolName, data: params?.arguments };
        break;

      default:
        throw new Error(`Unknown method: ${method}`);
    }

    return NextResponse.json({ jsonrpc: '2.0', id: body.id, result });
  } catch (error) {
    return NextResponse.json({ jsonrpc: '2.0', id: body.id || 1, error: { code: -32000, message: error instanceof Error ? error.message : 'Error' } }, { status: 500 });
  }
}
