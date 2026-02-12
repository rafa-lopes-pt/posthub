import {
  defineRoute,
  Container,
  Text,
  Button,
  LinkButton,
  getIcon,
} from '../../../../libs/nofbiz/nofbiz.base.js'

import { createNavbar } from '../../../../components/navbar.js'

export default defineRoute((config) => {
  config.setRouteTitle('PostHub - Package Barcode')

  // Static package ID for display
  const packageId = 'COLOMBO-20260205-00156'

  // Navbar component
  const navbar = createNavbar()

  // QR Code container
  const qrContainer = new Container([], { class: 'barcode__qr-container' })
  qrContainer.children = '<div id="qrcode"></div>'

  // Generate QR code after container is rendered
  setTimeout(() => {
    const qrElement = document.getElementById('qrcode')
    if (qrElement) {
      // Load QRCode library dynamically
      const script = document.createElement('script')
      script.src = '/SiteAssets/app/libs/qrcode.min.js'
      script.onload = () => {
        // Generate QR code
        new QRCode(qrElement, {
          text: packageId,
          width: 256,
          height: 256,
          colorDark: '#000000',
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.H
        })
      }
      document.head.appendChild(script)
    }
  }, 100)

  // Print handler
  function handlePrint() {
    window.print()
  }

  // Page content (centered)
  const pageContent = new Container([
    new LinkButton(getIcon('arrow-left-line'), '/facilities/register-package', {
      class: 'barcode__back-btn no-print'
    }),
    qrContainer,
    new Text(packageId, {
      type: 'h1',
      class: 'barcode__package-id'
    }),
    new Button('Print Label', {
      onClickHandler: handlePrint,
      class: 'barcode__print-btn no-print'
    }),
  ], { class: 'barcode__content' })

  // Return page layout
  return [
    navbar,
    pageContent,
  ]
})
