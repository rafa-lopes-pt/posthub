/**
 * SmartCard Scan Page
 * Delivery and Pickup workflows using smart card authentication
 */

import { EMPLOYEES, PACKAGES, getEmployeeName } from '../services/mockData.js';

/**
 * SmartCard Page Component
 */
export class SmartCardPage {
  constructor(currentUser, onNavigate) {
    this.currentUser = currentUser;
    this.onNavigate = onNavigate;
    this.container = null;
    this.currentMode = null; // 'delivery' or 'pickup'
    this.scannedUser = null;
  }

  /**
   * Render the page
   */
  render() {
    this.container = document.createElement('div');
    this.container.className = 'smartcard-page';

    // Show mode selection by default
    this.showModeSelection();

    return this.container;
  }

  /**
   * Show mode selection (Delivery / Pickup buttons)
   */
  showModeSelection() {
    this.container.innerHTML = '';
    this.currentMode = null;
    this.scannedUser = null;

    const content = document.createElement('div');
    content.className = 'smartcard-selection';

    content.innerHTML = `
      <div class="smartcard-selection__header">
        <h2 class="smartcard-selection__title">Scan SmartCard</h2>
        <p class="smartcard-selection__description">Select an operation to continue</p>
      </div>
      <div class="smartcard-selection__buttons">
        <button class="smartcard-mode-btn smartcard-mode-btn--delivery" data-mode="delivery">
          <span class="smartcard-mode-btn__icon">&#128230;</span>
          <span class="smartcard-mode-btn__title">Delivery</span>
          <span class="smartcard-mode-btn__desc">Drop off a package at the mailroom</span>
        </button>
        <button class="smartcard-mode-btn smartcard-mode-btn--pickup" data-mode="pickup">
          <span class="smartcard-mode-btn__icon">&#128229;</span>
          <span class="smartcard-mode-btn__title">Pickup</span>
          <span class="smartcard-mode-btn__desc">Collect a package from the mailroom</span>
        </button>
      </div>
    `;

    content.querySelectorAll('.smartcard-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.currentMode = btn.getAttribute('data-mode');
        this.showScanCard();
      });
    });

    this.container.appendChild(content);
  }

  /**
   * Show scan card interface
   */
  showScanCard() {
    this.container.innerHTML = '';

    const modeLabel = this.currentMode === 'delivery' ? 'Delivery' : 'Pickup';
    const modeIcon = this.currentMode === 'delivery' ? '&#128230;' : '&#128229;';
    const modeDesc = this.currentMode === 'delivery'
      ? 'Scan your smart card to view packages ready for drop-off'
      : 'Scan your smart card to view packages ready for pickup';

    const content = document.createElement('div');
    content.className = 'smartcard-scan';

    content.innerHTML = `
      <button class="smartcard-back-btn" id="back-btn">
        &larr; Back
      </button>
      <div class="smartcard-scan__card">
        <div class="smartcard-scan__icon">${modeIcon}</div>
        <h2 class="smartcard-scan__title">${modeLabel}</h2>
        <p class="smartcard-scan__description">${modeDesc}</p>
        <div class="smartcard-scan__input-group">
          <label for="badge-input" class="smartcard-scan__label">SmartCard ID</label>
          <input
            type="text"
            id="badge-input"
            class="smartcard-scan__input"
            placeholder="Scan card or enter SmartCard ID (e.g., BADGE001)"
            autofocus
          />
          <p class="smartcard-scan__hint">For demo: Try BADGE001 through BADGE010</p>
        </div>
        <button class="btn btn--primary smartcard-scan__submit" id="scan-btn">
          Verify Badge
        </button>
      </div>
    `;

    // Back button
    content.querySelector('#back-btn').addEventListener('click', () => {
      this.showModeSelection();
    });

    // Scan/Submit button
    const input = content.querySelector('#badge-input');
    const scanBtn = content.querySelector('#scan-btn');

    const handleScan = () => {
      const badgeId = input.value.trim().toUpperCase();
      if (!badgeId) {
        this.showError(input, 'Please enter a SmartCard ID');
        return;
      }

      const employee = EMPLOYEES.find(emp => emp.BadgeID.toUpperCase() === badgeId);
      if (!employee) {
        this.showError(input, 'SmartCard ID not found. Please try again.');
        return;
      }

      this.scannedUser = employee;
      this.showPackageList();
    };

    scanBtn.addEventListener('click', handleScan);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleScan();
    });

    this.container.appendChild(content);

    // Focus input
    setTimeout(() => input.focus(), 100);
  }

  /**
   * Show error on input
   */
  showError(input, message) {
    input.classList.add('smartcard-scan__input--error');

    // Remove existing error message
    const existingError = input.parentElement.querySelector('.smartcard-scan__error');
    if (existingError) existingError.remove();

    const errorEl = document.createElement('p');
    errorEl.className = 'smartcard-scan__error';
    errorEl.textContent = message;
    input.parentElement.appendChild(errorEl);

    setTimeout(() => {
      input.classList.remove('smartcard-scan__input--error');
      errorEl.remove();
    }, 3000);
  }

  /**
   * Show package list after successful scan
   */
  showPackageList() {
    this.container.innerHTML = '';

    // Get packages for this user based on mode
    let packages;
    let emptyMessage;
    let emptyDesc;

    if (this.currentMode === 'delivery') {
      // Delivery: Show packages the user has SENT that are still in "Sent" status
      // (not yet delivered to mailroom, not in transit)
      packages = PACKAGES.filter(pkg =>
        pkg.Sender.toLowerCase() === this.scannedUser.Email.toLowerCase() &&
        pkg.Status === 'Sent'
      ).map(pkg => ({
        ...pkg,
        SenderName: getEmployeeName(pkg.Sender),
        RecipientName: getEmployeeName(pkg.Recipient)
      }));
      emptyMessage = 'No packages to deliver';
      emptyDesc = 'You don\'t have any packages pending drop-off at the mailroom';
    } else {
      // Pickup: Show packages addressed to user that have arrived/stored
      packages = PACKAGES.filter(pkg =>
        pkg.Recipient.toLowerCase() === this.scannedUser.Email.toLowerCase() &&
        ['Arrived', 'Stored'].includes(pkg.Status)
      ).map(pkg => ({
        ...pkg,
        SenderName: getEmployeeName(pkg.Sender),
        RecipientName: getEmployeeName(pkg.Recipient)
      }));
      emptyMessage = 'No packages to pick up';
      emptyDesc = 'You don\'t have any packages waiting at the mailroom';
    }

    const modeLabel = this.currentMode === 'delivery' ? 'Delivery' : 'Pickup';

    const content = document.createElement('div');
    content.className = 'smartcard-packages';

    // Header with user info
    const header = document.createElement('div');
    header.className = 'smartcard-packages__header';
    header.innerHTML = `
      <button class="smartcard-back-btn" id="back-btn">
        &larr; Back
      </button>
      <div class="smartcard-packages__user-info">
        <div class="smartcard-packages__user-badge">${this.scannedUser.BadgeID}</div>
        <div class="smartcard-packages__user-details">
          <span class="smartcard-packages__user-name">${this.scannedUser.Name}</span>
          <span class="smartcard-packages__user-dept">${this.scannedUser.Department}</span>
        </div>
      </div>
      <div class="smartcard-packages__title-section">
        <h2 class="smartcard-packages__title">${modeLabel} - Packages</h2>
        <p class="smartcard-packages__count">${packages.length} package${packages.length !== 1 ? 's' : ''} found</p>
      </div>
    `;

    header.querySelector('#back-btn').addEventListener('click', () => {
      this.showScanCard();
    });

    content.appendChild(header);

    // Package list or empty state
    if (packages.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'smartcard-packages__empty';
      empty.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">${this.currentMode === 'delivery' ? '&#128230;' : '&#128229;'}</div>
          <div class="empty-state__message">${emptyMessage}</div>
          <div class="empty-state__description">${emptyDesc}</div>
        </div>
      `;
      content.appendChild(empty);
    } else {
      const listWrapper = document.createElement('div');
      listWrapper.className = 'smartcard-packages__list';

      packages.forEach(pkg => {
        const card = this.createPackageCard(pkg);
        listWrapper.appendChild(card);
      });

      content.appendChild(listWrapper);
    }

    this.container.appendChild(content);
  }

  /**
   * Create a package card
   */
  createPackageCard(pkg) {
    const statusColors = {
      'Sent': '#6c757d',
      'Received': '#0d6efd',
      'Stored': '#6610f2',
      'In Transit': '#fd7e14',
      'Arrived': '#20c997',
      'Delivered': '#198754'
    };

    const card = document.createElement('div');
    card.className = 'package-card';

    const recipientLabel = this.currentMode === 'delivery' ? 'To' : 'From';
    const personName = this.currentMode === 'delivery' ? pkg.RecipientName : pkg.SenderName;

    card.innerHTML = `
      <div class="package-card__header">
        <span class="package-card__tracking">${pkg.TrackingNumber}</span>
        <span class="status-badge" style="background-color: ${statusColors[pkg.Status]}">${pkg.Status}</span>
      </div>
      <div class="package-card__body">
        <h3 class="package-card__title">${pkg.TrackingNumber}</h3>
        <div class="package-card__details">
          <div class="package-card__detail">
            <span class="package-card__detail-label">${recipientLabel}</span>
            <span class="package-card__detail-value">${personName}</span>
          </div>
        </div>
      </div>
      <div class="package-card__footer">
        <button class="btn btn--primary package-card__action">
          ${this.currentMode === 'delivery' ? 'Print Label' : 'Confirm Pickup'}
        </button>
      </div>
    `;

    // Action button
    card.querySelector('.package-card__action').addEventListener('click', () => {
      this.confirmAction(pkg);
    });

    return card;
  }

  /**
   * Confirm delivery/pickup action
   */
  confirmAction(pkg) {
    if (this.currentMode === 'delivery') {
      // Show barcode print view for delivery
      this.showBarcodePrint(pkg);
    } else {
      // Show success modal for pickup
      this.showPickupSuccess(pkg);
    }
  }

  /**
   * Show barcode print view for delivery
   */
  showBarcodePrint(pkg) {
    this.container.innerHTML = '';

    const content = document.createElement('div');
    content.className = 'smartcard-barcode';

    content.innerHTML = `
      <div class="smartcard-barcode__header">
        <button class="smartcard-back-btn" id="back-btn">
          &larr; Back
        </button>
        <h2 class="smartcard-barcode__title">Print Package Label</h2>
        <p class="smartcard-barcode__description">Print this label and attach it to your package</p>
      </div>
      <div class="smartcard-barcode__content">
        <div class="barcode-label" id="barcode-label">
          <div class="barcode-label__header">
            <span class="barcode-label__logo">Pigeon</span>
            <span class="barcode-label__date">${new Date().toLocaleDateString()}</span>
          </div>
          <div class="barcode-label__barcode">
            <svg id="barcode-svg"></svg>
          </div>
          <div class="barcode-label__info">
            <div class="barcode-label__row">
              <span class="barcode-label__field-label">From:</span>
              <span class="barcode-label__field-value">${pkg.SenderName}</span>
            </div>
            <div class="barcode-label__row">
              <span class="barcode-label__field-label">To:</span>
              <span class="barcode-label__field-value">${pkg.RecipientName}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="smartcard-barcode__actions">
        <button class="btn btn--secondary" id="done-btn">Done</button>
        <button class="btn btn--primary" id="print-btn">
          <span>&#128424;</span> Print Label
        </button>
      </div>
    `;

    this.container.appendChild(content);

    // Generate barcode
    const barcodeSvg = content.querySelector('#barcode-svg');
    if (typeof JsBarcode !== 'undefined') {
      JsBarcode(barcodeSvg, pkg.TrackingNumber, {
        format: 'CODE128',
        width: 2,
        height: 80,
        displayValue: true,
        fontSize: 14,
        margin: 10,
        background: '#ffffff',
        lineColor: '#000000'
      });
    } else {
      barcodeSvg.innerHTML = `<text x="50%" y="50%" text-anchor="middle" fill="#666">Barcode: ${pkg.TrackingNumber}</text>`;
    }

    // Back button
    content.querySelector('#back-btn').addEventListener('click', () => {
      this.showPackageList();
    });

    // Done button
    content.querySelector('#done-btn').addEventListener('click', () => {
      this.showPackageList();
    });

    // Print button
    content.querySelector('#print-btn').addEventListener('click', () => {
      this.printLabel();
    });
  }

  /**
   * Print the barcode label
   */
  printLabel() {
    const labelContent = document.getElementById('barcode-label');
    if (!labelContent) return;

    const printWindow = window.open('', '_blank', 'width=400,height=600');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Package Label</title>
        <style>
          body {
            margin: 0;
            padding: 20px;
            font-family: Arial, sans-serif;
          }
          .barcode-label {
            border: 2px solid #000;
            padding: 15px;
            max-width: 350px;
            margin: 0 auto;
          }
          .barcode-label__header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
            padding-bottom: 10px;
            border-bottom: 1px solid #ccc;
          }
          .barcode-label__logo {
            font-size: 18px;
            font-weight: bold;
          }
          .barcode-label__date {
            font-size: 12px;
            color: #666;
          }
          .barcode-label__barcode {
            text-align: center;
            margin: 15px 0;
          }
          .barcode-label__barcode svg {
            max-width: 100%;
          }
          .barcode-label__info {
            font-size: 12px;
          }
          .barcode-label__row {
            display: flex;
            margin-bottom: 5px;
          }
          .barcode-label__field-label {
            font-weight: bold;
            width: 50px;
          }
          .barcode-label__field-value {
            flex: 1;
          }
        </style>
      </head>
      <body>
        ${labelContent.outerHTML}
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }

  /**
   * Show success modal for pickup
   */
  showPickupSuccess(pkg) {
    const modal = document.createElement('div');
    modal.className = 'success-modal';
    modal.innerHTML = `
      <div class="success-modal__backdrop"></div>
      <div class="success-modal__content">
        <div class="success-modal__icon">&#10003;</div>
        <h3 class="success-modal__title">Success!</h3>
        <p class="success-modal__message">Package has been picked up successfully.</p>
        <div class="success-modal__details">
          <div class="detail-row">
            <span class="detail-label">Tracking Number</span>
            <span class="detail-value tracking-number">${pkg.TrackingNumber}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">New Status</span>
            <span class="detail-value">Received</span>
          </div>
        </div>
        <div class="success-modal__actions">
          <button class="btn btn--primary" id="done-btn">Done</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('#done-btn').addEventListener('click', () => {
      modal.remove();
      this.showPackageList();
    });

    modal.querySelector('.success-modal__backdrop').addEventListener('click', () => {
      modal.remove();
      this.showPackageList();
    });
  }
}

export default SmartCardPage;
