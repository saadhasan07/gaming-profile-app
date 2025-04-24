/**
 * Leaderboard JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('Leaderboard loaded');
  
  // Initialize filters
  initializeFilters();
  
  // Initialize tabs
  initializeTabs();
  
  // Initialize pagination
  initializePagination();
  
  // Initialize refresh button
  initializeRefresh();
});

// Initialize filter functionality
function initializeFilters() {
  const filters = document.querySelectorAll('.filter-select');
  
  filters.forEach(filter => {
    filter.addEventListener('change', () => {
      // Simulate loading state
      document.querySelector('.leaderboard-content').style.opacity = '0.5';
      document.querySelector('.refresh-button').innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> Refreshing...';
      
      // Simulate data load time
      setTimeout(() => {
        document.querySelector('.leaderboard-content').style.opacity = '1';
        document.querySelector('.refresh-button').innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
        
        // Update last updated time
        updateLastUpdatedTime();
        
        // Show notification
        showToast('Leaderboard updated with new filters', 'info');
      }, 1000);
    });
  });
}

// Initialize tab switching
function initializeTabs() {
  const tabs = document.querySelectorAll('.tab-button');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs
      tabs.forEach(t => t.classList.remove('active'));
      
      // Add active class to clicked tab
      tab.classList.add('active');
      
      // Simulate loading
      document.querySelector('.leaderboard-content').style.opacity = '0.5';
      document.querySelector('.refresh-button').innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> Refreshing...';
      
      // Simulate data load time
      setTimeout(() => {
        document.querySelector('.leaderboard-content').style.opacity = '1';
        document.querySelector('.refresh-button').innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
        
        // Update last updated time
        updateLastUpdatedTime();
        
        // Update leaderboard title based on selected tab
        const tabName = tab.textContent.trim();
        showToast(`Showing ${tabName} leaderboard`, 'info');
      }, 800);
    });
  });
}

// Initialize pagination
function initializePagination() {
  const paginationButtons = document.querySelectorAll('.pagination-button');
  
  paginationButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Skip if already active
      if (button.classList.contains('active')) return;
      
      // Remove active class from all buttons
      paginationButtons.forEach(b => b.classList.remove('active'));
      
      // Add active class to clicked button
      button.classList.add('active');
      
      // Simulate loading
      document.querySelector('.leaderboard-content').style.opacity = '0.5';
      
      // Simulate loading time
      setTimeout(() => {
        document.querySelector('.leaderboard-content').style.opacity = '1';
        
        // Scroll to top of table
        document.querySelector('.leaderboard-table').scrollIntoView({ behavior: 'smooth' });
        
        showToast(`Page ${button.textContent} loaded`, 'info');
      }, 500);
    });
  });
  
  // Next page arrow
  document.querySelector('.pagination-arrow')?.addEventListener('click', () => {
    const activeButton = document.querySelector('.pagination-button.active');
    const nextButton = activeButton.nextElementSibling;
    
    if (nextButton && nextButton.classList.contains('pagination-button')) {
      nextButton.click();
    }
  });
}

// Initialize refresh functionality
function initializeRefresh() {
  const refreshButton = document.querySelector('.refresh-button');
  
  if (refreshButton) {
    refreshButton.addEventListener('click', () => {
      // Set loading state
      refreshButton.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> Refreshing...';
      document.querySelector('.leaderboard-content').style.opacity = '0.5';
      
      // Simulate loading time
      setTimeout(() => {
        document.querySelector('.leaderboard-content').style.opacity = '1';
        refreshButton.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
        
        // Update last updated time
        updateLastUpdatedTime();
        
        showToast('Leaderboard refreshed', 'success');
      }, 1200);
    });
  }
}

// Update last updated timestamp
function updateLastUpdatedTime() {
  const now = new Date();
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };
  
  document.getElementById('last-updated-date').textContent = now.toLocaleString('en-US', options);
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
      toast.style.borderLeft = '4px solid #f44336';
      icon = 'fas fa-exclamation-circle';
      break;
    case 'warning':
      toast.style.borderLeft = '4px solid #ff9800';
      icon = 'fas fa-exclamation-triangle';
      break;
    default: // info
      toast.style.borderLeft = '4px solid var(--primary-color)';
      icon = 'fas fa-info-circle';
  }
  
  // Add content
  toast.innerHTML = `
    <i class="${icon}" style="color: ${type === 'success' ? 'var(--success-color)' : 
                               type === 'error' ? '#f44336' : 
                               type === 'warning' ? '#ff9800' : 
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