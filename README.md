# PostHub

Internal physical mail management system for SharePoint on-premises -- built with SPARC framework.

**AI Assistant Reference:** See [`claude.md`](./claude.md) for complete documentation catalog, agents, and coding rules.

## What is PostHub?

PostHub digitizes internal mail tracking for organizations with multiple buildings and campuses. It eliminates manual tracking (spreadsheets, paper logs) with barcode automation and provides real-time visibility to all stakeholders.

**Core features:**
- Badge swipe lookup for package retrieval
- Barcode label generation and printing (JsBarcode + CODE128)
- Multi-location hierarchical routing (Campus → Building → Room)
- Role-based access (RegularUser, FacilitiesEmployee, FacilitiesManager)
- Package tracking workflow (Sent → Received → Stored → In Transit → Arrived → Delivered)

**Technology stack:**
- SPARC framework (SharePoint React-like Architecture Component)
- SharePoint Lists (on-premises data store)
- JsBarcode (CODE128 barcode generation)
- Hardware: Badge reader, barcode printer, barcode scanner

## Quick Start

### Setup (First Time)

1. **Review setup documentation:**
   - [`SHAREPOINT_SETUP_GUIDE.md`](./SHAREPOINT_SETUP_GUIDE.md) -- complete SharePoint list setup (1,103 lines)
   - [`SHAREPOINT_QUICKSTART.md`](./SHAREPOINT_QUICKSTART.md) -- condensed checklist (312 lines)

2. **Create SharePoint lists:**
   - 3 groups: RegularUser, FacilitiesEmployee, FacilitiesManager
   - 3 lists: Packages, Employees, Locations
   - 10 indexes (critical for performance)
   - Sample data import (optional)

3. **Deploy application:**
   - Upload `SiteAssets/app/` directory to SharePoint
   - Create `SitePages/index.html` entry point
   - Test on Microsoft Edge browser

**Estimated setup time:** 2-3 hours

### Development

1. **Use Claude Code agents:**
   ```
   @posthub-developer Add status update with location tracking
   @posthub-reviewer Review code for constraint violations
   @posthub-tester Test badge swipe workflow
   ```

2. **Read the constraints:**
   - [`.claude/rules/`](./.claude/rules/) -- critical constraints (5 files, auto-loaded)
   - [`.claude/posthub-guide.md`](./.claude/posthub-guide.md) -- comprehensive domain guide

3. **Follow SPARC patterns:**
   - See [`../sparc/.claude/sparc-guide.md`](../sparc/.claude/sparc-guide.md) for framework guide

## Documentation

### Primary References
- [`claude.md`](./claude.md) -- central hub (agents, rules, documentation catalog)
- [`.claude/posthub-guide.md`](./.claude/posthub-guide.md) -- comprehensive domain guide
- [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md) -- architectural authority (767 lines)
- [`DOCUMENTATION_INDEX.md`](./DOCUMENTATION_INDEX.md) -- complete documentation catalog

### SharePoint Setup
- [`SHAREPOINT_SETUP_GUIDE.md`](./SHAREPOINT_SETUP_GUIDE.md) -- step-by-step setup (1,103 lines)
- [`SHAREPOINT_QUICKSTART.md`](./SHAREPOINT_QUICKSTART.md) -- quick reference checklist (312 lines)
- [`sharepoint-data/`](./sharepoint-data/) -- sample data and import guide

### Constraints & Patterns
- [`.claude/rules/`](./.claude/rules/) -- critical constraints (5 files, auto-loaded)
  - `critical-constraints.md` -- hard rules that prevent runtime failures
  - `posthub-workflow.md` -- package lifecycle and business logic
  - `posthub-components.md` -- custom component patterns
  - `sharepoint-data.md` -- list schemas and data access
  - `home-route.md` -- route structure convention

## Critical Patterns

**These constraints prevent runtime failures and must be followed:**

1. **Never use `.element.innerHTML` on SPARC components** -- use `.children` setter
2. **All package status updates MUST include location** -- locationId is required
3. **Timeline field is JSON array** -- never manipulate as string
4. **Badge ID and TrackingNumber MUST be indexed** -- critical for < 2 second lookups
5. **Home route is `routes/route.js`** -- NOT `routes/home/route.js`
6. **Barcode format is CODE128** -- tracking number format `POSTHUB-YYYYMMDD-XXXXX`

See [`.claude/rules/critical-constraints.md`](./.claude/rules/critical-constraints.md) for complete details.

## Hardware Requirements

**For POC demonstration:**
- USB badge reader (keyboard wedge mode)
- Label printer (4"x6" capable, 300+ DPI)
- Barcode scanner (CODE128 compatible)

## Project Status

**Current:** Core POC functionality complete, ready for SharePoint list creation and testing

**Next steps:**
1. Complete SharePoint list setup
2. Test badge reader integration
3. Test barcode generation and scanning
4. Run end-to-end workflow test
5. Prepare POC demonstration

See [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md) for complete project plan and POC demonstration flow.

---

Built with [SPARC Framework](../sparc) | [Documentation Index](./DOCUMENTATION_INDEX.md) | [AI Assistant Guide](./claude.md)
