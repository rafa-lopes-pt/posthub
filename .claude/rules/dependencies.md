# Dependency Rules

How SPARC consumes third-party packages from npm.

---

## No Modification of Dependencies

- SPARC NEVER modifies the source code of any npm dependency
- Dependencies are used strictly as-is -- no patches, no forks, no monkey-patching
- If a dependency does not meet a need, either find a different package or build the functionality from scratch
- Do not copy-paste dependency source code into SPARC and modify it -- that counts as modification

## License Compliance

A license file and update methods already exist in the project (`npm run compliance`). When adding or removing a dependency, the license file must be updated.

### Auto-approved licenses (permissive, no restrictions beyond attribution)

MIT, ISC, Apache-2.0, BSD-2-Clause, BSD-3-Clause, 0BSD, MIT-0, BlueOak-1.0.0, CC0-1.0, Unlicense, CC-BY-3.0, CC-BY-4.0, Python-2.0

### Consult user before installing (copyleft -- may impose obligations on SPARC)

MPL-2.0, LGPL (any version), EUPL, Artistic-2.0

### Never install (viral copyleft, proprietary, or missing)

GPL (any version), AGPL (any version), SSPL, BSL, no license, proprietary

## Dependency Integration Pattern

- Dependencies are installed via npm and bundled by Rollup into the output files
- They are exposed at runtime as globals (e.g. `__zod`, `__lodash`, `__dayjs`, `__d3`, `__jquery`, `__fuse`, `__uuid`, `__papaparse`)
- Application code imports from the bundled output, never directly from `node_modules`
