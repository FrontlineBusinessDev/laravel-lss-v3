# AI Prompt Rules

Default behavior:

- Read existing code before generating new code.
- Reuse components, hooks, services, schemas, and utilities.
- Prefer editing existing files over creating new ones.
- Never generate boilerplate if an existing implementation can be extended.
- Return only the changed code unless a full file is requested.
- Keep explanations under five sentences unless asked for more detail.
- Follow the project's naming conventions and folder structure.
- Do not introduce new dependencies without approval.
- Use Server Components by default (Next.js projects).
- Keep functions focused on a single responsibility.
- Prefer composition over inheritance.
- Use shared types and validation schemas whenever possible.
- Write production-ready code by default.