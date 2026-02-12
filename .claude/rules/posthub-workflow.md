# PostHub Package Workflow

Package lifecycle and business logic rules.

## Package Workflow Overview

1. Regular user creates package details in "Send Mail" form → Status: **Sent** (initial location: sender's office)
2. User physically brings package to mailroom
3. User swipes badge at facilities desk (badge reader pastes badge ID into focused input)
4. System automatically searches for user's non-delivered packages
5. Facilities staff selects one or more packages
6. System generates barcode labels using JsBarcode library
7. Export labels to PDF for printing
8. Facilities scans barcodes to update package status as it moves through the workflow
9. Location tracked at every status change
10. Package moves through hierarchical locations (Campus → Building → Room) before final delivery

## Package Statuses

Status flow: **Sent → Received → Stored → In Transit → Arrived → Delivered**

### Sent
- **Description**: Created by user, awaiting physical delivery to mailroom
- **Created by**: RegularUser (any user)
- **Location**: Sender's office (auto-populated from Employees.OfficeLocation)
- **Typical actions**: User brings package to mailroom

### Received
- **Description**: Facilities has received physical package at mailroom
- **Updated by**: FacilitiesEmployee or FacilitiesManager
- **Location**: Mailroom (selected by facilities staff)
- **Typical actions**: Badge swipe lookup, label generation, initial scan

### Stored
- **Description**: Package stored at facilities location
- **Updated by**: FacilitiesEmployee or FacilitiesManager
- **Location**: Storage location (selected by facilities staff)
- **Typical actions**: Package placed in storage area

### In Transit
- **Description**: Moving between locations
- **Updated by**: FacilitiesEmployee or FacilitiesManager
- **Location**: Current transit location or vehicle
- **Typical actions**: Scanned during transport

### Arrived
- **Description**: Arrived at intermediate or final location
- **Updated by**: FacilitiesEmployee or FacilitiesManager
- **Location**: Building mailroom or office area
- **Typical actions**: Scanned at destination mailroom

### Delivered
- **Description**: Final delivery to recipient
- **Updated by**: FacilitiesEmployee or FacilitiesManager
- **Location**: Recipient's office (from Employees.OfficeLocation)
- **Typical actions**: Final scan, recipient notification

## Location Requirements

**CRITICAL:** Every status change MUST include a location.

This ensures:
- Complete audit trail of package journey
- Users can see exactly where their package is
- Facilities can track routing efficiency
- Historical data for reporting

**Implementation:**
```js
async function updatePackageStatus(packageId, newStatus, locationId, notes) {
  if (!locationId) {
    throw new Error('Location is required for status update')
  }
  // ... update logic
}
```

## Role-Based Actions

### RegularUser (Read Permission)
- Create packages (status: Sent)
- View own packages (as sender or recipient)
- Track package status and timeline
- **Cannot**: Update status, generate labels, access facilities features

### FacilitiesEmployee (Contribute Permission)
- All RegularUser actions
- View all packages (dashboard)
- Badge swipe lookup
- Generate barcode labels
- Scan barcodes to update status
- Update package location
- **Cannot**: Manage locations, access reports

### FacilitiesManager (Full Control Permission)
- All FacilitiesEmployee actions
- Manage location hierarchy (CRUD operations)
- Access reports and analytics
- Assign facilities staff permissions

## Badge Swipe Workflow

1. **Auto-focus**: Badge swipe input field is auto-focused on page load
2. **Badge scan**: Badge reader pastes badge ID (e.g., "BADGE001") into input
3. **Debouncing**: 300ms debounce to handle badge reader timing
4. **Employee lookup**: System queries `Employees` list by `BadgeID` (indexed query)
5. **Package retrieval**: System fetches non-delivered packages for employee (sender or recipient)
6. **Display**: Show employee info and pending packages in table
7. **Selection**: Facilities staff selects packages for processing
8. **Label generation**: Click "Generate Labels" → creates barcode labels
9. **Status update**: Status automatically updated to "Received" with location

## Barcode Workflow

1. **Label generation**: JsBarcode creates CODE128 barcode from tracking number
2. **Print preview**: Display labels with barcode, package details, sender/recipient
3. **Print**: Browser native print dialog (4" x 6" label format)
4. **Scanning**: Barcode scanner reads CODE128 barcode
5. **Package lookup**: System queries `Packages` list by `TrackingNumber` (indexed query)
6. **Status update**: Facilities updates status with new location

## Location Hierarchy

**Structure:** Campus → Building → Mailroom/Office

**Example:**
```
- Main Campus (Type: Campus, Parent: null)
  - Building A (Type: Building, Parent: Main Campus)
    - Mailroom A (Type: Mailroom, Parent: Building A)
    - Room 101 (Type: Office, Parent: Building A)
  - Building B (Type: Building, Parent: Main Campus)
    - Mailroom B (Type: Mailroom, Parent: Building B)
```

**Location Types:**
- **Campus** -- top-level location (e.g., "Main Campus", "West Campus")
- **Building** -- building within campus (e.g., "Building A")
- **Mailroom** -- package processing area (e.g., "Mailroom A")
- **Office** -- individual office or room (e.g., "Room 101")
- **Storage** -- storage area (e.g., "Storage Room")

**Routing Logic:**
1. Package starts at sender's office location
2. Moves to campus mailroom (Received)
3. May be stored temporarily (Stored)
4. Moves to destination building mailroom (In Transit → Arrived)
5. Delivered to recipient's office (Delivered)

## Timeline Tracking

Every status change appends an entry to the Timeline field:

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

**Benefits:**
- Complete audit trail
- Location tracked at every step
- User visibility into package journey
- Historical data for analytics

## Reference

Extracted from:
- `IMPLEMENTATION_PLAN.md` lines 31-51 (Package Workflow)
- `IMPLEMENTATION_PLAN.md` lines 26-28 (User Groups)
- `IMPLEMENTATION_PLAN.md` lines 44-50 (Package Statuses)
- `IMPLEMENTATION_PLAN.md` lines 152-183 (Timeline Field Details)

For complete context, see: `IMPLEMENTATION_PLAN.md`
