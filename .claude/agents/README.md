# PostHub Agents

PostHub-specific Claude Code agents for building, reviewing, and testing the physical mail management system.

## PostHub Agents

### posthub-developer
**Use when:** Building or modifying PostHub features (package workflow, smart card scan, QR code, location routing)

**Expertise:**
- Package lifecycle (created, stored, in transit, arrived, delivered)
- Smart card reader integration (keyboard wedge mode)
- QR code generation and printing (qrcode.min.js, encodes full package JSON)
- Flat location routing (6 offices)
- SharePoint list schemas (Packages, Employees, Locations -- Text/Note only)
- Custom components (packageTable, smartCardInput, qrLabelGenerator)

### posthub-reviewer
**Use when:** Reviewing PostHub code for constraint violations

**Checks for:**
- Status updates without location (critical violation)
- Timeline string manipulation (critical violation)
- Old status values (Sent, Received -- must use lowercase new statuses)
- Old field types (Lookup, Person, Boolean -- must be Text/Note)
- Smart card scan patterns (debouncing, auto-focus, indexed queries)
- .element.innerHTML on SPARC components (critical violation)

### posthub-tester
**Use when:** Testing hardware integration and workflow scenarios

**Test coverage:**
- Smart card reader (keyboard wedge, auto-focus, debouncing)
- QR code printer (4"x6" labels, encodes package JSON)
- QR code scanner (tracking number lookup)
- Complete package lifecycle (created --> delivered)
- Re-routing flow (in transit --> stored --> in transit when wrong office)
- Timeline integrity (JSON structure, location tracking)

### sharepoint-admin
**Use when:** Planning SharePoint schema changes (list modifications, indexes, permissions)

## Inherited SPARC Agents

### sparc-app-base
**Use when:** Building routes, forms, components, navigation (when not PostHub-specific)

### sparc-app-reviewer
**Use when:** Reviewing code for DRY violations, scoping, project structure

### lss-reviewer
**Use when:** Lean Six Sigma process efficiency review

### non-technical-reviewer
**Use when:** Usability review from end-user perspective

## Choosing the Right Agent

| Task | Agent |
|------|-------|
| Build smart card scan feature | `posthub-developer` |
| Generate QR code labels | `posthub-developer` |
| Add package status logic | `posthub-developer` |
| Review status update code | `posthub-reviewer` |
| Check timeline handling | `posthub-reviewer` |
| Test smart card reader | `posthub-tester` |
| Test QR code printing | `posthub-tester` |
| Add list column | `sharepoint-admin` |
| Build generic form | `sparc-app-base` |
| Check code quality | `sparc-app-reviewer` |
| Review process efficiency | `lss-reviewer` |
| Review usability | `non-technical-reviewer` |
