# PostHub - SharePoint Setup Guide

This guide walks you through setting up all SharePoint lists, groups, and permissions for the PostHub mail management system. All steps are performed through the SharePoint web interface (no PowerShell required).

> **Note:** SPARC's `createField` only supports **Text** and **Note** (multiline text) field types. All columns in PostHub lists use these two types exclusively -- no Lookup, Person/Group, Yes/No, Number, or Choice columns.

**Estimated Setup Time**: 30-45 minutes

---

## Table of Contents

1. [Part 1: SharePoint Groups Setup](#part-1-sharepoint-groups-setup)
2. [Part 2: List Creation Instructions](#part-2-list-creation-instructions)
   - [2.1 Locations List](#21-locations-list)
   - [2.2 Employees List](#22-employees-list)
   - [2.3 Packages List](#23-packages-list)
3. [Part 3: Importing Sample Data](#part-3-importing-sample-data)
4. [Part 4: Verification Checklist](#part-4-verification-checklist)
5. [Troubleshooting](#troubleshooting)

---

## Part 1: SharePoint Groups Setup

SharePoint groups control who can access different parts of the PostHub application. You'll create 3 groups with specific permissions.

### Step 1.1: Create SharePoint Groups

1. Navigate to your SharePoint site
2. Click the **Settings** gear icon (top right) -> **Site Settings**
3. Under **Users and Permissions**, click **People and groups**
4. Click **More** -> **Groups** in the left navigation
5. Click **New** -> **New Group**

#### Group 1: RegularUser

1. **Name**: `RegularUser`
2. **About Me (Description)**: `Regular users who can send and receive mail packages`
3. **Group Settings**:
   - **Who can view the membership**: Group Members
   - **Who can edit the membership**: Group Owner
4. **Membership Requests**:
   - Allow requests to join/leave this group: Yes
   - Auto-accept requests: No
5. **Give Group Permission to this Site**:
   - Select: **Read** (View pages and items)
6. Click **Create**

#### Group 2: FacilitiesEmployee

1. Click **New** -> **New Group** (repeat process)
2. **Name**: `FacilitiesEmployee`
3. **About Me (Description)**: `Facilities staff who process, scan, and route packages`
4. **Group Settings**:
   - **Who can view the membership**: Group Members
   - **Who can edit the membership**: Group Owner
5. **Membership Requests**:
   - Allow requests to join/leave this group: Yes
   - Auto-accept requests: No
6. **Give Group Permission to this Site**:
   - Select: **Contribute** (Add, edit, delete list items)
7. Click **Create**

#### Group 3: FacilitiesManager

1. Click **New** -> **New Group** (repeat process)
2. **Name**: `FacilitiesManager`
3. **About Me (Description)**: `Facilities managers with admin access to locations and reports`
4. **Group Settings**:
   - **Who can view the membership**: Group Members
   - **Who can edit the membership**: Group Owner
5. **Membership Requests**:
   - Allow requests to join/leave this group: Yes
   - Auto-accept requests: No
6. **Give Group Permission to this Site**:
   - Select: **Full Control** (Has full control)
7. Click **Create**

### Step 1.2: Add Users to Groups

1. Click on the group name (e.g., `RegularUser`)
2. Click **New** -> **Add Users to this Group**
3. Enter user names or email addresses in the text box
4. Click **Share**
5. Repeat for all three groups

**Recommended Test Setup**:
- Add yourself to all three groups for testing
- Add 2-3 test users to `RegularUser`
- Add 1-2 test users to `FacilitiesEmployee`
- Add 1 test user to `FacilitiesManager`

### Step 1.3: Verify Group Creation

**Checklist**:
- [ ] RegularUser group created with Read permissions
- [ ] FacilitiesEmployee group created with Contribute permissions
- [ ] FacilitiesManager group created with Full Control permissions
- [ ] Test users added to appropriate groups
- [ ] You can see all three groups in **Site Settings** -> **People and groups**

---

## Part 2: List Creation Instructions

You'll create 3 SharePoint lists. **Create them in any order** (no lookup dependencies).

1. **Locations** (flat structure with City/Office/Floor)
2. **Employees** (minimal: Name, SmartCardID, Email)
3. **Packages** (text-based sender/recipient and locations)

All columns use only **Text** (Single line of text) or **Note** (Multiple lines of text) types, which are the two types supported by SPARC's `createField`.

---

## 2.1 Locations List

The Locations list stores a flat list of office locations used for package routing. Each location is identified by a `CITY | OFFICE | FLOOR` title.

### Step 2.1.1: Create the List

1. Navigate to your SharePoint site
2. Click **Settings** gear -> **Add an app**
3. Click **Custom List**
4. **Name**: `Locations`
5. Click **Create**

### Step 2.1.2: Add Columns

After the list is created, add 4 custom columns. For each column:

1. Open the **Locations** list
2. Click **Settings** gear -> **List Settings**
3. Under **Columns**, click **Create column**
4. Follow the specifications below

---

#### Column 1: City

| Setting | Value |
|---------|-------|
| **Column name** | `City` |
| **Type** | Single line of text |
| **Description** | City name (e.g., LISBON, PORTO) |
| **Require information** | No |
| **Maximum characters** | 255 |

Click **OK**

---

#### Column 2: Office

| Setting | Value |
|---------|-------|
| **Column name** | `Office` |
| **Type** | Single line of text |
| **Description** | Office name (e.g., TOC, URBO, ECHO) |
| **Require information** | No |
| **Maximum characters** | 255 |

Click **OK**

---

#### Column 3: Floor

| Setting | Value |
|---------|-------|
| **Column name** | `Floor` |
| **Type** | Single line of text |
| **Description** | Floor number (e.g., 0, 1, 7) |
| **Require information** | No |
| **Maximum characters** | 50 |

Click **OK**

---

#### Column 4: IsActive

| Setting | Value |
|---------|-------|
| **Column name** | `IsActive` |
| **Type** | Single line of text |
| **Description** | Whether this location is currently active ("true" or "false") |
| **Require information** | No |
| **Default value** | true |
| **Maximum characters** | 10 |

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

### Step 2.1.4: Verify Locations List

**Checklist**:
- [ ] List named "Locations" exists
- [ ] Title column (default -- formatted as "CITY | OFFICE | FLOOR")
- [ ] City column (text)
- [ ] Office column (text)
- [ ] Floor column (text)
- [ ] IsActive column (text, default "true")
- [ ] Indexed columns: IsActive

**Total Columns**: 5 (including Title)

---

## 2.2 Employees List

The Employees list stores employee records with smart card IDs for the smart card scan workflow.

### Step 2.2.1: Create the List

1. Navigate to your SharePoint site
2. Click **Settings** gear -> **Add an app**
3. Click **Custom List**
4. **Name**: `Employees`
5. Click **Create**

If the list already exists, open it and remove any columns that are not listed below.

### Step 2.2.2: Add Columns

The Employees list only needs 2 custom columns beyond the default Title (which serves as the employee name).

---

#### Column 1: SmartCardID

| Setting | Value |
|---------|-------|
| **Column name** | `SmartCardID` |
| **Type** | Single line of text |
| **Description** | Unique employee smart card identifier (used for smart card scan lookup) |
| **Require information** | Yes |
| **Enforce unique values** | Yes |
| **Maximum characters** | 50 |

Click **OK**

CRITICAL: This column MUST have unique values enabled and be indexed.

---

#### Column 2: Email

| Setting | Value |
|---------|-------|
| **Column name** | `Email` |
| **Type** | Single line of text |
| **Description** | Employee email address |
| **Require information** | Yes |
| **Maximum characters** | 255 |

Click **OK**

---

### Step 2.2.3: Create Indexed Columns

#### Index 1: SmartCardID (CRITICAL)

1. Go to **List Settings**
2. Under **Columns**, click **Indexed columns**
3. Click **Create a new index**
4. **Primary Column**: Select `SmartCardID`
5. **Secondary Column**: None
6. Click **Create**

CRITICAL: This index is essential for fast smart card lookup (must complete in < 2 seconds).

#### Index 2: Email

1. Click **Create a new index** (again)
2. **Primary Column**: Select `Email`
3. **Secondary Column**: None
4. Click **Create**

### Step 2.2.4: Verify Employees List

**Checklist**:
- [ ] Title column (default -- employee name)
- [ ] SmartCardID column (text, required, unique, indexed)
- [ ] Email column (text, required, indexed)
- [ ] Indexed columns: SmartCardID, Email

**Total Columns**: 3 (including Title)

---

## 2.3 Packages List

The Packages list is the core data store for all mail/package records. The Title column stores the tracking number.

### Step 2.3.1: Create the List

1. Navigate to your SharePoint site
2. Click **Settings** gear -> **Add an app**
3. Click **Custom List**
4. **Name**: `Packages`
5. Click **Create**

### Step 2.3.2: Add Columns

You'll add 8 custom columns. The default Title column is used as the TrackingNumber.

> **Title column**: Rename the default Title column to "TrackingNumber" for clarity. Go to **List Settings** -> click **Title** column -> change **Column name** to `Title` (keep as-is) or just use it as the tracking number field. The internal name remains `Title`.

---

#### Column 1: Sender

| Setting | Value |
|---------|-------|
| **Column name** | `Sender` |
| **Type** | Single line of text |
| **Description** | Sender email address |
| **Require information** | Yes |
| **Maximum characters** | 255 |

Click **OK**

---

#### Column 2: Recipient

| Setting | Value |
|---------|-------|
| **Column name** | `Recipient` |
| **Type** | Single line of text |
| **Description** | Recipient email address |
| **Require information** | Yes |
| **Maximum characters** | 255 |

Click **OK**

---

#### Column 3: Status

| Setting | Value |
|---------|-------|
| **Column name** | `Status` |
| **Type** | Single line of text |
| **Description** | Current package status |
| **Require information** | Yes |
| **Maximum characters** | 50 |
| **Default value** | created |

Click **OK**

Valid values: `created`, `stored`, `in transit`, `arrived`, `delivered`

---

#### Column 4: CurrentLocation

| Setting | Value |
|---------|-------|
| **Column name** | `CurrentLocation` |
| **Type** | Single line of text |
| **Description** | Current location of the package (e.g., "LISBON | TOC | 1") |
| **Require information** | No |
| **Maximum characters** | 255 |

Click **OK**

---

#### Column 5: DestinationLocation

| Setting | Value |
|---------|-------|
| **Column name** | `DestinationLocation` |
| **Type** | Single line of text |
| **Description** | Final destination location (e.g., "LISBON | TOR | 1") |
| **Require information** | No |
| **Maximum characters** | 255 |

Click **OK**

---

#### Column 6: PackageDetails

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

#### Column 7: InternalNotes

| Setting | Value |
|---------|-------|
| **Column name** | `InternalNotes` |
| **Type** | Multiple lines of text |
| **Description** | Internal notes visible only to facilities staff |
| **Require information** | No |
| **Number of lines** | 4 |
| **Type of text** | Plain text |

Click **OK**

---

#### Column 8: Timeline

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

This field stores a JSON array tracking all status changes:
```json
[
  {"status":"created","date":"2025-12-03T10:00:00Z","location":"LISBON | TOC | 1","changedBy":"user@company.com","notes":"Package created"},
  {"status":"stored","date":"2025-12-03T14:30:00Z","location":"LISBON | TOC | 1","changedBy":"staff@company.com","notes":"Label printed"}
]
```

---

### Step 2.3.3: Create Indexed Columns

#### Index 1: Status

1. Go to **List Settings**
2. Under **Columns**, click **Indexed columns**
3. Click **Create a new index**
4. **Primary Column**: Select `Status`
5. **Secondary Column**: None
6. Click **Create**

Note: The Title column (TrackingNumber) is automatically indexed by SharePoint since it enforces uniqueness when configured.

### Step 2.3.4: Verify Packages List

**Checklist**:
- [ ] Title column (default -- used as TrackingNumber, format: POSTHUB-YYYYMMDD-XXXXX)
- [ ] Sender column (text, required -- email string)
- [ ] Recipient column (text, required -- email string)
- [ ] Status column (text, required, indexed)
- [ ] CurrentLocation column (text -- location string)
- [ ] DestinationLocation column (text -- location string)
- [ ] PackageDetails column (multi-line text)
- [ ] InternalNotes column (multi-line text)
- [ ] Timeline column (multi-line text, JSON array for audit trail)
- [ ] Created column (auto, default)
- [ ] Modified column (auto, default)
- [ ] Indexed columns: Status

**Total Columns**: 9 custom + Title + Created + Modified = 11

---

## Part 3: Importing Sample Data

CSV files with sample data are provided in the `sharepoint-data` folder.

### Step 3.1: Import Locations Data

1. Open the **Locations** list
2. Click **Quick Edit** (or **Edit in Grid View**)
3. Copy data from `Locations.csv` and paste into the grid
4. Click **Stop** (exit Quick Edit mode)
5. Verify data appears correctly

There are 6 locations representing real office sites. No hierarchy or parent dependencies -- just paste all rows at once.

### Step 3.2: Import Employee Smart Card IDs

1. Open the **Employees** list
2. Click **Quick Edit**
3. Copy data from `Employees_Sample.csv` and paste
4. Click **Stop**
5. Verify SmartCardID values are unique

IMPORTANT: Ensure each employee has a unique SmartCardID.

### Step 3.3: Import Sample Packages (Optional)

1. Open the **Packages** list
2. Click **Quick Edit**
3. Copy data from `Packages_Sample.csv` and paste
4. Click **Stop**

You can skip this and create packages through the PostHub application instead.

---

## Part 4: Verification Checklist

### Step 4.1: List Structure Verification

**All 3 Lists Created**:
- [ ] Locations list (5 columns)
- [ ] Employees list (3 columns)
- [ ] Packages list (11 columns including auto columns)

**All Indexes Created**:
- [ ] Locations: IsActive
- [ ] Employees: SmartCardID, Email
- [ ] Packages: Status

### Step 4.2: Sample Data Verification

**Test Data Present**:
- [ ] Locations list has 6 locations
- [ ] Employees list has 10 employees with SmartCardIDs
- [ ] Each employee has a unique SmartCardID
- [ ] Location titles follow "CITY | OFFICE | FLOOR" format

### Step 4.3: Permissions Verification

**SharePoint Groups**:
- [ ] RegularUser group exists (Read permissions)
- [ ] FacilitiesEmployee group exists (Contribute permissions)
- [ ] FacilitiesManager group exists (Full Control permissions)
- [ ] Test users assigned to groups

### Step 4.4: Test Queries

Run these manual tests to verify setup:

#### Test 1: Smart Card Lookup
1. Open Employees list
2. Filter by SmartCardID (pick any smart card ID from sample data)
3. Verify only one result appears (enforcing uniqueness)

#### Test 2: Active Locations
1. Open Locations list
2. Filter by IsActive = "true"
3. Verify only active locations appear

#### Test 3: Tracking Number Uniqueness
1. Open Packages list
2. Try to create two packages with same Title (TrackingNumber)
3. Verify SharePoint prevents duplicate (should show error)

---

## Troubleshooting

### Issue 1: Cannot Enforce Unique Values

**Symptom**: "Enforce unique values" option is grayed out

**Solution**:
- Ensure the column is indexed first (create the column, then add index, then edit column to enforce unique values)
- OR: When creating the column, check both "Indexed" and "Unique" at the same time

---

### Issue 2: Smart Card Lookup is Slow

**Symptom**: Searching employees by SmartCardID takes several seconds

**Solution**:
- Verify SmartCardID column is indexed (List Settings -> Indexed columns)
- If not indexed, create the index now
- Index must be in place BEFORE adding large amounts of data

---

### Issue 3: Cannot Import CSV Data

**Symptom**: Quick Edit paste doesn't work

**Solution**:
- Use "New Item" form instead (manual entry)
- Verify column types match CSV data types
- Check for special characters in CSV that might cause issues
- Try smaller batches (5-10 rows at a time)

---

### Issue 4: Groups Don't Have Correct Permissions

**Symptom**: Users can't access lists or see SharePoint groups

**Solution**:
- Go to Site Settings -> Site Permissions
- Verify each group has correct permission level
- Check users are actually members of the groups (People and Groups -> Group Name -> View membership)
- Try removing and re-adding users to groups

---

## Summary

You've successfully set up SharePoint for PostHub. Here's what you created:

**SharePoint Groups**: 3
- RegularUser (Read)
- FacilitiesEmployee (Contribute)
- FacilitiesManager (Full Control)

**SharePoint Lists**: 3
- Locations (5 columns, 1 index)
- Employees (3 columns, 2 indexes)
- Packages (11 columns, 1 index)

**Total Indexed Columns**: 4 (critical for performance)

**Next Steps**:
1. Review the Quick Reference appendix at the end of this guide
2. Test the PostHub application with your new SharePoint setup
3. Add additional employees and locations as needed
4. Configure smart card reader hardware for facilities workflow
5. Print test barcode labels

---

## Need Help?

**Common Resources**:
- SharePoint List Settings: Settings gear -> List Settings
- View Columns: List Settings -> Columns section
- View Indexes: List Settings -> Indexed columns
- View Permissions: Settings gear -> Site Settings -> People and groups

**Best Practices**:
- Always index columns used in frequent queries or filters
- Use unique values on key identifier columns (SmartCardID, TrackingNumber)
- Test with sample data before adding production data
- Back up list data regularly (export to Excel)
- All columns use Text or Note types only (SPARC createField compatibility)

**POC Testing**:
- Test smart card scan with actual hardware
- Print and scan QR code labels
- Verify all user groups can access appropriate features
- Test on Microsoft Edge browser (primary target)
- Have at least 5 test employees with smart card IDs
- Have at least 6 locations covering multiple offices

---

## Appendix A: Quick Reference

### Column Counts

| List | Total Columns | Custom Columns | Indexes |
|------|---------------|----------------|---------|
| Locations | 5 | 4 | 1 |
| Employees | 3 | 2 | 2 |
| Packages | 11 | 8 + auto | 1 |
| **TOTAL** | **19** | **14** | **4** |

### Valid Values

**Package Status:** created (default), stored, in transit, arrived, delivered

**Location Title Format:** CITY | OFFICE | FLOOR (e.g., "LISBON | TOC | 1")

**IsActive Values:** "true", "false"

---

## Appendix B: Common Mistakes to Avoid

- [ ] Indexing SmartCardID column (critical for performance)
- [ ] Enforcing unique values on SmartCardID and TrackingNumber (Title)
- [ ] Using only Text and Note column types (SPARC limitation)
- [ ] Setting IsActive as text "true"/"false" (not a Yes/No checkbox)
- [ ] Testing with actual smart card reader hardware before POC

---

## Appendix C: Troubleshooting Quick Fixes

**Smart card lookup is slow?**
-> Index SmartCardID column immediately

**Can't enforce unique values?**
-> Index the column first, then edit to add uniqueness

**CSV import not working?**
-> Use Quick Edit grid view, paste smaller batches (5-10 rows)

**Tracking number duplicates allowed?**
-> Edit Title column -> Check "Enforce unique values" -> Save

---

## Appendix D: POC Demo Flow (20 minutes)

1. **User sends package** (2 min) -> Show Send Mail form
2. **Smart card scan** (5 min) -> Live smart card reader demo
3. **Generate labels** (5 min) -> Print actual QR code labels
4. **Scan QR code** (3 min) -> Update package status
5. **Track history** (2 min) -> Show audit trail
6. **Admin features** (3 min) -> Manage locations, reports

### Pre-POC Checklist
- [ ] All SharePoint lists created and verified
- [ ] Sample data imported (10 employees, 6 locations)
- [ ] Smart card reader hardware tested with SmartCardID lookup
- [ ] QR code printer configured (4" x 6" labels)
- [ ] QR code scanner tested
- [ ] Test users assigned to all 3 SharePoint groups
- [ ] PostHub application deployed to SiteAssets
- [ ] End-to-end workflow tested successfully
- [ ] Tested on Microsoft Edge browser
- [ ] Backup of SharePoint lists created
