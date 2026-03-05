# SPARC Framework - Comprehensive Guide

Reference guide for AI assistants working with the SPARC framework. Source code is the ultimate authority for component APIs -- this guide covers architecture, patterns, and conventions.

---

## 1. Architecture Overview

### What is SPARC?

**SPARC** (SharePoint Application Rendering Core) is a TypeScript micro-framework for building single-page applications on SharePoint on-premises environments with severe deployment restrictions.

- Built in TypeScript, distributed as JavaScript bundles
- React-like component architecture without virtual DOM or lifecycle hooks
- Ships as modular bundles: base (core), analytics (D3 charts), excelparser (CSV/data)
- Treats SharePoint exclusively as a data store -- SPARC owns all UI, routing, validation, and business logic

### Core Philosophy

1. **Bypass SharePoint's Native UI** -- Lists for data, AD for auth, Designer for email workflows. Everything else is SPARC.
2. **Pure HTML/CSS/JavaScript** -- No npm at runtime, no CDN, no external frameworks. Works in completely restricted environments.
3. **Modern Patterns, No Build Step** -- Write TypeScript locally, bundle once with Rollup, deploy single `.js` + `.css` + `.d.ts` to SharePoint. Consumers write plain JavaScript with IDE autocomplete.
4. **Developer Experience First** -- Proper file structure, actual error messages with file/line numbers, IDE support via TypeScript definitions.

### High-Level Flow

```
SharePoint Page (media content webpart)
  loads index.html (imports dist/nofbiz.base.js)
    |
    v
SPARC Entry Point (index.js)
  calls pageReset() -- removes SP chrome, adds #root
  creates Router instance with route list
    |
    v
Router (Singleton)
  manages hash-based SPA navigation
  lazy-loads route content on demand
  wraps app in global ErrorBoundary
    |
    v
Individual Routes (route.js files)
  define content via defineRoute() factory
  compose components, handle route logic
    |
    v
Components (UI Building Blocks)
  SPARC base components (Button, TextInput, Card, etc.)
  Custom compositions (factory functions)
  Fragment/Container for layout
```

### Environment Constraints

- No npm/build process on client environment
- No CDN or external web resources -- 100% local bundles
- No server-side Node.js -- client-side JavaScript only
- SharePoint REST API is the only data channel
- Microsoft Edge only (corporate, locked-down policies, VPN/intranet)
- All SharePoint List data stored as strings -- validation via Zod in SPARC

---

## 2. Component System

### Component Hierarchy

```
HTMDElementInterface (interface)
    |
HTMDElement (abstract base class)
    |
    +-- Container Components: Container, Card, View, Modal
    +-- Form Components: TextInput, NumberInput, DateInput, ComboBox, CheckBox, FieldLabel
    +-- Navigation: Button, LinkButton, TabGroup, ViewSwitcher, AccordionGroup, AccordionItem
    +-- Display: Text, List, Image, Icon
    +-- Feedback: Toast, Dialog, Loader, ErrorBoundary

Special cases:
    Fragment -- implements HTMDElementInterface but does NOT extend HTMDElement (no DOM wrapper)
    FormField -- state container, not a visual component
```

### Component Categories

| Category | Components |
|----------|-----------|
| Form | TextInput, NumberInput, DateInput, ComboBox, CheckBox, FieldLabel |
| Container | Container, Card, View, Modal, Fragment |
| Navigation | Button, LinkButton, TabGroup, ViewSwitcher, AccordionGroup, AccordionItem |
| Display | Text, List, Image, Icon |
| Feedback | Toast (static methods), Dialog, Loader, ErrorBoundary |

### HTMDElement Base Class

All visual components inherit from `HTMDElement` (source: `src/base/DOM/abstracts/HTMDElement.abstract.ts`):

- Auto-generates UUID for each instance (`this.id`)
- Derives component name from class name (`this.name` = lowercase class name)
- Auto-generates BEM CSS class: `${SPARC_PREFIX}__${this.name}` via `this.topClassBEM`
- Manages DOM lifecycle: `render()`, `_refresh()`, `remove()`
- Event system: `setEventHandler()`, `_applyEventListeners()`, `removeAllEventListeners()`, `clearEventListenersRecord()`
- jQuery DOM access via `this.instance` (returns `JQuery<HTMLElement> | null`). Used extensively inside SPARC source as the standard internal DOM mechanism; application developers should almost never use `.instance` directly -- prefer SPARC API methods (`.children`, `.render()`, `.remove()`, event methods)
- Tracks DOM presence via `this.isAlive`
- Selector: `${containerSelector} #${id}.${topClassBEM}`

