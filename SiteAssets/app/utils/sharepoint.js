/**
 * SharePoint API Wrapper for PostHub
 *
 * Centralized SharePoint REST API operations using SPARC framework's ListAPI.
 * Provides clean, reusable functions for common queries and operations.
 *
 * @module utils/sharepoint
 */

import { ListApi, CurrentUser } from '../libs/nofbiz/nofbiz.base.js';
import { UserGroups } from './permissions.js';

/**
 * Initialize ListAPI instances for all SharePoint lists
 */
export const Lists = {
  packages: new ListApi('Packages'),
  employees: new ListApi('Employees'),
  locations: new ListApi('Locations'),
  packageHistory: new ListApi('PackageHistory')
};

/**
 * Get packages for current user (as sender or recipient)
 *
 * @param {string} userEmail - User's email address
 * @param {string|null} status - Optional status filter (e.g., 'Sent', 'Delivered')
 * @returns {Promise<Array>} Array of package objects
 *
 * @example
 * const packages = await getUserPackages('john@company.com', 'Sent');
 */
export async function getUserPackages(userEmail, status = null) {
  try {
    let query = `(Sender/EMail eq '${userEmail}' or Recipient/EMail eq '${userEmail}')`;
    if (status) {
      query += ` and Status eq '${status}'`;
    }

    const results = await Lists.packages.getItems({
      query: query,
      fields: [
        'Id', 'Title', 'TrackingNumber',
        'Sender/Title', 'Sender/EMail',
        'Recipient/Title', 'Recipient/EMail',
        'Status', 'Priority',
        'CurrentLocation/Title', 'CurrentLocation/Id',
        'DestinationLocation/Title', 'DestinationLocation/Id',
        'PackageDetails', 'Notes',
        'Created', 'Modified'
      ],
      expand: ['Sender', 'Recipient', 'CurrentLocation', 'DestinationLocation'],
      orderby: 'Modified desc'
    });

    return results || [];
  } catch (error) {
    console.error('Error fetching user packages:', error);
    throw new Error('Failed to load packages. Please try again.');
  }
}

/**
 * Get employee by badge ID
 *
 * @param {string} badgeId - Badge identifier
 * @returns {Promise<Object|null>} Employee object or null if not found
 *
 * @example
 * const employee = await getEmployeeByBadge('BADGE001');
 */
export async function getEmployeeByBadge(badgeId) {
  try {
    if (!badgeId || badgeId.trim().length === 0) {
      return null;
    }

    const results = await Lists.employees.getItems({
      query: `BadgeID eq '${badgeId.trim()}' and IsActive eq 1`,
      fields: [
        'Id', 'Name', 'Email', 'BadgeID', 'Department',
        'OfficeLocation/Title', 'OfficeLocation/Id',
        'Manager/Title', 'Manager/EMail',
        'Building', 'Campus'
      ],
      expand: ['OfficeLocation', 'Manager'],
      top: 1
    });

    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error('Error fetching employee by badge:', error);
    throw new Error('Failed to lookup badge. Please try again.');
  }
}

/**
 * Get non-delivered packages for a user (by email)
 *
 * @param {string} userEmail - User's email
 * @returns {Promise<Array>} Array of pending package objects
 *
 * @example
 * const pending = await getPendingPackagesForUser('john@company.com');
 */
export async function getPendingPackagesForUser(userEmail) {
  try {
    const pendingStatuses = ['Sent', 'Received', 'Stored', 'In Transit', 'Arrived'];
    const statusQuery = pendingStatuses.map(s => `Status eq '${s}'`).join(' or ');

    const query = `Sender/EMail eq '${userEmail}' and (${statusQuery})`;

    const results = await Lists.packages.getItems({
      query: query,
      fields: [
        'Id', 'Title', 'TrackingNumber',
        'Recipient/Title', 'Recipient/EMail',
        'Status', 'Priority',
        'DestinationLocation/Title',
        'PackageDetails',
        'Created'
      ],
      expand: ['Recipient', 'DestinationLocation'],
      orderby: 'Created desc'
    });

    return results || [];
  } catch (error) {
    console.error('Error fetching pending packages:', error);
    throw new Error('Failed to load pending packages. Please try again.');
  }
}

