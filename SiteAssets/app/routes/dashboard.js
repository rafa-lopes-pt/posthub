/**
 * Facilities Dashboard Page
 * Overview of all packages with metrics and management
 */

import { getAllPackages } from '../services/mockData.js';

/**
 * Dashboard Page Component
 */
export class DashboardPage {
  constructor(currentUser) {
    this.currentUser = currentUser;
    this.container = null;
    this.packages = getAllPackages();
    this.filterStatus = 'all';
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
      <h2 class="dashboard-page__title">Facilities Dashboard</h2>
      <p class="dashboard-page__description">Manage and track all packages across the organization</p>
    `;
    return header;
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

    const urgent = this.packages.filter(p =>
      p.Priority === 'Urgent' && !['Delivered', 'Received'].includes(p.Status)
    ).length;

    return {
      total: this.packages.length,
      today: todayPackages,
      pending: byStatus.sent + byStatus.inTransit + byStatus.stored + byStatus.arrived,
      delivered: byStatus.delivered + byStatus.received,
      inTransit: byStatus.inTransit,
      urgent: urgent
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
      { label: 'New Today', value: metrics.today, icon: '&#128197;', color: 'blue' },
      { label: 'In Transit', value: metrics.inTransit, icon: '&#128666;', color: 'orange' },
      { label: 'Pending', value: metrics.pending, icon: '&#9202;', color: 'yellow' },
      { label: 'Delivered', value: metrics.delivered, icon: '&#9989;', color: 'green' },
      { label: 'Urgent', value: metrics.urgent, icon: '&#9888;', color: 'red' }
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
    const columns = ['Tracking Number', 'Title', 'From', 'To', 'Status', 'Priority', 'Location', 'Date'];
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

      // Title
      const tdTitle = document.createElement('td');
      tdTitle.textContent = pkg.Title;
      row.appendChild(tdTitle);

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

      // Priority
      const tdPriority = document.createElement('td');
      const priorityBadge = document.createElement('span');
      priorityBadge.className = `priority-badge priority-badge--${(pkg.Priority || 'Standard').toLowerCase()}`;
      priorityBadge.textContent = pkg.Priority || 'Standard';
      tdPriority.appendChild(priorityBadge);
      row.appendChild(tdPriority);

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
          <h3 class="package-modal__title">${pkg.Title}</h3>
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
            <label>Priority</label>
            <span class="priority-badge priority-badge--${(pkg.Priority || 'Standard').toLowerCase()}">${pkg.Priority || 'Standard'}</span>
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
            <label>Destination</label>
            <span>${pkg.DestinationLocation}</span>
          </div>
          <div class="package-detail">
            <label>Details</label>
            <span>${pkg.PackageDetails || '-'}</span>
          </div>
          <div class="package-detail">
            <label>Notes</label>
            <span>${pkg.Notes || '-'}</span>
          </div>
          <div class="package-detail">
            <label>Created</label>
            <span>${new Date(pkg.Created).toLocaleString()}</span>
          </div>
        </div>
        <div class="package-modal__footer">
          <button class="btn btn--secondary modal-close-btn">Close</button>
          <button class="btn btn--primary">Update Status</button>
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
