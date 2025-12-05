# PostHub - SharePoint Quick Start Checklist

This condensed checklist provides a quick reference for setting up SharePoint for PostHub. For detailed step-by-step instructions, refer to `SHAREPOINT_SETUP_GUIDE.md`.

**Estimated Time**: 60-90 minutes

---

## Phase 1: SharePoint Groups (10 minutes)

- [ ] Create `RegularUser` group with **Read** permissions
- [ ] Create `FacilitiesEmployee` group with **Contribute** permissions
- [ ] Create `FacilitiesManager` group with **Full Control** permissions
- [ ] Add test users to each group (minimum 2 users per group)
- [ ] Verify all 3 groups visible in Site Settings → People and groups

---

## Phase 2: Locations List (15 minutes)

### Create List
- [ ] Create Custom List named `Locations`

### Add Columns (9 total)
- [ ] Title (default - exists)
- [ ] Campus (text)
- [ ] Building (text)
- [ ] RoomArea (text)
- [ ] LocationType (text, required)
- [ ] ParentLocation (lookup to Locations)
- [ ] IsActive (yes/no, default: Yes)
- [ ] FacilitiesContact (person)
- [ ] SortOrder (number)

### Add Indexes
- [ ] Index on IsActive
- [ ] Index on LocationType

### Add Sample Data
- [ ] Import data from `sharepoint-data/Locations.csv` (17 locations)
- [ ] Verify hierarchy: Main Campus → Building A → Room 101

---

## Phase 3: Employees List (15 minutes)

### Update Existing List
- [ ] Open existing `Employees` list (or create new Custom List)

### Verify Existing Columns
- [ ] Name (text)
- [ ] Email (text)
- [ ] Department (text)

### Add New Columns (6 total)
- [ ] BadgeID (text, required, unique) ⚠️ CRITICAL
- [ ] OfficeLocation (lookup to Locations) ⚠️ CRITICAL - Required for all employees
- [ ] Manager (person)
- [ ] Building (text)
- [ ] Campus (text)
- [ ] IsActive (yes/no, default: Yes)

### Add Indexes
- [ ] Index on BadgeID ⚠️ CRITICAL FOR BADGE SWIPE
- [ ] Index on Email

### Add Sample Data
- [ ] Import data from `sharepoint-data/Employees_Sample.csv` (10 employees)
- [ ] Verify each employee has unique BadgeID
- [ ] **CRITICAL:** Verify each employee has OfficeLocation assigned (required for package operations)

---

## Phase 4: Packages List (15 minutes)

### Create List
- [ ] Create Custom List named `Packages`

### Add Columns (12 total including defaults)
- [ ] Title (default - Package Description)
- [ ] TrackingNumber (text, required, unique)
- [ ] Sender (person, required)
- [ ] Recipient (person, required)
- [ ] Priority (text, default: Standard)
- [ ] Status (text, required, default: Sent)
- [ ] CurrentLocation (lookup to Locations)
- [ ] DestinationLocation (lookup to Locations)
- [ ] PackageDetails (multi-line text)
- [ ] Notes (multi-line text)
- [ ] Created (auto)
- [ ] Modified (auto)

### Add Indexes
- [ ] Index on TrackingNumber
- [ ] Index on Status
- [ ] Index on Sender
- [ ] Index on Recipient

### Add Sample Data (Optional)
- [ ] Import data from `sharepoint-data/Packages_Sample.csv` (4 test packages)

---

## Phase 5: Verification (10 minutes)

### List Structure
- [ ] All 3 lists created (Locations, Employees, Packages)
- [ ] All columns present with correct types
- [ ] All 8 indexes created across all lists
- [ ] Packages.Timeline field ready for audit trail (JSON array)

### Lookups Working
- [ ] Locations.ParentLocation shows location names
- [ ] Employees.OfficeLocation shows location names
- [ ] Packages.CurrentLocation shows location names
- [ ] Packages.DestinationLocation shows location names

### Sample Data
- [ ] 15+ locations imported with hierarchy
- [ ] 10+ employees with unique BadgeIDs
- [ ] At least 1 Campus, 2 Buildings, 5 Rooms/Offices

### Test Queries
- [ ] Filter Employees by BadgeID → returns 1 result quickly
- [ ] Filter Locations by IsActive = Yes → shows only active
- [ ] Filter Locations by LocationType = Office → shows only offices
- [ ] View Locations → ParentLocation displays correctly (not IDs)

---

## Phase 7: Permissions Testing (5 minutes)

### Test Access by Group
- [ ] Login as RegularUser → Can view lists (Read only)
- [ ] Login as FacilitiesEmployee → Can add/edit items (Contribute)
- [ ] Login as FacilitiesManager → Can manage lists (Full Control)

