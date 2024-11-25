// Add this at the very top of script.js
window.onload = function() {
    // Check if we're in dark mode
    if (document.documentElement.getAttribute('data-theme') === 'dark') {
        // Force white color for these elements
        document.getElementById('date').style.color = '#FFFFFF';
        document.getElementById('time').style.color = '#FFFFFF';
        document.querySelector('.battery-percent').style.color = '#FFFFFF';
        
        // Update SVGs
        document.querySelector('.wifi-icon img').src = './assets/wifiwhite.svg';
        
        // Update battery icon (it will use white version)
        updateBattery();
        
        // Also check the theme toggle
        document.getElementById('theme-toggle').checked = true;
    }
}

// Keep your existing theme toggle listener
document.getElementById('theme-toggle').addEventListener('change', function(e) {
    const isDark = e.target.checked;
    
    if (isDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.getElementById('date').style.color = '#FFFFFF';
        document.getElementById('time').style.color = '#FFFFFF';
        document.querySelector('.battery-percent').style.color = '#FFFFFF';
        document.querySelector('.wifi-icon img').src = './assets/wifiwhite.svg';
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        document.getElementById('date').style.color = '#000000';
        document.getElementById('time').style.color = '#000000';
        document.querySelector('.battery-percent').style.color = '#000000';
        document.querySelector('.wifi-icon img').src = './assets/wifi.svg';
    }
    
    // Save theme preference
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    // Update battery
    updateBattery();
});

function openWindow(id) {
  document.getElementById(`${id}-window`).style.display = 'block';
}

function closeWindow(id) {
  document.getElementById(`${id}-window`).style.display = 'none';
}

// Update clock in menu bar
function updateTime() {
  const now = new Date();
  const timeString = now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
  });
  document.getElementById('time').textContent = timeString;
}

setInterval(updateTime, 1000);
updateTime();

// Make windows draggable
document.querySelectorAll('.window').forEach(makeWindowDraggable);

function makeWindowDraggable(element) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  element.querySelector('.window-header').onmousedown = dragMouseDown;

  function dragMouseDown(e) {
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      element.style.top = (element.offsetTop - pos2) + "px";
      element.style.left = (element.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
      document.onmouseup = null;
      document.onmousemove = null;
  }
}

