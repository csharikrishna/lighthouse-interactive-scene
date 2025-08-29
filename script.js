/**
 * Interactive Lighthouse Scene Controller
 * 
 * A modular, performance-optimized JavaScript application that manages
 * an interactive lighthouse scene with day/night themes, dynamic elements,
 * and smooth animations with enhanced three-mode lighthouse system.
 */

class LighthouseScene {
    constructor() {
        // Lighthouse modes configuration
        this.lightModes = ['moving', 'emergency', 'off'];
        this.currentLightModeIndex = 0; // Start with moving mode
        
        // Configuration constants
        this.CONFIG = {
            STARS: {
                COUNT_MOBILE: 120,
                COUNT_DESKTOP: 200,
                MIN_SIZE: 0.3,
                MAX_SIZE: 3.0,
                MIN_DURATION: 3,
                MAX_DURATION: 12,
                MAX_DELAY: 8,
                MIN_OPACITY: 0.2,
                MAX_OPACITY: 1.0
            },
            SHOOTING_STARS: {
                COUNT: 5,
                MAX_DELAY: 20
            },
            CLOUDS: {
                COUNT_MOBILE: 4,
                COUNT_DESKTOP: 7,
                MIN_SIZE: 60,
                MAX_SIZE: 180,
                MIN_DURATION: 50,
                MAX_DURATION: 140
            },
            BIRDS: {
                DAY_SPEED: 1.2,
                NIGHT_SPEED: 0.8,
                DAY_WAVE_FREQUENCY: 45,
                NIGHT_WAVE_FREQUENCY: 35,
                DAY_AMPLITUDE: 12,
                NIGHT_AMPLITUDE: 10,
                ANIMATION_INTERVAL: 25,
                RESET_POSITION: 900,
                START_POSITION: -200
            },
            LIGHTHOUSE: {
                MODES: {
                    MOVING: {
                        ROTATION_SPEED: 10,
                        PULSE_SPEED: 8,
                        BEAM_OPACITY: 0.9,
                        BEAM_BLUR: 3
                    },
                    EMERGENCY: {
                        ROTATION_SPEED: 1.5,
                        PULSE_SPEED: 0.8,
                        BEAM_OPACITY: 1.0,
                        BEAM_BLUR: 5,
                        FLASH_SPEED: 0.4
                    },
                    OFF: {
                        BEAM_OPACITY: 0,
                        LANTERN_OPACITY: 0.3
                    }
                }
            },
            TIMING: {
                RESIZE_DEBOUNCE: 250,
                STAGGER_DELAY: 100
            },
            AUDIO: {
                VOLUME: 0.5
            },
            BREAKPOINTS: {
                MOBILE: 768
            }
        };

        // DOM element cache
        this.elements = this.cacheElements();

        // Animation state
        this.animationState = {
            birdsInterval: null,
            birdPositions: { dayX: -100, nightX: 800 },
            starAnimations: new Map(),
            beamRotation: 0
        };

        // Observers and timers
        this.resizeTimer = null;
        this.intersectionObserver = null;
        this.beamAnimationId = null;

        // Bind methods to preserve context
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleSoundToggle = this.handleSoundToggle.bind(this);
        this.handleThemeToggle = this.handleThemeToggle.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
        this.handleLighthouseClick = this.handleLighthouseClick.bind(this);
        this.animateCustomBeam = this.animateCustomBeam.bind(this);
    }

    /**
     * Cache all required DOM elements for performance
     */
    cacheElements() {
        const elements = {};
        const elementIds = [
            'starsContainer', 'shootingStarsContainer', 'cloudsContainer',
            'lightBeam', 'themeToggle', 'oceanSound', 'soundToggle'
        ];

        elementIds.forEach(id => {
            elements[id] = document.getElementById(id);
            if (!elements[id]) {
                console.warn(`Element with ID '${id}' not found`);
            }
        });

        // Additional element queries
        elements.body = document.body;
        elements.lighthouse = document.querySelector('.lighthouse');
        elements.lantern = document.querySelector('.lantern');
        elements.dayBirds = document.querySelector('.day-birds');
        elements.nightBirds = document.querySelector('.night-birds');
        elements.parallaxLayer = document.querySelector('.parallax-layer-back');

        return elements;
    }

    /**
     * Initialize the entire scene
     */
    init() {
        try {
            this.setupEventListeners();
            this.createSceneElements();
            this.setupAnimations();
            this.setupAudio();
            this.setupAccessibility();
            this.updateLightMode(); // Initialize lighthouse mode
            
            console.log('🏮 Lighthouse scene initialized successfully');
        } catch (error) {
            console.error('Failed to initialize lighthouse scene:', error);
        }
    }

