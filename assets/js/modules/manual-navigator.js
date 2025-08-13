/**
 * EleveLab Manual Navigator - Sistema de navegação entre manuais
 * Gerencia navegação contextual e relacionamentos entre equipamentos
 */

class ManualNavigator {
    constructor() {
        this.currentManual = this.detectCurrentManual();
        this.manualsData = this.loadManualsData();
        this.init();
    }

    init() {
        this.createNavigationElements();
        this.setupEventListeners();
        this.loadRelatedManuals();
        this.setupBreadcrumbs();
    }

    detectCurrentManual() {
        const path = window.location.pathname;
        const match = path.match(/\/manuais\/([^\/]+)\//);
        return match ? match[1] : null;
    }

    loadManualsData() {
        return {
            'sox406': {
                title: 'Determinador de Gordura SOX406',
                category: 'determinadores',
                type: 'extraction',
                related: ['analisador-fibras', 'destilador-nitrogenio'],
                keywords: ['gordura', 'lipídios', 'soxhlet', 'extração']
            },
            'analisador-fibras': {
                title: 'Analisador de Fibras Automatizado',
                category: 'analisadores',
                type: 'analysis',
                related: ['sox406', 'destilador-nitrogenio'],
                keywords: ['fibra', 'FDA', 'FDN', 'van soest']
            },
            'destilador-nitrogenio': {
                title: 'Destilador de Nitrogênio Automatizado',
                category: 'destiladores',
                type: 'distillation',
                related: ['sox406', 'analisador-fibras'],
                keywords: ['nitrogênio', 'proteína', 'kjeldahl']
            },
            'biorreator': {
                title: 'Biorreator Autoclavável de Bancada',
                category: 'biorreatores',
                type: 'cultivation',
                related: ['fotobiorreator'],
                keywords: ['cultivo', 'fermentação', 'células', 'microrganismos']
            },
            'fotobiorreator': {
                title: 'Fotobiorreator Autoclavável',
                category: 'biorreatores',
                type: 'cultivation',
                related: ['biorreator'],
                keywords: ['microalgas', 'fotossíntese', 'LED', 'luz']
            }
        };
    }

    createNavigationElements() {
        this.createManualHeader();
        this.createQuickNavigation();
        this.createFooterNavigation();
        this.createFloatingNavigator();
    }

    createManualHeader() {
        if (!this.currentManual || !this.manualsData[this.currentManual]) return;

        const header = document.querySelector('.header-content');
        if (!header) return;

        const currentData = this.manualsData[this.currentManual];
        
        // Adicionar breadcrumb
        const breadcrumb = document.createElement('div');
        breadcrumb.className = 'breadcrumb';
        breadcrumb.innerHTML = `
            <a href="../../index.html">Catálogo</a>
            <span class="separator">›</span>
            <a href="../../index.html#${currentData.category}">${this.categoryName(currentData.category)}</a>
            <span class="separator">›</span>
            <span class="current">${currentData.title}</span>
        `;

        // Inserir após o logo
        const logo = header.querySelector('.logo');
        if (logo) {
            logo.parentNode.insertBefore(breadcrumb, logo.nextSibling);
        }
    }

    createQuickNavigation() {
        const nav = document.querySelector('.nav .container');
        if (!nav) return;

        const quickNav = document.createElement('div');
        quickNav.className = 'quick-navigation';
        quickNav.innerHTML = `
            <div class="quick-nav-content">
                <button class="quick-nav-toggle" aria-label="Navegação rápida">
                    <span class="icon">⚡</span>
                    <span class="text">Navegação Rápida</span>
                </button>
                <div class="quick-nav-menu">
                    <div class="quick-nav-section">
                        <h4>Outros Manuais</h4>
                        <div class="quick-nav-items" id="quickNavManuals"></div>
                    </div>
                    <div class="quick-nav-section">
                        <h4>Seções Atuais</h4>
                        <div class="quick-nav-items" id="quickNavSections"></div>
                    </div>
                </div>
            </div>
        `;

        nav.appendChild(quickNav);
        this.populateQuickNavigation();
    }

    createFooterNavigation() {
        const main = document.querySelector('main');
        if (!main) return;

        const footerNav = document.createElement('div');
        footerNav.className = 'manual-footer-navigation';
        footerNav.innerHTML = `
            <div class="container">
                <div class="footer-nav-content">
                    <div class="nav-section prev-manual">
                        <div class="nav-label">Manual Anterior</div>
                        <div class="nav-item" id="prevManual"></div>
                    </div>
                    <div class="nav-section catalog-link">
                        <a href="../../index.html" class="btn btn-primary">
                            <span class="icon">📚</span>
                            Voltar ao Catálogo
                        </a>
                    </div>
                    <div class="nav-section next-manual">
                        <div class="nav-label">Próximo Manual</div>
                        <div class="nav-item" id="nextManual"></div>
                    </div>
                </div>
                <div class="related-manuals" id="relatedManuals"></div>
            </div>
        `;

        main.appendChild(footerNav);
        this.populateFooterNavigation();
    }

    createFloatingNavigator() {
        const floatingNav = document.createElement('div');
        floatingNav.className = 'floating-navigator';
        floatingNav.innerHTML = `
            <button class="floating-nav-toggle" aria-label="Menu de navegação">
                <span class="icon">🧭</span>
            </button>
            <div class="floating-nav-content">
                <div class="floating-nav-header">
                    <h4>Navegação</h4>
                    <button class="close-floating-nav" aria-label="Fechar">×</button>
                </div>
                <div class="floating-nav-body">
                    <div class="nav-group">
                        <h5>Seções</h5>
                        <div class="nav-items" id="floatingSections"></div>
                    </div>
                    <div class="nav-group">
                        <h5>Outros Manuais</h5>
                        <div class="nav-items" id="floatingManuals"></div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(floatingNav);
        this.setupFloatingNavigator();
    }

    populateQuickNavigation() {
        const manualsContainer = document.getElementById('quickNavManuals');
        const sectionsContainer = document.getElementById('quickNavSections');

        if (manualsContainer) {
            manualsContainer.innerHTML = this.generateManualsLinks();
        }

        if (sectionsContainer) {
            sectionsContainer.innerHTML = this.generateSectionsLinks();
        }
    }

    populateFooterNavigation() {
        const manualsList = Object.keys(this.manualsData);
        const currentIndex = manualsList.indexOf(this.currentManual);
        
        // Manual anterior
        const prevManual = document.getElementById('prevManual');
        if (prevManual && currentIndex > 0) {
            const prevKey = manualsList[currentIndex - 1];
            const prevData = this.manualsData[prevKey];
            prevManual.innerHTML = `
                <a href="../${prevKey}/" class="nav-link">
                    <span class="nav-title">${prevData.title}</span>
                    <span class="nav-category">${this.categoryName(prevData.category)}</span>
                </a>
            `;
        }

        // Próximo manual
        const nextManual = document.getElementById('nextManual');
        if (nextManual && currentIndex < manualsList.length - 1) {
            const nextKey = manualsList[currentIndex + 1];
            const nextData = this.manualsData[nextKey];
            nextManual.innerHTML = `
                <a href="../${nextKey}/" class="nav-link">
                    <span class="nav-title">${nextData.title}</span>
                    <span class="nav-category">${this.categoryName(nextData.category)}</span>
                </a>
            `;
        }

        // Manuais relacionados
        this.populateRelatedManuals();
    }

    populateRelatedManuals() {
        const container = document.getElementById('relatedManuals');
        if (!container || !this.currentManual) return;

        const currentData = this.manualsData[this.currentManual];
        if (!currentData.related || currentData.related.length === 0) return;

        const relatedHTML = currentData.related.map(manualKey => {
            const manual = this.manualsData[manualKey];
            return `
                <div class="related-manual-card">
                    <a href="../${manualKey}/" class="related-link">
                        <div class="related-icon">${this.getManualIcon(manual.category)}</div>
                        <div class="related-content">
                            <h5>${manual.title}</h5>
                            <p>${this.categoryName(manual.category)}</p>
                        </div>
                    </a>
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <div class="related-header">
                <h4>Manuais Relacionados</h4>
                <p>Outros equipamentos que podem interessar</p>
            </div>
            <div class="related-grid">
                ${relatedHTML}
            </div>
        `;
    }

    setupFloatingNavigator() {
        const toggle = document.querySelector('.floating-nav-toggle');
        const content = document.querySelector('.floating-nav-content');
        const close = document.querySelector('.close-floating-nav');

        if (toggle && content) {
            toggle.addEventListener('click', () => {
                content.classList.toggle('active');
            });
        }

        if (close && content) {
            close.addEventListener('click', () => {
                content.classList.remove('active');
            });
        }

        // Populate floating navigation
        const sectionsContainer = document.getElementById('floatingSections');
        const manualsContainer = document.getElementById('floatingManuals');

        if (sectionsContainer) {
            sectionsContainer.innerHTML = this.generateSectionsLinks();
        }

        if (manualsContainer) {
            manualsContainer.innerHTML = this.generateManualsLinks();
        }
    }

    setupEventListeners() {
        // Quick navigation toggle
        const quickToggle = document.querySelector('.quick-nav-toggle');
        const quickMenu = document.querySelector('.quick-nav-menu');

        if (quickToggle && quickMenu) {
            quickToggle.addEventListener('click', () => {
                quickMenu.classList.toggle('active');
            });

            // Close on outside click
            document.addEventListener('click', (e) => {
                if (!quickToggle.contains(e.target) && !quickMenu.contains(e.target)) {
                    quickMenu.classList.remove('active');
                }
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'k':
                        e.preventDefault();
                        this.openQuickNavigator();
                        break;
                    case 'h':
                        e.preventDefault();
                        window.location.href = '../../index.html';
                        break;
                }
            }
        });
    }

    setupBreadcrumbs() {
        // Dynamic breadcrumb styling
        const breadcrumb = document.querySelector('.breadcrumb');
        if (breadcrumb) {
            breadcrumb.style.cssText = `
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 14px;
                color: #666;
                margin-left: 20px;
            `;

            // Style links and separators
            breadcrumb.querySelectorAll('a').forEach(link => {
                link.style.cssText = `
                    color: var(--primary-orange);
                    text-decoration: none;
                    transition: color 0.3s ease;
                `;

                link.addEventListener('mouseenter', () => {
                    link.style.color = '#d63200';
                });

                link.addEventListener('mouseleave', () => {
                    link.style.color = 'var(--primary-orange)';
                });
            });

            breadcrumb.querySelectorAll('.separator').forEach(sep => {
                sep.style.cssText = `
                    color: #999;
                    font-weight: bold;
                `;
            });

            breadcrumb.querySelector('.current').style.cssText = `
                color: var(--text-dark);
                font-weight: 600;
            `;
        }
    }

    loadRelatedManuals() {
        // Implement intelligent related manual suggestions
        if (!this.currentManual) return;

        const currentData = this.manualsData[this.currentManual];
        const suggestions = this.generateSuggestions(currentData);
        
        // Update related manuals based on context
        if (suggestions.length > 0) {
            currentData.related = [...new Set([...currentData.related, ...suggestions])];
        }
    }

    generateSuggestions(currentData) {
        const suggestions = [];

        // Suggest by category
        Object.entries(this.manualsData).forEach(([key, data]) => {
            if (key !== this.currentManual) {
                if (data.category === currentData.category) {
                    suggestions.push(key);
                } else if (data.type === currentData.type) {
                    suggestions.push(key);
                }
            }
        });

        return suggestions.slice(0, 3); // Limit suggestions
    }

    generateManualsLinks() {
        return Object.entries(this.manualsData)
            .filter(([key]) => key !== this.currentManual)
            .map(([key, data]) => `
                <a href="../${key}/" class="quick-nav-item">
                    <span class="nav-icon">${this.getManualIcon(data.category)}</span>
                    <span class="nav-text">${data.title}</span>
                </a>
            `).join('');
    }

    generateSectionsLinks() {
        const sections = document.querySelectorAll('.section');
        return Array.from(sections).map(section => `
            <a href="#${section.id}" class="quick-nav-item" onclick="showSection('${section.id}', this)">
                <span class="nav-icon">${this.getSectionIcon(section.id)}</span>
                <span class="nav-text">${this.getSectionName(section.id)}</span>
            </a>
        `).join('');
    }

    openQuickNavigator() {
        const quickMenu = document.querySelector('.quick-nav-menu');
        if (quickMenu) {
            quickMenu.classList.add('active');
            const firstLink = quickMenu.querySelector('a');
            if (firstLink) firstLink.focus();
        }
    }

    categoryName(category) {
        const names = {
            'determinadores': 'Determinadores',
            'analisadores': 'Analisadores',
            'destiladores': 'Destiladores',
            'biorreatores': 'Biorreatores'
        };
        return names[category] || category;
    }

    getManualIcon(category) {
        const icons = {
            'determinadores': '⚗️',
            'analisadores': '🔬',
            'destiladores': '🧪',
            'biorreatores': '🦠'
        };
        return icons[category] || '📋';
    }

    getSectionIcon(sectionId) {
        const icons = {
            'overview': '👁️',
            'specifications': '📊',
            'components': '🔧',
            'installation': '🛠️',
            'operation': '▶️',
            'samples': '🧪',
            'maintenance': '🔧',
            'troubleshooting': '🔍',
            'warranty': '🛡️'
        };
        return icons[sectionId] || '📄';
    }

    getSectionName(sectionId) {
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
    navigateToManual(manualKey) {
        if (this.manualsData[manualKey]) {
            window.location.href = `../${manualKey}/`;
        }
    }

    navigateToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            if (window.showSection) {
                window.showSection(sectionId);
            } else {
                section.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }

    getCurrentManualInfo() {
        return this.manualsData[this.currentManual];
    }

    getRelatedManuals() {
        if (!this.currentManual) return [];
        const currentData = this.manualsData[this.currentManual];
        return currentData.related || [];
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize in manual pages
    if (window.location.pathname.includes('/manuais/')) {
        window.manualNavigator = new ManualNavigator();
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ManualNavigator;
}