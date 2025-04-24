/**
 * Community Page JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('Community page loaded');
  
  // Initialize tabs
  initializeTabs();
  
  // Initialize voting
  initializeVoting();
  
  // Initialize filter functionality
  initializeFilters();
  
  // Initialize search
  initializeSearch();
  
  // Initialize pagination
  initializePagination();
});

// Initialize tab switching
function initializeTabs() {
  const tabs = document.querySelectorAll('.tab-button');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs
      tabs.forEach(t => t.classList.remove('active'));
      
      // Add active class to clicked tab
      tab.classList.add('active');
      
      // Simulate content change
      const tabName = tab.dataset.tab;
      
      // Show loading state
      const postsContainer = document.querySelector('.posts-list');
      if (postsContainer) {
        postsContainer.style.opacity = '0.5';
      }
      
      // Simulate loading time
      setTimeout(() => {
        if (postsContainer) {
          postsContainer.style.opacity = '1';
        }
        
        // Show toast notification
        showToast(`Switched to ${tabName} tab`);
      }, 500);
    });
  });
}

// Initialize voting functionality
function initializeVoting() {
  const voteButtons = document.querySelectorAll('.vote-button');
  
  voteButtons.forEach(button => {
    button.addEventListener('click', function() {
      const postCard = this.closest('.post-card');
      const voteCount = postCard.querySelector('.vote-count');
      let count = parseInt(voteCount.textContent);
      
      if (this.classList.contains('up')) {
        // If already voted, remove vote
        if (this.classList.contains('voted')) {
          this.classList.remove('voted');
          this.style.color = '';
          count--;
        } else {
          // Add upvote
          this.classList.add('voted');
          this.style.color = 'var(--primary-color)';
          
          // If downvoted, remove downvote
          const downButton = postCard.querySelector('.vote-button.down');
          if (downButton.classList.contains('voted')) {
            downButton.classList.remove('voted');
            downButton.style.color = '';
            count++;
          }
          
          count++;
        }
      } else if (this.classList.contains('down')) {
        // If already voted, remove vote
        if (this.classList.contains('voted')) {
          this.classList.remove('voted');
          this.style.color = '';
          count++;
        } else {
          // Add downvote
          this.classList.add('voted');
          this.style.color = '#f44336';
          
          // If upvoted, remove upvote
          const upButton = postCard.querySelector('.vote-button.up');
          if (upButton.classList.contains('voted')) {
            upButton.classList.remove('voted');
            upButton.style.color = '';
            count--;
          }
          
          count--;
        }
      }
      
      // Update vote count
      voteCount.textContent = count;
      
      // Animate count change
      voteCount.style.transform = 'scale(1.2)';
      voteCount.style.transition = 'transform 0.2s ease';
      
      setTimeout(() => {
        voteCount.style.transform = 'scale(1)';
      }, 200);
    });
  });
}

// Initialize filter functionality
function initializeFilters() {
  const filterSelects = document.querySelectorAll('.filter-select');
  
  filterSelects.forEach(select => {
    select.addEventListener('change', () => {
      // Simulate loading
      const postsContainer = document.querySelector('.posts-list');
      if (postsContainer) {
        postsContainer.style.opacity = '0.5';
      }
      
      // Simulate filter application
      setTimeout(() => {
        if (postsContainer) {
          postsContainer.style.opacity = '1';
        }
        
        // Get selected values
        const gameFilter = document.querySelector('.filter-select:nth-child(1)').value;
        const sortFilter = document.querySelector('.filter-select:nth-child(2)').value;
        
        showToast(`Filtered to show ${gameFilter}, sorted by ${sortFilter}`);
      }, 500);
    });
  });
}

// Initialize search functionality
function initializeSearch() {
  const searchInput = document.querySelector('.search-bar input');
  
  if (searchInput) {
    searchInput.addEventListener('input', debounce(function() {
      if (this.value.length >= 3) {
        // Simulate search
        const postsContainer = document.querySelector('.posts-list');
        if (postsContainer) {
          postsContainer.style.opacity = '0.5';
        }
        
        setTimeout(() => {
          if (postsContainer) {
            postsContainer.style.opacity = '1';
          }
          
          showToast(`Searching for: "${this.value}"`);
        }, 500);
      }
    }, 500));
  }
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
      
      // Simulate page change
      const postsContainer = document.querySelector('.posts-list');
      if (postsContainer) {
        postsContainer.style.opacity = '0.5';
        
        setTimeout(() => {
          postsContainer.style.opacity = '1';
          
          // Scroll to top of posts
          postsContainer.scrollIntoView({ behavior: 'smooth' });
          
          showToast(`Navigated to page ${button.textContent}`);
        }, 500);
      }
    });
  });
  
  // Next page button
  const nextButton = document.querySelector('.pagination-arrow');
  if (nextButton) {
    nextButton.addEventListener('click', () => {
      const activeButton = document.querySelector('.pagination-button.active');
      const nextPageButton = activeButton.nextElementSibling;
      
      if (nextPageButton && nextPageButton.classList.contains('pagination-button')) {
        nextPageButton.click();
      }
    });
  }
}

// Helper for creating debounced functions
function debounce(func, wait) {
  let timeout;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

// Handle new post button
document.addEventListener('DOMContentLoaded', () => {
  const newPostButton = document.querySelector('.community-actions .btn-primary');
  
  if (newPostButton) {
    newPostButton.addEventListener('click', () => {
      // Check if user is logged in
      // This would normally check a user session, but we'll simulate it
      
      // Simulate a not logged in state
      // Would be replaced with actual auth check
      const userLoggedIn = false;
      
      if (!userLoggedIn) {
        // Show login modal
        const modalOverlay = document.getElementById('modal-overlay');
        const modalContainer = document.getElementById('modal-container');
        
        if (modalOverlay && modalContainer) {
          modalOverlay.classList.remove('hidden');
          modalContainer.classList.add('active');
        }
        
        showToast('Please log in to create a new post', 'info');
      } else {
        // Show new post form
        // This would open a modal with a post creation form
        showToast('Opening new post form...', 'info');
      }
    });
  }
});

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