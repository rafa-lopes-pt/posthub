# PostHub Critical Constraints

Hard rules that prevent runtime failures. These constraints were learned through implementation and MUST be followed.

## SPARC Framework Constraints

### SPARC createField Only Supports Text and Note

SPARC's `createField` accepts only:
- **Text** -- `createField({ title, indexed? })`
- **Note** -- `createField({ title, multiline: true })`

No Lookup, Person, Boolean, Choice, or Number types. All data stored as strings. Validation via Zod in client code.

### Never Use `.element.innerHTML` on SPARC Components

**WRONG:**
```js
contentView.element.innerHTML = '<p class="empty-message">No packages found</p>'
```

**CORRECT:**
```js
contentView.children = [
  new Text('No packages found', { type: 'p', class: 'empty-message' })
]
```

**Why:** `.children` setter triggers SPARC's re-rendering lifecycle, maintains event handlers and reactivity, ensures proper memory management.

**Applies to:** `View`, `Container`, `Card`, `Modal`, and all SPARC layout components

## PostHub Data Constraints

### All Package Status Updates MUST Include Location

Every status change MUST specify a location to ensure complete audit trail.

**WRONG:**
```js
await updatePackageStatus(packageId, 'stored', null, 'Label printed')
```

**CORRECT:**
```js
await updatePackageStatus(packageId, 'stored', 'LISBON | TOC | 1', 'Label printed')
```

### Timeline Field is JSON Array (Never Manipulate as String)

The Timeline field stores a JSON array of status change objects. Always parse, modify, and stringify properly.

**WRONG:**
```js
item.Timeline += '{"status":"stored"}'
```

**CORRECT:**
```js
const timeline = item.Timeline ? JSON.parse(item.Timeline) : []
timeline.push({
  status: 'stored',
  date: new Date().toISOString(),
  location: 'LISBON | TOC | 1',
  changedBy: 'jane@company.com',
  notes: 'Label printed at facilities'
})
item.Timeline = JSON.stringify(timeline)
```

**Timeline Entry Structure:**
```json
{
  "status": "stored",
  "date": "2025-12-03T14:30:00Z",
  "location": "LISBON | TOC | 1",
  "changedBy": "jane@company.com",
  "notes": "Label printed at facilities"
}
```

## PostHub Index Requirements

### Smart Card ID and TrackingNumber MUST Be Indexed

**Critical for performance:**
- `Employees.SmartCardID` -- indexed for smart card scan lookup (< 2 seconds)
- `Packages.Title` (TrackingNumber) -- indexed for QR code scan lookup

**Also indexed:**
- `Packages.Status` -- for filtering packages by status
- `Packages.Sender` -- for "My Mail" queries
- `Packages.Recipient` -- for "My Mail" queries

Without these indexes, smart card scan and QR scanning will be unacceptably slow.

## PostHub QR Code Format

### Tracking Number Format

**Format:** `POSTHUB-YYYYMMDD-XXXXX`

**Example:** `POSTHUB-20260304-00001`

**QR Code Content:** Full package data as JSON (not just tracking number)

```js
const qrData = JSON.stringify({
  TrackingNumber: 'POSTHUB-20260304-00001',
  Sender: 'john.smith@company.com',
  Recipient: 'sarah.johnson@company.com',
  Status: 'stored',
  CurrentLocation: 'LISBON | TOC | 1',
  DestinationLocation: 'LISBON | TOR | 1',
  PackageDetails: 'Large envelope - documents'
})
```

**Tracking Number Generation:**
```js
function generateTrackingNumber() {
  const date = __dayjs().format('YYYYMMDD')
  const sequence = String(Math.floor(Math.random() * 100000)).padStart(5, '0')
  return `POSTHUB-${date}-${sequence}`
}
```

## Component Patterns

### Custom Components vs SPARC Instances

When creating custom components (like `packageTable.js`, `smartCardInput.js`), prefer returning SPARC component instances over raw DOM elements.

**Preferred:**
```js
export function createPackageTable({ packages }) {
  return new Container([
    new Text('Packages', { type: 'h2' }),
    // Build table using SPARC components
  ])
}
```

**Why:** SPARC component instances integrate better with the framework's lifecycle and event handling.

## Reference

These constraints are extracted from:
- `requirements-review.md` (updated requirements)
- `IMPLEMENTATION_PLAN.md` (development lessons learned)
- `../sparc/.claude/rules/critical-constraints.md` (inherited SPARC constraints)
