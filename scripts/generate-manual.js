#!/usr/bin/env node

/**
 * Gerador Automático de Manuais EleveLab
 * 
 * Este script gera automaticamente um novo manual baseado no template
 * com toda a estrutura necessária e metadados SEO otimizados.
 * 
 * Uso: node scripts/generate-manual.js --name "nome-equipamento" --title "Título do Equipamento"
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuração padrão
const DEFAULT_CONFIG = {
    templatePath: 'templates/manual-template.html',
    manualsDir: 'manuais',
    version: '1.0',
    author: 'EleveLab Team',
    date: new Date().toLocaleDateString('pt-BR')
};

class ManualGenerator {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    async generateManual(options = {}) {
        try {
            console.log('🚀 Gerador de Manuais EleveLab\n');
            
            // Coletar informações do usuário
            const config = await this.collectManualInfo(options);
            
            // Validar dados
            this.validateConfig(config);
            
            // Gerar estrutura de diretórios
            await this.createDirectoryStructure(config);
            
            // Gerar arquivo HTML do manual
            await this.generateHTMLFile(config);
            
            // Atualizar catálogo principal
            await this.updateMainCatalog(config);
            
            // Gerar sitemap
            await this.updateSitemap(config);
            
            console.log(`✅ Manual "${config.title}" gerado com sucesso!`);
            console.log(`📁 Localização: manuais/${config.name}/`);
            console.log(`🌐 URL: manuais/${config.name}/index.html`);
            
        } catch (error) {
            console.error('❌ Erro ao gerar manual:', error.message);
            process.exit(1);
        } finally {
            this.rl.close();
        }
    }

    async collectManualInfo(options) {
        const config = { ...DEFAULT_CONFIG };

        // Nome do equipamento
        config.name = options.name || await this.question('Nome do equipamento (ex: digestor-microondas): ');
        config.name = config.name.toLowerCase().replace(/[^a-z0-9-]/g, '-');

        // Título completo
        config.title = options.title || await this.question('Título completo do equipamento: ');

        // Categoria
        config.category = await this.question('Categoria (determinadores/analisadores/biorreatores/destiladores): ');

        // Descrição curta
        config.description = await this.question('Descrição curta para SEO (150 caracteres): ');

        // Aplicações principais
        config.applications = await this.question('Aplicações principais (separadas por ;): ');

        // Princípio de funcionamento
        config.principle = await this.question('Princípio de funcionamento (resumo): ');

        // Especificações técnicas básicas
        config.specifications = await this.collectSpecifications();

        // Características avançadas
        config.features = await this.question('Características avançadas (separadas por ;): ');

        // Condições de trabalho
        config.workingConditions = await this.question('Condições de trabalho principais (separadas por ;): ');

        return config;
    }

    async collectSpecifications() {
        const specs = [];
        console.log('\n📋 Especificações Técnicas (pressione Enter em branco para finalizar):');
        
        while (true) {
            const param = await this.question('Parâmetro: ');
            if (!param.trim()) break;
            
            const value = await this.question(`Valor para "${param}": `);
            specs.push({ param, value });
        }
        
        return specs;
    }

    validateConfig(config) {
        const required = ['name', 'title', 'category', 'description'];
        
        for (const field of required) {
            if (!config[field] || config[field].trim() === '') {
                throw new Error(`Campo obrigatório não preenchido: ${field}`);
            }
        }

        // Validar categoria
        const validCategories = ['determinadores', 'analisadores', 'biorreatores', 'destiladores'];
        if (!validCategories.includes(config.category)) {
            throw new Error(`Categoria inválida. Use: ${validCategories.join(', ')}`);
        }

        // Validar nome (slug)
        if (!/^[a-z0-9-]+$/.test(config.name)) {
            throw new Error('Nome deve conter apenas letras minúsculas, números e hífens');
        }
    }

    async createDirectoryStructure(config) {
        const manualDir = path.join(config.manualsDir, config.name);
        
        // Criar diretório do manual
        if (!fs.existsSync(manualDir)) {
            fs.mkdirSync(manualDir, { recursive: true });
            console.log(`📁 Criado diretório: ${manualDir}`);
        }

        // Criar subdiretórios se necessário
        const subdirs = ['images', 'docs'];
        for (const subdir of subdirs) {
            const subdirPath = path.join(manualDir, subdir);
            if (!fs.existsSync(subdirPath)) {
                fs.mkdirSync(subdirPath);
            }
        }
    }

    async generateHTMLFile(config) {
        // Ler template base
        const templatePath = config.templatePath;
        if (!fs.existsSync(templatePath)) {
            throw new Error(`Template não encontrado: ${templatePath}`);
        }

        let template = fs.readFileSync(templatePath, 'utf-8');

        // Substituir placeholders
        const replacements = this.buildReplacements(config);
        
        for (const [placeholder, value] of Object.entries(replacements)) {
            const regex = new RegExp(`\\{\\{${placeholder}\\}\\}`, 'g');
            template = template.replace(regex, value);
        }

        // Salvar arquivo
        const outputPath = path.join(config.manualsDir, config.name, 'index.html');
        fs.writeFileSync(outputPath, template);
        console.log(`📄 Arquivo HTML gerado: ${outputPath}`);
    }

    buildReplacements(config) {
        const applications = config.applications.split(';').map(app => 
            `<li><strong>${app.trim()}</strong></li>`
        ).join('\n                                ');

        const specifications = config.specifications.map(spec => 
            `<tr><td>${spec.param}</td><td>${spec.value}</td></tr>`
        ).join('\n                            ');

        const features = config.features.split(';').map(feature => 
            `<li><strong>${feature.trim()}</strong></li>`
        ).join('\n                                ');

        const workingConditions = config.workingConditions.split(';').map(condition => 
            `<li><strong>${condition.trim()}</strong></li>`
        ).join('\n                                ');

        return {
            EQUIPMENT_NAME: config.title,
            EQUIPMENT_FULL_NAME: config.title,
            EQUIPMENT_DESCRIPTION: config.description,
            EQUIPMENT_IMAGE_PLACEHOLDER: `Sistema ${config.title}`,
            HIGHLIGHT_TITLE: config.title + ' EleveLab',
            HIGHLIGHT_DESCRIPTION: config.principle,
            APPLICATIONS_CONTENT: `
                            <p>O ${config.title} é utilizado para:</p>
                            <ul>
                                ${applications}
                            </ul>`,
            WORKING_PRINCIPLE_CONTENT: `
                            <p>${config.principle}</p>
                            <p style="margin-top: 15px;"><strong>Automação completa:</strong> Sistema totalmente automatizado para resultados precisos.</p>`,
            SPECIFICATIONS_TABLE: specifications,
            ADVANCED_FEATURES: `
                            <ul>
                                ${features}
                            </ul>`,
            WORKING_CONDITIONS: `
                            <ul>
                                ${workingConditions}
                            </ul>`,
            COMPONENTS_IMAGES: this.generateImagePlaceholders(),
            MAIN_COMPONENTS: '<p>Componentes principais do equipamento serão descritos aqui.</p>',
            COOLING_SYSTEM: '<p>Sistema de refrigeração será descrito aqui se aplicável.</p>',
            INSTALLATION_STEPS: this.generateInstallationSteps(),
            REAGENTS_CONTENT: '<p>Reagentes necessários serão listados aqui.</p>',
            USER_INTERFACE_CONTENT: '<p>Interface do usuário será descrita aqui.</p>',
            OPERATION_IMAGES: this.generateImagePlaceholders(),
            OPERATION_STEPS: this.generateOperationSteps(),
            SAMPLE_TYPES: this.generateSampleTypes(),
            SAMPLE_PREPARATION_STEPS: this.generateSampleSteps(),
            MAINTENANCE_STEPS: this.generateMaintenanceSteps(),
            MAINTENANCE_SCHEDULE: this.generateMaintenanceSchedule(),
            TROUBLESHOOTING_TABLE: this.generateTroubleshootingTable(),
            ADDITIONAL_TROUBLESHOOTING: '',
            SAFETY_CONSIDERATIONS: this.generateSafetyConsiderations(),
            VERSION: config.version,
            DATE: config.date
        };
    }

    generateImagePlaceholders() {
        return `
                    <div class="image-card">
                        <div class="image-placeholder">
                            Vista Frontal<br>Equipamento
                        </div>
                        <div class="image-caption">Visão geral do equipamento</div>
                    </div>
                    
                    <div class="image-card">
                        <div class="image-placeholder">
                            Painel de Controle<br>Interface
                        </div>
                        <div class="image-caption">Sistema de controle</div>
                    </div>`;
    }

    generateInstallationSteps() {
        return `
                    <div class="step-item">
                        <div class="step-number">1</div>
                        <div class="step-title">Preparação do Local</div>
                        <div class="step-content">
                            <p>Preparar o local de instalação seguindo os requisitos técnicos.</p>
                        </div>
                    </div>

                    <div class="step-item">
                        <div class="step-number">2</div>
                        <div class="step-title">Conexões Elétricas</div>
                        <div class="step-content">
                            <p>Realizar conexões elétricas conforme especificações.</p>
                        </div>
                    </div>

                    <div class="step-item">
                        <div class="step-number">3</div>
                        <div class="step-title">Teste Inicial</div>
                        <div class="step-content">
                            <p>Executar teste inicial e calibração básica.</p>
                        </div>
                    </div>`;
    }

    generateOperationSteps() {
        return `
                    <div class="step-item">
                        <div class="step-number">1</div>
                        <div class="step-title">Preparação</div>
                        <div class="step-content">
                            <p>Preparar o sistema para operação.</p>
                        </div>
                    </div>

                    <div class="step-item">
                        <div class="step-number">2</div>
                        <div class="step-title">Configuração</div>
                        <div class="step-content">
                            <p>Configurar parâmetros de análise.</p>
                        </div>
                    </div>

                    <div class="step-item">
                        <div class="step-number">3</div>
                        <div class="step-title">Execução</div>
                        <div class="step-content">
                            <p>Executar análise automaticamente.</p>
                        </div>
                    </div>`;
    }

    generateSampleTypes() {
        return `
                    <div class="content-card">
                        <h2 class="card-title">🧪 Tipo de Amostra 1</h2>
                        <div class="card-content">
                            <p>Descrição do tipo de amostra e preparo específico.</p>
                        </div>
                    </div>

                    <div class="content-card">
                        <h2 class="card-title">🧪 Tipo de Amostra 2</h2>
                        <div class="card-content">
                            <p>Descrição do tipo de amostra e preparo específico.</p>
                        </div>
                    </div>`;
    }

    generateSampleSteps() {
        return `
                    <div class="step-item">
                        <div class="step-number">1</div>
                        <div class="step-title">Preparo Inicial</div>
                        <div class="step-content">
                            <p>Preparar amostra conforme protocolo.</p>
                        </div>
                    </div>

                    <div class="step-item">
                        <div class="step-number">2</div>
                        <div class="step-title">Pesagem</div>
                        <div class="step-content">
                            <p>Pesar quantidade adequada de amostra.</p>
                        </div>
                    </div>`;
    }

    generateMaintenanceSteps() {
        return `
                    <div class="step-item">
                        <div class="step-number">1</div>
                        <div class="step-title">Limpeza Diária</div>
                        <div class="step-content">
                            <p>Realizar limpeza diária dos componentes.</p>
                        </div>
                    </div>

                    <div class="step-item">
                        <div class="step-number">2</div>
                        <div class="step-title">Verificação Semanal</div>
                        <div class="step-content">
                            <p>Verificar funcionamento dos sistemas principais.</p>
                        </div>
                    </div>`;
    }

    generateMaintenanceSchedule() {
        return `
                        <strong>Diário:</strong> Limpeza geral e verificações básicas<br>
                        <strong>Semanal:</strong> Inspeção detalhada<br>
                        <strong>Mensal:</strong> Calibração e ajustes<br>
                        <strong>Trimestral:</strong> Manutenção com técnico especializado`;
    }

    generateTroubleshootingTable() {
        return `
                            <tr>
                                <td><strong>Problema comum 1</strong></td>
                                <td>Possível causa</td>
                                <td>Solução recomendada</td>
                            </tr>
                            <tr>
                                <td><strong>Problema comum 2</strong></td>
                                <td>Possível causa</td>
                                <td>Solução recomendada</td>
                            </tr>`;
    }

    generateSafetyConsiderations() {
        return `• Leia todas instruções antes da operação<br>
                        • Use equipamentos de proteção adequados<br>
                        • Mantenha área de trabalho limpa<br>
                        • Siga procedimentos de segurança<br>
                        • Mantenha supervisão adequada<br>
                        • Entre em contato com suporte se necessário`;
    }

    async updateMainCatalog(config) {
        const catalogPath = 'index.html';
        
        if (!fs.existsSync(catalogPath)) {
            console.log('⚠️  Catálogo principal não encontrado. Pulando atualização.');
            return;
        }

        let catalog = fs.readFileSync(catalogPath, 'utf-8');

        // Gerar card para o novo manual
        const newCard = this.generateCatalogCard(config);

        // Inserir antes do fechamento da grid
        const insertPoint = catalog.indexOf('</div>\n        </div>\n    </section>');
        if (insertPoint !== -1) {
            catalog = catalog.slice(0, insertPoint) + '\n                ' + newCard + '\n' + catalog.slice(insertPoint);
            fs.writeFileSync(catalogPath, catalog);
            console.log('📝 Catálogo principal atualizado');
        }
    }

    generateCatalogCard(config) {
        const statusClass = 'status-available';
        const statusText = 'Disponível';
        
        return `<!-- Manual ${config.title} -->
                <div class="manual-card" data-category="${config.category}" onclick="openManual('${config.name}')">
                    <div class="status-badge ${statusClass}">${statusText}</div>
                    <div class="manual-thumbnail">
                        <div class="manual-preview">${config.title}<br>Automatizado</div>
                    </div>
                    <div class="manual-content">
                        <h3 class="manual-title">${config.title}</h3>
                        <p class="manual-description">
                            ${config.description}
                        </p>
                        <div class="manual-meta">
                            <span class="manual-category">${config.category.charAt(0).toUpperCase() + config.category.slice(1)}</span>
                            <span class="manual-version">v${config.version}</span>
                        </div>
                        <div class="manual-actions">
                            <a href="manuais/${config.name}/" class="action-btn btn-primary">Acessar Manual</a>
                            <a href="#" class="action-btn btn-secondary">Download PDF</a>
                        </div>
                    </div>
                </div>`;
    }

    async updateSitemap(config) {
        // Gerar/atualizar sitemap.xml se necessário
        const sitemapPath = 'sitemap.xml';
        const baseUrl = 'https://manuais.elevelab.com.br'; // Ajustar conforme domínio
        
        let sitemap;
        if (fs.existsSync(sitemapPath)) {
            sitemap = fs.readFileSync(sitemapPath, 'utf-8');
        } else {
            sitemap = this.createSitemapBase(baseUrl);
        }

        // Adicionar nova URL
        const newUrl = `
    <url>
        <loc>${baseUrl}/manuais/${config.name}/</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>`;

        const insertPoint = sitemap.indexOf('</urlset>');
        if (insertPoint !== -1) {
            sitemap = sitemap.slice(0, insertPoint) + newUrl + '\n</urlset>';
            fs.writeFileSync(sitemapPath, sitemap);
            console.log('🗺️  Sitemap atualizado');
        }
    }

    createSitemapBase(baseUrl) {
        return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${baseUrl}/</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>
</urlset>`;
    }

    question(prompt) {
        return new Promise((resolve) => {
            this.rl.question(prompt, resolve);
        });
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    const args = process.argv.slice(2);
    const options = {};
    
    // Parse argumentos simples
    for (let i = 0; i < args.length; i += 2) {
        if (args[i].startsWith('--')) {
            options[args[i].slice(2)] = args[i + 1];
        }
    }

    const generator = new ManualGenerator();
    generator.generateManual(options).catch(console.error);
}

module.exports = ManualGenerator;