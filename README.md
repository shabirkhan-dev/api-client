# Nebula API Client

A modern, full-featured API client built with Next.js, TypeScript, TailwindCSS, and a Catppuccin Mocha theme. Agent-based architecture makes each feature a standalone, composable module.

## Features

| Agent | Description |
|---|---|
| **HTTP Client** | Full request/response with method selection, params, headers, body, auth, and pre-request/test scripts |
| **Collections** | Sidebar with collection tree, favorites, history (last 50), and environment variable management |
| **WebSocket** | Connect, send/receive messages, latency tracking, message log with export |
| **Load Testing** | Simulated load tests with configurable profiles, concurrency, and real-time metrics |
| **GraphQL** | Query, mutation, subscription editors with schema introspection |
| **API Docs** | Generate API documentation from collections, export as Markdown or HTML |
| **Diff Viewer** | Compare two responses side-by-side with diff highlighting |
| **Request Chain** | Chain requests with variable extraction via JSONPath |
| **Security Scanner** | SQLi, XSS, CORS checks and JWT decoder |
| **Auto-Retry** | Configurable retry logic with exponential backoff and circuit breaker |
| **Data Generator** | Template-based data generation with dynamic placeholders |
| **Collaboration** | Share requests via URL, comments, and audit logging |
| **Profiler** | Performance waterfall for DNS, TCP, TLS, TTFB, and download phases |
| **Mock Server** | Define mock endpoints with custom status, latency, and response bodies |
| **Command Palette** | Keyboard-driven command palette (⌘P / Ctrl+P) |

## Architecture

```
src/
├── agents/               # Feature modules (standalone agents)
│   ├── http-client/      # HTTP request/response
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom hooks
│   │   ├── services/     # Business logic (CLI-wrappable)
│   │   └── types/        # TypeScript types
│   ├── collections/      # Sidebar, history, favorites, envs
│   ├── websocket/
│   ├── load-testing/
│   ├── graphql/
│   ├── api-docs/
│   ├── diff-viewer/
│   ├── request-chain/
│   ├── security-scanner/
│   ├── auto-retry/
│   ├── data-generator/
│   ├── collaboration/
│   ├── profiler/
│   ├── mock-server/
│   └── command-palette/
├── shared/               # Shared infrastructure
│   ├── components/ui/    # Reusable UI components (shadcn-style)
│   ├── lib/              # Utilities, theme config
│   ├── stores/           # Zustand stores
│   └── types/            # Shared TypeScript types
└── app/                  # Next.js app router
    ├── layout.tsx
    ├── page.tsx
    └── layout-parts/     # Layout components
```

Each agent follows a consistent structure and its `services/` layer is designed to be wrappable by a CLI or any other interface without depending on React.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: TailwindCSS 4 + Catppuccin Mocha theme
- **State**: Zustand with persist middleware
- **UI**: Custom components (shadcn-style) + Radix UI primitives
- **Icons**: Lucide React
- **Notifications**: Sonner
- **Testing**: Vitest + Testing Library

## Quality Tools

- **Biome.js** — Linting and formatting (replaces ESLint + Prettier)
- **Lefthook** — Git hooks (pre-commit: lint + type-check, pre-push: tests)
- **Renovate** — Automated dependency updates
- **Knip** — Unused code detection

## Getting Started

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint and format
npm run lint:fix

# Type check
npm run type-check
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run Biome linter |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run format` | Format code with Biome |
| `npm test` | Run test suite |
| `npm run test:watch` | Watch mode testing |
| `npm run type-check` | TypeScript type checking |
| `npm run knip` | Find unused exports/dependencies |

## Design Principles

- **SOLID**: Each agent has a single responsibility with clean interfaces
- **Agent Architecture**: Features are standalone modules that can be composed or used independently
- **CLI-Ready**: Service layers are pure TypeScript, easily wrappable in CLI tools
- **Catppuccin Theme**: Consistent dark theme with glassmorphism effects
- **Kebab-case**: All folder names use kebab-case convention
