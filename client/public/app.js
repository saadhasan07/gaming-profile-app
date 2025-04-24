/**
 * Gaming Profile App - Main JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('App initialized');
  
  // Set up navigation
  setupNavigation();
  
  // Set up modal
  setupModal();
  
  // Set up deployment visualizer
  setupDeploymentVisualizer();
});

// Navigation
function setupNavigation() {
  // Navigation links - removed the prevention of navigation
  // Now links will work properly and go to their respective pages
  
  // Hero buttons
  const getStartedBtn = document.getElementById('get-started-btn');
  if (getStartedBtn) {
    getStartedBtn.addEventListener('click', () => {
      showModal('register');
    });
  }
  
  const exploreBtn = document.getElementById('explore-btn');
  if (exploreBtn) {
    exploreBtn.addEventListener('click', () => {
      document.querySelector('.features').scrollIntoView({ behavior: 'smooth' });
    });
  }
}

// Modal functionality
function setupModal() {
  // Login/register buttons
  const loginBtn = document.getElementById('login-button');
  const signupBtn = document.getElementById('signup-button');
  
  if (loginBtn) {
    loginBtn.addEventListener('click', () => showModal('login'));
  }
  
  if (signupBtn) {
    signupBtn.addEventListener('click', () => showModal('register'));
  }
  
  // Close button
  const closeBtn = document.getElementById('modal-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', hideModal);
  }
  
  // Close when clicking outside
  const modalOverlay = document.getElementById('modal-overlay');
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        hideModal();
      }
    });
  }
  
  // Switch between login/register
  document.getElementById('show-register')?.addEventListener('click', (e) => {
    e.preventDefault();
    switchForm('register');
  });
  
  document.getElementById('show-login')?.addEventListener('click', (e) => {
    e.preventDefault();
    switchForm('login');
  });
  
  // Form submissions
  document.getElementById('login-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    showSuccess('Email');
  });
  
  document.getElementById('register-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    showSuccess('Email');
  });
  
  // Social buttons
  document.getElementById('google-login')?.addEventListener('click', () => {
    showSuccess('Google');
  });
  
  document.getElementById('facebook-login')?.addEventListener('click', () => {
    showSuccess('Facebook');
  });
  
  document.getElementById('google-register')?.addEventListener('click', () => {
    showSuccess('Google');
  });
  
  document.getElementById('facebook-register')?.addEventListener('click', () => {
    showSuccess('Facebook');
  });
  
  // Success button
  document.getElementById('continue-button')?.addEventListener('click', () => {
    hideModal();
    updateToLoggedInState();
  });
}

// Show modal with specified form active
function showModal(form = 'login') {
  const overlay = document.getElementById('modal-overlay');
  
  if (overlay) {
    overlay.classList.remove('hidden');
    switchForm(form);
  }
}

// Hide modal
function hideModal() {
  const overlay = document.getElementById('modal-overlay');
  
  if (overlay) {
    overlay.classList.add('hidden');
  }
}

// Switch between login/register forms
function switchForm(form) {
  // Hide all forms
  document.querySelectorAll('.form-container').forEach(container => {
    container.classList.remove('active');
  });
  
  // Show selected form
  const formContainer = document.getElementById(`${form}-form-container`);
  if (formContainer) {
    formContainer.classList.add('active');
  }
}

// Show success message
function showSuccess(provider) {
  // Hide forms
  document.querySelectorAll('.form-container').forEach(container => {
    container.classList.remove('active');
  });
  
  // Update provider text
  const authMethod = document.getElementById('auth-method');
  if (authMethod) {
    authMethod.textContent = provider;
  }
  
  // Show success container
  const successContainer = document.getElementById('success-container');
  if (successContainer) {
    successContainer.classList.add('active');
  }
}

// Update UI to logged in state
function updateToLoggedInState() {
  const authButtons = document.querySelector('.auth-buttons');
  
  if (authButtons) {
    authButtons.innerHTML = `
      <div class="user-menu">
        <span class="user-greeting">Welcome, Player!</span>
        <button class="btn btn-outline btn-sm" id="logout-btn">Logout</button>
      </div>
    `;
    
    // Add logout functionality
    document.getElementById('logout-btn')?.addEventListener('click', () => {
      authButtons.innerHTML = `
        <button class="btn btn-outline" id="login-button">Login</button>
        <button class="btn btn-primary" id="signup-button">Sign Up</button>
      `;
      
      setupModal();
    });
  }
}

// Deployment Visualizer
function setupDeploymentVisualizer() {
  const startButton = document.getElementById('start-deployment');
  const resetButton = document.getElementById('reset-deployment');
  
  if (startButton && resetButton) {
    // Start deployment
    startButton.addEventListener('click', () => {
      console.log('Starting deployment visualization');
      startButton.disabled = true;
      resetButton.disabled = false;
      
      // Activate first stage
      const commitStage = document.querySelector('.pipeline-stage[data-stage="commit"]');
      if (commitStage) {
        commitStage.classList.add('active');
        
        const statusIndicator = commitStage.querySelector('.status-indicator');
        const statusText = commitStage.querySelector('.status-text');
        
        if (statusIndicator) statusIndicator.className = 'status-indicator in-progress';
        if (statusText) statusText.textContent = 'In Progress';
      }
    });
    
    // Reset deployment
    resetButton.addEventListener('click', () => {
      console.log('Resetting deployment visualization');
      startButton.disabled = false;
      resetButton.disabled = true;
      
      // Reset all stages
      document.querySelectorAll('.pipeline-stage').forEach(stage => {
        stage.classList.remove('active', 'completed');
        
        const statusIndicator = stage.querySelector('.status-indicator');
        const statusText = stage.querySelector('.status-text');
        
        if (statusIndicator) statusIndicator.className = 'status-indicator';
        if (statusText) statusText.textContent = 'Waiting';
      });
      
      // Reset connectors
      document.querySelectorAll('.pipeline-connector').forEach(connector => {
        connector.classList.remove('active');
      });
    });
  }
}