    /**
     * Set up all event listeners
     */
    setupEventListeners() {
        // Mouse tracking for dynamic lighting
        document.addEventListener('mousemove', this.handleMouseMove, { passive: true });
        
        // Sound control
        this.elements.soundToggle?.addEventListener('click', this.handleSoundToggle);
        
        // Theme switching
        this.elements.themeToggle?.addEventListener('click', this.handleThemeToggle);
        
        // Window events
        window.addEventListener('resize', this.handleResize, { passive: true });
        document.addEventListener('scroll', this.handleScroll, { passive: true });
        
        // Smooth scrolling for anchor links
        this.setupSmoothScrolling();
        
        // Lighthouse interaction
        this.elements.lighthouse?.addEventListener('click', this.handleLighthouseClick);
        this.elements.lantern?.addEventListener('click', this.handleLighthouseClick);
    }

    /**
     * Handle mouse movement for enhanced dynamic lighting
     */
    handleMouseMove(e) {
        requestAnimationFrame(() => {
            const x = (e.clientX / window.innerWidth) * 100;
            const y = (e.clientY / window.innerHeight) * 100;
            
            document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
            document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
            document.documentElement.style.setProperty('--mouse-x-percent', `${x}%`);
            document.documentElement.style.setProperty('--mouse-y-percent', `${y}%`);
        });
    }

    /**
     * Handle sound toggle with proper state management
     */
    handleSoundToggle() {
        const { oceanSound, soundToggle } = this.elements;
        if (!oceanSound || !soundToggle) return;

        try {
            if (oceanSound.paused) {
                oceanSound.play().then(() => {
                    soundToggle.textContent = "🔊";
                    soundToggle.setAttribute('aria-label', 'Mute Sound');
                }).catch(error => {
                    console.warn('Audio playback failed:', error);
                });
            } else {
                oceanSound.pause();
                soundToggle.textContent = "🔇";
                soundToggle.setAttribute('aria-label', 'Enable Sound');
            }
        } catch (error) {
            console.error('Sound toggle failed:', error);
        }
    }

    /**
     * Handle theme switching with improved state management
     */
    handleThemeToggle() {
        const { body, themeToggle } = this.elements;
        if (!body || !themeToggle) return;

        const isDarkMode = body.classList.contains('dark-mode');
        
        // Toggle theme classes
        body.classList.toggle('dark-mode', !isDarkMode);
        body.classList.toggle('light-mode', isDarkMode);

        // Update button appearance and accessibility
        themeToggle.textContent = isDarkMode ? '☀️' : '🌙';
        themeToggle.setAttribute('aria-label', `Switch to ${isDarkMode ? 'Dark' : 'Light'} Mode`);

        // Update scene elements for new theme
        this.updateSceneForTheme();
        this.updateLightMode(); // Refresh lighthouse mode for new theme
    }

    /**
     * Handle lighthouse click interaction - cycles through 3 modes
     */
    handleLighthouseClick() {
        // Cycle to next mode
        this.currentLightModeIndex = (this.currentLightModeIndex + 1) % this.lightModes.length;
        this.updateLightMode();
        
        // Visual feedback
        const currentMode = this.lightModes[this.currentLightModeIndex];
        const modeNames = {
            'moving': 'Normal Operation',
            'emergency': 'EMERGENCY MODE!',
            'off': 'Light Disabled'
        };
        
        console.log(`🏮 Lighthouse: ${modeNames[currentMode]}`);
        
        // Add click animation
        this.elements.lighthouse?.classList.add('lighthouse-clicked');
        setTimeout(() => {
            this.elements.lighthouse?.classList.remove('lighthouse-clicked');
        }, 200);
    }

    /**
     * Update lighthouse appearance based on current mode
     */
    updateLightMode() {
        const { lightBeam, lantern, lighthouse } = this.elements;
        if (!lightBeam || !lantern) return;

        // Clear all mode classes
        lightBeam.classList.remove('beam-moving', 'beam-emergency', 'beam-off');
        lantern.classList.remove('emergency-mode', 'beam-off-mode');
        lighthouse?.classList.remove('lighthouse-emergency');

        // Apply classes based on current mode
        const currentMode = this.lightModes[this.currentLightModeIndex];
        
        switch(currentMode) {
            case 'moving':
                lightBeam.classList.add('beam-moving');
                this.startCustomBeamAnimation();
                break;
            case 'emergency':
                lightBeam.classList.add('beam-emergency');
                lantern.classList.add('emergency-mode');
                lighthouse?.classList.add('lighthouse-emergency');
                this.startEmergencyBeamAnimation();
                break;
            case 'off':
                lightBeam.classList.add('beam-off');
                lantern.classList.add('beam-off-mode');
                this.stopCustomBeamAnimation();
                break;
        }
    }

