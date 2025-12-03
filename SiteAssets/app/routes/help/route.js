/**
 * Help Route - User Documentation and FAQs
 */

import {
  Text,
  Card,
  Container,
  defineRoute
} from '../../libs/nofbiz/nofbiz.base.js';

export default defineRoute((config) => {
  config.setRouteTitle('Help - PostHub');

  return [
    new Text('Help & User Guides', { type: 'h1' }),

    new Card([
      new Text('Getting Started', { type: 'h2' }),
      new Text('PostHub is your internal mail management system. Use it to send packages to colleagues, track deliveries, and manage incoming mail.', { type: 'p' }),

      new Text('Sending a Package', { type: 'h3' }),
      new Container([
        new Text('1. Click "Send Mail" from the home page', { type: 'p' }),
        new Text('2. Fill in the package description and recipient email', { type: 'p' }),
        new Text('3. Select priority level (Standard, Urgent, or Low)', { type: 'p' }),
        new Text('4. Add any additional details or notes', { type: 'p' }),
        new Text('5. Click "Create Package"', { type: 'p' }),
        new Text('6. Physically bring your package to the facilities mailroom', { type: 'p' })
      ], { class: 'help-list' }),

      new Text('Tracking Your Packages', { type: 'h3' }),
      new Container([
        new Text('• Go to "My Mail" to see all your packages', { type: 'p' }),
        new Text('• Filter by status to find specific packages', { type: 'p' }),
        new Text('• View current location and delivery status', { type: 'p' }),
        new Text('• Each package has a unique tracking number', { type: 'p' })
      ], { class: 'help-list' })
    ]),

    new Card([
      new Text('Package Statuses', { type: 'h2' }),
      new Container([
        new Text('• Sent: Package created, awaiting physical delivery to mailroom', { type: 'p' }),
        new Text('• Received: Facilities has received your package', { type: 'p' }),
        new Text('• Stored: Package temporarily stored at a facilities location', { type: 'p' }),
        new Text('• In Transit: Package is being moved between locations', { type: 'p' }),
        new Text('• Arrived: Package arrived at intermediate or final location', { type: 'p' }),
        new Text('• Delivered: Package delivered to final recipient', { type: 'p' })
      ], { class: 'help-list' })
    ]),

    new Card([
      new Text('Frequently Asked Questions', { type: 'h2' }),

      new Text('How long does delivery take?', { type: 'h3' }),
      new Text('Delivery times vary based on priority and location: Urgent (same-day or next-business-day), Standard (1-3 business days), Low (3-5 business days).', { type: 'p' }),

      new Text('What if my package is missing?', { type: 'h3' }),
      new Text('If your package status hasn\'t updated in several days, check the tracking number on "My Mail" page and contact facilities staff at the last known location.', { type: 'p' }),

      new Text('Can I cancel a package?', { type: 'h3' }),
      new Text('Contact facilities staff immediately if you need to cancel or modify a package that\'s already been sent.', { type: 'p' })
    ]),

    new Card([
      new Text('Contact Support', { type: 'h2' }),
      new Text('If you need additional assistance, please contact the facilities team:', { type: 'p' }),
      new Text('Email: facilities@company.com', { type: 'p' }),
      new Text('Phone: ext. 1234', { type: 'p' })
    ])
  ];
});
