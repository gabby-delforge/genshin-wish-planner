# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
- Build: `npm run build`
- Dev: `npm run dev --turbopack`
- Start: `npm run start`
- Lint: `npm run lint`

## Code Style Guidelines
- **TypeScript**: Use strict typing. Define interfaces/types in `src/app/types.ts`.
- **Components**: Functional React components with TypeScript interfaces for props.
- **Imports**: Group imports by external libraries first, then internal modules.
- **Formatting**: Use single quotes for strings, trailing commas, 2-space indentation.
- **CSS**: Use TailwindCSS utility classes for styling.
- **Naming**: 
  - Use PascalCase for components and interfaces
  - Use camelCase for variables and functions
  - Use UPPER_CASE for constants
- **Error Handling**: Use try/catch blocks for async operations.
- **File Structure**: Keep related components in `src/app/components` directory.
- **React Patterns**: Use hooks for state management (useState, useEffect).