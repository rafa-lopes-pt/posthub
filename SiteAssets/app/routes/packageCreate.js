/**
 * Package Creation Page
 * Form to create and send new packages
 */

import { EMPLOYEES } from '../services/mockData.js';

/**
 * Package Creation Page Component
 */
export class PackageCreatePage {
  constructor(currentUser, onNavigate) {
    this.currentUser = currentUser;
    this.onNavigate = onNavigate;
    this.container = null;
  }

  /**
   * Render the page
   */
  render() {
    this.container = document.createElement('div');
    this.container.className = 'package-create-page';

    // Page header
    const header = this.createPageHeader();
    this.container.appendChild(header);

    // Form container
    const formContainer = this.createForm();
    this.container.appendChild(formContainer);

    return this.container;
  }

  /**
   * Create page header
   */
  createPageHeader() {
    const header = document.createElement('div');
    header.className = 'package-create-page__header';
    header.innerHTML = `
      <h2 class="package-create-page__title">Package Creation</h2>
      <p class="package-create-page__description">Fill out the form below to send a new package</p>
    `;
    return header;
  }

  /**
   * Create the form
   */
  createForm() {
    const formWrapper = document.createElement('div');
    formWrapper.className = 'form-wrapper';

    const form = document.createElement('form');
    form.className = 'package-form';
    form.addEventListener('submit', (e) => this.handleSubmit(e));

    // Recipient
    form.appendChild(this.createSelectGroup({
      id: 'recipient',
      label: 'Recipient',
      options: EMPLOYEES.filter(emp => emp.Email !== this.currentUser.email),
      required: true
    }));

    // Package Details
    form.appendChild(this.createFormGroup({
      id: 'details',
      label: 'Package Details',
      type: 'textarea',
      placeholder: 'Provide an optional description for the package (size, contents, etc.)',
      required: false
    }));

    // Form actions
    const actions = document.createElement('div');
    actions.className = 'form-actions';
    actions.innerHTML = `
      <button type="button" class="btn btn--secondary" id="cancel-btn">Cancel</button>
      <button type="submit" class="btn btn--primary">Create Package</button>
    `;
    form.appendChild(actions);

    // Cancel button handler
    form.querySelector('#cancel-btn').addEventListener('click', () => {
      if (this.onNavigate) this.onNavigate('home');
    });

    formWrapper.appendChild(form);
    return formWrapper;
  }

  /**
   * Create a form group (input/textarea)
   */
  createFormGroup({ id, label, type, placeholder, required }) {
    const group = document.createElement('div');
    group.className = 'form-group';

    const labelEl = document.createElement('label');
    labelEl.className = 'form-label';
    labelEl.setAttribute('for', id);
    labelEl.innerHTML = `${label}${required ? '<span class="required">*</span>' : ''}`;
    group.appendChild(labelEl);

    if (type === 'textarea') {
      const textarea = document.createElement('textarea');
      textarea.className = 'form-input form-textarea';
      textarea.id = id;
      textarea.name = id;
      textarea.placeholder = placeholder;
      textarea.rows = 3;
      if (required) textarea.required = true;
      group.appendChild(textarea);
    } else {
      const input = document.createElement('input');
      input.className = 'form-input';
      input.type = type;
      input.id = id;
      input.name = id;
      input.placeholder = placeholder;
      if (required) input.required = true;
      group.appendChild(input);
    }

    return group;
  }

  /**
   * Create a select group
   */
  createSelectGroup({ id, label, options, defaultValue, required, isSimple }) {
    const group = document.createElement('div');
    group.className = 'form-group';

    const labelEl = document.createElement('label');
    labelEl.className = 'form-label';
    labelEl.setAttribute('for', id);
    labelEl.innerHTML = `${label}${required ? '<span class="required">*</span>' : ''}`;
    group.appendChild(labelEl);

    const select = document.createElement('select');
    select.className = 'form-input form-select';
    select.id = id;
    select.name = id;
    if (required) select.required = true;

    // Add placeholder option
    const placeholderOpt = document.createElement('option');
    placeholderOpt.value = '';
    placeholderOpt.textContent = `Select ${label.toLowerCase()}...`;
    placeholderOpt.disabled = true;
    placeholderOpt.selected = !defaultValue;
    select.appendChild(placeholderOpt);

    // Add options
    options.forEach(opt => {
      const option = document.createElement('option');
      if (isSimple) {
        option.value = opt.value;
        option.textContent = opt.label;
        if (opt.value === defaultValue) option.selected = true;
      } else {
        option.value = opt.Email;
        option.textContent = `${opt.Name} (${opt.Department})`;
      }
      select.appendChild(option);
    });

    group.appendChild(select);
    return group;
  }

  /**
   * Handle form submission
   */
  handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const recipient = EMPLOYEES.find(emp => emp.Email === formData.get('recipient'));

    const trackingNumber = this.generateTrackingNumber();
    const packageData = {
      Title: trackingNumber,
      TrackingNumber: trackingNumber,
      Sender: this.currentUser.email,
      SenderName: this.currentUser.name,
      Recipient: formData.get('recipient'),
      RecipientName: recipient ? recipient.Name : formData.get('recipient'),
      Priority: 'Standard',
      Status: 'Sent',
      CurrentLocation: 'Mailroom A',
      DestinationLocation: recipient ? recipient.OfficeLocation : 'Mailroom A',
      PackageDetails: formData.get('details'),
      Notes: '',
      Created: new Date().toISOString(),
      Modified: new Date().toISOString()
    };

    // Show success message
    this.showSuccessModal(packageData);
  }

  /**
   * Generate tracking number
   */
  generateTrackingNumber() {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `PGN-${dateStr}-${random}`;
  }

  /**
   * Show success modal
   */
  showSuccessModal(packageData) {
    const existingModal = document.querySelector('.success-modal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.className = 'success-modal';
    modal.innerHTML = `
      <div class="success-modal__backdrop"></div>
      <div class="success-modal__content">
        <div class="success-modal__icon">&#10003;</div>
        <h3 class="success-modal__title">Package Created!</h3>
        <p class="success-modal__message">Your package has been registered and is ready for pickup.</p>
        <div class="success-modal__details">
          <div class="detail-row">
            <span class="detail-label">Tracking Number:</span>
            <span class="detail-value tracking-number">${packageData.TrackingNumber}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Recipient:</span>
            <span class="detail-value">${packageData.RecipientName}</span>
          </div>
        </div>
        <div class="success-modal__actions">
          <button class="btn btn--secondary" id="create-another">Create Another</button>
          <button class="btn btn--primary" id="go-home">Go to Home</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Button handlers
    modal.querySelector('#create-another').addEventListener('click', () => {
      modal.remove();
      this.container.querySelector('form').reset();
    });

    modal.querySelector('#go-home').addEventListener('click', () => {
      modal.remove();
      if (this.onNavigate) this.onNavigate('home');
    });
  }
}

export default PackageCreatePage;
