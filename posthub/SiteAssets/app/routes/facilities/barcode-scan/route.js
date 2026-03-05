import {
  defineRoute,
  Container,
  Text,
  Button,
  LinkButton,
  getIcon,
  Toast,
  FormField,
  ComboBox,
  SiteApi,
  CurrentUser,
} from '../../../libs/nofbiz/nofbiz.base.js'

import { createNavbar } from '../../../components/navbar.js'
import { LIST_PACKAGES, LIST_LOCATIONS, LIST_EMPLOYEES, PACKAGE_STATUSES } from '../../../utils/constants.js'

export default defineRoute(async (config) => {
  config.setRouteTitle('PostHub - Barcode Scanner')

  const siteApi = new SiteApi()
  const user = new CurrentUser()

  // Load locations and employees in parallel
  const [allLocations, allEmployees] = await Promise.all([
    siteApi.list(LIST_LOCATIONS).getItems(),
    siteApi.list(LIST_EMPLOYEES).getItems(),
  ])

  const locationOptions = allLocations.filter(l => l.IsActive === 'true').map(l => l.Title)
  const nameMap = new Map(allEmployees.map(e => [e.Email, e.Title]))
  function getEmployeeName(email) {
    return nameMap.get(email) || email
  }

  // State
  let scannedPackages = []
  let editingIndex = -1

  // Bulk update form fields
  const bulkStatusField = new FormField({ value: '' })
  const bulkLocationField = new FormField({ value: '' })

  // Navbar
  const navbar = createNavbar()

  // Page header
  const pageHeader = new Container([
    new Container([
      new LinkButton(getIcon('home-line'), '/', {
        class: 'barcode-scan__home-icon'
      }),
      new Text('Barcode Scanner', {
        type: 'h1',
        class: 'barcode-scan__title'
      }),
    ], { class: 'barcode-scan__title-with-icon' }),
    new Text('Scan QR codes to look up and update packages', {
      type: 'p',
      class: 'barcode-scan__subtitle'
    }),
  ], { class: 'barcode-scan__header' })

  // Table container (swapped between prompt, table, and confirmation)
  const tableContainer = new Container([], { class: 'barcode-scan__table-container' })

  // Hidden textarea for scanner paste input
  const hiddenTextareaContainer = new Container([], { class: 'barcode-scan__hidden-textarea-wrapper' })
  hiddenTextareaContainer.children = '<textarea class="barcode-scan__hidden-textarea" aria-label="Scanner input"></textarea>'

  function getTextarea() {
    return document.querySelector('.barcode-scan__hidden-textarea')
  }

  function focusTextarea() {
    const ta = getTextarea()
    if (ta) ta.focus()
  }

  // Attach paste listener after render
  function attachPasteListener() {
    setTimeout(() => {
      const ta = getTextarea()
      if (!ta) return
      ta.addEventListener('paste', handlePaste)
      ta.focus()
    }, 100)
  }

  // Re-focus textarea on clicks outside interactive elements
  function attachRefocusListener() {
    setTimeout(() => {
      document.addEventListener('click', (e) => {
        const target = e.target
        const isInteractive = target.closest('button, select, input, textarea:not(.barcode-scan__hidden-textarea), a, .nofbiz__combobox')
        if (!isInteractive) focusTextarea()
      })
    }, 100)
  }

  function handlePaste(e) {
    e.preventDefault()
    const text = e.clipboardData.getData('text')
    if (!text || !text.trim()) return

    // Split concatenated JSON objects (e.g. `{...}{...}`) into individual entries
    // then also split by newlines for multi-line pastes
    const chunks = text.trim().replace(/\}\s*\{/g, '}\n{').split('\n')
    const parsed = []
    let parseErrors = 0

    for (const chunk of chunks) {
      const trimmed = chunk.trim()
      if (!trimmed) continue
      try {
        const data = JSON.parse(trimmed)
        if (data.TrackingNumber) parsed.push(data)
        else parseErrors++
      } catch {
        parseErrors++
      }
    }

    if (parseErrors > 0) {
      Toast.warning(`${parseErrors} line(s) could not be parsed`)
    }

    if (parsed.length === 0) {
      Toast.warning('No valid packages found in scanned data')
      const ta = getTextarea()
      if (ta) ta.value = ''
      return
    }

    matchAndAddPackages(parsed)
    const ta = getTextarea()
    if (ta) ta.value = ''
  }

  async function matchAndAddPackages(parsedEntries) {
    const existingIds = new Set(scannedPackages.map(p => p.Title))
    let added = 0

    // Load all packages from store for matching
    const allPackages = await siteApi.list(LIST_PACKAGES).getItems()

    for (const entry of parsedEntries) {
      if (existingIds.has(entry.TrackingNumber)) continue

      const match = allPackages.find(p => p.Title === entry.TrackingNumber)
      if (match) {
        scannedPackages.push({ ...match })
        existingIds.add(match.Title)
        added++
      }
    }

    if (added === 0) {
      Toast.warning('No new matching packages found')
    } else {
      Toast.success(`${added} package(s) scanned`)
    }

    editingIndex = -1
    updateView()
  }

  async function handleSimulateScan() {
    const allPackages = await siteApi.list(LIST_PACKAGES).getItems()
    const simulated = allPackages.slice(0, 3).map(p => ({ TrackingNumber: p.Title }))
    matchAndAddPackages(simulated)
  }

  async function handleBulkUpdate() {
    const newStatus = bulkStatusField.value?.value || bulkStatusField.value || ''
    const newLocation = bulkLocationField.value?.value || bulkLocationField.value || ''

    if (!newStatus && !newLocation) {
      Toast.warning('Select a status or location to apply')
      return
    }

    const changedBy = user.get('email')

    for (const pkg of scannedPackages) {
      const timeline = pkg.Timeline ? JSON.parse(pkg.Timeline) : []
      const updateFields = {}

      if (newStatus) {
        pkg.Status = newStatus
        updateFields.Status = newStatus
      }
      if (newLocation) {
        pkg.CurrentLocation = newLocation
        updateFields.CurrentLocation = newLocation
      }

      timeline.push({
        status: newStatus || pkg.Status,
        date: new Date().toISOString(),
        location: newLocation || pkg.CurrentLocation,
        changedBy,
        notes: 'Bulk update from barcode scanner'
      })
      updateFields.Timeline = JSON.stringify(timeline)
      pkg.Timeline = updateFields.Timeline

      await siteApi.list(LIST_PACKAGES).updateItem(pkg.Id, updateFields)
    }

    // Show confirmation
    tableContainer.children = [
      new Container([
        new Text('Update Confirmed', {
          type: 'h2',
          class: 'barcode-scan__confirmation-title'
        }),
        new Text(`${scannedPackages.length} package(s) updated successfully.`, {
          type: 'p',
          class: 'barcode-scan__confirmation-message'
        }),
        new Button('Scan More', {
          onClickHandler: () => {
            scannedPackages = []
            editingIndex = -1
            bulkStatusField.value = ''
            bulkLocationField.value = ''
            updateView()
            attachPasteListener()
          },
          class: 'barcode-scan__scan-btn'
        }),
      ], { class: 'barcode-scan__confirmation' }),
    ]
  }

  async function handleRowSave(index) {
    const statusSelect = document.querySelector('.barcode-scan__inline-status')
    const locationSelect = document.querySelector('.barcode-scan__inline-location')

    const pkg = scannedPackages[index]
    const updateFields = {}
    const changedBy = user.get('email')

    if (statusSelect) {
      pkg.Status = statusSelect.value
      updateFields.Status = statusSelect.value
    }
    if (locationSelect) {
      pkg.CurrentLocation = locationSelect.value
      updateFields.CurrentLocation = locationSelect.value
    }

    const timeline = pkg.Timeline ? JSON.parse(pkg.Timeline) : []
    timeline.push({
      status: pkg.Status,
      date: new Date().toISOString(),
      location: pkg.CurrentLocation,
      changedBy,
      notes: 'Individual update from barcode scanner'
    })
    updateFields.Timeline = JSON.stringify(timeline)
    pkg.Timeline = updateFields.Timeline

    await siteApi.list(LIST_PACKAGES).updateItem(pkg.Id, updateFields)
    Toast.success(`Updated ${pkg.Title}`)
    editingIndex = -1
    updateView()
  }

  function handleRowCancel() {
    editingIndex = -1
    updateView()
  }

  function createTableRows() {
    return scannedPackages.map((pkg, index) => {
      if (index === editingIndex) return createEditingRow(pkg, index)
      return createViewRow(pkg, index)
    })
  }

  function createViewRow(pkg, index) {
    const statusClass = pkg.Status.replace(' ', '-')
    return new Container([
      new Text(pkg.Title, { type: 'span', class: 'barcode-scan__table-cell' }),
      new Text(getEmployeeName(pkg.Sender), { type: 'span', class: 'barcode-scan__table-cell' }),
      new Text(getEmployeeName(pkg.Recipient), { type: 'span', class: 'barcode-scan__table-cell' }),
      new Container([
        new Text(pkg.Status, {
          type: 'span',
          class: `barcode-scan__status-badge barcode-scan__status-badge--${statusClass}`
        }),
      ], { class: 'barcode-scan__table-cell' }),
      new Text(pkg.CurrentLocation, { type: 'span', class: 'barcode-scan__table-cell' }),
      new Text(pkg.DestinationLocation, { type: 'span', class: 'barcode-scan__table-cell' }),
      new Container([
        new Button(getIcon('edit-line'), {
          onClickHandler: () => {
            editingIndex = index
            updateView()
          },
          class: 'barcode-scan__edit-btn'
        }),
      ], { class: 'barcode-scan__table-cell' }),
    ], { class: 'barcode-scan__table-row' })
  }

  function createEditingRow(pkg, index) {
    const editContainer = new Container([], { class: 'barcode-scan__table-row barcode-scan__table-row--editing' })

    const statusOptions = PACKAGE_STATUSES.map(s =>
      `<option value="${s}" ${s === pkg.Status ? 'selected' : ''}>${s}</option>`
    ).join('')

    const locationOpts = locationOptions.map(l =>
      `<option value="${l}" ${l === pkg.CurrentLocation ? 'selected' : ''}>${l}</option>`
    ).join('')

    editContainer.children = [
      new Text(pkg.Title, { type: 'span', class: 'barcode-scan__table-cell' }),
      new Text(getEmployeeName(pkg.Sender), { type: 'span', class: 'barcode-scan__table-cell' }),
      new Text(getEmployeeName(pkg.Recipient), { type: 'span', class: 'barcode-scan__table-cell' }),
      (() => {
        const cell = new Container([], { class: 'barcode-scan__table-cell' })
        cell.children = `<select class="barcode-scan__inline-status barcode-scan__inline-select">${statusOptions}</select>`
        return cell
      })(),
      (() => {
        const cell = new Container([], { class: 'barcode-scan__table-cell' })
        cell.children = `<select class="barcode-scan__inline-location barcode-scan__inline-select">${locationOpts}</select>`
        return cell
      })(),
      new Text(pkg.DestinationLocation, { type: 'span', class: 'barcode-scan__table-cell' }),
      new Container([
        new Button(getIcon('check-line'), {
          onClickHandler: () => handleRowSave(index),
          class: 'barcode-scan__save-btn'
        }),
        new Button(getIcon('close-line'), {
          onClickHandler: handleRowCancel,
          class: 'barcode-scan__cancel-btn'
        }),
      ], { class: 'barcode-scan__table-cell barcode-scan__table-cell--actions' }),
    ]

    return editContainer
  }

  function updateView() {
    if (scannedPackages.length === 0) {
      // INITIAL state: prompt + hidden textarea
      const prompt = new Container([
        new Container([
          new Text(getIcon('search-eye-line'), {
            type: 'div',
            class: 'barcode-scan__card-icon'
          }),
          new Text('Waiting for QR Scan', {
            type: 'h2',
            class: 'barcode-scan__prompt-title'
          }),
          new Text('Scan QR code labels or paste package data to begin', {
            type: 'p',
            class: 'barcode-scan__prompt-subtitle'
          }),
          new Button('Simulate Scan', {
            onClickHandler: handleSimulateScan,
            class: 'barcode-scan__scan-btn'
          }),
        ], { class: 'barcode-scan__prompt-content' }),
      ], { class: 'barcode-scan__prompt' })

      tableContainer.children = [prompt, hiddenTextareaContainer]
      attachPasteListener()
    } else {
      // SCANNED state: bulk bar + table + hidden textarea
      // Pre-select "arrived" in status and first package's destination in location
      const defaultDest = scannedPackages[0]?.DestinationLocation || ''
      const statusDataset = PACKAGE_STATUSES.map(s => ({
        label: s, value: s, checked: s === 'arrived'
      }))
      const locationDataset = locationOptions.map(l => ({
        label: l, value: l, checked: l === defaultDest
      }))

      const bulkStatusCombo = new ComboBox(bulkStatusField, statusDataset, {
        placeholder: 'Set status...',
      })
      const bulkLocationCombo = new ComboBox(bulkLocationField, locationDataset, {
        placeholder: 'Set location...',
      })

      const bulkBar = new Container([
        bulkStatusCombo,
        bulkLocationCombo,
        new Button('Update All', {
          onClickHandler: handleBulkUpdate,
          class: 'barcode-scan__update-all-btn'
        }),
      ], { class: 'barcode-scan__bulk-bar' })

      const tableHeader = new Container([
        new Text('Tracking #', { type: 'span', class: 'barcode-scan__table-header' }),
        new Text('Sender', { type: 'span', class: 'barcode-scan__table-header' }),
        new Text('Recipient', { type: 'span', class: 'barcode-scan__table-header' }),
        new Text('Status', { type: 'span', class: 'barcode-scan__table-header' }),
        new Text('Current Location', { type: 'span', class: 'barcode-scan__table-header' }),
        new Text('Destination', { type: 'span', class: 'barcode-scan__table-header' }),
        new Text('Actions', { type: 'span', class: 'barcode-scan__table-header' }),
      ], { class: 'barcode-scan__table-head' })

      const tableBody = new Container(createTableRows(), { class: 'barcode-scan__table-body' })

      const table = new Container([
        tableHeader,
        tableBody,
      ], { class: 'barcode-scan__table' })

      tableContainer.children = [bulkBar, table, hiddenTextareaContainer]
      focusTextarea()
    }
  }

  // Initial render
  updateView()

  // Set up refocus listener
  attachRefocusListener()

  // Content area
  const contentArea = new Container([
    pageHeader,
    tableContainer,
  ], { class: 'barcode-scan__content' })

  return [
    navbar,
    contentArea,
  ]
})
