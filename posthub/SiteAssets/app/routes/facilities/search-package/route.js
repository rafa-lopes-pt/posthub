import {
  defineRoute,
  Container,
  Text,
  TextInput,
  Button,
  LinkButton,
  ComboBox,
  PeoplePicker,
  getIcon,
  FormField,
  SiteApi,
} from '../../../libs/nofbiz/nofbiz.base.js'

import { createNavbar } from '../../../components/navbar.js'
import { LIST_PACKAGES, LIST_LOCATIONS, LIST_EMPLOYEES, PACKAGE_STATUSES } from '../../../utils/constants.js'

export default defineRoute(async (config) => {
  config.setRouteTitle('Search Package')

  const siteApi = new SiteApi()

  // Load locations and employees in parallel
  const [allLocations, allEmployees, allPackages] = await Promise.all([
    siteApi.list(LIST_LOCATIONS).getItems(),
    siteApi.list(LIST_EMPLOYEES).getItems(),
    siteApi.list(LIST_PACKAGES).getItems(),
  ])

  const locationOptions = allLocations.filter(l => l.IsActive === 'true').map(l => l.Title)
  const nameMap = new Map(allEmployees.map(e => [e.Email, e.Title]))
  function getEmployeeName(email) {
    return nameMap.get(email) || email
  }

  // State
  let searchResults = []
  let selectedPackage = null

  // Filter state (updated from callbacks, read in applyFilters)
  const filters = {
    tracking: '',
    senderEmail: '',
    recipientEmail: '',
    status: [],
    currentLocation: [],
    destination: [],
  }

  // Navbar
  const navbar = createNavbar()

  // Page header
  const pageHeader = new Container([
    new Container([
      new LinkButton(getIcon('home-line'), '/', {
        class: 'search-package__home-icon'
      }),
      new Text('Search Package', {
        type: 'h1',
        class: 'search-package__title'
      }),
    ], { class: 'search-package__title-with-icon' }),
    new Text('Track or look up any package by tracking number, sender, or recipient', {
      type: 'p',
      class: 'search-package__subtitle'
    }),
  ], { class: 'search-package__header' })

  // --- Helpers ---

  function extractSelection(selection) {
    if (!selection) return []
    const arr = Array.isArray(selection) ? selection : [selection]
    return arr.map(s => s.value)
  }

  // --- Filter fields ---

  // Tracking number (debounced keypress via DOM input event)
  let trackingDebounce = null
  const trackingField = new FormField({ value: '' })
  const trackingInput = new TextInput(trackingField, {
    placeholder: 'e.g. POSTHUB-20260201-00001'
  })

  function attachTrackingListener() {
    setTimeout(() => {
      const el = trackingInput.instance?.[0]
      if (!el) return
      const input = el.tagName === 'INPUT' ? el : el.querySelector('input')
      if (!input) return
      input.addEventListener('input', () => {
        clearTimeout(trackingDebounce)
        trackingDebounce = setTimeout(() => {
          filters.tracking = (input.value || '').toLowerCase()
          applyFilters()
        }, 200)
      })
    }, 100)
  }

  // Sender (PeoplePicker)
  // PeoplePicker option value = Key (claims string), not email.
  // Read email from selectedResult.EntityData.Email after selection.
  const senderField = new FormField({ value: { value: '', label: '' } })
  const senderPicker = new PeoplePicker(senderField, {
    onSelectHandler: () => {
      const result = senderPicker.selectedResult
      filters.senderEmail = result?.EntityData?.Email || result?.Description || ''
      applyFilters()
    }
  })

  // Recipient (PeoplePicker)
  const recipientField = new FormField({ value: { value: '', label: '' } })
  const recipientPicker = new PeoplePicker(recipientField, {
    onSelectHandler: () => {
      const result = recipientPicker.selectedResult
      filters.recipientEmail = result?.EntityData?.Email || result?.Description || ''
      applyFilters()
    }
  })

  // Status (ComboBox, multi-select)
  const statusField = new FormField({ value: [] })
  const statusComboBox = new ComboBox(statusField, PACKAGE_STATUSES.map(s => ({
    label: s.charAt(0).toUpperCase() + s.slice(1),
    value: s
  })), {
    allowMultiple: true,
    allowFiltering: false,
    allowCreate: false,
    placeholder: 'Select status...',
    onSelectHandler: (selection) => {
      filters.status = extractSelection(selection)
      applyFilters()
    }
  })

  // Current Location (ComboBox, multi-select)
  const currentLocationField = new FormField({ value: [] })
  const currentLocationComboBox = new ComboBox(currentLocationField, locationOptions.map(l => ({
    label: l, value: l
  })), {
    allowMultiple: true,
    allowFiltering: true,
    allowCreate: false,
    placeholder: 'Select current location...',
    onSelectHandler: (selection) => {
      filters.currentLocation = extractSelection(selection)
      applyFilters()
    }
  })

  // Destination (ComboBox, multi-select)
  const destinationField = new FormField({ value: [] })
  const destinationComboBox = new ComboBox(destinationField, locationOptions.map(l => ({
    label: l, value: l
  })), {
    allowMultiple: true,
    allowFiltering: true,
    allowCreate: false,
    placeholder: 'Select destination...',
    onSelectHandler: (selection) => {
      filters.destination = extractSelection(selection)
      applyFilters()
    }
  })

  // Clear all filters
  function clearFilters() {
    filters.tracking = ''
    filters.senderEmail = ''
    filters.recipientEmail = ''
    filters.status = []
    filters.currentLocation = []
    filters.destination = []

    trackingField.value = ''
    senderField.value = { value: '', label: '' }
    recipientField.value = { value: '', label: '' }
    senderPicker.clearSelection()
    recipientPicker.clearSelection()
    statusComboBox.clearSelection()
    currentLocationComboBox.clearSelection()
    destinationComboBox.clearSelection()

    searchResults = []
    selectedPackage = null
    updateView('initial')
  }

  const clearButton = new Button('Clear Filters', {
    onClickHandler: clearFilters,
    class: 'search-package__clear-btn'
  })

  // Filter bar layout
  const filterSection = new Container([
    new Container([
      new Text('Tracking Number', { type: 'label', class: 'search-package__filter-label' }),
      trackingInput,
    ], { class: 'search-package__filter-group' }),

    new Container([
      new Text('Sender', { type: 'label', class: 'search-package__filter-label' }),
      senderPicker,
    ], { class: 'search-package__filter-group' }),

    new Container([
      new Text('Recipient', { type: 'label', class: 'search-package__filter-label' }),
      recipientPicker,
    ], { class: 'search-package__filter-group' }),

    new Container([
      new Text('Status', { type: 'label', class: 'search-package__filter-label' }),
      statusComboBox,
    ], { class: 'search-package__filter-group' }),

    new Container([
      new Text('Current Location', { type: 'label', class: 'search-package__filter-label' }),
      currentLocationComboBox,
    ], { class: 'search-package__filter-group' }),

    new Container([
      new Text('Destination', { type: 'label', class: 'search-package__filter-label' }),
      destinationComboBox,
    ], { class: 'search-package__filter-group' }),

    new Container([clearButton], { class: 'search-package__filter-actions' }),
  ], { class: 'search-package__filters' })

  // Results container
  const resultsContainer = new Container([], { class: 'search-package__results' })

  // --- Filter logic ---

  function applyFilters() {
    selectedPackage = null

    const hasAnyFilter = filters.tracking || filters.senderEmail || filters.recipientEmail ||
      filters.status.length > 0 || filters.currentLocation.length > 0 || filters.destination.length > 0

    if (!hasAnyFilter) {
      searchResults = []
      updateView('initial')
      return
    }

    searchResults = allPackages.filter(pkg => {
      if (filters.tracking && !pkg.Title.toLowerCase().includes(filters.tracking)) return false
      if (filters.senderEmail && pkg.Sender !== filters.senderEmail) return false
      if (filters.recipientEmail && pkg.Recipient !== filters.recipientEmail) return false
      if (filters.status.length > 0 && !filters.status.includes(pkg.Status)) return false
      if (filters.currentLocation.length > 0 && !filters.currentLocation.includes(pkg.CurrentLocation)) return false
      if (filters.destination.length > 0 && !filters.destination.includes(pkg.DestinationLocation)) return false
      return true
    })

    updateView(searchResults.length > 0 ? 'results' : 'empty')
  }

  function handleRowClick(pkg) {
    selectedPackage = selectedPackage?.Title === pkg.Title ? null : pkg
    updateView('results')
  }

  function createTableRows() {
    return searchResults.map(pkg => {
      const statusClass = pkg.Status.replace(' ', '-')
      const isSelected = selectedPackage?.Title === pkg.Title
      const rowClass = isSelected
        ? 'search-package__table-row search-package__table-row--selected'
        : 'search-package__table-row'

      return new Container([
        new Text(pkg.Title, { type: 'span', class: 'search-package__table-cell' }),
        new Text(getEmployeeName(pkg.Sender), { type: 'span', class: 'search-package__table-cell' }),
        new Text(getEmployeeName(pkg.Recipient), { type: 'span', class: 'search-package__table-cell' }),
        new Container([
          new Text(pkg.Status, {
            type: 'span',
            class: `search-package__status-badge search-package__status-badge--${statusClass}`
          }),
        ], { class: 'search-package__table-cell' }),
        new Text(pkg.CurrentLocation, { type: 'span', class: 'search-package__table-cell' }),
        new Text(pkg.DestinationLocation, { type: 'span', class: 'search-package__table-cell' }),
      ], {
        class: rowClass,
        onClick: () => handleRowClick(pkg),
      })
    })
  }

  function createDetailView(pkg) {
    const timeline = pkg.Timeline ? JSON.parse(pkg.Timeline) : []

    const timelineChildren = timeline.length > 0
      ? timeline.map((entry, i) => {
        const statusClass = entry.status.replace(' ', '-')
        return new Container([
          new Text(`${i + 1}.`, { type: 'span', class: 'search-package__timeline-number' }),
          new Text(entry.status, {
            type: 'span',
            class: `search-package__status-badge search-package__status-badge--${statusClass}`
          }),
          new Text(entry.location || '', { type: 'span', class: 'search-package__timeline-location' }),
          new Text(entry.date ? new Date(entry.date).toLocaleString() : '', {
            type: 'span',
            class: 'search-package__timeline-date'
          }),
          new Text(entry.notes || '', { type: 'span', class: 'search-package__timeline-notes' }),
        ], { class: 'search-package__timeline-entry' })
      })
      : [new Text('No timeline entries recorded', { type: 'p', class: 'search-package__detail-empty' })]

    return new Container([
      new Text('Package Details', { type: 'h3', class: 'search-package__detail-title' }),

      new Container([
        new Container([
          new Text('Tracking Number', { type: 'span', class: 'search-package__detail-label' }),
          new Text(pkg.Title, { type: 'span', class: 'search-package__detail-value' }),
        ], { class: 'search-package__detail-field' }),

        new Container([
          new Text('Sender', { type: 'span', class: 'search-package__detail-label' }),
          new Text(`${getEmployeeName(pkg.Sender)} (${pkg.Sender})`, { type: 'span', class: 'search-package__detail-value' }),
        ], { class: 'search-package__detail-field' }),

        new Container([
          new Text('Recipient', { type: 'span', class: 'search-package__detail-label' }),
          new Text(`${getEmployeeName(pkg.Recipient)} (${pkg.Recipient})`, { type: 'span', class: 'search-package__detail-value' }),
        ], { class: 'search-package__detail-field' }),

        new Container([
          new Text('Status', { type: 'span', class: 'search-package__detail-label' }),
          new Text(pkg.Status, {
            type: 'span',
            class: `search-package__status-badge search-package__status-badge--${pkg.Status.replace(' ', '-')}`
          }),
        ], { class: 'search-package__detail-field' }),

        new Container([
          new Text('Current Location', { type: 'span', class: 'search-package__detail-label' }),
          new Text(pkg.CurrentLocation || 'N/A', { type: 'span', class: 'search-package__detail-value' }),
        ], { class: 'search-package__detail-field' }),

        new Container([
          new Text('Destination', { type: 'span', class: 'search-package__detail-label' }),
          new Text(pkg.DestinationLocation || 'N/A', { type: 'span', class: 'search-package__detail-value' }),
        ], { class: 'search-package__detail-field' }),

        new Container([
          new Text('Details', { type: 'span', class: 'search-package__detail-label' }),
          new Text(pkg.PackageDetails || 'N/A', { type: 'span', class: 'search-package__detail-value' }),
        ], { class: 'search-package__detail-field' }),

        new Container([
          new Text('Internal Notes', { type: 'span', class: 'search-package__detail-label' }),
          new Text(pkg.InternalNotes || 'N/A', { type: 'span', class: 'search-package__detail-value' }),
        ], { class: 'search-package__detail-field' }),
      ], { class: 'search-package__detail-fields' }),

      new Text('Timeline', { type: 'h3', class: 'search-package__detail-title' }),
      new Container(timelineChildren, { class: 'search-package__timeline' }),
    ], { class: 'search-package__detail' })
  }

  function updateView(state) {
    if (state === 'initial') {
      resultsContainer.children = [
        new Container([
          new Text(getIcon('search-eye-line'), {
            type: 'div',
            class: 'search-package__card-icon'
          }),
          new Text('Search for a package', {
            type: 'h2',
            class: 'search-package__prompt-title'
          }),
          new Text('Use the filters above to find packages', {
            type: 'p',
            class: 'search-package__prompt-subtitle'
          }),
        ], { class: 'search-package__prompt-content' }),
      ]
      return
    }

    if (state === 'empty') {
      resultsContainer.children = [
        new Container([
          new Text('No packages found', {
            type: 'h2',
            class: 'search-package__prompt-title'
          }),
          new Text('Try different filter criteria', {
            type: 'p',
            class: 'search-package__prompt-subtitle'
          }),
        ], { class: 'search-package__prompt-content' }),
      ]
      return
    }

    // results state
    const resultCount = new Text(`${searchResults.length} package(s) found`, {
      type: 'p',
      class: 'search-package__result-count'
    })

    const tableHeader = new Container([
      new Text('Tracking #', { type: 'span', class: 'search-package__table-header' }),
      new Text('Sender', { type: 'span', class: 'search-package__table-header' }),
      new Text('Recipient', { type: 'span', class: 'search-package__table-header' }),
      new Text('Status', { type: 'span', class: 'search-package__table-header' }),
      new Text('Current Location', { type: 'span', class: 'search-package__table-header' }),
      new Text('Destination', { type: 'span', class: 'search-package__table-header' }),
    ], { class: 'search-package__table-head' })

    const tableBody = new Container(createTableRows(), { class: 'search-package__table-body' })

    const table = new Container([
      tableHeader,
      tableBody,
    ], { class: 'search-package__table' })

    const children = [resultCount, table]

    if (selectedPackage) {
      children.push(createDetailView(selectedPackage))
    }

    resultsContainer.children = children
  }

  // Initial render
  updateView('initial')

  // Content area
  const contentArea = new Container([
    pageHeader,
    filterSection,
    resultsContainer,
  ], { class: 'search-package__content' })

  // Attach DOM listener after render
  attachTrackingListener()

  return [
    navbar,
    contentArea,
  ]
})
