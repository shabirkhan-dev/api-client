# Nebula API Client

A comprehensive, professional-grade API testing client built as a single-file HTML application with the Catppuccin Mocha theme and cyber-glassmorphism design.

## Features

### Core HTTP Client
- **Method Selector** - Color-coded dropdown (GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD)
- **URL Bar** - Monospace input with variable auto-complete (`{{variableName}}`)
- **Request Tabs** - Params, Headers, Body (JSON/Form/Raw/Binary), Auth, Pre-request Scripts, Tests
- **Response Viewer** - Syntax-highlighted body, headers, cookies, timeline/waterfall, test results, security scan
- **Drag-and-drop** file upload for binary bodies

### Traffic Interceptor
- Global toggle with request/response interception
- Breakpoint modal for live request editing before sending
- Interceptor log with stats (intercepted, modified, blocked)

### Load Testing Suite
- Configurable profiles: Spike, Ramp-up, Soak, Stress, Custom
- Real-time metrics: RPS, Avg/P95 latency, error rate, throughput
- Chart.js visualizations: latency histogram + RPS timeline
- Exportable CSV results

### WebSocket Client
- Connect/disconnect with status indicators
- Split view: message log + composer
- Message type detection (JSON, Text, Binary)
- Auto-reconnect with exponential backoff

### GraphQL Mode
- Query editor with line numbers
- Variables and headers tabs
- Syntax-highlighted response

### Environment Management
- Multiple environments (Development, Staging, Production)
- Variable scopes: Global, Environment-specific, Session
- `{{variable}}` substitution with auto-complete dropdown

### Pre-request & Test Scripts
- JavaScript execution context with `pm.*` API
- Assertions: `pm.test()`, `pm.expect()`, `pm.response`
- Console output panel

### Request Chaining
- Chain multiple requests with variable extraction via JSONPath
- Conditional branching (if status equals, body contains)
- Visual chain builder with step-by-step results

### API Documentation Generator
- Auto-generate docs from any collection
- Export as Markdown or interactive HTML
- Endpoint index with quick navigation

### Data Generator
- Built-in faker for: names, emails, UUIDs, phones, addresses, dates, etc.
- Bulk JSON array generation from templates
- Insert directly into request body

### Security Scanner
- Missing security headers detection (HSTS, CSP, X-Frame-Options, etc.)
- Sensitive data exposure warnings
- JWT token analysis (algorithm, expiration)
- SQL error detection

### Mock Server
- Configure mock endpoints with method, path, status, body, delay
- Start/stop simulation mode

### Diff Viewer
- Side-by-side response comparison
- Added/removed line highlighting

### Auto-Retry Logic
- Exponential backoff with configurable multiplier
- Retry on specific status codes (502, 503, 504)
- Circuit breaker pattern

### Import/Export
- Import from cURL commands
- Import Postman collections (JSON v2.1)
- Export as cURL, HAR, OpenAPI spec
- Shareable encoded URLs

### Collection Management
- Folder hierarchy with expand/collapse
- Right-click context menus (rename, duplicate, delete, export)
- Request history (last 50 requests)
- Search/filter across collections and history

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+P` / `Cmd+P` | Command Palette |
| `Ctrl+B` / `Cmd+B` | Toggle Sidebar |
| `Ctrl+Enter` / `Cmd+Enter` | Send Request |
| `Ctrl+S` / `Cmd+S` | Save to Collection |
| `Ctrl+L` / `Cmd+L` | Focus URL Bar |
| `Ctrl+Shift+F` / `Cmd+Shift+F` | Format JSON |
| `Ctrl+Shift+C` / `Cmd+Shift+C` | Clear Response |
| `Ctrl+I` / `Cmd+I` | Toggle Interceptor |
| `Ctrl+K` / `Cmd+K` | Quick Search |
| `F10` | Resume Breakpoint |
| `Space` | Start/Pause Load Test |
| `Escape` | Close Modals |

## Design System

- **Theme**: Catppuccin Mocha with cyber-glassmorphism
- **Fonts**: Inter (UI), JetBrains Mono (code)
- **Glass Effect**: `backdrop-filter: blur(16px)` with semi-transparent backgrounds
- **Animations**: Smooth transitions (200ms cubic-bezier), slide-up modals, toast notifications

## Tech Stack

- Vanilla JavaScript (no frameworks)
- Tailwind CSS via CDN
- Chart.js for load test visualizations
- Google Fonts (Inter, JetBrains Mono)
- localStorage for persistent data

## Usage

Simply open `index.html` in any modern browser. No build step or server required.

```bash
# Or serve locally
npx serve .
```

## Data Persistence

Collections, history, environments, mock routes, and retry configuration are all saved to `localStorage` and persist across browser sessions.
