/**
 * Badge Swipe Input Component
 *
 * Captures badge reader input with auto-focus, debouncing, and support for
 * both paste and input events. Badge readers can behave differently, so this
 * component handles multiple input methods.
 *
 * @module components/badgeSwipeInput
 */

import { Container, Text } from '../libs/nofbiz/nofbiz.base.js';

/**
 * Creates a badge swipe input component with auto-focus and debouncing
 *
 * @param {Object} options - Configuration options
 * @param {Function} options.onBadgeDetected - Callback when badge is detected (badgeId) => void
 * @param {number} options.debounceMs - Debounce delay in milliseconds (default: 300)
 * @param {string} options.placeholder - Input placeholder text
 * @param {string} options.instructionText - Instruction text for users
 * @param {boolean} options.showInstruction - Show instruction text (default: true)
 * @param {boolean} options.autoClear - Auto-clear field after detection (default: true)
 * @param {boolean} options.autoFocus - Auto-focus input field (default: true)
 * @param {string} options.class - Additional CSS classes
 * @returns {Container} SPARC Container with badge input element
 *
 * @example
 * const badgeInput = createBadgeSwipeInput({
 *   onBadgeDetected: (badgeId) => {
 *     console.log('Badge detected:', badgeId);
 *     // Lookup employee by badge ID
 *   },
 *   debounceMs: 300,
 *   instructionText: 'Swipe your badge to begin'
 * });
 */
