/**
 * EleveLab Performance Monitor - Monitoramento de Performance
 * Coleta métricas, identifica gargalos e otimiza automaticamente
 */

class PerformanceMonitor {
    constructor(options = {}) {
        this.options = {
            enableReporting: options.enableReporting !== false,
            enableOptimization: options.enableOptimization !== false,
            reportInterval: options.reportInterval || 30000, // 30 segundos
            thresholds: {
                lcp: 2500, // Large Contentful Paint
                fid: 100,  // First Input Delay
                cls: 0.1,  // Cumulative Layout Shift
                ttfb: 800, // Time to First Byte
                fcp: 1800  // First Contentful Paint
            },
            ...options
        };

        this.metrics = {
            core: {},
            custom: {},
            resources: {},
            errors: []
        };

        this.observers = new Map();
        this.startTime = performance.now();
        
        this.init();
    }

    init() {
        this.setupCoreWebVitals();
        this.setupResourceMonitoring();
        this.setupErrorTracking();
        this.setupUserInteractionTracking();
        
        if (this.options.enableOptimization) {
            this.setupAutoOptimization();
        }
        
        if (this.options.enableReporting) {
            this.startPeriodicReporting();
        }

        console.log('Performance Monitor inicializado');
    }

    // Core Web Vitals Monitoring

    setupCoreWebVitals() {
        this.measureLCP();
        this.measureFID();
        this.measureCLS();
        this.measureTTFB();
        this.measureFCP();
    }

