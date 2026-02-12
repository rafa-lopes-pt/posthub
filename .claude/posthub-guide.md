# PostHub Domain Guide

Comprehensive reference for the PostHub internal mail management system.

**Purpose:** This guide provides domain context, business logic, and technical patterns for PostHub. It's the PostHub equivalent of SPARC's framework guide.

**Audience:** Claude Code agents, developers, and anyone needing to understand PostHub's domain model.

---

## Table of Contents

1. [Domain Overview](#domain-overview)
2. [Package Lifecycle](#package-lifecycle)
3. [Location Hierarchy](#location-hierarchy)
4. [Badge Reader Integration](#badge-reader-integration)
5. [Barcode System](#barcode-system)
6. [Role-Based Access](#role-based-access)
7. [SharePoint Lists](#sharepoint-lists)
8. [Common Patterns](#common-patterns)
9. [Hardware Requirements](#hardware-requirements)
10. [Performance Considerations](#performance-considerations)

---

## Domain Overview

### What is PostHub?

PostHub is an internal physical mail management system for organizations with multiple buildings and campuses. It tracks packages from creation through final delivery, providing visibility to senders, recipients, and facilities staff.

**Key problem solved:** Manual package tracking (spreadsheets, paper logs) is error-prone and provides no visibility to users. PostHub digitizes the entire workflow with barcode automation.

### Business Context

**Primary users:**
- **Regular employees** -- send and receive mail
- **Facilities staff** -- process packages at mailrooms
- **Facilities managers** -- oversee operations, manage locations

**Core workflow:**
1. Employee creates package record digitally ("Send Mail")
2. Employee physically brings package to mailroom
3. Employee swipes badge at facilities desk
4. System looks up employee and shows their pending packages
5. Facilities generates barcode labels, affixes to packages
6. Facilities scans barcodes as packages move through routing
7. Package progresses through locations until delivered
8. Both sender and recipient can track status in real-time

**Value proposition:**
- Eliminates manual tracking (no more spreadsheets)
- Real-time visibility for all stakeholders
- Complete audit trail (where package has been, who handled it)
- Barcode automation reduces errors
- Scalable across multiple campuses and buildings

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
- JsBarcode (barcode generation, CODE128 format)
- jQuery (bundled with SPARC)
- Zod (validation)
- DayJS (date handling)

**Hardware Integration:**
- Badge reader (keyboard wedge mode)
- Barcode printer (4"x6" label format)
- Barcode scanner (CODE128 compatible)

---

## Package Lifecycle

### Status Flow

**Linear progression:** Sent → Received → Stored → In Transit → Arrived → Delivered

Each status change:
- Requires a location to be specified
- Appends entry to Timeline JSON array
- Updates CurrentLocation field
- Records who made the change and when

### Status Definitions

#### 1. Sent (Initial Status)

**Created by:** RegularUser (sender)

**When:** User creates package record in "Send Mail" form

**Location:** Sender's office (auto-populated from Employees.OfficeLocation)

**Typical next action:** User physically brings package to mailroom

**Example Timeline Entry:**
```json
{
  "status": "Sent",
  "date": "2025-12-03T10:00:00Z",
  "location": "Room 101",
  "locationId": 15,
  "changedBy": "john.smith@company.com",
  "notes": "Package created"
}
```

#### 2. Received (At Mailroom)

**Updated by:** FacilitiesEmployee or FacilitiesManager

**When:** Package physically arrives at mailroom, barcode label generated

**Location:** Mailroom (selected by facilities staff)

**Typical actions:**
- Badge swipe to look up user's packages
- Select package(s) from list
- Generate barcode labels
- Print labels and affix to packages
- Status automatically updated to "Received"

**Example Timeline Entry:**
```json
{
  "status": "Received",
  "date": "2025-12-03T14:30:00Z",
  "location": "Main Campus Mailroom",
  "locationId": 10,
  "changedBy": "facilities@company.com",
  "notes": "Label printed at facilities desk"
}
```

#### 3. Stored (Temporary Storage)

**Updated by:** FacilitiesEmployee or FacilitiesManager

**When:** Package needs to be stored temporarily (waiting for routing, batch processing)

**Location:** Storage area (selected by facilities staff)

**Typical reasons:**
- Batch deliveries (wait for full cart)
- Recipient not available
- After-hours delivery

**Example Timeline Entry:**
```json
{
  "status": "Stored",
  "date": "2025-12-03T15:00:00Z",
  "location": "Storage Room A",
  "locationId": 12,
  "changedBy": "facilities@company.com",
  "notes": "Holding for afternoon delivery batch"
}
```

#### 4. In Transit (Moving Between Locations)

**Updated by:** FacilitiesEmployee or FacilitiesManager

**When:** Package is being transported between buildings or campuses

**Location:** Vehicle or intermediate location

**Typical actions:**
- Scan barcode before loading onto delivery cart/vehicle
- Update status to "In Transit"
- Record destination in notes

**Example Timeline Entry:**
```json
{
  "status": "In Transit",
  "date": "2025-12-03T16:00:00Z",
  "location": "Delivery Vehicle 1",
  "locationId": 20,
  "changedBy": "facilities@company.com",
  "notes": "En route to Building B"
}
```

#### 5. Arrived (At Destination)

**Updated by:** FacilitiesEmployee or FacilitiesManager

**When:** Package arrives at destination building/mailroom (not yet delivered to recipient)

**Location:** Destination building mailroom

**Typical actions:**
- Scan barcode upon arrival
- Package ready for final delivery to recipient's office

**Example Timeline Entry:**
```json
{
  "status": "Arrived",
  "date": "2025-12-03T16:30:00Z",
  "location": "Building B Mailroom",
  "locationId": 22,
  "changedBy": "facilities@company.com",
  "notes": "Package arrived at destination building"
}
```

#### 6. Delivered (Final Status)

**Updated by:** FacilitiesEmployee or FacilitiesManager

**When:** Package physically delivered to recipient's office

**Location:** Recipient's office (from Employees.OfficeLocation or manually selected)

**Typical actions:**
- Scan barcode at recipient's office
- Update status to "Delivered"
- Package workflow complete

**Example Timeline Entry:**
```json
{
  "status": "Delivered",
  "date": "2025-12-03T17:00:00Z",
  "location": "Room 205",
  "locationId": 25,
  "changedBy": "facilities@company.com",
  "notes": "Delivered to recipient's office"
}
```

### Timeline JSON Structure

**Field Type:** Multiple lines of text (plain text in SharePoint)

**Content:** JSON array of status change objects

**Complete Example:**
```json
[
  {
    "status": "Sent",
    "date": "2025-12-03T10:00:00Z",
    "location": "Room 101",
    "locationId": 15,
    "changedBy": "john.smith@company.com",
    "notes": "Package created"
  },
  {
    "status": "Received",
    "date": "2025-12-03T14:30:00Z",
    "location": "Main Campus Mailroom",
    "locationId": 10,
    "changedBy": "facilities@company.com",
    "notes": "Label printed"
  },
  {
    "status": "In Transit",
    "date": "2025-12-03T16:00:00Z",
    "location": "Delivery Vehicle 1",
    "locationId": 20,
    "changedBy": "facilities@company.com",
    "notes": "En route to Building B"
  },
  {
    "status": "Delivered",
    "date": "2025-12-03T17:00:00Z",
    "location": "Room 205",
    "locationId": 25,
    "changedBy": "facilities@company.com",
    "notes": "Delivered to recipient"
  }
]
```

**Required Fields:**
- `status` (string) -- one of 6 valid statuses
- `date` (ISO 8601 string) -- when change occurred
- `location` (string) -- location name (human-readable)
- `locationId` (number) -- location ID from Locations list
- `changedBy` (string) -- email of user who made change
- `notes` (string) -- optional notes (can be empty string)

**Critical Rules:**
1. Always parse existing Timeline before modifying: `JSON.parse(pkg.Timeline || '[]')`
2. Never manipulate as string (no concatenation, no string replacement)
3. Always stringify before saving: `JSON.stringify(timeline)`
4. Location is REQUIRED for every entry (never null)

---

## Location Hierarchy

### Structure

PostHub uses a hierarchical location model with 5 location types:

```
Campus (top level)
  └─ Building
       ├─ Mailroom
       ├─ Office
       └─ Storage
```

### Location Types

#### Campus
**Top-level location** (e.g., "Main Campus", "West Campus")

**Characteristics:**
- No parent location (ParentLocation = null)
- Contains multiple buildings
- Used for routing between campuses

**Sample Data:**
```
Title: Main Campus
LocationType: Campus
ParentLocation: null
Campus: Main Campus
Building: null
RoomArea: null
```

#### Building
**Building within campus** (e.g., "Building A", "Building B")

**Characteristics:**
- Parent is Campus
- Contains mailrooms, offices, storage
- Used for routing within campus

**Sample Data:**
```
Title: Building A
LocationType: Building
ParentLocation: Main Campus (lookup)
Campus: Main Campus
Building: Building A
RoomArea: null
```

#### Mailroom
**Package processing area** (e.g., "Mailroom A", "Building B Mailroom")

**Characteristics:**
- Parent is Building
- Where packages are received and processed
- Facilities staff work here

**Sample Data:**
```
Title: Mailroom A
LocationType: Mailroom
ParentLocation: Building A (lookup)
Campus: Main Campus
Building: Building A
RoomArea: Mailroom A
```

#### Office
**Individual office or room** (e.g., "Room 101", "Room 205")

**Characteristics:**
- Parent is Building
- Where employees work
- Final delivery destination

**Sample Data:**
```
Title: Room 101
LocationType: Office
ParentLocation: Building A (lookup)
Campus: Main Campus
Building: Building A
RoomArea: 101
```

#### Storage
**Storage area** (e.g., "Storage Room A")

**Characteristics:**
- Parent is Building (or Mailroom)
- Used for temporary package storage
- Not all buildings have storage areas

**Sample Data:**
```
Title: Storage Room A
LocationType: Storage
ParentLocation: Building A (lookup)
Campus: Main Campus
Building: Building A
RoomArea: Storage A
```

### Hierarchy Example

```
Main Campus (Campus)
├── Building A (Building)
│   ├── Mailroom A (Mailroom)
│   ├── Storage Room A (Storage)
│   ├── Room 101 (Office)
│   └── Room 102 (Office)
└── Building B (Building)
    ├── Mailroom B (Mailroom)
    ├── Room 201 (Office)
    └── Room 205 (Office)

West Campus (Campus)
└── Building C (Building)
    ├── Mailroom C (Mailroom)
    └── Room 301 (Office)
```

### Routing Logic

**Typical package journey:**
1. **Sent** -- Sender's office (e.g., Room 101, Building A)
2. **Received** -- Campus mailroom (e.g., Mailroom A, Building A)
3. **Stored** -- Storage if needed (e.g., Storage Room A)
4. **In Transit** -- Moving to destination (e.g., Delivery Vehicle 1)
5. **Arrived** -- Destination mailroom (e.g., Mailroom B, Building B)
6. **Delivered** -- Recipient's office (e.g., Room 205, Building B)

**Cross-campus routing:**
If sender and recipient are on different campuses, package may transit through both campus mailrooms.

**Same-building routing:**
If sender and recipient are in same building, package may go directly from mailroom to recipient's office.

### Location Queries

**Get locations by type:**
```js
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

**Get child locations (breadcrumb navigation):**
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

---

## Badge Reader Integration

### Hardware Specifications

**Device Type:** USB badge reader (keyboard wedge mode)

**How it works:**
1. Badge reader acts as a keyboard
2. When badge is swiped, reader "types" the badge ID
3. Badge ID appears in the focused input field
4. Application processes the badge ID

**Badge ID Format:** Alphanumeric string (e.g., "BADGE001", "BADGE123")

**Typical badge reader timing:** 50-200ms to transmit badge ID

### Integration Pattern

**Key requirements:**
1. **Auto-focus** -- Input field must be focused on page load
2. **Debouncing** -- 300ms delay to handle badge reader timing
3. **Event handling** -- Support both `input` and `paste` events
4. **Indexed query** -- Badge lookup must use indexed BadgeID field (< 2 seconds)
5. **Manual fallback** -- Allow manual badge ID entry if reader fails

### Implementation

**HTML structure:**
```js
const badgeInput = new TextInput({
  placeholder: 'Swipe badge or enter Badge ID...',
  autoFocus: true,
  onInput: handleBadgeInput
})
```

**Event handling with debouncing:**
```js
let debounceTimer

function handleBadgeInput(value) {
  // Clear previous timer
  clearTimeout(debounceTimer)

  // Set new timer (300ms delay)
  debounceTimer = setTimeout(async () => {
    // Lookup employee
    const employee = await getEmployeeByBadge(value)

    if (employee) {
      // Display employee info and packages
      displayEmployeePackages(employee)

      // Clear input for next scan
      badgeInput.value = ''
    } else {
      Toast.error('Badge not found')
    }
  }, 300)
}
```

**Auto-focus on page load:**
```js
export default defineRoute((config) => {
  config.setRouteTitle('Badge Swipe & Scan')

  const badgeInput = createBadgeSwipeInput({
    onBadgeScanned: handleBadgeScanned
  })

  // SPARC renders components immediately
  // Auto-focus happens in component mount

  return [badgeInput, ...]
})
```

### Employee Lookup (Critical Performance)

**Indexed query (fast):**
```js
async function getEmployeeByBadge(badgeId) {
  const employeesApi = new ListApi('Employees')

  // Use indexed BadgeID field
  const query = `
    <Where>
      <Eq>
        <FieldRef Name='BadgeID'/>
        <Value Type='Text'>${badgeId}</Value>
      </Eq>
    </Where>
  `

  const employees = await employeesApi.getItems({ query })
  return employees[0]  // Should be unique
}
```

**Performance requirement:** < 2 seconds

**Critical:** BadgeID field MUST be indexed in SharePoint for fast lookup.

### Package Retrieval

After employee lookup, fetch non-delivered packages:

```js
async function getPendingPackagesForUser(userEmail) {
  const packagesApi = new ListApi('Packages')

  const query = `
    <Where>
      <And>
        <Or>
          <Eq>
            <FieldRef Name='Sender' LookupId='TRUE'/>
            <Value Type='User'>${employee.UserId}</Value>
          </Eq>
          <Eq>
            <FieldRef Name='Recipient' LookupId='TRUE'/>
            <Value Type='User'>${employee.UserId}</Value>
          </Eq>
        </Or>
        <Neq>
          <FieldRef Name='Status'/>
          <Value Type='Text'>Delivered</Value>
        </Neq>
      </And>
    </Where>
  `

  return await packagesApi.getItems({ query })
}
```

### Testing Checklist

When implementing badge swipe:
- [ ] Input field auto-focuses on page load
- [ ] Badge swipe triggers lookup (not manual click)
- [ ] Debouncing prevents duplicate scans (300ms)
- [ ] Employee lookup completes in < 2 seconds
- [ ] Employee info displays (name, email, office)
- [ ] Pending packages display in table
- [ ] Error message if badge not found
- [ ] Manual entry works if reader fails
- [ ] Input clears after successful scan

---

## Barcode System

### Tracking Number Format

**Pattern:** `POSTHUB-YYYYMMDD-XXXXX`

**Components:**
- `POSTHUB` -- prefix (identifies PostHub packages)
- `YYYYMMDD` -- date (8 digits)
- `XXXXX` -- sequence number (5 digits, zero-padded)

**Example:** `POSTHUB-20251203-00001`

**Generation:**
```js
function generateTrackingNumber() {
  const date = __dayjs().format('YYYYMMDD')
  const sequence = String(Math.floor(Math.random() * 100000)).padStart(5, '0')
  return `POSTHUB-${date}-${sequence}`
}
```

**Uniqueness:** Date + sequence provides ~100,000 unique numbers per day (sufficient for most organizations)

### Barcode Format

**Type:** CODE128

**Why CODE128:**
- Supports alphanumeric characters (tracking number has letters and numbers)
- Compact and readable
- Widely supported by barcode scanners
- High density (more data in less space)

**Barcode generation (JsBarcode):**
```js
import JsBarcode from '../libs/JsBarcode.all.min.js'

function generateBarcode(trackingNumber) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')

  JsBarcode(svg, trackingNumber, {
    format: 'CODE128',
    width: 2,
    height: 100,
    displayValue: true,  // Show human-readable text
    fontSize: 14,
    margin: 10
  })

  return svg
}
```

### Label Layout

**Size:** 4" x 6" (industry standard for shipping labels)

**Layout:**
```
+------------------------------------------+
|                                          |
|  POSTHUB-20251203-00001                  |  <- Tracking number (large, bold)
|  ||||||||||||||||||||||||||||||||        |  <- CODE128 barcode
|                                          |
|  From: John Smith                        |  <- Sender info
|        Room 101, Building A              |
|                                          |
|  To: Jane Doe                            |  <- Recipient info
|      Room 205, Building B                |
|                                          |
|  Priority: [URGENT]                      |  <- Priority badge
|  Created: Dec 3, 2025 10:00 AM           |
|                                          |
+------------------------------------------+
```

**Print CSS:**
```css
@media print {
  .posthub__barcode-label {
    width: 4in;
    height: 6in;
    page-break-after: always;
    padding: 0.25in;
  }

  /* Hide navigation and UI */
  nav, header, .no-print {
    display: none !important;
  }
}
```

### Barcode Scanning

**Scanner Type:** CODE128 compatible (most modern scanners)

**How it works:**
1. Scanner reads barcode optically
2. Scanner "types" tracking number into focused input (keyboard wedge mode)
3. Application processes tracking number

**Package lookup (indexed):**
```js
async function getPackageByTrackingNumber(trackingNumber) {
  const packagesApi = new ListApi('Packages')

  // Use indexed TrackingNumber field
  const query = `
    <Where>
      <Eq>
        <FieldRef Name='TrackingNumber'/>
        <Value Type='Text'>${trackingNumber}</Value>
      </Eq>
    </Where>
  `

  const packages = await packagesApi.getItems({ query })
  return packages[0]  // Should be unique
}
```

**Performance requirement:** < 2 seconds

**Critical:** TrackingNumber field MUST be indexed in SharePoint for fast lookup.

### Print Workflow

1. **Badge swipe** -- facilities staff looks up employee
2. **Package selection** -- staff selects one or more packages
3. **Generate labels** -- click "Generate Labels" button
4. **Preview** -- labels display on screen with barcodes
5. **Print** -- click "Print All Labels" → browser print dialog
6. **Affix labels** -- staff attaches printed labels to physical packages
7. **Status update** -- status automatically updates to "Received"

### Testing Checklist

When implementing barcode system:
- [ ] Tracking number format is `POSTHUB-YYYYMMDD-XXXXX`
- [ ] Barcode format is CODE128
- [ ] JsBarcode library loaded correctly
- [ ] Labels display in 4"x6" format
- [ ] Human-readable tracking number visible
- [ ] Print dialog shows correct page size
- [ ] Physical labels print at 4"x6"
- [ ] Barcode scanner reads printed labels
- [ ] Tracking number lookup < 2 seconds
- [ ] Package lookup uses indexed query

---

## Role-Based Access

### User Groups (SharePoint Groups)

PostHub uses 3 SharePoint groups for role-based access control.

#### RegularUser

**Permission Level:** Read

**Members:** All employees (default group)

**Capabilities:**
- Create packages ("Send Mail" form)
- View own packages (as sender or recipient)
- Track package status and timeline
- View location hierarchy (read-only)

**Cannot:**
- Update package status
- Generate barcode labels
- Access facilities dashboard
- Manage locations
- View other users' packages

**Routes accessible:**
- `/` (home)
- `/my-mail` (view own packages)
- `/send-mail` (create package)
- `/help` (help documentation)

#### FacilitiesEmployee

**Permission Level:** Contribute

**Members:** Facilities staff (mailroom workers, delivery personnel)

**Capabilities:**
- All RegularUser capabilities
- View all packages (facilities dashboard)
- Badge swipe lookup (look up employee by badge ID)
- Generate barcode labels
- Scan barcodes (update package status)
- Update package location
- Move packages through workflow

**Cannot:**
- Manage location hierarchy (CRUD operations)
- Access reports and analytics
- Assign permissions to other users

**Routes accessible:**
- All RegularUser routes
- `/facilities/dashboard` (view all packages)
- `/facilities/scan` (badge swipe and barcode scanning)

#### FacilitiesManager

**Permission Level:** Full Control

**Members:** Facilities managers (supervisors, administrators)

**Capabilities:**
- All FacilitiesEmployee capabilities
- Manage location hierarchy (create, edit, delete locations)
- Access reports and analytics
- View system-wide statistics
- Assign facilities staff permissions

**Cannot:**
- N/A (full control within PostHub scope)

**Routes accessible:**
- All RegularUser and FacilitiesEmployee routes
- `/facilities/locations` (manage location hierarchy)
- `/facilities/reports` (reports and analytics)

### Permission Checks

**Route-level authorization:**
```js
// index.js - Router configuration
import { Router } from './libs/nofbiz/dist/nofbiz.base.js'
import { hasFacilitiesAccess, isFacilitiesManager } from './utils/permissions.js'

const routes = ['my-mail', 'send-mail', 'help']

// Add facilities routes if user has access
if (hasFacilitiesAccess()) {
  routes.push('facilities/dashboard', 'facilities/scan')
}

// Add admin routes if user is manager
if (isFacilitiesManager()) {
  routes.push('facilities/locations', 'facilities/reports')
}

new Router(routes)
```

**Component-level checks:**
```js
// routes/route.js - Landing page
export default defineRoute((config) => {
  config.setRouteTitle('PostHub - Home')

  const cards = [
    // User actions (everyone sees)
    new Card([
      new LinkButton({ href: '#/my-mail', text: 'My Mail' }),
      new LinkButton({ href: '#/send-mail', text: 'Send Mail' }),
      new LinkButton({ href: '#/help', text: 'Help' })
    ])
  ]

  // Facilities card (conditional)
  if (hasFacilitiesAccess()) {
    cards.push(new Card([
      new Text('Facilities', { type: 'h2' }),
      new LinkButton({ href: '#/facilities/dashboard', text: 'Dashboard' }),
      new LinkButton({ href: '#/facilities/scan', text: 'Badge Scan' })
    ]))
  }

  // Admin card (conditional)
  if (isFacilitiesManager()) {
    cards.push(new Card([
      new Text('Admin', { type: 'h2' }),
      new LinkButton({ href: '#/facilities/locations', text: 'Manage Locations' }),
      new LinkButton({ href: '#/facilities/reports', text: 'Reports' })
    ]))
  }

  return [new Container(cards)]
})
```

### Permission Utilities

**File:** `utils/permissions.js`

```js
import { CurrentUser } from '../libs/nofbiz/dist/nofbiz.base.js'

export const UserGroups = {
  REGULAR_USER: 'RegularUser',
  FACILITIES_EMPLOYEE: 'FacilitiesEmployee',
  FACILITIES_MANAGER: 'FacilitiesManager'
}

export async function isUserInGroup(groupName) {
  // CurrentUser.groupTitle contains array of group names
  return CurrentUser.groupTitle.includes(groupName)
}

export async function hasFacilitiesAccess() {
  return await isUserInGroup(UserGroups.FACILITIES_EMPLOYEE) ||
         await isUserInGroup(UserGroups.FACILITIES_MANAGER)
}

export async function isFacilitiesManager() {
  return await isUserInGroup(UserGroups.FACILITIES_MANAGER)
}

export async function isRegularUser() {
  return await isUserInGroup(UserGroups.REGULAR_USER) &&
         !await hasFacilitiesAccess()
}
```

---

## SharePoint Lists

### Quick Reference

| List | Columns | Indexes | Purpose |
|------|---------|---------|---------|
| **Packages** | 12 | 4 | Package records |
| **Employees** | 9 | 2 | Employee directory |
| **Locations** | 9 | 2 | Location hierarchy |

### Packages List

**Key columns:**
- `TrackingNumber` (indexed, unique) -- barcode identifier
- `Status` (indexed) -- current package status
- `Timeline` (JSON array) -- complete audit trail
- `Sender`, `Recipient` (Person or Group, indexed) -- package ownership
- `CurrentLocation`, `DestinationLocation` (Lookup) -- location tracking

**Sample query (user's packages):**
```js
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
```

### Employees List

**Key columns:**
- `BadgeID` (indexed, unique) -- badge reader lookup
- `Email` (indexed) -- user identification
- `OfficeLocation` (Lookup) -- employee's office for package routing

**Sample query (badge lookup):**
```js
const query = `
  <Where>
    <Eq>
      <FieldRef Name='BadgeID'/>
      <Value Type='Text'>${badgeId}</Value>
    </Eq>
  </Where>
`
```

### Locations List

**Key columns:**
- `LocationType` (indexed) -- Campus, Building, Mailroom, Office, Storage
- `ParentLocation` (Lookup to self) -- hierarchical structure
- `IsActive` (indexed) -- filter out inactive locations

**Sample query (get mailrooms):**
```js
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
```

For complete schemas, see: `SHAREPOINT_SETUP_GUIDE.md`

---

## Common Patterns

### Create Package with Location

```js
import { ListApi, CurrentUser } from '../libs/nofbiz/dist/nofbiz.base.js'
import { generateTrackingNumber } from '../utils/barcode.js'

async function createPackage(formData) {
  const packagesApi = new ListApi('Packages')

  // Get sender's office location
  const employeesApi = new ListApi('Employees')
  const senderEmployee = await employeesApi.getItems({
    query: `<Where><Eq><FieldRef Name='Email'/><Value Type='Text'>${CurrentUser.Email}</Value></Eq></Where>`
  })
  const senderOfficeId = senderEmployee[0].OfficeLocation.ID

  // Create package
  const packageData = {
    Title: formData.description,
    TrackingNumber: generateTrackingNumber(),
    Sender: CurrentUser.UID,
    Recipient: formData.recipientUserId,
    Priority: formData.priority || 'Standard',
    Status: 'Sent',
    CurrentLocation: senderOfficeId,
    DestinationLocation: formData.destinationLocationId,
    PackageDetails: formData.details || '',
    Timeline: JSON.stringify([{
      status: 'Sent',
      date: new Date().toISOString(),
      location: senderEmployee[0].OfficeLocation.Title,
      locationId: senderOfficeId,
      changedBy: CurrentUser.Email,
      notes: 'Package created'
    }])
  }

  await packagesApi.createItem(packageData)
  Toast.success('Package created successfully')
}
```

### Update Package Status with Location

```js
async function updatePackageStatus(packageId, newStatus, locationId, notes = '') {
  if (!locationId) {
    throw new Error('Location is required for status update')
  }

  const packagesApi = new ListApi('Packages')
  const locationsApi = new ListApi('Locations')

  // Get package and location
  const pkg = await packagesApi.getItemByUUID(packageId)
  const location = await locationsApi.getItemByUUID(locationId)

  // Parse timeline
  const timeline = pkg.Timeline ? JSON.parse(pkg.Timeline) : []

  // Add new entry
  timeline.push({
    status: newStatus,
    date: new Date().toISOString(),
    location: location.Title,
    locationId: locationId,
    changedBy: CurrentUser.Email,
    notes: notes
  })

  // Update package
  await packagesApi.createItem({
    ID: packageId,
    Status: newStatus,
    CurrentLocation: locationId,
    Timeline: JSON.stringify(timeline)
  })

  Toast.success(`Package status updated to ${newStatus}`)
}
```

### Badge Swipe Workflow

```js
async function handleBadgeSwipe(badgeId) {
  const employeesApi = new ListApi('Employees')
  const packagesApi = new ListApi('Packages')

  // 1. Lookup employee (indexed query)
  const query = `<Where><Eq><FieldRef Name='BadgeID'/><Value Type='Text'>${badgeId}</Value></Eq></Where>`
  const employees = await employeesApi.getItems({ query })

  if (employees.length === 0) {
    Toast.error('Badge not found')
    return
  }

  const employee = employees[0]

  // 2. Get pending packages
  const packagesQuery = `
    <Where>
      <And>
        <Or>
          <Eq><FieldRef Name='Sender' LookupId='TRUE'/><Value Type='User'>${employee.UserId}</Value></Eq>
          <Eq><FieldRef Name='Recipient' LookupId='TRUE'/><Value Type='User'>${employee.UserId}</Value></Eq>
        </Or>
        <Neq><FieldRef Name='Status'/><Value Type='Text'>Delivered</Value></Neq>
      </And>
    </Where>
  `
  const packages = await packagesApi.getItems({ query: packagesQuery })

  // 3. Display results
  displayEmployeeInfo(employee)
  displayPackageTable(packages)
}
```

---

## Hardware Requirements

### Badge Reader
- **Type:** USB keyboard wedge
- **Compatibility:** Windows, macOS, Linux
- **Connection:** USB 2.0 or higher
- **Badge format:** Supports HID, EM, or custom encoding

### Barcode Printer
- **Label size:** 4" x 6" capable
- **Print quality:** 300 DPI minimum (for barcode readability)
- **Connection:** USB or network
- **Compatibility:** Windows print drivers

### Barcode Scanner
- **Format support:** CODE128 (required)
- **Mode:** Keyboard wedge (preferred) or serial
- **Connection:** USB 2.0 or higher
- **Range:** Standard handheld scanner

---

## Performance Considerations

### Index Requirements (Critical)

**Must be indexed:**
- `Employees.BadgeID` -- badge swipe lookup < 2 seconds
- `Packages.TrackingNumber` -- barcode scan lookup < 2 seconds
- `Packages.Status` -- dashboard filtering
- `Packages.Sender` -- "My Mail" queries
- `Packages.Recipient` -- "My Mail" queries

**Without indexes:** Queries can take 10-30+ seconds (unacceptable for hardware integration)

### Query Performance Targets

| Operation | Target | Index Required |
|-----------|--------|----------------|
| Badge lookup | < 2 seconds | BadgeID |
| Barcode scan | < 2 seconds | TrackingNumber |
| My Mail query | < 5 seconds | Sender, Recipient |
| Dashboard filter | < 3 seconds | Status |
| Location lookup | < 2 seconds | IsActive, LocationType |

### SharePoint List Thresholds

**List view threshold:** 5,000 items

**Impact:** Queries return max 5,000 items without pagination

**PostHub scale:** 10,000-50,000 packages/year expected

**Mitigation:**
- Use indexed columns for queries
- Implement pagination for large result sets
- Archive old packages (> 1 year) to separate list

---

## Reference Files

**This guide references:**
- `IMPLEMENTATION_PLAN.md` -- architectural authority (767 lines)
- `SHAREPOINT_SETUP_GUIDE.md` -- complete list setup (1,103 lines)
- `.claude/rules/*.md` -- critical constraints (5 files)

**For complete details, see:** `IMPLEMENTATION_PLAN.md`

**For SharePoint setup, see:** `SHAREPOINT_SETUP_GUIDE.md`

**For constraints, see:** `.claude/rules/` directory
