# PostHub Component Patterns

PostHub-specific component patterns and conventions.

## Custom PostHub Components

PostHub extends SPARC with three custom components for hardware integration and package management.

### 1. packageTable Component

Tabular display of packages with sorting, filtering, row selection, and click handlers.

**Purpose:** Display packages in facilities dashboard and smart card scan screen

**Modes:**
- **View-only mode**: Click row to view details (My Mail screen)
- **Selectable mode**: Checkbox selection for bulk operations (Smart Card Scan screen)

**Pattern:**
```js
import { createPackageTable } from '../components/packageTable.js'

const table = createPackageTable({
  packages: packageArray,
  selectable: true,
  onSelect: (selectedPackages) => {
    // Handle selection
  },
  onClick: (packageId) => {
    // Handle row click (view-only mode)
  }
})

contentView.children = [table]
```

**Styling:** BEM classes with `posthub__` prefix

### 2. smartCardInput Component

Smart card reader integration with auto-focus, debouncing, and event handling.

**Purpose:** Capture smart card reader input at facilities desk

**Hardware Integration:**
- Smart card reader acts as keyboard (pastes smart card ID)
- Supports both `input` and `paste` events
- 300ms debounce for smart card reader timing
- Auto-focus on mount

**Pattern:**
```js
import { createSmartCardInput } from '../components/smartCardInput.js'

const smartCardInput = createSmartCardInput({
  onSmartCardScanned: async (smartCardId) => {
    const employee = await getEmployeeBySmartCard(smartCardId)
    if (employee) {
      const packages = await getPendingPackagesForUser(employee.Email)
      // Display results
    }
  },
  placeholder: 'Scan smart card or enter Smart Card ID...'
})

contentView.children = [smartCardInput]
```

**Debouncing Logic:**
```js
let debounceTimer
input.addEventListener('input', (e) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    onSmartCardScanned(e.target.value)
  }, 300)
})
```

### 3. qrLabelGenerator Component

Generate and display QR codes using qrcode.min.js with print integration.

**Purpose:** Create QR code labels encoding full package data for tracking

**Library:** qrcode.min.js (QR code format)

**Pattern:**
```js
import { createQrLabelGenerator } from '../components/qrLabelGenerator.js'

const generator = createQrLabelGenerator({
  packages: selectedPackages,
  onPrint: () => {
    window.print()
  }
})

modalView.children = [generator]
```

**QR Code Content:** Full package data as JSON
```js
const packageData = {
  TrackingNumber: 'POSTHUB-20260304-00001',
  Sender: 'john.smith@company.com',
  Recipient: 'sarah.johnson@company.com',
  Status: 'stored',
  CurrentLocation: 'LISBON | TOC | 1',
  DestinationLocation: 'LISBON | TOR | 1',
  PackageDetails: 'Large envelope - documents'
}

new QRCode(element, {
  text: JSON.stringify(packageData),
  width: 256,
  height: 256,
  correctLevel: QRCode.CorrectLevel.H
})
```

**Label Layout:**
```
+----------------------------------+
|  [QR CODE containing JSON]      |
|                                  |
|  POSTHUB-20260304-00001          |  <- Tracking number (human-readable)
|                                  |
|  From: John Smith                |  <- Sender info
|  To: Sarah Johnson               |  <- Recipient info
|  LISBON | TOC | 1 --> TOR | 1   |  <- Route info
+----------------------------------+
```

**Label Size:** 4" x 6" (industry standard for shipping labels)

**Print Functionality:**
```css
@media print {
  .posthub__qr-label {
    width: 4in;
    height: 6in;
    page-break-after: always;
  }

  nav, header, .no-print {
    display: none !important;
  }
}
```

## Component Integration with SPARC

### Returning SPARC Instances (Preferred)

```js
export function createPackageCard({ packageData }) {
  return new Card([
    new Text(packageData.Title, { type: 'h3' }),
    new Text(`Status: ${packageData.Status}`, { type: 'p' })
  ])
}
```

### Returning Raw DOM (Acceptable for Complex Components)

```js
export function createPackageTable({ packages }) {
  const div = document.createElement('div')
  div.className = 'posthub__package-table'
  div.innerHTML = generateTableHTML(packages)
  attachTableEvents(div, packages)
  return { element: div }
}
```

## Component File Structure

```
components/
  packageTable.js       # Table component with selection
  smartCardInput.js    # Smart card reader integration
  qrLabelGenerator.js   # QR code label generation
```

## Styling Conventions

**BEM with PostHub prefix:**
```css
.posthub__package-table { }
.posthub__package-table--selectable { }
.posthub__package-table__row { }
.posthub__package-table__row--selected { }
```

**Status badge colors (5 statuses):**
```css
.posthub__status-badge--created { background: #6c757d; }     /* Gray */
.posthub__status-badge--stored { background: #6f42c1; }      /* Purple */
.posthub__status-badge--in-transit { background: #fd7e14; }   /* Orange */
.posthub__status-badge--arrived { background: #20c997; }      /* Teal */
.posthub__status-badge--delivered { background: #198754; }    /* Green */
```

## Hardware Integration Best Practices

### Smart Card Reader
- Always auto-focus input field on mount
- Use debouncing (300ms recommended)
- Support both `input` and `paste` events
- Clear input after successful scan
- Provide manual entry fallback
- Show loading state during lookup

### QR Code Printer
- Use browser native print dialog (better compatibility)
- Define print-specific CSS (`@media print`)
- 4" x 6" label size (industry standard)
- QR code encodes full package JSON (not just tracking number)
- Human-readable tracking number displayed below QR code

### QR Code Scanner
- Scanner outputs to focused input (keyboard wedge mode)
- Indexed Title (TrackingNumber) field for fast lookup

## Reference

Extracted from:
- `requirements-review.md` (QR replaces barcode, updated components)
- `IMPLEMENTATION_PLAN.md` (component patterns)
