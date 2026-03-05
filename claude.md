# PostHub

Internal physical mail management system for SharePoint on-premises -- built with SPARC framework.

## Reference

- `.claude/posthub-guide.md` -- comprehensive domain guide (package workflow, locations, smart card integration, QR code system)
- `.claude/rules/` -- critical constraints (auto-loaded into every conversation)
- `IMPLEMENTATION_PLAN.md` -- architectural authority (schemas, design decisions, lessons learned)
- `SHAREPOINT_SETUP_GUIDE.md` -- complete SharePoint setup instructions (lists, groups, indexes)

## Agents

### PostHub Development

| Agent | Use when... |
|-------|------------|
| `posthub-developer` | Building or modifying PostHub features (package workflow, smart card scan, QR code, location routing) |
| `posthub-reviewer` | Reviewing PostHub code for constraint violations (smart card patterns, status updates, Timeline JSON) |
| `posthub-tester` | Testing hardware integration (smart card reader, QR code printer/scanner) and workflow scenarios |
| `sharepoint-admin` | Planning SharePoint schema changes (list modifications, indexes, permissions) |

### Inherited SPARC Agents (from ../sparc)

| Agent | Use when... |
|-------|------------|
| `sparc-app-base` | Building routes, forms, components, navigation (when not PostHub-specific) |
| `sparc-app-reviewer` | Reviewing code for DRY violations, scoping, project structure |
| `lss-reviewer` | Lean Six Sigma process efficiency review |
| `non-technical-reviewer` | Usability review from end-user perspective |

## Project Context

### Core Features
- Smart card scan lookup for package retrieval
- QR code label generation and printing (qrcode.min.js, encodes full package JSON)
- Flat location routing (6 offices across Porto and Lisbon)
- Role-based access (RegularUser, FacilitiesEmployee, FacilitiesManager)
- Package tracking workflow (created --> stored --> in transit --> arrived --> delivered)

### Technology Stack
- **Framework**: SPARC (SharePoint React-like Architecture Component)
- **Data Store**: SharePoint Lists (on-premises)
- **Libraries**: qrcode.min.js (QR code generation), jQuery (included with SPARC)
- **Architecture**: Single-page application with client-side routing

### SharePoint Lists
- **Packages** -- package records with tracking numbers (Title), status, timeline (JSON array)
- **Employees** -- smart card lookup only (Title, SmartCardID, Email)
- **Locations** -- flat location list (Title = "CITY | OFFICE | FLOOR")

### User Groups
- **RegularUser** -- send and track packages (Read permission)
- **FacilitiesEmployee** -- process, scan, route packages (Contribute permission)
- **FacilitiesManager** -- admin, reports, location management (Full Control permission)

## Documentation

### Setup & Architecture
- `README.md` -- project overview and quick start
- `IMPLEMENTATION_PLAN.md` -- comprehensive project plan
- `SHAREPOINT_SETUP_GUIDE.md` -- SharePoint list creation (includes quick reference appendix)

### Data
- `sharepoint-data/README.md` -- sample data overview, import instructions, and testing scenarios
- `sharepoint-data/*.csv` -- sample data files (Locations, Employees, Packages)

## Critical Patterns

### SPARC Framework
See `../sparc/.claude/rules/` for inherited SPARC constraints:
- Never use `.element.innerHTML` on SPARC components (use `.children` setter)
- Home route is `routes/route.js` (NOT `routes/home/route.js`)
- All component APIs defined in `nofbiz.base.d.ts`
- SPARC only supports Text and Note field types

### PostHub-Specific
See `.claude/rules/` for PostHub constraints:
- All package status updates MUST include location
- Smart Card ID and TrackingNumber fields MUST be indexed
- Timeline field is JSON array (never manipulate as string)
- QR code encodes full package JSON, tracking number format is `POSTHUB-YYYYMMDD-XXXXX`
- 5 statuses: created, stored, in transit, arrived, delivered
