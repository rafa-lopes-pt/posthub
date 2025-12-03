# CSV Import Guide for PostHub Sample Data

This guide explains how to import the sample CSV data into your SharePoint lists.

---

## Overview

Three CSV files are provided:
1. **Locations.csv** - 17 sample locations with hierarchical structure
2. **Employees_Sample.csv** - 10 test employees with badge IDs
3. **Packages_Sample.csv** - 4 test packages (optional)

---

## Import Order (IMPORTANT!)

Import data in this specific order due to lookup dependencies:

1. **Locations** first (no dependencies)
2. **Employees** second (needs Locations for OfficeLocation lookup)
3. **Packages** third (needs Locations and Employees for lookups)

---

## Method 1: Quick Edit (Grid View) - Recommended

### Step-by-Step for Each List

#### 1. Prepare Your Data

Open the CSV file in a text editor or Excel:
- **Locations.csv** - Note the ParentLocation values
- **Employees_Sample.csv** - Check BadgeID values are unique
- **Packages_Sample.csv** - Update Sender/Recipient emails to match your users

#### 2. Import Locations Data

**Important**: Import in phases due to ParentLocation dependencies.

**Phase 1: Import Campus Locations (no parent)**
1. Open **Locations** list in SharePoint
2. Click **Quick Edit** (or **Edit in Grid View** in ribbon)
3. Copy these rows from Locations.csv:
   ```
   Main Campus,Main Campus,,,Campus,,Yes,1
   North Campus,North Campus,,,Campus,,Yes,2
   ```
4. Paste into the grid (leave ParentLocation empty for campuses)
5. Click outside the grid to save
6. Click **Stop** to exit Quick Edit

**Phase 2: Import Building Locations (parent = campus)**
1. Click **Quick Edit** again
2. Copy building rows from Locations.csv:
   ```
   Building A,Main Campus,Building A,,Building,Main Campus,Yes,10
   Building B,Main Campus,Building B,,Building,Main Campus,Yes,11
   Building C,Main Campus,Building C,,Building,Main Campus,Yes,12
   North Building 1,North Campus,North Building 1,,Building,North Campus,Yes,20
   ```
3. Paste into grid
4. For ParentLocation column, click the dropdown and select:
   - Building A → Main Campus
   - Building B → Main Campus
   - Building C → Main Campus
   - North Building 1 → North Campus
5. Click **Stop** to exit

**Phase 3: Import Room/Mailroom Locations (parent = building)**
1. Click **Quick Edit** again
2. Copy remaining rows (rooms, mailrooms, offices) from Locations.csv
3. Paste into grid
4. For each row, set ParentLocation using dropdown:
   - Mailroom A → Building A
   - Mailroom B → Building B
   - Room 101 → Building A
   - Room 102 → Building A
   - Room 103 → Building A
   - Room 201 → Building B
   - Room 202 → Building B
   - Conference Room A → Building A
   - Storage Room 1 → Building C
   - North Mailroom → North Building 1
   - North Office 100 → North Building 1
5. Click **Stop** to exit

#### 3. Import Employees Data

1. Open **Employees** list
2. Click **Quick Edit**
3. Open **Employees_Sample.csv** in Excel or text editor
4. Copy all 10 employee rows (excluding header)
5. Paste into SharePoint grid
6. For **OfficeLocation** column, click dropdown for each row:
   - John Smith → Room 101
   - Sarah Johnson → Room 102
   - Michael Chen → Room 201
   - Emily Davis → Room 202
   - Robert Martinez → North Office 100
   - Lisa Anderson → Room 103
   - David Wilson → Conference Room A
   - Jennifer Taylor → Room 201
   - James Brown → Room 102
   - Maria Garcia → Mailroom A
7. Leave **Manager** column empty (or assign if needed)
8. Verify **BadgeID** values are unique (BADGE001 through BADGE010)
9. Click **Stop** to exit

#### 4. Import Packages Data (Optional)

⚠️ **Important**: Update email addresses in Packages_Sample.csv to match your actual users first!

1. Open **Packages** list
2. Click **Quick Edit**
3. Copy package rows from Packages_Sample.csv
4. Paste into grid
5. For **Sender** and **Recipient** columns, type email addresses:
   - Start typing the email
   - SharePoint will auto-complete
   - Press Tab to accept
