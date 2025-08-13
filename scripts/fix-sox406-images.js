#!/usr/bin/env node

/**
 * Script para Corrigir Imagens Reais no Manual SOX406
 * 
 * Mapeia as imagens extraídas do Word para os placeholders do HTML
 * e ajusta o layout para exibir corretamente as imagens disponíveis.
 */

const fs = require('fs');
const path = require('path');

class SOX406ImageFixer {
    constructor() {
        this.manualPath = 'manuais/SOX406';
        this.imagesPath = path.join(this.manualPath, 'images');
        this.htmlPath = path.join(this.manualPath, 'index.html');
        this.availableImages = {};
    }

    async fixImages() {
        console.log('🔧 Corrigindo imagens reais no Manual SOX406\n');
        
        try {
            // Escanear imagens disponíveis
            await this.scanAvailableImages();
            
            // Ler HTML atual
            let html = fs.readFileSync(this.htmlPath, 'utf-8');
            
            // Atualizar seções com imagens reais
            html = await this.updateEquipmentSection(html);
            html = await this.updateInterfaceSection(html);
            html = await this.updateComponentsSection(html);
            html = await this.updateOperationSection(html);
            
            // Salvar HTML corrigido
            fs.writeFileSync(this.htmlPath, html);
            
            console.log('✅ Manual SOX406 corrigido com sucesso!');
            console.log(`📁 ${Object.keys(this.availableImages).reduce((total, cat) => total + this.availableImages[cat].length, 0)} imagens mapeadas`);
            
        } catch (error) {
            console.error('❌ Erro ao corrigir imagens:', error.message);
            throw error;
        }
    }

    async scanAvailableImages() {
        console.log('📷 Escaneando imagens disponíveis...');
        
        const categories = ['equipment', 'interface', 'components', 'operation'];
        
        for (const category of categories) {
            const categoryPath = path.join(this.imagesPath, category);
            
            if (fs.existsSync(categoryPath)) {
                const files = fs.readdirSync(categoryPath)
                    .filter(file => file.match(/\.(jpg|jpeg|png)$/i))
                    .sort();
                
                this.availableImages[category] = files;
                console.log(`  📂 ${category}: ${files.length} imagens`);
            }
        }
    }

    async updateEquipmentSection(html) {
        console.log('⚙️ Atualizando seção de equipamento...');
        
        const equipmentImages = this.availableImages.equipment || [];
        
        if (equipmentImages.length === 0) {
            console.log('  ⚠️ Nenhuma imagem de equipamento disponível');
            return html;
        }

        // Criar galeria com imagens reais
        const equipmentGallery = `
                <div class="equipment-showcase">
                    <h2 style="color: var(--primary-orange); margin-bottom: 30px; font-size: 2rem;">Determinador de Gordura SOX406</h2>
                    <div class="equipment-gallery">
                        <div class="main-image">
                            <img src="images/equipment/${equipmentImages[0]}" 
                                 alt="Determinador de Gordura SOX406" 
                                 class="equipment-main-img"
                                 data-zoom="true"
                                 loading="eager">
                            <div class="image-overlay">
                                <span class="zoom-icon">🔍</span>
                                <span class="zoom-text">Clique para ampliar</span>
                            </div>
                        </div>
                        <div class="thumbnail-gallery">
                            ${equipmentImages.slice(0, 4).map((img, index) => `
                            <img src="images/equipment/${img}" 
                                 alt="Vista ${index + 1} do SOX406" 
                                 class="thumbnail${index === 0 ? ' active' : ''}"
                                 data-main="images/equipment/${img}">
                            `).join('')}
                        </div>
                    </div>
                    <div class="equipment-specs-visual">
                        <div class="spec-highlight">
                            <span class="spec-number">6</span>
                            <span class="spec-label">Posições de Amostra</span>
                        </div>
                        <div class="spec-highlight">
                            <span class="spec-number">280°C</span>
                            <span class="spec-label">Temperatura Máxima</span>
                        </div>
                        <div class="spec-highlight">
                            <span class="spec-number">4.3"</span>
                            <span class="spec-label">Display LCD</span>
                        </div>
                    </div>
                </div>`;

        return html.replace(
            /<div class="equipment-showcase">[\s\S]*?<\/div>(?=\s*<div class="equipment-specs-visual">)/,
            equipmentGallery.replace(/<\/div>$/, '')
        );
    }

    async updateInterfaceSection(html) {
        console.log('📱 Atualizando seção de interface...');
        
        const interfaceImages = this.availableImages.interface || [];
        
        if (interfaceImages.length === 0) {
            console.log('  ⚠️ Nenhuma imagem de interface disponível');
            return html;
        }

        // Mapear imagens para nomes descritivos
        const imageMap = [
            { file: 'lcd-settings.jpg', title: 'Tela Inicial', desc: 'Menu principal com opções Heating e Set' },
            { file: 'lcd-running.jpg', title: 'Configurações', desc: 'Ajuste de temperatura e tempo de extração' },
            { file: 'lcd-alarm.jpg', title: 'Em Operação', desc: 'Monitoramento em tempo real' },
            { file: 'interface-8.jpg', title: 'Sistema de Alertas', desc: 'Avisos de temperatura e segurança' }
        ];

        // Usar imagens disponíveis para as que existem
        const interfaceCards = imageMap.map((item, index) => {
            const availableImage = interfaceImages.find(img => img === item.file) || 
                                 interfaceImages[index] || 
                                 interfaceImages[0];
            
            return `
                        <div class="interface-card">
                            <img src="images/interface/${availableImage}" 
                                 alt="${item.title}" 
                                 loading="lazy">
                            <div class="interface-caption">
                                <h4>${item.title}</h4>
                                <p>${item.desc}</p>
                            </div>
                        </div>`;
        });

        const interfaceGallery = `
                <div class="interface-gallery">
                    <h3>Interface do Usuário</h3>
                    <div class="interface-grid">
                        ${interfaceCards.join('')}
                    </div>
                </div>`;

        // Substituir galeria de interface
        return html.replace(
            /<div class="interface-gallery">[\s\S]*?<\/div>(?=\s*<\/div>)/,
            interfaceGallery
        );
    }

