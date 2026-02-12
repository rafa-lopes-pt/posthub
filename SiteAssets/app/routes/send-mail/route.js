import {
  defineRoute,
  Container,
  Text,
  Button,
  TextInput,
  LinkButton,
  getIcon,
  Toast,
} from '../../libs/nofbiz/nofbiz.base.js'

import { createNavbar } from '../../components/navbar.js'

export default defineRoute((config) => {
  config.setRouteTitle('PostHub - Send Mail')

  // State for selected package type
  let selectedPackageType = 'internal-mail'

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
    new Text('Here you can define the details of your package, before handing it over to our team', {
      type: 'p',
      class: 'send-mail__subtitle'
    }),
  ], { class: 'send-mail__header' })

  // Package type cards data
  const packageTypes = [
    {
      id: 'internal-mail',
      title: 'Internal Mail',
      description: 'A regular package, with no special requirements.',
      note: 'For regular printed documents, or a mug for a coworker',
      disabled: false
    },
    {
      id: 'other-a',
      title: 'Other Option A',
      description: 'Used by finance teams to send cash and/or band-cheques',
      note: '',
      disabled: true
    },
    {
      id: 'send-cheque',
      title: 'Send-cheque Bag',
      description: 'Used by finance teams to send cash and/or band-cheques',
      note: '',
      disabled: true
    },
    {
      id: 'other-b',
      title: 'Other Option B',
      description: 'Used by finance teams to send cash and/or band-cheques',
      note: '',
      disabled: true
    }
  ]

  // Create package type card
  function createPackageTypeCard(pkgType) {
    const isSelected = selectedPackageType === pkgType.id
    const selectedClass = isSelected ? 'send-mail__package-card--selected' : ''
    const disabledClass = pkgType.disabled ? 'send-mail__package-card--disabled' : ''

    return `
      <div class="send-mail__package-card ${selectedClass} ${disabledClass}" data-package-type="${pkgType.id}">
        <div class="send-mail__package-card-title">${pkgType.title}</div>
        <div class="send-mail__package-card-description">${pkgType.description}</div>
        ${pkgType.note ? `<div class="send-mail__package-card-note">${pkgType.note}</div>` : ''}
      </div>
    `
  }

  // Left column - Package type selection
  const packageTypeSection = new Container([], { class: 'send-mail__package-types' })

  packageTypeSection.children = `
    <div class="send-mail__step-header">
      <span class="send-mail__step-number">1</span>
      <span class="send-mail__step-title">Select the type of package</span>
    </div>
    <p class="send-mail__step-note">
      Even though only the Internal Mail is available, we're working on more features for your convenience!
    </p>
    <div class="send-mail__package-grid">
      ${packageTypes.map(pkg => createPackageTypeCard(pkg)).join('')}
    </div>
  `

  // Right column - Form
  const formSection = new Container([
    new Container([
      new Container([
        new Text('2', {
          type: 'span',
          class: 'send-mail__step-number send-mail__step-number--white'
        }),
        new Text('Fill the Details Form', {
          type: 'span',
          class: 'send-mail__form-title'
        }),
      ], { class: 'send-mail__form-header' }),

      // Recipient Name
      new Container([
        new Text('Recipient Name', {
          type: 'label',
          class: 'send-mail__form-label'
        }),
        new TextInput('', {
          placeholder: 'Type here...',
          class: 'send-mail__form-input'
        }),
      ], { class: 'send-mail__form-group' }),

      // Recipient's Office
      new Container([
        new Text("Recipient's Office", {
          type: 'label',
          class: 'send-mail__form-label'
        }),
        new TextInput('', {
          placeholder: 'Auto-filled',
          class: 'send-mail__form-input',
          disabled: true
        }),
      ], { class: 'send-mail__form-group' }),

      // Details - using Container with HTML children
      (() => {
        const detailsContainer = new Container([], { class: 'send-mail__form-group' })
        detailsContainer.children = `
          <label class="send-mail__form-label">Details</label>
          <textarea class="send-mail__form-textarea" placeholder="Type here..." rows="4"></textarea>
        `
        return detailsContainer
      })(),

      // Create button
      new Button('Create',  {onClickHandler:()=>{console.log('Created'),Toast.success('Package Created')}, class: 'send-mail__create-btn' }),

    ], { class: 'send-mail__form-content' }),
  ], { class: 'send-mail__form-section' })

  // Two-column layout
  const mainContent = new Container([
    packageTypeSection,
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
