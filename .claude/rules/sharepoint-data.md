# PostHub SharePoint Data

SharePoint list schemas and data access patterns for PostHub.

## SPARC Field Type Constraint

SPARC's `createField` only supports two field types:
- **Text** -- single line of text (`createField({ title, indexed? })`)
- **Note** -- multiline text (`createField({ title, multiline: true })`)

No Lookup, Person, Boolean, Choice, or Number types exist in SPARC. All data is stored as strings. Validation happens in client code via Zod.

## SharePoint Lists Overview

PostHub uses 3 SharePoint lists:

| List | Purpose | Key Columns | Indexes |
|------|---------|-------------|---------|
| **Packages** | Package records | Title (TrackingNumber), Status, Timeline, Sender, Recipient | 4 indexes |
| **Employees** | Smart card lookup only | Title, SmartCardID, Email | 2 indexes |
| **Locations** | Flat location list | Title, City, Office, Floor, IsActive | 0 indexes |

## Packages List Schema

**Purpose:** Central repository for all mail/package records

**List Name:** `Packages`

### Columns

| Internal Name | Display Name | Type | Required | Description |
|--------------|-------------|------|----------|-------------|
| Title | Tracking Number | Text | Yes | Unique, indexed. Format: `POSTHUB-YYYYMMDD-XXXXX` |
| Sender | Sender | Text | Yes | Email string, indexed |
| Recipient | Recipient | Text | Yes | Email string, indexed |
| Status | Status | Text | Yes | created, stored, in transit, arrived, delivered |
| Timeline | Timeline | Note (multiline) | No | JSON array of status changes |
| CurrentLocation | Current Location | Text | No | Location title string (e.g. "LISBON \| TOC \| 1") |
| DestinationLocation | Destination Location | Text | No | Location title string |
| PackageDetails | Package Details | Note (multiline) | No | Description and details |
| InternalNotes | Internal Notes | Note (multiline) | No | Internal notes |

**Note:** The Title column IS the TrackingNumber -- SPARC uses Title as the primary field.

### Indexes (Critical for Performance)

1. **Title** (TrackingNumber -- for QR code scans)
2. **Status** (for filtering)
3. **Sender** (for "My Mail" queries)
4. **Recipient** (for "My Mail" queries)

### Timeline Field Format

**Type:** Note (multiline, plain text)
**Content:** JSON array (stringified)

```json
[
  {
    "status": "created",
    "date": "2025-12-03T10:00:00Z",
    "location": "LISBON | TOC | 1",
    "changedBy": "john@company.com",
    "notes": "Package created"
  },
  {
    "status": "stored",
    "date": "2025-12-03T14:30:00Z",
    "location": "LISBON | TOC | 1",
    "changedBy": "jane@company.com",
    "notes": "Label printed at facilities"
  }
]
```

**CRITICAL:** Always parse, modify, and stringify properly. Never manipulate as string.

## Employees List Schema

**Purpose:** Smart card lookup only (employee data comes from People API)

**List Name:** `Employees`

### Columns

| Internal Name | Display Name | Type | Required | Description |
|--------------|-------------|------|----------|-------------|
| Title | Name | Text | Yes | Employee full name |
| SmartCardID | Smart Card ID | Text | Yes | Unique smart card identifier, indexed |
| Email | Email | Text | Yes | Links smart card to identity, indexed |

### Indexes (Critical for Performance)

1. **SmartCardID** (CRITICAL for smart card scan lookup -- must be < 2 seconds)
2. **Email** (for user lookups)

**Unique Constraint:** SmartCardID must be unique (enforce in application logic)

## Locations List Schema

**Purpose:** Flat list of office locations for package routing

**List Name:** `Locations`

### Columns

| Internal Name | Display Name | Type | Required | Description |
|--------------|-------------|------|----------|-------------|
| Title | Location Name | Text | Yes | Auto-formatted: "CITY \| OFFICE \| FLOOR" |
| City | City | Text | Yes | City name (e.g. "LISBON", "PORTO") |
| Office | Office | Text | Yes | Office/building name (e.g. "TOC", "URBO") |
| Floor | Floor | Text | Yes | Floor number as string (e.g. "0", "1", "7") |
| IsActive | Is Active | Text | Yes | "true" or "false" |

### Available Locations (6 total)

