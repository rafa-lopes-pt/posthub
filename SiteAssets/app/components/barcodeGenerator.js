/**
 * Barcode Generator Component
 *
 * Generates and displays barcodes using JsBarcode library (CODE128 format).
 * Displays multiple package barcodes with package info and print functionality.
 * Integrates with utils/barcode.js and utils/pdf.js for barcode generation and printing.
 *
 * @module components/barcodeGenerator
 */

import { Container, Text, Button } from '../libs/nofbiz/nofbiz.base.js';

/**
 * Creates a barcode generator component with print functionality
 *
 * @param {Object} options - Configuration options
 * @param {Array<Object>} options.packages - Array of package objects to generate barcodes for
 * @param {Function} options.onPrint - Callback when print button is clicked (packages) => void
 * @param {boolean} options.showPackageInfo - Show package details alongside barcode (default: true)
 * @param {boolean} options.showPrintButton - Show print button (default: true)
 * @param {string} options.printButtonText - Print button text (default: 'Print All Labels')
 * @param {Object} options.barcodeOptions - JsBarcode configuration options
 * @param {string} options.emptyMessage - Message when no packages (default: 'No packages to generate barcodes')
 * @param {string} options.class - Additional CSS classes
 * @returns {Container} SPARC Container with barcode elements
 *
 * @example
 * const barcodeGen = createBarcodeGenerator({
 *   packages: selectedPackages,
 *   showPackageInfo: true,
 *   onPrint: (packages) => {
 *     // Generate PDF and print
 *     printBarcodeLabels(packages);
 *   }
 * });
 */
export function createBarcodeGenerator(options = {}) {
  const {
    packages = [],
    onPrint = null,
    showPackageInfo = true,
    showPrintButton = true,
    printButtonText = 'Print All Labels',
    barcodeOptions = {},
    emptyMessage = 'No packages to generate barcodes',
    class: className = ''
  } = options;

  // Default barcode options for CODE128
  const defaultBarcodeOptions = {
    format: 'CODE128',
    width: 2,
    height: 80,
    displayValue: true,
    fontSize: 14,
    margin: 10,
    background: '#ffffff',
    lineColor: '#000000',
    ...barcodeOptions
  };

  // Create container
  const container = document.createElement('div');
  container.className = `nofbiz__barcode-generator ${className}`.trim();
  container.setAttribute('data-component', 'barcode-generator');

  /**
   * Check if JsBarcode is available
   */
  function isJsBarcodeAvailable() {
    return typeof JsBarcode !== 'undefined';
  }

  /**
   * Generate barcode for a single package
   */
  function generateBarcode(trackingNumber, targetElement) {
    if (!isJsBarcodeAvailable()) {
      console.error('JsBarcode library not loaded');
      targetElement.innerHTML = '<div class="nofbiz__barcode-error">Barcode library not available</div>';
      return false;
    }

    try {
      // Validate tracking number
      if (!trackingNumber || trackingNumber.length === 0) {
        throw new Error('Invalid tracking number');
      }

      // Generate barcode using JsBarcode
      JsBarcode(targetElement, trackingNumber, defaultBarcodeOptions);
      return true;
    } catch (error) {
      console.error('Barcode generation error:', error);
      targetElement.innerHTML = `<div class="nofbiz__barcode-error">Failed to generate barcode: ${error.message}</div>`;
      return false;
    }
  }

  /**
   * Format date for display
   */
  function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  /**
   * Get person name from object or string
   */
  function getPersonName(person) {
    if (!person) return '-';
    if (typeof person === 'string') return person;
    return person.Title || person.Name || person.EMail || '-';
  }

  /**
   * Get location name from object or string
   */
  function getLocationName(location) {
    if (!location) return '-';
    if (typeof location === 'string') return location;
    return location.Title || '-';
  }

  /**
   * Create barcode label for a package
   */
  function createBarcodeLabel(pkg) {
    const labelContainer = document.createElement('div');
    labelContainer.className = 'nofbiz__barcode-label';
    labelContainer.setAttribute('data-package-id', pkg.Id || pkg.ID);

    // Barcode section
    const barcodeSection = document.createElement('div');
    barcodeSection.className = 'nofbiz__barcode-section';

    const barcodeCanvas = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    barcodeCanvas.className = 'nofbiz__barcode-svg';

    barcodeSection.appendChild(barcodeCanvas);

    // Generate barcode
    const success = generateBarcode(pkg.TrackingNumber, barcodeCanvas);

    if (!success) {
      labelContainer.classList.add('nofbiz__barcode-label--error');
    }

    labelContainer.appendChild(barcodeSection);

    // Package info section
    if (showPackageInfo) {
      const infoSection = document.createElement('div');
      infoSection.className = 'nofbiz__package-info';

      infoSection.innerHTML = `
        <div class="nofbiz__info-header">
          <div class="nofbiz__package-title">${pkg.Title || 'Package'}</div>
          <div class="nofbiz__package-id">#${pkg.Id || pkg.ID}</div>
        </div>
        <div class="nofbiz__info-grid">
          <div class="nofbiz__info-item">
            <span class="nofbiz__info-label">From:</span>
            <span class="nofbiz__info-value">${getPersonName(pkg.Sender)}</span>
          </div>
          <div class="nofbiz__info-item">
            <span class="nofbiz__info-label">To:</span>
            <span class="nofbiz__info-value">${getPersonName(pkg.Recipient)}</span>
          </div>
          <div class="nofbiz__info-item">
            <span class="nofbiz__info-label">Destination:</span>
            <span class="nofbiz__info-value">${getLocationName(pkg.DestinationLocation)}</span>
          </div>
          <div class="nofbiz__info-item">
            <span class="nofbiz__info-label">Priority:</span>
            <span class="nofbiz__info-value nofbiz__priority-${(pkg.Priority || 'Standard').toLowerCase()}">${pkg.Priority || 'Standard'}</span>
          </div>
          <div class="nofbiz__info-item">
            <span class="nofbiz__info-label">Created:</span>
            <span class="nofbiz__info-value">${formatDate(pkg.Created)}</span>
          </div>
          <div class="nofbiz__info-item">
            <span class="nofbiz__info-label">Status:</span>
            <span class="nofbiz__info-value nofbiz__status-${(pkg.Status || 'Sent').toLowerCase().replace(' ', '-')}">${pkg.Status || 'Sent'}</span>
          </div>
        </div>
      `;

      labelContainer.appendChild(infoSection);
    }

    return labelContainer;
  }

  /**
   * Handle print button click
   */
  function handlePrint() {
    if (onPrint && typeof onPrint === 'function') {
      onPrint(packages);
    } else {
      // Default print behavior - open print dialog
      window.print();
    }
  }

  /**
   * Render component
   */
  function render() {
    container.innerHTML = '';

    // Check if JsBarcode is available
    if (!isJsBarcodeAvailable()) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'nofbiz__barcode-error-container';
      errorDiv.innerHTML = `
        <div class="nofbiz__error-icon">⚠️</div>
        <div class="nofbiz__error-title">Barcode Library Not Loaded</div>
        <div class="nofbiz__error-message">
          Please ensure JsBarcode library is included before using this component.
          <br>
          <code>&lt;script src="libs/JsBarcode.all.min.js"&gt;&lt;/script&gt;</code>
        </div>
      `;
      container.appendChild(errorDiv);
      return;
    }

    // Empty state
    if (!packages || packages.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'nofbiz__barcode-empty-state';
      emptyDiv.innerHTML = `
        <div class="nofbiz__empty-icon">📦</div>
        <div class="nofbiz__empty-message">${emptyMessage}</div>
      `;
      container.appendChild(emptyDiv);
      return;
    }

    // Header with count and print button
    const header = document.createElement('div');
    header.className = 'nofbiz__barcode-header';

    const countLabel = document.createElement('div');
    countLabel.className = 'nofbiz__barcode-count';
    countLabel.textContent = `${packages.length} ${packages.length === 1 ? 'Label' : 'Labels'}`;
    header.appendChild(countLabel);

    if (showPrintButton) {
      const printBtn = document.createElement('button');
      printBtn.className = 'nofbiz__print-button';
      printBtn.innerHTML = `
        <span class="nofbiz__print-icon">🖨️</span>
        <span>${printButtonText}</span>
      `;
      printBtn.addEventListener('click', handlePrint);
      header.appendChild(printBtn);
    }

    container.appendChild(header);

    // Labels container
    const labelsContainer = document.createElement('div');
    labelsContainer.className = 'nofbiz__barcode-labels';

    packages.forEach(pkg => {
      const label = createBarcodeLabel(pkg);
      labelsContainer.appendChild(label);
    });

    container.appendChild(labelsContainer);
  }

  // Initial render
  render();

  // Public API on container
  container.refresh = (newPackages) => {
    packages.length = 0;
    packages.push(...newPackages);
    render();
  };

  container.print = () => {
    handlePrint();
  };

  container.getPackages = () => {
    return [...packages];
  };

  // Return SPARC Container
  return new Container([container]);
}

