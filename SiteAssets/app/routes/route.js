/**
 * Home/Landing Route for PostHub
 * Main navigation hub with role-based menu
 */

import {
  Text,
  Card,
  Container,
  LinkButton,
  defineRoute
} from '../libs/nofbiz/nofbiz.base.js';
import {
  hasFacilitiesAccess,
  isFacilitiesManager,
  getUserDisplayName,
  hasAnyPermission,
  showAccessDeniedDialog
} from '../utils/permissions.js';

export default defineRoute((config) => {
  config.setRouteTitle('PostHub - Mail Management');

  // Check if user has any permissions
  if (!hasAnyPermission()) {
    const dialog = showAccessDeniedDialog();
    return [
      new Text('Access Denied', { type: 'h1' }),
      new Text(dialog.message, { type: 'div' }),
      new Text('Please contact your administrator to be added to a PostHub user group.', { type: 'p' })
    ];
  }

  const userName = getUserDisplayName();

  const components = [
    new Text('PostHub', { type: 'h1', class: 'page-title' }),
    new Text(`Welcome, ${userName}`, { type: 'p', class: 'welcome-text' }),

    // User Actions Card
    new Card([
      new Text('My Mail', { type: 'h2' }),
      new Text('Send and track your packages', { type: 'p' }),
      new Container([
        new LinkButton('View My Mail', 'my-mail', { variant: 'primary' }),
        new LinkButton('Send New Package', 'send-mail', { variant: 'primary' }),
        new LinkButton('Help & Guides', 'help', { variant: 'secondary' })
      ], { class: 'button-group' })
    ], { class: 'action-card' })
  ];

  // Facilities Card
  if (hasFacilitiesAccess()) {
    components.push(
      new Card([
        new Text('Facilities', { type: 'h2' }),
        new Text('Process and manage incoming mail', { type: 'p' }),
        new Container([
          new LinkButton('Dashboard', 'facilities/dashboard', { variant: 'primary' }),
          new LinkButton('Badge Scan', 'facilities/scan', { variant: 'primary' })
        ], { class: 'button-group' })
      ], { class: 'action-card facilities-card' })
    );
  }

  // Manager Card
  if (isFacilitiesManager()) {
    components.push(
      new Card([
        new Text('Management', { type: 'h2' }),
        new Text('Administrative tools and reports', { type: 'p' }),
        new Container([
          new LinkButton('Manage Locations', 'facilities/locations', { variant: 'secondary' }),
          new LinkButton('View Reports', 'facilities/reports', { variant: 'secondary' })
        ], { class: 'button-group' })
      ], { class: 'action-card admin-card' })
    );
  }

  return components;
});
