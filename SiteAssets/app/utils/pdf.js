/**
 * PDF and Print Utilities for PostHub
 *
 * Provides label printing functionality using browser's native print API.
 * Creates print-optimized layouts for 4" x 6" barcode labels.
 *
 * @module utils/pdf
 */

import { createPrintableLabel, createBulkLabels } from './barcode.js';

/**
 * Print barcode labels for multiple packages
 * Opens print dialog with optimized 4" x 6" label layout
 *
 * @param {Array<Object>} packages - Array of package objects
 * @param {Object} [options={}] - Print options
 * @param {boolean} [options.autoClose=false] - Auto-close window after printing
 * @param {string} [options.title='Package Labels'] - Document title
 * @returns {Window|null} Print window or null if failed
 *
 * @example
 * printBarcodeLabels([pkg1, pkg2, pkg3], { autoClose: true });
 */
export function printBarcodeLabels(packages, options = {}) {
  if (!packages || packages.length === 0) {
    console.warn('No packages to print');
    return null;
  }

  const {
    autoClose = false,
    title = 'Package Labels'
  } = options;

  try {
    // Create print window
    const printWindow = window.open('', '_blank', 'width=800,height=600');

    if (!printWindow) {
      console.error('Failed to open print window. Check popup blocker.');
      return null;
    }

    // Generate labels HTML
    const labelsHTML = createBulkLabels(packages);

    // Build complete HTML document
    const html = buildPrintDocument(labelsHTML, title, autoClose);

    // Write to print window
    printWindow.document.write(html);
    printWindow.document.close();

    return printWindow;
  } catch (error) {
    console.error('Error printing labels:', error);
    return null;
  }
}

/**
 * Build complete HTML document for printing
 *
 * @private
 * @param {string} content - Label HTML content
 * @param {string} title - Document title
 * @param {boolean} autoClose - Auto-close after printing
 * @returns {string} Complete HTML document
 */
