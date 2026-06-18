```markdown
# youtube-growth-hub Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches you the core development patterns and conventions used in the `youtube-growth-hub` repository, a TypeScript backend built with Express. You'll learn file and code organization, import/export styles, commit message tendencies, and how to write and locate tests. This guide also provides suggested commands for common workflows.

## Coding Conventions

### File Naming
- Use **kebab-case** for all file names.
  - Example: `user-controller.ts`, `video-service.ts`

### Import Style
- Use **relative imports** for internal modules.
  - Example:
    ```typescript
    import { getUser } from '../services/user-service';
    ```

### Export Style
- Use **named exports** for all modules.
  - Example:
    ```typescript
    // In user-service.ts
    export function getUser(id: string) { ... }
    ```
    ```typescript
    // In another file
    import { getUser } from './user-service';
    ```

### Commit Patterns
- Commit messages are **freeform** with no enforced type or prefix.
- Prefixes may be present but are not consistent.
- Average commit message length: **~52 characters**.
  - Example: `fix bug in video upload endpoint`

## Workflows

### Add a New Feature
**Trigger:** When implementing a new endpoint or service  
**Command:** `/add-feature`

1. Create a new file using kebab-case (e.g., `video-analytics.ts`).
2. Use relative imports to include dependencies.
3. Export your functions or classes using named exports.
4. Write or update corresponding test files (see Testing Patterns).
5. Commit your changes with a clear, concise message.

### Fix a Bug
**Trigger:** When resolving a reported issue or exception  
**Command:** `/fix-bug`

1. Locate the problematic code using relative imports for context.
2. Apply the fix, keeping code style consistent.
3. Update or add a test case in a `.test.ts` file.
4. Commit with a message describing the fix.

### Refactor Code
**Trigger:** When improving code structure or readability  
**Command:** `/refactor`

1. Rename files to kebab-case if needed.
2. Update imports to remain relative and accurate.
3. Ensure all exports are named.
4. Run tests to confirm nothing is broken.
5. Commit with a message explaining the refactor.

## Testing Patterns

- Test files follow the pattern: `*.test.*` (e.g., `user-service.test.ts`).
- The testing framework is **unknown**; check existing test files for structure.
- Place test files alongside the modules they test or in a dedicated test directory.
- Example test file name: `video-controller.test.ts`

## Commands

| Command      | Purpose                                      |
|--------------|----------------------------------------------|
| /add-feature | Steps to add a new feature or endpoint       |
| /fix-bug     | Steps to fix a bug and update tests          |
| /refactor    | Steps to refactor code and maintain style    |
```
