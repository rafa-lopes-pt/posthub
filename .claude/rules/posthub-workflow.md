# PostHub Package Workflow

Package lifecycle and business logic rules.

## Package Workflow Overview

1. Regular user creates package details in "Send Mail" form -- Status: **created**
2. User physically brings package to a facilities access point (AP)
3. User swipes smart card at facilities desk (smart card reader pastes smart card ID into focused input)
4. System automatically searches for user's non-delivered packages
5. Facilities staff selects one or more packages
6. System generates QR code labels encoding full package data as JSON
7. Labels printed for physical attachment
8. Facilities scans QR codes to update package status as it moves through the workflow
9. Location tracked at every status change
10. Package moves between flat locations until final delivery

## Package Statuses

Status flow:
- **Normal:** created --> stored --> in transit --> arrived --> delivered
- **Re-routing:** created --> stored --> in transit --> stored --> in transit --> arrived --> delivered

### created

**Description**: User registered the package on the platform, but has not yet physically delivered it to a facilities access point. The mail exists digitally but has not reached an office.

**Created by**: Any user

**Location**: User's office (selected from ComboBox)

### stored

**Description**: Package is at a facilities access point (AP) and is waiting for transportation.

**Updated by**: FacilitiesEmployee or FacilitiesManager

**Location**: The AP office where the package is waiting

**Note**: A package can return to "stored" if it was sent to the wrong office. In that case it goes back to stored status at the wrong office, waiting to be re-routed.

### in transit

**Description**: Package has left an office and has not yet reached its destination. It is currently being transported.

**Updated by**: FacilitiesEmployee or FacilitiesManager

**Location**: Origin office (where it departed from)

### arrived

**Description**: Package has reached its correct destination office/location. This only happens when the destination matches the intended destination.

**Updated by**: FacilitiesEmployee or FacilitiesManager

**Location**: Destination office

**Note**: If a package arrives at the wrong office, it is NOT marked as "arrived". Instead it goes to "stored" at that location, waiting for re-routing.

### delivered

**Description**: Recipient has picked up the package. Workflow complete.

**Updated by**: FacilitiesEmployee or FacilitiesManager

**Location**: Destination office

## Re-routing Flow

When a package arrives at the wrong office:

1. Package is "in transit" heading to Office B
2. Package physically arrives at Office B
3. Facilities discovers it should have gone to Office C
4. Status set to **stored** at Office B (not "arrived")
5. Package waits for transport to Office C
6. Status set to **in transit** from Office B
7. Package arrives at Office C (correct destination)
8. Status set to **arrived** at Office C

## Location Requirements

**CRITICAL:** Every status change MUST include a location.

This ensures:
- Complete audit trail of package journey
- Users can see exactly where their package is
- Facilities can track routing efficiency
- Historical data for reporting

## Available Locations (flat list)

```
PORTO | URBO | 0
LISBON | TOC | 1
LISBON | TOR | 1
LISBON | ECHO | 0
LISBON | AURA | 7
LISBON | LUMNIA | 0
```

Location selection via ComboBox populated from Locations list.

## Role-Based Actions

### RegularUser (Read Permission)
- Create packages (status: created)
- View own packages (as sender or recipient)
- Track package status and timeline
- **Cannot**: Update status, generate labels, access facilities features

### FacilitiesEmployee (Contribute Permission)
- All RegularUser actions
- View all packages (dashboard)
- Smart Card swipe lookup
- Generate QR code labels
- Scan QR codes to update status
- Update package location
- **Cannot**: Manage locations, access reports

### FacilitiesManager (Full Control Permission)
- All FacilitiesEmployee actions
- Manage locations (CRUD operations)
- Access reports and analytics

**Note:** For now, all users can access everything (early testing phase). Role-based route restrictions are deferred.

## Smart Card Swipe Workflow

1. **Auto-focus**: Smart Card swipe input field is auto-focused on page load
2. **Smart Card scan**: Smart Card reader pastes smart card ID (e.g., "SC001") into input
3. **Debouncing**: 300ms debounce to handle smart card reader timing
4. **Employee lookup**: System queries `Employees` list by `Smart CardID` (indexed query)
5. **Package retrieval**: System fetches non-delivered packages for employee (sender or recipient)
6. **Display**: Show employee info and pending packages in table
7. **Selection**: Facilities staff selects packages for processing
8. **Label generation**: Click "Generate Labels" -- creates QR code labels
9. **Status update**: Status updated to "stored" with AP location

## QR Code Workflow

1. **Label generation**: qrcode.min.js creates QR code encoding full package data as JSON
2. **Print preview**: Display labels with QR code, package details, sender/recipient
3. **Print**: Browser native print dialog (4" x 6" label format)
4. **Scanning**: QR code scanner reads encoded data
5. **Package lookup**: System queries `Packages` list by `Title` (TrackingNumber, indexed)
6. **Status update**: Facilities updates status with new location

## Timeline Tracking

Every status change appends an entry to the Timeline field:

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

## Reference

Extracted from:
- `requirements-review.md` (updated requirements with user comments)
