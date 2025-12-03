# $PROJECT_NAME

A SharePoint on-premises application built with SPARC framework.

## Project Structure

```
project-root/
├── SitePages/
│   └── index.html           # HTML entry point (SharePoint location)
├── SiteAssets/
│   └── app/
│       ├── routes/          # Route definitions (route.js files)
│       ├── components/      # Reusable components
│       ├── utils/           # Utility functions
│       ├── libs/
│       │   └── nofbiz/      # SPARC framework (dist files)
│       ├── index.js         # Application entry point (Router only)
│       └── styles.css       # Global styles
└── .claude/
    └── agents/              # Claude Code agents
```

## Getting Started

### Prerequisites

- SPARC framework (parent directory)
- Claude Code (for development with agents)

### Development

1. **Navigate to project**:
   ```bash
   cd $PROJECT_NAME
   ```

2. **Create your first route**:
   ```bash
   mkdir -p SiteAssets/app/routes/dashboard
   touch SiteAssets/app/routes/dashboard/route.js
   touch SiteAssets/app/routes/dashboard/route.css
   ```

3. **Use Claude Code**:
   ```
   @sparc-developer Create a dashboard component
   ```

### Documentation

- [SPARC Framework Guide](../sparc/SPARC_FRAMEWORK_GUIDE.md)
- [Component Showcase](../sparc/COMPONENT_SHOWCASE_GUIDE.md)

## Deployment

When deploying to SharePoint:

1. Resolve symlinks:
   ```bash
   cp -L SiteAssets/dist/* deployment/dist/
   ```

2. Upload to SharePoint media webpart

3. Include index.html in SharePoint page

## Project Notes

### PostHub - Internal Mail Management System

PostHub is a proof-of-concept internal physical mail management system featuring:
- Badge swipe lookup for package retrieval
- Barcode label generation and printing (JsBarcode + CODE128)
- Multi-location hierarchical routing (Campus → Building → Room)
- Role-based access (RegularUser, FacilitiesEmployee, FacilitiesManager)
- Package tracking workflow (Sent → Received → In Transit → Delivered)

See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for complete architecture and setup.

### Important SPARC Patterns (Learned During Development)

#### ⚠️ CRITICAL: Never use `.element.innerHTML` on SPARC components

**WRONG:**
```js
contentView.element.innerHTML = '<p>Text</p>'
```

**CORRECT:**
```js
contentView.children = [new Text('Text', { type: 'p' })]
```

See [IMPLEMENTATION_PLAN.md - Development Lessons Learned](./IMPLEMENTATION_PLAN.md#development-lessons-learned) for detailed examples.

#### Home Route Structure

- Landing page: `routes/route.js` (NOT `routes/home/route.js`)
- Router config excludes 'home': `new Router(['my-mail', 'send-mail', ...])`

---

Built with [SPARC Framework](../sparc)
