/**
 * Pigeon - Package Tracking Application
 * Main entry point with routing
 */

import { HomePage } from './routes/home.js';
import { PackagesPage } from './routes/packages.js';
import { PackageCreatePage } from './routes/packageCreate.js';
import { DashboardPage } from './routes/dashboard.js';
import { SmartCardPage } from './routes/smartcard.js';

// Mock current user - in production this would come from SharePoint
const CURRENT_USER = {
  email: 'sarah.johnson@company.com',
  name: 'Sarah Johnson',
  department: 'Marketing',
  badgeId: 'BADGE002',
  officeLocation: 'Room 102'
};

// App state
const state = {
  currentRoute: 'home'
};

let appContainer = null;
let mainContent = null;

/**
 * Initialize the application
 */
function initApp() {
  appContainer = document.getElementById('app') || document.body;

  // Create app wrapper
  const appWrapper = document.createElement('div');
  appWrapper.className = 'posthub-app';

  // Add header with navigation
  const header = createHeader(CURRENT_USER);
  appWrapper.appendChild(header);

  // Add main content
  mainContent = document.createElement('main');
  mainContent.className = 'posthub-main';
  mainContent.id = 'main-content';
  appWrapper.appendChild(mainContent);

  appContainer.appendChild(appWrapper);

  // Navigate to initial route
  navigate('home');
}

/**
 * Create application header with navigation
 */
function createHeader(user) {
  const header = document.createElement('header');
  header.className = 'posthub-header';
  header.innerHTML = `
    <div class="posthub-header__brand" data-nav="home">
      <h1 class="posthub-header__title">Pigeon</h1>
      <span class="posthub-header__subtitle">Package Tracking System</span>
    </div>
    <nav class="posthub-nav">
      <button class="nav-link" data-route="packages">
        <span class="nav-link__icon">&#128229;</span>
        <span class="nav-link__text">My Mail</span>
      </button>
      <button class="nav-link" data-route="create">
        <span class="nav-link__icon">&#128228;</span>
        <span class="nav-link__text">Send</span>
      </button>
      <button class="nav-link" data-route="dashboard">
        <span class="nav-link__icon">&#128202;</span>
        <span class="nav-link__text">Dashboard</span>
      </button>
      <button class="nav-link" data-route="smartcard">
        <span class="nav-link__icon">&#128179;</span>
        <span class="nav-link__text">Scan SmartCard</span>
      </button>
    </nav>
    <div class="posthub-header__user">
      <span class="posthub-header__user-name">${user.name}</span>
      <span class="posthub-header__user-dept">${user.department}</span>
    </div>
  `;

  // Brand click - go home
  header.querySelector('.posthub-header__brand').addEventListener('click', () => {
    navigate('home');
  });

  // Navigation links
  header.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      const route = link.getAttribute('data-route');
      navigate(route);
    });
  });

  return header;
}

/**
 * Navigate to a route
 */
function navigate(route) {
  state.currentRoute = route;

  // Update active nav link
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('nav-link--active', link.getAttribute('data-route') === route);
  });

  // Clear main content
  mainContent.innerHTML = '';

  // Render appropriate page
  let page;
  switch (route) {
    case 'home':
      page = new HomePage(CURRENT_USER, navigate);
      break;
    case 'packages':
      page = new PackagesPage(CURRENT_USER);
      break;
    case 'create':
      page = new PackageCreatePage(CURRENT_USER, navigate);
      break;
    case 'dashboard':
      page = new DashboardPage(CURRENT_USER);
      break;
    case 'smartcard':
      page = new SmartCardPage(CURRENT_USER, navigate);
      break;
    default:
      page = new HomePage(CURRENT_USER, navigate);
  }

  mainContent.appendChild(page.render());

  // Scroll to top
  window.scrollTo(0, 0);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
