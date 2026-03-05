import { pageReset, Router, CurrentUser, resolvePath } from './libs/nofbiz/nofbiz.base.js'

// Initialize SPARC page settings
pageReset({
  themePath: resolvePath('@/styles/main.css'),
  clearConsole: false,
})

// Initialize current user context
const user = new CurrentUser()
await user.initialize()

// Initialize Router
// Note: 'routes/route.js' (home) is auto-loaded, don't register it
new Router([
  'my-mail',                                  // Route: /my-mail
  'send-mail',                                // Route: /send-mail
  'facilities',                               // Route: /facilities
  'facilities/register-package',              // Route: /facilities/register-package
  'facilities/register-package/barcode',      // Route: /facilities/register-package/barcode
  'facilities/user-delivery',                 // Route: /facilities/user-delivery
  'facilities/barcode-scan',                  // Route: /facilities/barcode-scan
  'facilities/search-package',               // Route: /facilities/search-package
])
