/**
 * EleveLab Asset Manager - Gerenciamento Global de Assets
 * Centraliza o carregamento, cache e otimização de recursos
 */

class AssetManager {
    constructor(options = {}) {
        this.options = {
            baseUrl: options.baseUrl || '',
            enableCache: options.enableCache !== false,
            enableLazyLoading: options.enableLazyLoading !== false,
            enablePreloading: options.enablePreloading !== false,
            imageFormats: options.imageFormats || ['webp', 'jpg', 'png'],
            cacheVersion: options.cacheVersion || 'v1',
            ...options
        };

        this.cache = new Map();
        this.loadingPromises = new Map();
        this.observers = new Map();
        this.manifestData = null;
        
        this.init();
    }

    async init() {
        await this.loadManifest();
        this.setupLazyLoading();
        this.setupPreloading();
        this.setupServiceWorker();
        
        console.log('Asset Manager inicializado');
    }

    async loadManifest() {
        try {
            const response = await fetch('/assets/images/manifest.json');
            if (response.ok) {
                this.manifestData = await response.json();
                console.log('Manifest de assets carregado');
            }
        } catch (error) {
            console.warn('Manifest não encontrado, usando fallbacks');
        }
    }

    // Gerenciamento de Imagens

    getOptimizedImageUrl(originalPath, size = 'medium', format = 'webp') {
        // Verificar se há dados do manifest
        if (this.manifestData && this.manifestData.images[originalPath]) {
            const variants = this.manifestData.images[originalPath].variants;
            if (variants[size] && variants[size][format]) {
                return variants[size][format];
            }
        }

        // Fallback para URL construída
        const parsed = this.parsePath(originalPath);
        const optimizedDir = parsed.dir.replace(
            /^(assets\/images|manuais\/[^\/]+\/images)/, 
            '$1/optimized'
        );
        return `${optimizedDir}/${parsed.name}-${size}.${format}`;
    }

    generateResponsiveImageHtml(originalPath, options = {}) {
        const {
            alt = '',
            sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px',
            className = 'responsive-image',
            lazy = true
        } = options;

        const basePath = this.parsePath(originalPath);
        const optimizedDir = basePath.dir.replace(
            /^(assets\/images|manuais\/[^\/]+\/images)/, 
            '$1/optimized'
        );
        const baseName = basePath.name;

        const webpSources = [
            `${optimizedDir}/${baseName}-small.webp 400w`,
            `${optimizedDir}/${baseName}-medium.webp 800w`,
            `${optimizedDir}/${baseName}-large.webp 1200w`
        ].join(', ');

        const jpegSources = [
            `${optimizedDir}/${baseName}-small.jpg 400w`,
            `${optimizedDir}/${baseName}-medium.jpg 800w`,
            `${optimizedDir}/${baseName}-large.jpg 1200w`
        ].join(', ');

        const fallbackSrc = `${optimizedDir}/${baseName}-medium.jpg`;
        const loadingAttr = lazy ? 'loading="lazy"' : '';

        return `
            <picture class="${className}">
                <source srcset="${webpSources}" type="image/webp" sizes="${sizes}">
                <source srcset="${jpegSources}" type="image/jpeg" sizes="${sizes}">
                <img src="${fallbackSrc}" alt="${alt}" ${loadingAttr} class="optimized-image">
            </picture>
        `;
    }

    // Lazy Loading

