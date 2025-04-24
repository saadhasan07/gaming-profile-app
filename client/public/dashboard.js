/**
 * Dashboard JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('Dashboard loaded');
  
  // Set up navigation
  setupNavigation();
  
  // Set up charts
  setupCharts();
  
  // Set up interactivity
  setupInteractivity();
  
  // Set up achievement sharing
  setupAchievementSharing();
});

// Navigation setup
function setupNavigation() {
  // Handle logout click
  document.getElementById('logout-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    
    if (confirm('Are you sure you want to log out?')) {
      window.location.href = 'index.html';
    }
  });
}

// Charts setup
function setupCharts() {
  // Performance chart
  const performanceCtx = document.getElementById('performanceChart')?.getContext('2d');
  
  if (performanceCtx) {
    const gradientFill = performanceCtx.createLinearGradient(0, 0, 0, 300);
    gradientFill.addColorStop(0, 'rgba(0, 255, 170, 0.3)');
    gradientFill.addColorStop(1, 'rgba(0, 255, 170, 0.02)');
    
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
    
    new Chart(performanceCtx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'K/D Ratio',
          data: [1.2, 1.4, 1.3, 1.5, 1.8, 1.7, 2.1],
          borderColor: '#00ffaa',
          backgroundColor: gradientFill,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#00ffaa',
          pointBorderColor: '#00ffaa',
          pointRadius: 4,
          pointHoverRadius: 6
        }, {
          label: 'Win Rate %',
          data: [35, 42, 38, 45, 52, 48, 55],
          borderColor: '#a64aff',
          borderDash: [5, 5],
          tension: 0.4,
          fill: false,
          pointBackgroundColor: '#a64aff',
          pointBorderColor: '#a64aff',
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#9999aa',
              font: {
                family: "'Roboto', sans-serif",
                size: 12
              },
              boxWidth: 15,
              usePointStyle: true
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#cccccc',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: '#9999aa'
            }
          },
          y: {
            grid: {
              color: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: '#9999aa'
            }
          }
        }
      }
    });
  }
}

// Interactivity setup
function setupInteractivity() {
  // Refresh button
  const refreshButton = document.querySelector('.refresh-button');
  if (refreshButton) {
    refreshButton.addEventListener('click', () => {
      refreshButton.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> Refreshing...';
      
      // Simulate refresh
      setTimeout(() => {
        refreshButton.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
        
        // Show toast notification
        showToast('Data refreshed successfully!');
      }, 1500);
    });
  }
  
  // Date range dropdown
  const dateRange = document.querySelector('.date-range');
  if (dateRange) {
    dateRange.addEventListener('click', () => {
      const options = ['Last 7 days', 'Last 30 days', 'Last 90 days', 'This year', 'All time'];
      const currentValue = dateRange.querySelector('span').textContent;
      
      // Create popup menu
      const menu = document.createElement('div');
      menu.className = 'date-range-menu';
      menu.style.position = 'absolute';
      menu.style.top = `${dateRange.offsetTop + dateRange.offsetHeight + 5}px`;
      menu.style.right = '20px';
      menu.style.backgroundColor = 'var(--card-bg)';
      menu.style.borderRadius = '8px';
      menu.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.5)';
      menu.style.zIndex = '100';
      
      options.forEach(option => {
        const item = document.createElement('div');
        item.className = 'date-range-item';
        item.textContent = option;
        item.style.padding = '0.8rem 1.5rem';
        item.style.cursor = 'pointer';
        item.style.transition = 'background-color 0.2s';
        
        if (option === currentValue) {
          item.style.color = 'var(--primary-color)';
          item.style.fontWeight = '500';
        } else {
          item.style.color = 'var(--text-secondary)';
        }
        
        item.addEventListener('mouseover', () => {
          item.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
        });
        
        item.addEventListener('mouseout', () => {
          item.style.backgroundColor = 'transparent';
        });
        
        item.addEventListener('click', () => {
          dateRange.querySelector('span').textContent = option;
          document.body.removeChild(menu);
          
          // Simulate data reload
          const refreshButton = document.querySelector('.refresh-button');
          if (refreshButton) {
            refreshButton.click();
          }
        });
        
        menu.appendChild(item);
      });
      
      // Add menu to body
      document.body.appendChild(menu);
      
      // Click outside to close
      const closeMenu = (e) => {
        if (!menu.contains(e.target) && !dateRange.contains(e.target)) {
          document.body.removeChild(menu);
          document.removeEventListener('click', closeMenu);
        }
      };
      
      // Use setTimeout to avoid triggering the event immediately
      setTimeout(() => {
        document.addEventListener('click', closeMenu);
      }, 0);
    });
  }
  
  // Game filter dropdown
  const gameFilter = document.getElementById('game-filter');
  if (gameFilter) {
    gameFilter.addEventListener('change', () => {
      // Simulate data reload
      const refreshButton = document.querySelector('.refresh-button');
      if (refreshButton) {
        refreshButton.click();
      }
    });
  }
  
  // Friend buttons
  document.querySelectorAll('.friend-actions .btn').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      
      const action = button.textContent.trim();
      const friendName = button.closest('.friend-item').querySelector('h3').textContent;
      
      if (action === 'Join') {
        showToast(`Joining ${friendName}'s game...`);
        
        // Simulate joining game
        setTimeout(() => {
          showToast('Game launched successfully!', 'success');
        }, 2000);
      } else if (action === 'Message') {
        showToast(`Opening chat with ${friendName}...`);
      }
    });
  });
}

// Set up achievement sharing
function setupAchievementSharing() {
  // Add share buttons to achievement items if not already added by the social-sharing.js
  const achievementItems = document.querySelectorAll('.achievement-item');
  if (achievementItems.length > 0 && !document.querySelector('.share-achievement-button')) {
    achievementItems.forEach(item => {
      // Only add if not already exists
      if (!item.querySelector('.share-achievement-button')) {
        // Create share button
        const shareButton = document.createElement('button');
        shareButton.className = 'share-achievement-button';
        shareButton.innerHTML = '<i class="fas fa-share-alt"></i>';
        shareButton.setAttribute('aria-label', 'Share achievement');
        
        // Add click event listener
        shareButton.addEventListener('click', (e) => {
          e.stopPropagation(); // Prevent click from bubbling to parent
          
          // Get achievement info
          const achievementName = item.querySelector('h3').textContent;
          const gameName = item.querySelector('p').textContent;
          const rarity = item.querySelector('.achievement-rarity').textContent;
          const icon = item.querySelector('.achievement-icon i').className;
          
          // Show share overlay with this achievement info
          if (typeof showShareOverlay === 'function') {
            showShareOverlay(achievementName, gameName, rarity, icon);
          } else {
            console.error('showShareOverlay function not available');
            showToast('Sharing functionality is loading...', 'info');
          }
        });
        
        // Add button to the achievement item
        item.style.position = 'relative'; // Ensure item is positioned
        item.appendChild(shareButton);
      }
    });
  }
  
  // Add click listener to "View All" in achievements section
  document.querySelector('.achievement-showcase .view-all')?.addEventListener('click', function(e) {
    e.preventDefault();
    showToast('Loading all achievements...', 'info');
  });
}

// Toast notification
function showToast(message, type = 'info') {
  // Create toast element
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.style.position = 'fixed';
  toast.style.bottom = '20px';
  toast.style.right = '20px';
  toast.style.padding = '1rem 1.5rem';
  toast.style.borderRadius = '8px';
  toast.style.backgroundColor = 'var(--card-bg)';
  toast.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.4)';
  toast.style.color = 'var(--text-color)';
  toast.style.zIndex = '9999';
  toast.style.display = 'flex';
  toast.style.alignItems = 'center';
  toast.style.gap = '0.5rem';
  toast.style.animation = 'slide-in 0.3s ease forwards';
  
  // Icon based on type
  let icon;
  switch(type) {
    case 'success':
      icon = 'fas fa-check-circle';
      toast.style.borderLeft = '4px solid var(--success-color)';
      break;
    case 'error':
      icon = 'fas fa-exclamation-circle';
      toast.style.borderLeft = '4px solid var(--danger-color)';
      break;
    case 'warning':
      icon = 'fas fa-exclamation-triangle';
      toast.style.borderLeft = '4px solid var(--warning-color)';
      break;
    default:
      icon = 'fas fa-info-circle';
      toast.style.borderLeft = '4px solid var(--primary-color)';
  }
  
  // Add content
  toast.innerHTML = `
    <i class="${icon}"></i>
    <span>${message}</span>
  `;
  
  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slide-in {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slide-out {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
  
  // Add to document
  document.body.appendChild(toast);
  
  // Auto dismiss
  setTimeout(() => {
    toast.style.animation = 'slide-out 0.3s ease forwards';
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
  
  // Click to dismiss
  toast.addEventListener('click', () => {
    toast.style.animation = 'slide-out 0.3s ease forwards';
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  });
}