### Component Props Pattern

Components follow a consistent constructor signature:

```javascript
// Standard pattern: children first, options second
new Container(children, { class: 'my-layout' })
new Card(children, { class: 'featured' })

// Some components promote commonly-used args for better DX
new Text('Hello', { type: 'h1' })          // text content promoted
new Button('Click me', { variant: 'primary' }) // label promoted

// Form components take FormField as first arg
new TextInput(formField, { placeholder: 'Enter...' })
```

The base props interface (`HTMDElementProps`) provides: `id?`, `class?`, `containerSelector?`. Each component extends this with its own options.

### Component State

SPARC has no internal reactive state (no useState, no virtual DOM diffing). Data is passed by reference and lives in memory until the garbage collector cleans it up. This is a work in progress -- the state model may evolve.

For interactive data, use `FormField` (see Section 4). For read-only data, use plain variables.

### Lifecycle Methods

```javascript
const component = new Button('Click', { onClickHandler: () => doSomething() })

component.render()    // Append to DOM, attach event listeners
// If already in DOM, render() calls _refresh() instead
component.remove()    // Remove all event listeners, remove children, remove from DOM
```

Internal methods (rarely called directly):
- `_refresh()` -- full DOM replacement: serializes to HTML string, `replaceWith` on the existing node, re-applies event listeners, re-renders children. No diffing -- the entire subtree is rebuilt. Triggered internally by the `.children` setter.
- `_applyEventListeners()`, `_renderChildren()`, `_removeChildren()`

---

## 3. Routing System

### Router Singleton

`Router` is a singleton managing all SPA navigation (source: `src/base/routing/Router.ts`).

```javascript
// Initialize once at app startup with route names
new Router(['dashboard', 'admin', 'profile'])
// Automatically loads routes/route.js as landing page (no 'home' in array)
```

### defineRoute Factory

Every route MUST export via `defineRoute()`:

```javascript
// routes/dashboard/route.js
export default defineRoute((config) => {
  config.setRouteTitle('My Dashboard')

  // ALL route code lives inside this callback (functions, constants, variables)
  // This ensures proper GC when Router navigates away

  return [
    new Text('Dashboard', { type: 'h1' }),
    createDashboardContent()
  ]
})
```

### Navigation

```javascript
Router.navigateTo('dashboard')
Router.navigateTo('search', { queryParams: { q: 'hello', page: 1 } })
Router.navigateTo('profile', { newTab: true })

// Access query params (returns URLSearchParams)
const params = Router.queryParams
const searchTerm = params.get('q')

// Site root path
Router.siteRootPath  // SharePoint site absolute URL
```

### Subroutes

Nested folders with their own `route.js`:

```
routes/
  admin/
    route.js              # admin route
    settings/
      route.js            # admin/settings subroute
    users/
      route.js            # admin/users subroute
```

Access: `Router.navigateTo('admin/settings')`

### Error Handling

- Global `ErrorBoundary` wraps the entire app -- catches unhandled errors and shows `ErrorDialog`
- For expected errors, use try/catch and show feedback via `Toast.error()` or `Dialog`

---

## 4. State Management & Communication

State management in SPARC is deliberately simple. There is no Redux-like store, no useState hooks, no reactivity system. Data is passed by reference. This topic is a work in progress and will evolve.

Important: FormField is for data the user interacts with (form inputs, filters, selections). For read-only data (user profiles, config from lists, document library files, lookup tables), use plain variables -- there is no reason to wrap static data in FormField.

### FormField: Basic Usage

Source: `src/base/utils/form/FormField.class.ts`

```javascript
const field = new FormField({
  value: '',                    // initial value (cloneDeep'd)
  validatorCallback: (v) => v.length > 0,  // optional
  onChangeHandler: (v) => console.log('changed:', v)  // optional
})

field.value          // get current value
field.value = 'new'  // set value (triggers cloneDeep + wasTouched + onChangeHandler)
field.wasTouched     // true after first value set
field.isValid        // result of last validate() call
field.hasValidation  // true if validatorCallback was provided
field.validate()     // runs validatorCallback, returns boolean or null (if no validator)
field.focusOnInput() // focuses the linked input element
```

### Change Callbacks

