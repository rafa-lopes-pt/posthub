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
    // Badge Swipe Card
    new Container([
      new Text('Badge Swipe', {
        type: 'h2',
        class: 'facilities__card-title'
      }),
      new Text('Process packages by employee badge', {
        type: 'p',
        class: 'facilities__card-description'
      }),
      new LinkButton('Open', '/facilities/badge-swipe', {
        class: 'facilities__card-btn'
      }),
    ], { class: 'facilities__card' }),

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
      new LinkButton('Open', '/facilities/barcode-scan', {
        class: 'facilities__card-btn'
      }),
    ], { class: 'facilities__card' }),

    // Locations Card
    new Container([
      new Text('Manage Locations', {
        type: 'h2',
        class: 'facilities__card-title'
      }),
      new Text('Add and manage delivery locations', {
        type: 'p',
        class: 'facilities__card-description'
      }),
      new LinkButton('Open', '/facilities/locations', {
        class: 'facilities__card-btn'
      }),
    ], { class: 'facilities__card' }),

    // Reports Card
    new Container([
      new Text('Reports', {
        type: 'h2',
        class: 'facilities__card-title'
      }),
      new Text('View package analytics and reports', {
        type: 'p',
        class: 'facilities__card-description'
      }),
      new LinkButton('Open', '/facilities/reports', {
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
      new LinkButton('Open', '/facilities/register-package', {
        class: 'facilities__card-btn'
      }),
    ], { class: 'facilities__card' }),
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
