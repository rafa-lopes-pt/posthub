# PostHub

Internal physical mail management system for SharePoint on-premises -- built with SPARC framework.

**AI Assistant Reference:** See [`claude.md`](./claude.md) for complete documentation catalog, agents, and coding rules.

## What is PostHub?

PostHub digitizes internal mail tracking for organizations with multiple offices. It eliminates manual tracking (spreadsheets, paper logs) with QR code automation and provides real-time visibility to all stakeholders.

**Core features:**
- Smart card scan lookup for package retrieval
- QR code label generation and printing (encodes full package JSON)
- Flat location routing (6 offices across Porto and Lisbon)
- Role-based access (RegularUser, FacilitiesEmployee, FacilitiesManager)
- Package tracking workflow (created --> stored --> in transit --> arrived --> delivered)

**Technology stack:**
- SPARC framework (SharePoint React-like Architecture Component)
- SharePoint Lists (on-premises data store)
- qrcode.min.js (QR code generation, encodes package JSON)
- Hardware: Smart card reader, label printer, QR code scanner

## Quick Start

### Setup (First Time)

1. **Review setup documentation:**
   - [`SHAREPOINT_SETUP_GUIDE.md`](./SHAREPOINT_SETUP_GUIDE.md) -- complete SharePoint list setup (includes quick reference appendix)

2. **Create SharePoint lists:**
   - 3 groups: RegularUser, FacilitiesEmployee, FacilitiesManager
   - 3 lists: Packages, Employees, Locations
   - 6 indexes (critical for performance)
   - Sample data import (optional)

3. **Deploy application:**
   - Upload `SiteAssets/app/` directory to SharePoint
   - Create `SitePages/index.html` entry point
   - Test on Microsoft Edge browser

### Development

1. **Use Claude Code agents:**
   ```
   @posthub-developer Add status update with location tracking
   @posthub-reviewer Review code for constraint violations
   @posthub-tester Test smart card scan workflow
   ```

2. **Read the constraints:**
   - [`.claude/rules/`](./.claude/rules/) -- critical constraints (auto-loaded)
   - [`.claude/posthub-guide.md`](./.claude/posthub-guide.md) -- comprehensive domain guide

3. **Follow SPARC patterns:**
   - See [`../sparc/.claude/sparc-guide.md`](../sparc/.claude/sparc-guide.md) for framework guide

## Documentation

### Primary References
- [`claude.md`](./claude.md) -- central hub (agents, rules, documentation catalog)
- [`.claude/posthub-guide.md`](./.claude/posthub-guide.md) -- comprehensive domain guide
- [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md) -- architectural authority

### SharePoint Setup
- [`SHAREPOINT_SETUP_GUIDE.md`](./SHAREPOINT_SETUP_GUIDE.md) -- step-by-step setup (includes quick reference appendix)
- [`sharepoint-data/`](./sharepoint-data/) -- sample data, import instructions, and testing scenarios

### Constraints & Patterns
- [`.claude/rules/`](./.claude/rules/) -- critical constraints (auto-loaded)
  - `critical-constraints.md` -- hard rules that prevent runtime failures
  - `posthub-workflow.md` -- package lifecycle and business logic
  - `posthub-components.md` -- custom component patterns
  - `sharepoint-data.md` -- list schemas and data access
  - `home-route.md` -- route structure convention
  - `sparc-framework.md` -- SPARC scoping rules (from SPARC)
  - `component-lifecycle.md` -- SPARC component lifecycle (from SPARC)
  - `clean-code.md` -- DRY principles (from SPARC)
  - `project-structure.md` -- file organization (from SPARC)
  - `dependencies.md` -- dependency rules (from SPARC)

## Critical Patterns

**These constraints prevent runtime failures and must be followed:**

1. **Never use `.element.innerHTML` on SPARC components** -- use `.children` setter
2. **All package status updates MUST include location** -- location string is required
3. **Timeline field is JSON array** -- never manipulate as string
4. **Smart Card ID and TrackingNumber MUST be indexed** -- critical for < 2 second lookups
5. **Home route is `routes/route.js`** -- NOT `routes/home/route.js`
6. **QR code encodes full package JSON** -- tracking number format `POSTHUB-YYYYMMDD-XXXXX`
7. **SPARC only supports Text and Note field types** -- no Lookup, Person, Boolean

See [`.claude/rules/critical-constraints.md`](./.claude/rules/critical-constraints.md) for complete details.

## Hardware Requirements

**For POC demonstration:**
- USB smart card reader (keyboard wedge mode)
- Label printer (4"x6" capable, 300+ DPI)
- QR code scanner (keyboard wedge mode)

## Project Status

**Current:** Core POC functionality complete, ready for SharePoint list creation and testing

**Next steps:**
1. Complete SharePoint list setup
2. Test smart card reader integration
3. Test QR code generation and scanning
4. Run end-to-end workflow test
5. Prepare POC demonstration

See [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md) for complete project plan and POC demonstration flow.

---

Built with [SPARC Framework](../sparc) | [AI Assistant Guide](./claude.md)