`onChangeHandler` is set via the constructor -- there is no public setter:

```javascript
const searchField = new FormField({
  value: '',
  onChangeHandler: (query) => {
    // Fires every time .value is set
    // Use this to trigger UI updates, filtering, etc.
    updateResults(query)
  }
})
```

### Form Validation

Use `validatorCallback` with Zod for runtime validation:

```javascript
const emailField = new FormField({
  value: '',
  validatorCallback: (val) =>
    __zod.string().email('Invalid email').safeParse(val).success
})

// Later, check validity
emailField.validate()  // returns true/false/null
if (!emailField.isValid) {
  emailField.focusOnInput()
  Toast.error('Please enter a valid email')
}
```

### FormSchema: Group Related Fields

Source: `src/base/utils/form/FormSchema.class.ts`

```javascript
// Create from explicit fields
const schema = new FormSchema({
  name: new FormField({ value: '' }),
  email: new FormField({ value: '', validatorCallback: emailValidator })
})

// Or create from key names (all fields start as empty FormFields)
const schema = FormSchema.fromKeys(['name', 'email', 'phone'])

schema.get('name')           // returns the FormField
schema.isValid               // true if ALL fields are valid
schema.hasUntouchedFields    // true if ANY field has not been touched
schema.focusOnFirstInvalid() // focuses the first invalid field's input
schema.parse()               // returns { name: value, email: value, ... }
```

### Component Communication Patterns

#### 1. Parent-Child (Props)

Pass FormField or data as constructor arguments:

```javascript
function createParent() {
  const nameField = new FormField({ value: '' })
  return new Container([
    createChildInput(nameField),
    createChildDisplay(nameField)
  ])
}
```

#### 2. Sibling Communication (Parent Mediator)

Parent creates the shared FormField, passes to multiple children:

```javascript
function createSearchPage(items) {
  const searchField = new FormField({
    value: '',
    onChangeHandler: (query) => {
      // Both siblings react to the same state
      filteredList.children = filterItems(items, query)
    }
  })

  const searchInput = new TextInput(searchField, { placeholder: 'Search...' })
  const filteredList = new Container(items.map(renderItem))

  return new Container([searchInput, filteredList])
}
```

#### 3. Context API (Planned)

Global state management similar to React Context is planned but not yet implemented.

### Best Practice: Encapsulate State

Keep FormFields scoped to the creating function. Expose only what consumers need -- not the raw FormField itself if they only need to read the value.

---

## 5. Building Components

### Creating Custom Components

Developers create **composed components** using factory functions, not classes. This is the standard pattern:

```javascript
// components/projectCard/projectCard.js
export function createProjectCard(project) {
  const statusField = new FormField({
    value: project.Status,
    validatorCallback: (v) => __zod.enum(['Active', 'Completed', 'On Hold']).safeParse(v).success
  })

  return new Card([
    new Text(project.Title, { type: 'h3' }),
    new Text(`Status: ${project.Status}`, { type: 'p' }),
    new Button('View Details', {
      onClickHandler: () => Router.navigateTo('projects/detail', {
        queryParams: { id: project.UUID }
      })
    })
  ])
}
```

Extending `HTMDElement` directly is ideal in theory but gets tricky and messy in plain JavaScript. Custom components created with raw jQuery that integrate with SPARC components (following the same string-representation pattern with optional event handlers) are possible but **not recommended** -- they risk buggy scenarios with uncleared events and lifecycle issues.

### Using Custom Components

Import and compose inside `defineRoute`:

```javascript
// routes/projects/route.js
import { defineRoute } from '../../dist/nofbiz.base.js'
import { createProjectCard } from './components/projectCard/projectCard.js'

export default defineRoute(async (config) => {
  config.setRouteTitle('Projects')

  const siteApi = new SiteApi()
  const projects = await siteApi.list('Projects').getItems()

  return [
    new Text('Projects', { type: 'h1' }),
    ...projects.map(createProjectCard)
  ]
})
```

### Styling Custom Components

Every SPARC component auto-generates a CSS class following `${SPARC_PREFIX}__componentname`. A global CSS file can already target and style all SPARC components via these predictable class names -- you do NOT need a per-component CSS file by default.

Only create component-specific CSS when you need unique styling (page layouts, one-off overrides):

```css
/* Only needed for unique styling */
.nofbiz__card.project-card {
  border-left: 4px solid var(--primary-color);
}
```