document.addEventListener('DOMContentLoaded', function() {
    initializeThemeToggle();
    const appIcons = document.querySelectorAll('.app-icon');
    
    // Grid configuration
    const GRID = {
        cellSize: 80,     
        spacing: 25,      
        padding: 5,       
        menuHeight: 24,   
        get totalCellSize() { return this.cellSize + this.spacing },
    };

    function snapToGrid(x, y) {
        const cellX = Math.round((x - GRID.padding) / GRID.totalCellSize) * GRID.totalCellSize + GRID.padding;
        const cellY = Math.round((y - GRID.menuHeight) / GRID.totalCellSize) * GRID.totalCellSize + GRID.menuHeight;
        return { x: cellX, y: cellY };
    }

    appIcons.forEach((icon, index) => {
        icon.setAttribute('draggable', 'true');
        
        // Set initial position
        const initialPos = {
            x: GRID.padding,
            y: GRID.menuHeight + (index * GRID.totalCellSize)
        };
        
        icon.style.position = 'absolute';
        icon.style.transform = `translate(${initialPos.x}px, ${initialPos.y}px)`;
        icon.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        
        let startX, startY;
        let currentX, currentY;
        let isDragging = false;

        icon.addEventListener('mousedown', (e) => {
            const dragToggle = document.getElementById('drag-toggle');
            
            if (dragToggle.checked) {
                // Enable dragging, disable opening
                isDragging = true;
                const rect = icon.getBoundingClientRect();
                startX = e.clientX - rect.left;
                startY = e.clientY - rect.top;
                
                // Get current position from transform
                const transform = window.getComputedStyle(icon).transform;
                const matrix = new DOMMatrix(transform);
                currentX = matrix.m41;
                currentY = matrix.m42;
                
                icon.style.transition = 'none';
            }
        });

        icon.addEventListener('dragstart', (e) => {
            e.preventDefault(); // Prevent default drag to use custom drag
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const newX = e.clientX - startX;
            const newY = e.clientY - startY;

            icon.style.transform = `translate(${newX}px, ${newY}px)`;
        });

        document.addEventListener('mouseup', (e) => {
            if (!isDragging) return;
            isDragging = false;

            // Calculate final position
            let finalX = e.clientX - startX;
            let finalY = e.clientY - startY;

            // Keep within bounds
            const maxX = window.innerWidth - icon.offsetWidth;
            const maxY = window.innerHeight - icon.offsetHeight;
            
            finalX = Math.max(0, Math.min(finalX, maxX));
            finalY = Math.max(GRID.menuHeight, Math.min(finalY, maxY));

            // Snap to grid
            const snappedPos = snapToGrid(finalX, finalY);
            
            // Re-enable transition for snapping
            icon.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            icon.style.transform = `translate(${snappedPos.x}px, ${snappedPos.y}px)`;
        });

        // Add double click handler
        icon.addEventListener('dblclick', (e) => {
            const dragToggle = document.getElementById('drag-toggle');
            
            if (!dragToggle.checked) {
                // Only open window if drag is disabled
                if (icon.querySelector('span').textContent === 'About Me') {
                    const aboutWindow = document.getElementById('about-window');
                    if (aboutWindow) {
                        aboutWindow.style.display = 'block';
                    }
                }
            }
        });
    });

    // Prevent text selection during drag
    document.addEventListener('selectstart', (e) => {
        if (e.target.closest('.app-icon')) {
            e.preventDefault();
        }
    });

    rotateWallpaper();
    updateBatteryStatus();
    // Update every minute
    setInterval(updateBatteryStatus, 60000);

    const dragToggle = document.getElementById('drag-toggle');
    const themeToggle = document.getElementById('theme-toggle');
    const dragTooltip = document.querySelector('.drag-tooltip');
    const themeTooltip = document.querySelector('.theme-tooltip');

    // Update tooltips on toggle change
    dragToggle.addEventListener('change', function(e) {
        dragTooltip.textContent = e.target.checked ? 'Dragging enabled' : 'Dragging disabled';
    });

    themeToggle.addEventListener('change', function(e) {
        themeTooltip.textContent = e.target.checked ? 'Dark mode' : 'Light mode';
    });

    // Set initial tooltip states
    dragTooltip.textContent = dragToggle.checked ? 'Dragging enabled' : 'Dragging disabled';
    themeTooltip.textContent = themeToggle.checked ? 'Dark mode' : 'Light mode';
});

function rotateWallpaper() {
    const wallpapers = [
        './assets/water.jpg',
        './assets/montery.jpg',
        './assets/default.jpg',
        './assets/mountain.jpeg'
    ];
    
    let currentIndex = 0;
    const preloadedImages = [];

    // Preload all images
    function preloadImages() {
        wallpapers.forEach((src) => {
            const img = new Image();
            img.src = src;
            preloadedImages.push(img);
        });
    }
    
    // Function to change the wallpaper
    function changeWallpaper() {
        // Create a new div for the next wallpaper
        const nextWallpaper = document.createElement('div');
        nextWallpaper.className = 'wallpaper-overlay';
        nextWallpaper.style.backgroundImage = `url('${wallpapers[currentIndex]}')`;
        document.body.appendChild(nextWallpaper);

        // Fade in the new wallpaper
        setTimeout(() => {
            nextWallpaper.style.opacity = '1';
        }, 50);

        // Clean up the old wallpaper
        const oldWallpapers = document.querySelectorAll('.wallpaper-overlay:not(:last-child)');
        oldWallpapers.forEach(wallpaper => {
            setTimeout(() => {
                wallpaper.remove();
            }, 1000);
        });

        currentIndex = (currentIndex + 1) % wallpapers.length;
    }
    
    // Initialize
    preloadImages();
    
    // Set initial wallpaper
    document.body.style.backgroundImage = `url('${wallpapers[0]}')`;
    
    // Change wallpaper every 30 seconds
    setInterval(changeWallpaper, 30000);
}

