# PostHub Critical Constraints

Hard rules that prevent runtime failures. These constraints were learned through implementation and MUST be followed.

## SPARC Framework Constraints

### Never Use `.element.innerHTML` on SPARC Components

**WRONG:**
```js
const contentView = new View([], { showOnRender: false })

// Later in your code
contentView.element.innerHTML = '<p class="empty-message">No packages found</p>'

// Or
const table = createPackageTable({ packages })
contentView.element.appendChild(table.element)
```

**CORRECT:**
```js
const contentView = new View([], { showOnRender: false })

// Later in your code - use .children setter
contentView.children = [
  new Text('No packages found', { type: 'p', class: 'empty-message' })
]

// Or with components
const table = createPackageTable({ packages })
contentView.children = [table]
```

**Why this matters:**
- `.children` setter triggers SPARC's re-rendering lifecycle
- Maintains component event handlers and reactivity
- Ensures proper memory management and cleanup
- Direct DOM manipulation bypasses SPARC's component system

**Applies to:** `View`, `Container`, `Card`, `Modal`, and all SPARC layout components

## PostHub Data Constraints

### All Package Status Updates MUST Include Location

Every status change MUST specify a location to ensure complete audit trail.

**WRONG:**
```js
await updatePackageStatus(packageId, 'Received', null, 'Label printed')
```

**CORRECT:**
```js
await updatePackageStatus(packageId, 'Received', locationId, 'Label printed')
```

**Why:** Location tracking is required for every status change to provide complete package journey audit trail.

### Timeline Field is JSON Array (Never Manipulate as String)

The Timeline field stores a JSON array of status change objects. Always parse, modify, and stringify properly.

**WRONG:**
```js
item.Timeline += '{"status":"Received"}'  // String concatenation
```

**CORRECT:**
```js
const timeline = item.Timeline ? JSON.parse(item.Timeline) : []
timeline.push({
  status: 'Received',
  date: new Date().toISOString(),
  location: 'Mailroom A',
  locationId: 10,
  changedBy: 'jane@company.com',
  notes: 'Label printed'
})
item.Timeline = JSON.stringify(timeline)
```

**Timeline Entry Structure:**
```json
{
  "status": "Received",
  "date": "2025-12-03T14:30:00Z",
  "location": "Mailroom A",
  "locationId": 10,
  "changedBy": "jane@company.com",
  "notes": "Label printed at facilities"
}
```

## PostHub Index Requirements

### Badge ID and TrackingNumber MUST Be Indexed

**Critical for performance:**
- `Employees.BadgeID` -- indexed for badge swipe lookup (< 2 seconds)
- `Packages.TrackingNumber` -- indexed for barcode scan lookup

**Also indexed:**
- `Packages.Status` -- for filtering packages by status
- `Packages.Sender` -- for "My Mail" queries
- `Packages.Recipient` -- for "My Mail" queries
- `Locations.IsActive` -- for filtering active locations
- `Locations.LocationType` -- for filtering by type

Without these indexes, badge swipe and barcode scanning will be unacceptably slow.

## PostHub Barcode Format

### Tracking Number Format

**Format:** `POSTHUB-YYYYMMDD-XXXXX`

**Example:** `POSTHUB-20251203-00001`

**Barcode Type:** CODE128 (alphanumeric, compact, widely supported)

**WRONG:**
```js
const trackingNumber = `PKG-${Math.random()}`  // Non-standard format
```

**CORRECT:**
```js
function generateTrackingNumber() {
  const date = __dayjs().format('YYYYMMDD')
  const sequence = String(Math.floor(Math.random() * 100000)).padStart(5, '0')
  return `POSTHUB-${date}-${sequence}`
}
```

## Component Patterns

### Custom Components vs SPARC Instances

When creating custom components (like `packageTable.js`, `badgeSwipeInput.js`), prefer returning SPARC component instances over raw DOM elements.

**Acceptable but not recommended:**
```js
export function createPackageTable({ packages }) {
  const div = document.createElement('div')
  div.innerHTML = '<table>...</table>'  // Raw DOM
  return { element: div }
}
```

**Preferred:**
```js
export function createPackageTable({ packages }) {
  return new Container([
    new Text('Packages', { type: 'h2' }),
    // Build table using SPARC components or return SPARC instance
  ])
}
```

**Why:** SPARC component instances integrate better with the framework's lifecycle and event handling.

## Reference

These constraints are extracted from:
- `IMPLEMENTATION_PLAN.md` lines 656-767 (Development Lessons Learned)
- `../sparc/.claude/rules/sparc-framework.md` (inherited SPARC constraints)

For complete context, see: `IMPLEMENTATION_PLAN.md`