Pass custom classes via the `class` prop: `new Card(children, { class: 'project-card' })`

Note: The current prefix is `nofbiz`, but `SPARC_PREFIX` may change in the future. The prefix is defined in `src/base/utils/misc/identity.ts`.

---

## 6. SharePoint Integration

### 6.1 Core Principle

SharePoint handles: data storage (Lists), user authentication (AD), group management, email workflows (Designer).

SPARC handles: all UI rendering, data validation, application routing, business logic, user interaction.

### 6.2 SiteApi

Source: `src/base/sharepoint/api/SiteApi.class.ts`

Singleton by normalized URL -- multiple `new SiteApi(url)` calls with the same URL return the same instance.

```javascript
const siteApi = new SiteApi()               // defaults to _spPageContextInfo.webAbsoluteUrl
const siteApi = new SiteApi(absoluteUrl)    // specific site URL (singleton per URL)
```

**List factory** -- cached ListApi instances:

```javascript
const api = siteApi.list('Projects')                        // cached, reused on subsequent calls
const api = siteApi.list('Projects', { listItemType: '...' }) // with options
```

**Site operations:**

```javascript
await siteApi.getLists()                       // all lists (SPList[])
await siteApi.getSiteGroups()                  // all site groups (SPGroup[])
await siteApi.getWebInfo()                     // web properties (SPWeb)
await siteApi.createList('NewList', options?)   // create list, returns ListApi
await siteApi.deleteList('OldList')            // delete list by title
await siteApi.getFullUserDetails(loginName)    // delegates to people.api
```

**Request digest:**

```javascript
await siteApi.getRequestDigest()
```

- **Local site** (URL matches `_spPageContextInfo.webAbsoluteUrl`): reads the `#__REQUESTDIGEST` DOM element directly -- instant, no API call.
- **Remote site**: delegates to `refreshRequestDigest()`, which handles caching, expiry, and in-flight coalescing.

### 6.3 ListApi

Source: `src/base/sharepoint/api/ListApi.class.ts`

Prefer `siteApi.list(title)` over `new ListApi(title)` -- the factory caches instances and auto-injects the SiteApi.

```javascript
const api = siteApi.list('Projects')
// or directly:
const api = new ListApi('Projects', { listItemType: 'SP.Data.ProjectsListItem', siteApi: customSiteApi })
```

**Get items** -- accepts `CAMLQueryObject` (key-value Record) or raw CAML XML string. `CAMLQueryObject` generates only `<Eq>` comparisons joined by `<And>`. For other operators (`Gt`, `Lt`, `Contains`, etc.) or `<Or>` logic, pass a raw CAML XML string. Automatically paginates in 500-item pages:

```javascript
// All items (default limit: 1000)
const items = await api.getItems()

// Filtered by field values (CAML query object -- NOT REST filter syntax)
const active = await api.getItems({ Status: 'Active' })
const specific = await api.getItems({ Status: 'Active', Priority: 'High' })

// Raw CAML XML for complex queries (needed for operators other than Eq, or for Or logic)
const custom = await api.getItems('<View><Query><Where>...</Where></Query></View>')

// Control pagination limit
const all = await api.getItems({}, { limit: Infinity })   // fetch everything
const top50 = await api.getItems({}, { limit: 50 })       // stop after 50

// Convenience methods
const byTitle = await api.getItemByTitle('My Project')
const byUUID = await api.getItemByUUID('550e8400-e29b-41d4-a716-446655440000')
const owned = await api.getOwnedItems()          // defaults to current user's siteUserId
const owned = await api.getOwnedItems(userId)    // specific user
```

**Create item** -- Record<string, string>:

```javascript
await api.createItem({
  Title: 'New Project',
  Status: 'Active',
  Owner: user.get('email')
})
```

**Update item** -- partial update via MERGE (only specified fields are modified):

```javascript
await api.updateItem(itemId, { Status: 'Completed', CompletedDate: '2026-01-15' })
```

**Concurrency:** All writes (`createItem`, `updateItem`, `deleteItem`) use `IF-MATCH: *` -- no optimistic concurrency. Concurrent edits to the same item silently overwrite each other.

**Delete items:**

```javascript
await api.deleteItem(itemId)     // single item by ID
await api.deleteALLItems()       // deletes every item in the list
```

**Field management:**

