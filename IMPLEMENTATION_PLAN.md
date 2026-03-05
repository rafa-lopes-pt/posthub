# PostHub - Comprehensive Implementation Plan

## Project Overview

PostHub is an internal physical mail management system built with the SPARC framework for SharePoint on-premises. The system manages mail workflow from creation through delivery, with role-based access for regular users, facilities employees, and facilities managers.

---

## Executive Summary

### Core Features
1. **User Self-Service**: Send mail, track packages, view status
2. **Facilities Operations**: Smart card scan lookup, QR code generation, package scanning
3. **Multi-Location Routing**: Flat location list (City/Office pairs)
4. **QR Code Integration**: qrcode.min.js library for label generation and scanning
5. **Role-Based Access**: Three user groups with different permissions

### Technology Stack
- **Framework**: SPARC (SharePoint React-like Architecture Component)
- **Data Store**: SharePoint Lists (on-premises)
- **Libraries**: qrcode.min.js (QR code generation), jQuery (included with SPARC)
- **Architecture**: Single-page application with client-side routing

### User Groups (SharePoint Groups)
1. **RegularUser** - Send and receive mail
2. **FacilitiesEmployee** - Process, scan, route packages
3. **FacilitiesManager** - Admin access, reports, location management

---

## SharePoint Lists Schema

See `.claude/rules/sharepoint-data.md` for complete list schemas, column definitions, indexes, and CAML query patterns.

See `.claude/rules/posthub-workflow.md` for package status definitions and workflow rules.

---

## Phase 1: Foundation

### Critical Files

#### `utils/sharepoint.js`
Centralized SharePoint REST API operations:
- `Lists` - Initialize ListAPI instances for all SharePoint lists
- `getUserPackages(userEmail, status)` - Get packages for current user
- `getEmployeeBySmartCard(smartCardId)` - Get employee by smart card ID
- `getPendingPackagesForUser(userEmail)` - Get non-delivered packages
- `getActiveLocations()` - Get all active locations
- `generateTrackingNumber()` - Generate unique tracking number
- `createPackage(packageData)` - Create package with tracking number
- `updatePackageStatus(packageId, newStatus, location, notes)` - Update status and Timeline
- `getPackageTimeline(packageId)` - Parse and return timeline history
- `getCurrentUserInfo()` - Get current user info

#### `utils/permissions.js`
Permission checking:
- `UserGroups` constant - Group names
- `isUserInGroup(groupName)` - Check group membership
- `hasFacilitiesAccess()` - Check facilities access
- `isFacilitiesManager()` - Check manager role
- `getAvailableRoutes()` - Routes based on permissions

#### `utils/qrcode.js`
QR code generation using qrcode.min.js:
- `generateQRCode(container, data, options)` - Generate QR code (encodes full package JSON)
- `createPrintableLabel(packageInfo)` - Create label HTML for printing
- `isValidTrackingNumber(trackingNumber)` - Validate format

#### `utils/pdf.js`
PDF/print functionality using browser's native print:
- `printQRCodeLabels(packages)` - Print labels for multiple packages
- `downloadLabelImage(packageInfo)` - Export single label as image

---

## Phase 2: Components

See `.claude/rules/posthub-components.md` for detailed component patterns (packageTable, smartCardInput, qrLabelGenerator).

Additional components:
- `packageCard.js` - Card display with status badge and action buttons
- `locationPicker.js` - Flat location selector dropdown
- `recipientSearch.js` - Auto-complete search for recipient selection

---

## Phase 3: Routes

See `.claude/rules/home-route.md` for home route structure convention.

### Route Specifications

| Route | Access | Purpose |
|-------|--------|---------|
| `/` | All | Landing page with role-based navigation |
| `/my-mail` | All | View own packages (sender or recipient) |
| `/send-mail` | All | Create new package |
| `/help` | All | User guides |
| `/facilities/dashboard` | Facilities+ | All packages overview with stats |
| `/facilities/scan` | Facilities+ | Smart card scan and QR code scanning |
| `/facilities/locations` | Manager only | Location CRUD |
| `/facilities/reports` | Manager only | Analytics |

---

## Phase 4: External Libraries

### qrcode.min.js
- **Source**: https://github.com/davidshimjs/qrcodejs
- **Location**: `SiteAssets/app/libs/qrcode.min.js`
- **Format**: QR code (encodes full package JSON)
- **Usage**: `new QRCode(container, { text: JSON.stringify(packageData), width: 200, height: 200 })`

---

## Implementation Checklist

### Phase 1: Foundation
- [ ] Create SharePoint Lists (Packages, Employees, Locations)
- [ ] Add 6 locations, 10 employees with smart card IDs
- [ ] Create SharePoint groups, assign test users
- [ ] Download qrcode.min.js to `libs/`
- [ ] Create utility files (sharepoint.js, permissions.js, qrcode.js, pdf.js)

### Phase 2: Components
- [ ] Build PackageTable, SmartCardInput, QRCodeGenerator
- [ ] Build PackageCard, LocationPicker, RecipientSearch

### Phase 3: User Routes
- [ ] Implement Home, My Mail, Send Mail, Help routes
- [ ] Update `index.js` with route registration

### Phase 4: Facilities Routes
- [ ] Implement Dashboard, Smart Card Scan & Scan
- [ ] Test smart card scan with physical hardware
- [ ] Test QR code generation and printing

### Phase 5: Admin Features
- [ ] Implement Manage Locations, Reports routes

### Phase 6: Polish
- [ ] Global styles, loading states, error handling, toast notifications
- [ ] Test all routes with different permissions on Microsoft Edge

---

## Key Design Decisions

