/**
 * Package Table Component
 *
 * Displays packages in a tabular format with sorting, filtering, row selection,
 * and click handlers. Supports both view-only and selectable modes.
 *
 * @module components/packageTable
 */

import { Container } from '../libs/nofbiz/nofbiz.base.js';

/**
 * Status color mapping based on package status
 */
const STATUS_COLORS = {
  'Sent': '#6c757d',         // Gray
  'Received': '#0d6efd',     // Blue
  'Stored': '#6610f2',       // Purple
  'In Transit': '#fd7e14',   // Orange
  'Arrived': '#20c997',      // Teal
  'Delivered': '#198754'     // Green
};

/**
 * Creates a package table component with sorting, filtering, and selection
 *
 * @param {Object} options - Configuration options
 * @param {Array<Object>} options.packages - Array of package objects to display
 * @param {Array<string>} options.columns - Column keys to display (default: all)
 * @param {boolean} options.selectable - Enable row selection checkboxes (default: false)
 * @param {Function} options.onRowClick - Callback when row is clicked (package) => void
 * @param {Function} options.onSelectionChange - Callback when selection changes (selectedIds) => void
 * @param {boolean} options.showFilters - Show filter inputs (default: false)
 * @param {string} options.emptyMessage - Message when no packages (default: 'No packages found')
 * @param {string} options.class - Additional CSS classes
 * @returns {Container} SPARC Container with table element
 *
 * @example
 * const table = createPackageTable({
 *   packages: packagesArray,
 *   selectable: true,
 *   onRowClick: (pkg) => console.log('Clicked:', pkg),
 *   onSelectionChange: (ids) => console.log('Selected:', ids)
 * });
 */