    /**
     * Start custom beam animation for moving mode
     */
    startCustomBeamAnimation() {
        this.stopCustomBeamAnimation();
        this.animateCustomBeam();
    }

    /**
     * Start emergency beam animation
     */
    startEmergencyBeamAnimation() {
        this.stopCustomBeamAnimation();
        this.animateEmergencyBeam();
    }

    /**
     * Stop custom beam animation
     */
    stopCustomBeamAnimation() {
        if (this.beamAnimationId) {
            cancelAnimationFrame(this.beamAnimationId);
            this.beamAnimationId = null;
        }
    }

    /**
     * Custom beam animation for smooth rotation
     */
    animateCustomBeam() {
        const { lightBeam } = this.elements;
        if (!lightBeam || !lightBeam.classList.contains('beam-moving')) return;

        const time = Date.now() * 0.001;
        const rotation = Math.sin(time * 0.1) * 40; // Smooth oscillation
        const opacity = 0.7 + Math.sin(time * 0.3) * 0.3; // Gentle pulsing

        lightBeam.style.transform = `rotate(${rotation}deg)`;
        lightBeam.style.opacity = opacity;

        this.beamAnimationId = requestAnimationFrame(this.animateCustomBeam);
    }

    /**
     * Emergency beam animation with erratic movement
     */
    animateEmergencyBeam() {
        const { lightBeam } = this.elements;
        if (!lightBeam || !lightBeam.classList.contains('beam-emergency')) return;

        const time = Date.now() * 0.001;
        const fastRotation = Math.sin(time * 2) * 60 + Math.cos(time * 3) * 20;
        const flashOpacity = Math.abs(Math.sin(time * 8)) * 0.5 + 0.5;

        lightBeam.style.transform = `rotate(${fastRotation}deg)`;
        lightBeam.style.opacity = flashOpacity;

        this.beamAnimationId = requestAnimationFrame(() => this.animateEmergencyBeam());
    }

    /**
     * Handle window resize with debouncing
     */
    handleResize() {
        clearTimeout(this.resizeTimer);
        this.resizeTimer = setTimeout(() => {
            this.createSceneElements();
        }, this.CONFIG.TIMING.RESIZE_DEBOUNCE);
    }

    /**
     * Handle scroll for parallax effect
     */
    handleScroll() {
        if (!this.elements.parallaxLayer) return;

        requestAnimationFrame(() => {
            const scrollY = window.scrollY;
            this.elements.parallaxLayer.style.transform = 
                `translateY(${scrollY * 0.5}px) translateZ(-1px) scale(2)`;
        });
    }