1. **QR Code Format**: Encodes full package JSON (not just tracking number) for offline reading
2. **Smart Card Reader**: Support both `input` and `paste` events with 300ms debounce, auto-focus, manual fallback
3. **Print Strategy**: Native browser print with custom CSS (4"x6" labels), no external PDF library
4. **SharePoint Design**: All fields Text or Note (SPARC limitation), SharePoint as dumb data store
5. **Flat Location Model**: 6 fixed locations, no hierarchy, simple dropdown selection
6. **Package Status Flow**: 5 statuses with re-routing support via Timeline JSON

See `.claude/rules/critical-constraints.md` for hard rules preventing runtime failures.

---

## Deployment Steps

### 1. SharePoint Setup
1. Create three lists (Packages, Employees, Locations) with specified columns
2. Add indexes to key columns (Title/TrackingNumber, SmartCardID, Status, Sender, Recipient)
3. Create SharePoint groups (RegularUser, FacilitiesEmployee, FacilitiesManager)
4. Add 6 location records and employee smart card IDs

See `SHAREPOINT_SETUP_GUIDE.md` for complete step-by-step instructions.

### 2. Code Deployment
1. Upload qrcode.min.js to `/SiteAssets/app/libs/`
2. Create utility files in `/SiteAssets/app/utils/`
3. Create component files in `/SiteAssets/app/components/`
4. Create route files in `/SiteAssets/app/routes/`
5. Update `index.js` with route registration
6. Upload global CSS

### 3. HTML Entry Point
Create/update SharePoint page at `/SitePages/index.html`

### 4. Testing & Validation
1. Test with RegularUser (send mail, view packages)
2. Test with FacilitiesEmployee (smart card scan, generate QR labels)
3. Test with FacilitiesManager (manage locations, reports)
4. Test smart card reader integration (critical for POC)
5. Print and scan test QR code labels

---

## Critical Files Priority

### Priority 1: Foundation (Day 1)
1. `utils/sharepoint.js` - Core data access layer
2. `utils/permissions.js` - Route authorization
3. `index.js` - Router setup

### Priority 2: Smart Card Scan Workflow (Day 2-3) -- CRITICAL FOR POC
4. `utils/qrcode.js` - QR code generation
5. `utils/pdf.js` - Label printing
6. `components/smartCardInput.js` - Smart card reader integration
7. `components/qrcodeGenerator.js` - Display and print QR codes
8. `components/packageTable.js` - Display pending packages
9. `routes/facilities/scan/route.js` - Core facilities workflow

### Priority 3: User Workflows (Day 3-4)
10. `components/recipientSearch.js` - Recipient autocomplete
11. `components/locationPicker.js` - Location selection
12. `routes/route.js` - Landing page
13. `routes/send-mail/route.js` - Create packages
14. `routes/my-mail/route.js` - View user's packages

### Priority 4: Additional Features (Day 4-5)
15. `routes/facilities/dashboard/route.js` - Facilities overview
16. `routes/help/route.js` - User documentation

### Priority 5: Admin Features (Day 5-6)
17. `routes/facilities/locations/route.js` - Location management
18. `routes/facilities/reports/route.js` - Analytics

---

## Testing Strategy

### Unit Testing
- Test utility functions independently
- Validate QR code generation with various inputs
- Test SharePoint query construction
- Verify permission checking logic

### Integration Testing
- Test complete workflows (send mail -> stored -> deliver)
- Verify smart card scan -> package lookup -> label generation
- Test status updates with timeline logging
- Test re-routing flow (in transit -> stored -> in transit)

### User Acceptance Testing
- Facilities staff test smart card scan workflow
- Regular users test send/track workflows
- Managers test location management
- Test with actual smart card reader hardware (critical)
- Print and scan actual QR code labels
- Test on Microsoft Edge browser

---

## POC Demonstration Flow

### Demo Script for Stakeholders

**Part 1: Regular User Experience (5 minutes)**
1. Show Home page with navigation buttons
2. Navigate to "Send Mail" -- create a package
3. Show "My Mail" view with package status "Created"

**Part 2: Facilities Workflow (10 minutes)**
4. Navigate to "Smart Card Scan & Scan"
5. Demonstrate smart card scan (actual smart card reader)
6. System finds employee and displays pending packages
7. Select packages and click "Generate Labels"
8. Print actual QR code labels
9. Show package status updated to "Stored"
10. Scan printed QR code to update status to "In Transit"
11. Show package timeline with status changes

**Part 3: Location Routing (3 minutes)**
12. Show flat location list (6 offices)
13. Demonstrate re-routing flow (wrong office scenario)
14. Update package to "Delivered"

**Part 4: Admin Features (2 minutes)**
15. Show Manage Locations
16. Show Reports capability

---

## Potential Challenges & Solutions

1. **Smart Card Reader Compatibility**: Support both `input` and `paste` events, configurable debounce, manual fallback
2. **QR Code Scanning**: High-contrast QR codes, 300+ DPI print quality, human-readable tracking number, manual lookup fallback
3. **Large Package Volumes**: Pagination, indexes, date range filters, client-side caching
4. **Browser Print**: Print preview, CSS media queries, cross-browser testing
5. **Network Latency**: Loading indicators, client-side caching, optimistic UI, minimize API calls

---

## Post-MVP Enhancements

- Email/SMS notifications on status changes
- Package photos/attachments
- Mobile-responsive design with camera-based QR scanning
- Advanced analytics dashboard with charts
- External shipping carrier integration (FedEx, UPS)
- Recurring package shipments
- Bulk status updates

---

## Summary

**Estimated Timeline**: 7 days for full implementation and testing

**POC Readiness**: Focus on Priorities 1-2 (Foundation + Smart Card Scan Workflow) for minimum viable POC

**Critical Hardware**: USB smart card reader, label printer (4"x6"), QR code scanner

**Status**: Core POC functionality complete, ready for SharePoint list creation and testing
