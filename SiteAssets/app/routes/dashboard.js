/**
 * Facilities Dashboard Page
 * Overview of all packages with metrics and management
 */

import { getAllPackages, EMPLOYEES, PACKAGES } from '../services/mockData.js';

/**
 * Dashboard Page Component
 */
export class DashboardPage {
  constructor(currentUser) {
    this.currentUser = currentUser;
    this.container = null;
    this.packages = getAllPackages();
    this.filterStatus = 'all';
    this.currentView = 'dashboard'; // 'dashboard' or 'scan'
  }

  /**
   * Render the page
   */
  render() {
    this.container = document.createElement('div');
    this.container.className = 'dashboard-page';

    // Page header
    const header = this.createPageHeader();
    this.container.appendChild(header);

    // Metrics cards
    const metrics = this.createMetricsSection();
    this.container.appendChild(metrics);

    // Filters
    const filters = this.createFilters();
    this.container.appendChild(filters);

    // Package list
    const packageList = document.createElement('div');
    packageList.className = 'dashboard-page__list';
    packageList.id = 'package-list';
    this.container.appendChild(packageList);

    this.renderPackageList();

    return this.container;
  }

  /**
   * Create page header
   */
  createPageHeader() {
    const header = document.createElement('div');
    header.className = 'dashboard-page__header';
    header.innerHTML = `
      <div class="dashboard-page__header-content">
        <h2 class="dashboard-page__title">Facilities Dashboard</h2>
        <p class="dashboard-page__description">Manage and track all packages across the organization</p>
      </div>
      <button class="btn btn--primary dashboard-page__scan-btn" id="scan-package-btn">
        <span>&#128230;</span> Scan Package
      </button>
    `;

    header.querySelector('#scan-package-btn').addEventListener('click', () => {
      this.showScanView();
    });

    return header;
  }

