/**
 * Deployment Pipeline Visualizer
 * 
 * This script handles the interactive deployment visualizer
 * that shows a CI/CD pipeline in action
 */

document.addEventListener('DOMContentLoaded', () => {
  initDeploymentVisualizer();
});

function initDeploymentVisualizer() {
  // Get control elements
  const startButton = document.getElementById('start-deployment');
  const resetButton = document.getElementById('reset-deployment');
  const speedControl = document.getElementById('pipeline-speed');
  const speedValue = document.getElementById('speed-value');
  
  if (!startButton || !resetButton || !speedControl || !speedValue) return;
  
  // Animation variables
  let animationSpeed = 1;
  let deploymentInProgress = false;
  let deploymentTimer = null;
  let deploymentStartTime = 0;
  
  // Set up event listeners
  startButton.addEventListener('click', () => {
    if (deploymentInProgress) return;
    
    deploymentInProgress = true;
    deploymentStartTime = Date.now();
    
    // Update UI
    startButton.disabled = true;
    resetButton.disabled = false;
    document.getElementById('deployment-status-text').textContent = 'Deployment in progress';
    
    // Start the timer
    startDeploymentTimer();
    
    // Start the pipeline animation
    runPipelineStage('commit');
  });
  
  resetButton.addEventListener('click', () => {
    resetDeployment();
  });
  
  // Speed control
  speedControl.addEventListener('input', (e) => {
    animationSpeed = parseFloat(e.target.value);
    speedValue.textContent = `${animationSpeed}x`;
  });
  
  function startDeploymentTimer() {
    if (deploymentTimer) {
      clearInterval(deploymentTimer);
    }
    
    const timeDisplay = document.getElementById('deployment-time-elapsed');
    
    deploymentTimer = setInterval(() => {
      const elapsedTime = Math.floor((Date.now() - deploymentStartTime) / 1000);
      const minutes = Math.floor(elapsedTime / 60).toString().padStart(2, '0');
      const seconds = (elapsedTime % 60).toString().padStart(2, '0');
      timeDisplay.textContent = `${minutes}:${seconds}`;
    }, 1000);
  }
  
  function runPipelineStage(stageName) {
    const stageElement = document.querySelector(`.pipeline-stage[data-stage="${stageName}"]`);
    
    if (!stageElement) return;
    
    // Activate stage
    stageElement.classList.add('active');
    
    // Update status
    const statusIndicator = stageElement.querySelector('.status-indicator');
    const statusText = stageElement.querySelector('.status-text');
    
    if (statusIndicator) {
      statusIndicator.className = 'status-indicator in-progress';
    }
    if (statusText) {
      statusText.textContent = 'In Progress';
    }
    
    // Stage-specific animations
    switch (stageName) {
      case 'commit':
        runCommitStage(stageElement);
        break;
      case 'build':
        runBuildStage(stageElement);
        break;
      case 'test':
        runTestStage(stageElement);
        break;
      case 'deploy':
        runDeployStage(stageElement);
        break;
      case 'monitor':
        runMonitorStage(stageElement);
        break;
    }
  }
  
  function completeStage(stageName) {
    const stageElement = document.querySelector(`.pipeline-stage[data-stage="${stageName}"]`);
    
    if (!stageElement) return;
    
    // Mark stage as completed
    stageElement.classList.remove('active');
    stageElement.classList.add('completed');
    
    // Update status
    const statusIndicator = stageElement.querySelector('.status-indicator');
    const statusText = stageElement.querySelector('.status-text');
    
    if (statusIndicator) {
      statusIndicator.className = 'status-indicator completed';
    }
    if (statusText) {
      statusText.textContent = 'Completed';
    }
    
    // Activate connector to next stage
    const connector = stageElement.nextElementSibling;
    if (connector && connector.classList.contains('pipeline-connector')) {
      connector.classList.add('active');
      
      // Get the next stage
      const nextStage = connector.nextElementSibling;
      if (nextStage && nextStage.classList.contains('pipeline-stage')) {
        const nextStageName = nextStage.getAttribute('data-stage');
        
        // Start the next stage after a delay
        setTimeout(() => {
          runPipelineStage(nextStageName);
        }, 1000 / animationSpeed);
      } else {
        // No more stages, deployment complete
        deploymentComplete();
      }
    } else {
      // No more stages, deployment complete
      deploymentComplete();
    }
  }
  
  function deploymentComplete() {
    deploymentInProgress = false;
    document.getElementById('deployment-status-text').textContent = 'Deployment completed successfully';
  }
  
  function resetDeployment() {
    deploymentInProgress = false;
    
    // Clear the timer
    clearInterval(deploymentTimer);
    
    // Reset UI
    startButton.disabled = false;
    resetButton.disabled = true;
    document.getElementById('deployment-status-text').textContent = 'Ready to deploy';
    document.getElementById('deployment-time-elapsed').textContent = '00:00';
    
    // Reset all stages
    document.querySelectorAll('.pipeline-stage').forEach(stage => {
      stage.classList.remove('active', 'completed');
      
      // Reset status indicators
      const statusIndicator = stage.querySelector('.status-indicator');
      const statusText = stage.querySelector('.status-text');
      if (statusIndicator) {
        statusIndicator.className = 'status-indicator';
      }
      if (statusText) {
        statusText.textContent = 'Waiting';
      }
    });
    
    // Reset connectors
    document.querySelectorAll('.pipeline-connector').forEach(connector => {
      connector.classList.remove('active');
    });
    
    // Reset build terminal
    const buildSuccessLine = document.querySelector('.terminal-line.success');
    if (buildSuccessLine) {
      buildSuccessLine.classList.add('hidden');
    }
    
    // Reset tests
    document.querySelectorAll('.test-case').forEach(testCase => {
      const testIcon = testCase.querySelector('.test-icon');
      if (testIcon) {
        testIcon.textContent = '⏱️';
      }
    });
    document.querySelectorAll('.test-suite-count').forEach(count => {
      count.textContent = count.textContent.split('/')[1] === '3' ? '0/3' : '0/2';
    });
    
    // Reset servers
    document.querySelectorAll('.server').forEach(server => {
      const progressFill = server.querySelector('.progress-fill');
      const serverStatus = server.querySelector('.server-status');
      if (progressFill) {
        progressFill.style.width = '0%';
      }
      if (serverStatus) {
        serverStatus.textContent = 'Waiting';
      }
    });
    
    // Reset monitoring charts
    document.querySelectorAll('.metric-value').forEach(value => {
      value.textContent = value.textContent.includes('ms') ? '-- ms' : 
                         value.textContent.includes('%') ? '--%' : '-- users';
    });
  }
  
  // Stage-specific animation functions
  function runCommitStage(stageElement) {
    // Highlight code changes with animation
    const codeLines = stageElement.querySelectorAll('.code-block span');
    
    codeLines.forEach((line, index) => {
      setTimeout(() => {
        line.style.opacity = '1';
        
        // When all lines are visible, complete the stage
        if (index === codeLines.length - 1) {
          setTimeout(() => {
            completeStage('commit');
          }, 1000 / animationSpeed);
        }
      }, 300 * index / animationSpeed);
    });
  }
  
  function runBuildStage(stageElement) {
    const terminalLines = stageElement.querySelectorAll('.terminal-line:not(.success)');
    const successLine = stageElement.querySelector('.terminal-line.success');
    
    // Animate terminal lines appearing one by one
    terminalLines.forEach((line, index) => {
      setTimeout(() => {
        line.classList.add('active');
        
        // When all lines are done, show success message and complete stage
        if (index === terminalLines.length - 1) {
          setTimeout(() => {
            if (successLine) {
              successLine.classList.remove('hidden');
            }
            
            setTimeout(() => {
              completeStage('build');
            }, 1000 / animationSpeed);
          }, 1000 / animationSpeed);
        }
      }, 800 * index / animationSpeed);
    });
  }
  
  function runTestStage(stageElement) {
    const testCases = stageElement.querySelectorAll('.test-case');
    const testSuiteCounts = stageElement.querySelectorAll('.test-suite-count');
    
    let completedTests = 0;
    const totalTests = testCases.length;
    
    // Run each test one by one
    testCases.forEach((testCase, index) => {
      setTimeout(() => {
        const testIcon = testCase.querySelector('.test-icon');
        if (!testIcon) return;
        
        // Simulate running test
        testIcon.textContent = '🔄';
        
        // After a delay, complete the test
        setTimeout(() => {
          // 95% chance of test success
          const success = Math.random() > 0.05;
          
          if (success) {
            testIcon.textContent = '✅';
          } else {
            testIcon.textContent = '❌';
          }
          
          completedTests++;
          
          // Update test suite counts
          updateTestSuiteCounts(testSuiteCounts, completedTests);
          
          // If all tests are done, complete stage
          if (completedTests === totalTests) {
            setTimeout(() => {
              completeStage('test');
            }, 1000 / animationSpeed);
          }
        }, 1500 / animationSpeed);
      }, 1000 * index / animationSpeed);
    });
  }
  
  function updateTestSuiteCounts(countElements, completedTests) {
    // Update test suite counts
    if (countElements.length >= 2) {
      // First suite has 3 tests
      if (completedTests <= 3) {
        countElements[0].textContent = `${completedTests}/3`;
        countElements[1].textContent = `0/2`;
      } else {
        // Move to second suite
        countElements[0].textContent = `3/3`;
        countElements[1].textContent = `${completedTests - 3}/2`;
      }
    }
  }
  
  function runDeployStage(stageElement) {
    const servers = stageElement.querySelectorAll('.server');
    
    // Deploy to staging first, then production
    servers.forEach((server, index) => {
      setTimeout(() => {
        deployToServer(server, () => {
          // If this is the last server, complete the stage
          if (index === servers.length - 1) {
            setTimeout(() => {
              completeStage('deploy');
            }, 1000 / animationSpeed);
          }
        });
      }, 2000 * index / animationSpeed);
    });
  }
  
  function deployToServer(serverElement, callback) {
    const progressFill = serverElement.querySelector('.progress-fill');
    const serverStatus = serverElement.querySelector('.server-status');
    
    if (!progressFill || !serverStatus) return;
    
    // Update status
    serverStatus.textContent = 'Deploying...';
    
    // Animate progress bar
    let progress = 0;
    const interval = setInterval(() => {
      progress += 2;
      progressFill.style.width = `${progress}%`;
      
      if (progress >= 100) {
        clearInterval(interval);
        serverStatus.textContent = 'Deployed';
        if (callback) callback();
      }
    }, 50 / animationSpeed);
  }
  
  function runMonitorStage(stageElement) {
    // Set initial values for metrics
    const metricValues = stageElement.querySelectorAll('.metric-value');
    
    if (metricValues.length >= 3) {
      metricValues[0].textContent = '120 ms';
      metricValues[1].textContent = '0.2%';
      metricValues[2].textContent = '42 users';
    }
    
    // Simulate changing metrics
    let updateCount = 0;
    const metricsInterval = setInterval(() => {
      if (metricValues.length >= 3) {
        // Fluctuate response time between 100-130ms
        const responseTime = 100 + Math.floor(Math.random() * 30);
        metricValues[0].textContent = `${responseTime} ms`;
        
        // Fluctuate error rate between 0.1-0.3%
        const errorRate = (0.1 + Math.random() * 0.2).toFixed(1);
        metricValues[1].textContent = `${errorRate}%`;
        
        // Steadily increase users from 42 to 50
        const users = 42 + Math.min(8, Math.floor(updateCount / 2));
        metricValues[2].textContent = `${users} users`;
      }
      
      updateCount++;
      
      // Stop after 10 updates and complete stage
      if (updateCount >= 10) {
        clearInterval(metricsInterval);
        completeStage('monitor');
      }
    }, 500 / animationSpeed);
  }
}