    /**
     * Set up smooth scrolling for anchor links
     */
    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    }

    /**
     * Create all dynamic scene elements
     */
    createSceneElements() {
        this.createEnhancedStars();
        this.createEnhancedShootingStars();
        this.createClouds();
    }

    /**
     * Update scene elements when theme changes
     */
    updateSceneForTheme() {
        requestAnimationFrame(() => {
            this.createSceneElements();
        });
    }

    /**
     * Create enhanced stars with improved animations
     */
    createEnhancedStars() {
        const container = this.elements.starsContainer;
        if (!container || this.elements.body.classList.contains('light-mode')) {
            container && (container.innerHTML = '');
            return;
        }

        const fragment = document.createDocumentFragment();
        const isMobile = window.innerWidth < this.CONFIG.BREAKPOINTS.MOBILE;
        const starCount = isMobile ? this.CONFIG.STARS.COUNT_MOBILE : this.CONFIG.STARS.COUNT_DESKTOP;

        // Clear existing stars
        container.innerHTML = '';
        this.animationState.starAnimations.clear();

        for (let i = 0; i < starCount; i++) {
            const star = this.createEnhancedStar(i);
            fragment.appendChild(star);
        }

        container.appendChild(fragment);
    }

    /**
     * Create individual enhanced star element
     */
    createEnhancedStar(index) {
        const star = document.createElement('div');
        star.className = 'star animated-element enhanced-star';
        
        const size = this.random(this.CONFIG.STARS.MIN_SIZE, this.CONFIG.STARS.MAX_SIZE);
        const duration = this.random(this.CONFIG.STARS.MIN_DURATION, this.CONFIG.STARS.MAX_DURATION);
        const delay = Math.random() * this.CONFIG.STARS.MAX_DELAY;
        const opacity = this.random(this.CONFIG.STARS.MIN_OPACITY, this.CONFIG.STARS.MAX_OPACITY);
        const x = Math.random() * 100;
        const y = Math.random() * 100; // Keep stars in upper portion

        // Add special star types
        const starType = Math.random();
        if (starType > 0.95) {
            star.classList.add('bright-star');
        } else if (starType > 0.85) {
            star.classList.add('pulsing-star');
        }

        star.style.cssText = `
            left: ${x}%;
            top: ${y}%;
            width: ${size}px;
            height: ${size}px;
            --twinkle-duration: ${duration}s;
            --twinkle-delay: ${delay}s;
            --star-opacity: ${opacity};
            animation: enhancedTwinkle var(--twinkle-duration) infinite var(--twinkle-delay);
        `;

        return star;
    }

    /**
     * Create enhanced shooting stars
     */
    createEnhancedShootingStars() {
        const container = this.elements.shootingStarsContainer;
        if (!container || this.elements.body.classList.contains('light-mode')) {
            container && (container.innerHTML = '');
            return;
        }

        container.innerHTML = '';
        
        for (let i = 0; i < this.CONFIG.SHOOTING_STARS.COUNT; i++) {
            const shootingStar = this.createShootingStar(i);
            container.appendChild(shootingStar);
        }
    }

    /**
     * Create individual shooting star
     */
    createShootingStar(index) {
        const shootingStar = document.createElement('div');
        shootingStar.className = 'shooting-star enhanced-shooting-star';
        
        const startX = Math.random() * 120 - 20; // Can start off-screen
        const startY = Math.random() * 40;
        const angle = 10 + Math.random() * 30; // Vary the angle
        const duration = 3 + Math.random() * 4; // Vary duration
        const delay = Math.random() * this.CONFIG.SHOOTING_STARS.MAX_DELAY;

        shootingStar.style.cssText = `
            top: ${startY}%;
            left: ${startX}%;
            --shooting-duration: ${duration}s;
            --shooting-delay: ${delay}s;
            --shooting-angle: ${angle}deg;
            animation: enhancedShooting var(--shooting-duration) linear infinite var(--shooting-delay);
        `;

        return shootingStar;
    }


    /**
     * Create clouds for day mode
     */
    createClouds() {
        const container = this.elements.cloudsContainer;
        if (!container || !this.elements.body.classList.contains('light-mode')) {
            container && (container.innerHTML = '');
            return;
        }

        container.innerHTML = '';
        const isMobile = window.innerWidth < this.CONFIG.BREAKPOINTS.MOBILE;
        const cloudCount = isMobile ? this.CONFIG.CLOUDS.COUNT_MOBILE : this.CONFIG.CLOUDS.COUNT_DESKTOP;

        for (let i = 0; i < cloudCount; i++) {
            const cloud = document.createElement('div');
            cloud.className = 'cloud';
            
            const size = this.random(this.CONFIG.CLOUDS.MIN_SIZE, this.CONFIG.CLOUDS.MAX_SIZE);
            const duration = this.random(this.CONFIG.CLOUDS.MIN_DURATION, this.CONFIG.CLOUDS.MAX_DURATION);
            const opacity = 0.3 + Math.random() * 0.4;

            cloud.style.cssText = `
                top: ${Math.random() * 40}%;
                width: ${size}px;
                height: ${size / 2}px;
                opacity: ${opacity};
                animation: cloudDrift ${duration}s linear infinite;
                animation-delay: -${Math.random() * 60}s;
            `;

            container.appendChild(cloud);
        }
    }

    /**
     * Set up all animations
     */
    setupAnimations() {
        this.setupStaggeredAnimations();
        this.animateBirds();
    }

    /**
     * Set up staggered entrance animations using Intersection Observer
     */
    setupStaggeredAnimations() {
        const options = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, index * this.CONFIG.TIMING.STAGGER_DELAY);
                }
            });
        }, options);

        document.querySelectorAll('.staggered-element').forEach(el => {
            this.intersectionObserver.observe(el);
        });
    }

    /**
     * Animate birds with smooth movement patterns
     */
    animateBirds() {
        const { dayBirds, nightBirds } = this.elements;
        if (!dayBirds || !nightBirds) return;

        // Clear existing animation if any
        if (this.animationState.birdsInterval) {
            clearInterval(this.animationState.birdsInterval);
        }

        this.animationState.birdsInterval = setInterval(() => {
            this.updateBirdPositions(dayBirds, nightBirds);
        }, this.CONFIG.BIRDS.ANIMATION_INTERVAL);
    }

    /**
     * Update bird positions with sine wave motion
     */
    updateBirdPositions(dayBirds, nightBirds) {
        const { birdPositions } = this.animationState;
        
        // Day birds movement (left to right)
        birdPositions.dayX = (birdPositions.dayX + this.CONFIG.BIRDS.DAY_SPEED) % this.CONFIG.BIRDS.RESET_POSITION;
        const dayY = Math.sin(birdPositions.dayX / this.CONFIG.BIRDS.DAY_WAVE_FREQUENCY) * this.CONFIG.BIRDS.DAY_AMPLITUDE;
        dayBirds.style.transform = `translateX(${birdPositions.dayX}px) translateY(${dayY}px)`;

        // Night birds movement (right to left)
        birdPositions.nightX -= this.CONFIG.BIRDS.NIGHT_SPEED;
        if (birdPositions.nightX < this.CONFIG.BIRDS.START_POSITION) {
            birdPositions.nightX = this.CONFIG.BIRDS.RESET_POSITION;
        }

        const nightY = Math.sin(birdPositions.nightX / this.CONFIG.BIRDS.NIGHT_WAVE_FREQUENCY) * this.CONFIG.BIRDS.NIGHT_AMPLITUDE;
        nightBirds.style.transform = `translateX(${birdPositions.nightX}px) translateY(${nightY}px)`;
    }

    /**
     * Set up audio with proper error handling
     */
    setupAudio() {
        const { oceanSound, soundToggle } = this.elements;
        if (!oceanSound || !soundToggle) return;

        try {
            oceanSound.volume = this.CONFIG.AUDIO.VOLUME;
            
            // Set initial state
            soundToggle.textContent = "🔇";
            soundToggle.setAttribute('aria-label', 'Enable Sound');

            // Handle audio loading errors
            oceanSound.addEventListener('error', (e) => {
                console.warn('Audio failed to load:', e);
                soundToggle.style.display = 'none'; // Hide if audio unavailable
            });
        } catch (error) {
            console.error('Audio setup failed:', error);
        }
    }

    /**
     * Set up accessibility features
     */
    setupAccessibility() {
        // Respect user's motion preferences
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        if (prefersReducedMotion.matches) {
            document.documentElement.style.setProperty('--animation-duration', '0.01ms');
            this.stopCustomBeamAnimation();
        }

        // Listen for changes in motion preference
        prefersReducedMotion.addEventListener('change', (e) => {
            const duration = e.matches ? '0.01ms' : 'initial';
            document.documentElement.style.setProperty('--animation-duration', duration);
            
            if (e.matches) {
                this.stopCustomBeamAnimation();
            } else {
                this.updateLightMode();
            }
        });
    }

    /**
     * Utility method for generating random numbers in range
     */
    random(min, max) {
        return Math.random() * (max - min) + min;
    }

    /**
     * Clean up resources when destroying the scene
     */
    destroy() {
        // Clear timers
        if (this.resizeTimer) clearTimeout(this.resizeTimer);
        if (this.animationState.birdsInterval) clearInterval(this.animationState.birdsInterval);
        
        // Stop custom animations
        this.stopCustomBeamAnimation();
        
        // Disconnect observers
        if (this.intersectionObserver) this.intersectionObserver.disconnect();
        
        // Remove event listeners
        document.removeEventListener('mousemove', this.handleMouseMove);
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('scroll', this.handleScroll);
        
        console.log('🏮 Lighthouse scene destroyed');
    }
}

