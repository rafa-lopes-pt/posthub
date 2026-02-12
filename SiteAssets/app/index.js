import { pageReset, Router, CurrentUser, resolvePath } from './libs/nofbiz/nofbiz.base.js'

// Initialize SPARC page settings
pageReset({
  themePath: resolvePath('@/styles/main.css', { useSiteRoot: true }),
  clearConsole: false,
})

// Initialize current user context
new CurrentUser(undefined, {
  bruteForceAccountNameClientImplementation: async () => {
    // SharePoint will populate this automatically
    return _spPageContextInfo.userLoginName || 'guest@example.com'
  },
  userUIDParserClientImplementation: async () => {
    return _spPageContextInfo.userId || 'i:0#.w|guest@example.com'
  },
})

// Initialize Router
// Note: 'routes/route.js' (home) is auto-loaded, don't register it
new Router([
  'my-mail',                                  // Route: /my-mail
  'send-mail',                                // Route: /send-mail
  'facilities',                               // Route: /facilities
  'facilities/register-package',              // Route: /facilities/register-package
  'facilities/register-package/barcode',      // Route: /facilities/register-package/barcode
  // Add more routes as they're implemented
])
