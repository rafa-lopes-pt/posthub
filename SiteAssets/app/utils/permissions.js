/**
 * Permissions and User Group Management for PostHub
 *
 * Checks user group membership and provides role-based access control.
 * Groups are managed in SharePoint and checked via CurrentUser class.
 *
 * @module utils/permissions
 */

import { getCurrentUserInfo } from './sharepoint.js';

/**
 * SharePoint user group names
 * These must match exactly with groups created in SharePoint
 */
export const UserGroups = {
  REGULAR_USER: 'RegularUser',
  FACILITIES_EMPLOYEE: 'FacilitiesEmployee',
  FACILITIES_MANAGER: 'FacilitiesManager'
};

/**
 * Check if user is in specific SharePoint group
 *
 * @param {string} groupName - Group name to check
 * @returns {boolean} True if user is member of the group
 *
 * @example
 * if (isUserInGroup(UserGroups.FACILITIES_EMPLOYEE)) {
 *   // Show facilities features
 * }
 */
export function isUserInGroup(groupName) {
  try {
    const user = getCurrentUserInfo();

    // CurrentUser.groups is an array of group names
    // Check if the user's groups array includes the specified group
    if (user && user.groups && Array.isArray(user.groups)) {
      return user.groups.some(g =>
        g.toLowerCase().includes(groupName.toLowerCase())
      );
    }

    return false;
  } catch (error) {
    console.error('Error checking user group:', error);
    return false;
  }
}

/**
 * Check if user has facilities access
 * True if user is in FacilitiesEmployee OR FacilitiesManager group
 *
 * @returns {boolean} True if user has facilities access
 *
 * @example
 * if (hasFacilitiesAccess()) {
 *   // Show facilities dashboard
 * }
 */
export function hasFacilitiesAccess() {
  return isUserInGroup(UserGroups.FACILITIES_EMPLOYEE) ||
         isUserInGroup(UserGroups.FACILITIES_MANAGER);
}

/**
 * Check if user is facilities manager
 * True if user is in FacilitiesManager group
 *
 * @returns {boolean} True if user is facilities manager
 *
 * @example
 * if (isFacilitiesManager()) {
 *   // Show location management and reports
 * }
 */
export function isFacilitiesManager() {
  return isUserInGroup(UserGroups.FACILITIES_MANAGER);
}

/**
 * Check if user is regular user only
 * True if user is in RegularUser group but NOT in facilities groups
 *
 * @returns {boolean} True if user is regular user only
 *
 * @example
 * if (isRegularUser()) {
 *   // Show only send/track mail features
 * }
 */
export function isRegularUser() {
  return isUserInGroup(UserGroups.REGULAR_USER) && !hasFacilitiesAccess();
}

/**
 * Check if user is in any valid group
 *
 * @returns {boolean} True if user has permissions
 */
export function hasAnyPermission() {
  return isUserInGroup(UserGroups.REGULAR_USER) ||
         isUserInGroup(UserGroups.FACILITIES_EMPLOYEE) ||
         isUserInGroup(UserGroups.FACILITIES_MANAGER);
}

/**
 * Get available routes based on user permissions
 * Returns array of route names the user can access
 *
 * @returns {Array<string>} Array of route names
 *
 * @example
 * const routes = getAvailableRoutes();
 * // For regular user: ['home', 'my-mail', 'send-mail', 'help']
 * // For facilities: [...above, 'facilities/dashboard', 'facilities/scan']
 * // For manager: [...above, 'facilities/locations', 'facilities/reports']
 */
export function getAvailableRoutes() {
  const routes = [];

  // Check if user has any permissions
  if (!hasAnyPermission()) {
    // No permissions - only show home with access denied
    return ['home'];
  }

  // Base routes for all users
  routes.push('home', 'my-mail', 'send-mail', 'help');

  // Facilities routes
  if (hasFacilitiesAccess()) {
    routes.push('facilities/dashboard', 'facilities/scan');
  }

  // Manager routes
  if (isFacilitiesManager()) {
    routes.push('facilities/locations', 'facilities/reports');
  }

  return routes;
}

/**
 * Get user's display name
 * Extracts display name from CurrentUser
 *
 * @returns {string} User's display name or email
 *
 * @example
 * const name = getUserDisplayName();
 * // Returns: "John Doe" or "john.doe@company.com"
 */
export function getUserDisplayName() {
  try {
    const user = getCurrentUserInfo();

    if (user) {
      // Try to extract name from loginName (format: DOMAIN\username)
      if (user.loginName && user.loginName.includes('\\')) {
        const name = user.loginName.split('\\')[1];
        // Convert username to display format (john.doe -> John Doe)
        return name.split('.').map(part =>
          part.charAt(0).toUpperCase() + part.slice(1)
        ).join(' ');
      }

      // Fallback to email
      if (user.email) {
        return user.email.split('@')[0];
      }

      return user.loginName || 'User';
    }

    return 'User';
  } catch (error) {
    console.error('Error getting user display name:', error);
    return 'User';
  }
}

/**
 * Get user's email address
 *
 * @returns {string} User's email address
 *
 * @example
 * const email = getUserEmail();
 */
export function getUserEmail() {
  try {
    const user = getCurrentUserInfo();
    return user?.email || '';
  } catch (error) {
    console.error('Error getting user email:', error);
    return '';
  }
}

/**
 * Get user's groups as array
 *
 * @returns {Array<string>} Array of group names
 *
 * @example
 * const groups = getUserGroups();
 * // Returns: ['RegularUser', 'FacilitiesEmployee']
 */
