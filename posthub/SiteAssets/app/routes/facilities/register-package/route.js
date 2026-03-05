import {
  defineRoute,
  Container,
  Text,
  Button,
  LinkButton,
  getIcon,
  Toast,
  Router,
  SiteApi,
} from '../../../libs/nofbiz/nofbiz.base.js'

import { createNavbar } from '../../../components/navbar.js'
import { LIST_EMPLOYEES, LIST_PACKAGES } from '../../../utils/constants.js'

export default defineRoute(async (config) => {
  config.setRouteTitle('PostHub - Register Package')

  const siteApi = new SiteApi()

  // State
  let smartCardScanned = false
  let pendingPackages = []
  let debounceTimer = null

  // Navbar component
  const navbar = createNavbar()

  // Page header
  const pageHeader = new Container([
    new Container([
      new LinkButton(getIcon('home-line'), '/', {
        class: 'register-package__home-icon'
      }),
      new Text('Register Package', {
        type: 'h1',
        class: 'register-package__title'
      }),
    ], { class: 'register-package__title-with-icon' }),
    new Text('Scan smart card to load pending packages', {
      type: 'p',
      class: 'register-package__subtitle'
    }),
  ], { class: 'register-package__header' })

  // Table container
  const tableContainer = new Container([], { class: 'register-package__table-container' })

  // Smart card input container
  const smartCardInputContainer = new Container([], { class: 'register-package__smart-card-wrapper' })
  smartCardInputContainer.children = `
    <input type="text" class="register-package__smart-card-input" placeholder="Scan smart card or enter Smart Card ID..." autofocus />
  `

  function attachSmartCardListener() {
    setTimeout(() => {
      const input = document.querySelector('.register-package__smart-card-input')
      if (!input) return
      input.focus()
      input.addEventListener('input', (e) => {
        clearTimeout(debounceTimer)
        debounceTimer = setTimeout(() => {
          const value = e.target.value.trim()
          if (value) handleCardScan(value)
        }, 300)
      })
      input.addEventListener('paste', (e) => {
        clearTimeout(debounceTimer)
        setTimeout(() => {
          const value = e.target.value.trim()
          if (value) handleCardScan(value)
        }, 50)
      })
    }, 100)
  }

  // Smart card prompt
  const smartCardPrompt = new Container([
    new Container([
      new Text(getIcon('calendar-fill'), {
        type: 'div',
        class: 'register-package__card-icon'
      }),
      new Text('Waiting for Smart Card', {
        type: 'h2',
        class: 'register-package__prompt-title'
      }),
      new Text('Please scan your smart card to continue', {
        type: 'p',
        class: 'register-package__prompt-subtitle'
      }),
      smartCardInputContainer,
      new Button('Simulate Card Scan', {
        onClickHandler: () => handleCardScan('SC001'),
        class: 'register-package__scan-btn'
      }),
    ], { class: 'register-package__prompt-content' }),
  ], { class: 'register-package__prompt' })

  // Function to handle card scan
  async function handleCardScan(smartCardId) {
    // Lookup employee
    const allEmployees = await siteApi.list(LIST_EMPLOYEES).getItems()
    const employee = allEmployees.find(e => e.SmartCardID === smartCardId)

    if (!employee) {
      Toast.error('Employee not found')
      const input = document.querySelector('.register-package__smart-card-input')
      if (input) { input.value = ''; input.focus() }
      return
    }

    // Get "created" packages for this employee (sender or recipient)
    const allPackages = await siteApi.list(LIST_PACKAGES).getItems()
    pendingPackages = allPackages.filter(pkg =>
      pkg.Status === 'created' && pkg.Sender === employee.Email
    )

    smartCardScanned = true
    Toast.success(`Found ${pendingPackages.length} pending package(s) for ${employee.Title}`)
    updateView()
  }

  // Create table rows using SPARC components
  function createTableRows() {
    return pendingPackages.map(pkg => {
      return new Container([
        new Text(pkg.Title, { type: 'span', class: 'register-package__table-cell' }),
        new Text(pkg.Recipient, { type: 'span', class: 'register-package__table-cell' }),
        new Container([
          new Button('Print Label', {
            onClickHandler: () => handlePrintLabel(pkg),
            class: 'register-package__print-btn'
          }),
        ], { class: 'register-package__table-cell' }),
      ], { class: 'register-package__table-row' })
    })
  }

  // Function to update the view
  function updateView() {
    if (!smartCardScanned) {
      // Show smart card prompt
      tableContainer.children = [smartCardPrompt]
      attachSmartCardListener()
    } else if (pendingPackages.length === 0) {
      tableContainer.children = [
        new Container([
          new Text('No packages found', {
            type: 'h2',
            class: 'register-package__empty-title'
          }),
          new Text('This user has no packages with "created" status.', {
            type: 'p',
            class: 'register-package__empty-message'
          }),
          new Button('Scan Another Card', {
            onClickHandler: () => {
              smartCardScanned = false
              pendingPackages = []
              updateView()
            },
            class: 'register-package__scan-btn'
          }),
        ], { class: 'register-package__empty' }),
      ]
    } else {
      // Build table using SPARC components
      const tableHeader = new Container([
        new Text('Package ID', { type: 'span', class: 'register-package__table-header' }),
        new Text('Recipient', { type: 'span', class: 'register-package__table-header' }),
        new Text('Action', { type: 'span', class: 'register-package__table-header' }),
      ], { class: 'register-package__table-head' })

      const tableBody = new Container(createTableRows(), { class: 'register-package__table-body' })

      const table = new Container([
        tableHeader,
        tableBody,
      ], { class: 'register-package__table' })

      tableContainer.children = [table]
    }
  }

  // Function to handle print label
  function handlePrintLabel(pkg) {
    // Store package data for the barcode route
    sessionStorage.setItem('posthub_label_package', JSON.stringify(pkg))
    Router.navigateTo('facilities/register-package/barcode')
  }

  // Initial render
  updateView()

  // Content area
  const contentArea = new Container([
    pageHeader,
    tableContainer,
  ], { class: 'register-package__content' })

  // Return page layout
  return [
    navbar,
    contentArea,
  ]
})
