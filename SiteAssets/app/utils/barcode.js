/**
 * Barcode Generation Utilities for PostHub
 *
 * Provides barcode generation using JsBarcode library (CODE128 format).
 * Creates printable labels with tracking numbers and package information.
 *
 * @module utils/barcode
 */

/**
 * Check if JsBarcode library is loaded
 *
 * @returns {boolean} True if JsBarcode is available
 */
export function isJsBarcodeLoaded() {
  return typeof window !== 'undefined' && typeof window.JsBarcode === 'function';
}

/**
 * Generate barcode SVG using JsBarcode
 *
 * @param {string} value - Tracking number to encode
 * @param {Object} [options={}] - JsBarcode options
 * @param {string} [options.format='CODE128'] - Barcode format
 * @param {number} [options.width=2] - Bar width
 * @param {number} [options.height=80] - Barcode height
 * @param {boolean} [options.displayValue=true] - Show human-readable text
 * @param {number} [options.fontSize=14] - Font size for text
 * @param {number} [options.margin=10] - Margin around barcode
 * @returns {SVGElement|null} SVG element with barcode or null if generation failed
 *
 * @example
 * const svg = generateBarcode('POSTHUB-20251203-00001');
 * document.body.appendChild(svg);
 */
export function generateBarcode(value, options = {}) {
  if (!isJsBarcodeLoaded()) {
    console.error('JsBarcode library not loaded');
    return null;
  }

  if (!value || value.trim().length === 0) {
    console.error('Invalid barcode value');
    return null;
  }

  const defaultOptions = {
    format: 'CODE128',
    width: 2,
    height: 80,
    displayValue: true,
    fontSize: 14,
    margin: 10,
    background: '#ffffff',
    lineColor: '#000000'
  };

  const mergedOptions = { ...defaultOptions, ...options };

  try {
    // Create SVG element
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    // Generate barcode using JsBarcode
    window.JsBarcode(svg, value, mergedOptions);

    return svg;
  } catch (error) {
    console.error('Barcode generation failed:', error);
    return null;
  }
}

/**
 * Generate barcode as data URL (for embedding in images)
 *
 * @param {string} value - Tracking number to encode
 * @param {Object} [options={}] - Barcode options
 * @returns {string|null} Data URL or null if generation failed
 *
 * @example
 * const dataURL = generateBarcodeDataURL('POSTHUB-20251203-00001');
 * img.src = dataURL;
 */
export function generateBarcodeDataURL(value, options = {}) {
  const svg = generateBarcode(value, options);
  if (!svg) return null;

  try {
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    return URL.createObjectURL(svgBlob);
  } catch (error) {
    console.error('Failed to create data URL:', error);
    return null;
  }
}

/**
 * Generate barcode as base64 PNG (for printing)
 *
 * @param {string} value - Tracking number to encode
 * @param {Object} [options={}] - Barcode options
 * @returns {Promise<string|null>} Base64 PNG data or null if generation failed
 *
 * @example
 * const base64 = await generateBarcodePNG('POSTHUB-20251203-00001');
 */