    measureLCP() {
        if (!('PerformanceObserver' in window)) return;

        const observer = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            
            this.metrics.core.lcp = {
                value: lastEntry.startTime,
                rating: this.rateLCP(lastEntry.startTime),
                element: lastEntry.element?.tagName || 'unknown',
                timestamp: Date.now()
            };

            this.checkThreshold('lcp', lastEntry.startTime);
        });

        try {
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
            this.observers.set('lcp', observer);
        } catch (error) {
            console.warn('LCP monitoring não suportado');
        }
    }

    measureFID() {
        if (!('PerformanceObserver' in window)) return;

        const observer = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach(entry => {
                const value = entry.processingStart - entry.startTime;
                
                this.metrics.core.fid = {
                    value,
                    rating: this.rateFID(value),
                    eventType: entry.name,
                    timestamp: Date.now()
                };

                this.checkThreshold('fid', value);
            });
        });

        try {
            observer.observe({ entryTypes: ['first-input'] });
            this.observers.set('fid', observer);
        } catch (error) {
            console.warn('FID monitoring não suportado');
        }
    }

    measureCLS() {
        if (!('PerformanceObserver' in window)) return;

        let clsScore = 0;
        let sessionValue = 0;
        let sessionEntries = [];

        const observer = new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
                if (!entry.hadRecentInput) {
                    const firstSessionEntry = sessionEntries[0];
                    const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

                    if (sessionValue && 
                        entry.startTime - lastSessionEntry.startTime < 1000 &&
                        entry.startTime - firstSessionEntry.startTime < 5000) {
                        sessionValue += entry.value;
                        sessionEntries.push(entry);
                    } else {
                        sessionValue = entry.value;
                        sessionEntries = [entry];
                    }

                    clsScore = Math.max(clsScore, sessionValue);
                }
            }

            this.metrics.core.cls = {
                value: clsScore,
                rating: this.rateCLS(clsScore),
                sessionEntries: sessionEntries.length,
                timestamp: Date.now()
            };

            this.checkThreshold('cls', clsScore);
        });

        try {
            observer.observe({ entryTypes: ['layout-shift'] });
            this.observers.set('cls', observer);
        } catch (error) {
            console.warn('CLS monitoring não suportado');
        }
    }

    measureTTFB() {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
            const ttfb = navigation.responseStart - navigation.requestStart;
            
            this.metrics.core.ttfb = {
                value: ttfb,
                rating: this.rateTTFB(ttfb),
                timestamp: Date.now()
            };

            this.checkThreshold('ttfb', ttfb);
        }
    }

    measureFCP() {
        const observer = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
            
            if (fcpEntry) {
                this.metrics.core.fcp = {
                    value: fcpEntry.startTime,
                    rating: this.rateFCP(fcpEntry.startTime),
                    timestamp: Date.now()
                };

                this.checkThreshold('fcp', fcpEntry.startTime);
            }
        });

        try {
            observer.observe({ entryTypes: ['paint'] });
            this.observers.set('fcp', observer);
        } catch (error) {
            console.warn('FCP monitoring não suportado');
        }
    }

    // Resource Monitoring

    setupResourceMonitoring() {
        window.addEventListener('load', () => {
            this.analyzeResourceLoading();
        });

        // Monitor ongoing resource loading
        const observer = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach(entry => {
                this.processResourceEntry(entry);
            });
        });

        try {
            observer.observe({ entryTypes: ['resource'] });
            this.observers.set('resource', observer);
        } catch (error) {
            console.warn('Resource monitoring não suportado');
        }
    }

    analyzeResourceLoading() {
        const resources = performance.getEntriesByType('resource');
        
        const analysis = {
            total: resources.length,
            totalSize: 0,
            totalDuration: 0,
            byType: {},
            slowest: [],
            largest: [],
            cached: 0,
            blocked: 0
        };

        resources.forEach(resource => {
            const type = this.getResourceType(resource.name);
            
            if (!analysis.byType[type]) {
                analysis.byType[type] = {
                    count: 0,
                    totalSize: 0,
                    totalDuration: 0,
                    avgDuration: 0
                };
            }

            analysis.byType[type].count++;
            analysis.byType[type].totalSize += resource.transferSize || 0;
            analysis.byType[type].totalDuration += resource.duration || 0;
            
            analysis.totalSize += resource.transferSize || 0;
            analysis.totalDuration += resource.duration || 0;

            if (resource.transferSize === 0) analysis.cached++;
            if (resource.responseStart - resource.fetchStart > 100) analysis.blocked++;

            // Track slowest resources
            if (resource.duration > 500) {
                analysis.slowest.push({
                    name: resource.name,
                    duration: resource.duration,
                    size: resource.transferSize
                });
            }

            // Track largest resources
            if (resource.transferSize > 100000) { // > 100KB
                analysis.largest.push({
                    name: resource.name,
                    size: resource.transferSize,
                    duration: resource.duration
                });
            }
        });

        // Calculate averages
        Object.keys(analysis.byType).forEach(type => {
            const typeData = analysis.byType[type];
            typeData.avgDuration = typeData.totalDuration / typeData.count;
        });

        // Sort by performance impact
        analysis.slowest.sort((a, b) => b.duration - a.duration);
        analysis.largest.sort((a, b) => b.size - a.size);

        this.metrics.resources = analysis;
        this.identifyResourceBottlenecks(analysis);
    }

    processResourceEntry(entry) {
        const type = this.getResourceType(entry.name);
        
        // Track critical resource performance
        if (this.isCriticalResource(entry.name)) {
            this.metrics.custom[`${type}_critical`] = {
                name: entry.name,
                duration: entry.duration,
                size: entry.transferSize,
                cached: entry.transferSize === 0,
                timestamp: Date.now()
            };

            if (entry.duration > 1000) {
                this.reportSlowResource(entry);
            }
        }
    }

    // Error Tracking

    setupErrorTracking() {
        window.addEventListener('error', (event) => {
            this.trackError({
                type: 'javascript',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack,
                timestamp: Date.now()
            });
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.trackError({
                type: 'promise',
                message: event.reason?.message || 'Unhandled Promise Rejection',
                stack: event.reason?.stack,
                timestamp: Date.now()
            });
        });

        // Monitor failed resource loads
        document.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.trackError({
                    type: 'resource',
                    element: event.target.tagName,
                    source: event.target.src || event.target.href,
                    message: 'Resource failed to load',
                    timestamp: Date.now()
                });
            }
        }, true);
    }

    trackError(error) {
        this.metrics.errors.push(error);
        
        // Keep only last 50 errors
        if (this.metrics.errors.length > 50) {
            this.metrics.errors = this.metrics.errors.slice(-50);
        }

        console.error('Performance Monitor - Error tracked:', error);
        
        if (this.options.enableReporting) {
            this.reportError(error);
        }
    }

    // User Interaction Tracking

    setupUserInteractionTracking() {
        let interactionCount = 0;
        let totalInteractionTime = 0;

        ['click', 'keydown', 'touchstart'].forEach(eventType => {
            document.addEventListener(eventType, (event) => {
                const startTime = performance.now();
                
                requestIdleCallback(() => {
                    const endTime = performance.now();
                    const duration = endTime - startTime;
                    
                    interactionCount++;
                    totalInteractionTime += duration;

                    this.metrics.custom.userInteractions = {
                        count: interactionCount,
                        avgResponseTime: totalInteractionTime / interactionCount,
                        lastInteraction: {
                            type: eventType,
                            duration,
                            target: event.target.tagName
                        },
                        timestamp: Date.now()
                    };

                    if (duration > 100) {
                        this.reportSlowInteraction({
                            type: eventType,
                            duration,
                            target: event.target
                        });
                    }
                });
            });
        });
    }

    // Auto Optimization

    setupAutoOptimization() {
        this.optimizeImages();
        this.optimizeCriticalResourceLoading();
        this.setupIdleOptimizations();
    }

    optimizeImages() {
        // Auto lazy loading for images below fold
        const images = document.querySelectorAll('img:not([loading])');
        
        images.forEach(img => {
            if (this.isBelowFold(img)) {
                img.loading = 'lazy';
            }
        });

        // Preload critical images
        const criticalImages = document.querySelectorAll('img[data-critical]');
        criticalImages.forEach(img => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = img.src;
            document.head.appendChild(link);
        });
    }

    optimizeCriticalResourceLoading() {
        // Preload critical resources
        const criticalResources = [
            '/assets/css/global.css',
            '/assets/js/navigation.js'
        ];

        criticalResources.forEach(resource => {
            if (!document.querySelector(`link[href="${resource}"]`)) {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.href = resource;
                link.as = this.getResourceType(resource) === 'css' ? 'style' : 'script';
                document.head.appendChild(link);
            }
        });
    }

    setupIdleOptimizations() {
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                this.preloadNextPageResources();
                this.cleanupUnusedResources();
            });
        }
    }

    preloadNextPageResources() {
        // Preload likely next pages based on navigation patterns
        const navLinks = document.querySelectorAll('.nav-item, .related-link');
        
        navLinks.forEach(link => {
            const href = link.href || link.getAttribute('onclick')?.match(/href=['"]([^'"]+)['"]/)?.[1];
            if (href && this.isInternalLink(href)) {
                this.prefetchPage(href);
            }
        });
    }

    cleanupUnusedResources() {
        // Remove unused event listeners and observers
        this.observers.forEach((observer, key) => {
            // Disconnect observers that are no longer needed
            if (key === 'lcp' && this.metrics.core.lcp) {
                observer.disconnect();
                this.observers.delete(key);
            }
        });
    }

    // Reporting and Analytics

    startPeriodicReporting() {
        setInterval(() => {
            this.generatePerformanceReport();
        }, this.options.reportInterval);

        // Report on page unload
        window.addEventListener('beforeunload', () => {
            this.sendBeaconReport();
        });
    }

    generatePerformanceReport() {
        const report = {
            timestamp: Date.now(),
            session_duration: Date.now() - this.startTime,
            page: {
                url: window.location.href,
                title: document.title,
                type: this.detectPageType()
            },
            core_vitals: this.metrics.core,
            resources: {
                total_count: this.metrics.resources.total || 0,
                total_size: this.formatBytes(this.metrics.resources.totalSize || 0),
                cache_hit_rate: this.calculateCacheHitRate(),
                slowest: this.metrics.resources.slowest?.slice(0, 5) || []
            },
            errors: {
                count: this.metrics.errors.length,
                recent: this.metrics.errors.slice(-5)
            },
            device: {
                connection: this.getConnectionInfo(),
                memory: this.getMemoryInfo(),
                hardware_concurrency: navigator.hardwareConcurrency || 'unknown'
            },
            scores: {
                performance_score: this.calculatePerformanceScore(),
                vitals_score: this.calculateVitalsScore()
            }
        };

        console.group('📊 Performance Report');
        console.table(report.core_vitals);
        console.table(report.scores);
        console.groupEnd();

        if (this.options.reportingEndpoint) {
            this.sendReport(report);
        }

        return report;
    }

    sendBeaconReport() {
        if ('sendBeacon' in navigator && this.options.reportingEndpoint) {
            const report = {
                type: 'page_unload',
                session_duration: Date.now() - this.startTime,
                final_metrics: this.metrics.core,
                error_count: this.metrics.errors.length,
                timestamp: Date.now()
            };

            navigator.sendBeacon(this.options.reportingEndpoint, JSON.stringify(report));
        }
    }

    sendReport(report) {
        fetch(this.options.reportingEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(report)
        }).catch(err => console.warn('Report sending failed:', err));
    }

    // Utility Methods and Calculations

    rateLCP(value) {
        if (value <= 2500) return 'good';
        if (value <= 4000) return 'needs-improvement';
        return 'poor';
    }

    rateFID(value) {
        if (value <= 100) return 'good';
        if (value <= 300) return 'needs-improvement';
        return 'poor';
    }

    rateCLS(value) {
        if (value <= 0.1) return 'good';
        if (value <= 0.25) return 'needs-improvement';
        return 'poor';
    }

    rateTTFB(value) {
        if (value <= 800) return 'good';
        if (value <= 1800) return 'needs-improvement';
        return 'poor';
    }

    rateFCP(value) {
        if (value <= 1800) return 'good';
        if (value <= 3000) return 'needs-improvement';
        return 'poor';
    }

    calculatePerformanceScore() {
        const { lcp, fid, cls, fcp, ttfb } = this.metrics.core;
        let score = 100;

        if (lcp?.rating === 'poor') score -= 25;
        else if (lcp?.rating === 'needs-improvement') score -= 10;

        if (fid?.rating === 'poor') score -= 25;
        else if (fid?.rating === 'needs-improvement') score -= 10;

        if (cls?.rating === 'poor') score -= 20;
        else if (cls?.rating === 'needs-improvement') score -= 8;

        if (fcp?.rating === 'poor') score -= 15;
        else if (fcp?.rating === 'needs-improvement') score -= 6;

        if (ttfb?.rating === 'poor') score -= 15;
        else if (ttfb?.rating === 'needs-improvement') score -= 6;

        return Math.max(0, score);
    }

    calculateVitalsScore() {
        const { lcp, fid, cls } = this.metrics.core;
        let good = 0, total = 0;

        if (lcp) {
            total++;
            if (lcp.rating === 'good') good++;
        }

        if (fid) {
            total++;
            if (fid.rating === 'good') good++;
        }

        if (cls) {
            total++;
            if (cls.rating === 'good') good++;
        }

        return total > 0 ? Math.round((good / total) * 100) : 0;
    }

    calculateCacheHitRate() {
        const { cached, total } = this.metrics.resources;
        return total > 0 ? Math.round((cached / total) * 100) : 0;
    }

    checkThreshold(metric, value) {
        const threshold = this.options.thresholds[metric];
        if (threshold && value > threshold) {
            this.reportThresholdViolation(metric, value, threshold);
        }
    }

    reportThresholdViolation(metric, value, threshold) {
        console.warn(`⚠️ Performance threshold exceeded: ${metric.toUpperCase()} ${Math.round(value)}ms > ${threshold}ms`);
        
        if (this.options.enableReporting) {
            this.sendReport({
                type: 'threshold_violation',
                metric,
                value,
                threshold,
                timestamp: Date.now()
            });
        }
    }

    reportSlowResource(resource) {
        console.warn(`🐌 Slow resource detected: ${resource.name} took ${Math.round(resource.duration)}ms`);
    }

    reportSlowInteraction(interaction) {
        console.warn(`🐌 Slow interaction: ${interaction.type} took ${Math.round(interaction.duration)}ms`);
    }

    reportError(error) {
        // Send error to monitoring service
        if (this.options.errorEndpoint) {
            fetch(this.options.errorEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(error)
            }).catch(() => {}); // Silently fail
        }
    }

    getResourceType(url) {
        const extension = url.split('.').pop().split('?')[0].toLowerCase();
        const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
        
        if (imageExts.includes(extension)) return 'image';
        if (extension === 'css') return 'css';
        if (extension === 'js') return 'js';
        if (['woff', 'woff2', 'ttf', 'eot'].includes(extension)) return 'font';
        if (['mp4', 'webm', 'ogg'].includes(extension)) return 'video';
        
        return 'other';
    }

    isCriticalResource(url) {
        return url.includes('/assets/css/') || 
               url.includes('/assets/js/navigation') ||
               url.includes('global.css');
    }

    isBelowFold(element) {
        const rect = element.getBoundingClientRect();
        return rect.top > window.innerHeight;
    }

    isInternalLink(url) {
        try {
            const link = new URL(url, window.location.href);
            return link.origin === window.location.origin;
        } catch {
            return false;
        }
    }

    detectPageType() {
        const path = window.location.pathname;
        if (path === '/' || path === '/index.html') return 'catalog';
        if (path.includes('/manuais/')) return 'manual';
        return 'page';
    }

    getConnectionInfo() {
        if ('connection' in navigator) {
            const conn = navigator.connection;
            return {
                effective_type: conn.effectiveType,
                downlink: conn.downlink,
                rtt: conn.rtt,
                save_data: conn.saveData
            };
        }
        return null;
    }

    getMemoryInfo() {
        if ('memory' in performance) {
            return {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
            };
        }
        return null;
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    prefetchPage(url) {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        document.head.appendChild(link);
    }

    identifyResourceBottlenecks(analysis) {
        const bottlenecks = [];

        // Large resources
        analysis.largest.forEach(resource => {
            if (resource.size > 500000) { // > 500KB
                bottlenecks.push({
                    type: 'large_resource',
                    resource: resource.name,
                    size: resource.size,
                    suggestion: 'Consider compression or code splitting'
                });
            }
        });

        // Slow resources
        analysis.slowest.forEach(resource => {
            if (resource.duration > 2000) { // > 2s
                bottlenecks.push({
                    type: 'slow_resource',
                    resource: resource.name,
                    duration: resource.duration,
                    suggestion: 'Check server response time or use CDN'
                });
            }
        });

        if (bottlenecks.length > 0) {
            console.group('🔍 Performance Bottlenecks Identified');
            bottlenecks.forEach(bottleneck => {
                console.warn(`${bottleneck.type}: ${bottleneck.resource} - ${bottleneck.suggestion}`);
            });
            console.groupEnd();
        }

        return bottlenecks;
    }

    // Public API

    getMetrics() {
        return this.metrics;
    }

    getScore() {
        return {
            performance: this.calculatePerformanceScore(),
            vitals: this.calculateVitalsScore()
        };
    }

    generateReport() {
        return this.generatePerformanceReport();
    }

    cleanup() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.performanceMonitor = new PerformanceMonitor({
        enableReporting: true,
        enableOptimization: true,
        reportInterval: 60000 // 1 minuto
    });
});

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceMonitor;
}