# Simple Workflow Builder

> A simplified MVP version of n8n workflow automation tool

This is a minimal workflow automation platform that demonstrates the core concepts of n8n. It allows you to create, execute, and manage simple workflows with basic nodes.

## Features

- ✅ Basic workflow creation and management
- ✅ Manual trigger to start workflows
- ✅ HTTP Request node for API calls
- ✅ Set node for data manipulation
- ✅ SQLite database for persistence
- ✅ REST API for workflow management
- ✅ Simple web interface

## Tech Stack

- **Backend**: Node.js 20+ with Express
- **Language**: TypeScript
- **Database**: SQLite (better-sqlite3)
- **HTTP Client**: Axios

## Quick Start

### Prerequisites

- Node.js >= 20.0.0
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build
npm start
```

The application will start on `http://localhost:3000`

## API Endpoints

### Workflows

- `GET /api/workflows` - List all workflows
- `GET /api/workflows/:id` - Get workflow by ID
- `POST /api/workflows` - Create new workflow
- `PUT /api/workflows/:id` - Update workflow
- `DELETE /api/workflows/:id` - Delete workflow
- `POST /api/workflows/:id/execute` - Execute workflow

### Executions

- `GET /api/executions` - List all executions
- `GET /api/executions/:id` - Get execution by ID

## Example Workflow

```json
{
  "name": "Fetch User Data",
  "nodes": [
    {
      "id": "trigger",
      "type": "manualTrigger",
      "name": "Manual Trigger",
      "position": [250, 300]
    },
    {
      "id": "http",
      "type": "httpRequest",
      "name": "Get User",
      "position": [450, 300],
      "parameters": {
        "url": "https://jsonplaceholder.typicode.com/users/1",
        "method": "GET"
      }
    },
    {
      "id": "set",
      "type": "set",
      "name": "Format Data",
      "position": [650, 300],
      "parameters": {
        "values": {
          "userName": "{{$node.http.json.name}}",
          "userEmail": "{{$node.http.json.email}}"
        }
      }
    }
  ],
  "connections": {
    "trigger": { "main": [[{ "node": "http", "type": "main", "index": 0 }]] },
    "http": { "main": [[{ "node": "set", "type": "main", "index": 0 }]] }
  }
}
```

## Available Nodes

### Manual Trigger
Starts the workflow manually.

### HTTP Request
Makes HTTP requests to external APIs.

**Parameters:**
- `url`: The URL to call
- `method`: HTTP method (GET, POST, PUT, DELETE)
- `body`: Request body (for POST/PUT)
- `headers`: Custom headers

### Set
Sets/transforms data values.

**Parameters:**
- `values`: Object with key-value pairs to set

## Architecture

The MVP is structured as follows:

```
src/
├── index.ts              # Application entry point
├── server.ts             # Express server setup
├── database.ts           # SQLite database setup
├── routes/
│   ├── workflows.ts      # Workflow API routes
│   └── executions.ts     # Execution API routes
├── services/
│   ├── WorkflowService.ts    # Workflow management
│   └── ExecutionService.ts   # Workflow execution engine
├── nodes/
│   ├── ManualTrigger.ts      # Manual trigger node
│   ├── HttpRequest.ts        # HTTP request node
│   └── Set.ts                # Set node
├── types/
│   └── index.ts          # TypeScript type definitions
└── public/
    └── index.html        # Simple web interface
```

## Differences from n8n

This MVP simplifies n8n by:

- ❌ No authentication/authorization
- ❌ No user management
- ❌ No complex node ecosystem (only 3 basic nodes)
- ❌ No visual workflow editor (use API/JSON)
- ❌ No webhooks or scheduled triggers
- ❌ No Redis/Bull for job queues
- ❌ No PostgreSQL/MySQL support
- ❌ No environment variables for configuration

## License

MIT License - This is an educational MVP inspired by n8n

## Related Projects

- [n8n](https://github.com/n8n-io/n8n) - The original workflow automation platform