function buildPrintDocument(content, title, autoClose) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title} - ${new Date().toLocaleDateString()}</title>
      <style>
        /* Reset and base styles */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: Arial, sans-serif;
          background: #f5f5f5;
          padding: 20px;
        }

        /* Print-specific styles */
        @media print {
          body {
            background: white;
            padding: 0;
            margin: 0;
          }

          /* Page setup for 4" x 6" labels */
          @page {
            size: 4in 6in;
            margin: 0;
          }

          /* Page breaks */
          .barcode-label {
            page-break-after: always;
            page-break-inside: avoid;
          }

          .barcode-label:last-child {
            page-break-after: auto;
          }

          /* Hide screen-only elements */
          .no-print {
            display: none !important;
          }
        }

        /* Screen preview styles */
        @media screen {
          body {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
          }

          .print-preview-header {
            width: 100%;
            max-width: 800px;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            text-align: center;
          }

          .print-button {
            background: #0d6efd;
            color: white;
            border: none;
            padding: 12px 24px;
            font-size: 16px;
            border-radius: 4px;
            cursor: pointer;
            margin: 10px;
          }

          .print-button:hover {
            background: #0b5ed7;
          }
        }

        /* Label styles */
        .barcode-label {
          width: 4in;
          height: 6in;
          background: white;
          border: 2px solid #000;
          padding: 0.25in;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-sizing: border-box;
        }

        .label-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #000;
          padding-bottom: 10px;
          margin-bottom: 15px;
        }

        .label-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: bold;
        }

        .label-priority {
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
        }

        .priority-urgent {
          background: #dc3545;
          color: white;
        }

        .priority-standard {
          background: #6c757d;
          color: white;
        }

        .priority-low {
          background: #28a745;
          color: white;
        }

        .barcode-container {
          text-align: center;
          margin: 15px 0;
          flex-shrink: 0;
        }

        .barcode-container svg {
          max-width: 100%;
          height: auto;
        }

        .label-info {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .label-section {
          border-top: 1px solid #ccc;
          padding-top: 8px;
        }

        .label-section:first-child {
          border-top: none;
          padding-top: 0;
        }

        .label-info p {
          margin: 4px 0;
          font-size: 14px;
          line-height: 1.4;
        }

        .label-title {
          font-weight: bold;
          font-size: 16px !important;
        }

        .label-footer {
          border-top: 1px solid #000;
          padding-top: 10px;
          text-align: center;
        }

        .label-footer p {
          margin: 4px 0;
          font-size: 12px;
        }

        .label-tracking {
          font-family: 'Courier New', monospace;
          font-weight: bold;
          font-size: 13px !important;
        }

        .label-error {
          color: #dc3545;
          font-weight: bold;
          padding: 20px;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <!-- Screen preview header (hidden when printing) -->
      <div class="print-preview-header no-print">
        <h1>${title}</h1>
        <p>Preview of ${content.split('barcode-label').length - 1} label(s)</p>
        <button class="print-button" onclick="window.print()">Print Labels</button>
        <button class="print-button" onclick="window.close()" style="background: #6c757d;">Close</button>
      </div>

      <!-- Labels -->
      ${content}

      <script>
        // Auto-trigger print dialog
        window.onload = function() {
          // Small delay to ensure content is rendered
          setTimeout(() => {
            window.print();
          }, 500);

          ${autoClose ? `
          // Auto-close after printing
          window.onafterprint = function() {
            setTimeout(() => {
              window.close();
            }, 1000);
          };
          ` : ''}
        };

        // Keyboard shortcuts
        document.addEventListener('keydown', function(e) {
          if (e.key === 'Escape') {
            window.close();
          }
          if (e.ctrlKey && e.key === 'p') {
            e.preventDefault();
            window.print();
          }
        });
      </script>
    </body>
    </html>
  `;
}

/**
 * Print single label
 *
 * @param {Object} packageInfo - Package information
 * @param {Object} [options={}] - Print options
 * @returns {Window|null} Print window or null if failed
 *
 * @example
 * printSingleLabel(package, { autoClose: true });
 */
export function printSingleLabel(packageInfo, options = {}) {
  return printBarcodeLabels([packageInfo], options);
}

/**
 * Download label as SVG file
 *
 * @param {Object} packageInfo - Package information
 * @param {string} [filename] - Custom filename
 * @returns {boolean} True if download initiated successfully
 *
 * @example
 * downloadLabelSVG(package, 'label-00001.svg');
 */
export function downloadLabelSVG(packageInfo, filename = null) {
  try {
    const labelHTML = createPrintableLabel(packageInfo);
    if (!labelHTML) return false;

    // Extract tracking number for filename
    const trackingNum = packageInfo.TrackingNumber || 'unknown';
    const defaultFilename = `posthub-label-${trackingNum}.svg`;

    // Create blob
    const blob = new Blob([labelHTML], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || defaultFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Cleanup
    setTimeout(() => URL.revokeObjectURL(url), 100);

    return true;
  } catch (error) {
    console.error('Error downloading SVG:', error);
    return false;
  }
}

/**
 * Create print preview without printing
 *
 * @param {Array<Object>} packages - Array of package objects
 * @returns {Window|null} Preview window or null if failed
 *
 * @example
 * const preview = previewLabels([pkg1, pkg2]);
 */
export function previewLabels(packages) {
  if (!packages || packages.length === 0) {
    console.warn('No packages to preview');
    return null;
  }

  try {
    const previewWindow = window.open('', '_blank', 'width=800,height=600');

    if (!previewWindow) {
      console.error('Failed to open preview window');
      return null;
    }

    const labelsHTML = createBulkLabels(packages);
    const html = buildPrintDocument(labelsHTML, 'Label Preview', false);

    // Modify to prevent auto-print
    const htmlWithoutAutoPrint = html.replace('window.print();', '// Auto-print disabled for preview');

    previewWindow.document.write(htmlWithoutAutoPrint);
    previewWindow.document.close();

    return previewWindow;
  } catch (error) {
    console.error('Error creating preview:', error);
    return null;
  }
}

/**
 * Get print settings for label printer
 *
 * @returns {Object} Print settings object
 *
 * @example
 * const settings = getPrintSettings();
 * console.log(settings.pageSize); // "4in x 6in"
 */
export function getPrintSettings() {
  return {
    pageSize: '4in x 6in',
    orientation: 'portrait',
    margins: '0',
    pageBreak: 'after each label',
    recommendedPrinter: 'Label printer or standard printer',
    notes: [
      'Use 4" x 6" label paper',
      'Set printer to borderless if supported',
      'Adjust printer settings to match paper size',
      'Test with one label before printing batch'
    ]
  };
}

/**
 * Validate browser print capability
 *
 * @returns {Object} Capability check results
 *
 * @example
 * const check = checkPrintCapability();
 * if (!check.canPrint) {
 *   alert('Printing not supported');
 * }
 */
export function checkPrintCapability() {
  const results = {
    canPrint: false,
    canOpenWindow: false,
    printAPIAvailable: false,
    issues: []
  };

  // Check if window.print exists
  if (typeof window.print === 'function') {
    results.printAPIAvailable = true;
  } else {
    results.issues.push('window.print() not available');
  }

  // Check if window.open is allowed
  try {
    const testWindow = window.open('', '_blank', 'width=1,height=1');
    if (testWindow) {
      results.canOpenWindow = true;
      testWindow.close();
    } else {
      results.issues.push('Popup blocked - please allow popups for this site');
    }
  } catch (error) {
    results.issues.push('window.open() failed: ' + error.message);
  }

  results.canPrint = results.printAPIAvailable && results.canOpenWindow;

  return results;
}

/**
 * Export labels to CSV (for record keeping)
 *
 * @param {Array<Object>} packages - Array of package objects
 * @returns {boolean} True if export successful
 *
 * @example
 * exportLabelsToCSV([pkg1, pkg2, pkg3]);
 */
export function exportLabelsToCSV(packages) {
  if (!packages || packages.length === 0) {
    return false;
  }

  try {
    // CSV headers
    const headers = [
      'Tracking Number',
      'Title',
      'Sender',
      'Recipient',
      'Destination',
      'Priority',
      'Status',
      'Created'
    ];

    // CSV rows
    const rows = packages.map(pkg => [
      pkg.TrackingNumber || '',
      pkg.Title || '',
      pkg.Sender?.Title || pkg.SenderName || '',
      pkg.Recipient?.Title || pkg.RecipientName || '',
      pkg.DestinationLocation?.Title || pkg.DestinationLocation || '',
      pkg.Priority || 'Standard',
      pkg.Status || 'Sent',
      pkg.Created ? new Date(pkg.Created).toISOString() : ''
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `posthub-labels-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(url), 100);

    return true;
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    return false;
  }
}

