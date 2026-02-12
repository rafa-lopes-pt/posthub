import {
  defineRoute,
  Container,
  Text,
  Image,
  LinkButton,
  Button,
} from '../libs/nofbiz/nofbiz.base.js'

// Image paths - update these when real assets are provided
const BACKGROUND_IMAGE_URL = '/SiteAssets/app/images/home-background.jpg'
const LOGO_IMAGE_URL = '/SiteAssets/app/images/pigeon-logo.png'

export default defineRoute((config) => {
  config.setRouteTitle('PostHub - Home')

  // Background image (full viewport)
  const backgroundImage = new Image(BACKGROUND_IMAGE_URL, {
    alt: 'PostHub background',
    class: 'landing-page__background'
  })

  // Hero content container (centered)
  const heroContent = new Container([
    // Logo
    new Image(LOGO_IMAGE_URL, {
      alt: 'PostHub Logo',
      class: 'landing-page__logo'
    }),

    // Branding text
    new Text('PIGEON', {
      type: 'h1',
      class: 'landing-page__title'
    }),

    new Text('Mail Management Platform', {
      type: 'p',
      class: 'landing-page__subtitle'
    }),

    // Primary action buttons
    new Container([
      new LinkButton('Send Package', '/send-mail', {
        class: 'landing-page__action-btn'
      }),

      new LinkButton('My Mail', '/my-mail', {
        class: 'landing-page__action-btn'
      }),

      new LinkButton('Facilities', '/facilities', {
        class: 'landing-page__action-btn landing-page__action-btn--facilities'
      }),
    ], { class: 'landing-page__actions' }),

  ], { class: 'landing-page__hero-content' })

  // Help button (bottom-right, disabled)
  const helpButton = new Button(
    'Need Help?',
    {
      class: 'landing-page__help-btn',
      disabled: true
    }
  )

  // Main container
  return [
    new Container([
      backgroundImage,
      heroContent,
      helpButton,
    ], { class: 'landing-page' })
  ]
})