/**
 * Search employees (for recipient autocomplete)
 *
 * @param {string} searchTerm - Search string
 * @returns {Promise<Array>} Array of matching employee objects
 *
 * @example
 * const results = await searchEmployees('john');
 */
export async function searchEmployees(searchTerm) {
  try {
    if (!searchTerm || searchTerm.length < 2) {
      return [];
    }

    // SharePoint REST API uses substringof for partial matches
    const term = searchTerm.trim();
    const query = `(substringof('${term}', Name) or substringof('${term}', Email) or substringof('${term}', Department)) and IsActive eq 1`;

    const results = await Lists.employees.getItems({
      query: query,
      fields: [
        'Id', 'Name', 'Email', 'Department',
        'OfficeLocation/Title', 'OfficeLocation/Id',
        'Building', 'Campus'
      ],
      expand: ['OfficeLocation'],
      orderby: 'Name asc',
      top: 20
    });

    return results || [];
  } catch (error) {
    console.error('Error searching employees:', error);
    return [];
  }
}

/**
 * Get active locations by type
 *
 * @param {string|null} locationType - Location type filter (e.g., 'Office', 'Mailroom')
 * @returns {Promise<Array>} Array of location objects
 *
 * @example
 * const offices = await getLocationsByType('Office');
 */
export async function getLocationsByType(locationType = null) {
  try {
    let query = 'IsActive eq 1';
    if (locationType) {
      query += ` and LocationType eq '${locationType}'`;
    }

    const results = await Lists.locations.getItems({
      query: query,
      fields: [
        'Id', 'Title', 'Campus', 'Building', 'RoomArea',
        'LocationType',
        'ParentLocation/Title', 'ParentLocation/Id',
        'FacilitiesContact/Title', 'FacilitiesContact/EMail',
        'SortOrder'
      ],
      expand: ['ParentLocation', 'FacilitiesContact'],
      orderby: 'SortOrder asc, Title asc'
    });

    return results || [];
  } catch (error) {
    console.error('Error fetching locations:', error);
    throw new Error('Failed to load locations. Please try again.');
  }
}

/**
 * Generate unique tracking number
 * Format: POSTHUB-YYYYMMDD-XXXXX
 *
 * @returns {string} Unique tracking number
 *
 * @example
 * const trackingNum = generateTrackingNumber();
 * // Returns: "POSTHUB-20251203-00001"
 */
export function generateTrackingNumber() {
  const date = new Date();

  // Format: YYYYMMDD
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  // Generate random 5-digit number
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');

  return `POSTHUB-${dateStr}-${random}`;
}

/**
 * Validate tracking number format
 *
 * @param {string} trackingNumber - Tracking number to validate
 * @returns {boolean} True if valid format
 *
 * @example
 * isValidTrackingNumber('POSTHUB-20251203-00001'); // true
 * isValidTrackingNumber('INVALID'); // false
 */
export function isValidTrackingNumber(trackingNumber) {
  // Format: POSTHUB-YYYYMMDD-XXXXX
  const pattern = /^POSTHUB-\d{8}-\d{5}$/;
  return pattern.test(trackingNumber);
}

