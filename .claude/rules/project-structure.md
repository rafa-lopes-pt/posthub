# Project Structure Rules

File and folder organization conventions. Designed to be replicable across projects.

---

## Utility File Placement

- Global utilities (shared across multiple route groups) go in `app/utils/`
- Route-group utilities go in `app/routes/<group>/utils/`
- The `app/routes/` tree is for routes only; non-route files belong in `utils/` subfolders
- CSS shared across routes goes in `app/css/`, not duplicated per route
- Each route folder should contain only `route.js` and optionally a `route.css` for route-specific overrides

## Directory Structure Reference

```
app/
  css/                    # Shared stylesheets
  utils/                  # Global utilities (shared across route groups)
  routes/
    route.js              # Home route
    route.css             # Home-specific styles only
    <group>/
      <name>/
        route.js
        route.css         # ONLY route-specific overrides (if any)
      utils/              # Utilities scoped to this route group
```
