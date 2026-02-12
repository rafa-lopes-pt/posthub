# PostHub SharePoint Data

SharePoint list schemas and data access patterns for PostHub.

## SharePoint Lists Overview

PostHub uses 3 SharePoint lists:

| List | Purpose | Key Columns | Indexes |
|------|---------|-------------|---------|
| **Packages** | Package records | TrackingNumber, Status, Timeline, Sender, Recipient | 4 indexes |
| **Employees** | Employee directory | BadgeID, Email, OfficeLocation | 2 indexes |
| **Locations** | Location hierarchy | Title, LocationType, ParentLocation | 2 indexes |

## Packages List Schema

**Purpose:** Central repository for all mail/package records

**List Name:** `Packages`

### Columns

| Internal Name | Display Name | Type | Required | Description |
|--------------|-------------|------|----------|-------------|
| Title | Package Description | Single line of text | Yes | Brief description |
| TrackingNumber | Tracking Number | Single line of text | Yes | Unique barcode (auto-generated) |
| Sender | Sender | Person or Group | Yes | Auto-populated from current user |
| Recipient | Recipient | Person or Group | Yes | Lookup with auto-complete |
| Priority | Priority | Single line of text | No | "Standard", "Urgent", "Low" |
| Status | Status | Single line of text | Yes | Current status (see workflow) |
| Timeline | Timeline | Multiple lines of text | No | JSON array of status changes |
| CurrentLocation | Current Location | Lookup | No | Lookup to Locations list |
| DestinationLocation | Destination Location | Lookup | No | Lookup to Locations list |
| PackageDetails | Package Details | Multiple lines of text | No | Size, weight, description |
| Notes | Notes | Multiple lines of text | No | General notes |

### Indexes (Critical for Performance)

1. **TrackingNumber** (for barcode scans)
2. **Status** (for filtering)
3. **Sender** (for "My Mail" queries)
4. **Recipient** (for "My Mail" queries)

### Timeline Field Format

**Type:** Multiple lines of text (plain text)
**Content:** JSON array (stringified)

```json
[
  {
    "status": "Sent",
    "date": "2025-12-03T10:00:00Z",
    "location": "Main Office",
    "locationId": 5,
    "changedBy": "john@company.com",
    "notes": "Package created"
  },
  {
    "status": "Received",
    "date": "2025-12-03T14:30:00Z",
    "location": "Mailroom A",
    "locationId": 10,
    "changedBy": "jane@company.com",
    "notes": "Label printed at facilities"
  }
]
```

**CRITICAL:** Always parse, modify, and stringify properly. Never manipulate as string.

## Employees List Schema

**Purpose:** Employee directory with badge integration

**List Name:** `Employees`

### Columns

| Internal Name | Display Name | Type | Required | Description |
|--------------|-------------|------|----------|-------------|
| Name | Name | Single line of text | Yes | Employee full name |
| Email | Email | Single line of text | Yes | Employee email |
| BadgeID | Badge ID | Single line of text | Yes | Unique badge identifier |
| Department | Department | Single line of text | No | Department name |
| OfficeLocation | Office Location | Lookup | No | Lookup to Locations list |
| Manager | Manager | Person or Group | No | Employee's manager |
| Building | Building | Single line of text | No | Building name |
| Campus | Campus | Single line of text | No | Campus name |
| IsActive | Is Active | Yes/No | Yes | Default: Yes |

### Indexes (Critical for Performance)

1. **BadgeID** (CRITICAL for badge swipe lookup - must be < 2 seconds)
2. **Email** (for user lookups)

**Unique Constraint:** BadgeID must be unique (enforce in application logic)

## Locations List Schema

**Purpose:** Hierarchical location structure for package routing

**List Name:** `Locations`

### Columns

| Internal Name | Display Name | Type | Required | Description |
|--------------|-------------|------|----------|-------------|
| Title | Location Name | Single line of text | Yes | Display name (e.g., "Main Campus", "Room 101") |
| Campus | Campus | Single line of text | No | Campus identifier |
| Building | Building | Single line of text | No | Building identifier |
| RoomArea | Room/Area | Single line of text | No | Room number or area name |
| LocationType | Location Type | Single line of text | Yes | "Campus", "Building", "Mailroom", "Office", "Storage" |
| ParentLocation | Parent Location | Lookup | No | Lookup to self (Locations list) for hierarchy |
| IsActive | Is Active | Yes/No | Yes | Default: Yes |
| FacilitiesContact | Facilities Contact | Person or Group | No | Responsible person |
| SortOrder | Sort Order | Number | No | Custom ordering |

### Indexes

1. **IsActive** (for filtering active locations)
2. **LocationType** (for filtering by type)

### Hierarchy Structure

```
- Main Campus (Type: Campus, Parent: null)
  - Building A (Type: Building, Parent: Main Campus)
    - Mailroom A (Type: Mailroom, Parent: Building A)
    - Room 101 (Type: Office, Parent: Building A)
  - Building B (Type: Building, Parent: Main Campus)
    - Mailroom B (Type: Mailroom, Parent: Building B)
```