---

## Critical Success Metrics

✅ **Must Have for POC**:
- [ ] BadgeID column is indexed (test badge lookup speed < 2 seconds)
- [ ] TrackingNumber enforces uniqueness (try creating duplicate)
- [ ] All 3 user groups exist with correct permissions
- [ ] Location hierarchy works (Room → Building → Campus)
- [ ] All lookup columns display names (not IDs)
- [ ] At least 5 employees with badge IDs for testing
- [ ] **ALL employees have OfficeLocation assigned** (required for package operations)
- [ ] At least 10 locations covering multiple buildings

---

## Quick Reference: Column Counts

| List | Total Columns | Custom Columns | Indexes |
|------|---------------|----------------|---------|
| Locations | 9 | 8 | 2 |
| Employees | 9 | 6 new (3 existing) | 2 |
| Packages | 12 | 9 | 4 |
| PackageHistory | 9 | 8 | 2 |
| **TOTAL** | **39** | **31** | **10** |

---

## Quick Reference: Valid Values

### Package Priority
- Standard (default)
- Urgent
- Low

### Package Status
- Sent (default)
- Received
- Stored
- In Transit
- Arrived
- Delivered

### Location Types
- Campus
- Building
- Mailroom
- Office
- Storage

---

## Common Mistakes to Avoid

⚠️ **Don't Skip These**:
- [ ] Creating Locations BEFORE Packages (lookup dependency)
- [ ] Creating Locations BEFORE adding Employees (OfficeLocation dependency)
- [ ] Indexing BadgeID column (critical for performance)
- [ ] Enforcing unique values on BadgeID and TrackingNumber
- [ ] Setting IsActive default to "Yes" (not empty)
- [ ] Selecting "Include TrackingNumber" when creating PackageID lookup
- [ ] **Assigning OfficeLocation to ALL employees** (critical for package operations)
- [ ] Testing with actual badge reader hardware before POC

---

## Next Steps After Setup

1. Review detailed guide: `SHAREPOINT_SETUP_GUIDE.md`
2. Test PostHub application with your SharePoint lists
3. Configure badge reader hardware for facilities staff
4. Add more employees and locations as needed
5. Conduct end-to-end workflow test:
   - User creates package → Status: Sent
   - Facilities badge swipe → Finds employee's packages
   - Generate barcode labels → Print PDF
   - Scan barcode → Update status to Received
   - Move through locations → Track in PackageHistory

---

## Troubleshooting Quick Fixes

**Badge lookup is slow?**
→ Index BadgeID column immediately

**Lookup shows IDs instead of names?**
→ Edit column → Change "In this column" to "Title"

**Can't enforce unique values?**
→ Index the column first, then edit to add uniqueness

**CSV import not working?**
→ Use Quick Edit grid view, paste smaller batches (5-10 rows)

**Person field not resolving?**
→ Use email addresses instead of names

**Tracking number duplicates allowed?**
→ Edit column → Check "Enforce unique values" → Save

---

## Ready for POC?

### Pre-POC Checklist
- [ ] All SharePoint lists created and verified
- [ ] Sample data imported (10+ employees, 15+ locations)
- [ ] Badge reader hardware tested with BadgeID lookup
- [ ] Barcode printer configured (4" x 6" labels)
- [ ] Barcode scanner tested with CODE128 format
- [ ] Test users assigned to all 3 SharePoint groups
- [ ] PostHub application deployed to SiteAssets
- [ ] End-to-end workflow tested successfully
- [ ] Tested on Microsoft Edge browser
- [ ] Backup of SharePoint lists created

### POC Demo Flow (20 minutes)
1. **User sends package** (2 min) → Show Send Mail form
2. **Badge swipe** (5 min) → Live badge reader demo
3. **Generate labels** (5 min) → Print actual barcode labels
4. **Scan barcode** (3 min) → Update package status
5. **Track history** (2 min) → Show audit trail
6. **Admin features** (3 min) → Manage locations, reports

---

## Support Resources

**SharePoint List Management**:
- Site Settings → Site Contents → [List Name] → List Settings

**View Indexes**:
- List Settings → Indexed columns

**Manage Permissions**:
- Settings gear → Site Settings → People and groups

**Export List to Excel**:
- List → Export → Export to Excel (for backups)

**Re-index a Column**:
- List Settings → Indexed columns → Create new index

---

## Success!

When all checkboxes are complete, your SharePoint environment is ready for PostHub. Proceed to application deployment and testing.

**Total Items to Check**: 80+ individual steps
**Lists Created**: 4
**Columns Created**: 31
**Indexes Created**: 10
**Groups Created**: 3

Good luck with your POC presentation!
