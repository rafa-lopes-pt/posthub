import {
  Router,
  pageReset,
} from './libs/nofbiz/nofbiz.base.js';

// Initialize SPARC
pageReset({
  clearConsole: false,
});

// Setup Router with available routes
// Add your route paths here - route definitions go in routes/ folder
// Note: routes/route.js is the home/landing page (no need to specify 'home')
new Router([
  'my-mail',
  'send-mail',
  'help',
  'facilities/dashboard',
  'facilities/scan',
  // 'facilities/locations',  // TODO: Implement in future phase
  // 'facilities/reports'      // TODO: Implement in future phase
]);