export async function generateBarcodePNG(value, options = {}) {
  const svg = generateBarcode(value, options);
  if (!svg) return null;

  try {
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    return new Promise((resolve, reject) => {
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => {
        reject(new Error('Failed to convert SVG to PNG'));
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    });
  } catch (error) {
    console.error('Failed to generate PNG:', error);
    return null;
  }
}

/**
 * Validate tracking number format
 * Format: POSTHUB-YYYYMMDD-XXXXX
 *
 * @param {string} trackingNumber - Tracking number to validate
 * @returns {boolean} True if valid format
 *
 * @example
 * if (isValidTrackingNumber('POSTHUB-20251203-00001')) {
 *   // Generate barcode
 * }
 */
export function isValidTrackingNumber(trackingNumber) {
  if (!trackingNumber || typeof trackingNumber !== 'string') {
    return false;
  }

  // Format: POSTHUB-YYYYMMDD-XXXXX
  const pattern = /^POSTHUB-\d{8}-\d{5}$/;
  return pattern.test(trackingNumber);
}

/**
 * Create printable label HTML for a single package
 *
 * @param {Object} packageInfo - Package information
 * @param {string} packageInfo.TrackingNumber - Package tracking number
 * @param {string} packageInfo.Title - Package description
 * @param {string} [packageInfo.SenderName] - Sender name
 * @param {string} [packageInfo.RecipientName] - Recipient name
 * @param {string} [packageInfo.DestinationLocation] - Destination location
 * @param {string} [packageInfo.Priority] - Priority (Standard, Urgent, Low)
 * @param {string} [packageInfo.Created] - Creation date
 * @returns {string} HTML string for printable label
 *
 * @example
 * const html = createPrintableLabel({
 *   TrackingNumber: 'POSTHUB-20251203-00001',
 *   Title: 'Documents',
 *   RecipientName: 'John Doe',
 *   DestinationLocation: 'Building A - Room 101'
 * });
 */
export function createPrintableLabel(packageInfo) {
  if (!packageInfo || !packageInfo.TrackingNumber) {
    return '<div class="label-error">Invalid package information</div>';
  }

  const svg = generateBarcode(packageInfo.TrackingNumber);
  if (!svg) {
    return '<div class="label-error">Failed to generate barcode</div>';
  }

  const senderName = packageInfo.SenderName || packageInfo.Sender?.Title || 'Unknown';
  const recipientName = packageInfo.RecipientName || packageInfo.Recipient?.Title || 'Unknown';
  const destinationLocation = packageInfo.DestinationLocation || packageInfo.DestinationLocation?.Title || 'N/A';
  const priority = packageInfo.Priority || 'Standard';
  const createdDate = packageInfo.Created ? new Date(packageInfo.Created).toLocaleDateString() : new Date().toLocaleDateString();

  const priorityClass = priority.toLowerCase();

  const labelHTML = `
    <div class="barcode-label">
      <div class="label-header">
        <h3>PostHub Package Label</h3>
        <span class="label-priority priority-${priorityClass}">${priority}</span>
      </div>
      <div class="barcode-container">
        ${svg.outerHTML}
      </div>
      <div class="label-info">
        <div class="label-section">
          <p class="label-title">${packageInfo.Title}</p>
        </div>
        <div class="label-section">
          <p><strong>From:</strong> ${senderName}</p>
          <p><strong>To:</strong> ${recipientName}</p>
        </div>
        <div class="label-section">
          <p><strong>Destination:</strong> ${destinationLocation}</p>
        </div>
      </div>
      <div class="label-footer">
        <p>Created: ${createdDate}</p>
        <p class="label-tracking">${packageInfo.TrackingNumber}</p>
      </div>
    </div>
  `;

  return labelHTML;
}

/**
 * Create multiple printable labels
 *
 * @param {Array<Object>} packages - Array of package objects
 * @returns {string} HTML string with all labels
 *
 * @example
 * const html = createBulkLabels([pkg1, pkg2, pkg3]);
 */
export function createBulkLabels(packages) {
  if (!Array.isArray(packages) || packages.length === 0) {
    return '<div class="label-error">No packages to print</div>';
  }

  const labels = packages.map(pkg => createPrintableLabel(pkg)).join('\n');
  return labels;
}

/**
 * Get barcode configuration for specific use case
 *
 * @param {string} [useCase='default'] - Use case (default, small, large, label)
 * @returns {Object} Barcode options object
 *
 * @example
 * const options = getBarcodeConfig('label');
 * const svg = generateBarcode(trackingNumber, options);
 */
export function getBarcodeConfig(useCase = 'default') {
  const configs = {
    default: {
      format: 'CODE128',
      width: 2,
      height: 80,
      displayValue: true,
      fontSize: 14,
      margin: 10
    },
    small: {
      format: 'CODE128',
      width: 1.5,
      height: 50,
      displayValue: true,
      fontSize: 10,
      margin: 5
    },
    large: {
      format: 'CODE128',
      width: 3,
      height: 120,
      displayValue: true,
      fontSize: 18,
      margin: 15
    },
    label: {
      format: 'CODE128',
      width: 2,
      height: 80,
      displayValue: true,
      fontSize: 14,
      margin: 10,
      background: '#ffffff',
      lineColor: '#000000'
    }
  };

  return configs[useCase] || configs.default;
}

/**
 * Parse tracking number components
 *
 * @param {string} trackingNumber - Tracking number to parse
 * @returns {Object|null} Parsed components or null if invalid
 * @returns {string} return.prefix - "POSTHUB"
 * @returns {string} return.date - Date portion (YYYYMMDD)
 * @returns {string} return.sequence - Sequence number (XXXXX)
 *
 * @example
 * const parts = parseTrackingNumber('POSTHUB-20251203-00001');
 * // { prefix: 'POSTHUB', date: '20251203', sequence: '00001' }
 */
export function parseTrackingNumber(trackingNumber) {
  if (!isValidTrackingNumber(trackingNumber)) {
    return null;
  }

  const parts = trackingNumber.split('-');
  return {
    prefix: parts[0],
    date: parts[1],
    sequence: parts[2]
  };
}

/**
 * Format tracking number for display
 * Adds spaces for better readability
 *
 * @param {string} trackingNumber - Tracking number
 * @returns {string} Formatted tracking number
 *
 * @example
 * formatTrackingNumber('POSTHUB-20251203-00001');
 * // Returns: "POSTHUB - 20251203 - 00001"
 */
export function formatTrackingNumber(trackingNumber) {
  if (!isValidTrackingNumber(trackingNumber)) {
    return trackingNumber;
  }

  return trackingNumber.replace(/-/g, ' - ');
}

/**
 * Get tracking date from tracking number
 *
 * @param {string} trackingNumber - Tracking number
 * @returns {Date|null} Date object or null if invalid
 *
 * @example
 * const date = getTrackingDate('POSTHUB-20251203-00001');
 * // Returns: Date object for Dec 3, 2025
 */
export function getTrackingDate(trackingNumber) {
  const parts = parseTrackingNumber(trackingNumber);
  if (!parts) return null;

  const dateStr = parts.date;
  const year = dateStr.substring(0, 4);
  const month = dateStr.substring(4, 6);
  const day = dateStr.substring(6, 8);

  return new Date(`${year}-${month}-${day}`);
}

/**
 * Batch generate barcodes for multiple tracking numbers
 *
 * @param {Array<string>} trackingNumbers - Array of tracking numbers
 * @param {Object} [options={}] - Barcode options
 * @returns {Array<Object>} Array of objects with trackingNumber and svg
 *
 * @example
 * const barcodes = batchGenerateBarcodes(['POSTHUB-20251203-00001', 'POSTHUB-20251203-00002']);
 */
export function batchGenerateBarcodes(trackingNumbers, options = {}) {
  if (!Array.isArray(trackingNumbers)) {
    return [];
  }

  return trackingNumbers.map(trackingNumber => {
    const svg = generateBarcode(trackingNumber, options);
    return {
      trackingNumber,
      svg,
      success: svg !== null
    };
  }).filter(item => item.success);
}

/**
 * Create barcode test page
 * Useful for testing barcode scanner hardware
 *
 * @param {Array<string>} [trackingNumbers] - Test tracking numbers (generates if not provided)
 * @returns {string} HTML for test page
 *
 * @example
 * const testPage = createBarcodeTestPage();
 * // Open in new window for testing
 */
export function createBarcodeTestPage(trackingNumbers = null) {
  // Generate test tracking numbers if not provided
  const testNumbers = trackingNumbers || [
    'POSTHUB-20251203-00001',
    'POSTHUB-20251203-00002',
    'POSTHUB-20251203-00003'
  ];

  const barcodes = testNumbers.map(num => {
    const svg = generateBarcode(num);
    return svg ? `
      <div style="margin: 20px; padding: 20px; border: 2px solid #000;">
        <h3>${num}</h3>
        ${svg.outerHTML}
      </div>
    ` : '';
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Barcode Test Page</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { text-align: center; }
      </style>
    </head>
    <body>
      <h1>PostHub Barcode Test Page</h1>
      <p>Use this page to test your barcode scanner hardware.</p>
      ${barcodes}
    </body>
    </html>
  `;
}

/**
 * Estimate barcode size in pixels
 *
 * @param {string} value - Value to encode
 * @param {Object} [options={}] - Barcode options
 * @returns {Object} Estimated dimensions { width, height }
 *
 * @example
 * const size = estimateBarcodeSize('POSTHUB-20251203-00001');
 * // { width: 220, height: 100 }
 */
export function estimateBarcodeSize(value, options = {}) {
  const opts = { ...getBarcodeConfig('default'), ...options };

  // Rough estimation based on CODE128
  const charWidth = opts.width * 11; // Average width per character in CODE128
  const estimatedWidth = (value.length * charWidth) + (opts.margin * 2);
  const estimatedHeight = opts.height + (opts.margin * 2) + (opts.displayValue ? opts.fontSize + 10 : 0);

  return {
    width: Math.ceil(estimatedWidth),
    height: Math.ceil(estimatedHeight)
  };
}
