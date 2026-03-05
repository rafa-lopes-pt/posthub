# PostHub Sample Data Files

This directory contains CSV sample data files for importing into SharePoint lists.

---

## Files in This Directory

| File | Purpose | Row Count | Dependencies |
|------|---------|-----------|--------------|
| **Locations.csv** | Flat list of office locations | 6 | None |
| **Employees_Sample.csv** | Test employee records | 10 | None |
| **Packages_Sample.csv** | Test package records | 4 | None |

---

## Data Overview

### Locations (6 total)

All locations use a flat structure with the title format `CITY | OFFICE | FLOOR`:

| Title | City | Office | Floor |
|-------|------|--------|-------|
| PORTO \| URBO \| 0 | PORTO | URBO | 0 |
| LISBON \| TOC \| 1 | LISBON | TOC | 1 |
| LISBON \| TOR \| 1 | LISBON | TOR | 1 |
| LISBON \| ECHO \| 0 | LISBON | ECHO | 0 |
| LISBON \| AURA \| 7 | LISBON | AURA | 7 |
| LISBON \| LUMNIA \| 0 | LISBON | LUMNIA | 0 |

**Cities**: PORTO (1 location), LISBON (5 locations)

### Employees (10 total)

**Smart Card IDs**: SC001 through SC010

| Title | SmartCardID | Email |
|-------|---------|-------|
| John Smith | SC001 | john.smith@company.com |
| Sarah Johnson | SC002 | sarah.johnson@company.com |
| Michael Chen | SC003 | michael.chen@company.com |
| Emily Davis | SC004 | emily.davis@company.com |
| Robert Martinez | SC005 | robert.martinez@company.com |

### Packages (4 test packages)

**Tracking Numbers**: POSTHUB-20251203-00001 through 00004

**Statuses represented**: 1 created, 1 stored, 1 in transit, 1 delivered

---

## Import Instructions

### Import Order

Lists have no lookup dependencies. Recommended order:

1. **Locations.csv** -- paste all 6 rows at once
2. **Employees_Sample.csv** -- update email addresses to match your users
3. **Packages_Sample.csv** -- optional, for testing only

### Method 1: Quick Edit (Grid View) -- Recommended

All columns are plain text, so paste works directly without dropdown selections.

#### Import Locations

1. Open **Locations** list in SharePoint
2. Click **Quick Edit** (or **Edit in Grid View**)
3. Copy all 6 data rows from Locations.csv (excluding header)
4. Paste into the grid
5. Click **Stop** to exit Quick Edit

#### Import Employees

1. Open **Employees** list
2. Click **Quick Edit**
3. Copy all 10 employee rows (excluding header)
4. Paste into SharePoint grid
5. Verify **SmartCardID** values are unique (SC001 through SC010)
6. Click **Stop** to exit

#### Import Packages (Optional)

1. Open **Packages** list
2. Click **Quick Edit**
3. Copy package rows from Packages_Sample.csv (excluding header)
4. Paste into grid
5. Click **Stop** to exit

### Method 2: Manual Entry (New Item Form)

If Quick Edit doesn't work, use the standard New Item form:

**Locations example:**
- **Title**: PORTO | URBO | 0
- **City**: PORTO
- **Office**: URBO
- **Floor**: 0
- **IsActive**: true

**Employees example:**
- **Title**: John Smith
- **SmartCardID**: SC001
- **Email**: john.smith@company.com

---

## Verification After Import

**Locations**:
- [ ] 6 total locations imported
- [ ] All titles follow "CITY | OFFICE | FLOOR" format
- [ ] All have IsActive = "true"

**Employees**:
- [ ] 10 employees imported
- [ ] All SmartCardIDs are unique (SC001-SC010)
- [ ] Smart card search by SmartCardID returns results in < 2 seconds

**Packages** (if imported):
- [ ] 4 packages imported
- [ ] All TrackingNumbers (Title) are unique
- [ ] Sender/Recipient are email strings

---

## Customization

### Before Importing
- **Employees**: Replace email addresses with actual user emails
- **Packages**: Update Sender/Recipient emails; use today's date for TrackingNumber (POSTHUB-YYYYMMDD-#####)

### Adding More Data
- **Locations**: Follow "CITY | OFFICE | FLOOR" title format, set IsActive to "true"
- **Employees**: Use unique SmartCardID (format: SC###)
- **Packages**: Use unique TrackingNumber as Title, valid statuses: created, stored, in transit, arrived, delivered

---

## Testing Scenarios

### Scenario 1: Smart Card Scan Lookup
1. Use smart card reader or manually enter: **SC001**
2. System should find: John Smith
3. Show his pending packages (if any exist)
4. Should complete in < 2 seconds

### Scenario 2: Package Routing
1. Create package with sender john.smith@company.com
2. Set CurrentLocation: LISBON | TOC | 1
3. Set DestinationLocation: LISBON | TOR | 1
4. Track package as status changes

### Scenario 3: Cross-City Delivery
1. Create package from PORTO | URBO | 0
2. Destination: LISBON | AURA | 7
3. Track inter-city routing through status changes

---

## Troubleshooting

**"Column 'SmartCardID' Must Be Unique" error**: Check CSV for duplicate smart card IDs. Import one row at a time if needed.

**Quick Edit paste doesn't work**: Try smaller batches (5 rows at a time), use manual entry, or try Microsoft Edge browser.

**Special characters in location titles**: The pipe character (|) should paste correctly. If not, type titles manually. Ensure CSV encoding is UTF-8.

---

## File Formats

All CSV files use: UTF-8 encoding, comma delimiter, LF line endings, header row included.

All columns use only **Text** or **Note** types (SPARC framework requirement).

---

**Setup Guide**: See `../SHAREPOINT_SETUP_GUIDE.md` for complete SharePoint setup instructions.