**Location Types:**
- **Campus** -- top-level (e.g., "Main Campus", "West Campus")
- **Building** -- within campus (e.g., "Building A")
- **Mailroom** -- package processing area
- **Office** -- individual room (e.g., "Room 101")
- **Storage** -- storage area

## Data Access Patterns

### Package Queries

**Get user's packages (sender or recipient):**
```js
import { ListApi } from '../utils/sharepoint.js'

const packagesApi = new ListApi('Packages')

// CAML query for user's packages
const query = `
  <Where>
    <Or>
      <Eq>
        <FieldRef Name='Sender' LookupId='TRUE'/>
        <Value Type='User'>${currentUser.UID}</Value>
      </Eq>
      <Eq>
        <FieldRef Name='Recipient' LookupId='TRUE'/>
        <Value Type='User'>${currentUser.UID}</Value>
      </Eq>
    </Or>
  </Where>
`

const packages = await packagesApi.getItems({ query })
```

**Get package by tracking number (barcode scan):**
```js
// Indexed query (fast)
const query = `
  <Where>
    <Eq>
      <FieldRef Name='TrackingNumber'/>
      <Value Type='Text'>${trackingNumber}</Value>
    </Eq>
  </Where>
`

const packages = await packagesApi.getItems({ query })
const package = packages[0]  // Should be unique
```

**Get pending packages (not delivered):**
```js
const query = `
  <Where>
    <Neq>
      <FieldRef Name='Status'/>
      <Value Type='Text'>Delivered</Value>
    </Neq>
  </Where>
`

const packages = await packagesApi.getItems({ query })
```

### Employee Queries

**Get employee by badge ID (badge swipe):**
```js
const employeesApi = new ListApi('Employees')

// Indexed query (CRITICAL - must be fast)
const query = `
  <Where>
    <Eq>
      <FieldRef Name='BadgeID'/>
      <Value Type='Text'>${badgeId}</Value>
    </Eq>
  </Where>
`

const employees = await employeesApi.getItems({ query })
const employee = employees[0]  // Should be unique
```

**Get employee by email:**
```js
const query = `
  <Where>
    <Eq>
      <FieldRef Name='Email'/>
      <Value Type='Text'>${email}</Value>
    </Eq>
  </Where>
`

const employees = await employeesApi.getItems({ query })
```

### Location Queries

**Get locations by type:**
```js
const locationsApi = new ListApi('Locations')

// Get all mailrooms
const query = `
  <Where>
    <And>
      <Eq>
        <FieldRef Name='LocationType'/>
        <Value Type='Text'>Mailroom</Value>
      </Eq>
      <Eq>
        <FieldRef Name='IsActive'/>
        <Value Type='Boolean'>1</Value>
      </Eq>
    </And>
  </Where>
`

const mailrooms = await locationsApi.getItems({ query })
```

**Get child locations (by parent):**
```js
const query = `
  <Where>
    <Eq>
      <FieldRef Name='ParentLocation' LookupId='TRUE'/>
      <Value Type='Lookup'>${parentLocationId}</Value>
    </Eq>
  </Where>
`

const childLocations = await locationsApi.getItems({ query })
```

## Data Validation with Zod

**Package creation validation:**
```js
const packageSchema = __zod.object({
  Title: __zod.string().min(1, 'Description is required'),
  Recipient: __zod.string().min(1, 'Recipient is required'),
  Priority: __zod.enum(['Standard', 'Urgent', 'Low']),
  DestinationLocation: __zod.number().positive('Destination is required'),
  PackageDetails: __zod.string().optional()
})

// Validate before creating
const result = packageSchema.safeParse(formData)
if (!result.success) {
  // Show validation errors
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

**Example:** `POSTHUB-20251203-00001`

## Status Update with Timeline

**Always include location:**
```js
export async function updatePackageStatus(packageId, newStatus, locationId, notes) {
  if (!locationId) {
    throw new Error('Location is required for status update')
  }

  const packagesApi = new ListApi('Packages')
  const pkg = await packagesApi.getItemByUUID(packageId)

  // Parse existing timeline
  const timeline = pkg.Timeline ? JSON.parse(pkg.Timeline) : []

  // Get location details
  const locationsApi = new ListApi('Locations')
  const location = await locationsApi.getItemByUUID(locationId)

  // Add new entry
  timeline.push({
    status: newStatus,
    date: new Date().toISOString(),
    location: location.Title,
    locationId: locationId,
    changedBy: currentUser.Email,
    notes: notes || ''
  })

  // Update package
  await packagesApi.createItem({
    ID: packageId,
    Status: newStatus,
    CurrentLocation: locationId,
    Timeline: JSON.stringify(timeline)
  })
}
```

## Reference

Extracted from:
- `IMPLEMENTATION_PLAN.md` lines 54-183 (SharePoint Lists Schema)
- `IMPLEMENTATION_PLAN.md` lines 190-210 (utils/sharepoint.js)
- `SHAREPOINT_SETUP_GUIDE.md` (complete list setup instructions)

For complete context, see:
- `IMPLEMENTATION_PLAN.md`
- `SHAREPOINT_SETUP_GUIDE.md`
- `sharepoint-data/README.md`
