# PostHub - SharePoint Setup Guide

This comprehensive guide will walk you through setting up all SharePoint lists, groups, and permissions for the PostHub mail management system. All steps are performed through the SharePoint web interface (no PowerShell required).

**Estimated Setup Time**: 60-90 minutes

---

## Table of Contents

1. [Part 1: SharePoint Groups Setup](#part-1-sharepoint-groups-setup)
2. [Part 2: List Creation Instructions](#part-2-list-creation-instructions)
   - [2.1 Locations List](#21-locations-list)
   - [2.2 Employees List (Update Existing)](#22-employees-list-update-existing)
   - [2.3 Packages List](#23-packages-list)
3. [Part 3: Importing Sample Data](#part-3-importing-sample-data)
4. [Part 4: Verification Checklist](#part-4-verification-checklist)
5. [Troubleshooting](#troubleshooting)

---

## Part 1: SharePoint Groups Setup

SharePoint groups control who can access different parts of the PostHub application. You'll create 3 groups with specific permissions.

### Step 1.1: Create SharePoint Groups

1. Navigate to your SharePoint site
2. Click the **Settings** gear icon (top right) → **Site Settings**
3. Under **Users and Permissions**, click **People and groups**
4. Click **More** → **Groups** in the left navigation
5. Click **New** → **New Group**

#### Group 1: RegularUser

1. **Name**: `RegularUser`
2. **About Me (Description)**: `Regular users who can send and receive mail packages`
3. **Group Settings**:
   - **Who can view the membership**: Group Members
   - **Who can edit the membership**: Group Owner
4. **Membership Requests**:
   - ☑ Allow requests to join/leave this group
   - Auto-accept requests: No
5. **Give Group Permission to this Site**:
   - Select: **Read** (View pages and items)
6. Click **Create**

#### Group 2: FacilitiesEmployee

1. Click **New** → **New Group** (repeat process)
2. **Name**: `FacilitiesEmployee`
3. **About Me (Description)**: `Facilities staff who process, scan, and route packages`
4. **Group Settings**:
   - **Who can view the membership**: Group Members
   - **Who can edit the membership**: Group Owner
5. **Membership Requests**:
   - ☑ Allow requests to join/leave this group
   - Auto-accept requests: No
6. **Give Group Permission to this Site**:
   - Select: **Contribute** (Add, edit, delete list items)
7. Click **Create**

#### Group 3: FacilitiesManager

1. Click **New** → **New Group** (repeat process)
2. **Name**: `FacilitiesManager`
3. **About Me (Description)**: `Facilities managers with admin access to locations and reports`
4. **Group Settings**:
   - **Who can view the membership**: Group Members
   - **Who can edit the membership**: Group Owner
5. **Membership Requests**:
   - ☑ Allow requests to join/leave this group
   - Auto-accept requests: No
6. **Give Group Permission to this Site**:
   - Select: **Full Control** (Has full control)
7. Click **Create**

### Step 1.2: Add Users to Groups

1. Click on the group name (e.g., `RegularUser`)
2. Click **New** → **Add Users to this Group**
3. Enter user names or email addresses in the text box
4. Click **Share**
5. Repeat for all three groups

**Recommended Test Setup**:
- Add yourself to all three groups for testing
- Add 2-3 test users to `RegularUser`
- Add 1-2 test users to `FacilitiesEmployee`
- Add 1 test user to `FacilitiesManager`

### Step 1.3: Verify Group Creation

✅ **Checklist**:
- [ ] RegularUser group created with Read permissions
- [ ] FacilitiesEmployee group created with Contribute permissions
- [ ] FacilitiesManager group created with Full Control permissions
- [ ] Test users added to appropriate groups
- [ ] You can see all three groups in **Site Settings** → **People and groups**

---

## Part 2: List Creation Instructions

You'll create 4 SharePoint lists. **Create them in this order** (due to lookup dependencies):

1. **Locations** (first - no dependencies)
2. **Employees** (second - needs Locations)
3. **Packages** (third - needs Locations and Employees)

**Note**: PostHub uses an embedded Timeline field in the Packages list (JSON array) instead of a separate PackageHistory list for better performance and simpler queries.

---

## 2.1 Locations List

The Locations list stores hierarchical location data (Campus → Building → Room) for package routing.

### Step 2.1.1: Create the List

1. Navigate to your SharePoint site
2. Click **Settings** gear → **Add an app**
3. Click **Custom List**
4. **Name**: `Locations`
5. Click **Create**

### Step 2.1.2: Add Columns

After the list is created, you'll add 8 custom columns. For each column:

1. Open the **Locations** list
2. Click **Settings** gear → **List Settings**
3. Under **Columns**, click **Create column**
4. Follow the specifications below

---

#### Column 1: Campus

| Setting | Value |
|---------|-------|
| **Column name** | `Campus` |
| **Type** | Single line of text |
| **Description** | Campus identifier (e.g., Main Campus, North Campus) |
| **Require information** | No |
| **Enforce unique values** | No |
| **Maximum characters** | 255 |

Click **OK**

---

#### Column 2: Building

| Setting | Value |
|---------|-------|
| **Column name** | `Building` |
| **Type** | Single line of text |
| **Description** | Building identifier (e.g., Building A, Admin Building) |
| **Require information** | No |
| **Maximum characters** | 255 |

Click **OK**

---

#### Column 3: RoomArea

| Setting | Value |
|---------|-------|
| **Column name** | `RoomArea` |
| **Type** | Single line of text |
| **Description** | Room number or area name (e.g., Room 101, Mailroom) |
| **Require information** | No |
| **Maximum characters** | 255 |

Click **OK**

---

#### Column 4: LocationType

| Setting | Value |
|---------|-------|
| **Column name** | `LocationType` |
| **Type** | Single line of text |
| **Description** | Type of location for filtering |
| **Require information** | Yes |
| **Maximum characters** | 100 |

Click **OK**

💡 **Tip**: Valid values are: `Campus`, `Building`, `Mailroom`, `Office`, `Storage`

---

#### Column 5: ParentLocation

| Setting | Value |
|---------|-------|
| **Column name** | `ParentLocation` |
| **Type** | Lookup |
| **Description** | Parent location for hierarchical structure |
| **Require information** | No |
| **Get information from** | Locations (same list) |
| **In this column** | Title |
| **Allow multiple values** | No |

Click **OK**

⚠️ **Important**: This creates a self-referencing lookup for the hierarchy.

---

#### Column 6: IsActive

| Setting | Value |
|---------|-------|
| **Column name** | `IsActive` |
| **Type** | Yes/No (check box) |
| **Description** | Whether this location is currently active |
| **Default value** | Yes |

Click **OK**

---

#### Column 7: FacilitiesContact

| Setting | Value |
|---------|-------|
| **Column name** | `FacilitiesContact` |
| **Type** | Person or Group |
| **Description** | Responsible facilities person for this location |
| **Require information** | No |
| **Allow multiple selections** | No |
| **Allow selection of** | People Only |
| **Choose from** | All Users |

Click **OK**

---

#### Column 8: SortOrder

| Setting | Value |
|---------|-------|
| **Column name** | `SortOrder` |
| **Type** | Number |
| **Description** | Custom sort order for displaying locations |
| **Require information** | No |
| **Min** | 0 |
| **Max** | (leave blank) |
| **Decimal places** | 0 |
| **Default value** | 0 |

Click **OK**

---

### Step 2.1.3: Create Indexed Columns

Indexes improve query performance for frequently filtered columns.

#### Index 1: IsActive

1. Go to **List Settings**
2. Under **Columns**, click **Indexed columns**
3. Click **Create a new index**
4. **Primary Column**: Select `IsActive`
5. **Secondary Column**: None
6. Click **Create**

#### Index 2: LocationType

1. Click **Create a new index** (again)
2. **Primary Column**: Select `LocationType`
3. **Secondary Column**: None
4. Click **Create**

### Step 2.1.4: Verify Locations List

✅ **Checklist**:
- [ ] List named "Locations" exists
- [ ] Title column (default)
- [ ] Campus column (text)
- [ ] Building column (text)
- [ ] RoomArea column (text)
- [ ] LocationType column (text, required)
- [ ] ParentLocation column (lookup to Locations)
- [ ] IsActive column (yes/no, default Yes)
- [ ] FacilitiesContact column (person)
- [ ] SortOrder column (number)
- [ ] Indexed columns: IsActive, LocationType

**Total Columns**: 9 (including Title)

---

## 2.2 Employees List (Update Existing)

The Employees list already exists with basic columns. You'll add 6 new columns for PostHub functionality.

### Step 2.2.1: Open Existing List

1. Navigate to your SharePoint site
2. Click **Site Contents**
3. Click on the **Employees** list

⚠️ **Note**: If the Employees list doesn't exist, create a new Custom List named "Employees" first.

### Step 2.2.2: Verify Existing Columns

Your Employees list should already have:
- **Name** (Single line of text)
- **Email** (Single line of text)
- **Department** (Single line of text)

If these don't exist, create them as Single line of text columns.

### Step 2.2.3: Add New Columns

Follow these steps for each new column:

1. Click **Settings** gear → **List Settings**
2. Under **Columns**, click **Create column**
3. Follow specifications below

---

#### Column 1: BadgeID

| Setting | Value |
|---------|-------|
| **Column name** | `BadgeID` |
| **Type** | Single line of text |
| **Description** | Unique employee badge identifier (used for badge swipe lookup) |
| **Require information** | Yes |
| **Enforce unique values** | Yes |
| **Maximum characters** | 50 |

Click **OK**

⚠️ **Critical**: This column MUST have unique values enabled and be indexed!

---

#### Column 2: OfficeLocation

| Setting | Value |
|---------|-------|
| **Column name** | `OfficeLocation` |
| **Type** | Lookup |
| **Description** | Employee's primary office location |
| **Require information** | No |
| **Get information from** | Locations |
| **In this column** | Title |
| **Allow multiple values** | No |

Click **OK**

⚠️ **CRITICAL**: While not technically required by SharePoint, **every employee MUST have an OfficeLocation assigned** for the PostHub application to function properly. This location is used for:
- Initial package creation (sender's office location)
- Facilities staff operations (current location for status updates)
- Complete audit trail tracking

Without OfficeLocation, users will encounter errors when creating packages or updating package status.

---

#### Column 3: Manager

| Setting | Value |
|---------|-------|
| **Column name** | `Manager` |
| **Type** | Person or Group |
| **Description** | Employee's direct manager |
| **Require information** | No |
| **Allow multiple selections** | No |
| **Allow selection of** | People Only |
| **Choose from** | All Users |

Click **OK**

---

#### Column 4: Building

| Setting | Value |
|---------|-------|
| **Column name** | `Building` |
| **Type** | Single line of text |
| **Description** | Building name for package routing |
| **Require information** | No |
| **Maximum characters** | 100 |

Click **OK**

---

#### Column 5: Campus

| Setting | Value |
|---------|-------|
| **Column name** | `Campus` |
| **Type** | Single line of text |
| **Description** | Campus name for package routing |
| **Require information** | No |
| **Maximum characters** | 100 |

Click **OK**

---

#### Column 6: IsActive

| Setting | Value |
|---------|-------|
| **Column name** | `IsActive` |
| **Type** | Yes/No (check box) |
| **Description** | Whether this employee is currently active |
| **Default value** | Yes |

Click **OK**

---

### Step 2.2.4: Create Indexed Columns

#### Index 1: BadgeID (CRITICAL!)

1. Go to **List Settings**
2. Under **Columns**, click **Indexed columns**
3. Click **Create a new index**
4. **Primary Column**: Select `BadgeID`
5. **Secondary Column**: None
6. Click **Create**

⚠️ **Critical**: This index is essential for fast badge lookup!

#### Index 2: Email

1. Click **Create a new index** (again)
2. **Primary Column**: Select `Email`
3. **Secondary Column**: None
4. Click **Create**

### Step 2.2.5: Verify Employees List

✅ **Checklist**:
- [ ] Name column (text)
- [ ] Email column (text)
- [ ] Department column (text)
- [ ] BadgeID column (text, required, unique, indexed)
- [ ] OfficeLocation column (lookup to Locations)
- [ ] Manager column (person)
- [ ] Building column (text)
- [ ] Campus column (text)
- [ ] IsActive column (yes/no, default Yes)
- [ ] Indexed columns: BadgeID, Email

**Total Columns**: 9 (including Title if present)

---

## 2.3 Packages List

The Packages list is the core data store for all mail/package records.

### Step 2.3.1: Create the List

1. Navigate to your SharePoint site
2. Click **Settings** gear → **Add an app**
3. Click **Custom List**
4. **Name**: `Packages`
5. Click **Create**

### Step 2.3.2: Add Columns

You'll add 11 custom columns (Title column already exists by default).

---

#### Column 1: TrackingNumber

| Setting | Value |
|---------|-------|
| **Column name** | `TrackingNumber` |
| **Type** | Single line of text |
| **Description** | Unique barcode tracking identifier (auto-generated: POSTHUB-YYYYMMDD-XXXXX) |
| **Require information** | Yes |
| **Enforce unique values** | Yes |
| **Maximum characters** | 50 |

Click **OK**

⚠️ **Critical**: Must be unique and indexed!

---

#### Column 2: Sender

| Setting | Value |
|---------|-------|
| **Column name** | `Sender` |
| **Type** | Person or Group |
| **Description** | Package sender (auto-populated from current user) |
| **Require information** | Yes |
| **Allow multiple selections** | No |
| **Allow selection of** | People Only |
| **Choose from** | All Users |

Click **OK**

---

#### Column 3: Recipient

| Setting | Value |
|---------|-------|
| **Column name** | `Recipient` |
| **Type** | Person or Group |
| **Description** | Package recipient |
| **Require information** | Yes |
| **Allow multiple selections** | No |
| **Allow selection of** | People Only |
| **Choose from** | All Users |

Click **OK**

---

#### Column 4: Priority

| Setting | Value |
|---------|-------|
| **Column name** | `Priority` |
| **Type** | Single line of text |
| **Description** | Package priority level |
| **Require information** | No |
| **Maximum characters** | 50 |
| **Default value** | Standard |

Click **OK**

💡 **Tip**: Valid values are: `Standard`, `Urgent`, `Low`

---

#### Column 5: Status

| Setting | Value |
|---------|-------|
| **Column name** | `Status` |
| **Type** | Single line of text |
| **Description** | Current package status |
| **Require information** | Yes |
| **Maximum characters** | 50 |
| **Default value** | Sent |

Click **OK**

💡 **Tip**: Valid values are: `Sent`, `Received`, `Stored`, `In Transit`, `Arrived`, `Delivered`

---

#### Column 6: Timeline

| Setting | Value |
|---------|-------|
| **Column name** | `Timeline` |
| **Type** | Multiple lines of text |
| **Description** | JSON array of status change history |
| **Require information** | No |
| **Number of lines** | 10 |
| **Type of text** | Plain text |
| **Append Changes to Existing Text** | No |

Click **OK**

💡 **Important**: This field stores a JSON array tracking all status changes:
```json
[
  {"status":"Sent","date":"2025-12-03T10:00:00Z","changedBy":"user@company.com","notes":"Package created"},
  {"status":"Received","date":"2025-12-03T14:30:00Z","changedBy":"staff@company.com","location":"Mailroom A","notes":"Label printed"}
]
```

This eliminates the need for a separate PackageHistory list and improves query performance.

---

#### Column 7: CurrentLocation

| Setting | Value |
|---------|-------|
| **Column name** | `CurrentLocation` |
| **Type** | Lookup |
| **Description** | Current location of the package |
| **Require information** | No |
| **Get information from** | Locations |
| **In this column** | Title |
| **Allow multiple values** | No |

Click **OK**

---

#### Column 7: DestinationLocation

| Setting | Value |
|---------|-------|
| **Column name** | `DestinationLocation` |
| **Type** | Lookup |
| **Description** | Final destination location for the package |
| **Require information** | No |
| **Get information from** | Locations |
| **In this column** | Title |
| **Allow multiple values** | No |

Click **OK**

---

#### Column 8: PackageDetails

| Setting | Value |
|---------|-------|
| **Column name** | `PackageDetails` |
| **Type** | Multiple lines of text |
| **Description** | Size, weight, and description of package contents |
| **Require information** | No |
| **Number of lines** | 6 |
| **Type of text** | Plain text |

Click **OK**

---

#### Column 9: Notes

| Setting | Value |
|---------|-------|
| **Column name** | `Notes` |
| **Type** | Multiple lines of text |
| **Description** | General notes and comments |
| **Require information** | No |
| **Number of lines** | 4 |
| **Type of text** | Plain text |

Click **OK**

---

### Step 2.3.3: Create Indexed Columns

#### Index 1: TrackingNumber

1. Go to **List Settings**
2. Under **Columns**, click **Indexed columns**
3. Click **Create a new index**
4. **Primary Column**: Select `TrackingNumber`
5. **Secondary Column**: None
6. Click **Create**

#### Index 2: Status

1. Click **Create a new index**
2. **Primary Column**: Select `Status`
3. **Secondary Column**: None
4. Click **Create**

#### Index 3: Sender

1. Click **Create a new index**
2. **Primary Column**: Select `Sender`
3. **Secondary Column**: None
4. Click **Create**

#### Index 4: Recipient

1. Click **Create a new index**
2. **Primary Column**: Select `Recipient`
3. **Secondary Column**: None
4. Click **Create**

### Step 2.3.4: Verify Packages List

✅ **Checklist**:
- [ ] Title column (default - Package Description)
- [ ] TrackingNumber column (text, required, unique, indexed)
- [ ] Sender column (person, required, indexed)
- [ ] Recipient column (person, required, indexed)
- [ ] Priority column (text)
- [ ] Status column (text, required, indexed)
- [ ] Timeline column (multi-line text, JSON array for audit trail)
- [ ] CurrentLocation column (lookup to Locations)
- [ ] DestinationLocation column (lookup to Locations)
- [ ] PackageDetails column (multi-line text)
- [ ] Notes column (multi-line text)
- [ ] Created column (auto, default)
- [ ] Modified column (auto, default)
- [ ] Indexed columns: TrackingNumber, Status, Sender, Recipient

**Total Columns**: 13 (including Title, Created, Modified)

---

## Part 3: Importing Sample Data

CSV files with sample data are provided in the `sharepoint-data` folder.

### Step 3.1: Import Locations Data

1. Open the **Locations** list
2. Click **Quick Edit** (or **Edit in Grid View**)
3. Copy data from `Locations.csv` and paste into the grid
4. Click **Stop** (exit Quick Edit mode)
5. Verify data appears correctly

💡 **Tip**: Import top-level locations first (Campus), then Buildings, then Rooms. The ParentLocation lookup requires parent items to exist first.

**Alternative Method**:
1. Open the Locations list
2. Click **New** for each location
3. Fill in the form manually
4. Set ParentLocation using the lookup dropdown

### Step 3.2: Import Employee Badge IDs

1. Open the **Employees** list
2. Click **Quick Edit**
3. Copy data from `Employees_Sample.csv` and paste
4. Click **Stop**
5. Verify BadgeID values are unique

⚠️ **Important**: Ensure each employee has a unique BadgeID.

### Step 3.3: Import Sample Packages (Optional)

1. Open the **Packages** list
2. Click **Quick Edit**
3. Copy data from `Packages_Sample.csv` and paste
4. Click **Stop**

💡 **Tip**: You can skip this and create packages through the PostHub application.

---

## Part 4: Verification Checklist

### Step 4.1: List Structure Verification

✅ **All 4 Lists Created**:
- [ ] Locations list (9 columns)
- [ ] Employees list (9 columns)
- [ ] Packages list (12 columns)
- [ ] PackageHistory list (9 columns)

✅ **All Indexes Created**:
- [ ] Locations: IsActive, LocationType
- [ ] Employees: BadgeID, Email
- [ ] Packages: TrackingNumber, Status, Sender, Recipient
- [ ] PackageHistory: PackageID, Timestamp

✅ **All Lookups Working**:
- [ ] Locations.ParentLocation → Locations.Title
- [ ] Employees.OfficeLocation → Locations.Title
- [ ] Packages.CurrentLocation → Locations.Title
- [ ] Packages.DestinationLocation → Locations.Title
- [ ] PackageHistory.PackageID → Packages.Title
- [ ] PackageHistory.Location → Locations.Title

### Step 4.2: Sample Data Verification

✅ **Test Data Present**:
- [ ] Locations list has 10+ locations with hierarchy
- [ ] Employees list has 5+ employees with BadgeIDs
- [ ] Each location has LocationType set
- [ ] Each employee has unique BadgeID
- [ ] At least one campus, building, and room location exists

### Step 4.3: Permissions Verification

✅ **SharePoint Groups**:
- [ ] RegularUser group exists (Read permissions)
- [ ] FacilitiesEmployee group exists (Contribute permissions)
- [ ] FacilitiesManager group exists (Full Control permissions)
- [ ] Test users assigned to groups

### Step 4.4: Test Queries

Run these manual tests to verify setup:

#### Test 1: Badge Lookup
1. Open Employees list
2. Filter by BadgeID (pick any badge from sample data)
3. Verify only one result appears (enforcing uniqueness)

#### Test 2: Location Hierarchy
1. Open Locations list
2. Find a room-level location
3. Check ParentLocation shows correct building
4. Find that building
5. Check ParentLocation shows correct campus

#### Test 3: Active Locations
1. Open Locations list
2. Filter by IsActive = Yes
3. Verify only active locations appear

#### Test 4: Tracking Number Uniqueness
1. Open Packages list
2. Try to create two packages with same TrackingNumber
3. Verify SharePoint prevents duplicate (should show error)

---

## Troubleshooting

### Issue 1: Cannot Create Lookup Column

**Symptom**: The target list doesn't appear in the "Get information from" dropdown

**Solution**:
- Ensure the target list exists first (create Locations before Packages)
- Refresh the page and try again
- Check you have permissions to access the target list

---

### Issue 2: Cannot Enforce Unique Values

**Symptom**: "Enforce unique values" option is grayed out

**Solution**:
- Ensure the column is indexed first (create the column, then add index, then edit column to enforce unique values)
- OR: When creating the column, check both "Indexed" and "Unique" at the same time

---

### Issue 3: Badge Lookup is Slow

**Symptom**: Searching employees by BadgeID takes several seconds

**Solution**:
- Verify BadgeID column is indexed (List Settings → Indexed columns)
- If not indexed, create the index now
- Index must be in place BEFORE adding large amounts of data

---

### Issue 4: Lookup Shows Wrong Column

**Symptom**: ParentLocation shows ID instead of Title

**Solution**:
- Edit the ParentLocation column (List Settings → ParentLocation → Column Settings)
- Change "In this column" to "Title"
- Click OK

---

### Issue 5: Cannot Import CSV Data

**Symptom**: Quick Edit paste doesn't work

**Solution**:
- Use "New Item" form instead (manual entry)
- Verify column types match CSV data types
- Check for special characters in CSV that might cause issues
- Try smaller batches (5-10 rows at a time)

---

### Issue 6: Person/Group Columns Not Resolving

**Symptom**: Names don't auto-complete or resolve correctly

**Solution**:
- Use email addresses instead of display names
- Ensure users exist in SharePoint/Active Directory
- Check "Allow selection of: People Only" is set correctly
- Verify "Choose from: All Users" is selected

---

### Issue 7: Date/Time Not Defaulting

**Symptom**: Timestamp column doesn't auto-populate

**Solution**:
- Edit column settings
- Set "Default value" to "(Today)" for date or "[Today] + [Current Time]" for date/time
- Note: This only applies to new items, not existing ones

---

### Issue 8: Groups Don't Have Correct Permissions

**Symptom**: Users can't access lists or see SharePoint groups

**Solution**:
- Go to Site Settings → Site Permissions
- Verify each group has correct permission level
- Check users are actually members of the groups (People and Groups → Group Name → View membership)
- Try removing and re-adding users to groups

---

## Summary

You've successfully set up SharePoint for PostHub! Here's what you created:

**SharePoint Groups**: 3
- RegularUser (Read)
- FacilitiesEmployee (Contribute)
- FacilitiesManager (Full Control)

**SharePoint Lists**: 4
- Locations (9 columns, 2 indexes)
- Employees (9 columns, 2 indexes)
- Packages (12 columns, 4 indexes)
- PackageHistory (9 columns, 2 indexes)

**Total Indexed Columns**: 10 (critical for performance)

**Next Steps**:
1. Review the Quick Start Checklist (`SHAREPOINT_QUICKSTART.md`)
2. Test the PostHub application with your new SharePoint setup
3. Add additional employees and locations as needed
4. Configure badge reader hardware for facilities workflow
5. Print test barcode labels

---

## Need Help?

**Common Resources**:
- SharePoint List Settings: Settings gear → List Settings
- View Columns: List Settings → Columns section
- View Indexes: List Settings → Indexed columns
- View Permissions: Settings gear → Site Settings → People and groups

**Best Practices**:
- Always index columns used in frequent queries or filters
- Keep lookup chains simple (avoid lookup of lookup of lookup)
- Use unique values on key identifier columns (BadgeID, TrackingNumber)
- Test with sample data before adding production data
- Back up list data regularly (export to Excel)

**POC Testing**:
- Test badge swipe with actual hardware
- Print and scan barcode labels
- Verify all user groups can access appropriate features
- Test on Microsoft Edge browser (primary target)
- Have at least 5 test employees with badge IDs
- Have at least 10 test locations spanning the hierarchy

Good luck with your PostHub implementation!