/**
 * Print test page for printer calibration
 *
 * @returns {Window|null} Test page window
 *
 * @example
 * printTestPage();
 */
export function printTestPage() {
  const testPackage = {
    TrackingNumber: 'POSTHUB-20251203-99999',
    Title: 'Test Package - DO NOT SHIP',
    SenderName: 'Test Sender',
    RecipientName: 'Test Recipient',
    DestinationLocation: 'Test Location',
    Priority: 'Standard',
    Created: new Date().toISOString()
  };

  return printSingleLabel(testPackage, {
    autoClose: false,
    title: 'Printer Test Page'
  });
}

/**
 * Batch print with confirmation
 *
 * @param {Array<Object>} packages - Array of package objects
 * @param {Function} [onConfirm] - Callback before printing
 * @returns {Promise<Window|null>} Print window or null
 *
 * @example
 * await batchPrintWithConfirmation(packages, (count) => {
 *   return confirm(`Print ${count} labels?`);
 * });
 */
export async function batchPrintWithConfirmation(packages, onConfirm = null) {
  if (!packages || packages.length === 0) {
    alert('No packages selected for printing');
    return null;
  }

  const count = packages.length;

  // Default confirmation
  const confirmed = onConfirm
    ? onConfirm(count)
    : confirm(`Print ${count} label${count > 1 ? 's' : ''}?`);

  if (!confirmed) {
    return null;
  }

  return printBarcodeLabels(packages, { autoClose: false });
}

/**
 * Get estimated print time
 *
 * @param {number} labelCount - Number of labels to print
 * @returns {Object} Time estimate
 *
 * @example
 * const estimate = getEstimatedPrintTime(50);
 * console.log(estimate.minutes); // ~5 minutes
 */
export function getEstimatedPrintTime(labelCount) {
  // Estimate: ~6 seconds per label (includes processing and printing)
  const secondsPerLabel = 6;
  const totalSeconds = labelCount * secondsPerLabel;

  return {
    labels: labelCount,
    seconds: totalSeconds,
    minutes: Math.ceil(totalSeconds / 60),
    formatted: `~${Math.ceil(totalSeconds / 60)} minute${Math.ceil(totalSeconds / 60) > 1 ? 's' : ''}`
  };
}
