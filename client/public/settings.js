/**
 * Settings Page JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('Settings page loaded');
  
  // Initialize navigation
  initializeNavigation();
  
  // Initialize theme options
  initializeThemeOptions();
  
  // Initialize color options
  initializeColorOptions();
  
  // Initialize font size slider
  initializeFontSizeSlider();
  
  // Initialize toggle switches
  initializeToggles();
  
  // Initialize security panel
  initializeSecurityPanel();
  
  // Initialize language options
  initializeLanguageOptions();
  
  // Initialize subscription panel
  initializeSubscriptionPanel();
  
  // Initialize logout
  initializeLogout();
});

// Initialize panel navigation
function initializeNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const panels = document.querySelectorAll('.settings-panel');
  
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      // Remove active class from all items
      navItems.forEach(navItem => navItem.classList.remove('active'));
      
      // Add active class to clicked item
      item.classList.add('active');
      
      // Get target panel ID
      const target = item.getAttribute('data-target');
      const targetPanel = document.getElementById(`${target}-panel`);
      
      // Hide all panels
      panels.forEach(panel => panel.classList.remove('active'));
      
      // Show target panel
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });
}

// Initialize theme options
function initializeThemeOptions() {
  const themeOptions = document.querySelectorAll('.theme-option');
  
  themeOptions.forEach(option => {
    option.addEventListener('click', () => {
      // Remove active class from all options
      themeOptions.forEach(opt => opt.classList.remove('active'));
      
      // Add active class to clicked option
      option.classList.add('active');
      
      // Get theme name from the option's child span
      const themeName = option.querySelector('.theme-label span').textContent.trim();
      
      // Simulate changing theme
      showToast(`Theme changed to ${themeName}`, 'success');
    });
  });
}

// Initialize color options
function initializeColorOptions() {
  const colorOptions = document.querySelectorAll('.color-option');
  
  colorOptions.forEach(option => {
    option.addEventListener('click', () => {
      // Remove active class from all options
      colorOptions.forEach(opt => opt.classList.remove('active'));
      
      // Add active class to clicked option
      option.classList.add('active');
      
      // Get color value
      const color = option.style.getPropertyValue('--color');
      
      // Simulate changing accent color
      showToast(`Accent color changed`, 'success');
    });
  });
}

// Initialize font size slider
function initializeFontSizeSlider() {
  const slider = document.getElementById('font-size-slider');
  
  if (slider) {
    slider.addEventListener('input', () => {
      // Get current value
      const value = slider.value;
      
      // Map value to font size
      const sizes = ['0.85rem', '0.95rem', '1rem', '1.1rem', '1.2rem'];
      const fontSize = sizes[value - 1];
      
      // Simulate changing font size
      document.documentElement.style.setProperty('--custom-font-size', fontSize);
    });
    
    slider.addEventListener('change', () => {
      showToast('Font size updated', 'success');
    });
  }
}

// Initialize toggle switches
function initializeToggles() {
  const toggleSwitches = document.querySelectorAll('.toggle-control input[type="checkbox"]');
  
  toggleSwitches.forEach(toggle => {
    toggle.addEventListener('change', function() {
      // Get the feature name
      const featureName = this.closest('.toggle-option').querySelector('h4').textContent;
      
      if (this.checked) {
        showToast(`${featureName} enabled`, 'success');
      } else {
        showToast(`${featureName} disabled`, 'info');
      }
    });
  });
}

// Initialize security panel
function initializeSecurityPanel() {
  // Change password button
  const changePasswordBtn = document.querySelector('#security-panel .btn-primary');
  if (changePasswordBtn) {
    changePasswordBtn.addEventListener('click', () => {
      // Simulate showing password change modal
      showToast('Password change functionality would open a modal', 'info');
    });
  }
  
  // Configure 2FA button
  const configure2faBtn = document.querySelector('#security-panel .btn-outline');
  if (configure2faBtn) {
    configure2faBtn.addEventListener('click', () => {
      // Simulate showing 2FA configuration
      showToast('2FA configuration would be shown here', 'info');
    });
  }
  
  // Session logout buttons
  const sessionLogoutBtns = document.querySelectorAll('.session-actions .btn-outline');
  sessionLogoutBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const deviceName = this.closest('.session-item').querySelector('h4').textContent;
      
      if (confirm(`Are you sure you want to log out from ${deviceName}?`)) {
        // Simulate logout
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        
        setTimeout(() => {
          this.closest('.session-item').style.opacity = '0.5';
          showToast(`Logged out from ${deviceName}`, 'success');
        }, 1000);
      }
    });
  });
  
  // Logout from all devices button
  const logoutAllBtn = document.querySelector('.btn-warning.btn-block');
  if (logoutAllBtn) {
    logoutAllBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to log out from all other devices?')) {
        // Simulate logout all
        logoutAllBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        
        setTimeout(() => {
          logoutAllBtn.textContent = 'Logout from All Devices';
          document.querySelectorAll('.session-item:not(.current)').forEach(item => {
            item.style.opacity = '0.5';
          });
          showToast('Logged out from all other devices', 'success');
        }, 1500);
      }
    });
  }
}

// Initialize language options
function initializeLanguageOptions() {
  const languageOptions = document.querySelectorAll('.language-option');
  
  languageOptions.forEach(option => {
    option.addEventListener('click', () => {
      // Get the radio input
      const radio = option.querySelector('input[type="radio"]');
      
      // Check it
      radio.checked = true;
      
      // Update active class
      languageOptions.forEach(opt => opt.classList.remove('active'));
      option.classList.add('active');
    });
  });
  
  // Save language button
  const saveLanguageBtn = document.querySelector('#language-panel .btn-primary');
  if (saveLanguageBtn) {
    saveLanguageBtn.addEventListener('click', () => {
      // Get selected language
      const selectedOption = document.querySelector('.language-option input:checked');
      const language = selectedOption.nextElementSibling.textContent;
      
      // Simulate saving
      saveLanguageBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
      
      setTimeout(() => {
        saveLanguageBtn.textContent = 'Save Language Settings';
        showToast(`Language changed to ${language}`, 'success');
      }, 1000);
    });
  }
}

// Initialize subscription panel
function initializeSubscriptionPanel() {
  // Change plan button
  const changePlanBtn = document.querySelector('.subscription-actions .btn-outline');
  if (changePlanBtn) {
    changePlanBtn.addEventListener('click', () => {
      // Simulate showing plan change options
      showToast('Plan change options would be shown here', 'info');
    });
  }
  
  // Cancel subscription button
  const cancelSubBtn = document.querySelector('.subscription-actions .btn-warning');
  if (cancelSubBtn) {
    cancelSubBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.')) {
        // Simulate cancellation
        cancelSubBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        
        setTimeout(() => {
          cancelSubBtn.textContent = 'Cancel Subscription';
          showToast('Your subscription has been canceled. You will retain premium access until April 30, 2026.', 'warning');
        }, 1500);
      }
    });
  }
}

// Initialize logout
function initializeLogout() {
  const logoutLink = document.getElementById('logout-link');
  if (logoutLink) {
    logoutLink.addEventListener('click', (e) => {
      e.preventDefault();
      
      if (confirm('Are you sure you want to log out?')) {
        // Redirect to home page
        window.location.href = 'index.html';
      }
    });
  }
}

// Show toast notification
function showToast(message, type = 'info') {
  // Check if toast container exists
  let toastContainer = document.querySelector('.toast-container');
  
  // Create toast container if it doesn't exist
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    toastContainer.style.position = 'fixed';
    toastContainer.style.bottom = '20px';
    toastContainer.style.right = '20px';
    toastContainer.style.zIndex = '9999';
    toastContainer.style.display = 'flex';
    toastContainer.style.flexDirection = 'column';
    toastContainer.style.gap = '10px';
    document.body.appendChild(toastContainer);
  }
  
  // Create toast element
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.style.padding = '0.8rem 1.2rem';
  toast.style.borderRadius = '8px';
  toast.style.backgroundColor = 'var(--card-bg)';
  toast.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.4)';
  toast.style.color = 'var(--text-color)';
  toast.style.display = 'flex';
  toast.style.alignItems = 'center';
  toast.style.gap = '0.5rem';
  toast.style.animation = 'fadeIn 0.3s ease forwards';
  toast.style.minWidth = '250px';
  
  // Set border color by type
  let icon;
  switch(type) {
    case 'success':
      toast.style.borderLeft = '4px solid var(--success-color)';
      icon = 'fas fa-check-circle';
      break;
    case 'error':
      toast.style.borderLeft = '4px solid var(--danger-color)';
      icon = 'fas fa-exclamation-circle';
      break;
    case 'warning':
      toast.style.borderLeft = '4px solid var(--warning-color)';
      icon = 'fas fa-exclamation-triangle';
      break;
    default: // info
      toast.style.borderLeft = '4px solid var(--primary-color)';
      icon = 'fas fa-info-circle';
  }
  
  // Add content
  toast.innerHTML = `
    <i class="${icon}" style="color: ${type === 'success' ? 'var(--success-color)' : 
                               type === 'error' ? 'var(--danger-color)' : 
                               type === 'warning' ? 'var(--warning-color)' : 
                               'var(--primary-color)'}"></i>
    <span>${message}</span>
  `;
  
  // Add to container
  toastContainer.appendChild(toast);
  
  // Add animation styles
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateX(50px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes fadeOut {
      from { opacity: 1; transform: translateX(0); }
      to { opacity: 0; transform: translateX(50px); }
    }
  `;
  document.head.appendChild(style);
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease forwards';
    setTimeout(() => {
      if (toastContainer.contains(toast)) {
        toastContainer.removeChild(toast);
      }
      
      // Remove container if empty
      if (toastContainer.children.length === 0) {
        document.body.removeChild(toastContainer);
      }
    }, 300);
  }, 3000);
  
  // Click to dismiss
  toast.addEventListener('click', () => {
    toast.style.animation = 'fadeOut 0.3s ease forwards';
    setTimeout(() => {
      if (toastContainer.contains(toast)) {
        toastContainer.removeChild(toast);
      }
      
      // Remove container if empty
      if (toastContainer.children.length === 0) {
        document.body.removeChild(toastContainer);
      }
    }, 300);
  });
}