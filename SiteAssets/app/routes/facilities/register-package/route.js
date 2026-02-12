import {
  defineRoute,
  Container,
  Text,
  Button,
  LinkButton,
  getIcon,
  Modal,
  Dialog,
} from '../../../libs/nofbiz/nofbiz.base.js'

import { createNavbar } from '../../../components/navbar.js'

export default defineRoute((config) => {
  config.setRouteTitle('PostHub - Register Package')

  // State
  let smartCardScanned = false
  let pendingPackages = []

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
      new Button('Simulate Card Scan', {
        onClickHandler: handleCardScan,
        class: 'register-package__scan-btn'
      }),
    ], { class: 'register-package__prompt-content' }),
  ], { class: 'register-package__prompt' })

  // Function to handle card scan
  function handleCardScan() {
    console.log('scanned')
    smartCardScanned = true

    // Mock pending packages
    pendingPackages = [
      {
        id: 1,
        packageId: 'COLOMBO-20260205-00156',
        title: 'Important Documents',
        recipient: 'Sarah Johnson'
      },
      {
        id: 2,
        packageId: 'EXEO-20260205-00157',
        title: 'Office Supplies',
        recipient: 'Michael Chen'
      },
      {
        id: 3,
        packageId: 'COLOMBO-20260205-00158',
        title: 'Project Files',
        recipient: 'Lisa Anderson'
      }
    ]

    updateView()
  }

  // Create table rows using SPARC components
  function createTableRows() {
    return pendingPackages.map(pkg => {
      return new Container([
        new Text(pkg.packageId, { type: 'span', class: 'register-package__table-cell' }),
        new Text(pkg.recipient, { type: 'span', class: 'register-package__table-cell' }),
        new Container([
          new Button('Print Label', {
            onClickHandler: () => handlePrintLabel(pkg.id),
            class: 'register-package__print-btn'
          }),
        ], { class: 'register-package__table-cell' }),
      ], { class: 'register-package__table-row' })
    })
  }

  // Create table container
  const tableWrapper = new Container([], { class: 'register-package__table-wrapper' })

  // Function to update the view
  function updateView() {
    if (!smartCardScanned) {
      // Show smart card prompt
      tableContainer.children = [smartCardPrompt]
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
  function handlePrintLabel(packageId) {
    // Navigate to barcode page
    window.location.hash = '#/facilities/register-package/barcode'
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
