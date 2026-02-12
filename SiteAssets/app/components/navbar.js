import {
  Container,
  Image,
  Text,
} from '../libs/nofbiz/nofbiz.base.js'

const LOGO_IMAGE_URL = '/SiteAssets/app/images/pigeon-logo.png'

export function createNavbar({ userName = 'Rafael SILVA LOPES' } = {}) {
  return new Container([
    // Left section - Logo and branding
    new Container([
      new Image(LOGO_IMAGE_URL, {
        alt: 'Pigeon Logo',
        class: 'navbar__logo'
      }),
      new Text('PIGEON', {
        type: 'span',
        class: 'navbar__brand'
      }),
    ], { class: 'navbar__left' }),

    // Right section - User name
    new Container([
      new Text(userName, {
        type: 'span',
        class: 'navbar__user'
      }),
    ], { class: 'navbar__right' }),
  ], { class: 'navbar' })
}