/**
 * Helper function to generate barcode data URL for a tracking number
 * Can be used independently without the full component
 *
 * @param {string} trackingNumber - Tracking number to encode
 * @param {Object} options - JsBarcode options
 * @returns {string|null} Base64 data URL of barcode SVG, or null on error
 *
 * @example
 * const dataUrl = generateBarcodeDataURL('POSTHUB-20250101-00001');
 * if (dataUrl) {
 *   img.src = dataUrl;
 * }
 */
export function generateBarcodeDataURL(trackingNumber, options = {}) {
  if (typeof JsBarcode === 'undefined') {
    console.error('JsBarcode library not loaded');
    return null;
  }

  try {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, trackingNumber, {
      format: 'CODE128',
      width: 2,
      height: 80,
      displayValue: true,
      ...options
    });

    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Barcode generation error:', error);
    return null;
  }
}

/**
 * Validate tracking number format
 * Expected format: POSTHUB-YYYYMMDD-XXXXX
 *
 * @param {string} trackingNumber - Tracking number to validate
 * @returns {boolean} True if valid format
 *
 * @example
 * if (isValidTrackingNumber('POSTHUB-20250101-00001')) {
 *   // Valid
 * }
 */
export function isValidTrackingNumber(trackingNumber) {
  if (!trackingNumber || typeof trackingNumber !== 'string') {
    return false;
  }

  // Pattern: POSTHUB-YYYYMMDD-XXXXX
  const pattern = /^POSTHUB-\d{8}-\d{5}$/;
  return pattern.test(trackingNumber);
}

export default createBarcodeGenerator;
