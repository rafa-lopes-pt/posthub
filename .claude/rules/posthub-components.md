# PostHub Component Patterns

PostHub-specific component patterns and conventions.

## Custom PostHub Components

PostHub extends SPARC with three custom components for hardware integration and package management.

### 1. packageTable Component

Tabular display of packages with sorting, filtering, row selection, and click handlers.

**Purpose:** Display packages in facilities dashboard and badge swipe screen

**Modes:**
- **View-only mode**: Click row to view details (My Mail screen)
- **Selectable mode**: Checkbox selection for bulk operations (Badge Swipe screen)

**Pattern:**
```js
import { createPackageTable } from '../components/packageTable.js'

const table = createPackageTable({
  packages: packageArray,
  selectable: true,  // Enable checkbox selection
  onSelect: (selectedPackages) => {
    // Handle selection
  },
  onClick: (packageId) => {
    // Handle row click (view-only mode)
  }
})

// Append to SPARC component
contentView.children = [table]
```

**Key Features:**
- Sortable columns (click header to sort)
- Status badge with color coding
- Selection state management
- Responsive layout

**Styling:** BEM classes with `posthub__` prefix

### 2. badgeSwipeInput Component

Badge reader integration with auto-focus, debouncing, and event handling.

**Purpose:** Capture badge reader input at facilities desk

**Hardware Integration:**
- Badge reader acts as keyboard (pastes badge ID)
- Supports both `input` and `paste` events
- 300ms debounce for badge reader timing
- Auto-focus on mount

**Pattern:**
```js
import { createBadgeSwipeInput } from '../components/badgeSwipeInput.js'

const badgeInput = createBadgeSwipeInput({
  onBadgeScanned: async (badgeId) => {
    // Lookup employee by badge ID
    const employee = await getEmployeeByBadge(badgeId)
    if (employee) {
      // Fetch pending packages
      const packages = await getPendingPackagesForUser(employee.Email)
      // Display results
    }
  },
  placeholder: 'Swipe badge or enter Badge ID...'
})

contentView.children = [badgeInput]
```

**Key Features:**
- Auto-focus on page load (critical for hardware integration)
- Debouncing prevents duplicate scans
- Clear input after successful scan
- Manual entry fallback (if badge reader fails)
- Loading state during lookup
- Error handling for invalid badges

**Event Handling:**
```js
// Supports both events for different badge reader types
input.addEventListener('input', handleBadgeInput)
input.addEventListener('paste', handleBadgePaste)
```

**Debouncing Logic:**
```js
let debounceTimer
input.addEventListener('input', (e) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    onBadgeScanned(e.target.value)
  }, 300)  // 300ms delay
})
```

### 3. barcodeGenerator Component

Generate and display barcodes using JsBarcode library with print integration.

**Purpose:** Create barcode labels for package tracking

**Library:** JsBarcode (CODE128 format)

**Pattern:**
```js
import { createBarcodeGenerator } from '../components/barcodeGenerator.js'

const generator = createBarcodeGenerator({
  packages: selectedPackages,
  onPrint: () => {
    // Trigger browser print dialog
    window.print()
  }
})

modalView.children = [generator]
```

**Label Layout:**
```
+----------------------------------+
|  POSTHUB-20251203-00001          |  <- Tracking number (human-readable)
|  ||||||||||||||||||||||||        |  <- CODE128 barcode
|                                  |
|  From: John Smith (Room 101)     |  <- Sender info
|  To: Jane Doe (Room 205)         |  <- Recipient info
|  Priority: Urgent                |  <- Priority badge
+----------------------------------+
```

**Label Size:** 4" x 6" (industry standard for shipping labels)

**Barcode Generation:**
```js
import JsBarcode from '../libs/JsBarcode.all.min.js'

JsBarcode(svgElement, trackingNumber, {
  format: 'CODE128',
  width: 2,
  height: 100,
  displayValue: true,  // Show human-readable text
  fontSize: 14
})
```

**Print Functionality:**
```css
/* route.css - Print styles */
@media print {
  .posthub__barcode-label {
    width: 4in;
    height: 6in;
    page-break-after: always;
  }

  /* Hide navigation and headers */
  nav, header, .no-print {
    display: none !important;
  }
}
```

## Component Integration with SPARC

### Returning SPARC Instances (Preferred)

**Good:**
```js
export function createPackageCard({ packageData }) {
  return new Card([
    new Text(packageData.Title, { type: 'h3' }),
    new Text(`Status: ${packageData.Status}`, { type: 'p' })
  ])
}
```

### Returning Raw DOM (Acceptable for Complex Components)

**Acceptable when component logic is complex:**
```js
export function createPackageTable({ packages }) {
  const div = document.createElement('div')
  div.className = 'posthub__package-table'
  div.innerHTML = generateTableHTML(packages)

  // Attach event listeners
  attachTableEvents(div, packages)

  return { element: div }  // Not a SPARC instance
}
```

**When to use raw DOM:**
- Complex event handling (sortable tables, drag-drop)
- Third-party library integration (JsBarcode, chart libraries)
- Performance-critical rendering (large datasets)

**Document clearly:**
```js
/**
 * Creates package table component
 * @returns {{ element: HTMLElement }} Raw DOM element (not SPARC instance)
 */
export function createPackageTable({ packages }) {
  // ...
}
```

## Component File Structure

```
components/
├── packageTable.js       # Table component with selection
├── badgeSwipeInput.js    # Badge reader integration
├── barcodeGenerator.js   # Barcode label generation
├── packageCard.js        # Card display for single package
├── locationPicker.js     # Hierarchical location selector
└── recipientSearch.js    # Auto-complete recipient search
```

## Styling Conventions

**BEM with PostHub prefix:**
```css
/* component.css */
.posthub__package-table { }
.posthub__package-table--selectable { }
.posthub__package-table__row { }
.posthub__package-table__row--selected { }
```

**Status badge colors:**
```css
.posthub__status-badge--sent { background: #6c757d; }      /* Gray */
.posthub__status-badge--received { background: #0d6efd; }  /* Blue */
.posthub__status-badge--stored { background: #6f42c1; }    /* Purple */
.posthub__status-badge--in-transit { background: #fd7e14; }/* Orange */
.posthub__status-badge--arrived { background: #20c997; }   /* Teal */
.posthub__status-badge--delivered { background: #198754; } /* Green */
```

## Hardware Integration Best Practices

### Badge Reader
- Always auto-focus input field on mount
- Use debouncing (300ms recommended)
- Support both `input` and `paste` events
- Clear input after successful scan
- Provide manual entry fallback
- Show loading state during lookup

### Barcode Printer
- Use browser native print dialog (better compatibility)
- Define print-specific CSS (`@media print`)
- 4" x 6" label size (industry standard)
- Test on actual hardware before deployment

### Barcode Scanner
- Use CODE128 format (alphanumeric support)
- Include human-readable tracking number
- Scanner outputs to focused input (keyboard wedge mode)
- Indexed TrackingNumber field for fast lookup

## Reference

Extracted from:
- `IMPLEMENTATION_PLAN.md` lines 260-280 (Components)
- `IMPLEMENTATION_PLAN.md` lines 736-745 (Component Instances vs Raw DOM)
- `IMPLEMENTATION_PLAN.md` lines 410-423 (Barcode Format)
- `IMPLEMENTATION_PLAN.md` lines 414-426 (Badge Reader Integration)

For complete context, see: `IMPLEMENTATION_PLAN.md`
