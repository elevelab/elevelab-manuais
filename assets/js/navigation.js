/**
 * EleveLab Navigation - Shared functionality across all manuals
 * Handles section navigation, mobile menu, search, and common UI interactions
 */

class EleveLabNavigation {
    constructor() {
        this.currentSection = 'overview';
        this.sections = [];
        this.navItems = [];
        this.mobileMenuOpen = false;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.initializeSections();
        this.initializeMobileMenu();
        this.initializeAccessibility();
        this.showInitialSection();
        
        // Mark body as loaded
        document.body.classList.add('loaded');
        
        console.log('EleveLab Navigation initialized successfully');
    }
    
    bindEvents() {
        // DOM ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.onDOMReady());
        } else {
            this.onDOMReady();
        }
        
        // Window events
        window.addEventListener('resize', this.debounce(() => this.handleResize(), 250));
        window.addEventListener('scroll', this.throttle(() => this.handleScroll(), 16));
        
        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Mouse events for accessibility
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }
    
    onDOMReady() {
        // Cache DOM elements
        this.cacheElements();
        
        // Initialize components
        this.initializeSearch();
        this.initializePrint();
        this.initializeLazyLoading();
    }
    
    cacheElements() {
        this.navContent = document.getElementById('navContent');
        this.mobileToggle = document.querySelector('.mobile-menu-toggle');
        this.searchInput = document.getElementById('searchInput');
        this.sections = document.querySelectorAll('.section');
        this.navItems = document.querySelectorAll('.nav-item');
    }
    
    initializeSections() {
        // Set up section visibility
        this.sections.forEach((section, index) => {
            if (index === 0) {
                section.classList.add('active');
                this.currentSection = section.id;
            } else {
                section.classList.remove('active');
            }
        });
        
        // Set up navigation active state
        this.navItems.forEach((item, index) => {
            if (index === 0) {
                item.classList.add('active');
            }
        });
    }
    
    showInitialSection() {
        // Check URL hash for initial section
        const hash = window.location.hash.substring(1);
        if (hash && document.getElementById(hash)) {
            this.showSection(hash);
            const navItem = document.querySelector(`[onclick*="${hash}"]`);
            if (navItem) {
                this.setActiveNav(navItem);
            }
        }
    }
    
    showSection(sectionId, element = null) {
        // Validate section exists
        const targetSection = document.getElementById(sectionId);
        if (!targetSection) {
            console.warn(`Section ${sectionId} not found`);
            return;
        }
        
        // Hide all sections
        this.sections.forEach(section => {
            section.classList.remove('active');
            section.setAttribute('aria-hidden', 'true');
        });
        
        // Show target section
        targetSection.classList.add('active');
        targetSection.setAttribute('aria-hidden', 'false');
        
        // Update navigation
        this.setActiveNav(element);
        
        // Update current section
        this.currentSection = sectionId;
        
        // Update URL hash
        if (history.replaceState) {
            history.replaceState(null, null, `#${sectionId}`);
        }
        
        // Scroll to top
        this.scrollToTop();
        
        // Close mobile menu if open
        this.closeMobileMenu();
        
        // Track section view for analytics
        this.trackSectionView(sectionId);
        
        // Announce section change for screen readers
        this.announceToScreenReader(`Seção ${sectionId} carregada`);
    }
    
    setActiveNav(element) {
        // Clear all active states
        this.navItems.forEach(item => {
            item.classList.remove('active');
            item.setAttribute('aria-current', 'false');
        });
        
        // Set active state
        if (element) {
            element.classList.add('active');
            element.setAttribute('aria-current', 'page');
        }
    }
    
    initializeMobileMenu() {
        if (!this.mobileToggle || !this.navContent) return;
        
        this.mobileToggle.addEventListener('click', () => this.toggleMobileMenu());
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav') && this.mobileMenuOpen) {
                this.closeMobileMenu();
            }
        });
    }
    
    toggleMobileMenu() {
        if (this.mobileMenuOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }
    
    openMobileMenu() {
        if (!this.navContent) return;
        
        this.navContent.classList.add('active');
        this.mobileToggle?.setAttribute('aria-expanded', 'true');
        this.mobileMenuOpen = true;
        
        // Animate hamburger
        const hamburgers = this.mobileToggle?.querySelectorAll('.hamburger');
        hamburgers?.forEach((hamburger, index) => {
            hamburger.style.transform = index === 0 ? 'rotate(45deg) translate(5px, 5px)' :
                                       index === 1 ? 'opacity(0)' :
                                       'rotate(-45deg) translate(7px, -6px)';
        });
    }
    
    closeMobileMenu() {
        if (!this.navContent) return;
        
        this.navContent.classList.remove('active');
        this.mobileToggle?.setAttribute('aria-expanded', 'false');
        this.mobileMenuOpen = false;
        
        // Reset hamburger animation
        const hamburgers = this.mobileToggle?.querySelectorAll('.hamburger');
        hamburgers?.forEach(hamburger => {
            hamburger.style.transform = '';
        });
    }
    
    handleResize() {
        // Close mobile menu on desktop
        if (window.innerWidth > 768 && this.mobileMenuOpen) {
            this.closeMobileMenu();
        }
    }
    
    handleScroll() {
        // Add scroll-based functionality if needed
        // Could implement scroll spy for navigation highlighting
    }
    
    handleKeyboard(e) {
        // ESC key closes mobile menu
        if (e.key === 'Escape' && this.mobileMenuOpen) {
            this.closeMobileMenu();
            e.preventDefault();
        }
        
        // Tab key enables keyboard navigation indicators
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
        
        // Arrow keys for section navigation (optional)
        if (e.altKey) {
            const sections = Array.from(this.sections);
            const currentIndex = sections.findIndex(s => s.classList.contains('active'));
            
            if (e.key === 'ArrowLeft' && currentIndex > 0) {
                const prevSection = sections[currentIndex - 1];
                const navItem = document.querySelector(`[onclick*="${prevSection.id}"]`);
                this.showSection(prevSection.id, navItem);
                e.preventDefault();
            } else if (e.key === 'ArrowRight' && currentIndex < sections.length - 1) {
                const nextSection = sections[currentIndex + 1];
                const navItem = document.querySelector(`[onclick*="${nextSection.id}"]`);
                this.showSection(nextSection.id, navItem);
                e.preventDefault();
            }
        }
    }
    
    initializeSearch() {
        if (!this.searchInput) return;
        
        // Debounced search
        this.searchInput.addEventListener('input', 
            this.debounce(() => this.performSearch(), 300)
        );
        
        // Search on enter
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
                e.preventDefault();
            }
        });
    }
    
    performSearch() {
        if (!this.searchInput) return;
        
        const query = this.searchInput.value.toLowerCase().trim();
        
        if (!query) {
            this.clearSearch();
            return;
        }
        
        const results = this.searchContent(query);
        this.displaySearchResults(results);
    }
    
    searchContent(query) {
        const results = [];
        
        this.sections.forEach(section => {
            const title = section.querySelector('.section-title')?.textContent.toLowerCase() || '';
            const content = section.textContent.toLowerCase();
            
            if (title.includes(query) || content.includes(query)) {
                results.push({
                    section: section.id,
                    title: section.querySelector('.section-title')?.textContent || section.id,
                    relevance: title.includes(query) ? 2 : 1
                });
            }
        });
        
        // Sort by relevance
        return results.sort((a, b) => b.relevance - a.relevance);
    }
    
    displaySearchResults(results) {
        // Implementation would depend on UI design
        // Could highlight matching sections or show search overlay
        console.log('Search results:', results);
    }
    
    clearSearch() {
        // Clear any search highlighting or filters
    }
    
    scrollToTop() {
        if (window.scrollTo) {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        } else {
            // Fallback for older browsers
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
        }
    }
    
    initializeAccessibility() {
        // Set up ARIA attributes
        this.sections.forEach((section, index) => {
            section.setAttribute('role', 'tabpanel');
            section.setAttribute('aria-hidden', index !== 0 ? 'true' : 'false');
        });
        
        this.navItems.forEach((item, index) => {
            item.setAttribute('role', 'tab');
            item.setAttribute('aria-current', index === 0 ? 'page' : 'false');
        });
        
        // Mobile menu accessibility
        if (this.mobileToggle) {
            this.mobileToggle.setAttribute('aria-expanded', 'false');
            this.mobileToggle.setAttribute('aria-controls', 'navContent');
            this.mobileToggle.setAttribute('aria-label', 'Toggle navigation menu');
        }
    }
    
    announceToScreenReader(message) {
        // Create temporary element for screen reader announcements
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.setAttribute('class', 'sr-only');
        announcement.style.position = 'absolute';
        announcement.style.left = '-10000px';
        announcement.style.width = '1px';
        announcement.style.height = '1px';
        announcement.style.overflow = 'hidden';
        
        document.body.appendChild(announcement);
        announcement.textContent = message;
        
        // Remove after announcement
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }
    
    initializePrint() {
        // Add print event listeners
        window.addEventListener('beforeprint', () => {
            // Show all sections for printing
            this.sections.forEach(section => {
                section.style.display = 'block';
            });
        });
        
        window.addEventListener('afterprint', () => {
            // Restore section visibility
            this.sections.forEach((section, index) => {
                if (!section.classList.contains('active')) {
                    section.style.display = 'none';
                }
            });
        });
    }
    
    initializeLazyLoading() {
        // Lazy load images when they come into view
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.classList.remove('lazy');
                            observer.unobserve(img);
                        }
                    }
                });
            }, {
                rootMargin: '50px 0px'
            });
            
            // Observe all images with data-src
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }
    
    trackSectionView(sectionId) {
        // Analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_view', {
                page_title: `Manual - ${sectionId}`,
                page_location: window.location.href
            });
        }
        
        // Custom analytics
        if (typeof analytics !== 'undefined' && analytics.track) {
            analytics.track('Manual Section Viewed', {
                section: sectionId,
                manual: this.getManualName(),
                timestamp: new Date().toISOString()
            });
        }
    }
    
    getManualName() {
        // Extract manual name from page title or URL
        const title = document.title;
        const match = title.match(/Manual\s+(\w+)/i);
        return match ? match[1] : 'unknown';
    }
    
    // Utility functions
    debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    }
    
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    // Public API methods
    getCurrentSection() {
        return this.currentSection;
    }
    
    goToSection(sectionId) {
        const navItem = document.querySelector(`[onclick*="${sectionId}"]`);
        this.showSection(sectionId, navItem);
    }
    
    getAvailableSections() {
        return Array.from(this.sections).map(section => ({
            id: section.id,
            title: section.querySelector('.section-title')?.textContent || section.id
        }));
    }
}

