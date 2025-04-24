/**
 * Games Library JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('Games Library loaded');
  
  // Initialize Slider
  initializeSlider();
  
  // Initialize Filters
  initializeFilters();
  
  // Initialize Search
  initializeSearch();
  
  // Initialize Game Actions
  initializeGameActions();
  
  // Initialize Load More button
  initializeLoadMore();
});

// Initialize featured games slider
function initializeSlider() {
  const sliderTrack = document.querySelector('.slider-track');
  const dots = document.querySelectorAll('.slider-dot');
  const prevButton = document.querySelector('.slider-prev');
  const nextButton = document.querySelector('.slider-next');
  const slides = document.querySelectorAll('.featured-game');
  
  if (!sliderTrack || !slides.length) return;
  
  let currentSlide = 0;
  const slideWidth = 100; // 100%
  
  // Set initial position
  sliderTrack.style.width = `${slides.length * 100}%`;
  slides.forEach(slide => {
    slide.style.width = `${100 / slides.length}%`;
  });
  
  // Function to go to slide
  function goToSlide(index) {
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    
    currentSlide = index;
    sliderTrack.style.transform = `translateX(-${currentSlide * slideWidth / slides.length}%)`;
    
    // Update active dot
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
    });
    
    // Update active slide
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === currentSlide);
    });
  }
  
  // Previous slide button
  if (prevButton) {
    prevButton.addEventListener('click', () => {
      goToSlide(currentSlide - 1);
    });
  }
  
  // Next slide button
  if (nextButton) {
    nextButton.addEventListener('click', () => {
      goToSlide(currentSlide + 1);
    });
  }
  
  // Dot navigation
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      goToSlide(i);
    });
  });
  
  // Auto-advance slides every 5 seconds
  let autoSlideInterval = setInterval(() => {
    goToSlide(currentSlide + 1);
  }, 5000);
  
  // Pause auto-advance on hover
  const sliderContainer = document.querySelector('.slider-container');
  if (sliderContainer) {
    sliderContainer.addEventListener('mouseenter', () => {
      clearInterval(autoSlideInterval);
    });
    
    sliderContainer.addEventListener('mouseleave', () => {
      autoSlideInterval = setInterval(() => {
        goToSlide(currentSlide + 1);
      }, 5000);
    });
  }
}

// Initialize filter functionality
function initializeFilters() {
  const filterChips = document.querySelectorAll('.filter-chip');
  
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      // If already active and it's not the "All" filter, do nothing
      if (chip.classList.contains('active') && chip.textContent !== 'All') {
        return;
      }
      
      // If it's the "All" filter, deactivate all others
      if (chip.textContent === 'All') {
        filterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
      } else {
        // Remove active from "All" filter
        document.querySelector('.filter-chip.active[textContent="All"]')?.classList.remove('active');
        
        // Toggle active on this chip
        chip.classList.toggle('active');
        
        // If no filters are active, activate "All"
        const activeFilters = document.querySelectorAll('.filter-chip.active');
        if (activeFilters.length === 0) {
          document.querySelector('.filter-chip:first-child').classList.add('active');
        }
      }
      
      // Apply Filter Effect
      applyFilters();
    });
  });
  
  // Sort select
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      applyFilters();
    });
  }
}

// Apply filters to game cards
function applyFilters() {
  // Get active filters
  const activeFilters = Array.from(document.querySelectorAll('.filter-chip.active'))
    .map(chip => chip.textContent.trim().toLowerCase());
  
  // Get sort option
  const sortValue = document.getElementById('sort-select')?.value || 'popularity';
  
  // Simulate loading state
  const gameCards = document.querySelectorAll('.game-card');
  gameCards.forEach(card => {
    card.style.opacity = '0.5';
    card.style.transform = 'scale(0.95)';
    card.style.transition = 'all 0.3s ease';
  });
  
  // Simulate processing time
  setTimeout(() => {
    // Apply filters and restore opacity
    gameCards.forEach(card => {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
      
      // We're not actually filtering the cards in this demo,
      // but this is where we would hide/show cards based on filters
    });
    
    // Show a toast message
    let message;
    if (activeFilters.includes('all')) {
      message = `Showing all games, sorted by ${sortValue}`;
    } else {
      message = `Showing ${activeFilters.join(', ')} games, sorted by ${sortValue}`;
    }
    
    showToast(message);
  }, 500);
}

// Initialize search functionality
function initializeSearch() {
  const searchInput = document.querySelector('.search-bar input');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(function() {
      if (this.value.length > 2) {
        // Simulate search
        const gameCards = document.querySelectorAll('.game-card');
        gameCards.forEach(card => {
          card.style.opacity = '0.5';
        });
        
        setTimeout(() => {
          gameCards.forEach(card => {
            card.style.opacity = '1';
          });
          
          showToast(`Searching for: "${this.value}"`);
        }, 500);
      }
    }, 300));
  }
}

// Initialize game card actions
function initializeGameActions() {
  // Connect buttons
  document.querySelectorAll('.game-actions .btn-primary').forEach(button => {
    button.addEventListener('click', function() {
      const gameCard = this.closest('.game-card');
      const gameName = gameCard.querySelector('h3').textContent;
      
      if (button.textContent.includes('Connect')) {
        // Simulate connecting
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
        
        setTimeout(() => {
          // Success connection
          gameCard.classList.add('connected');
          
          // Add connected badge if it doesn't exist
          if (!gameCard.querySelector('.connected-badge')) {
            const badge = document.createElement('div');
            badge.className = 'connected-badge';
            badge.innerHTML = '<i class="fas fa-link"></i> Connected';
            gameCard.querySelector('.game-image').appendChild(badge);
          }
          
          // Update buttons
          this.textContent = 'View Stats';
          gameCard.querySelector('.btn-outline').textContent = 'Disconnect';
          
          showToast(`Successfully connected to ${gameName}`, 'success');
        }, 1500);
      } else if (button.textContent.includes('View Stats')) {
        // Navigate to stats
        window.location.href = 'dashboard.html';
      }
    });
  });
  
  // Details / Disconnect buttons
  document.querySelectorAll('.game-actions .btn-outline').forEach(button => {
    button.addEventListener('click', function() {
      const gameCard = this.closest('.game-card');
      const gameName = gameCard.querySelector('h3').textContent;
      
      if (button.textContent.includes('Details')) {
        // Show game details
        showGameDetails(gameName);
      } else if (button.textContent.includes('Disconnect')) {
        // Simulate disconnecting
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Disconnecting...';
        
        setTimeout(() => {
          // Success disconnection
          gameCard.classList.remove('connected');
          
          // Remove connected badge
          gameCard.querySelector('.connected-badge')?.remove();
          
          // Update buttons
          gameCard.querySelector('.btn-primary').textContent = 'Connect';
          this.textContent = 'Details';
          
          showToast(`Disconnected from ${gameName}`, 'info');
        }, 1000);
      }
    });
  });
  
  // Featured game buttons
  document.querySelector('.featured-buttons .btn-primary')?.addEventListener('click', () => {
    window.location.href = 'dashboard.html';
  });
  
  document.querySelector('.featured-buttons .btn-outline')?.addEventListener('click', () => {
    showToast('Connecting to Rocket League account...', 'info');
    
    setTimeout(() => {
      showToast('Successfully connected to Rocket League!', 'success');
      
      // Update the game card for Rocket League
      const rocketLeagueCard = Array.from(document.querySelectorAll('.game-card')).find(
        card => card.querySelector('h3').textContent.includes('Rocket League')
      );
      
      if (rocketLeagueCard && !rocketLeagueCard.classList.contains('connected')) {
        rocketLeagueCard.classList.add('connected');
        
        // Add connected badge if it doesn't exist
        if (!rocketLeagueCard.querySelector('.connected-badge')) {
          const badge = document.createElement('div');
          badge.className = 'connected-badge';
          badge.innerHTML = '<i class="fas fa-link"></i> Connected';
          rocketLeagueCard.querySelector('.game-image').appendChild(badge);
        }
        
        // Update buttons
        rocketLeagueCard.querySelector('.btn-primary').textContent = 'View Stats';
        rocketLeagueCard.querySelector('.btn-outline').textContent = 'Disconnect';
      }
    }, 2000);
  });
}

// Initialize load more functionality
function initializeLoadMore() {
  const loadMoreButton = document.querySelector('.load-more .btn');
  if (loadMoreButton) {
    loadMoreButton.addEventListener('click', () => {
      loadMoreButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
      
      // Simulate loading more games
      setTimeout(() => {
        loadMoreButton.textContent = 'Load More Games';
        showToast('No more games available in this category', 'info');
      }, 1500);
    });
  }
}

// Show game details popup
function showGameDetails(gameName) {
  showToast(`Showing details for ${gameName}`, 'info');
  
  // In a real implementation, this would open a modal with detailed game information
}

// Debounce function for search
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