```javascript
const fields = await api.getFields()                                       // non-hidden, non-readonly fields
await api.createField({ title: 'Priority' })                               // Text field (single-line, 255 chars)
await api.createField({ title: 'Description', multiline: true })           // Note field (multi-line, richText: false)
await api.createField({ title: 'Category', indexed: true })                // Text field with index
await api.deleteField('InternalFieldName')
await api.setFieldIndexed('Title', true)                                   // toggle index on existing field
```

All ListApi operations are **async** (return Promises).

### 6.4 CurrentUser

Source: `src/base/sharepoint/user/CurrentUser.ts`

Async singleton -- `initialize()` returns `this`, enabling a one-liner:

```javascript
const user = await new CurrentUser().initialize(groupHierarchy)  // preferred: construct + initialize in one step
```

The two-step form also works:

```javascript
const user = new CurrentUser()                    // returns singleton slot (subsequent calls return same instance)
await user.initialize(groupHierarchy)             // loads data from SharePoint (idempotent once successful)
```

**Type-safe accessor** -- `get<K>(key)` returns the correctly-typed value:

```javascript
user.get('loginName')          // string -- claims-encoded (e.g. "i:0#.w|DOMAIN\\user")
user.get('displayName')        // string
user.get('email')              // string
user.get('siteUserId')         // number -- numeric ID on the current site
user.get('jobTitle')           // string
user.get('pictureUrl')         // string
user.get('personalUrl')        // string
user.get('directReports')      // string[] -- login names
user.get('managers')           // string[] -- login names
user.get('peers')              // string[] -- login names
user.get('groups')             // SPGroup[] -- SharePoint groups the user belongs to
user.get('profileProperties')  // Record<string, string> -- all non-empty profile properties
```

**Group hierarchy getters** -- resolved from the hierarchy array passed to `initialize()`:

```javascript
user.accessLevel   // string | null -- the groupLabel of the matched hierarchy entry (e.g. 'ADMIN')
user.group         // SPGroup | null -- the full SPGroup object for the match
user.groupId       // number | null -- SPGroup.Id
user.groupTitle    // string | null -- SPGroup.Title
user.isInitialized // boolean -- true after successful initialize()
```

**Group hierarchy** is an ordered array of `{ groupTitle, groupLabel }` entries, checked from last (highest priority) to first. The first case-insensitive match against the user's SharePoint groups wins:

```javascript
const groupHierarchy = [
  { groupTitle: 'App Visitors', groupLabel: 'VISITOR' },
  { groupTitle: 'App Members', groupLabel: 'MEMBER' },
  { groupTitle: 'App Admins', groupLabel: 'ADMIN' },
]
```

**Error recovery:** if `initialize()` fails, the singleton reference is cleared so that a subsequent `new CurrentUser()` creates a fresh instance and `initialize()` can be retried.

### 6.5 People API

Source: `src/base/sharepoint/api/people.api.ts`

Identity resolution utilities -- not tied to list operations. User data in lists is stored as plain strings (email, employee ID).

```javascript
// Search Active Directory via people picker
const results = await searchUsers('John', { maximumSuggestions: 10 })

// Get user profile from PeopleManager (farm-wide)
const profile = await getUserProfile('DOMAIN\\jsmith')

// Consolidated details: ensureUser + groups + profile (fault-tolerant)
const details = await getFullUserDetails('DOMAIN\\jsmith', siteApi)
```

Login name resolution: plain `DOMAIN\user` strings are automatically resolved to claims format (`i:0#.w|DOMAIN\user`) via people picker search. Claims-encoded names are passed through directly.

`getFullUserDetails` calls three endpoints in sequence: `ensureUser` (required), `getuserbyid/groups` (optional -- empty array on failure), and `PeopleManager/GetPropertiesFor` (optional -- partial data on failure). This is the same function used by `CurrentUser.initialize()`.

### 6.6 HTTP Layer

Source: `src/base/sharepoint/api/httpRequests.ts`

Low-level request functions for endpoints not covered by SiteApi/ListApi:

```javascript
const data = await spGET<ResponseType>(url, options?)
const result = await spPOST<ResponseType>(url, { data: payload, requestDigest })
await spDELETE(url, { requestDigest })
await spMERGE(url, { data: partialPayload, requestDigest })
```

Key behaviors:
- `X-RequestDigest` auto-injected on POST/DELETE/MERGE (from `_spPageContextInfo.formDigestValue` when not provided)
- Auto-retries once on 403 digest expiry (async mode only)
- `SPRequestOptions` extends `JQueryAjaxSettings` with optional `requestDigest` field
- All functions return `Promise<T>` by default; pass `{ async: false }` for synchronous execution (blocks main thread)

