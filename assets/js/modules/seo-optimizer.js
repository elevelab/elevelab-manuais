/**
 * EleveLab SEO Optimizer - Otimização automática de SEO
 * Gerencia meta tags, structured data, performance e acessibilidade
 */

class SEOOptimizer {
    constructor(options = {}) {
        this.options = {
            baseUrl: options.baseUrl || 'https://manuais.elevelab.com.br',
            organization: {
                name: 'EleveLab Equipamentos Científicos',
                url: 'https://www.elevelab.com.br',
                logo: '/assets/images/elevelab-logo.png',
                telephone: '+55-51-99858-4548',
                email: 'contato@elevelab.com.br'
            },
            enableAutoOptimization: options.enableAutoOptimization !== false,
            enablePerformanceMonitoring: options.enablePerformanceMonitoring !== false,
            ...options
        };

        this.pageData = this.analyzeCurrentPage();
        this.init();
    }

    init() {
        if (this.options.enableAutoOptimization) {
            this.optimizeCurrentPage();
        }
        
        if (this.options.enablePerformanceMonitoring) {
            this.setupPerformanceMonitoring();
        }
        
        this.setupAnalytics();
        console.log('SEO Optimizer inicializado');
    }

    analyzeCurrentPage() {
        const data = {
            url: window.location.href,
            path: window.location.pathname,
            title: document.title,
            description: this.getMetaContent('description'),
            keywords: this.getMetaContent('keywords'),
            type: this.detectPageType(),
            manual: this.detectManual(),
            section: this.detectCurrentSection(),
            language: document.documentElement.lang || 'pt-BR',
            lastModified: this.detectLastModified()
        };

        return data;
    }

    detectPageType() {
        const path = window.location.pathname;
        
        if (path === '/' || path === '/index.html') {
            return 'catalog';
        } else if (path.includes('/manuais/')) {
            return 'manual';
        } else {
            return 'page';
        }
    }

