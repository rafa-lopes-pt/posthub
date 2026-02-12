# PostHub

Internal physical mail management system for SharePoint on-premises -- built with SPARC framework.

## Reference

- `.claude/posthub-guide.md` -- comprehensive domain guide (package workflow, location hierarchy, badge integration, barcode system)
- `.claude/rules/` -- critical constraints (auto-loaded into every conversation)
- `IMPLEMENTATION_PLAN.md` -- architectural authority (schemas, design decisions, lessons learned)
- `SHAREPOINT_SETUP_GUIDE.md` -- complete SharePoint setup instructions (lists, groups, indexes)

## Agents

### PostHub Development

| Agent | Use when... |
|-------|------------|
| `posthub-developer` | Building or modifying PostHub features (package workflow, badge swipe, barcode, location routing) |
| `posthub-reviewer` | Reviewing PostHub code for constraint violations (badge patterns, status updates, Timeline JSON) |
| `posthub-tester` | Testing hardware integration (badge reader, barcode printer/scanner) and workflow scenarios |
| `sharepoint-admin` | Planning SharePoint schema changes (list modifications, indexes, permissions) |

### Inherited SPARC Agents (from ../sparc)

| Agent | Use when... |
|-------|------------|
| `sparc-app-base` | Building routes, forms, components, navigation (when not PostHub-specific) |
| `sparc-app-reviewer` | Reviewing code for DRY violations, scoping, project structure |
| `sharepoint-advisor` | Planning SharePoint list design, permissions, deployment |

## Project Context

### Core Features
- Badge swipe lookup for package retrieval
- Barcode label generation and printing (JsBarcode + CODE128)
- Multi-location hierarchical routing (Campus → Building → Room)
- Role-based access (RegularUser, FacilitiesEmployee, FacilitiesManager)
- Package tracking workflow (Sent → Received → Stored → In Transit → Arrived → Delivered)

### Technology Stack
- **Framework**: SPARC (SharePoint React-like Architecture Component)
- **Data Store**: SharePoint Lists (on-premises)
- **Libraries**: JsBarcode (barcode generation), jQuery (included with SPARC)
- **Architecture**: Single-page application with client-side routing

### SharePoint Lists
- **Packages** -- package records with tracking numbers, status, timeline (JSON array)
- **Employees** -- employee directory with badge IDs (indexed for fast lookup)
- **Locations** -- hierarchical location structure (self-referencing lookup)

### User Groups
- **RegularUser** -- send and track packages (Read permission)
- **FacilitiesEmployee** -- process, scan, route packages (Contribute permission)
- **FacilitiesManager** -- admin, reports, location management (Full Control permission)

## Documentation

### Setup & Architecture
- `README.md` -- project overview and quick start
- `DOCUMENTATION_INDEX.md` -- complete documentation catalog
- `IMPLEMENTATION_PLAN.md` -- comprehensive project plan (767 lines)
- `SHAREPOINT_SETUP_GUIDE.md` -- SharePoint list creation (1,103 lines)
- `SHAREPOINT_QUICKSTART.md` -- quick reference checklist (312 lines)
- `SETUP_COMPLETE.md` -- setup verification summary

### Data
- `sharepoint-data/README.md` -- sample data overview
- `sharepoint-data/CSV_IMPORT_GUIDE.md` -- data import instructions
- `sharepoint-data/*.csv` -- sample data files (Locations, Employees, Packages)

## Critical Patterns

### SPARC Framework
See `../sparc/.claude/rules/` for inherited SPARC constraints:
- Never use `.element.innerHTML` on SPARC components (use `.children` setter)
- Home route is `routes/route.js` (NOT `routes/home/route.js`)
- All component APIs defined in `dist/nofbiz.base.d.ts`

### PostHub-Specific
See `.claude/rules/` for PostHub constraints:
- All package status updates MUST include location
- Badge ID and TrackingNumber fields MUST be indexed
- Timeline field is JSON array (never manipulate as string)
- Barcode format is CODE128, tracking number format is `POSTHUB-YYYYMMDD-XXXXX`
- No `.innerHTML` on SPARC components (use `.children` setter)
