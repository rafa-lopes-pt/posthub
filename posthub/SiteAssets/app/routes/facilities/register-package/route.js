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
  FormField,
  PeoplePicker,
  FieldLabel,
} from '../../../libs/nofbiz/nofbiz.base.js'

import { createNavbar } from '../../../components/navbar.js'
import { LIST_PACKAGES } from '../../../utils/constants.js'

export default defineRoute(async (config) => {
  config.setRouteTitle('Register Package')

  const siteApi = new SiteApi()

  // State
  let senderSelected = false
  let pendingPackages = []

  // Sender PeoplePicker (searches Active Directory)
  const senderField = new FormField({ value: { value: '', label: '' } })
  const senderPicker = new PeoplePicker(senderField, {
    placeholder: 'Search by name or email...',
    onSelectHandler: () => {
      const result = senderPicker.selectedResult
      const email = result?.EntityData?.Email || result?.Description || ''
      if (email) {
        handleSenderSelect(email, result?.DisplayText || email)
      }
    },
  })

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
    new Text('Search for a sender to load pending packages', {
      type: 'p',
      class: 'register-package__subtitle'
    }),
  ], { class: 'register-package__header' })

  // Table container
  const tableContainer = new Container([], { class: 'register-package__table-container' })

  // Search prompt
  const searchPrompt = new Container([
    new Container([
      new Text(getIcon('search-line'), {
        type: 'div',
        class: 'register-package__card-icon'
      }),
      new Text('Search for Sender', {
        type: 'h2',
        class: 'register-package__prompt-title'
      }),
      new Text('Type a name or email to find pending packages', {
        type: 'p',
        class: 'register-package__prompt-subtitle'
      }),
      new FieldLabel('Sender', senderPicker, { class: 'register-package__sender-field' }),
    ], { class: 'register-package__prompt-content' }),
  ], { class: 'register-package__prompt' })

  // Function to handle sender selection
  async function handleSenderSelect(email, displayName) {
    const query = `
      <Where>
        <And>
          <Eq><FieldRef Name='Sender'/><Value Type='Text'>${email}</Value></Eq>
          <Eq><FieldRef Name='Status'/><Value Type='Text'>created</Value></Eq>
        </And>
      </Where>
    `
    pendingPackages = await siteApi.list(LIST_PACKAGES).getItems({ query })
    senderSelected = true
    Toast.success(`Found ${pendingPackages.length} pending package(s) for ${displayName}`)
    updateView()
  }

  // Create table rows using SPARC components
  function createTableRows() {
    return pendingPackages.map(pkg => {
      const statusCell = new Container([], { class: 'register-package__table-cell' })
      statusCell.children = `<input type="text" value="${pkg.Status}" disabled class="register-package__status-input">`

      return new Container([
        new Text(pkg.Title, { type: 'span', class: 'register-package__table-cell' }),
        new Text(pkg.Recipient, { type: 'span', class: 'register-package__table-cell' }),
        statusCell,
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
    if (!senderSelected) {
      tableContainer.children = [searchPrompt]
    } else if (pendingPackages.length === 0) {
      tableContainer.children = [
        new Container([
          new Text('No packages found', {
            type: 'h2',
            class: 'register-package__empty-title'
          }),
          new Text('This sender has no packages with "created" status.', {
            type: 'p',
            class: 'register-package__empty-message'
          }),
          new Button('Search Again', {
            onClickHandler: () => {
              senderSelected = false
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
        new Text('Status', { type: 'span', class: 'register-package__table-header' }),
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
