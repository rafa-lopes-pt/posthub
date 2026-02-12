# Home Route Structure Convention

Correct structure for the home/landing route in SPARC framework projects.

## The Rule

**Home route:** `routes/route.js` (NOT `routes/home/route.js`)

## Correct Structure

```
routes/
├── route.js              # Landing page (home) - populated with content
├── dashboard/
│   └── route.js
├── my-mail/
│   └── route.js
└── send-mail/
    └── route.js
```

**Router configuration:**
```js
// index.js
import { Router } from './libs/nofbiz/dist/nofbiz.base.js'

// routes/route.js is loaded automatically as landing page
new Router(['dashboard', 'my-mail', 'send-mail'])
```

## Wrong Structure

**DON'T DO THIS:**
```
routes/
├── route.js              # Empty or redirect
├── home/
│   └── route.js          # DON'T create this
└── dashboard/
    └── route.js
```

**Wrong router config:**
```js
// DON'T DO THIS
new Router(['home', 'dashboard'])  // Looks for routes/home/route.js
```

## Why This Matters

1. **SPARC's Router automatically loads `routes/route.js` as the landing page**
   - No need to register it in the Router array
   - Matches single-page application conventions

2. **Follows web conventions**
   - `/` maps to landing page
   - `/dashboard` maps to `routes/dashboard/route.js`
   - `/my-mail` maps to `routes/my-mail/route.js`

3. **Avoids double-nesting**
   - `routes/home/route.js` would be accessible at `/#/home`
   - But landing page should be at `/#/` (no path segment)

## Landing Page Implementation

**routes/route.js:**
```js
import {
  defineRoute,
  Text,
  Card,
  Container,
  LinkButton
} from '../libs/nofbiz/dist/nofbiz.base.js'

export default defineRoute((config) => {
  config.setRouteTitle('PostHub - Home')

  return [
    new Container([
      new Text('Welcome to PostHub', { type: 'h1' }),
      new Text('Internal Mail Management System', { type: 'p' }),

      new Card([
        new Text('User Actions', { type: 'h2' }),
        new LinkButton({ href: '#/my-mail', text: 'My Mail' }),
        new LinkButton({ href: '#/send-mail', text: 'Send Mail' }),
        new LinkButton({ href: '#/help', text: 'Help' })
      ]),

      // Conditionally show facilities card
      // (if user has facilities access)
    ])
  ]
})
```

## Router Registration

**index.js:**
```js
import { Router } from './libs/nofbiz/dist/nofbiz.base.js'

// Register all routes EXCEPT the home route
// Home route (routes/route.js) is loaded automatically
new Router([
  // User routes
  'my-mail',
  'send-mail',
  'help',

  // Facilities routes
  'facilities/dashboard',
  'facilities/scan',
  'facilities/locations',
  'facilities/reports'
])
```

## Navigation Links

**Link to home:**
```js
// Correct - link to root
new LinkButton({ href: '#/', text: 'Home' })

// Also correct - Router method
Router.navigateTo('')
```

**Don't do this:**
```js
// WRONG - looking for routes/home/route.js
new LinkButton({ href: '#/home', text: 'Home' })

// WRONG - will cause 404
Router.navigateTo('home')
```

## Common Mistakes

### Mistake 1: Creating routes/home/route.js

**Problem:** Creates unnecessary nesting and breaks landing page convention

**Solution:** Delete `routes/home/` directory, use `routes/route.js` instead

### Mistake 2: Empty routes/route.js

**Problem:** Landing page shows blank screen or error

**Solution:** Populate `routes/route.js` with actual landing page content

### Mistake 3: Registering 'home' in Router array

**Problem:** Router looks for `routes/home/route.js` which shouldn't exist

**Solution:** Remove 'home' from Router array, let it load `routes/route.js` automatically

## Verification Checklist

After setting up routes, verify:

- [ ] `routes/route.js` exists and has content (landing page)
- [ ] `routes/home/` directory does NOT exist
- [ ] Router array does NOT include 'home'
- [ ] Navigation to `/#/` loads landing page
- [ ] Navigation to `/#/dashboard` loads dashboard route
- [ ] No 404 errors in browser console

## Reference

Extracted from:
- `IMPLEMENTATION_PLAN.md` lines 698-735 (Home Route Structure)
- `README.md` lines 96-101 (Home Route Structure)
- `../sparc/.claude/rules/project-structure.md` (SPARC conventions)

For complete context, see:
- `IMPLEMENTATION_PLAN.md`
- `../sparc/.claude/rules/project-structure.md`