6. For **CurrentLocation** and **DestinationLocation**, use dropdown:
   - Package 1: Current → Mailroom A, Destination → Room 102
   - Package 2: Current → Mailroom B, Destination → Room 201
   - Package 3: Current → Mailroom A, Destination → Conference Room A
   - Package 4: Current → North Mailroom, Destination → Room 201
7. Click **Stop** to exit

---

## Method 2: Manual Entry (New Item Form)

If Quick Edit doesn't work, use the standard New Item form:

### For Locations:
1. Click **New** in Locations list
2. Fill in form fields:
   - **Title**: Main Campus
   - **Campus**: Main Campus
   - **LocationType**: Campus
   - **IsActive**: Yes
   - **SortOrder**: 1
   - Leave other fields blank
3. Click **Save**
4. Repeat for all 17 locations (remember to set ParentLocation for buildings/rooms)

### For Employees:
1. Click **New** in Employees list
2. Fill in form fields:
   - **Name**: John Smith
   - **Email**: john.smith@company.com
   - **Department**: Engineering
   - **BadgeID**: BADGE001
   - **OfficeLocation**: Room 101 (lookup)
   - **Building**: Building A
   - **Campus**: Main Campus
   - **IsActive**: Yes
3. Click **Save**
4. Repeat for all 10 employees

### For Packages:
1. Click **New** in Packages list
2. Fill in all fields from CSV
3. Click **Save**
4. Repeat for all 4 packages

---

## Method 3: Excel Import (Alternative)

### Step 1: Open CSV in Excel
1. Open the CSV file in Microsoft Excel
2. Ensure columns match SharePoint column names exactly