export function createBadgeSwipeInput(options = {}) {
  const {
    onBadgeDetected,
    debounceMs = 300,
    placeholder = 'Swipe badge or enter badge ID...',
    instructionText = 'Please swipe your badge at the reader or enter your badge ID manually',
    showInstruction = true,
    autoClear = true,
    autoFocus = true,
    class: className = ''
  } = options;

  // Validation
  if (!onBadgeDetected || typeof onBadgeDetected !== 'function') {
    throw new Error('BadgeSwipeInput requires onBadgeDetected callback function');
  }

  // State
  let debounceTimer = null;
  let lastProcessedValue = '';

  // Create container
  const container = document.createElement('div');
  container.className = `nofbiz__badge-swipe-input ${className}`.trim();
  container.setAttribute('data-component', 'badge-swipe-input');

  // Instruction text
  let instructionElement = null;
  if (showInstruction) {
    instructionElement = document.createElement('div');
    instructionElement.className = 'nofbiz__badge-instruction';
    instructionElement.innerHTML = `
      <span class="nofbiz__badge-icon">🔖</span>
      <span class="nofbiz__badge-instruction-text">${instructionText}</span>
    `;
    container.appendChild(instructionElement);
  }

  // Input wrapper
  const inputWrapper = document.createElement('div');
  inputWrapper.className = 'nofbiz__badge-input-wrapper';

  // Input field
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'nofbiz__badge-input';
  input.placeholder = placeholder;
  input.setAttribute('data-badge-input', 'true');
  input.autocomplete = 'off';
  input.spellcheck = false;

  // Status indicator
  const statusIndicator = document.createElement('div');
  statusIndicator.className = 'nofbiz__badge-status';
  statusIndicator.innerHTML = '<span class="nofbiz__status-ready">Ready</span>';

  inputWrapper.appendChild(input);
  inputWrapper.appendChild(statusIndicator);
  container.appendChild(inputWrapper);

  /**
   * Process badge input
   */
  function processBadgeInput(badgeId) {
    // Trim and validate
    const cleanBadgeId = String(badgeId).trim();

    // Ignore empty or duplicate values
    if (!cleanBadgeId || cleanBadgeId === lastProcessedValue) {
      return;
    }

    lastProcessedValue = cleanBadgeId;

    // Update status
    statusIndicator.innerHTML = '<span class="nofbiz__status-processing">Processing...</span>';
    input.disabled = true;

    // Call callback
    try {
      onBadgeDetected(cleanBadgeId);

      // Success feedback
      statusIndicator.innerHTML = '<span class="nofbiz__status-success">✓ Badge detected</span>';

      // Auto-clear after delay
      if (autoClear) {
        setTimeout(() => {
          input.value = '';
          input.disabled = false;
          statusIndicator.innerHTML = '<span class="nofbiz__status-ready">Ready</span>';
          lastProcessedValue = '';

          // Re-focus for next badge
          if (autoFocus) {
            input.focus();
          }
        }, 1000);
      } else {
        setTimeout(() => {
          input.disabled = false;
          statusIndicator.innerHTML = '<span class="nofbiz__status-ready">Ready</span>';
        }, 1000);
      }
    } catch (error) {
      // Error feedback
      console.error('Badge detection error:', error);
      statusIndicator.innerHTML = '<span class="nofbiz__status-error">✗ Error</span>';

      setTimeout(() => {
        input.value = '';
        input.disabled = false;
        statusIndicator.innerHTML = '<span class="nofbiz__status-ready">Ready</span>';
        lastProcessedValue = '';

        if (autoFocus) {
          input.focus();
        }
      }, 2000);
    }
  }

  /**
   * Debounced input handler
   */
  function handleInputChange(value) {
    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Set new timer
    debounceTimer = setTimeout(() => {
      if (value && value.trim()) {
        processBadgeInput(value);
      }
    }, debounceMs);
  }

  /**
   * Handle paste event (some badge readers paste data)
   */
  function handlePaste(event) {
    event.preventDefault();
    const pastedData = event.clipboardData.getData('text');

    if (pastedData && pastedData.trim()) {
      input.value = pastedData.trim();

      // Process immediately on paste (badge readers are instant)
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      // Small delay to allow UI update
      setTimeout(() => {
        processBadgeInput(pastedData.trim());
      }, 50);
    }
  }

  /**
   * Handle input event (keyboard input or some badge readers)
   */
  function handleInput(event) {
    const value = event.target.value;
    handleInputChange(value);
  }

  /**
   * Handle Enter key (manual submission)
   */
  function handleKeyDown(event) {
    if (event.key === 'Enter') {
      event.preventDefault();

      // Clear debounce timer
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      const value = input.value.trim();
      if (value) {
        processBadgeInput(value);
      }
    }
  }

  /**
   * Handle focus loss
   */
  function handleBlur() {
    // Re-focus if autoFocus is enabled (keep field ready for badge swipe)
    if (autoFocus && !input.disabled) {
      setTimeout(() => {
        input.focus();
      }, 100);
    }
  }

  // Event listeners
  input.addEventListener('paste', handlePaste);
  input.addEventListener('input', handleInput);
  input.addEventListener('keydown', handleKeyDown);
  input.addEventListener('blur', handleBlur);

  // Auto-focus on mount
  if (autoFocus) {
    setTimeout(() => {
      input.focus();
    }, 100);
  }

  // Public API on container
  container.focus = () => {
    input.focus();
  };

  container.clear = () => {
    input.value = '';
    lastProcessedValue = '';
    statusIndicator.innerHTML = '<span class="nofbiz__status-ready">Ready</span>';
  };

  container.disable = () => {
    input.disabled = true;
    statusIndicator.innerHTML = '<span class="nofbiz__status-disabled">Disabled</span>';
  };

  container.enable = () => {
    input.disabled = false;
    statusIndicator.innerHTML = '<span class="nofbiz__status-ready">Ready</span>';
    if (autoFocus) {
      input.focus();
    }
  };

  container.getValue = () => {
    return input.value.trim();
  };

  container.setValue = (value) => {
    input.value = value;
  };

  // Cleanup on destroy
  container.destroy = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    input.removeEventListener('paste', handlePaste);
    input.removeEventListener('input', handleInput);
    input.removeEventListener('keydown', handleKeyDown);
    input.removeEventListener('blur', handleBlur);
  };

  // Return SPARC Container
  return new Container([container]);
}

export default createBadgeSwipeInput;