    async updateComponentsSection(html) {
        console.log('🔧 Atualizando seção de componentes...');
        
        const equipmentImages = this.availableImages.equipment || [];
        const interfaceImages = this.availableImages.interface || [];
        
        if (equipmentImages.length === 0) {
            console.log('  ⚠️ Usando imagens de interface para componentes');
        }

        // Usar primeira imagem disponível como vista explodida
        const explodedImage = equipmentImages[0] || interfaceImages[0] || 'sox406-exploded.jpg';
        
        const componentsSection = `
                <div class="components-detailed">
                    <div class="component-showcase">
                        <div class="component-main">
                            <img src="images/equipment/${explodedImage}" 
                                 alt="Vista dos componentes SOX406" 
                                 class="exploded-view"
                                 loading="lazy">
                            <div class="component-markers">
                                <div class="marker" data-component="condensers" style="top: 20%; left: 30%;">
                                    <span class="marker-number">1</span>
                                    <div class="marker-tooltip">Sistema de Condensação</div>
                                </div>
                                <div class="marker" data-component="control" style="top: 60%; left: 80%;">
                                    <span class="marker-number">2</span>
                                    <div class="marker-tooltip">Painel de Controle</div>
                                </div>
                                <div class="marker" data-component="heater" style="top: 70%; left: 45%;">
                                    <span class="marker-number">3</span>
                                    <div class="marker-tooltip">Sistema de Aquecimento</div>
                                </div>
                            </div>
                        </div>
                        <div class="component-details">
                            <div class="component-item active" data-component="condensers">
                                <img src="images/interface/${interfaceImages[0] || 'lcd-settings.jpg'}" alt="Sistema de Condensação">
                                <div class="component-info">
                                    <h4>Sistema de Condensação</h4>
                                    <p>Condensadores para recuperação de solvente</p>
                                </div>
                            </div>
                            <div class="component-item" data-component="control">
                                <img src="images/interface/${interfaceImages[1] || 'lcd-running.jpg'}" alt="Painel de Controle">
                                <div class="component-info">
                                    <h4>Painel de Controle</h4>
                                    <p>Display LCD 4.3" com controle por microcomputador</p>
                                </div>
                            </div>
                            <div class="component-item" data-component="heater">
                                <img src="images/interface/${interfaceImages[2] || 'lcd-alarm.jpg'}" alt="Sistema de Aquecimento">
                                <div class="component-info">
                                    <h4>Sistema de Aquecimento</h4>
                                    <p>Aquecimento uniforme até 280°C com controle PID</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;

        return html.replace(
            /<div class="components-detailed">[\s\S]*?<div class="content-grid">/,
            componentsSection + '\\n\\n                <div class="content-grid">'
        );
    }

    async updateOperationSection(html) {
        console.log('👥 Atualizando seção de operação...');
        
        const operationImages = this.availableImages.operation || [];
        const interfaceImages = this.availableImages.interface || [];
        
        const steps = [
            { title: 'Preparação', desc: 'Verificar nível de água e conectar mangueiras' },
            { title: 'Inserir Amostras', desc: 'Colocar amostras nos tubos com solvente' },
            { title: 'Configurar Programa', desc: 'Selecionar temperatura e tempo' },
            { title: 'Iniciar Processo', desc: 'Processo automático de extração' },
            { title: 'Coleta de Resultados', desc: 'Retirar tubos e pesar resíduo' }
        ];

        const operationStepsVisual = steps.map((step, index) => {
            const imageFile = operationImages[index] || 
                            interfaceImages[index] || 
                            operationImages[0] || 
                            interfaceImages[0] || 
                            'step1-preparation.jpg';
            
            const imagePath = operationImages[index] ? 'operation' : 'interface';
            
            return `
                        <div class="step-visual">
                            <div class="step-image">
                                <img src="images/${imagePath}/${imageFile}" 
                                     alt="${step.title}" 
                                     loading="lazy">
                            </div>
                            <div class="step-description">
                                <h4>${index + 1}. ${step.title}</h4>
                                <p>${step.desc}</p>
                            </div>
                        </div>`;
        });

        const operationGuide = `
                <div class="operation-visual-guide">
                    <h3>Guia Visual de Operação</h3>
                    <div class="operation-steps-visual">
                        ${operationStepsVisual.join('')}
                    </div>
                </div>`;

        return html.replace(
            /<div class="operation-visual-guide">[\s\S]*?<div class="steps-list">/,
            operationGuide + '\\n\\n                <div class="steps-list">'
        );
    }
}

// CLI Interface
if (require.main === module) {
    const fixer = new SOX406ImageFixer();
    fixer.fixImages().catch(console.error);
}

module.exports = SOX406ImageFixer;