```
PORTO | URBO | 0
LISBON | TOC | 1
LISBON | TOR | 1
LISBON | ECHO | 0
LISBON | AURA | 7
LISBON | LUMNIA | 0
```

No hierarchy -- flat list. Location selection uses a ComboBox populated from this list.

## Data Access Patterns

### Package Queries

**Get user's packages (sender or recipient):**
```js
import { ListApi } from './libs/nofbiz/nofbiz.base.js'

const packagesApi = new ListApi('Packages')

const query = `
  <Where>
    <Or>
      <Eq>
        <FieldRef Name='Sender'/>
        <Value Type='Text'>${currentUserEmail}</Value>
      </Eq>
      <Eq>
        <FieldRef Name='Recipient'/>
        <Value Type='Text'>${currentUserEmail}</Value>
      </Eq>
    </Or>
  </Where>
`

const packages = await packagesApi.getItems({ query })
```

**Get package by tracking number (QR scan):**
```js
const query = `
  <Where>
    <Eq>
      <FieldRef Name='Title'/>
      <Value Type='Text'>${trackingNumber}</Value>
    </Eq>
  </Where>
`

const packages = await packagesApi.getItems({ query })
const pkg = packages[0]  // Should be unique
```

**Get pending packages (not delivered):**
```js
const query = `
  <Where>
    <Neq>
      <FieldRef Name='Status'/>
      <Value Type='Text'>delivered</Value>
    </Neq>
  </Where>
`

const packages = await packagesApi.getItems({ query })
```

### Employee Queries

**Get employee by smart card ID (smart card scan):**
```js
const employeesApi = new ListApi('Employees')

const query = `
  <Where>
    <Eq>
      <FieldRef Name='SmartCardID'/>
      <Value Type='Text'>${smart cardId}</Value>
    </Eq>
  </Where>
`

const employees = await employeesApi.getItems({ query })
const employee = employees[0]  // Should be unique
```

### Location Queries

**Get active locations:**
```js
const locationsApi = new ListApi('Locations')

const query = `
  <Where>
    <Eq>
      <FieldRef Name='IsActive'/>
      <Value Type='Text'>true</Value>
    </Eq>
  </Where>
`

const locations = await locationsApi.getItems({ query })
```

## SPARC Components for PostHub Data

| Component | Use Case |
|-----------|----------|
| `ComboBox` | Location selection (`new ComboBox(field, locationTitles)`) |
| `List` | Package tables (`new List({ headers, data, onItemSelectHandler })`) |
| `FieldLabel` | Form labels (`new FieldLabel('Recipient', input)`) |
| `FormSchema` | Form validation (`schema.isValid`, `schema.parse()`) |
| `PeoplePicker` | Future recipient search (auto-searches AD) |

## Data Validation with Zod

**Package creation validation:**
```js
const packageSchema = __zod.object({
  Recipient: __zod.string().min(1, 'Recipient is required'),
  DestinationLocation: __zod.string().min(1, 'Destination is required'),
  PackageDetails: __zod.string().optional()
})

const result = packageSchema.safeParse(formData)
if (!result.success) {
  Toast.error(result.error.errors[0].message)
  return
}
```

## Tracking Number Generation

**Format:** `POSTHUB-YYYYMMDD-XXXXX`

**Pattern:**
```js
export function generateTrackingNumber() {
  const date = __dayjs().format('YYYYMMDD')
  const sequence = String(Math.floor(Math.random() * 100000)).padStart(5, '0')
  return `POSTHUB-${date}-${sequence}`
}
```

## Status Update with Timeline

**Always include location:**
```js
export async function updatePackageStatus(packageId, newStatus, location, notes) {
  if (!location) {
    throw new Error('Location is required for status update')
  }

  const packagesApi = new ListApi('Packages')
  const pkg = await packagesApi.getItemByUUID(packageId)

  const timeline = pkg.Timeline ? JSON.parse(pkg.Timeline) : []

  timeline.push({
    status: newStatus,
    date: new Date().toISOString(),
    location: location,
    changedBy: currentUser.Email,
    notes: notes || ''
  })

  await packagesApi.createItem({
    ID: packageId,
    Status: newStatus,
    CurrentLocation: location,
    Timeline: JSON.stringify(timeline)
  })
}
```

## Reference

Extracted from:
- `requirements-review.md` (updated requirements)
- `IMPLEMENTATION_PLAN.md` (architectural decisions)