  /**
   * Show barcode scan view
   */
  showScanView() {
    this.currentView = 'scan';
    this.container.innerHTML = '';

    const content = document.createElement('div');
    content.className = 'dashboard-scan';

    content.innerHTML = `
      <button class="smartcard-back-btn" id="back-btn">
        &larr; Back to Dashboard
      </button>
      <div class="dashboard-scan__card">
        <div class="dashboard-scan__icon">&#128230;</div>
        <h2 class="dashboard-scan__title">Scan Package</h2>
        <p class="dashboard-scan__description">Scan a package barcode to view or update its status</p>
        <div class="dashboard-scan__input-group">
          <label for="barcode-input" class="dashboard-scan__label">Tracking Number</label>
          <input
            type="text"
            id="barcode-input"
            class="dashboard-scan__input"
            placeholder="Scan barcode or enter tracking number"
            autofocus
          />
        </div>
        <button class="btn btn--primary dashboard-scan__submit" id="verify-btn">
          Verify Barcode
        </button>
      </div>
    `;

    // Back button
    content.querySelector('#back-btn').addEventListener('click', () => {
      this.showDashboardView();
    });

    // Verify button - placeholder for now
    const input = content.querySelector('#barcode-input');
    const verifyBtn = content.querySelector('#verify-btn');

    const handleVerify = () => {
      const trackingNumber = input.value.trim().toUpperCase();
      if (!trackingNumber) {
        this.showScanError(input, 'Please enter a tracking number');
        return;
      }

      // Find the package
      const pkg = PACKAGES.find(p => p.TrackingNumber.toUpperCase() === trackingNumber);
      if (!pkg) {
        this.showScanError(input, 'Package not found. Please check the tracking number.');
        return;
      }

      // Show update modal
      this.showUpdatePackageModal(pkg);
    };

    verifyBtn.addEventListener('click', handleVerify);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleVerify();
    });

    this.container.appendChild(content);

    // Focus input
    setTimeout(() => input.focus(), 100);
  }

  /**
   * Show error on scan input
   */
  showScanError(input, message) {
    input.classList.add('dashboard-scan__input--error');

    const existingError = input.parentElement.querySelector('.dashboard-scan__error');
    if (existingError) existingError.remove();

    const errorEl = document.createElement('p');
    errorEl.className = 'dashboard-scan__error';
    errorEl.textContent = message;
    input.parentElement.appendChild(errorEl);

    setTimeout(() => {
      input.classList.remove('dashboard-scan__input--error');
      errorEl.remove();
    }, 3000);
  }

  /**
   * Show update package modal
   */
  showUpdatePackageModal(pkg) {
    const existingModal = document.querySelector('.update-package-modal');
    if (existingModal) existingModal.remove();

    const statusOptions = ['In Transit', 'Arrived', 'Stored'];

    const modal = document.createElement('div');
    modal.className = 'update-package-modal';
    modal.innerHTML = `
      <div class="update-package-modal__backdrop"></div>
      <div class="update-package-modal__content">
        <div class="update-package-modal__header">
          <h3 class="update-package-modal__title">Update Package</h3>
          <button class="update-package-modal__close">&times;</button>
        </div>
        <div class="update-package-modal__body">
          <div class="update-package-modal__info">
            <div class="update-package-modal__tracking">${pkg.TrackingNumber}</div>
            <div class="update-package-modal__current">
              <span>Current Status: <strong>${pkg.Status}</strong></span>
              <span>Current Location: <strong>${pkg.CurrentLocation}</strong></span>
            </div>
          </div>
          <form class="update-package-form" id="update-package-form">
            <div class="form-group">
              <label class="form-label" for="new-status">New Status<span class="required">*</span></label>
              <select class="form-input form-select" id="new-status" name="status" required>
                ${statusOptions.map(status =>
                  `<option value="${status}" ${status === 'Arrived' ? 'selected' : ''}>${status}</option>`
                ).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="new-location">New Location<span class="required">*</span></label>
              <input type="text" class="form-input" id="new-location" name="location"
                value="${pkg.CurrentLocation}" placeholder="e.g., Mailroom A, Room 102" required />
            </div>
            <div class="form-group" id="locker-id-group" style="display: none;">
              <label class="form-label" for="locker-id">Locker ID</label>
              <input type="text" class="form-input" id="locker-id" name="lockerId"
                placeholder="e.g., L-101, A-25" />
            </div>
          </form>
        </div>
        <div class="update-package-modal__footer">
          <button class="btn btn--secondary" id="modal-cancel-btn">Cancel</button>
          <button class="btn btn--primary" id="modal-update-btn">Update Package</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Close handlers
    const closeModal = () => modal.remove();
    modal.querySelector('.update-package-modal__close').addEventListener('click', closeModal);
    modal.querySelector('.update-package-modal__backdrop').addEventListener('click', closeModal);
    modal.querySelector('#modal-cancel-btn').addEventListener('click', closeModal);

    // Show/hide locker ID based on status
    const statusSelect = modal.querySelector('#new-status');
    const lockerIdGroup = modal.querySelector('#locker-id-group');

    statusSelect.addEventListener('change', () => {
      lockerIdGroup.style.display = statusSelect.value === 'Stored' ? 'block' : 'none';
    });

    // Update handler
    modal.querySelector('#modal-update-btn').addEventListener('click', () => {
      const form = modal.querySelector('#update-package-form');
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const newStatus = modal.querySelector('#new-status').value;
      const newLocation = modal.querySelector('#new-location').value;
      const lockerId = modal.querySelector('#locker-id').value.trim();

      // Update package (in real app, this would be an API call)
      pkg.Status = newStatus;
      pkg.CurrentLocation = newLocation;
      pkg.LockerId = lockerId;
      pkg.Modified = new Date().toISOString();

      // Show success and close
      closeModal();
      this.showUpdateSuccess(pkg);
    });
  }

  /**
   * Show update success message
   */
  showUpdateSuccess(pkg) {
    const modal = document.createElement('div');
    modal.className = 'success-modal';
    modal.innerHTML = `
      <div class="success-modal__backdrop"></div>
      <div class="success-modal__content">
        <div class="success-modal__icon">&#10003;</div>
        <h3 class="success-modal__title">Package Updated!</h3>
        <p class="success-modal__message">Package status has been updated successfully.</p>
        <div class="success-modal__details">
          <div class="detail-row">
            <span class="detail-label">Tracking Number</span>
            <span class="detail-value tracking-number">${pkg.TrackingNumber}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">New Status</span>
            <span class="detail-value">${pkg.Status}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Location</span>
            <span class="detail-value">${pkg.CurrentLocation}</span>
          </div>
          ${pkg.LockerId ? `
          <div class="detail-row">
            <span class="detail-label">Locker ID</span>
            <span class="detail-value">${pkg.LockerId}</span>
          </div>
          ` : ''}
        </div>
        <div class="success-modal__actions">
          <button class="btn btn--secondary" id="scan-another-btn">Scan Another</button>
          <button class="btn btn--primary" id="done-btn">Done</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('#done-btn').addEventListener('click', () => {
      modal.remove();
      this.showDashboardView();
    });

    modal.querySelector('#scan-another-btn').addEventListener('click', () => {
      modal.remove();
      // Clear the input and keep scanning
      const input = document.querySelector('#barcode-input');
      if (input) {
        input.value = '';
        input.focus();
      }
    });

    modal.querySelector('.success-modal__backdrop').addEventListener('click', () => {
      modal.remove();
      this.showDashboardView();
    });
  }

  /**
   * Show dashboard view
   */
  showDashboardView() {
    this.currentView = 'dashboard';
    this.container.innerHTML = '';

    // Page header
    const header = this.createPageHeader();
    this.container.appendChild(header);

    // Metrics cards
    const metrics = this.createMetricsSection();
    this.container.appendChild(metrics);

    // Filters
    const filters = this.createFilters();
    this.container.appendChild(filters);

    // Package list
    const packageList = document.createElement('div');
    packageList.className = 'dashboard-page__list';
    packageList.id = 'package-list';
    this.container.appendChild(packageList);

    this.renderPackageList();
  }

  /**
   * Calculate metrics
   */
  getMetrics() {
    const today = new Date().toDateString();

    const todayPackages = this.packages.filter(p =>
      new Date(p.Created).toDateString() === today
    ).length;

    const byStatus = {
      sent: this.packages.filter(p => p.Status === 'Sent').length,
      inTransit: this.packages.filter(p => p.Status === 'In Transit').length,
      stored: this.packages.filter(p => p.Status === 'Stored').length,
      arrived: this.packages.filter(p => p.Status === 'Arrived').length,
      delivered: this.packages.filter(p => p.Status === 'Delivered').length,
      received: this.packages.filter(p => p.Status === 'Received').length
    };

    return {
      total: this.packages.length,
      today: todayPackages,
      pending: byStatus.sent + byStatus.inTransit + byStatus.stored + byStatus.arrived,
      delivered: byStatus.delivered + byStatus.received,
      inTransit: byStatus.inTransit
    };
  }

  /**
   * Create metrics section
   */
  createMetricsSection() {
    const metrics = this.getMetrics();

    const section = document.createElement('div');
    section.className = 'dashboard-metrics';

    const metricsData = [
      { label: 'Total Packages', value: metrics.total, icon: '&#128230;', color: 'default' },
      { label: 'In Transit', value: metrics.inTransit, icon: '&#128666;', color: 'orange' },
      { label: 'Delivered', value: metrics.delivered, icon: '&#9989;', color: 'green' }
    ];

    metricsData.forEach(metric => {
      const card = document.createElement('div');
      card.className = `metric-card metric-card--${metric.color}`;
      card.innerHTML = `
        <div class="metric-card__icon">${metric.icon}</div>
        <div class="metric-card__value">${metric.value}</div>
        <div class="metric-card__label">${metric.label}</div>
      `;
      section.appendChild(card);
    });

    return section;
  }

  /**
   * Create filters section
   */
  createFilters() {
    const section = document.createElement('div');
    section.className = 'dashboard-filters';

    const statuses = [
      { value: 'all', label: 'All Packages' },
      { value: 'Sent', label: 'Sent' },
      { value: 'In Transit', label: 'In Transit' },
      { value: 'Stored', label: 'Stored' },
      { value: 'Arrived', label: 'Arrived' },
      { value: 'Delivered', label: 'Delivered' },
      { value: 'Received', label: 'Received' }
    ];

    statuses.forEach(status => {
      const btn = document.createElement('button');
      btn.className = `filter-btn ${this.filterStatus === status.value ? 'filter-btn--active' : ''}`;
      btn.textContent = status.label;
      btn.addEventListener('click', () => {
        this.filterStatus = status.value;
        this.container.querySelectorAll('.filter-btn').forEach(b =>
          b.classList.toggle('filter-btn--active', b.textContent === status.label)
        );
        this.renderPackageList();
      });
      section.appendChild(btn);
    });

    return section;
  }

  /**
   * Render package list
   */
  renderPackageList() {
    const listContainer = this.container.querySelector('#package-list');
    listContainer.innerHTML = '';

    let filteredPackages = this.packages;
    if (this.filterStatus !== 'all') {
      filteredPackages = this.packages.filter(p => p.Status === this.filterStatus);
    }

    if (filteredPackages.length === 0) {
      listContainer.innerHTML = `
        <div class="dashboard-empty">
          <div class="empty-state__icon">&#128230;</div>
          <div class="empty-state__message">No packages found</div>
          <div class="empty-state__description">No packages match the selected filter</div>
        </div>
      `;
      return;
    }

    const tableWrapper = document.createElement('div');
    tableWrapper.className = 'dashboard-table-wrapper';

    const table = this.createTable(filteredPackages);
    tableWrapper.appendChild(table);
    listContainer.appendChild(tableWrapper);
  }

  /**
   * Create packages table
   */
  createTable(packages) {
    const statusColors = {
      'Sent': '#6c757d',
      'Received': '#0d6efd',
      'Stored': '#6610f2',
      'In Transit': '#fd7e14',
      'Arrived': '#20c997',
      'Delivered': '#198754'
    };

    const container = document.createElement('div');
    container.className = 'packages-table';

    const table = document.createElement('table');
    table.className = 'packages-table__table';

    // Header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const columns = ['Tracking Number', 'From', 'To', 'Status', 'Location', 'Date'];
    columns.forEach(col => {
      const th = document.createElement('th');
      th.textContent = col;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Body
    const tbody = document.createElement('tbody');
    packages.forEach(pkg => {
      const row = document.createElement('tr');
      row.className = 'packages-table__row';
      row.addEventListener('click', () => this.showPackageDetails(pkg));

      // Tracking Number
      const tdTracking = document.createElement('td');
      tdTracking.className = 'tracking-number';
      tdTracking.textContent = pkg.TrackingNumber;
      row.appendChild(tdTracking);

      // From
      const tdFrom = document.createElement('td');
      tdFrom.textContent = pkg.SenderName;
      row.appendChild(tdFrom);

      // To
      const tdTo = document.createElement('td');
      tdTo.textContent = pkg.RecipientName;
      row.appendChild(tdTo);

      // Status
      const tdStatus = document.createElement('td');
      const statusBadge = document.createElement('span');
      statusBadge.className = 'status-badge';
      statusBadge.style.backgroundColor = statusColors[pkg.Status] || '#6c757d';
      statusBadge.textContent = pkg.Status;
      tdStatus.appendChild(statusBadge);
      row.appendChild(tdStatus);

      // Location
      const tdLocation = document.createElement('td');
      tdLocation.textContent = pkg.CurrentLocation;
      row.appendChild(tdLocation);

      // Date
      const tdDate = document.createElement('td');
      tdDate.textContent = new Date(pkg.Created).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      row.appendChild(tdDate);

      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    container.appendChild(table);

    return container;
  }

  /**
   * Show package details modal
   */
  showPackageDetails(pkg) {
    const existingModal = document.querySelector('.package-modal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.className = 'package-modal';
    modal.innerHTML = `
      <div class="package-modal__backdrop"></div>
      <div class="package-modal__content">
        <div class="package-modal__header">
          <h3 class="package-modal__title">${pkg.TrackingNumber}</h3>
          <button class="package-modal__close">&times;</button>
        </div>
        <div class="package-modal__body">
          <div class="package-detail">
            <label>Tracking Number</label>
            <span class="tracking-number">${pkg.TrackingNumber}</span>
          </div>
          <div class="package-detail">
            <label>Status</label>
            <span class="status-badge" style="background-color: ${this.getStatusColor(pkg.Status)}">${pkg.Status}</span>
          </div>
          <div class="package-detail">
            <label>From</label>
            <span>${pkg.SenderName} (${pkg.Sender})</span>
          </div>
          <div class="package-detail">
            <label>To</label>
            <span>${pkg.RecipientName} (${pkg.Recipient})</span>
          </div>
          <div class="package-detail">
            <label>Current Location</label>
            <span>${pkg.CurrentLocation}</span>
          </div>
          <div class="package-detail">
            <label>Details</label>
            <span>${pkg.PackageDetails || '-'}</span>
          </div>
          <div class="package-detail">
            <label>Created</label>
            <span>${new Date(pkg.Created).toLocaleString()}</span>
          </div>
        </div>
        <div class="package-modal__footer">
          <button class="btn btn--primary modal-close-btn">Close</button>
        </div>
      </div>
    `;

    // Close handlers
    const closeBtn = modal.querySelector('.package-modal__close');
    const closeBtn2 = modal.querySelector('.modal-close-btn');
    const backdrop = modal.querySelector('.package-modal__backdrop');

    const closeModal = () => modal.remove();
    closeBtn.addEventListener('click', closeModal);
    closeBtn2.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);

    document.body.appendChild(modal);
  }

  /**
   * Get status color
   */
  getStatusColor(status) {
    const colors = {
      'Sent': '#6c757d',
      'Received': '#0d6efd',
      'Stored': '#6610f2',
      'In Transit': '#fd7e14',
      'Arrived': '#20c997',
      'Delivered': '#198754'
    };
    return colors[status] || '#6c757d';
  }
}

export default DashboardPage;
