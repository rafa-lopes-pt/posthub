import {
  defineRoute,
  Container,
  Text,
  Button,
  ComboBox,
  LinkButton,
  getIcon,
  FormField,
  SiteApi,
  CurrentUser,
} from '../../libs/nofbiz/nofbiz.base.js'

import { createNavbar } from '../../components/navbar.js'
import { LIST_PACKAGES, LIST_EMPLOYEES } from '../../utils/constants.js'

export default defineRoute(async (config) => {
  config.setRouteTitle('PostHub - My Mail')

  const siteApi = new SiteApi()
  const user = new CurrentUser()
  const currentUserEmail = user.get('email')

  // Load packages and employees in parallel
  const [allPackages, allEmployees] = await Promise.all([
    siteApi.list(LIST_PACKAGES).getItems(),
    siteApi.list(LIST_EMPLOYEES).getItems(),
  ])

  // Build employee name map
  const nameMap = new Map(allEmployees.map(e => [e.Email, e.Title]))
  function getEmployeeName(email) {
    return nameMap.get(email) || email
  }

  // Filter packages for current user
  const allMyPackages = allPackages.filter(pkg =>
    pkg.Sender === currentUserEmail || pkg.Recipient === currentUserEmail
  )

  // State for view mode and filters
  let viewMode = 'sent'
  let filteredPackages = [...allMyPackages]
  const filters = {
    status: [],
    senderRecipient: [],
    trackingId: []
  }

  // Navbar component
  const navbar = createNavbar()

  // Toggle button
  const toggleButton = new Button('Switch to Incoming', {onClickHandler:toggleViewMode, class: 'my-mail__toggle-btn' })

  // Page header with title and button
  const pageHeader = new Container([
    new Container([
      new Container([
        new LinkButton(getIcon('home-line'), '/', {
          class: 'my-mail__home-icon'
        }),
        new Text('My Mail', {
          type: 'h1',
          class: 'my-mail__title'
        }),
      ], { class: 'my-mail__title-with-icon' }),
      new Text('Check both packages you sent, and are waiting to receive', {
        type: 'p',
        class: 'my-mail__subtitle'
      }),
    ], { class: 'my-mail__title-section' }),

    toggleButton,
  ], { class: 'my-mail__header' })

  // Get packages for current view mode (before ComboBox filters)
  function getBasePackages() {
    return allMyPackages.filter(pkg =>
      viewMode === 'sent' ? pkg.Sender === currentUserEmail : pkg.Recipient === currentUserEmail
    )
  }

  // Rebuild ComboBox datasets from the actual packages in the current view
  function rebuildDatasets() {
    const base = getBasePackages()

    const statuses = [...new Set(base.map(p => p.Status))]
    statusComboBox.dataset = statuses.map(s => ({
      label: s.charAt(0).toUpperCase() + s.slice(1),
      value: s
    }))

    const emails = [...new Set(base.flatMap(p => [p.Sender, p.Recipient]))].filter(e => e !== currentUserEmail)
    senderRecipientComboBox.dataset = emails.map(email => ({
      label: getEmployeeName(email),
      value: email
    }))

    trackingIdComboBox.dataset = base.map(p => ({
      label: p.Title,
      value: p.Title
    }))
  }

  // Filter function
  function applyFilters() {
    let basePackages = getBasePackages()

    // Then apply selection filters
    filteredPackages = basePackages.filter(pkg => {
      if (filters.status.length > 0 && !filters.status.includes(pkg.Status)) {
        return false
      }

      if (filters.senderRecipient.length > 0) {
        if (!filters.senderRecipient.includes(pkg.Sender) && !filters.senderRecipient.includes(pkg.Recipient)) {
          return false
        }
      }

      if (filters.trackingId.length > 0 && !filters.trackingId.includes(pkg.Title)) {
        return false
      }

      return true
    })

    updateTable()
    updateViewSubtitle()
  }

  // Toggle view mode
  function toggleViewMode() {
    viewMode = viewMode === 'sent' ? 'incoming' : 'sent'
    filters.status = []
    filters.senderRecipient = []
    filters.trackingId = []
    statusComboBox.clearSelection()
    senderRecipientComboBox.clearSelection()
    trackingIdComboBox.clearSelection()
    rebuildDatasets()
    applyFilters()
    updateToggleButton()
  }

  // Update toggle button text
  function updateToggleButton() {
    const buttonText = viewMode === 'sent' ? 'Switch to Incoming' : 'Switch to Sent'
    toggleButton.children = buttonText
  }

  // Update view subtitle
  function updateViewSubtitle() {
    const subtitleText = viewMode === 'sent'
      ? `Showing ${filteredPackages.length} package(s) you sent`
      : `Showing ${filteredPackages.length} incoming package(s)`
    viewSubtitle.children = [new Text(subtitleText, { type: 'p', class: 'my-mail__view-subtitle' })]
  }

  // ComboBox filter helpers
  function extractSelection(selection) {
    if (!selection) return []
    const arr = Array.isArray(selection) ? selection : [selection]
    return arr.map(s => s.value)
  }

  // Status ComboBox (no filtering -- just select from available statuses)
  const statusField = new FormField({ value: [] })
  const statusComboBox = new ComboBox(statusField, [], {
    allowMultiple: true,
    allowFiltering: false,
    allowCreate: false,
    placeholder: 'Select status...',
    onSelectHandler: (selection) => { filters.status = extractSelection(selection); applyFilters() }
  })

  // Sender/Recipient ComboBox (filterable by name)
  const senderRecipientField = new FormField({ value: [] })
  const senderRecipientComboBox = new ComboBox(senderRecipientField, [], {
    allowMultiple: true,
    allowFiltering: true,
    allowCreate: false,
    placeholder: 'Search sender/recipient...',
    onSelectHandler: (selection) => { filters.senderRecipient = extractSelection(selection); applyFilters() }
  })

  // Tracking ID ComboBox (filterable)
  const trackingIdField = new FormField({ value: [] })
  const trackingIdComboBox = new ComboBox(trackingIdField, [], {
    allowMultiple: true,
    allowFiltering: true,
    allowCreate: false,
    placeholder: 'Search tracking ID...',
    onSelectHandler: (selection) => { filters.trackingId = extractSelection(selection); applyFilters() }
  })

  // View subtitle
  const viewSubtitle = new Container([], { class: 'my-mail__view-subtitle-container' })

  const filterSection = new Container([
    viewSubtitle,

    new Container([
      new Text('Status', { type: 'label', class: 'my-mail__filter-label' }),
      statusComboBox,
    ], { class: 'my-mail__filter-group' }),

    new Container([
      new Text('Sender / Recipient', { type: 'label', class: 'my-mail__filter-label' }),
      senderRecipientComboBox,
    ], { class: 'my-mail__filter-group' }),

    new Container([
      new Text('Tracking ID', { type: 'label', class: 'my-mail__filter-label' }),
      trackingIdComboBox,
    ], { class: 'my-mail__filter-group' }),
  ], { class: 'my-mail__filters' })

  // Create table rows
  function createTableRows() {
    return filteredPackages.map(pkg => {
      const senderName = getEmployeeName(pkg.Sender)
      const recipientName = getEmployeeName(pkg.Recipient)
      // Show recipient when viewing sent mail, sender when viewing incoming mail
      const displayName = viewMode === 'sent' ? recipientName : senderName

      return `
        <tr class="my-mail__table-row">
          <td class="my-mail__table-cell">
            <span class="my-mail__status-badge my-mail__status-badge--${pkg.Status.toLowerCase().replace(' ', '-')}">
              ${pkg.Status}
            </span>
          </td>
          <td class="my-mail__table-cell">${displayName}</td>
          <td class="my-mail__table-cell">${pkg.Title}</td>
        </tr>
      `
    }).join('')
  }

  // Table container with scroll
  const tableContainer = new Container([], { class: 'my-mail__table-container' })

  // Function to update table
  function updateTable() {
    const toFromHeader = viewMode === 'sent' ? 'To' : 'From'

    tableContainer.children = `
      <table class="my-mail__table">
        <thead class="my-mail__table-head">
          <tr>
            <th class="my-mail__table-header">Status</th>
            <th class="my-mail__table-header">${toFromHeader}</th>
            <th class="my-mail__table-header">Tracking ID</th>
          </tr>
        </thead>
        <tbody class="my-mail__table-body">
          ${filteredPackages.length > 0 ? createTableRows() : '<tr><td colspan="3" class="my-mail__table-empty">No packages found</td></tr>'}
        </tbody>
      </table>
    `
  }

  // Initial render - populate datasets and apply filters
  rebuildDatasets()
  applyFilters()

  // Main content area
  const contentArea = new Container([
    pageHeader,
    filterSection,
    tableContainer,
  ], { class: 'my-mail__content' })

  // Return page layout
  return [
    navbar,
    contentArea,
  ]
})
