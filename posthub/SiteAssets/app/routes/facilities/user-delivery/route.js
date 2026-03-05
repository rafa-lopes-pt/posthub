import {
  defineRoute,
  Container,
  Text,
  Button,
  LinkButton,
  getIcon,
  Toast,
  SiteApi,
  CurrentUser,
} from '../../../libs/nofbiz/nofbiz.base.js'

import { createNavbar } from '../../../components/navbar.js'
import { LIST_EMPLOYEES, LIST_PACKAGES } from '../../../utils/constants.js'

export default defineRoute(async (config) => {
  config.setRouteTitle('PostHub - User Delivery')

  const siteApi = new SiteApi()
  const currentUser = new CurrentUser()

  // State
  let smartCardScanned = false
  let arrivedPackages = []
  const selectedPackages = new Set()
  let debounceTimer = null

  // Navbar component
  const navbar = createNavbar()

  // Page header
  const pageHeader = new Container([
    new Container([
      new LinkButton(getIcon('home-line'), '/', {
        class: 'user-delivery__home-icon'
      }),
      new Text('User Delivery', {
        type: 'h1',
        class: 'user-delivery__title'
      }),
    ], { class: 'user-delivery__title-with-icon' }),
    new Text('Scan smart card to find packages ready for delivery', {
      type: 'p',
      class: 'user-delivery__subtitle'
    }),
  ], { class: 'user-delivery__header' })

  // Table container (swapped between prompt, table, and confirmation)
  const tableContainer = new Container([], { class: 'user-delivery__table-container' })

  // Smart card input container
  const smartCardInputContainer = new Container([], { class: 'user-delivery__smart-card-wrapper' })
  smartCardInputContainer.children = `
    <input type="text" class="user-delivery__smart-card-input" placeholder="Scan smart card or enter Smart Card ID..." autofocus />
  `

  function attachSmartCardListener() {
    setTimeout(() => {
      const input = document.querySelector('.user-delivery__smart-card-input')
      if (!input) return
      input.focus()
      input.addEventListener('input', (e) => {
        clearTimeout(debounceTimer)
        debounceTimer = setTimeout(() => {
          const value = e.target.value.trim()
          if (value) handleSmartCardScan(value)
        }, 300)
      })
      input.addEventListener('paste', (e) => {
        clearTimeout(debounceTimer)
        setTimeout(() => {
          const value = e.target.value.trim()
          if (value) handleSmartCardScan(value)
        }, 50)
      })
    }, 100)
  }

  // Smart card scan prompt
  const smartCardPrompt = new Container([
    new Container([
      new Text(getIcon('calendar-fill'), {
        type: 'div',
        class: 'user-delivery__card-icon'
      }),
      new Text('Waiting for Smart Card Scan', {
        type: 'h2',
        class: 'user-delivery__prompt-title'
      }),
      new Text('Please scan your smart card to load packages ready for delivery', {
        type: 'p',
        class: 'user-delivery__prompt-subtitle'
      }),
      smartCardInputContainer,
      new Button('Simulate Smart Card Scan', {
        onClickHandler: () => handleSmartCardScan('SC001'),
        class: 'user-delivery__scan-btn'
      }),
    ], { class: 'user-delivery__prompt-content' }),
  ], { class: 'user-delivery__prompt' })

  async function handleSmartCardScan(smartCardId) {
    // Lookup employee
    const allEmployees = await siteApi.list(LIST_EMPLOYEES).getItems()
    const employee = allEmployees.find(e => e.SmartCardID === smartCardId)

    if (!employee) {
      Toast.error('Employee not found')
      const input = document.querySelector('.user-delivery__smart-card-input')
      if (input) { input.value = ''; input.focus() }
      return
    }

    // Get arrived packages for this employee (as recipient)
    const allPackages = await siteApi.list(LIST_PACKAGES).getItems()
    arrivedPackages = allPackages.filter(pkg =>
      pkg.Status === 'arrived' && pkg.Recipient === employee.Email
    )

    smartCardScanned = true
    selectedPackages.clear()
    Toast.success(`Found ${arrivedPackages.length} arrived package(s) for ${employee.Title}`)
    updateView()
  }

  function toggleSelection(packageId) {
    if (selectedPackages.has(packageId)) {
      selectedPackages.delete(packageId)
    } else {
      selectedPackages.add(packageId)
    }
    updateView()
  }

  function createTableRows() {
    return arrivedPackages.map(pkg => {
      const isSelected = selectedPackages.has(pkg.Id)
      const rowClass = isSelected
        ? 'user-delivery__table-row user-delivery__table-row--selected'
        : 'user-delivery__table-row'

      const checkIcon = isSelected
        ? getIcon('checkbox-circle-fill')
        : getIcon('checkbox-circle-line')

      return new Container([
        new Container([
          new Button(checkIcon, {
            onClickHandler: () => toggleSelection(pkg.Id),
            class: isSelected
              ? 'user-delivery__checkbox user-delivery__checkbox--checked'
              : 'user-delivery__checkbox'
          }),
        ], { class: 'user-delivery__table-cell' }),
        new Text(pkg.Title, { type: 'span', class: 'user-delivery__table-cell' }),
        new Text(pkg.Sender, { type: 'span', class: 'user-delivery__table-cell' }),
        new Text(pkg.Recipient, { type: 'span', class: 'user-delivery__table-cell' }),
        new Container([
          new Text(pkg.Status, {
            type: 'span',
            class: `user-delivery__status-badge user-delivery__status-badge--${pkg.Status.replace(' ', '-')}`
          }),
        ], { class: 'user-delivery__table-cell' }),
      ], { class: rowClass })
    })
  }

  async function handleConfirmDelivery() {
    const delivered = arrivedPackages.filter(pkg => selectedPackages.has(pkg.Id))
    const changedBy = currentUser.get('email')

    for (const pkg of delivered) {
      const timeline = pkg.Timeline ? JSON.parse(pkg.Timeline) : []
      timeline.push({
        status: 'delivered',
        date: new Date().toISOString(),
        location: pkg.CurrentLocation,
        changedBy,
        notes: 'Package delivered to recipient'
      })

      await siteApi.list(LIST_PACKAGES).updateItem(pkg.Id, {
        Status: 'delivered',
        Timeline: JSON.stringify(timeline)
      })
    }

    tableContainer.children = [
      new Container([
        new Text('Delivery Confirmed', {
          type: 'h2',
          class: 'user-delivery__confirmation-title'
        }),
        new Text(`${delivered.length} package(s) marked as delivered.`, {
          type: 'p',
          class: 'user-delivery__confirmation-message'
        }),
        new Button('Deliver More', {
          onClickHandler: () => {
            smartCardScanned = false
            arrivedPackages = []
            selectedPackages.clear()
            updateView()
          },
          class: 'user-delivery__scan-btn'
        }),
      ], { class: 'user-delivery__confirmation' }),
    ]
  }

  function updateView() {
    if (!smartCardScanned) {
      tableContainer.children = [smartCardPrompt]
      attachSmartCardListener()
    } else {
      const allSelected = selectedPackages.size === arrivedPackages.length && arrivedPackages.length > 0

      const tableHeader = new Container([
        new Container([
          new Button(allSelected ? 'Deselect All' : 'Select All', {
            onClickHandler: () => {
              if (allSelected) {
                selectedPackages.clear()
              } else {
                arrivedPackages.forEach(pkg => selectedPackages.add(pkg.Id))
              }
              updateView()
            },
            class: 'user-delivery__select-all-btn'
          }),
        ], { class: 'user-delivery__table-header' }),
        new Text('Package ID', { type: 'span', class: 'user-delivery__table-header' }),
        new Text('Sender', { type: 'span', class: 'user-delivery__table-header' }),
        new Text('Recipient', { type: 'span', class: 'user-delivery__table-header' }),
        new Text('Status', { type: 'span', class: 'user-delivery__table-header' }),
      ], { class: 'user-delivery__table-head' })

      const tableBody = new Container(createTableRows(), { class: 'user-delivery__table-body' })

      const confirmButton = new Button('Confirm Delivery', {
        onClickHandler: handleConfirmDelivery,
        isDisabled: selectedPackages.size === 0,
        class: 'user-delivery__confirm-btn'
      })

      const table = new Container([
        tableHeader,
        tableBody,
      ], { class: 'user-delivery__table' })

      tableContainer.children = [table, confirmButton]
    }
  }

  // Initial render
  updateView()

  // Content area
  const contentArea = new Container([
    pageHeader,
    tableContainer,
  ], { class: 'user-delivery__content' })

  // Return page layout
  return [
    navbar,
    contentArea,
  ]
})
