/**
 * Badge Swipe & Scan Route - CRITICAL FOR POC
 * Core facilities workflow: badge swipe → lookup → label generation → scanning
 */

import {
  Text,
  Card,
  Container,
  Button,
  defineRoute,
  View,
  Toast
} from '../../../libs/nofbiz/nofbiz.base.js';
import {
  getEmployeeByBadge,
  getPendingPackagesForUser,
  updatePackageStatus
} from '../../../utils/sharepoint.js';
import { hasFacilitiesAccess, requirePermission } from '../../../utils/permissions.js';
import { createBadgeSwipeInput } from '../../../components/badgeSwipeInput.js';
import { createPackageTable, getSelectedPackages } from '../../../components/packageTable.js';
import { createBarcodeGenerator } from '../../../components/barcodeGenerator.js';
import { printBarcodeLabels } from '../../../utils/pdf.js';

export default defineRoute((config) => {
  config.setRouteTitle('Badge Scan - PostHub');

  // Check permissions
  requirePermission('facilities/scan');

  if (!hasFacilitiesAccess()) {
    return [
      new Text('Access Denied', { type: 'h1' }),
      new Text('You do not have permission to access this page.', { type: 'p' })
    ];
  }

  // State
  let currentEmployee = null;
  let currentPackages = [];
  let packageTableInstance = null;

  // Views
  const employeeInfoView = new View([], { showOnRender: false });
  const packagesView = new View([], { showOnRender: false });
  const barcodeView = new View([], { showOnRender: false });

  // Badge swipe handler
  async function handleBadgeSwipe(badgeId) {
    try {
      new Toast(`Looking up badge: ${badgeId}...`, { type: 'info', duration: 2000 });

      const employee = await getEmployeeByBadge(badgeId);

      if (!employee) {
        new Toast('Employee not found', { type: 'error', duration: 3000 });
        return;
      }

      currentEmployee = employee;

      // Display employee info
      const employeeCard = new Card([
        new Text('Employee Found', { type: 'h3' }),
        new Text(`Name: ${employee.Name}`, { type: 'p' }),
        new Text(`Email: ${employee.Email}`, { type: 'p' }),
        new Text(`Department: ${employee.Department || 'N/A'}`, { type: 'p' })
      ], { class: 'employee-card' });
      employeeInfoView.children = [employeeCard];
      employeeInfoView.show();

      // Fetch pending packages
      const packages = await getPendingPackagesForUser(employee.Email);
      currentPackages = packages;

      if (packages.length === 0) {
        packagesView.children = [
          new Text('No pending packages for this employee', { type: 'p', class: 'empty-message' })
        ];
        packagesView.show();
        barcodeView.hide();
        return;
      }

      new Toast(`Found ${packages.length} pending package(s)`, {
        type: 'success',
        duration: 3000
      });

      // Display packages with checkboxes
      packageTableInstance = createPackageTable({
        packages: packages,
        columns: ['TrackingNumber', 'Recipient', 'Status', 'Priority', 'Created'],
        selectable: true,
        filterable: false
      });
      packagesView.children = [packageTableInstance];
      packagesView.show();

    } catch (error) {
      console.error('Badge lookup failed:', error);
      new Toast('Failed to lookup badge. Please try again.', {
        type: 'error',
        duration: 5000
      });
    }
  }

  // Generate labels handler
  function handleGenerateLabels() {
    if (!packageTableInstance) {
      new Toast('No packages available', { type: 'warning' });
      return;
    }

    // Get selected packages
    const selectedIds = getSelectedPackages(packageTableInstance.element);

    if (selectedIds.length === 0) {
      new Toast('Please select at least one package', {
        type: 'warning',
        duration: 3000
      });
      return;
    }

    const selectedPackages = currentPackages.filter(p => selectedIds.includes(p.Id));

    // Generate barcodes
    const barcodeGenerator = createBarcodeGenerator({
      packages: selectedPackages,
      showPrintButton: true,
      onPrint: async (packages) => {
        // Print labels
        printBarcodeLabels(packages);

        // Update package status to "Received"
        try {
          for (const pkg of packages) {
            await updatePackageStatus(pkg.Id, 'Received', null, 'Label printed at facilities');
          }
          new Toast('Package status updated to Received', {
            type: 'success',
            duration: 3000
          });
        } catch (error) {
          console.error('Failed to update status:', error);
          new Toast('Labels printed but failed to update status', {
            type: 'warning',
            duration: 3000
          });
        }
      }
    });
    barcodeView.children = [barcodeGenerator];
    barcodeView.show();

    new Toast(`Generated ${selectedPackages.length} label(s)`, {
      type: 'success',
      duration: 3000
    });
  }

  // Clear/reset handler
  function handleReset() {
    currentEmployee = null;
    currentPackages = [];
    packageTableInstance = null;
    employeeInfoView.hide();
    packagesView.hide();
    barcodeView.hide();
  }

  // Badge swipe input
  const badgeInput = createBadgeSwipeInput({
    onBadgeDetected: handleBadgeSwipe,
    autoFocus: true,
    debounceMs: 300
  });

  // Action buttons
  const actionButtons = new Container([
    new Button('Generate Labels', {
      variant: 'primary',
      onClickHandler: handleGenerateLabels
    }),
    new Button('Clear', {
      variant: 'secondary',
      onClickHandler: handleReset
    })
  ], { class: 'action-buttons' });

  return [
    new Text('Badge Swipe & Scan', { type: 'h1' }),

    badgeInput,

    employeeInfoView,

    new View([
      new Card([
        new Container([
          new Text('Pending Packages', { type: 'h3' }),
          actionButtons
        ], { class: 'packages-header' }),
        packagesView
      ])
    ], { showOnRender: false, id: 'packages-card' }),

    barcodeView
  ];
});