/**
 * Create package with tracking number
 * Automatically generates tracking number and sets initial status to "Sent"
 * Logs creation to PackageHistory
 *
 * @param {Object} packageData - Package details
 * @param {string} packageData.Title - Package description
 * @param {number} packageData.SenderId - Sender employee ID
 * @param {number} packageData.RecipientId - Recipient employee ID
 * @param {string} [packageData.Priority='Standard'] - Priority (Standard, Urgent, Low)
 * @param {number} [packageData.DestinationLocationId] - Destination location ID
 * @param {string} [packageData.PackageDetails] - Package details (size, weight, etc.)
 * @param {string} [packageData.Notes] - Additional notes
 * @returns {Promise<Object>} Created package object with Id and TrackingNumber
 *
 * @example
 * const pkg = await createPackage({
 *   Title: 'Documents for John',
 *   SenderId: 5,
 *   RecipientId: 10,
 *   Priority: 'Urgent',
 *   DestinationLocationId: 3
 * });
 */
export async function createPackage(packageData) {
  try {
    // Generate unique tracking number
    const trackingNumber = generateTrackingNumber();

    // Prepare package object
    const newPackage = {
      Title: packageData.Title,
      TrackingNumber: trackingNumber,
      SenderId: packageData.SenderId,
      RecipientId: packageData.RecipientId,
      Priority: packageData.Priority || 'Standard',
      Status: 'Sent',
      PackageDetails: packageData.PackageDetails || '',
      Notes: packageData.Notes || ''
    };

    // Add optional destination location
    if (packageData.DestinationLocationId) {
      newPackage.DestinationLocationId = packageData.DestinationLocationId;
    }

    // Create package in SharePoint
    const result = await Lists.packages.addItem(newPackage);

    // Log to history
    if (result && result.Id) {
      await logPackageHistory({
        packageId: result.Id,
        previousStatus: null,
        newStatus: 'Sent',
        locationId: null,
        notes: 'Package created'
      });
    }

    return {
      ...result,
      TrackingNumber: trackingNumber
    };
  } catch (error) {
    console.error('Error creating package:', error);
    throw new Error('Failed to create package. Please try again.');
  }
}

/**
 * Update package status
 * Automatically logs change to PackageHistory
 *
 * @param {number} packageId - Package ID
 * @param {string} newStatus - New status value
 * @param {number|null} [locationId=null] - Current location ID
 * @param {string} [notes=''] - Optional notes about the status change
 * @param {string} [scannedBarcode=''] - Barcode that triggered the change
 * @returns {Promise<void>}
 *
 * @example
 * await updatePackageStatus(5, 'Received', 10, 'Package scanned at mailroom');
 */
export async function updatePackageStatus(packageId, newStatus, locationId = null, notes = '', scannedBarcode = '') {
  try {
    // Get current package to retrieve previous status
    const currentPackages = await Lists.packages.getItems({
      query: `Id eq ${packageId}`,
      fields: ['Id', 'Status', 'TrackingNumber']
    });

    if (currentPackages.length === 0) {
      throw new Error('Package not found');
    }

    const currentPackage = currentPackages[0];
    const previousStatus = currentPackage.Status;

    // Update package
    const updates = { Status: newStatus };
    if (locationId) {
      updates.CurrentLocationId = locationId;
    }

    await Lists.packages.updateItem(packageId, updates);

    // Log to history
    await logPackageHistory({
      packageId: packageId,
      previousStatus: previousStatus,
      newStatus: newStatus,
      locationId: locationId,
      notes: notes,
      scannedBarcode: scannedBarcode
    });

  } catch (error) {
    console.error('Error updating package status:', error);
    throw new Error('Failed to update package status. Please try again.');
  }
}

/**
 * Get package by tracking number
 *
 * @param {string} trackingNumber - Tracking number to lookup
 * @returns {Promise<Object|null>} Package object or null if not found
 *
 * @example
 * const pkg = await getPackageByTrackingNumber('POSTHUB-20251203-00001');
 */
