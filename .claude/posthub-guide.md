# PostHub Domain Guide

Comprehensive reference for the PostHub internal mail management system.

**Purpose:** This guide provides domain context, business logic overview, and user journey narratives for PostHub. For detailed constraints and patterns, see the auto-loaded `.claude/rules/` files.

**Audience:** Claude Code agents, developers, and anyone needing to understand PostHub's domain model.

---

## Table of Contents

1. [Domain Overview](#domain-overview)
2. [User Journeys](#user-journeys)
3. [Architecture Overview](#architecture-overview)
4. [Hardware Integration Overview](#hardware-integration-overview)
5. [Development Workflow](#development-workflow)
6. [Cross-References](#cross-references)

---

## Domain Overview

### What is PostHub?

PostHub is an internal physical mail management system for organizations with multiple offices. It tracks packages from creation through final delivery, providing visibility to senders, recipients, and facilities staff.

**Key problem solved:** Manual package tracking (spreadsheets, paper logs) is error-prone and provides no visibility to users. PostHub digitizes the entire workflow with QR code automation.

### Business Context

**Primary users:**
- **Regular employees** -- send and receive mail between offices
- **Facilities staff** -- process packages at access points (APs), generate labels, scan QR codes
- **Facilities managers** -- oversee operations, manage locations, view reports

**Value proposition:**
- Eliminates manual tracking (no more spreadsheets)
- Real-time visibility for all stakeholders
- Complete audit trail (where package has been, who handled it)
- QR code automation reduces errors
- Scalable across multiple offices

### Technology Stack

**Framework:** SPARC (SharePoint React-like Architecture Component)
- Client-side SPA with hash-based routing
- Component-based UI (27+ base components)
- No virtual DOM (manual lifecycle management)

**Data Store:** SharePoint Lists (on-premises)
- 3 lists: Packages, Employees, Locations
- REST API for CRUD operations
- CAML queries for filtering

**Libraries:**
- qrcode.min.js (QR code generation, encodes package JSON)
- jQuery (bundled with SPARC)
- Zod (validation)
- DayJS (date handling)

---

## User Journeys

### Journey 1: Regular Employee Sends a Package

1. Employee logs in and navigates to "Send Mail"
2. System auto-populates sender info from their profile
3. Employee searches for recipient (autocomplete from People API)
4. Employee selects destination office from location dropdown
5. Employee adds package details (description, notes)
6. Employee clicks "Send" -- package created with status "created"
7. Employee physically brings package to nearest facilities access point (AP)
8. Employee can track package status from "My Mail" screen at any time

### Journey 2: Facilities Staff Processes Incoming Package

1. Employee arrives at facilities desk with their package
2. Employee scans smart card on USB smart card reader
3. Smart card reader "types" smart card ID into auto-focused input field
4. System looks up employee by SmartCardID (indexed query, < 2 seconds)
5. System displays employee info and their pending packages (non-delivered)
6. Facilities staff selects one or more packages from the list
7. Staff clicks "Generate Labels"
8. System creates QR code labels encoding full package JSON
9. Labels display on screen in 4"x6" format
10. Staff clicks "Print" -- browser print dialog opens
11. Staff prints labels and affixes them to physical packages
12. Package status auto-updates to "stored" with AP location

### Journey 3: Package Moves Through Routing

1. Facilities staff prepares outgoing packages for transport
2. Staff scans QR code on each package with handheld scanner
3. System reads encoded JSON and looks up package by TrackingNumber
4. Staff updates status to "in transit" with origin location
5. Package physically moves to destination office
6. At destination, facilities staff scans QR code again
7. If correct destination: status set to "arrived"
8. If wrong destination: status set to "stored" (waiting for re-routing)
9. When recipient picks up: status set to "delivered"

### Journey 4: Re-routing (Wrong Office)

1. Package arrives at Office B but should have gone to Office C
2. Facilities at Office B scans QR code
3. Discovers destination doesn't match -- sets status to "stored" at Office B
4. Package waits for next transport cycle
5. Status updated to "in transit" from Office B
6. Package arrives at Office C (correct destination)
7. Status set to "arrived" at Office C
8. Complete timeline shows the full journey including the re-routing

### Journey 5: Employee Tracks Their Package

1. Employee navigates to "My Mail"
2. System shows all packages where they are sender or recipient
3. Employee can filter by status
4. Clicking a package shows the full timeline:
   - When it was created
   - When facilities received it
   - When it went in transit
   - Current location
   - Expected destination
5. Employee sees real-time status without contacting facilities

### Journey 6: Facilities Manager Reviews Operations

1. Manager navigates to Facilities Dashboard
2. Dashboard shows stats: total packages, counts by status
3. Manager can filter by status to find bottlenecks
4. Manager navigates to Reports for analytics
5. Manager navigates to Manage Locations to add/edit offices
6. Manager has full visibility into all packages across all locations

---

## Architecture Overview

### Data Flow

```
[User Browser]
    |
    v
[SPARC SPA] -- hash-based routing, component lifecycle
    |
    v
[SharePoint REST API] -- CAML queries, list item CRUD
    |
    v
[SharePoint Lists]
    |-- Packages (tracking, status, timeline JSON)
    |-- Employees (smart card ID lookup)
    |-- Locations (flat office list)
```

### Application Structure

```
SiteAssets/app/
  index.js              -- Router setup, entry point
  libs/
    nofbiz/             -- SPARC framework (dist)
    qrcode.min.js       -- QR code generation
  css/                  -- Shared stylesheets
  utils/
    sharepoint.js       -- SharePoint API wrappers
    permissions.js      -- Role-based access checks
    qrcode.js           -- QR code helpers
    pdf.js              -- Print/label generation
  components/
    packageTable.js     -- Package list with selection
    smartCardInput.js  -- Smart card reader integration
    qrLabelGenerator.js -- QR code label creation
  routes/
    route.js            -- Home/landing page
    my-mail/route.js    -- User's packages
    send-mail/route.js  -- Create package
    help/route.js       -- User guides
    facilities/
      dashboard/route.js -- All packages overview
      scan/route.js      -- Smart card scan & QR scanning
      locations/route.js -- Location CRUD (manager)
      reports/route.js   -- Analytics (manager)
```

### Key Architectural Decisions

1. **SharePoint as dumb data store** -- all validation in client code (Zod), SharePoint stores strings
2. **Embedded Timeline** -- JSON array in Packages list instead of separate history list (no joins)
3. **Flat locations** -- no hierarchy, 6 offices, simple dropdown selection
4. **Browser native print** -- no PDF library, CSS @media print for 4"x6" labels
5. **QR encodes full JSON** -- offline-readable package details, reduces server lookups

---

## Hardware Integration Overview

### Smart Card Reader
- **Type:** USB keyboard wedge -- acts as keyboard, "types" smart card ID into focused input
- **Integration:** Auto-focus input, 300ms debounce, support both `input` and `paste` events
- **Fallback:** Manual entry if reader fails
- **Performance:** Smart card lookup must complete in < 2 seconds (requires indexed SmartCardID)

### Label Printer
- **Label size:** 4" x 6" (industry standard)
- **Print quality:** 300+ DPI minimum for QR readability
- **Integration:** Browser native print dialog with CSS @media print rules
- **Connection:** USB or network

### QR Code Scanner
- **Type:** Handheld QR scanner (keyboard wedge mode)
- **Integration:** Scanner outputs decoded text into focused input
- **Content:** Full package JSON encoded in QR code
- **Lookup:** Extract TrackingNumber from JSON, query indexed Title field

---

## Development Workflow

### Setting Up for Development

1. Ensure SPARC dist files are in `libs/nofbiz/`
2. Load order in `index.html`: jQuery -> sharepointContext -> spInterceptor -> app (index.js)
3. Use `spInterceptor.js` for sandbox dev (mocks SharePoint REST API)

### Common Development Tasks

**Adding a new route:**
1. Create `routes/<name>/route.js` with `defineRoute` callback
2. Add route name to Router array in `index.js`
3. Add `route.css` only for route-specific overrides

**Adding a utility function:**
1. Add to `utils/sharepoint.js` for data access, `utils/permissions.js` for auth
2. Keep all route code inside `defineRoute` callback (SPARC scoping rule)

**Modifying package workflow:**
1. Check `.claude/rules/posthub-workflow.md` for valid status transitions
2. Always include location in status updates
3. Always update Timeline JSON properly (parse, push, stringify)

### Testing Approach

1. Use `spInterceptor.js` for offline development
2. Test smart card scan with actual hardware early
3. Test QR code print quality at 300+ DPI
4. Test on Microsoft Edge (primary target browser)
5. Test with different user groups for permission validation

---

## Cross-References

The following auto-loaded rules files contain detailed constraints and patterns:

| Rules File | Content |
|-----------|---------|
| `critical-constraints.md` | Hard rules preventing runtime failures (innerHTML, location requirement, Timeline parsing) |
| `posthub-workflow.md` | Package statuses, status flow, re-routing, smart card scan workflow, QR code workflow |
| `posthub-components.md` | packageTable, smartCardInput, qrLabelGenerator patterns and styling |
| `sharepoint-data.md` | List schemas, column definitions, indexes, CAML queries, Zod validation |
| `home-route.md` | Home route is `routes/route.js`, not `routes/home/route.js` |
| `sparc-framework.md` | All route code inside `defineRoute` callback |
| `component-lifecycle.md` | Rendering, event cleanup, state management, CSS conventions |
| `clean-code.md` | DRY principles, constants vs functions |
| `project-structure.md` | File placement, directory structure |
| `dependencies.md` | npm dependency rules, license compliance |

**For complete implementation details:** See `IMPLEMENTATION_PLAN.md`

**For SharePoint setup:** See `SHAREPOINT_SETUP_GUIDE.md`
