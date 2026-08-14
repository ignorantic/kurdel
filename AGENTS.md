# Repository Guidelines

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```text
type(scope): concise description
```

For every non-trivial commit, add a body formatted as a bullet list:

```text
feat(auth): add database-backed user repository

- introduce DatabaseAuthUserRepository
- resolve current roles from the database
- add integration tests for disabled users
```

Rules:

- use lowercase imperative wording
- separate the subject and body with a blank line
- start every body item with `- `
- describe meaningful changes rather than individual files
- use package or subsystem names as scopes
- omit the body only for genuinely trivial commits
- inspect recent commits before composing a message
