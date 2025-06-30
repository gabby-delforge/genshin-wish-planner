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

## Project Management

### Changelog

- Always write completed or in-progress work (fixes, features, improvements) to the [Unreleased] section of public/CHANGELOG.md. Note that this is a user-facing changelog - filter and name the items accordingly.

### Task Tracking

- For significant work, use `ai/TODOS.md` for current task list organized by priority
- Complex topics have detailed docs in `ai/` directory with links from TODOS
- Keep TODOS.md lean - move implementation details to separate files
- Update TodoWrite tool to match TODOS.md priorities

### Launch Readiness Priority Order

1. **CRITICAL LAUNCH BLOCKERS** - Must fix before deployment (state management)
2. **HIGH PRIORITY** - Major user experience issues (mobile responsiveness, core state features)
3. **MEDIUM PRIORITY** - System improvements and polish
4. **LOW PRIORITY** - Advanced features and optimizations

### State Management Guidelines

- CRITICAL: State versioning system required before any state shape changes
- Always validate state data with proper range checks
- Implement proper error boundaries for state initialization
- Migration system should be automated with git hooks when possible

## Further Reading

- **README.md**
- **All files in /ai**

## Important Notes

In general: do what has been asked; nothing more, nothing less.
However, you should always think critically about the users' request. If there are potential issues or flaws, point these out and offer solutions.
Keep the codebase clean and organized:

- Proactively delete files and code as they become irrelevant or outdated, such as when the implementation approach changes.
- Proactively update and improve code you come across, even if it's not directly related to the task at hand.
- Don't create files unless they're necessary for achieving your goal, or doing so would result in cleaner code.
- Prefer editing an existing file to creating a new one.
- Keep documentation lean and focused. Not every feature needs standalone documentation.
