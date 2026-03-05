import {
  defineRoute,
  Container,
  Text,
  Button,
  LinkButton,
  getIcon,
  Toast,
  Router,
  FormField,
  ComboBox,
  FieldLabel,
  PeoplePicker,
  SiteApi,
  CurrentUser,
} from '../../libs/nofbiz/nofbiz.base.js'

import { createNavbar } from '../../components/navbar.js'
import { LIST_LOCATIONS, LIST_PACKAGES, TRACKING_PREFIX } from '../../utils/constants.js'

export default defineRoute(async (config) => {
  config.setRouteTitle('PostHub - Send Mail')

  const siteApi = new SiteApi()
  const user = new CurrentUser()

  // Load active locations
  const allLocations = await siteApi.list(LIST_LOCATIONS).getItems()
  const activeLocations = allLocations.filter(loc => loc.IsActive === 'true')

  // Navbar component
  const navbar = createNavbar()

  // Page header
  const pageHeader = new Container([
    new Container([
      new LinkButton(getIcon('home-line'), '/', {
        class: 'send-mail__home-icon'
      }),
      new Text('Send a new Package', {
        type: 'h1',
        class: 'send-mail__title'
      }),
    ], { class: 'send-mail__title-with-icon' }),
    new Text('Register your internal mail package before delivering it to the facilities team', {
      type: 'p',
      class: 'send-mail__subtitle'
    }),
  ], { class: 'send-mail__header' })

  // Left column - Info panel
  const infoSection = new Container([], { class: 'send-mail__info-section' })

  const infoCardIntro = new Container([], { class: 'send-mail__info-card-content' })
  infoCardIntro.children = `
    <h3 class="send-mail__info-title">What is an Internal Package?</h3>
    <p class="send-mail__info-text">
      An internal package is any item you need to send between company offices -- documents, printed materials, small parcels, or anything else that needs to reach a colleague at another location.
    </p>
  `

  const phonebookUrl = '#'
  const phonebookButton = new LinkButton('Phone Book', phonebookUrl, {
    class: 'send-mail__phonebook-btn',
    onClickHandler: (e) => {
      e.preventDefault()
      console.error('PostHub: Phone Book URL must be overridden with the correct external phonebook link')
    }
  })

  const infoCardHowTo = new Container([], { class: 'send-mail__info-card-content' })
  infoCardHowTo.children = `
    <h3 class="send-mail__info-title">How does it work?</h3>
    <ol class="send-mail__info-steps">
      <li>Fill in the form with the recipient, destination office, and package details</li>
      <li>Click <strong>Create</strong> to register your package in the system</li>
      <li>Take your physical package to the nearest <strong>facilities office</strong></li>
      <li>A facilities team member will scan your smart card, generate a label, and handle the rest</li>
    </ol>
    <div class="send-mail__info-note">
      After creating your package here, please bring it to your local facilities desk. Your package will only enter the delivery workflow once it has been physically handed over to the team.
    </div>
  `

  const infoCard = new Container([
    infoCardIntro,
    new Text('Not sure about the recipient details? Check the company phone book.', {
      type: 'p',
      class: 'send-mail__info-text'
    }),
    phonebookButton,
    infoCardHowTo,
    new Button('Dropoff Locations', {
      isDisabled: true,
      class: 'send-mail__dropoff-btn'
    }),
  ], { class: 'send-mail__info-card' })

  infoSection.children = [infoCard]

  // Form fields
  const recipientField = new FormField({ value: { value: '', label: '' } })
  const recipientPicker = new PeoplePicker(recipientField, {})

  const locationField = new FormField({ value: '' })
  const locationOptions = activeLocations.map(loc => loc.Title)
  const destinationComboBox = new ComboBox(locationField, locationOptions, {
    placeholder: 'Select destination office...'
  })

  // Right column - Form
  const formSection = new Container([
    new Container([
      new Container([
        new Text('Package Details', {
          type: 'span',
          class: 'send-mail__form-title'
        }),
      ], { class: 'send-mail__form-header' }),

      // Recipient Name
      new FieldLabel('Recipient Name', recipientPicker, { class: 'send-mail__form-group' }),

      // Destination Office
      new FieldLabel('Destination Office', destinationComboBox, { class: 'send-mail__form-group' }),

      // Details - using Container with HTML children
      (() => {
        const detailsContainer = new Container([], { class: 'send-mail__form-group' })
        detailsContainer.children = `
          <label class="send-mail__form-label">Package Details</label>
          <textarea class="send-mail__form-textarea" placeholder="Type here..." rows="4"></textarea>
        `
        return detailsContainer
      })(),

      // Create button
      new Button('Create', {
        onClickHandler: async () => {
          const selectedRecipient = recipientPicker.selectedResult
          const destinationRaw = locationField.value
          const destination = destinationRaw?.value ?? destinationRaw
          const detailsTextarea = document.querySelector('.send-mail__form-textarea')
          const details = detailsTextarea ? detailsTextarea.value : ''

          if (!selectedRecipient) {
            Toast.error('Recipient is required')
            return
          }

          const recipient = selectedRecipient.EntityData?.Email || selectedRecipient.Description
          if (!destination) {
            Toast.error('Destination office is required')
            return
          }

          // Generate tracking number
          const now = new Date()
          const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
          const sequence = String(Math.floor(Math.random() * 100000)).padStart(5, '0')
          const trackingNumber = `${TRACKING_PREFIX}-${date}-${sequence}`

          const senderEmail = user.get('email')
          const timelineEntry = [{
            status: 'created',
            date: now.toISOString(),
            location: destination,
            changedBy: senderEmail,
            notes: 'Package created'
          }]

          await siteApi.list(LIST_PACKAGES).createItem({
            Title: trackingNumber,
            Sender: senderEmail,
            Recipient: recipient,
            Status: 'created',
            CurrentLocation: destination,
            DestinationLocation: destination,
            PackageDetails: details,
            InternalNotes: '',
            Timeline: JSON.stringify(timelineEntry)
          })

          Toast.success(`Package ${trackingNumber} created`)
          Router.navigateTo('/')
        },
        class: 'send-mail__create-btn'
      }),

    ], { class: 'send-mail__form-content' }),
  ], { class: 'send-mail__form-section' })

  // Two-column layout
  const mainContent = new Container([
    infoSection,
    formSection,
  ], { class: 'send-mail__content' })

  // Page wrapper
  const pageWrapper = new Container([
    pageHeader,
    mainContent,
  ], { class: 'send-mail__wrapper' })

  // Return page layout
  return [
    navbar,
    pageWrapper,
  ]
})
