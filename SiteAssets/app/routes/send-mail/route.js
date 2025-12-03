/**
 * Send Mail Route - Create New Package
 * Form for users to create outgoing packages
 */

import {
  Text,
  Card,
  Container,
  Button,
  FormField,
  TextInput,
  defineRoute,
  Toast
} from '../../libs/nofbiz/nofbiz.base.js';
import {
  getCurrentUserInfo,
  createPackage,
  getEmployeeByEmail
} from '../../utils/sharepoint.js';

export default defineRoute(async (config) => {
  config.setRouteTitle('Send Mail - PostHub');

  const user = getCurrentUserInfo();

  // Get sender info from Employees list
  let senderInfo = null;
  try {
    senderInfo = await getEmployeeByEmail(user.email);
  } catch (error) {
    console.error('Error loading sender info:', error);
  }

  // Form fields
  const formData = {
    title: new FormField({ value: '' }),
    recipientEmail: new FormField({ value: '' }),
    priority: new FormField({ value: 'Standard' }),
    packageDetails: new FormField({ value: '' }),
    notes: new FormField({ value: '' })
  };

  // Submit handler
  async function handleSubmit() {
    // Validate
    if (!formData.title.value || !formData.recipientEmail.value) {
      new Toast('Please fill in package description and recipient email', {
        type: 'error',
        duration: 3000
      });
      return;
    }

    if (!senderInfo) {
      new Toast('Sender information not found. Please contact administrator.', {
        type: 'error',
        duration: 5000
      });
      return;
    }

    try {
      // Get recipient from email
      const recipientInfo = await getEmployeeByEmail(formData.recipientEmail.value);
      if (!recipientInfo) {
        new Toast('Recipient not found. Please check the email address.', {
          type: 'error',
          duration: 3000
        });
        return;
      }

      const packageData = {
        Title: formData.title.value,
        SenderId: senderInfo.Id,
        RecipientId: recipientInfo.Id,
        Priority: formData.priority.value,
        PackageDetails: formData.packageDetails.value,
        Notes: formData.notes.value
      };

      const result = await createPackage(packageData);

      new Toast(`Package created! Tracking: ${result.TrackingNumber}`, {
        type: 'success',
        duration: 5000
      });

      // Reset form
      formData.title.value = '';
      formData.recipientEmail.value = '';
      formData.priority.value = 'Standard';
      formData.packageDetails.value = '';
      formData.notes.value = '';

      // Navigate to my-mail after delay
      setTimeout(() => {
        window.location.hash = '#my-mail';
      }, 2000);

    } catch (error) {
      console.error('Failed to create package:', error);
      new Toast('Failed to create package. Please try again.', {
        type: 'error',
        duration: 5000
      });
    }
  }

  return [
    new Text('Send Mail', { type: 'h1' }),

    new Card([
      new Text('Package Information', { type: 'h3' }),

      // Sender info
      new Container([
        new Text('Sender', { type: 'label' }),
        new Text(
          senderInfo ? `${senderInfo.Name} (${senderInfo.Email})` : 'Loading...',
          { type: 'p', class: 'sender-info' }
        )
      ], { class: 'form-field' }),

      // Package description
      new Container([
        new Text('Package Description *', { type: 'label' }),
        new TextInput(formData.title, {
          placeholder: 'Brief description of contents'
        })
      ], { class: 'form-field' }),

      // Recipient email
      new Container([
        new Text('Recipient Email *', { type: 'label' }),
        new TextInput(formData.recipientEmail, {
          placeholder: 'recipient@company.com'
        })
      ], { class: 'form-field' }),

      // Priority
      new Container([
        new Text('Priority', { type: 'label' }),
        new Container([
          new Button('Standard', {
            variant: formData.priority.value === 'Standard' ? 'primary' : 'secondary',
            onClickHandler: () => { formData.priority.value = 'Standard'; }
          }),
          new Button('Urgent', {
            variant: formData.priority.value === 'Urgent' ? 'primary' : 'secondary',
            onClickHandler: () => { formData.priority.value = 'Urgent'; }
          }),
          new Button('Low', {
            variant: formData.priority.value === 'Low' ? 'primary' : 'secondary',
            onClickHandler: () => { formData.priority.value = 'Low'; }
          })
        ], { class: 'priority-buttons' })
      ], { class: 'form-field' }),

      // Package details
      new Container([
        new Text('Package Details', { type: 'label' }),
        new TextInput(formData.packageDetails, {
          placeholder: 'Size, weight, special handling instructions'
        })
      ], { class: 'form-field' }),

      // Notes
      new Container([
        new Text('Notes', { type: 'label' }),
        new TextInput(formData.notes, {
          placeholder: 'Additional notes'
        })
      ], { class: 'form-field' }),

      // Submit buttons
      new Container([
        new Button('Create Package', {
          variant: 'primary',
          onClickHandler: handleSubmit
        }),
        new Button('Cancel', {
          variant: 'secondary',
          onClickHandler: () => { window.location.hash = '#home'; }
        })
      ], { class: 'form-actions' })
    ], { class: 'form-card' })
  ];
});