    setupLazyLoading() {
        if (!this.options.enableLazyLoading || !('IntersectionObserver' in window)) {
            return;
        }

        // Observer para imagens
        this.observers.images = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                    this.observers.images.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.1
        });

        // Observer para seções
        this.observers.sections = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.preloadSectionAssets(entry.target);
                    this.observers.sections.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '100px 0px',
            threshold: 0.1
        });

        this.observeElements();
    }

    observeElements() {
        // Observar imagens lazy
        document.querySelectorAll('img[data-src], img[loading="lazy"]').forEach(img => {
            this.observers.images.observe(img);
        });

        // Observar placeholders de imagem
        document.querySelectorAll('.image-placeholder[data-src]').forEach(placeholder => {
            this.observers.images.observe(placeholder);
        });

        // Observar seções para preload
        document.querySelectorAll('.section').forEach(section => {
            this.observers.sections.observe(section);
        });
    }

    async loadImage(element) {
        const src = element.dataset.src || element.src;
        if (!src) return;

        try {
            // Verificar cache primeiro
            if (this.cache.has(src)) {
                this.applyImageToElement(element, src);
                return;
            }

            // Carregar imagem
            const img = new Image();
            img.onload = () => {
                this.cache.set(src, img);
                this.applyImageToElement(element, src);
            };
            
            img.onerror = () => {
                console.warn(`Falha ao carregar imagem: ${src}`);
                this.applyFallbackImage(element);
            };

            img.src = src;
        } catch (error) {
            console.error('Erro ao carregar imagem:', error);
            this.applyFallbackImage(element);
        }
    }

    applyImageToElement(element, src) {
        if (element.tagName === 'IMG') {
            element.src = src;
            element.classList.remove('lazy');
            element.classList.add('loaded');
        } else if (element.classList.contains('image-placeholder')) {
            // Substituir placeholder por imagem real
            const img = document.createElement('img');
            img.src = src;
            img.alt = element.dataset.alt || '';
            img.className = 'loaded-image';
            element.parentNode.replaceChild(img, element);
        }
    }

    applyFallbackImage(element) {
        // Aplicar imagem de fallback ou manter placeholder
        element.classList.add('error');
        element.setAttribute('data-error', 'Erro ao carregar imagem');
    }

    // Preloading

    setupPreloading() {
        if (!this.options.enablePreloading) return;

        // Preload recursos críticos
        this.preloadCriticalAssets();
        
        // Preload baseado em interação do usuário
        this.setupInteractionPreload();
    }

    preloadCriticalAssets() {
        const criticalAssets = [
            '/assets/css/global.css',
            '/assets/js/navigation.js',
            '/assets/js/modules/manual-navigator.js'
        ];

        criticalAssets.forEach(asset => {
            this.preloadAsset(asset, this.getAssetType(asset));
        });
    }

    setupInteractionPreload() {
        // Preload ao hover em links
        document.addEventListener('mouseover', (e) => {
            const link = e.target.closest('a[href]');
            if (link && this.isInternalLink(link.href)) {
                this.preloadPage(link.href);
            }
        });

        // Preload de seções ao navegar
        document.addEventListener('click', (e) => {
            const navItem = e.target.closest('.nav-item');
            if (navItem) {
                const sectionId = this.extractSectionId(navItem);
                if (sectionId) {
                    this.preloadSectionAssets(document.getElementById(sectionId));
                }
            }
        });
    }

    async preloadAsset(url, type = 'fetch') {
        if (this.loadingPromises.has(url)) {
            return this.loadingPromises.get(url);
        }

        const promise = this.loadAsset(url, type);
        this.loadingPromises.set(url, promise);
        
        return promise;
    }

    async loadAsset(url, type) {
        try {
            if (type === 'image') {
                return new Promise((resolve, reject) => {
                    const img = new Image();
                    img.onload = () => resolve(img);
                    img.onerror = reject;
                    img.src = url;
                });
            } else {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return await response.text();
            }
        } catch (error) {
            console.warn(`Falha no preload de ${url}:`, error);
            throw error;
        }
    }

    preloadPage(url) {
        // Preload HTML da página
        this.preloadAsset(url, 'fetch').then(html => {
            // Extrair e preload assets da página
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Preload CSS
            doc.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
                this.preloadAsset(link.href, 'fetch');
            });
            
            // Preload JS
            doc.querySelectorAll('script[src]').forEach(script => {
                this.preloadAsset(script.src, 'fetch');
            });
        });
    }

    preloadSectionAssets(section) {
        if (!section) return;

        // Preload imagens da seção
        section.querySelectorAll('img[data-src], .image-placeholder[data-src]').forEach(img => {
            const src = img.dataset.src;
            if (src) {
                this.preloadAsset(src, 'image');
            }
        });
    }

    // Service Worker

    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service Worker registrado:', registration);
                    
                    // Escutar atualizações
                    registration.addEventListener('updatefound', () => {
                        this.handleServiceWorkerUpdate(registration);
                    });
                })
                .catch(error => {
                    console.log('Falha no Service Worker:', error);
                });
        }
    }

    handleServiceWorkerUpdate(registration) {
        const newWorker = registration.installing;
        
        newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                    // Nova versão disponível
                    this.showUpdateNotification();
                }
            }
        });
    }

    showUpdateNotification() {
        // Mostrar notificação de atualização
        if (window.confirm('Nova versão disponível. Atualizar?')) {
            window.location.reload();
        }
    }

    // Cache Management

    clearCache() {
        this.cache.clear();
        this.loadingPromises.clear();
        
        // Limpar cache do Service Worker
        if ('caches' in window) {
            caches.keys().then(names => {
                names.forEach(name => caches.delete(name));
            });
        }
        
        console.log('Cache limpo');
    }

    getCacheStats() {
        return {
            size: this.cache.size,
            loading: this.loadingPromises.size,
            memory: this.estimateCacheMemory()
        };
    }

    estimateCacheMemory() {
        // Estimativa aproximada do uso de memória
        let totalSize = 0;
        for (const [key, value] of this.cache) {
            totalSize += key.length * 2; // String key
            if (value instanceof Image) {
                // Estimativa para imagens
                totalSize += (value.naturalWidth * value.naturalHeight * 4);
            } else if (typeof value === 'string') {
                totalSize += value.length * 2;
            }
        }
        return totalSize;
    }

    // Asset Monitoring

    getAssetLoadTimes() {
        if (!window.performance) return {};
        
        const resources = window.performance.getEntriesByType('resource');
        const assetTimes = {};
        
        resources.forEach(resource => {
            if (this.isAssetResource(resource.name)) {
                assetTimes[resource.name] = {
                    duration: resource.duration,
                    size: resource.transferSize,
                    cached: resource.transferSize === 0
                };
            }
        });
        
        return assetTimes;
    }

    generatePerformanceReport() {
        const report = {
            timestamp: new Date().toISOString(),
            cache: this.getCacheStats(),
            loadTimes: this.getAssetLoadTimes(),
            images: {
                total: document.querySelectorAll('img').length,
                lazy: document.querySelectorAll('img[loading="lazy"]').length,
                loaded: document.querySelectorAll('img.loaded').length,
                errors: document.querySelectorAll('img.error').length
            }
        };

        console.table(report);
        return report;
    }

    // Utility Methods

    parsePath(filePath) {
        const parts = filePath.split('/');
        const filename = parts.pop();
        const nameParts = filename.split('.');
        const ext = nameParts.pop();
        const name = nameParts.join('.');
        
        return {
            dir: parts.join('/'),
            name,
            ext,
            filename
        };
    }

    getAssetType(url) {
        const ext = url.split('.').pop().toLowerCase();
        const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
        
        if (imageExts.includes(ext)) return 'image';
        if (['css'].includes(ext)) return 'style';
        if (['js'].includes(ext)) return 'script';
        return 'fetch';
    }

    isInternalLink(url) {
        try {
            const link = new URL(url, window.location.href);
            return link.origin === window.location.origin;
        } catch {
            return false;
        }
    }

    isAssetResource(url) {
        return url.includes('/assets/') || 
               url.includes('/manuais/') ||
               url.endsWith('.css') ||
               url.endsWith('.js') ||
               /\.(jpg|jpeg|png|gif|webp|svg)$/.test(url);
    }

    extractSectionId(navItem) {
        const onclick = navItem.getAttribute('onclick');
        const match = onclick?.match(/showSection\('([^']+)'/);
        return match ? match[1] : null;
    }

    // Public API

    preload(url, type) {
        return this.preloadAsset(url, type);
    }

    getImage(path, size, format) {
        return this.getOptimizedImageUrl(path, size, format);
    }

    createResponsiveImage(path, options) {
        return this.generateResponsiveImageHtml(path, options);
    }

    onUpdate(callback) {
        this.updateCallback = callback;
    }

    getStats() {
        return {
            cache: this.getCacheStats(),
            performance: this.generatePerformanceReport()
        };
    }
}

// Global instance
let assetManager = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    assetManager = new AssetManager({
        enableLazyLoading: true,
        enablePreloading: true,
        enableCache: true
    });
    
    // Make available globally
    window.assetManager = assetManager;
    
    // Periodic performance monitoring
    if (process.env.NODE_ENV === 'development') {
        setInterval(() => {
            assetManager.generatePerformanceReport();
        }, 60000); // A cada minuto em dev
    }
});

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AssetManager;
}