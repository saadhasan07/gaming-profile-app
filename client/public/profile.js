/**
 * Profile Page JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('Profile page loaded');
  
  // Initialize sidebar navigation
  initializeSidebarNav();
  
  // Initialize forms
  initializeForms();
  
  // Initialize toggle switches
  initializeToggles();
  
  // Initialize danger zone
  initializeDangerZone();
  
  // Initialize account connections
  initializeAccountConnections();
  
  // Initialize logout
  initializeLogout();
  
  // Setup achievement sharing functionality
  setupAchievementSharing();
});

// Initialize sidebar navigation
function initializeSidebarNav() {
  const navItems = document.querySelectorAll('.nav-item');
  const profileSections = document.querySelectorAll('.profile-section');
  
  // Handle clicks on nav items
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Get the target section ID from the href
      const targetId = item.querySelector('a').getAttribute('href').substring(1);
      
      // Remove active class from all nav items and sections
      navItems.forEach(i => i.classList.remove('active'));
      profileSections.forEach(s => s.classList.remove('active'));
      
      // Add active class to clicked nav item and target section
      item.classList.add('active');
      document.getElementById(targetId).classList.add('active');
      
      // If on mobile, scroll to the top of the section
      if (window.innerWidth <= 992) {
        document.getElementById(targetId).scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
  
  // Handle hash in URL
  if (window.location.hash) {
    const hash = window.location.hash.substring(1);
    const targetSection = document.getElementById(hash);
    
    if (targetSection) {
      // Remove active class from all nav items and sections
      navItems.forEach(i => i.classList.remove('active'));
      profileSections.forEach(s => s.classList.remove('active'));
      
      // Add active class to target nav item and section
      document.querySelector(`.nav-item a[href="#${hash}"]`).parentElement.classList.add('active');
      targetSection.classList.add('active');
    }
  }
}

// Initialize forms
function initializeForms() {
  const forms = document.querySelectorAll('.profile-form');
  
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Get form name from the closest section
      const sectionId = form.closest('.profile-section').getAttribute('id');
      
      // Simulate form submission
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
      submitBtn.disabled = true;
      
      // Simulate request delay
      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        // Show success message
        showToast(`${sectionId.replace('-', ' ')} updated successfully`, 'success');
      }, 1500);
    });
  });
  
  // Bind to upload button
  const uploadBtn = document.querySelector('.avatar-buttons .btn-primary');
  if (uploadBtn) {
    uploadBtn.addEventListener('click', () => {
      // This would normally trigger a file input click
      showToast('Upload functionality would open file picker', 'info');
    });
  }
  
  // Bind to remove button
  const removeBtn = document.querySelector('.avatar-buttons .btn-outline');
  if (removeBtn) {
    removeBtn.addEventListener('click', () => {
      // This would normally trigger avatar removal
      showToast('Avatar removal functionality', 'info');
    });
  }
}

// Initialize toggle switches
function initializeToggles() {
  const toggles = document.querySelectorAll('.switch input');
  
  toggles.forEach(toggle => {
    toggle.addEventListener('change', function() {
      // Get the toggle name
      const toggleName = this.closest('.toggle-section').querySelector('h4').textContent;
      
      if (this.checked) {
        showToast(`${toggleName} enabled`, 'success');
      } else {
        showToast(`${toggleName} disabled`, 'info');
      }
    });
  });
}

// Initialize danger zone
function initializeDangerZone() {
  // Deactivate account button
  const deactivateBtn = document.querySelector('.danger-option .btn-warning');
  if (deactivateBtn) {
    deactivateBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to deactivate your account? You can reactivate it by logging back in.')) {
        // Simulate deactivation
        deactivateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deactivating...';
        deactivateBtn.disabled = true;
        
        setTimeout(() => {
          showToast('Account successfully deactivated. You will be logged out.', 'warning');
          
          // Simulate redirect to home page
          setTimeout(() => {
            window.location.href = 'index.html';
          }, 2000);
        }, 1500);
      }
    });
  }
  
  // Delete account button
  const deleteBtn = document.querySelector('.danger-option .btn-danger');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      if (confirm('WARNING: This action cannot be undone. Are you sure you want to permanently delete your account and all associated data?')) {
        // Double confirm
        if (confirm('Please confirm once more that you understand all your data will be permanently deleted.')) {
          // Simulate deletion
          deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';
          deleteBtn.disabled = true;
          
          setTimeout(() => {
            showToast('Account permanently deleted. You will be redirected to the home page.', 'error');
            
            // Simulate redirect to home page
            setTimeout(() => {
              window.location.href = 'index.html';
            }, 2000);
          }, 1500);
        }
      }
    });
  }
}

// Initialize account connections
function initializeAccountConnections() {
  // Connect buttons
  const connectBtns = document.querySelectorAll('.account-actions .btn-primary');
  connectBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const accountName = this.closest('.connected-account').querySelector('h3').textContent;
      
      // Simulate connecting
      this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
      this.disabled = true;
      
      setTimeout(() => {
        // Update the button and account info
        this.textContent = 'Disconnect';
        this.className = 'btn btn-sm btn-outline';
        this.disabled = false;
        
        const accountInfo = this.closest('.connected-account').querySelector('p');
        accountInfo.innerHTML = 'Connected as <strong>NewAccount</strong>';
        
        showToast(`Successfully connected to ${accountName}`, 'success');
      }, 1500);
    });
  });
  
  // Disconnect buttons
  const disconnectBtns = document.querySelectorAll('.account-actions .btn-outline');
  disconnectBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const accountName = this.closest('.connected-account').querySelector('h3').textContent;
      
      if (confirm(`Are you sure you want to disconnect your ${accountName} account?`)) {
        // Simulate disconnecting
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Disconnecting...';
        this.disabled = true;
        
        setTimeout(() => {
          // Update the button and account info
          this.textContent = 'Connect';
          this.className = 'btn btn-sm btn-primary';
          this.disabled = false;
          
          const accountInfo = this.closest('.connected-account').querySelector('p');
          accountInfo.textContent = 'Not connected';
          
          showToast(`Disconnected from ${accountName}`, 'info');
        }, 1500);
      }
    });
  });
  
  // Find more games button
  const findGamesBtn = document.querySelector('#gaming-profiles .btn-primary');
  if (findGamesBtn) {
    findGamesBtn.addEventListener('click', () => {
      // Redirect to games page
      window.location.href = 'games.html';
    });
  }
}

// Setup achievement sharing functionality
function setupAchievementSharing() {
  // Get all achievement items in the achievements section
  const achievementItems = document.querySelectorAll('#achievements .achievement-item');
  
  achievementItems.forEach(item => {
    // Check if a share button already exists
    if (!item.querySelector('.share-achievement-button')) {
      // Create share button
      const shareButton = document.createElement('button');
      shareButton.className = 'share-achievement-button';
      shareButton.innerHTML = '<i class="fas fa-share-alt"></i>';
      shareButton.setAttribute('aria-label', 'Share achievement');
      
      // Style the button
      shareButton.style.position = 'absolute';
      shareButton.style.top = '10px';
      shareButton.style.right = '10px';
      shareButton.style.width = '32px';
      shareButton.style.height = '32px';
      shareButton.style.borderRadius = '50%';
      shareButton.style.background = 'linear-gradient(to right, var(--accent-color), var(--primary-color))';
      shareButton.style.border = 'none';
      shareButton.style.color = '#fff';
      shareButton.style.cursor = 'pointer';
      shareButton.style.display = 'flex';
      shareButton.style.alignItems = 'center';
      shareButton.style.justifyContent = 'center';
      shareButton.style.opacity = '0.85';
      shareButton.style.transition = 'all 0.2s ease';
      
      // Add hover effect
      shareButton.addEventListener('mouseover', () => {
        shareButton.style.opacity = '1';
        shareButton.style.transform = 'scale(1.1)';
      });
      
      shareButton.addEventListener('mouseout', () => {
        shareButton.style.opacity = '0.85';
        shareButton.style.transform = 'scale(1)';
      });
      
      // Add click event listener
      shareButton.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent click from bubbling to parent
        
        // Get achievement info
        const achievementName = item.querySelector('h3').textContent;
        const gameName = item.querySelector('p').textContent;
        const rarity = item.querySelector('.achievement-rarity').textContent.trim();
        const icon = item.querySelector('.achievement-icon i').className;
        
        // Create a custom event to show share overlay with this achievement
        const event = new CustomEvent('showShareOverlay', {
          detail: {
            achievementName,
            gameName,
            rarity,
            icon
          }
        });
        
        document.dispatchEvent(event);
      });
      
      // Add button to the achievement item
      item.style.position = 'relative'; // Ensure item is positioned
      item.appendChild(shareButton);
    }
  });
  
  // Listen for the custom event to show share overlay
  document.addEventListener('showShareOverlay', (e) => {
    if (typeof showShareOverlay === 'function') {
      showShareOverlay(
        e.detail.achievementName,
        e.detail.gameName,
        e.detail.rarity,
        e.detail.icon
      );
    } else {
      console.error('showShareOverlay function not found. Make sure social-sharing.js is loaded correctly.');
    }
  });
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