export async function getPackageByTrackingNumber(trackingNumber) {
  try {
    if (!isValidTrackingNumber(trackingNumber)) {
      return null;
    }

    const results = await Lists.packages.getItems({
      query: `TrackingNumber eq '${trackingNumber}'`,
      fields: [
        'Id', 'Title', 'TrackingNumber',
        'Sender/Title', 'Sender/EMail',
        'Recipient/Title', 'Recipient/EMail',
        'Status', 'Priority',
        'CurrentLocation/Title', 'CurrentLocation/Id',
        'DestinationLocation/Title', 'DestinationLocation/Id',
        'PackageDetails', 'Notes',
        'Created', 'Modified'
      ],
      expand: ['Sender', 'Recipient', 'CurrentLocation', 'DestinationLocation'],
      top: 1
    });

    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error('Error fetching package by tracking number:', error);
    return null;
  }
}

/**
 * Get package history
 *
 * @param {number} packageId - Package ID
 * @returns {Promise<Array>} Array of history records
 *
 * @example
 * const history = await getPackageHistory(5);
 */
export async function getPackageHistory(packageId) {
  try {
    const results = await Lists.packageHistory.getItems({
      query: `PackageID/Id eq ${packageId}`,
      fields: [
        'Id', 'Title', 'PreviousStatus', 'NewStatus',
        'Location/Title', 'Location/Id',
        'ChangedBy/Title', 'ChangedBy/EMail',
        'Timestamp', 'Notes', 'ScannedBarcode',
        'Created'
      ],
      expand: ['Location', 'ChangedBy', 'PackageID'],
      orderby: 'Timestamp desc'
    });

    return results || [];
  } catch (error) {
    console.error('Error fetching package history:', error);
    return [];
  }
}

/**
 * Get all packages (for facilities dashboard)
 *
 * @param {Object} [options={}] - Query options
 * @param {string} [options.status] - Filter by status
 * @param {string} [options.priority] - Filter by priority
 * @param {number} [options.locationId] - Filter by current location
 * @param {number} [options.top=100] - Maximum number of results
 * @returns {Promise<Array>} Array of package objects
 *
 * @example
 * const packages = await getAllPackages({ status: 'In Transit', top: 50 });
 */
export async function getAllPackages(options = {}) {
  try {
    const {
      status = null,
      priority = null,
      locationId = null,
      top = 100
    } = options;

    let queryParts = [];

    if (status) {
      queryParts.push(`Status eq '${status}'`);
    }
    if (priority) {
      queryParts.push(`Priority eq '${priority}'`);
    }
    if (locationId) {
      queryParts.push(`CurrentLocation/Id eq ${locationId}`);
    }

    const query = queryParts.length > 0 ? queryParts.join(' and ') : '';

    const results = await Lists.packages.getItems({
      query: query,
      fields: [
        'Id', 'Title', 'TrackingNumber',
        'Sender/Title', 'Sender/EMail',
        'Recipient/Title', 'Recipient/EMail',
        'Status', 'Priority',
        'CurrentLocation/Title', 'CurrentLocation/Id',
        'DestinationLocation/Title',
        'Created', 'Modified'
      ],
      expand: ['Sender', 'Recipient', 'CurrentLocation', 'DestinationLocation'],
      orderby: 'Modified desc',
      top: top
    });

    return results || [];
  } catch (error) {
    console.error('Error fetching all packages:', error);
    throw new Error('Failed to load packages. Please try again.');
  }
}

/**
 * Log package status change to history
 * (Internal helper function)
 *
 * @private
 * @param {Object} historyData - History record data
 * @returns {Promise<void>}
 */
async function logPackageHistory(historyData) {
  try {
    const {
      packageId,
      previousStatus,
      newStatus,
      locationId,
      notes,
      scannedBarcode
    } = historyData;

    const historyItem = {
      Title: `Status changed to ${newStatus}`,
      PackageIDId: packageId,
      PreviousStatus: previousStatus || '',
      NewStatus: newStatus,
      Notes: notes || '',
      Timestamp: new Date().toISOString(),
      ScannedBarcode: scannedBarcode || ''
    };

    if (locationId) {
      historyItem.LocationId = locationId;
    }

    await Lists.packageHistory.addItem(historyItem);
  } catch (error) {
    // Log error but don't throw - history logging shouldn't break main operations
    console.error('Error logging package history:', error);
  }
}