/**
 * Initialize the lighthouse scene when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    const scene = new LighthouseScene();
    scene.init();
    
    // Make scene available globally for debugging (optional)
    if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') {
        window.lighthouseScene = scene;
    }
});

/**
 * Handle page unload cleanup
 */
window.addEventListener('beforeunload', () => {
    if (window.lighthouseScene) {
        window.lighthouseScene.destroy();
    }
});

// Experience message fade out
setTimeout(() => {
    const msg = document.getElementById("experience-message");
    if (msg) {
        msg.style.opacity = "0";
        setTimeout(() => msg.remove(), 1000);
    }
}, 3000);

// Fullscreen toggle functionality
document.addEventListener('DOMContentLoaded', () => {
    const fullscreenButton = document.getElementById("right-button");

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                alert(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    // Button click
    if (fullscreenButton) {
        fullscreenButton.addEventListener("click", toggleFullscreen);
    }

    // Press 'F' key
    document.addEventListener("keydown", (event) => {
        if (event.key === "f" || event.key === "F") {
            toggleFullscreen();
        }
    });
});
document.addEventListener("DOMContentLoaded", () => {
  // Hide the welcome message after 5 seconds
  setTimeout(() => {
    const msg = document.getElementById("welcome-message");
    if (msg) msg.style.opacity = "0";
  }, 5000);
});