Most work should go through SiteApi and ListApi. Use the HTTP functions directly only for SharePoint REST endpoints those classes don't cover.

### 6.7 Data Modeling Principles

SharePoint lists are NoSQL-style document stores. SPARC enforces a strict data modeling approach:

**All fields are Text or Note only:**
- **Text** -- single-line, values up to 255 characters (FieldTypeKind 2)
- **Note** -- multi-line text, values exceeding 255 characters (FieldTypeKind 3, always `richText: false`)
- Never use Choice, Lookup, DateTime, Number, or other SharePoint field types
- Validation happens in SPARC via Zod, not in SharePoint

```javascript
// Create fields programmatically
await api.createField({ title: 'Status' })                          // Text
await api.createField({ title: 'LongDescription', multiline: true }) // Note (richText: false)
```

**User identifiers in lists:**
- Single-user columns: store the user's **email** address
- Multi-user or compact columns: store the **employee ID** (extracted from login name)
- Employee ID: globally unique, compact, extracted from `claimsPrefix|domain\[prefix]employeeID` -- parsing logic is app-level and environment-specific
- Never store site user IDs (numeric IDs are per-site, unreliable across migrations)

**FK relationships:** stored as string values (e.g., a UserSettings list pointing to a UserProfiles list via email). Joins happen in SPARC code, not via SharePoint lookup columns.

```javascript
const statusField = new FormField({
  value: 'active',
  validatorCallback: (val) =>
    __zod.enum(['active', 'inactive', 'pending', 'archived']).safeParse(val).success
})
```

### 6.8 Large Lists & Indexing

SharePoint's list view threshold is 5,000 items. SPARC handles this through pagination and indexing:

- `getItems()` automatically paginates in 500-item pages
- Pass `{ limit: Infinity }` to fetch all items across pages; use a specific number to cap results
- Index columns that are used as CAML query filters to avoid throttling

**Indexing guidelines:**
- Always index the **Title** field (every list uses it)
- Index the **UUID** field when present (lists needing cross-site unique identifiers)
- Index any field frequently used in CAML query filters

```javascript
// At list creation time
await api.createField({ title: 'Category', indexed: true })

// On an existing field
await api.setFieldIndexed('Title', true)
```

Indexing is a design-time concern -- plan which columns need indexing upfront based on expected query patterns and data volume.

### 6.9 Permission-Based Routing

Use `CurrentUser` with group hierarchy to conditionally register routes:

```javascript
const user = await new CurrentUser().initialize([
  { groupTitle: 'App Visitors', groupLabel: 'VISITOR' },
  { groupTitle: 'App Members', groupLabel: 'MEMBER' },
  { groupTitle: 'App Admins', groupLabel: 'ADMIN' },
])

const routes = ['dashboard', 'profile']
if (user.accessLevel === 'ADMIN') {
  routes.push('admin', 'admin/settings')
}
new Router(routes)
```

### Error Handling

```javascript
// For expected errors -- try/catch with user feedback
try {
  const data = await api.getItems()
  return data
} catch (error) {
  Toast.error('Unable to load data. Please refresh.')
  return []
}

// For unexpected errors -- ErrorBoundary catches them automatically
// Shows ErrorDialog to the user
```

---

## 7. Styling & CSS

### BEM Methodology

SPARC uses Block-Element-Modifier naming with `SPARC_PREFIX` (currently `nofbiz`):

```css
.nofbiz__button { }                  /* block */
.nofbiz__button--primary { }         /* modifier */
.nofbiz__card__header { }            /* element */
.nofbiz__card__header--highlighted { } /* element + modifier */
```

### Auto-Generated Classes

When components render, they automatically get their BEM class:

```javascript
new TextInput(field)
// Renders with class: nofbiz__textinput

new Button('Click', { variant: 'primary' })
// Renders with class: nofbiz__button nofbiz__button--primary

new Card(children, { class: 'custom-card' })
// Renders with class: nofbiz__card custom-card
```

### Styling Philosophy

- Every component gets `${SPARC_PREFIX}__componentname` automatically -- no manual class assignment needed
- A single global CSS file can style all SPARC components via these predictable selectors
- Custom classes are additive -- pass via the `class` prop for unique/one-off styling
- Co-located CSS files (e.g., `component.css` next to `component.js`) are only needed for unique layouts
- Never use inline styles on SPARC components
- The prefix prevents collisions with other libraries and SharePoint's own styles