function initializeThemeToggle() {
    const toggleSwitch = document.getElementById('theme-toggle');
    const appleLogo = document.getElementById('apple-logo');
    
    // Function to update logo
    function updateLogo(isDark) {
        appleLogo.src = isDark ? 
            './assets/applelogowhite.svg' : 
            './assets/applelogo.svg';
    }
    
    // Check for saved theme preference
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme) {
        document.body.classList.toggle('dark-mode', currentTheme === 'dark');
        toggleSwitch.checked = currentTheme === 'dark';
        updateLogo(currentTheme === 'dark');
    }

    // Handle theme toggle
    toggleSwitch.addEventListener('change', function(e) {
        if (e.target.checked) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
            updateLogo(true);
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
            updateLogo(false);
        }
    });
}

function openGmailWindow(event) {
    event.preventDefault();
    const window = document.getElementById('gmailWindow');
    window.style.display = 'block';
    
    // Add opening animation class
    requestAnimationFrame(() => {
        window.classList.add('opening');
        window.style.opacity = '1';
    });
    
    window.classList.remove('minimized', 'closing');

    // Close button (Red)
    const closeBtn = window.querySelector('.close');
    closeBtn.addEventListener('click', () => {
        window.classList.remove('opening');  // Remove opening class
        window.classList.add('closing');
        setTimeout(() => {
            window.style.display = 'none';
            window.classList.remove('closing');
        }, 300);
    });

    // Minimize button (Yellow)
    const minimizeBtn = window.querySelector('.minimize');
    minimizeBtn.addEventListener('click', () => {
        window.classList.remove('opening');
        window.classList.add('minimizing');
        
        window.addEventListener('animationend', () => {
            window.style.display = 'none';
            window.classList.remove('minimizing');
        }, { once: true });
    });

    // Zoom button (Green) - Toggle message
    const zoomBtn = window.querySelector('.zoom');
    const message = window.querySelector('.fullscreen-message');
    let messageVisible = false;

    zoomBtn.addEventListener('click', () => {
        if (!messageVisible) {
            message.style.opacity = '1';
            messageVisible = true;
        } else {
            message.style.opacity = '0';
            messageVisible = false;
        }
    });

    // Close on clicking outside
    document.addEventListener('click', function closeWindow(e) {
        if (!window.contains(e.target) && e.target.closest('.block') === null) {
            window.classList.remove('opening');  // Remove opening class
            window.classList.add('closing');
            setTimeout(() => {
                window.style.display = 'none';
                window.classList.remove('closing');
                // Reset message state when closing window
                message.style.opacity = '0';
                messageVisible = false;
            }, 300);
            document.removeEventListener('click', closeWindow);
        }
    });
}

function updateBatteryStatus() {
    if ('getBattery' in navigator) {
        navigator.getBattery().then(battery => {
            const batteryPercent = Math.floor(battery.level * 100);
            document.querySelector('.battery-percent').textContent = `${batteryPercent}%`;
        });
    }
}

// Add this to your existing JavaScript
function updateDateTime() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
    }).split(',').join('');  // This will definitely remove the comma
    
    document.getElementById('date').textContent = dateStr;
    document.getElementById('time').textContent = now.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit' 
    });
}

// Run it
updateDateTime();
setInterval(updateDateTime, 1000);

// Add this to handle SVG changes on theme toggle
function updateSVGsForTheme(theme) {
    const wifiIcon = document.querySelector('.wifi-icon img');
    const batteryIcon = document.querySelector('.battery-icon img');
    
    if (theme === 'dark') {
        wifiIcon.src = './assets/wifiwhite.svg';
        batteryIcon.src = './assets/batterywhite.svg';
    } else {
        wifiIcon.src = './assets/wifi.svg';
        batteryIcon.src = './assets/battery.svg';
    }
}