/**
 * Get current user information
 * Uses SPARC framework's CurrentUser class
 *
 * @returns {Object} Current user object
 * @returns {string} return.email - User's email
 * @returns {string} return.loginName - User's login name
 * @returns {Array<string>} return.groups - User's SharePoint groups
 *
 * @example
 * const user = getCurrentUserInfo();
 * console.log(user.email); // "john@company.com"
 */
export function getCurrentUserInfo() {
  try {
    return new CurrentUser();
  } catch (error) {
    console.error('Error getting current user:', error);
    // Return mock user for development
    return {
      email: 'unknown@company.com',
      loginName: 'unknown',
      groups: [UserGroups.FACILITIES_MANAGER]
    };
  }
}

/**
 * Get employee by email (for sender lookup)
 *
 * @param {string} email - Employee email
 * @returns {Promise<Object|null>} Employee object or null if not found
 *
 * @example
 * const employee = await getEmployeeByEmail('john@company.com');
 */
export async function getEmployeeByEmail(email) {
  try {
    const results = await Lists.employees.getItems({
      query: `Email eq '${email}' and IsActive eq 1`,
      fields: [
        'Id', 'Name', 'Email', 'Department',
        'OfficeLocation/Title', 'OfficeLocation/Id',
        'Manager/Title', 'Manager/EMail',
        'Building', 'Campus', 'BadgeID'
      ],
      expand: ['OfficeLocation', 'Manager'],
      top: 1
    });

    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error('Error fetching employee by email:', error);
    return null;
  }
}

/**
 * Batch update packages (for facilities bulk operations)
 *
 * @param {Array<number>} packageIds - Array of package IDs
 * @param {Object} updates - Fields to update
 * @returns {Promise<Array>} Results array with success/failure for each package
 *
 * @example
 * const results = await batchUpdatePackages([1, 2, 3], { Status: 'Received' });
 */
export async function batchUpdatePackages(packageIds, updates) {
  const results = [];

  for (const packageId of packageIds) {
    try {
      // If updating status, use the status update function to log history
      if (updates.Status) {
        await updatePackageStatus(
          packageId,
          updates.Status,
          updates.CurrentLocationId || null,
          updates.Notes || 'Bulk status update'
        );
      } else {
        await Lists.packages.updateItem(packageId, updates);
      }
      results.push({ packageId, success: true });
    } catch (error) {
      console.error(`Error updating package ${packageId}:`, error);
      results.push({ packageId, success: false, error: error.message });
    }
  }

  return results;
}

/**
 * Get package statistics (for dashboard)
 *
 * @returns {Promise<Object>} Statistics object with counts by status
 *
 * @example
 * const stats = await getPackageStatistics();
 * // { total: 100, sent: 20, received: 30, inTransit: 15, delivered: 35 }
 */
export async function getPackageStatistics() {
  try {
    const allPackages = await getAllPackages({ top: 1000 });

    const stats = {
      total: allPackages.length,
      sent: 0,
      received: 0,
      stored: 0,
      inTransit: 0,
      arrived: 0,
      delivered: 0
    };

    allPackages.forEach(pkg => {
      const status = pkg.Status.toLowerCase().replace(' ', '');
      switch (status) {
        case 'sent':
          stats.sent++;
          break;
        case 'received':
          stats.received++;
          break;
        case 'stored':
          stats.stored++;
          break;
        case 'intransit':
          stats.inTransit++;
          break;
        case 'arrived':
          stats.arrived++;
          break;
        case 'delivered':
          stats.delivered++;
          break;
      }
    });

    return stats;
  } catch (error) {
    console.error('Error fetching package statistics:', error);
    return {
      total: 0,
      sent: 0,
      received: 0,
      stored: 0,
      inTransit: 0,
      arrived: 0,
      delivered: 0
    };
  }
}
