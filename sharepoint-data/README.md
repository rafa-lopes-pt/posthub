# PostHub Sample Data Files

This directory contains CSV sample data files for importing into SharePoint lists.

---

## Files in This Directory

| File | Purpose | Row Count | Dependencies |
|------|---------|-----------|--------------|
| **Locations.csv** | Sample location hierarchy | 17 | None - Import first |
| **Employees_Sample.csv** | Test employee records | 10 | Requires Locations |
| **Packages_Sample.csv** | Test package records | 4 | Requires Locations & Employees |
| **CSV_IMPORT_GUIDE.md** | Detailed import instructions | - | - |

---

## Quick Start

### Import Order (Important!)

1. **Locations.csv** → Import in 3 phases:
   - Phase 1: Campus locations (no parent)
   - Phase 2: Building locations (parent = campus)
   - Phase 3: Room/mailroom locations (parent = building)

2. **Employees_Sample.csv** → Update email addresses to match your users

3. **Packages_Sample.csv** → Optional, for testing only

### Import Method

Use SharePoint **Quick Edit** (Grid View):
1. Open the list in SharePoint
2. Click **Quick Edit**
3. Copy rows from CSV
4. Paste into grid
5. Set lookup columns manually (dropdowns)
6. Click **Stop** to save

Detailed instructions: See `CSV_IMPORT_GUIDE.md`

---

## Data Overview

### Locations (17 total)

**Hierarchy Structure**:
```
Main Campus (Campus)
├── Building A (Building)
│   ├── Mailroom A (Mailroom)
│   ├── Room 101 (Office)
│   ├── Room 102 (Office)
│   ├── Room 103 (Office)
│   └── Conference Room A (Office)
├── Building B (Building)
│   ├── Mailroom B (Mailroom)
│   ├── Room 201 (Office)
│   └── Room 202 (Office)
└── Building C (Building)
    └── Storage Room 1 (Storage)

North Campus (Campus)
└── North Building 1 (Building)
    ├── North Mailroom (Mailroom)
    └── North Office 100 (Office)
```

**Location Types**:
- 2 Campuses
- 4 Buildings
- 3 Mailrooms
- 7 Offices
- 1 Storage

---

### Employees (10 total)

**Badge IDs**: BADGE001 through BADGE010

**Departments Represented**:
- Engineering (3 employees)
- Marketing (1)
- Finance (1)
- Human Resources (1)
- Operations (1)
- Sales (1)
- Customer Service (1)
- IT Support (1)
- Facilities (1)

**Sample Records**:
| Name | BadgeID | Department | Location |
|------|---------|------------|----------|
| John Smith | BADGE001 | Engineering | Room 101 |
| Sarah Johnson | BADGE002 | Marketing | Room 102 |
| Michael Chen | BADGE003 | Finance | Room 201 |
| Emily Davis | BADGE004 | Human Resources | Room 202 |
| Robert Martinez | BADGE005 | Operations | North Office 100 |

---

### Packages (4 test packages)

**Tracking Numbers**: POSTHUB-20251203-00001 through 00004

**Priority Levels**:
- 1 Urgent
- 2 Standard
- 1 Low

**All packages have Status**: Sent (pending pickup)

---

## Customization

### Before Importing Employees
Update these columns to match your organization:
- **Email**: Replace with actual user email addresses
- **Department**: Adjust department names as needed
- **Manager**: Assign actual managers (optional)

### Before Importing Packages
Update these columns:
- **Sender**: Use actual user email addresses
- **Recipient**: Use actual user email addresses
- **TrackingNumber**: Use today's date (POSTHUB-YYYYMMDD-#####)

### Adding More Data

**Add More Locations**:
- Follow hierarchy: Campus → Building → Room
- Set ParentLocation correctly
- Use SortOrder for custom display order
- Valid LocationTypes: Campus, Building, Mailroom, Office, Storage

