/**
 * Home Page
 * Landing page with navigation to main features
 */

/**
 * Home Page Component
 */
export class HomePage {
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
    this.container.className = 'home-page';

    // Welcome section
    const welcome = this.createWelcomeSection();
    this.container.appendChild(welcome);

    // Navigation cards
    const navCards = this.createNavCards();
    this.container.appendChild(navCards);

    return this.container;
  }

  /**
   * Create welcome section
   */
  createWelcomeSection() {
    const section = document.createElement('div');
    section.className = 'home-page__welcome';
    section.innerHTML = `
      <h2 class="home-page__greeting">Welcome back, ${this.currentUser.name.split(' ')[0]}!</h2>
      <p class="home-page__subtitle">What would you like to do today?</p>
    `;
    return section;
  }

  /**
   * Create navigation cards
   */
  createNavCards() {
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'home-page__nav-cards';

    // My Mail card
    const myMailCard = this.createNavCard({
      icon: '&#128229;',
      title: 'My Mail',
      description: 'View packages you\'re receiving and have sent',
      buttonText: 'View Packages',
      route: 'packages'
    });
    cardsContainer.appendChild(myMailCard);

    // Send card
    const sendCard = this.createNavCard({
      icon: '&#128228;',
      title: 'Send',
      description: 'Create and send a new package',
      buttonText: 'Create Package',
      route: 'create'
    });
    cardsContainer.appendChild(sendCard);

    return cardsContainer;
  }

  /**
   * Create a navigation card
   */
  createNavCard({ icon, title, description, buttonText, route }) {
    const card = document.createElement('div');
    card.className = 'nav-card';
    card.innerHTML = `
      <div class="nav-card__icon">${icon}</div>
      <h3 class="nav-card__title">${title}</h3>
      <p class="nav-card__description">${description}</p>
      <button class="btn btn--primary nav-card__button">${buttonText}</button>
    `;

    card.querySelector('button').addEventListener('click', () => {
      if (this.onNavigate) this.onNavigate(route);
    });

    // Make entire card clickable
    card.addEventListener('click', (e) => {
      if (e.target.tagName !== 'BUTTON') {
        if (this.onNavigate) this.onNavigate(route);
      }
    });

    return card;
  }
}

export default HomePage;