// Add this to your existing theme toggle function
document.getElementById('theme-toggle').addEventListener('change', function(e) {
    if (e.target.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        updateSVGsForTheme('dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        updateSVGsForTheme('light');
    }
});

// Initial call based on current theme
const currentTheme = document.documentElement.getAttribute('data-theme');
updateSVGsForTheme(currentTheme);

// Function to get the closest battery level (0, 25, 50, 75, 100)
function getClosestBatteryLevel(level) {
    if (level <= 12) return 0;
    if (level <= 37) return 25;
    if (level <= 62) return 50;
    if (level <= 87) return 75;
    return 100;
}

// Function to get the appropriate battery SVG based on level and theme
function getBatteryIcon(level, theme) {
    const closestLevel = getClosestBatteryLevel(level);
    const prefix = theme === 'dark' ? 'white' : 'dark';
    
    console.log('Battery Level:', level);
    console.log('Closest Level:', closestLevel);
    console.log('Theme:', theme);
    console.log('Using Icon:', `${prefix}${closestLevel}.svg`);
    
    return `./assets/${prefix}${closestLevel}.svg`;
}

// Function to update battery display
function updateBattery() {
    if ('getBattery' in navigator) {
        navigator.getBattery().then(battery => {
            const level = battery.level * 100;
            const theme = document.documentElement.getAttribute('data-theme');
            const batteryIcon = document.querySelector('.battery-icon img');
            
            // Update battery icon
            batteryIcon.src = getBatteryIcon(level, theme);
            
            // Update percentage text
            document.querySelector('.battery-percent').textContent = `${Math.round(level)}%`;
        });
    }
}

// Rest of the code remains the same
document.getElementById('theme-toggle').addEventListener('change', function(e) {
    if (e.target.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        updateBattery();
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        updateBattery();
    }
});
// Initial battery update
updateBattery();

// Update battery every minute
setInterval(updateBattery, 60000);

// Check saved theme on page load
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark') {
        document.getElementById('theme-toggle').checked = true;
        document.documentElement.setAttribute('data-theme', 'dark');
        document.getElementById('date').style.color = '#FFFFFF';
        document.getElementById('time').style.color = '#FFFFFF';
        document.querySelector('.battery-percent').style.color = '#FFFFFF';
        document.querySelector('.wifi-icon img').src = './assets/wifiwhite.svg';
        updateBattery();
    }
});
// Find your existing drag initialization code and add this
let isDragging = false;
let startX, startY;

function handleDragStart(e) {
    isDragging = false;
    startX = e.clientX;
    startY = e.clientY;
    // ... rest of your existing drag start code
}

function handleDragEnd(e) {
    const deltaX = Math.abs(e.clientX - startX);
    const deltaY = Math.abs(e.clientY - startY);
    
    // If barely moved, treat as a click
    if (deltaX < 5 && deltaY < 5) {
        // Check if it's the About Me icon
        if (e.target.closest('.app-icon')?.querySelector('span')?.textContent === 'About Me') {
            openAboutMeWindow(e);
        }
    }
    isDragging = false;
    // ... rest of your existing drag end code
}

// Add this near the top of your script
document.addEventListener('DOMContentLoaded', function() {
    const dragToggle = document.getElementById('drag-toggle');
    const appIcons = document.querySelectorAll('.app-icon');

    dragToggle.addEventListener('change', function(e) {
        const isDragEnabled = e.target.checked;
        appIcons.forEach(icon => {
            if (isDragEnabled) {
                icon.classList.add('drag-enabled');
            } else {
                icon.classList.remove('drag-enabled');
            }
        });
    });

    // Modify your existing double-click handler
    appIcons.forEach(icon => {
        icon.addEventListener('dblclick', (e) => {
            if (!dragToggle.checked) {
                // Open window only if drag is disabled
                if (icon.querySelector('span').textContent === 'About Me') {
                    const aboutWindow = document.getElementById('about-window');
                    if (aboutWindow) {
                        aboutWindow.style.display = 'block';
                    }
                }
            }
        });
    });

    // Modify your drag initialization to check the toggle
    function initializeDrag(icon) {
        // Your existing drag code, but add a check at the start
        icon.addEventListener('mousedown', (e) => {
            if (!dragToggle.checked) return; // Exit if drag is disabled
            // Rest of your drag code...
        });
    }
});

// Add to your existing toggle listeners
dragToggle.addEventListener('change', function(e) {
    const tooltip = document.querySelector('.drag-tooltip');
    tooltip.textContent = e.target.checked ? 'Dragging enabled' : 'Dragging disabled';
});

themeToggle.addEventListener('change', function(e) {
    const tooltip = document.querySelector('.theme-tooltip');
    tooltip.textContent = e.target.checked ? 'Dark mode' : 'Light mode';
});

