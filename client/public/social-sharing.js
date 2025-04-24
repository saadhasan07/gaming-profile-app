/**
 * Social Sharing Functionality
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('Social sharing functionality loaded');
  
  // Initialize share overlay
  initializeShareOverlay();
  
  // Add share buttons to achievements
  addShareButtonsToAchievements();
});

// Create and initialize the share overlay
function initializeShareOverlay() {
  console.log('Initializing social sharing features');
  
  // Track share view events for analytics
  window.addEventListener('shareViewEvent', function(e) {
    console.log('Share view event triggered', e.detail);
    // In a real app, we would send this to the analytics server
  });
  
  // Create share overlay HTML structure if it doesn't exist
  if (!document.querySelector('.share-overlay')) {
    const shareOverlay = document.createElement('div');
    shareOverlay.className = 'share-overlay';
    shareOverlay.innerHTML = `
      <div class="share-container">
        <button class="share-close">&times;</button>
        <div class="share-header">
          <h2>Share Achievement</h2>
          <p>Share your gaming achievement with friends and the gaming community</p>
        </div>
        <div class="achievement-preview">
          <div class="achievement-info">
            <div class="achievement-icon">
              <i class="fas fa-trophy"></i>
            </div>
            <div class="achievement-details">
              <h3>Achievement Name</h3>
              <p>Game Title</p>
            </div>
          </div>
          <div class="achievement-meta">
            <div class="achievement-date">Unlocked: Just now</div>
            <div class="achievement-rarity">
              <div class="rarity-indicator rarity-rare"></div>
              <span>Rare (12% of players)</span>
            </div>
          </div>
        </div>
        <div class="share-message">
          <label for="share-text">Share Message</label>
          <textarea id="share-text" placeholder="I just unlocked this achievement! #gaming #achievement"></textarea>
        </div>
        <div class="share-platforms">
          <button class="platform-button twitter" data-platform="twitter">
            <i class="fab fa-twitter"></i>
          </button>
          <button class="platform-button facebook" data-platform="facebook">
            <i class="fab fa-facebook-f"></i>
          </button>
          <button class="platform-button discord" data-platform="discord">
            <i class="fab fa-discord"></i>
          </button>
          <button class="platform-button reddit" data-platform="reddit">
            <i class="fab fa-reddit-alien"></i>
          </button>
        </div>
        <div class="share-options">
          <div class="share-option">
            <input type="checkbox" id="include-stats" checked>
            <label for="include-stats">Include my stats</label>
          </div>
          <div class="share-option">
            <input type="checkbox" id="notify-friends" checked>
            <label for="notify-friends">Notify my friends</label>
          </div>
        </div>
        <div class="share-actions">
          <button class="btn btn-primary" id="generate-link-btn">Generate Share Link</button>
          <button class="btn btn-outline" id="cancel-share-btn">Cancel</button>
        </div>
        <div class="share-link-container">
          <p>Copy this link to share your achievement directly:</p>
          <div class="share-link-field">
            <input type="text" class="share-link-input" value="https://gamevault.com/achievement/12345" readonly>
            <button class="copy-link-button">Copy</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(shareOverlay);
    
    // Add event listeners for share overlay
    const closeBtn = shareOverlay.querySelector('.share-close');
    const cancelBtn = shareOverlay.querySelector('#cancel-share-btn');
    const generateLinkBtn = shareOverlay.querySelector('#generate-link-btn');
    const copyLinkBtn = shareOverlay.querySelector('.copy-link-button');
    const platformButtons = shareOverlay.querySelectorAll('.platform-button');
    
    // Close button event
    closeBtn.addEventListener('click', () => {
      hideShareOverlay();
    });
    
    // Cancel button event
    cancelBtn.addEventListener('click', () => {
      hideShareOverlay();
    });
    
    // Click outside to close
    shareOverlay.addEventListener('click', (e) => {
      if (e.target === shareOverlay) {
        hideShareOverlay();
      }
    });
    
    // Generate share link button
    generateLinkBtn.addEventListener('click', () => {
      const linkContainer = shareOverlay.querySelector('.share-link-container');
      linkContainer.classList.add('active');
      generateLinkBtn.textContent = 'Link Generated!';
      setTimeout(() => {
        generateLinkBtn.textContent = 'Generate Share Link';
      }, 2000);
    });
    
    // Copy link button
    copyLinkBtn.addEventListener('click', () => {
      const linkInput = shareOverlay.querySelector('.share-link-input');
      linkInput.select();
      document.execCommand('copy');
      
      copyLinkBtn.textContent = 'Copied!';
      copyLinkBtn.classList.add('copy-success');
      
      setTimeout(() => {
        copyLinkBtn.textContent = 'Copy';
        copyLinkBtn.classList.remove('copy-success');
      }, 2000);
    });
    
    // Platform share buttons
    platformButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const platform = btn.dataset.platform;
        const message = document.getElementById('share-text').value;
        const achievement = document.querySelector('.achievement-details h3').textContent;
        
        shareToSocialMedia(platform, message, achievement);
      });
    });
  }
}

// Add share buttons to achievement cards
function addShareButtonsToAchievements() {
  // Find all achievement items on the dashboard
  const achievementItems = document.querySelectorAll('.achievement-item');
  
  achievementItems.forEach(item => {
    // Check if a share button already exists
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
        
        // Show share overlay with this achievement
        showShareOverlay(achievementName, gameName, rarity, icon);
      });
      
      // Add button to the achievement item
      item.style.position = 'relative'; // Ensure item is positioned
      item.appendChild(shareButton);
    }
  });
}

// Show share overlay with specific achievement info
function showShareOverlay(achievementName, gameName, rarity, iconClass) {
  const shareOverlay = document.querySelector('.share-overlay');
  
  if (shareOverlay) {
    // Update achievement information
    const achievementTitle = shareOverlay.querySelector('.achievement-details h3');
    const gameTitle = shareOverlay.querySelector('.achievement-details p');
    const achievementIcon = shareOverlay.querySelector('.achievement-icon i');
    const shareTextarea = shareOverlay.querySelector('#share-text');
    const rarityIndicator = shareOverlay.querySelector('.achievement-rarity');
    
    // Set achievement info
    achievementTitle.textContent = achievementName;
    gameTitle.textContent = gameName;
    achievementIcon.className = iconClass || 'fas fa-trophy';
    
    // Set appropriate rarity indicator color based on rarity text
    let rarityClass = 'rarity-common';
    if (rarity) {
      if (rarity.toLowerCase().includes('rare')) rarityClass = 'rarity-rare';
      else if (rarity.toLowerCase().includes('uncommon')) rarityClass = 'rarity-uncommon';
      else if (rarity.toLowerCase().includes('epic')) rarityClass = 'rarity-epic';
      else if (rarity.toLowerCase().includes('legendary')) rarityClass = 'rarity-legendary';
    }
    
    // Set default share text with hashtags
    const hashtags = generateHashtags(gameName, achievementName);
    shareTextarea.value = `I just unlocked the "${achievementName}" achievement in ${gameName}! ${hashtags}`;
    
    // Update rarity info if available
    if (rarity) {
      rarityIndicator.innerHTML = `
        <div class="rarity-indicator ${rarityClass}"></div>
        <span>${rarity}</span>
      `;
    }
    
    // Reset the link container
    const linkContainer = shareOverlay.querySelector('.share-link-container');
    linkContainer.classList.remove('active');
    
    // Reset the generate link button
    const generateLinkBtn = shareOverlay.querySelector('#generate-link-btn');
    generateLinkBtn.textContent = 'Generate Share Link';
    
    // Show overlay with a slight animation delay
    setTimeout(() => {
      shareOverlay.classList.add('active');
    }, 10);
    
    // Dispatch event for analytics tracking
    window.dispatchEvent(new CustomEvent('shareViewEvent', { 
      detail: {
        achievement: achievementName,
        game: gameName,
        rarity: rarity,
        timestamp: new Date().toISOString()
      }
    }));
  }
}

// Generate appropriate hashtags based on game and achievement
function generateHashtags(gameName, achievementName) {
  let hashtags = '#gaming #achievement';
  
  // Add game-specific hashtag
  const gameTag = gameName.replace(/[^a-zA-Z0-9]/g, '');
  if (gameTag) {
    hashtags += ` #${gameTag}`;
  }
  
  // Add achievement type hashtag if relevant
  if (achievementName.toLowerCase().includes('win') || 
      achievementName.toLowerCase().includes('victory')) {
    hashtags += ' #winner';
  } else if (achievementName.toLowerCase().includes('first') || 
             achievementName.toLowerCase().includes('beginner')) {
    hashtags += ' #milestone';
  } else if (achievementName.toLowerCase().includes('master') || 
             achievementName.toLowerCase().includes('expert')) {
    hashtags += ' #mastery';
  }
  
  return hashtags;
}

// Hide share overlay
function hideShareOverlay() {
  const shareOverlay = document.querySelector('.share-overlay');
  if (shareOverlay) {
    shareOverlay.classList.remove('active');
  }
}

// Share to social media platforms
function shareToSocialMedia(platform, message, achievement) {
  const shareUrl = encodeURIComponent(`https://gamevault.com/share/achievement`);
  const shareText = encodeURIComponent(`${message}`);
  const shareTitle = encodeURIComponent(`Gaming Achievement: ${achievement}`);
  
  // First log the share to our backend API
  logShareEvent(platform, message, achievement)
    .then(data => {
      // Use the custom generated URL if available
      const customShareUrl = data && data.shareData ? 
        encodeURIComponent(data.shareData.shareUrl) : shareUrl;
      
      let shareWindow;
      
      switch (platform) {
        case 'twitter':
          shareWindow = window.open(`https://twitter.com/intent/tweet?text=${shareText}&url=${customShareUrl}`, '_blank');
          break;
        case 'facebook':
          shareWindow = window.open(`https://www.facebook.com/sharer/sharer.php?u=${customShareUrl}&quote=${shareText}`, '_blank');
          break;
        case 'discord':
          // Show a toast since Discord sharing typically requires their SDK integration
          showToast('Discord sharing would be implemented using their SDK', 'info');
          break;
        case 'reddit':
          shareWindow = window.open(`https://www.reddit.com/submit?url=${customShareUrl}&title=${shareTitle}`, '_blank');
          break;
      }
      
      // Show toast notification
      showToast(`Sharing to ${platform}...`, 'success');
      
      // Focus the share window if opened
      if (shareWindow) {
        shareWindow.focus();
      }
    })
    .catch(error => {
      console.error('Error logging share event:', error);
      // Continue with sharing even if logging fails
      let shareWindow;
      
      switch (platform) {
        case 'twitter':
          shareWindow = window.open(`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`, '_blank');
          break;
        case 'facebook':
          shareWindow = window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${shareText}`, '_blank');
          break;
        case 'discord':
          // Show a toast since Discord sharing typically requires their SDK integration
          showToast('Discord sharing would be implemented using their SDK', 'info');
          break;
        case 'reddit':
          shareWindow = window.open(`https://www.reddit.com/submit?url=${shareUrl}&title=${shareTitle}`, '_blank');
          break;
      }
      
      // Show toast notification
      showToast(`Sharing to ${platform}...`, 'success');
      
      // Focus the share window if opened
      if (shareWindow) {
        shareWindow.focus();
      }
    });
}

// Log the share event to our backend API
async function logShareEvent(platform, message, achievement) {
  try {
    // In a production app, this would be a real API call
    // For demo purposes, we're just simulating a successful response
    
    // Uncomment the following code when the API endpoint is available
    /*
    const response = await fetch('/api/sharing/achievement', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        achievementName: achievement,
        gameName: document.querySelector('.achievement-details p')?.textContent || 'Unknown Game',
        platform,
        message
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to log share event');
    }
    
    return await response.json();
    */
    
    // Simulated response for demo purposes
    return {
      success: true,
      shareData: {
        id: Math.floor(Math.random() * 10000),
        timestamp: new Date().toISOString(),
        achievementName: achievement,
        gameName: document.querySelector('.achievement-details p')?.textContent || 'Unknown Game',
        platform,
        message,
        shareUrl: `https://gamevault.com/share/${Math.floor(Math.random() * 1000000)}`
      }
    };
  } catch (error) {
    console.error('Error logging share event:', error);
    throw error;
  }
}

// Toast notification function
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