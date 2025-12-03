/**
 * My Mail Route - User's Package View
 * Display packages for current user (as sender or recipient)
 */

import {
  Text,
  Card,
  Container,
  Button,
  defineRoute,
  View,
  Loader
} from '../../libs/nofbiz/nofbiz.base.js';
import { getUserPackages, getCurrentUserInfo } from '../../utils/sharepoint.js';
import { createPackageTable } from '../../components/packageTable.js';

export default defineRoute(async (config) => {
  config.setRouteTitle('My Mail - PostHub');

  const user = getCurrentUserInfo();
  const loadingView = new View([new Loader()], { showOnRender: true });
  const contentView = new View([], { showOnRender: false });
  const errorView = new View([], { showOnRender: false });

  // Current filter state
  let currentStatus = null;

  // Load packages function
  async function loadPackages(status = null) {
    try {
      loadingView.show();
      contentView.hide();
      errorView.hide();

      const packages = await getUserPackages(user.email, status);

      // Clear content and update
      if (packages.length === 0) {
        contentView.children = [
          new Text('No packages found', { type: 'p', class: 'empty-message' })
        ];
      } else {
        const table = createPackageTable({
          packages: packages,
          columns: ['TrackingNumber', 'Sender', 'Recipient', 'Status', 'Priority', 'Created'],
          selectable: false,
          filterable: false,
          onRowClick: (pkg) => {
            alert(`Package Details:\n\nTracking: ${pkg.TrackingNumber}\nStatus: ${pkg.Status}\nPriority: ${pkg.Priority}`);
          }
        });
        contentView.children = [table];
      }

      loadingView.hide();
      contentView.show();
    } catch (error) {
      console.error('Failed to load packages:', error);
      loadingView.hide();
      errorView.children = [
        new Text('Failed to load packages. Please try again.', { type: 'p', class: 'error-message' })
      ];
      errorView.show();
    }
  }

  // Filter buttons
  const filterButtons = new Container([
    new Button('All', {
      variant: 'secondary',
      onClickHandler: () => {
        currentStatus = null;
        loadPackages(currentStatus);
      }
    }),
    new Button('Sent', {
      variant: 'secondary',
      onClickHandler: () => {
        currentStatus = 'Sent';
        loadPackages(currentStatus);
      }
    }),
    new Button('In Transit', {
      variant: 'secondary',
      onClickHandler: () => {
        currentStatus = 'In Transit';
        loadPackages(currentStatus);
      }
    }),
    new Button('Delivered', {
      variant: 'secondary',
      onClickHandler: () => {
        currentStatus = 'Delivered';
        loadPackages(currentStatus);
      }
    }),
    new Button('Refresh', {
      variant: 'primary',
      onClickHandler: () => loadPackages(currentStatus)
    })
  ], { class: 'filter-buttons' });

  // Initial load
  loadPackages();

  return [
    new Text('My Mail', { type: 'h1' }),
    new Card([
      new Text('Filters', { type: 'h3' }),
      filterButtons
    ]),
    loadingView,
    errorView,
    contentView
  ];
});