    detectManual() {
        const match = window.location.pathname.match(/\/manuais\/([^\/]+)\//);
        return match ? match[1] : null;
    }

    detectCurrentSection() {
        const activeSection = document.querySelector('.section.active');
        return activeSection ? activeSection.id : null;
    }

    detectLastModified() {
        // Tentar extrair data da página
        const metaModified = document.querySelector('meta[name="last-modified"]');
        if (metaModified) {
            return metaModified.content;
        }
        
        // Fallback para data atual
        return new Date().toISOString();
    }

    // Meta Tags Optimization

    optimizeCurrentPage() {
        this.updateMetaTags();
        this.addOpenGraphTags();
        this.addTwitterCardTags();
        this.addStructuredData();
        this.optimizeHeadings();
        this.addBreadcrumbStructuredData();
        this.optimizeImages();
    }

    updateMetaTags() {
        // Title otimizado
        const optimizedTitle = this.generateOptimizedTitle();
        if (optimizedTitle !== document.title) {
            document.title = optimizedTitle;
            this.updateOrCreateMeta('og:title', optimizedTitle);
        }

        // Description otimizada
        const optimizedDescription = this.generateOptimizedDescription();
        this.updateOrCreateMeta('description', optimizedDescription);
        this.updateOrCreateMeta('og:description', optimizedDescription);

        // Keywords
        const keywords = this.generateKeywords();
        if (keywords) {
            this.updateOrCreateMeta('keywords', keywords);
        }

        // Canonical URL
        this.addCanonicalUrl();

        // Language tags
        this.addLanguageTags();
    }

    generateOptimizedTitle() {
        const { type, manual, section } = this.pageData;
        
        if (type === 'catalog') {
            return 'Manuais EleveLab - Equipamentos Científicos | Catálogo Completo';
        }
        
        if (type === 'manual' && manual) {
            const manualData = this.getManualData(manual);
            const sectionName = section ? this.getSectionDisplayName(section) : '';
            
            let title = manualData.title;
            if (sectionName) {
                title += ` - ${sectionName}`;
            }
            title += ' | Manual EleveLab';
            
            return title;
        }

        return document.title;
    }

    generateOptimizedDescription() {
        const { type, manual, section } = this.pageData;
        
        if (type === 'catalog') {
            return 'Acesse os manuais interativos completos dos equipamentos científicos EleveLab. Determinadores, analisadores, biorreatores e mais. Navegação intuitiva e suporte técnico integrado.';
        }
        
        if (type === 'manual' && manual) {
            const manualData = this.getManualData(manual);
            let description = `Manual completo do ${manualData.title}. `;
            description += `Instruções detalhadas, especificações técnicas e procedimentos de operação. `;
            description += 'EleveLab - Equipamentos científicos de qualidade.';
            
            return description;
        }

        return this.getMetaContent('description') || 'EleveLab - Equipamentos Científicos';
    }

    generateKeywords() {
        const { type, manual } = this.pageData;
        const baseKeywords = ['EleveLab', 'equipamentos científicos', 'manuais', 'laboratório'];
        
        if (type === 'catalog') {
            return [...baseKeywords, 'catálogo', 'determinadores', 'analisadores', 'biorreatores', 'destiladores'].join(', ');
        }
        
        if (type === 'manual' && manual) {
            const manualData = this.getManualData(manual);
            const manualKeywords = manualData.keywords || [];
            return [...baseKeywords, ...manualKeywords, 'manual', 'instruções'].join(', ');
        }

        return baseKeywords.join(', ');
    }

    addOpenGraphTags() {
        const { url, type } = this.pageData;
        
        this.updateOrCreateMeta('og:type', 'website', 'property');
        this.updateOrCreateMeta('og:url', url, 'property');
        this.updateOrCreateMeta('og:site_name', 'EleveLab Manuais', 'property');
        this.updateOrCreateMeta('og:locale', 'pt_BR', 'property');
        
        // Imagem
        const ogImage = this.selectOptimalImage();
        this.updateOrCreateMeta('og:image', ogImage, 'property');
        this.updateOrCreateMeta('og:image:width', '1200', 'property');
        this.updateOrCreateMeta('og:image:height', '630', 'property');
        this.updateOrCreateMeta('og:image:alt', this.generateImageAlt(), 'property');
    }

    addTwitterCardTags() {
        this.updateOrCreateMeta('twitter:card', 'summary_large_image');
        this.updateOrCreateMeta('twitter:site', '@EleveLab');
        this.updateOrCreateMeta('twitter:creator', '@EleveLab');
        
        const ogImage = this.selectOptimalImage();
        this.updateOrCreateMeta('twitter:image', ogImage);
        this.updateOrCreateMeta('twitter:image:alt', this.generateImageAlt());
    }

    addStructuredData() {
        // WebPage Schema
        const webPageSchema = this.generateWebPageSchema();
        this.insertStructuredData('webpage', webPageSchema);

        // Organization Schema
        const organizationSchema = this.generateOrganizationSchema();
        this.insertStructuredData('organization', organizationSchema);

        // Breadcrumb Schema (se aplicável)
        if (this.pageData.type === 'manual') {
            const breadcrumbSchema = this.generateBreadcrumbSchema();
            this.insertStructuredData('breadcrumb', breadcrumbSchema);
        }

        // Manual specific schemas
        if (this.pageData.type === 'manual') {
            const manualSchema = this.generateManualSchema();
            this.insertStructuredData('manual', manualSchema);
        }
    }

    generateWebPageSchema() {
        return {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": document.title,
            "description": this.getMetaContent('description'),
            "url": window.location.href,
            "inLanguage": "pt-BR",
            "isPartOf": {
                "@type": "WebSite",
                "name": "EleveLab Manuais",
                "url": this.options.baseUrl
            },
            "publisher": {
                "@type": "Organization",
                "name": this.options.organization.name,
                "url": this.options.organization.url
            },
            "dateModified": this.pageData.lastModified,
            "breadcrumb": this.generateBreadcrumbSchema()
        };
    }

    generateOrganizationSchema() {
        return {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": this.options.organization.name,
            "url": this.options.organization.url,
            "logo": `${this.options.baseUrl}${this.options.organization.logo}`,
            "telephone": this.options.organization.telephone,
            "email": this.options.organization.email,
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "Av. Benjamin Constant 19, Loja 35",
                "addressLocality": "Porto Alegre",
                "addressRegion": "RS",
                "postalCode": "90550-003",
                "addressCountry": "BR"
            }
        };
    }