**Add More Employees**:
- Use unique BadgeID (format: BADGE###)
- Ensure BadgeID is unique across all employees
- Set IsActive = Yes for active employees
- Link OfficeLocation to existing location

**Add More Packages**:
- Use unique TrackingNumber (format: POSTHUB-YYYYMMDD-#####)
- Valid Priorities: Standard, Urgent, Low
- Valid Statuses: Sent, Received, Stored, In Transit, Arrived, Delivered
- Link CurrentLocation and DestinationLocation to existing locations

---

## Validation

After importing, verify:

**Locations**:
- ✅ 17 total locations imported
- ✅ Hierarchy works: Room → Building → Campus
- ✅ ParentLocation shows names (not IDs)
- ✅ All have IsActive = Yes

**Employees**:
- ✅ 10 employees imported
- ✅ All BadgeIDs are unique (BADGE001-BADGE010)
- ✅ OfficeLocation shows location names (not IDs)
- ✅ All have IsActive = Yes
- ✅ Badge search by BadgeID returns results in < 2 seconds

**Packages** (if imported):
- ✅ 4 packages imported
- ✅ All TrackingNumbers are unique
- ✅ Sender/Recipient show person names (not IDs)
- ✅ CurrentLocation/DestinationLocation show location names
- ✅ All have Status = Sent

---

## Testing Scenarios

Use this sample data to test PostHub features:

### Scenario 1: Badge Swipe Lookup
1. Use badge reader or manually enter: **BADGE001**
2. System should find: John Smith
3. Show his pending packages (if any exist)
4. Should complete in < 2 seconds

### Scenario 2: Package Routing
1. Create package for Sarah Johnson (Room 102)
2. Set CurrentLocation: Mailroom A
3. Set DestinationLocation: Room 102
4. Track package as it moves:
   - Mailroom A → Building A → Room 102

### Scenario 3: Multi-Campus Delivery
1. Create package for Robert Martinez (North Campus)
2. Set CurrentLocation: Mailroom A (Main Campus)
3. Set DestinationLocation: North Office 100 (North Campus)
4. Track inter-campus routing

### Scenario 4: Location Hierarchy
1. Search for all Building A locations
2. Filter by Campus = "Main Campus"
3. Show hierarchy tree view
4. Edit Room 101 → Change ParentLocation to Building B

### Scenario 5: Employee Badge Management
1. Add new employee with BadgeID: BADGE011
2. Try to add another employee with BADGE011 (should fail - duplicate)
3. Search all employees in Building A
4. Filter by IsActive = Yes

---

## File Formats

All CSV files use:
- **Encoding**: UTF-8
- **Delimiter**: Comma (,)
- **Line Ending**: LF (Unix style)
- **Header Row**: Yes (first row)

---

## Troubleshooting

**Problem**: Can't import CSV data

**Solutions**:
1. Check file encoding is UTF-8
2. Verify column names match SharePoint exactly
3. Try smaller batches (5 rows at a time)
4. Use manual entry via New Item form

**Problem**: Lookup columns show errors

**Solutions**:
1. Ensure target list has data first
2. Check spelling matches exactly
3. Use dropdown selection instead of paste
4. Import parent items before child items

**Problem**: Badge lookup is slow

**Solutions**:
1. Verify BadgeID column is indexed
2. Check "Enforce unique values" is enabled
3. Re-index the column if needed
4. Test with fewer than 1000 employees first

---

## Best Practices

1. **Test First**: Import 2-3 rows to test, then import all
2. **Backup Data**: Keep original CSV files unchanged
3. **Use Real Emails**: Replace sample emails with actual users
4. **Check Indexes**: Verify indexed columns before bulk import
5. **Validate Lookups**: Ensure all lookup columns display names (not IDs)
6. **Clean Test Data**: Delete test packages after POC demonstration
7. **Gradual Expansion**: Start with sample data, add more as needed
8. **Document Changes**: Keep notes of any customizations

---

## Related Documentation

- **Setup Guide**: `../SHAREPOINT_SETUP_GUIDE.md` - Complete setup instructions
- **Quick Start**: `../SHAREPOINT_QUICKSTART.md` - Condensed checklist
- **Import Guide**: `CSV_IMPORT_GUIDE.md` - Detailed import instructions
- **Implementation Plan**: `../IMPLEMENTATION_PLAN.md` - Full project overview

---

## Support

**Need Help?**
- Review `CSV_IMPORT_GUIDE.md` for detailed import steps
- Check `SHAREPOINT_SETUP_GUIDE.md` for troubleshooting section
- Verify all SharePoint lists are created before importing
- Ensure indexes are in place (especially BadgeID)

**Common Import Issues**:
- Lookup columns → Use dropdowns, not paste
- Person columns → Use email addresses
- Unique constraints → Check BadgeID and TrackingNumber
- Hierarchy → Import parents before children

---

## Summary

This sample data provides:
- ✅ Complete location hierarchy for testing routing
- ✅ 10 test employees with unique badge IDs
- ✅ 4 test packages for workflow testing
- ✅ Realistic organizational structure
- ✅ Inter-campus and intra-campus scenarios
- ✅ Multiple location types (Campus, Building, Mailroom, Office, Storage)

**Ready to Import**: Follow the import order and use `CSV_IMPORT_GUIDE.md` for step-by-step instructions.

**Next Steps**: After importing, run the verification checklist and test badge lookup performance!