### Global Styles

Place app-wide styles in `app/styles.css`:

```css
:root {
  --primary-color: #0070d2;
  --secondary-color: #6c757d;
  --error-color: #e74c3c;
  --spacing-unit: 0.5rem;
}
```

---

## 8. Utilities & Helpers

### pageReset()

Called at the top of the entry HTML to prepare for SPARC. Removes SharePoint chrome, adds `#root` container:

```html
<script>pageReset()</script>
```

### Global Dependencies

These are bundled into the base module and available at runtime without imports:

- `__zod` -- runtime validation (Zod)
- `__lodash` -- utility functions (use specific functions like `__lodash.debounce`, not the whole library)
- `__dayjs` -- date/time manipulation
- `__fuse` -- fuzzy search (Fuse.js)

Additional utilities are exported from the base module. These will grow and change over time -- check `src/base/index.ts` for the current list. Examples of what you may find:

- `resolvePath()` -- resolves `@` prefix to SharePoint site URL (DX convenience, not required)
- `copyToClipboard()` -- clipboard utility
- `mockPromise()` -- mock async operations during development
- `generateRuntimeUID()` / `generateUUIDv4()` -- ID generation
- `enforceStrictObject()` -- type safety helper
- `StyleResource` -- dynamic stylesheet loading
- `SimpleElapsedTimeBenchmark` -- performance measurement

### Path Utilities

`resolvePath()` (source: `src/base/utils/misc/path.ts`) replaces `@` with the SharePoint URL:

```javascript
resolvePath('@/images/logo.png')
// -> https://site.sharepoint.com/SiteAssets/app/images/logo.png

resolvePath('@/images/logo.png', { useSiteRoot: true })
// -> https://site.sharepoint.com/images/logo.png
```

This is a DX convenience -- writing the full path manually is equally valid.

---

## 9. Common Patterns

### Search/Filter List

FormField holds the search term. `onChangeHandler` filters the dataset and updates the list:

```javascript
function createSearchableList(items) {
  const listContainer = new Container(items.map(renderItem))

  const searchField = new FormField({
    value: '',
    onChangeHandler: (query) => {
      const filtered = items.filter(item =>
        item.Title.toLowerCase().includes(query.toLowerCase())
      )
      listContainer.children = filtered.map(renderItem)
    }
  })

  return new Container([
    new TextInput(searchField, { placeholder: 'Search...' }),
    listContainer
  ])
}
```

### Data Table with Sorting/Filtering

Fetch all data once, then sort/filter client-side via FormField onChange. No re-querying:

```javascript
function createDataTable() {
  const data = await siteApi.list('Projects').getItems()
  const tableContainer = new Container(renderRows(data))

  const sortField = new FormField({
    value: 'Title',
    onChangeHandler: (column) => {
      const sorted = [...data].sort((a, b) => a[column].localeCompare(b[column]))
      tableContainer.children = renderRows(sorted)
    }
  })

  return new Container([
    createSortControls(sortField),
    tableContainer
  ])
}
```

### Modal Dialog

Modals separate rendering from visibility. Render first (puts in DOM but hidden), then control with `open()`/`close()`:

```javascript
const confirmDialog = new Dialog({
  title: 'Confirm Delete',
  content: [new Text('This action cannot be undone.', { type: 'p' })],
  variant: 'warning',
  onCloseHandler: () => { /* cleanup if needed */ }
})

confirmDialog.render()   // In DOM but hidden -- no animation glitch
// Later...
confirmDialog.open()     // Show with proper animation
// User interacts...
confirmDialog.close()    // Hide with proper animation
```

This separation prevents buggy animations and gives granular control when rendering component sets that include modals not meant to be visible immediately.

### Master-Detail View

Use `ViewSwitcher` to toggle between the list view and the detail view:

```javascript
function createMasterDetail(items) {
  const viewSwitcher = new ViewSwitcher([
    createListView(items, (item) => viewSwitcher.switchTo(1)),
    createDetailView(selectedItem)
  ])
  return viewSwitcher
}
```

### Async Data Loading

ListApi operations are async. Use FormField to manage loading state and update the UI when data arrives:

