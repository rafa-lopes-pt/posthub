/**
 * Packages Page
 * Displays user's incoming and sent packages with tabbed interface
 */

import { getIncomingPackages, getSentPackages } from '../services/mockData.js';
import { createPackageTable } from '../components/packageTable.js';

/**
 * Packages Page Component
 */
export class PackagesPage {
  constructor(currentUser) {
    this.currentUser = currentUser;
    this.activeTab = 'incoming';
    this.container = null;
    this.incomingPackages = getIncomingPackages(currentUser.email);
    this.sentPackages = getSentPackages(currentUser.email);
  }

  /**
   * Render the page
   */
  render() {
    this.container = document.createElement('div');
    this.container.className = 'packages-page';

    // Page header
    const header = this.createPageHeader();
    this.container.appendChild(header);

    // Summary cards
    const summary = this.createSummaryCards();
    this.container.appendChild(summary);

    // Tabs
    const tabs = this.createTabs();
    this.container.appendChild(tabs);

    // Tab content
    const tabContent = document.createElement('div');
    tabContent.className = 'packages-page__content';
    tabContent.id = 'tab-content';
    this.container.appendChild(tabContent);

    // Render initial tab
    this.renderTabContent();

    return this.container;
  }

  /**
   * Create page header
   */
  createPageHeader() {
    const header = document.createElement('div');
    header.className = 'packages-page__header';
    header.innerHTML = `
      <h2 class="packages-page__title">My Packages</h2>
      <p class="packages-page__description">View and track packages you're receiving or have sent</p>
    `;
    return header;
  }

  /**
   * Create summary cards
   */
  createSummaryCards() {
    const pendingIncoming = this.incomingPackages.filter(p =>
      !['Delivered', 'Received'].includes(p.Status)
    ).length;

    const pendingSent = this.sentPackages.filter(p =>
      !['Delivered', 'Received'].includes(p.Status)
    ).length;

    const summary = document.createElement('div');
    summary.className = 'packages-page__summary';
    summary.innerHTML = `
      <div class="summary-card summary-card--incoming">
        <div class="summary-card__icon">📥</div>
        <div class="summary-card__content">
          <div class="summary-card__number">${this.incomingPackages.length}</div>
          <div class="summary-card__label">Incoming Packages</div>
          <div class="summary-card__pending">${pendingIncoming} pending</div>
        </div>
      </div>
      <div class="summary-card summary-card--sent">
        <div class="summary-card__icon">📤</div>
        <div class="summary-card__content">
          <div class="summary-card__number">${this.sentPackages.length}</div>
          <div class="summary-card__label">Sent Packages</div>
          <div class="summary-card__pending">${pendingSent} in transit</div>
        </div>
      </div>
    `;
    return summary;
  }

  /**
   * Create tabs
   */
  createTabs() {
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'packages-page__tabs';

    const tabs = [
      { id: 'incoming', label: 'Incoming', count: this.incomingPackages.length },
      { id: 'sent', label: 'Sent', count: this.sentPackages.length }
    ];

    tabs.forEach(tab => {
      const button = document.createElement('button');
      button.className = `tab-button ${this.activeTab === tab.id ? 'tab-button--active' : ''}`;
      button.setAttribute('data-tab', tab.id);
      button.innerHTML = `
        ${tab.label}
        <span class="tab-button__count">${tab.count}</span>
      `;
      button.addEventListener('click', () => this.switchTab(tab.id));
      tabsContainer.appendChild(button);
    });

    return tabsContainer;
  }

  /**
   * Switch between tabs
   */
  switchTab(tabId) {
    this.activeTab = tabId;

    // Update tab buttons
    this.container.querySelectorAll('.tab-button').forEach(btn => {
      btn.classList.toggle('tab-button--active', btn.getAttribute('data-tab') === tabId);
    });

    // Re-render content
    this.renderTabContent();
  }

  /**
   * Render tab content
   */
  renderTabContent() {
    const contentContainer = this.container.querySelector('#tab-content');
    contentContainer.innerHTML = '';

    const packages = this.activeTab === 'incoming'
      ? this.incomingPackages
      : this.sentPackages;

    if (packages.length === 0) {
      const emptyState = this.createEmptyState();
      contentContainer.appendChild(emptyState);
      return;
    }

    // Create table with appropriate columns
    const columns = this.activeTab === 'incoming'
      ? ['TrackingNumber', 'SenderName', 'Status', 'Priority', 'CurrentLocation', 'Created']
      : ['TrackingNumber', 'RecipientName', 'Status', 'Priority', 'CurrentLocation', 'Created'];

    // Custom column names for display
    const tableWrapper = document.createElement('div');
    tableWrapper.className = 'packages-table-wrapper';

    const table = this.createCustomTable(packages, columns);
    tableWrapper.appendChild(table);
    contentContainer.appendChild(tableWrapper);
  }

  /**
   * Create custom table (simpler version without nofbiz dependency issues)
   */
  createCustomTable(packages, columns) {
    const columnLabels = {
      TrackingNumber: 'Tracking Number',
      SenderName: 'From',
      RecipientName: 'To',
      Status: 'Status',
      Priority: 'Priority',
      CurrentLocation: 'Location',
      Created: 'Date'
    };

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
    columns.forEach(col => {
      const th = document.createElement('th');
      th.textContent = columnLabels[col] || col;
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

      columns.forEach(col => {
        const td = document.createElement('td');

        if (col === 'Status') {
          const badge = document.createElement('span');
          badge.className = 'status-badge';
          badge.style.backgroundColor = statusColors[pkg[col]] || '#6c757d';
          badge.textContent = pkg[col];
          td.appendChild(badge);
        } else if (col === 'Priority') {
          const badge = document.createElement('span');
          badge.className = `priority-badge priority-badge--${(pkg[col] || 'Standard').toLowerCase()}`;
          badge.textContent = pkg[col] || 'Standard';
          td.appendChild(badge);
        } else if (col === 'Created') {
          td.textContent = new Date(pkg[col]).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        } else if (col === 'TrackingNumber') {
          td.className = 'tracking-number';
          td.textContent = pkg[col];
        } else {
          td.textContent = pkg[col] || '-';
        }

        row.appendChild(td);
      });

      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    container.appendChild(table);

    return container;
  }

  /**
   * Create empty state
   */
  createEmptyState() {
    const emptyState = document.createElement('div');
    emptyState.className = 'packages-page__empty';

    const message = this.activeTab === 'incoming'
      ? 'No incoming packages'
      : 'No sent packages';

    const description = this.activeTab === 'incoming'
      ? 'Packages addressed to you will appear here'
      : 'Packages you send will be tracked here';

    emptyState.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">${this.activeTab === 'incoming' ? '📥' : '📤'}</div>
        <div class="empty-state__message">${message}</div>
        <div class="empty-state__description">${description}</div>
      </div>
    `;
    return emptyState;
  }

  /**
   * Show package details modal
   */
  showPackageDetails(pkg) {
    // Remove any existing modal
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
            <span>${pkg.SenderName}</span>
          </div>
          <div class="package-detail">
            <label>To</label>
            <span>${pkg.RecipientName}</span>
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
          <div class="package-detail">
            <label>Last Updated</label>
            <span>${new Date(pkg.Modified).toLocaleString()}</span>
          </div>
        </div>
      </div>
    `;

    // Close handlers
    const closeBtn = modal.querySelector('.package-modal__close');
    const backdrop = modal.querySelector('.package-modal__backdrop');

    const closeModal = () => modal.remove();
    closeBtn.addEventListener('click', closeModal);
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

export default PackagesPage;
