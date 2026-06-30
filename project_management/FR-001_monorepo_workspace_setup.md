# FR-001: Monorepo Workspace Setup

| Field | Value |
|-------|-------|
| **ID** | FR-001 |
| **Title** | Monorepo Workspace Setup |
| **Category** | Infrastructure |
| **Created** | 2026-06-30T00:00:00.000Z |
| **Last Updated** | 2026-06-30T00:00:00.000Z |
| **Priority** | High |

## Description

As a developer, I want the project structured as an npm workspace monorepo, so that shared worker definitions and the omni-worker dependency can be managed centrally across all demo applications.

## Definition of Done

- [ ] Root `package.json` declares `"workspaces"` with all sub-apps
- [ ] `@anonaddy/omni-worker` installed via `git+https://github.com/avluent/omni-worker.git`
- [ ] `shared/` directory created for worker definitions
- [ ] `node-demos/`, `web-vanilla/`, `web-react/`, `web-svelte/` directories initialized
- [ ] Each workspace has its own `package.json` with workspace references
- [ ] `npm install` from root installs all dependencies correctly

## Specification

### Workspace Structure

The root `package.json` uses npm workspaces:

| Field | Value |
|-------|-------|
| `name` | `omni-worker-demos` |
| `private` | `true` |
| `workspaces` | `["node-demos", "web-vanilla", "web-react", "web-svelte"]` |
| `dependencies` | `@anonaddy/omni-worker: git+https://github.com/avluent/omni-worker.git` |

### Dependency Resolution

The omni-worker package is resolved from the GitHub repository's main branch via the git+ protocol. No version pinning is used since the demos should always reflect the latest API.

### Workspace Apps

Each workspace app is a Vite project. They share the `shared/workers/` directory via relative path imports.

### Exceptions

- If `git+` resolution fails, the user must have network access to GitHub
- If the omni-worker repo structure changes, imports may need adjustment
- The `shared/` directory is NOT a workspace itself — it's a convention-based shared folder

### Tests

| Test | Assertion |
|------|-----------|
| `npm install` succeeds | Exit code 0, all workspaces populated in `node_modules/.workspace` |
| Workspace list | `npm ls --workspaces` lists all four apps |
| omni-worker resolve | `npm ls @anonaddy/omni-worker` shows git+ source |