```javascript
function createAsyncList() {
  const listContainer = new Container([new Loader()])

  api.getItems().then(items => {
    listContainer.children = items.map(renderItem)
  }).catch(() => {
    Toast.error('Failed to load data')
    listContainer.children = [new Text('Unable to load data.')]
  })

  return listContainer
}
```

### Protected Routes

Use CurrentUser with group hierarchy to conditionally register routes:

```javascript
const user = await new CurrentUser().initialize([
  { groupTitle: 'App Visitors', groupLabel: 'VISITOR' },
  { groupTitle: 'App Members', groupLabel: 'MEMBER' },
  { groupTitle: 'App Admins', groupLabel: 'ADMIN' },
])

const routes = ['dashboard', 'profile']
if (user.accessLevel === 'ADMIN') {
  routes.push('admin', 'admin/settings')
}
new Router(routes)
```

---

## 10. File Organization & Naming

File structure rules are in `.claude/rules/project-structure.md`. This section covers naming conventions only.

### Variables
- `camelCase` for all variables
- Descriptive names: `userEmailField` not `uef`
- Boolean prefixes: `isActive`, `hasPermission`, `canEdit`

### Functions
- `camelCase` with verb prefix: `createLoginForm`, `fetchProjectData`, `handleFormSubmit`
- Common prefixes: `create*`, `fetch*`, `handle*`, `check*`, `set*`, `get*`, `build*`, `validate*`

### Classes/Components
- `PascalCase` for component classes: `UserCard`, `ProjectTable`
- `camelCase` for factory functions: `createLoginForm`, `createUserTable`

### Files
- `kebab-case` for all files: `login-form.js`, `user-card.css`, `data-transforms.js`
- Folder names match kebab-case: `routes/user-profile/`

### CSS Classes
- BEM with `${SPARC_PREFIX}__` prefix: `.nofbiz__componentname`, `.nofbiz__componentname--modifier`
- Component folder name matches CSS class base

### Constants
- `UPPER_SNAKE_CASE` for true constants: `MAX_RETRIES`, `API_TIMEOUT`

---

## 11. Development & Deployment

### Framework Development (TypeScript)

```bash
npm install          # Install dependencies once
npm run dev          # Watch mode -- auto-compiles TypeScript
npm run bundle       # Compile TypeScript + bundle with Rollup
npm run lint         # Check code quality
```

Output:
- `dist/nofbiz.base.js` -- main framework bundle
- `dist/nofbiz.base.d.ts` -- TypeScript definitions
- `dist/nofbiz.analytics.js` -- analytics module (optional)
- `dist/nofbiz.excelparser.js` -- excel parser module (optional)
- `dist/styles.css` -- compiled SCSS

### Project Development (Using SPARC)

No build step required:

1. Deploy framework files to SharePoint (`/SiteAssets/dist/`)
2. Create entry HTML with media content webpart
3. Write application code in `/SiteAssets/app/` (plain JavaScript)
4. Refresh browser -- changes take effect immediately

```html
<script>pageReset()</script>
<script src="/sites/yoursite/SiteAssets/dist/nofbiz.base.js"></script>
<script src="/sites/yoursite/SiteAssets/app/index.js"></script>
```

---

## 12. Glossary

- **HTMD**: HyperText Markup Dialect -- HTML syntax using JavaScript objects
- **HTMDNode**: A component instance that implements HTMDElementInterface, or a string, or an array of these
- **HTMDElement**: Abstract base class for all visual SPARC components
- **FormField**: Observable state container with optional validation and change callbacks
- **FormSchema**: Groups multiple FormFields for form-level validation and parsing
- **SPA**: Single-Page Application -- navigation without full page reloads
- **BEM**: Block-Element-Modifier -- CSS naming convention used by SPARC
- **SPARC_PREFIX**: The project-wide CSS prefix (currently `nofbiz`), used in BEM class generation
- **defineRoute**: Factory function wrapping route content for lazy loading and GC-safe scoping
- **Router**: Singleton managing hash-based SPA navigation and route loading
- **Container**: Layout component wrapping children in an HTML element
- **Fragment**: Layout component rendering children without an HTML wrapper element
- **ErrorBoundary**: Component catching unhandled errors globally
- **ListApi**: SharePoint List CRUD interface using CAML queries
- **SiteApi**: Singleton per URL managing request digest tokens, list factory, and site-level operations
- **CurrentUser**: Async singleton providing current user profile, group memberships, and access level via group hierarchy
- **People API**: Identity resolution utilities (searchUsers, getUserProfile, getFullUserDetails)