    generateBreadcrumbSchema() {
        if (this.pageData.type !== 'manual') return null;

        const items = [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Catálogo",
                "item": this.options.baseUrl
            }
        ];

        if (this.pageData.manual) {
            const manualData = this.getManualData(this.pageData.manual);
            items.push({
                "@type": "ListItem",
                "position": 2,
                "name": manualData.category,
                "item": `${this.options.baseUrl}#${manualData.category}`
            });

            items.push({
                "@type": "ListItem",
                "position": 3,
                "name": manualData.title,
                "item": window.location.href
            });
        }

        return {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": items
        };
    }

    generateManualSchema() {
        if (!this.pageData.manual) return null;

        const manualData = this.getManualData(this.pageData.manual);
        
        return {
            "@context": "https://schema.org",
            "@type": "TechArticle",
            "headline": manualData.title,
            "description": this.getMetaContent('description'),
            "url": window.location.href,
            "dateModified": this.pageData.lastModified,
            "author": {
                "@type": "Organization",
                "name": this.options.organization.name
            },
            "publisher": {
                "@type": "Organization",
                "name": this.options.organization.name,
                "logo": {
                    "@type": "ImageObject",
                    "url": `${this.options.baseUrl}${this.options.organization.logo}`
                }
            },
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": window.location.href
            },
            "about": {
                "@type": "Product",
                "name": manualData.title,
                "category": manualData.category,
                "manufacturer": {
                    "@type": "Organization",
                    "name": this.options.organization.name
                }
            }
        };
    }

    // Performance Monitoring

    setupPerformanceMonitoring() {
        this.monitorCoreBebVitals();
        this.monitorResourceLoading();
        this.setupIntersectionObserver();
        
        // Report performance periodically
        setTimeout(() => this.generateSEOReport(), 5000);
    }

    monitorCoreBebVitals() {
        // Largest Contentful Paint (LCP)
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            this.reportMetric('LCP', lastEntry.startTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay (FID)
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach(entry => {
                this.reportMetric('FID', entry.processingStart - entry.startTime);
            });
        }).observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift (CLS)
        let clsScore = 0;
        new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
                if (!entry.hadRecentInput) {
                    clsScore += entry.value;
                }
            }
            this.reportMetric('CLS', clsScore);
        }).observe({ entryTypes: ['layout-shift'] });
    }

    monitorResourceLoading() {
        // Monitor critical resource loading
        window.addEventListener('load', () => {
            const navigation = performance.getEntriesByType('navigation')[0];
            this.reportMetric('Page Load', navigation.loadEventEnd - navigation.fetchStart);
            
            // Monitor asset loading times
            const resources = performance.getEntriesByType('resource');
            resources.forEach(resource => {
                if (resource.name.includes('/assets/')) {
                    this.reportMetric(`Asset: ${resource.name.split('/').pop()}`, resource.duration);
                }
            });
        });
    }

    setupIntersectionObserver() {
        // Monitor section visibility for analytics
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.reportSectionView(entry.target.id);
                }
            });
        }, { threshold: 0.5 });

        document.querySelectorAll('.section').forEach(section => {
            sectionObserver.observe(section);
        });
    }

    // Analytics and Reporting

    setupAnalytics() {
        // Google Analytics 4 (se configurado)
        if (typeof gtag !== 'undefined') {
            gtag('config', 'GA_MEASUREMENT_ID', {
                page_title: document.title,
                page_location: window.location.href,
                content_group1: this.pageData.type,
                content_group2: this.pageData.manual,
                content_group3: this.pageData.section
            });
        }

        // Custom analytics
        this.reportPageView();
    }

    reportPageView() {
        const pageViewData = {
            type: 'page_view',
            page: this.pageData.path,
            title: document.title,
            referrer: document.referrer,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
            screen_resolution: `${screen.width}x${screen.height}`,
            viewport_size: `${window.innerWidth}x${window.innerHeight}`
        };

        this.sendAnalyticsEvent(pageViewData);
    }

    reportMetric(name, value) {
        const metricData = {
            type: 'performance_metric',
            metric: name,
            value: Math.round(value),
            page: this.pageData.path,
            timestamp: new Date().toISOString()
        };

        this.sendAnalyticsEvent(metricData);
        console.log(`📊 ${name}: ${Math.round(value)}ms`);
    }

    reportSectionView(sectionId) {
        const sectionData = {
            type: 'section_view',
            section: sectionId,
            manual: this.pageData.manual,
            timestamp: new Date().toISOString()
        };

        this.sendAnalyticsEvent(sectionData);
    }

    sendAnalyticsEvent(data) {
        // Send to analytics service
        if (typeof gtag !== 'undefined') {
            gtag('event', data.type, data);
        }

        // Send to custom analytics endpoint (if configured)
        if (this.options.analyticsEndpoint) {
            fetch(this.options.analyticsEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            }).catch(err => console.warn('Analytics error:', err));
        }
    }

    generateSEOReport() {
        const report = {
            page: {
                url: window.location.href,
                title: document.title,
                description: this.getMetaContent('description'),
                keywords: this.getMetaContent('keywords'),
                lang: document.documentElement.lang
            },
            meta: {
                og_tags: this.countMetaTags('og:'),
                twitter_tags: this.countMetaTags('twitter:'),
                structured_data: document.querySelectorAll('script[type="application/ld+json"]').length
            },
            accessibility: {
                images_with_alt: document.querySelectorAll('img[alt]').length,
                images_without_alt: document.querySelectorAll('img:not([alt])').length,
                headings: {
                    h1: document.querySelectorAll('h1').length,
                    h2: document.querySelectorAll('h2').length,
                    h3: document.querySelectorAll('h3').length
                }
            },
            performance: this.getPerformanceMetrics(),
            timestamp: new Date().toISOString()
        };

        console.table(report);
        return report;
    }

    // Utility Methods

    getMetaContent(name) {
        const meta = document.querySelector(`meta[name="${name}"]`);
        return meta ? meta.content : '';
    }

    updateOrCreateMeta(name, content, attribute = 'name') {
        let meta = document.querySelector(`meta[${attribute}="${name}"]`);
        
        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute(attribute, name);
            document.head.appendChild(meta);
        }
        
        meta.content = content;
    }

    insertStructuredData(id, data) {
        // Remove existing
        const existing = document.getElementById(`structured-data-${id}`);
        if (existing) existing.remove();

        // Insert new
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = `structured-data-${id}`;
        script.textContent = JSON.stringify(data, null, 2);
        document.head.appendChild(script);
    }

    addCanonicalUrl() {
        let canonical = document.querySelector('link[rel="canonical"]');
        
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.rel = 'canonical';
            document.head.appendChild(canonical);
        }
        
        canonical.href = window.location.href.split('#')[0];
    }

    addLanguageTags() {
        // hreflang tags for internationalization
        const hreflang = document.querySelector('link[hreflang]');
        if (!hreflang) {
            const link = document.createElement('link');
            link.rel = 'alternate';
            link.hreflang = 'pt-BR';
            link.href = window.location.href;
            document.head.appendChild(link);
        }
    }

    selectOptimalImage() {
        // Select best image for sharing
        const manualImage = document.querySelector('.equipment-image img');
        if (manualImage) return manualImage.src;
        
        const firstImage = document.querySelector('img[src]');
        if (firstImage) return firstImage.src;
        
        return `${this.options.baseUrl}/assets/images/elevelab-og-image.jpg`;
    }

    generateImageAlt() {
        if (this.pageData.manual) {
            const manualData = this.getManualData(this.pageData.manual);
            return `${manualData.title} - EleveLab Equipamentos Científicos`;
        }
        
        return 'EleveLab - Equipamentos Científicos de Qualidade';
    }

    optimizeHeadings() {
        // Ensure proper heading hierarchy
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        let expectedLevel = 1;
        
        headings.forEach(heading => {
            const currentLevel = parseInt(heading.tagName[1]);
            if (currentLevel > expectedLevel + 1) {
                console.warn(`Heading hierarchy issue: ${heading.tagName} after h${expectedLevel}`);
            }
            expectedLevel = currentLevel;
        });
    }

    optimizeImages() {
        // Add missing alt attributes
        document.querySelectorAll('img:not([alt])').forEach(img => {
            img.alt = this.generateImageAltFromContext(img);
        });

        // Add loading attributes
        document.querySelectorAll('img:not([loading])').forEach(img => {
            if (this.isAboveFold(img)) {
                img.loading = 'eager';
            } else {
                img.loading = 'lazy';
            }
        });
    }

    generateImageAltFromContext(img) {
        // Try to generate alt text from context
        const parent = img.closest('.image-card, .content-card, .equipment-showcase');
        if (parent) {
            const title = parent.querySelector('h1, h2, h3, h4, h5, h6');
            if (title) return title.textContent;
        }
        
        return 'Imagem do equipamento EleveLab';
    }

    isAboveFold(element) {
        const rect = element.getBoundingClientRect();
        return rect.top < window.innerHeight;
    }

    countMetaTags(prefix) {
        return document.querySelectorAll(`meta[property^="${prefix}"], meta[name^="${prefix}"]`).length;
    }

    getPerformanceMetrics() {
        if (!window.performance) return {};
        
        const navigation = performance.getEntriesByType('navigation')[0];
        return {
            dns_lookup: navigation.domainLookupEnd - navigation.domainLookupStart,
            tcp_connect: navigation.connectEnd - navigation.connectStart,
            request_response: navigation.responseEnd - navigation.requestStart,
            dom_processing: navigation.domContentLoadedEventEnd - navigation.responseEnd,
            page_load: navigation.loadEventEnd - navigation.fetchStart
        };
    }

    getManualData(manualKey) {
        // Mock data - em produção viria de uma fonte de dados
        const manuals = {
            'sox406': {
                title: 'Determinador de Gordura SOX406',
                category: 'determinadores',
                keywords: ['gordura', 'lipídios', 'soxhlet', 'extração', 'alimentos']
            },
            'analisador-fibras': {
                title: 'Analisador de Fibras Automatizado',
                category: 'analisadores', 
                keywords: ['fibra', 'FDA', 'FDN', 'van soest', 'forragem']
            }
            // ... outros manuais
        };

        return manuals[manualKey] || { title: manualKey, category: 'equipamentos', keywords: [] };
    }

    getSectionDisplayName(sectionId) {
        const names = {
            'overview': 'Visão Geral',
            'specifications': 'Especificações',
            'components': 'Componentes',
            'installation': 'Instalação',
            'operation': 'Operação',
            'samples': 'Amostras',
            'maintenance': 'Manutenção',
            'troubleshooting': 'Solução de Problemas',
            'warranty': 'Garantia'
        };
        
        return names[sectionId] || sectionId;
    }

    // Public API
    updatePage(newPageData) {
        this.pageData = { ...this.pageData, ...newPageData };
        this.optimizeCurrentPage();
    }

    getPageData() {
        return this.pageData;
    }

    getSEOScore() {
        // Calculate SEO score based on various factors
        let score = 0;
        
        // Title optimization
        if (document.title.length >= 30 && document.title.length <= 60) score += 20;
        
        // Description optimization  
        const description = this.getMetaContent('description');
        if (description.length >= 120 && description.length <= 160) score += 20;
        
        // Headings
        if (document.querySelectorAll('h1').length === 1) score += 15;
        if (document.querySelectorAll('h2').length > 0) score += 10;
        
        // Images with alt
        const totalImages = document.querySelectorAll('img').length;
        const imagesWithAlt = document.querySelectorAll('img[alt]').length;
        if (totalImages > 0) score += (imagesWithAlt / totalImages) * 15;
        
        // Structured data
        if (document.querySelectorAll('script[type="application/ld+json"]').length > 0) score += 20;
        
        return Math.min(100, score);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.seoOptimizer = new SEOOptimizer({
        enableAutoOptimization: true,
        enablePerformanceMonitoring: true
    });
});

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SEOOptimizer;
}