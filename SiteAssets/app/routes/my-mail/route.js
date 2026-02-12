import {
  defineRoute,
  Container,
  Text,
  Button,
  TextInput,
  LinkButton,
  getIcon,
} from '../../libs/nofbiz/nofbiz.base.js'

import { createNavbar } from '../../components/navbar.js'
import { MOCK_PACKAGES, getEmployeeName } from '../../utils/mockData.js'

export default defineRoute((config) => {
  config.setRouteTitle('PostHub - My Mail')

  // State for view mode and filters
  let viewMode = 'sent' // 'sent' or 'incoming'
  let filteredPackages = [...MOCK_PACKAGES]
  const filters = {
    status: '',
    senderRecipient: '',
    date: '',
    trackingId: ''
  }

  // Mock current user (TODO: Replace with actual user from CurrentUser)
  const currentUserEmail = 'john.smith@company.com'

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

  // Filter function
  function applyFilters() {
    // First filter by view mode (sent or incoming)
    let basePackages = MOCK_PACKAGES.filter(pkg => {
      if (viewMode === 'sent') {
        return pkg.Sender === currentUserEmail
      } else {
        return pkg.Recipient === currentUserEmail
      }
    })

    // Then apply search filters
    filteredPackages = basePackages.filter(pkg => {
      // Filter by status
      if (filters.status && !pkg.Status.toLowerCase().includes(filters.status.toLowerCase())) {
        return false
      }

      // Filter by sender/recipient
      if (filters.senderRecipient) {
        const senderName = getEmployeeName(pkg.Sender).toLowerCase()
        const recipientName = getEmployeeName(pkg.Recipient).toLowerCase()
        const searchTerm = filters.senderRecipient.toLowerCase()
        if (!senderName.includes(searchTerm) && !recipientName.includes(searchTerm)) {
          return false
        }
      }

      // Filter by date
      if (filters.date && !pkg.Date.includes(filters.date)) {
        return false
      }

      // Filter by tracking ID
      if (filters.trackingId && !pkg.TrackingNumber.toLowerCase().includes(filters.trackingId.toLowerCase())) {
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

  // Filter inputs
  const statusInput = new TextInput('', {
    placeholder: 'Type here...',
    class: 'my-mail__filter-input'
  })

  const senderRecipientInput = new TextInput('', {
    placeholder: 'Type here...',
    class: 'my-mail__filter-input'
  })

  const dateInput = new TextInput('', {
    placeholder: 'Type here...',
    class: 'my-mail__filter-input'
  })

  const trackingIdInput = new TextInput('', {
    placeholder: 'Type here...',
    class: 'my-mail__filter-input'
  })

  // View subtitle
  const viewSubtitle = new Container([], { class: 'my-mail__view-subtitle-container' })

  const filterSection = new Container([
    viewSubtitle,

    new Container([
      new Text('Search by Status', { type: 'label', class: 'my-mail__filter-label' }),
      statusInput,
    ], { class: 'my-mail__filter-group' }),

    new Container([
      new Text('Search By Sender/Recipient', { type: 'label', class: 'my-mail__filter-label' }),
      senderRecipientInput,
    ], { class: 'my-mail__filter-group' }),

    new Container([
      new Text('Search By Date', { type: 'label', class: 'my-mail__filter-label' }),
      dateInput,
    ], { class: 'my-mail__filter-group' }),

    new Container([
      new Text('Search By Tracking ID', { type: 'label', class: 'my-mail__filter-label' }),
      trackingIdInput,
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
          <td class="my-mail__table-cell">${pkg.Date}</td>
          <td class="my-mail__table-cell">${pkg.TrackingNumber}</td>
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
            <th class="my-mail__table-header">Date</th>
            <th class="my-mail__table-header">Tracking ID</th>
          </tr>
        </thead>
        <tbody class="my-mail__table-body">
          ${filteredPackages.length > 0 ? createTableRows() : '<tr><td colspan="4" class="my-mail__table-empty">No packages found</td></tr>'}
        </tbody>
      </table>
    `
  }

  // Initial render - apply filters to set up view mode and subtitle
  applyFilters()

  // Add event listeners to filter inputs after rendering
  setTimeout(() => {
    statusInput.element.querySelector('input')?.addEventListener('input', (e) => {
      filters.status = e.target.value
      applyFilters()
    })

    senderRecipientInput.element.querySelector('input')?.addEventListener('input', (e) => {
      filters.senderRecipient = e.target.value
      applyFilters()
    })

    dateInput.element.querySelector('input')?.addEventListener('input', (e) => {
      filters.date = e.target.value
      applyFilters()
    })

    trackingIdInput.element.querySelector('input')?.addEventListener('input', (e) => {
      filters.trackingId = e.target.value
      applyFilters()
    })
  }, 0)

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