export function getUserGroups() {
  try {
    const user = getCurrentUserInfo();
    return user?.groups || [];
  } catch (error) {
    console.error('Error getting user groups:', error);
    return [];
  }
}

/**
 * Get user role description
 * Human-readable role based on group membership
 *
 * @returns {string} Role description
 *
 * @example
 * const role = getUserRole();
 * // Returns: "Facilities Manager", "Facilities Employee", or "Regular User"
 */
export function getUserRole() {
  if (isFacilitiesManager()) {
    return 'Facilities Manager';
  }
  if (hasFacilitiesAccess()) {
    return 'Facilities Employee';
  }
  if (isRegularUser()) {
    return 'Regular User';
  }
  return 'No Role Assigned';
}

/**
 * Check if user can access a specific route
 *
 * @param {string} routePath - Route path to check (e.g., 'facilities/scan')
 * @returns {boolean} True if user can access the route
 *
 * @example
 * if (canAccessRoute('facilities/scan')) {
 *   // Navigate to route
 * } else {
 *   // Show access denied
 * }
 */
export function canAccessRoute(routePath) {
  const availableRoutes = getAvailableRoutes();
  return availableRoutes.includes(routePath);
}

/**
 * Require permission for a route
 * Throws error if user doesn't have access
 *
 * @param {string} routePath - Route path being accessed
 * @throws {Error} If user doesn't have permission
 *
 * @example
 * // At the top of a route
 * requirePermission('facilities/scan');
 */
export function requirePermission(routePath) {
  if (!canAccessRoute(routePath)) {
    const error = new Error('Access Denied: You do not have permission to access this page.');
    error.code = 'ACCESS_DENIED';
    throw error;
  }
}

/**
 * Require specific group membership
 * Throws error if user is not in the specified group
 *
 * @param {string} groupName - Required group name
 * @throws {Error} If user is not in the group
 *
 * @example
 * // Require facilities manager access
 * requireGroup(UserGroups.FACILITIES_MANAGER);
 */
export function requireGroup(groupName) {
  if (!isUserInGroup(groupName)) {
    const error = new Error(`Access Denied: This feature requires ${groupName} group membership.`);
    error.code = 'ACCESS_DENIED';
    error.requiredGroup = groupName;
    throw error;
  }
}

/**
 * Get permission summary for debugging
 *
 * @returns {Object} Permission summary object
 *
 * @example
 * console.log(getPermissionSummary());
 * // {
 * //   displayName: "John Doe",
 * //   email: "john@company.com",
 * //   groups: ["RegularUser", "FacilitiesEmployee"],
 * //   role: "Facilities Employee",
 * //   permissions: {
 * //     isRegularUser: false,
 * //     hasFacilitiesAccess: true,
 * //     isFacilitiesManager: false
 * //   },
 * //   availableRoutes: [...]
 * // }
 */
export function getPermissionSummary() {
  return {
    displayName: getUserDisplayName(),
    email: getUserEmail(),
    groups: getUserGroups(),
    role: getUserRole(),
    permissions: {
      isRegularUser: isRegularUser(),
      hasFacilitiesAccess: hasFacilitiesAccess(),
      isFacilitiesManager: isFacilitiesManager(),
      hasAnyPermission: hasAnyPermission()
    },
    availableRoutes: getAvailableRoutes()
  };
}

/**
 * Show access denied dialog
 * Helper function to display permission error to user
 *
 * @param {string} [message] - Custom message (optional)
 * @returns {Object} Dialog configuration object
 *
 * @example
 * import { showAccessDeniedDialog } from './permissions.js';
 *
 * if (!hasFacilitiesAccess()) {
 *   return showAccessDeniedDialog();
 * }
 */
export function showAccessDeniedDialog(message = null) {
  const defaultMessage = `
    <h3>Access Denied</h3>
    <p>You don't have permission to access this feature.</p>
    <p>Please contact your administrator if you believe this is an error.</p>
    <p><strong>Your current role:</strong> ${getUserRole()}</p>
  `;

  return {
    type: 'error',
    title: 'Access Denied',
    message: message || defaultMessage,
    canClose: true
  };
}

/**
 * Create permission-based component visibility helper
 *
 * @param {Object} permissions - Permission requirements
 * @param {boolean} [permissions.requireFacilities] - Require facilities access
 * @param {boolean} [permissions.requireManager] - Require manager access
 * @param {string} [permissions.requireGroup] - Require specific group
 * @returns {boolean} True if component should be visible
 *
 * @example
 * const showButton = shouldShowComponent({ requireFacilities: true });
 * if (showButton) {
 *   // Render button
 * }
 */
export function shouldShowComponent(permissions = {}) {
  const {
    requireFacilities = false,
    requireManager = false,
    requireGroup = null
  } = permissions;

  if (requireManager && !isFacilitiesManager()) {
    return false;
  }

  if (requireFacilities && !hasFacilitiesAccess()) {
    return false;
  }

  if (requireGroup && !isUserInGroup(requireGroup)) {
    return false;
  }

  return true;
}

/**
 * Conditional wrapper for permission-based rendering
 *
 * @param {Function} component - Component factory function
 * @param {Object} permissions - Permission requirements
 * @returns {Function|null} Component or null if no permission
 *
 * @example
 * const BarcodeButton = withPermission(
 *   () => new Button('Scan Barcode'),
 *   { requireFacilities: true }
 * );
 */
export function withPermission(component, permissions = {}) {
  return shouldShowComponent(permissions) ? component : null;
}
