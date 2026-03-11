import {
  defineRoute,
  Container,
  Text,
  Button,
  LinkButton,
  getIcon,
  resolvePath,
} from '../../../../libs/nofbiz/nofbiz.base.js'

import { createNavbar } from '../../../../components/navbar.js'

export default defineRoute(async (config) => {
  config.setRouteTitle('Package Label')

  // Read package data from sessionStorage
  const storedData = sessionStorage.getItem('posthub_label_package')
  if (!storedData) {
    const navbar = createNavbar()
    return [
      navbar,
      new Container([
        new LinkButton(getIcon('arrow-left-line'), 'facilities/register-package', {
          class: 'barcode__back-btn'
        }),
        new Text('No package data available', { type: 'h2', class: 'barcode__error-title' }),
        new Text('Please go back and select a package to print.', { type: 'p', class: 'barcode__error-message' }),
      ], { class: 'barcode__content' }),
    ]
  }

  const pkg = JSON.parse(storedData)

  // QR code data uses TrackingNumber key for human readability
  const qrData = {
    TrackingNumber: pkg.Title,
    Sender: pkg.Sender,
    Recipient: pkg.Recipient,
    DestinationLocation: pkg.DestinationLocation,
    PackageDetails: pkg.PackageDetails
  }

  // Navbar component
  const navbar = createNavbar()

  // QR Code container
  const qrTarget = new Container([], { id: 'qrcode', class: 'barcode__qr-target' })
  const qrContainer = new Container([qrTarget], { class: 'barcode__qr-container' })

  // Poll for DOM readiness then generate QR code
  function whenReady(id, callback, maxWait = 3000) {
    const el = document.getElementById(id)
    if (el) return callback(el)
    if (maxWait <= 0) return
    setTimeout(() => whenReady(id, callback, maxWait - 50), 50)
  }

  whenReady('qrcode', (qrElement) => {
    function generateQR() {
      new QRCode(qrElement, {
        text: JSON.stringify(qrData),
        width: 256,
        height: 256,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.L
      })
    }

    if (typeof QRCode !== 'undefined') {
      generateQR()
    } else {
      const script = document.createElement('script')
      script.src = resolvePath('@/libs/qrcode.min.js')
      script.onload = generateQR
      document.head.appendChild(script)
    }
  })

  // Print handler
  function handlePrint() {
    window.print()
  }

  // Page content (centered)
  const pageContent = new Container([
    new LinkButton(getIcon('arrow-left-line'), 'facilities/register-package', {
      class: 'barcode__back-btn no-print'
    }),
    qrContainer,
    new Text(pkg.Title, {
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