### Step 2: Copy to SharePoint
1. Select all data rows (excluding header)
2. Copy (Ctrl+C)
3. Open SharePoint list
4. Click **Quick Edit**
5. Click in first empty row
6. Paste (Ctrl+V)
7. Fix any lookup columns manually (they won't paste correctly)
8. Click **Stop**

---

## Data Reference

### Locations.csv Structure (17 rows)

**Campus Locations** (2):
- Main Campus
- North Campus

**Building Locations** (4):
- Building A (Main Campus)
- Building B (Main Campus)
- Building C (Main Campus)
- North Building 1 (North Campus)

**Mailroom Locations** (3):
- Mailroom A (Building A)
- Mailroom B (Building B)
- North Mailroom (North Building 1)

**Office Locations** (7):
- Room 101, 102, 103 (Building A)
- Room 201, 202 (Building B)
- Conference Room A (Building A)
- North Office 100 (North Building 1)

**Storage Locations** (1):
- Storage Room 1 (Building C)

### Employees_Sample.csv Structure (10 rows)

Badge IDs: **BADGE001** through **BADGE010**

Departments:
- Engineering (3)
- Marketing (1)
- Finance (1)
- Human Resources (1)
- Operations (1)
- Sales (1)
- Customer Service (1)
- IT Support (1)
- Facilities (1)

### Packages_Sample.csv Structure (4 rows)

Tracking Numbers:
- POSTHUB-20251203-00001
- POSTHUB-20251203-00002
- POSTHUB-20251203-00003
- POSTHUB-20251203-00004

All packages have Status: **Sent**

---

## Verification After Import

### Verify Locations
1. Open Locations list
2. Sort by **SortOrder** column (ascending)
3. Check hierarchy:
   - View "Room 101" → ParentLocation should show "Building A"
   - View "Building A" → ParentLocation should show "Main Campus"
   - View "Main Campus" → ParentLocation should be empty
4. Count: Should have 17 total locations
5. Filter by LocationType = "Office" → Should show 7 offices
6. Filter by IsActive = Yes → Should show all 17

### Verify Employees
1. Open Employees list
2. Check all 10 employees imported
3. Verify each has unique BadgeID (BADGE001-BADGE010)
4. Click on an employee → OfficeLocation should show location name (not ID)
5. Try filtering by BadgeID = "BADGE001" → Should return John Smith only
6. Check IsActive = Yes for all employees

### Verify Packages
1. Open Packages list
2. Check all 4 packages imported
3. Verify each has unique TrackingNumber
4. Click on a package → Sender/Recipient should show person names
5. CurrentLocation and DestinationLocation should show location names
6. All packages should have Status = "Sent"

---

## Troubleshooting Import Issues

### Issue: Lookup Columns Show #REF! or Error

**Cause**: Target item doesn't exist yet

**Solution**:
- Ensure parent items are created first (Locations before Packages)
- Check spelling of lookup values matches exactly
- Manually select from dropdown instead of pasting

---

### Issue: Person Columns Don't Resolve

**Cause**: Email address doesn't exist in SharePoint/AD

**Solution**:
- Use actual email addresses from your organization
- Update CSV file before importing
- Type email addresses manually in Quick Edit (with auto-complete)

---

### Issue: "Column 'BadgeID' Must Be Unique" Error

**Cause**: Duplicate BadgeID values in import

**Solution**:
- Check CSV for duplicate badge IDs
- Import one row at a time if needed
- Verify uniqueness constraint is set correctly on BadgeID column

---

### Issue: Quick Edit Paste Doesn't Work

**Cause**: Browser or SharePoint limitations

**Solution**:
- Try smaller batches (5 rows at a time)
- Use manual entry via New Item form
- Paste into Excel first, then copy to SharePoint
- Try different browser (Microsoft Edge recommended)

---

### Issue: Date/Time Columns Show Wrong Format

**Cause**: Regional settings mismatch

**Solution**:
- Check Site Settings → Regional Settings
- Use ISO format: YYYY-MM-DD HH:MM
- Or use Quick Edit with dropdown calendar

---

### Issue: ParentLocation Shows ID Instead of Title

**Cause**: Lookup column configured to show ID field

**Solution**:
1. Go to List Settings
2. Click ParentLocation column
3. Change "In this column" to "Title"
4. Click OK

---

## Best Practices

1. **Always import in order**: Locations → Employees → Packages
2. **Import parent items first**: Campus before Buildings before Rooms
3. **Verify each batch**: Check data after each import before moving to next
4. **Use actual email addresses**: Replace sample emails with real users
5. **Test badge lookup**: After importing employees, test badge search works fast
6. **Keep a backup**: Save original CSV files before editing
7. **Start small**: Import 2-3 rows first to test, then import all
8. **Use Quick Edit for bulk**: Manual entry for complex lookups
9. **Check indexes**: Ensure BadgeID and TrackingNumber are indexed before importing large datasets
10. **Clean up test data**: Delete test packages after verifying application works

---

## Adding More Data

After importing the sample data, you can add more:

### Add More Locations
1. Follow the hierarchy: Campus → Building → Room
2. Always set ParentLocation correctly
3. Set appropriate LocationType (Campus, Building, Mailroom, Office, Storage)
4. Set SortOrder for custom ordering (multiples of 10 recommended)

### Add More Employees
1. Ensure each BadgeID is unique
2. Format: BADGE### (e.g., BADGE011, BADGE012)
3. Link OfficeLocation to existing locations
4. Set Building and Campus to match OfficeLocation
5. Set IsActive = Yes for active employees

### Add More Packages
1. Use tracking number format: POSTHUB-YYYYMMDD-#####
2. Ensure TrackingNumbers are unique
3. Set Status = "Sent" for new packages
4. Set Priority = Standard/Urgent/Low
5. Link CurrentLocation and DestinationLocation to valid locations

---

## CSV File Encoding

If you have issues with special characters:

1. Save CSV as **UTF-8 encoding** in your text editor
2. In Excel: **Save As** → **CSV UTF-8 (Comma delimited) (.csv)**
3. Avoid special characters in key fields (BadgeID, TrackingNumber)
4. Test with ASCII characters first, then add international characters

---

## Need Help?

**Common Commands**:
- Copy: Ctrl+C (Windows) / Cmd+C (Mac)
- Paste: Ctrl+V (Windows) / Cmd+V (Mac)
- Save in Quick Edit: Click outside grid or press Tab
- Cancel Quick Edit: Click **Stop** button

**Where to Find Files**:
- All CSV files are in: `/home/rafalopes/Desktop/coding/sharepoint-dev/posthub/sharepoint-data/`
- View files before importing to understand structure

**Resources**:
- Main setup guide: `SHAREPOINT_SETUP_GUIDE.md`
- Quick checklist: `SHAREPOINT_QUICKSTART.md`

---

## Summary

You've successfully imported sample data when:
- ✅ 17 locations with proper hierarchy
- ✅ 10 employees with unique badge IDs
- ✅ 4 test packages (optional)
- ✅ All lookups display names (not IDs)
- ✅ Badge lookup returns results in < 2 seconds
- ✅ No duplicate BadgeID or TrackingNumber values

Your SharePoint lists are now ready for PostHub application testing!
