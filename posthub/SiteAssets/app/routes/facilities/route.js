import {
  defineRoute,
  Container,
  Text,
  LinkButton,
  getIcon,
} from '../../libs/nofbiz/nofbiz.base.js'

import { createNavbar } from '../../components/navbar.js'

export default defineRoute((config) => {
  config.setRouteTitle('PostHub - Facilities')

  // Navbar component
  const navbar = createNavbar()

  // Page header
  const pageHeader = new Container([
    new Container([
      new LinkButton(getIcon('home-line'), '/', {
        class: 'facilities__home-icon'
      }),
      new Text('Facilities Dashboard', {
        type: 'h1',
        class: 'facilities__title'
      }),
    ], { class: 'facilities__title-with-icon' }),
    new Text('Manage package processing and tracking', {
      type: 'p',
      class: 'facilities__subtitle'
    }),
  ], { class: 'facilities__header' })

  // Feature cards
  const featureCards = new Container([
    // Barcode Scan Card
    new Container([
      new Text('Barcode Scanner', {
        type: 'h2',
        class: 'facilities__card-title'
      }),
      new Text('Scan packages to update status', {
        type: 'p',
        class: 'facilities__card-description'
      }),
      new LinkButton('Open', 'facilities/barcode-scan', {
        class: 'facilities__card-btn'
      }),
    ], { class: 'facilities__card' }),

    // Register Package Card
    new Container([
      new Text('Register Package', {
        type: 'h2',
        class: 'facilities__card-title'
      }),
      new Text('Give entry of new packages in the system', {
        type: 'p',
        class: 'facilities__card-description'
      }),
      new LinkButton('Open', 'facilities/register-package', {
        class: 'facilities__card-btn'
      }),
    ], { class: 'facilities__card' }),

    // User Delivery Card
    new Container([
      new Text('User Delivery', {
        type: 'h2',
        class: 'facilities__card-title'
      }),
      new Text('Deliver a package to its final user. Scan smart card, select packages, and confirm delivery.', {
        type: 'p',
        class: 'facilities__card-description'
      }),
      new LinkButton('Open', 'facilities/user-delivery', {
        class: 'facilities__card-btn'
      }),
    ], { class: 'facilities__card' }),

    // Search Package Card
    new Container([
      new Text('Search Package', {
        type: 'h2',
        class: 'facilities__card-title'
      }),
      new Text('Track or look up any package regardless of its current location', {
        type: 'p',
        class: 'facilities__card-description'
      }),
      new LinkButton('Open', 'facilities/search-package', {
        class: 'facilities__card-btn'
      }),
    ], { class: 'facilities__card' }),

    // Locations Card (not yet implemented)
    new Container([
      new Text('Manage Locations', {
        type: 'h2',
        class: 'facilities__card-title'
      }),
      new Text('Add and manage delivery locations', {
        type: 'p',
        class: 'facilities__card-description'
      }),
      new Text('Coming soon', {
        type: 'span',
        class: 'facilities__card-btn facilities__card-btn--disabled'
      }),
    ], { class: 'facilities__card facilities__card--disabled' }),

    // Reports Card (not yet implemented)
    new Container([
      new Text('Reports', {
        type: 'h2',
        class: 'facilities__card-title'
      }),
      new Text('View package analytics and reports', {
        type: 'p',
        class: 'facilities__card-description'
      }),
      new Text('Coming soon', {
        type: 'span',
        class: 'facilities__card-btn facilities__card-btn--disabled'
      }),
    ], { class: 'facilities__card facilities__card--disabled' }),
  ], { class: 'facilities__cards' })

  // Page wrapper
  const pageWrapper = new Container([
    pageHeader,
    featureCards,
  ], { class: 'facilities__wrapper' })

  // Return page layout
  return [
    navbar,
    pageWrapper,
  ]
})