// Global functions for backwards compatibility
function showSection(sectionId, element) {
    if (window.eleveLabNav) {
        window.eleveLabNav.showSection(sectionId, element);
    }
}

function toggleMobileMenu() {
    if (window.eleveLabNav) {
        window.eleveLabNav.toggleMobileMenu();
    }
}

function performSearch() {
    if (window.eleveLabNav) {
        window.eleveLabNav.performSearch();
    }
}

// Initialize navigation when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.eleveLabNav = new EleveLabNavigation();
});

// Load additional modules
document.addEventListener('DOMContentLoaded', function() {
    // Load asset manager
    const assetScript = document.createElement('script');
    assetScript.src = '../../assets/js/modules/asset-manager.js';
    assetScript.async = true;
    document.head.appendChild(assetScript);
    
    // Load manual navigator if in manual page
    if (window.location.pathname.includes('/manuais/')) {
        const navScript = document.createElement('script');
        navScript.src = '../../assets/js/modules/manual-navigator.js';
        navScript.async = true;
        document.head.appendChild(navScript);
        
        const navStyles = document.createElement('link');
        navStyles.rel = 'stylesheet';
        navStyles.href = '../../assets/css/navigation-styles.css';
        document.head.appendChild(navStyles);
    }
    
    // Load SEO optimizer
    const seoScript = document.createElement('script');
    seoScript.src = '../../assets/js/modules/seo-optimizer.js';
    seoScript.async = true;
    document.head.appendChild(seoScript);
    
    // Load performance monitor in production
    if (window.location.hostname !== 'localhost') {
        const perfScript = document.createElement('script');
        perfScript.src = '../../assets/js/modules/performance-monitor.js';
        perfScript.async = true;
        document.head.appendChild(perfScript);
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EleveLabNavigation;
}

// Service Worker registration for PWA capabilities
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}