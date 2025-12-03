/**
 * Facilities Dashboard Route
 * Overview of all packages for facilities staff
 */

import {
  Text,
  Card,
  Container,
  Button,
  LinkButton,
  defineRoute,
  View,
  Loader
} from '../../../libs/nofbiz/nofbiz.base.js';
import { getAllPackages, getPackageStatistics } from '../../../utils/sharepoint.js';
import { hasFacilitiesAccess, requirePermission } from '../../../utils/permissions.js';
import { createPackageTable } from '../../../components/packageTable.js';

export default defineRoute(async (config) => {
  config.setRouteTitle('Facilities Dashboard - PostHub');

  // Check permissions
  requirePermission('facilities/dashboard');

  if (!hasFacilitiesAccess()) {
    return [
      new Text('Access Denied', { type: 'h1' }),
      new Text('You do not have permission to access this page.', { type: 'p' })
    ];
  }

  const loadingView = new View([new Loader()], { showOnRender: true });
  const contentView = new View([], { showOnRender: false });
  const statsContainer = new Container([], { class: 'stats-grid' });

  // Current filter
  let currentStatus = null;

  // Load dashboard
  async function loadDashboard(status = null) {
    try {
      loadingView.show();
      contentView.hide();

      // Load statistics
      const stats = await getPackageStatistics();

      // Update stats display
      const statCards = [
        { label: 'Total', value: stats.total, class: 'stat-total' },
        { label: 'Sent', value: stats.sent, class: 'stat-sent' },
        { label: 'Received', value: stats.received, class: 'stat-received' },
        { label: 'In Transit', value: stats.inTransit, class: 'stat-transit' },
        { label: 'Delivered', value: stats.delivered, class: 'stat-delivered' }
      ];

      const statComponents = statCards.map(stat => {
        return new Container([
          new Text(stat.value.toString(), { type: 'div', class: 'stat-value' }),
          new Text(stat.label, { type: 'div', class: 'stat-label' })
        ], { class: `stat-card ${stat.class}` });
      });

      statsContainer.children = statComponents;

      // Load packages
      const packages = await getAllPackages({ status: status, top: 100 });

      // Update table
      if (packages.length === 0) {
        contentView.children = [
          new Text('No packages found', { type: 'p', class: 'empty-message' })
        ];
      } else {
        const table = createPackageTable({
          packages: packages,
          columns: ['TrackingNumber', 'Sender', 'Recipient', 'Status', 'Priority', 'CurrentLocation', 'Modified'],
          selectable: false,
          filterable: false,
          onRowClick: (pkg) => {
            alert(`Package Details:\n\nTracking: ${pkg.TrackingNumber}\nFrom: ${pkg.Sender?.Title}\nTo: ${pkg.Recipient?.Title}\nStatus: ${pkg.Status}`);
          }
        });
        contentView.children = [table];
      }

      loadingView.hide();
      contentView.show();
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      loadingView.hide();
      contentView.children = [
        new Text('Failed to load dashboard. Please try again.', { type: 'p', class: 'error-message' })
      ];
      contentView.show();
    }
  }

  // Filter buttons
  const filterButtons = new Container([
    new Button('All', {
      variant: 'secondary',
      onClickHandler: () => {
        currentStatus = null;
        loadDashboard(currentStatus);
      }
    }),
    new Button('Sent', {
      variant: 'secondary',
      onClickHandler: () => {
        currentStatus = 'Sent';
        loadDashboard(currentStatus);
      }
    }),
    new Button('Received', {
      variant: 'secondary',
      onClickHandler: () => {
        currentStatus = 'Received';
        loadDashboard(currentStatus);
      }
    }),
    new Button('In Transit', {
      variant: 'secondary',
      onClickHandler: () => {
        currentStatus = 'In Transit';
        loadDashboard(currentStatus);
      }
    }),
    new Button('Refresh', {
      variant: 'primary',
      onClickHandler: () => loadDashboard(currentStatus)
    })
  ], { class: 'filter-buttons' });

  // Initial load
  loadDashboard();

  return [
    new Container([
      new Text('Facilities Dashboard', { type: 'h1' }),
      new LinkButton('Badge Scan', 'facilities/scan', { variant: 'primary' })
    ], { class: 'header-row' }),

    statsContainer,

    new Card([
      new Text('All Packages', { type: 'h3' }),
      filterButtons
    ]),

    loadingView,
    contentView
  ];
});
