# PostHub Agents

PostHub-specific Claude Code agents for building, reviewing, and testing the physical mail management system.

## PostHub Agents

### posthub-developer
**Use when:** Building or modifying PostHub features (package workflow, badge swipe, barcode, location routing)

**Expertise:**
- Package lifecycle and status workflow
- Badge reader integration (keyboard wedge mode)
- Barcode generation and printing (JsBarcode, CODE128)
- Location hierarchy routing
- SharePoint list schemas (Packages, Employees, Locations)
- Custom components (packageTable, badgeSwipeInput, barcodeGenerator)

**Mandatory rules:**
- All status updates MUST include location
- Timeline field is JSON array (never string manipulation)
- Badge ID and TrackingNumber MUST be indexed
- Never use `.element.innerHTML` on SPARC components

**Usage:**
```
@posthub-developer Add status update with location tracking
@posthub-developer Fix badge swipe debouncing issue
@posthub-developer Create barcode label generation component
```

### posthub-reviewer
**Use when:** Reviewing PostHub code for constraint violations

**Checks for:**
- Status updates without location (critical violation)
- Timeline string manipulation (critical violation)
- Badge swipe patterns (debouncing, auto-focus, indexed queries)
- Barcode format (CODE128, tracking number format)
- Home route structure (routes/route.js, not routes/home/route.js)
- .element.innerHTML on SPARC components (critical violation)

**Output:** Violation report with file path, line number, severity, and fix

**Usage:**
```
@posthub-reviewer Review facilities/scan route for violations
@posthub-reviewer Check timeline field handling across all routes
```

### posthub-tester
**Use when:** Testing hardware integration and workflow scenarios

**Test coverage:**
- Badge reader (keyboard wedge, auto-focus, debouncing)
- Barcode printer (4"x6" labels, CODE128 format)
- Barcode scanner (tracking number lookup)
- Complete package lifecycle (Sent → Delivered)
- Role-based permissions (3 user groups)
- Timeline integrity (JSON structure, location tracking)
- Index performance (< 2 second queries)

**Output:** Test report with pass/fail status and issue details

**Usage:**
```
@posthub-tester Test badge swipe workflow end-to-end
@posthub-tester Verify barcode label printing
@posthub-tester Run timeline integrity checks
```

### sharepoint-admin
**Use when:** Planning SharePoint schema changes (list modifications, indexes, permissions)

**Expertise:**
- PostHub list schemas (Packages, Employees, Locations)
- Index strategy (performance-critical columns)
- Permission design (3 user groups)
- Data migration strategies
- SharePoint limitations (column types, list thresholds)

**Output:** Schema change recommendation with impact analysis and migration steps

**Usage:**
```
@sharepoint-admin Add DeliveryInstructions column to Packages list
@sharepoint-admin Recommend index for Priority filtering
@sharepoint-admin Plan migration to change Priority to choice column
```

## Inherited SPARC Agents

PostHub can also use agents from the parent SPARC framework:

### sparc-app-base
**Use when:** Building routes, forms, components, navigation (when not PostHub-specific)

**Usage:**
```
@sparc-app-base Create a new route with form validation
@sparc-app-base Build navigation with LinkButtons
```

### sparc-app-reviewer
**Use when:** Reviewing code for DRY violations, scoping, project structure

**Usage:**
```
@sparc-app-reviewer Check for duplicate code in routes
@sparc-app-reviewer Verify defineRoute scoping
```

### sharepoint-advisor
**Use when:** Planning SharePoint list design, permissions, deployment (general SharePoint advice)

**Usage:**
```
@sharepoint-advisor Design data model for new feature
@sharepoint-advisor Plan permission strategy
```

## Choosing the Right Agent

**For PostHub-specific work:**
- Use `posthub-developer` (not `sparc-app-base`) when working with package workflow, badge/barcode integration, or location hierarchy
- Use `posthub-reviewer` (not `sparc-app-reviewer`) when checking for PostHub constraint violations

**For general SPARC work:**
- Use `sparc-app-base` for generic routes, forms, or components
- Use `sparc-app-reviewer` for general code quality checks

**For SharePoint planning:**
- Use `sharepoint-admin` for PostHub-specific schema changes (knows PostHub lists and constraints)
- Use `sharepoint-advisor` for general SharePoint architecture advice

## Quick Reference

| Task | Agent |
|------|-------|
| Build badge swipe feature | `posthub-developer` |
| Generate barcode labels | `posthub-developer` |
| Add package status | `posthub-developer` |
| Review status update code | `posthub-reviewer` |
| Check timeline handling | `posthub-reviewer` |
| Test badge reader | `posthub-tester` |
| Test barcode printing | `posthub-tester` |
| Add list column | `sharepoint-admin` |
| Create new list | `sharepoint-advisor` |
| Build generic form | `sparc-app-base` |
| Check code quality | `sparc-app-reviewer` |

## Agent Invocation

List all available agents:
```
/agents
```

Invoke specific agent:
```
@posthub-developer [task description]
@posthub-reviewer [files to review]
@posthub-tester [test scenarios]
@sharepoint-admin [schema change request]
```

## Reference Documentation

All agents read from:
- `.claude/rules/*.md` -- critical constraints (auto-loaded)
- `.claude/posthub-guide.md` -- comprehensive domain reference
- `IMPLEMENTATION_PLAN.md` -- architectural authority
- `SHAREPOINT_SETUP_GUIDE.md` -- list schemas and setup
- `../sparc/.claude/sparc-guide.md` -- SPARC framework guide

See `claude.md` for complete reference catalog.