export function createPackageTable(options = {}) {
  const {
    packages = [],
    columns = ['TrackingNumber', 'Sender', 'Recipient', 'Status', 'CurrentLocation', 'Created'],
    selectable = false,
    onRowClick = null,
    onSelectionChange = null,
    showFilters = false,
    emptyMessage = 'No packages found',
    class: className = ''
  } = options;

  // State management
  const state = {
    packages: [...packages],
    selectedIds: new Set(),
    sortColumn: null,
    sortDirection: 'asc', // 'asc' or 'desc'
    filters: {}
  };

  // Column display names
  const columnNames = {
    TrackingNumber: 'Tracking Number',
    Sender: 'Sender',
    Recipient: 'Recipient',
    Status: 'Status',
    CurrentLocation: 'Current Location',
    PackageDetails: 'Details',
    Created: 'Created',
    Modified: 'Last Updated'
  };

  // Create container
  const container = document.createElement('div');
  container.className = `nofbiz__package-table ${className}`.trim();
  container.setAttribute('data-component', 'package-table');

  /**
   * Format value for display
   */
  function formatValue(key, value, packageObj) {
    if (!value) return '-';

    switch (key) {
      case 'Sender':
      case 'Recipient':
        return value.Title || value.Name || value;

      case 'CurrentLocation':
        return value.Title || value;

      case 'Status':
        const color = STATUS_COLORS[value] || '#6c757d';
        return `<span class="nofbiz__status-badge" style="background-color: ${color}">${value}</span>`;

      case 'Created':
      case 'Modified':
        return new Date(value).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

      default:
        return value;
    }
  }

  /**
   * Sort packages by column
   */
  function sortPackages(column) {
    // Toggle direction if same column
    if (state.sortColumn === column) {
      state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      state.sortColumn = column;
      state.sortDirection = 'asc';
    }

    state.packages.sort((a, b) => {
      let aVal = a[column];
      let bVal = b[column];

      // Handle nested objects (Sender, Recipient, Location)
      if (aVal && typeof aVal === 'object') aVal = aVal.Title || aVal.Name || '';
      if (bVal && typeof bVal === 'object') bVal = bVal.Title || bVal.Name || '';

      // Handle dates
      if (column === 'Created' || column === 'Modified') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      // Compare
      if (aVal < bVal) return state.sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return state.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    render();
  }

  /**
   * Filter packages
   */
  function filterPackages() {
    const filtered = packages.filter(pkg => {
      return Object.keys(state.filters).every(key => {
        const filterValue = state.filters[key].toLowerCase();
        if (!filterValue) return true;

        let pkgValue = pkg[key];
        if (pkgValue && typeof pkgValue === 'object') {
          pkgValue = pkgValue.Title || pkgValue.Name || '';
        }
        return String(pkgValue).toLowerCase().includes(filterValue);
      });
    });

    state.packages = filtered;
    render();
  }

  /**
   * Handle checkbox change
   */
  function handleCheckboxChange(packageId, checked) {
    if (checked) {
      state.selectedIds.add(packageId);
    } else {
      state.selectedIds.delete(packageId);
    }

    // Update select all checkbox
    const selectAllCheckbox = container.querySelector('.nofbiz__select-all-checkbox');
    if (selectAllCheckbox) {
      selectAllCheckbox.checked = state.selectedIds.size === state.packages.length && state.packages.length > 0;
      selectAllCheckbox.indeterminate = state.selectedIds.size > 0 && state.selectedIds.size < state.packages.length;
    }

    // Trigger callback
    if (onSelectionChange) {
      onSelectionChange(Array.from(state.selectedIds));
    }
  }

  /**
   * Handle select all
   */
  function handleSelectAll(checked) {
    if (checked) {
      state.packages.forEach(pkg => state.selectedIds.add(pkg.Id || pkg.ID));
    } else {
      state.selectedIds.clear();
    }

    // Update all row checkboxes
    container.querySelectorAll('.nofbiz__row-checkbox').forEach(checkbox => {
      checkbox.checked = checked;
    });

    // Trigger callback
    if (onSelectionChange) {
      onSelectionChange(Array.from(state.selectedIds));
    }
  }

  /**
   * Handle row click
   */
  function handleRowClick(pkg, event) {
    // Don't trigger if clicking checkbox
    if (event.target.type === 'checkbox') return;

    if (onRowClick) {
      onRowClick(pkg);
    }
  }

  /**
   * Render table
   */
  function render() {
    // Clear container
    container.innerHTML = '';

    // Empty state
    if (state.packages.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'nofbiz__empty-state';
      emptyDiv.innerHTML = `
        <div class="nofbiz__empty-icon">📦</div>
        <div class="nofbiz__empty-message">${emptyMessage}</div>
      `;
      container.appendChild(emptyDiv);
      return;
    }

    // Create table
    const table = document.createElement('table');
    table.className = 'nofbiz__table';

    // Table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    // Select all checkbox
    if (selectable) {
      const th = document.createElement('th');
      th.className = 'nofbiz__select-column';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'nofbiz__select-all-checkbox';
      checkbox.checked = state.selectedIds.size === state.packages.length && state.packages.length > 0;
      checkbox.addEventListener('change', (e) => handleSelectAll(e.target.checked));
      th.appendChild(checkbox);
      headerRow.appendChild(th);
    }

    // Column headers
    columns.forEach(col => {
      const th = document.createElement('th');
      th.className = 'nofbiz__table-header';
      th.setAttribute('data-column', col);

      const headerContent = document.createElement('div');
      headerContent.className = 'nofbiz__header-content';

      const headerText = document.createElement('span');
      headerText.textContent = columnNames[col] || col;
      headerContent.appendChild(headerText);

      // Sort indicator
      if (state.sortColumn === col) {
        const sortIcon = document.createElement('span');
        sortIcon.className = 'nofbiz__sort-icon';
        sortIcon.textContent = state.sortDirection === 'asc' ? '▲' : '▼';
        headerContent.appendChild(sortIcon);
      }

      th.appendChild(headerContent);
      th.style.cursor = 'pointer';
      th.addEventListener('click', () => sortPackages(col));

      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);

    // Filter row
    if (showFilters) {
      const filterRow = document.createElement('tr');
      filterRow.className = 'nofbiz__filter-row';

      if (selectable) {
        filterRow.appendChild(document.createElement('th'));
      }

      columns.forEach(col => {
        const th = document.createElement('th');
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'nofbiz__filter-input';
        input.placeholder = `Filter ${columnNames[col] || col}...`;
        input.value = state.filters[col] || '';
        input.addEventListener('input', (e) => {
          state.filters[col] = e.target.value;
          filterPackages();
        });
        th.appendChild(input);
        filterRow.appendChild(th);
      });

      thead.appendChild(filterRow);
    }

    table.appendChild(thead);

    // Table body
    const tbody = document.createElement('tbody');

    state.packages.forEach(pkg => {
      const packageId = pkg.Id || pkg.ID;
      const row = document.createElement('tr');
      row.className = 'nofbiz__table-row';
      row.setAttribute('data-package-id', packageId);

      if (onRowClick) {
        row.classList.add('nofbiz__table-row--clickable');
        row.addEventListener('click', (e) => handleRowClick(pkg, e));
      }

      // Select checkbox
      if (selectable) {
        const td = document.createElement('td');
        td.className = 'nofbiz__select-cell';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'nofbiz__row-checkbox';
        checkbox.checked = state.selectedIds.has(packageId);
        checkbox.addEventListener('change', (e) => {
          e.stopPropagation();
          handleCheckboxChange(packageId, e.target.checked);
        });
        td.appendChild(checkbox);
        row.appendChild(td);
      }

      // Data cells
      columns.forEach(col => {
        const td = document.createElement('td');
        td.className = `nofbiz__table-cell nofbiz__table-cell--${col.toLowerCase()}`;
        td.innerHTML = formatValue(col, pkg[col], pkg);
        row.appendChild(td);
      });

      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    container.appendChild(table);
  }

  // Initial render
  render();

  // Public API on container
  container.refresh = (newPackages) => {
    state.packages = [...newPackages];
    state.selectedIds.clear();
    render();
  };

  container.getSelectedIds = () => {
    return Array.from(state.selectedIds);
  };

  container.clearSelection = () => {
    state.selectedIds.clear();
    render();
  };

  // Return SPARC Container
  return new Container([container]);
}

/**
 * Helper function to get selected package IDs from a table element
 *
 * @param {HTMLElement} tableElement - The table container element
 * @returns {Array<number>} Array of selected package IDs
 *
 * @example
 * const selectedIds = getSelectedPackages(tableElement);
 * console.log('Selected:', selectedIds);
 */
export function getSelectedPackages(tableElement) {
  if (!tableElement) return [];

  const container = tableElement.querySelector('[data-component="package-table"]');
  if (!container || !container.getSelectedIds) return [];

  return container.getSelectedIds();
}

export default createPackageTable;
