# Nebula API Client

A modern, full-featured API client built with Next.js, TypeScript, TailwindCSS, and multi-theme support. Agent-based architecture makes each feature a standalone, composable module designed for easy CLI wrapping.

## Features

| Agent | Description |
|---|---|
| **HTTP Client** | Request/response with method selection, params, headers, body, auth, scripts |
| **Collections** | Sidebar with tree, favorites, history, environment variables |
| **WebSocket** | Real WebSocket connections, message log, compose, export |
| **Load Testing** | Real HTTP load tests with concurrent requests and metrics |
| **GraphQL** | Query/mutation/subscription with real schema introspection |
| **API Docs** | Generate documentation from collections, export MD/HTML |
| **Diff Viewer** | Line-by-line diff comparison |
| **Request Chain** | Chain requests with JSONPath variable extraction |
| **Security Scanner** | Real header analysis, JWT decoder with expiry detection |
| **Auto-Retry** | Configurable retries with exponential backoff and circuit breaker |
| **Data Generator** | Template engine with 10+ generators (uuid, email, name, etc.) |
| **Collaboration** | Share via URL, comments, audit logging |
| **Profiler** | Performance waterfall based on actual response timing |
| **Mock Server** | Define mock endpoints with status, latency, conditions |
| **Command Palette** | Keyboard-driven (⌘K) with fuzzy search |

## Multi-Theme Support

6 built-in themes with automatic CSS variable switching:

- **Catppuccin Mocha** (default dark)
- **Catppuccin Macchiato**
- **Catppuccin Frappé**
- **Catppuccin Latte** (light)
- **Tokyo Night**
- **Nord**

## Architecture

```
src/
├── agents/                   # Standalone feature modules
│   ├── http-client/
│   │   ├── components/       # React components
│   │   ├── hooks/            # Custom hooks
│   │   ├── services/         # Business logic (CLI-wrappable)
│   │   └── types/
│   ├── security-scanner/
│   │   ├── components/
│   │   └── services/         # Real JWT decode, header analysis
│   ├── data-generator/
│   │   ├── components/
│   │   └── services/         # Template engine with generators
│   └── ...                   # 16 agents total
├── shared/
│   ├── components/ui/        # Reusable UI (Button, Input, Badge, etc.)
│   ├── lib/                  # Utils, themes, catppuccin
│   ├── stores/               # Zustand (persisted)
│   └── types/
└── app/                      # Next.js app router
```

## Tech Stack

- **Next.js 16** (App Router) + **TypeScript 5**
- **TailwindCSS 4** with CSS variable-driven theming
- **Zustand** with persist middleware
- **HugeIcons** (12,000+ icons)
- **Framer Motion** for animations
- **Sonner** for toasts
- **Vitest** (101 tests across 7 test files)

## Quality Tools

- **Biome.js** — Fast linting + formatting
- **Lefthook** — Git hooks (pre-commit: lint + type-check, pre-push: tests)
- **Renovate** — Automated dependency updates
- **Knip** — Dead code detection

## Getting Started

```bash
npm install
npm run dev        # Development
npm run build      # Production build
npm test           # 101 tests
npm run lint:fix   # Biome auto-fix
npm run type-check # TypeScript
```

## Design

- Apple-inspired polish with glass morphism
- CSS custom property theming for instant theme switching
- Kebab-case folder conventions
- SOLID principles, agent isolation
- Service layers are pure TypeScript for CLI wrapping
