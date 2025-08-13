#!/usr/bin/env node

/**
 * Script Final para Restaurar e Mapear Imagens Corretamente
 * 
 * Este script irá:
 * 1. Restaurar o HTML do backup
 * 2. Mapear todas as imagens reais extraídas
 * 3. Substituir placeholders por imagens reais
 * 4. Criar galerias organizadas
 */

const fs = require('fs');
const path = require('path');

class HTMLRestorer {
    constructor() {
        this.manualPath = 'manuais/SOX406';
        this.htmlPath = path.join(this.manualPath, 'index.html');
        this.backupPath = path.join(this.manualPath, 'index.html.backup');
        this.imagesPath = path.join(this.manualPath, 'images');
        
        this.availableImages = {
            equipment: [],
            interface: [],
            components: [],
            operation: []
        };
    }

    async restoreAndFix() {
        console.log('🔧 Restaurando HTML e mapeando imagens reais\n');
        
        try {
            // 1. Escanear imagens disponíveis
            await this.scanAvailableImages();
            
            // 2. Restaurar HTML do backup
            console.log('📄 Restaurando HTML do backup...');
            let html = fs.readFileSync(this.backupPath, 'utf-8');
            
            // 3. Mapear imagens reais
            html = await this.mapRealImages(html);
            
            // 4. Corrigir estrutura HTML
            html = await this.fixHTMLStructure(html);
            
            // 5. Salvar
            fs.writeFileSync(this.htmlPath, html);
            
            console.log('✅ HTML restaurado e imagens mapeadas!');
            console.log(`📷 Imagens mapeadas:`);
            console.log(`  🔧 Equipment: ${this.availableImages.equipment.length}`);
            console.log(`  💻 Interface: ${this.availableImages.interface.length}`);
            console.log(`  🔩 Components: ${this.availableImages.components.length}`);
            console.log(`  ⚙️ Operation: ${this.availableImages.operation.length}`);
            
        } catch (error) {
            console.error('❌ Erro:', error.message);
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
                
                this.availableImages[category] = files.map(file => ({
                    filename: file,
                    path: `images/${category}/${file}`
                }));
                
                console.log(`  📂 ${category}: ${files.length} imagens`);
            }
        }
    }

    async mapRealImages(html) {
        console.log('🎯 Mapeando imagens reais...');
        
        // 1. Substituir galeria de equipamento
        if (this.availableImages.equipment.length > 0) {
            const equipmentGallery = this.createEquipmentGallery();
            
            // Encontrar e substituir equipment-showcase
            html = html.replace(
                /<div class="equipment-showcase">[\s\S]*?<\/div>\s*<\/div>/,
                equipmentGallery
            );
        }

        // 2. Criar interface gallery limpa
        if (this.availableImages.interface.length > 0) {
            const interfaceGallery = this.createInterfaceGallery();
            
            // Remover interface-gallery existente e adicionar nova
            html = html.replace(
                /<div class="interface-gallery">[\s\S]*?<\/div>\s*<\/div>/g,
                ''
            );
            
            // Adicionar antes da seção de componentes
            html = html.replace(
                /<!-- Seção: Componentes -->/,
                interfaceGallery + '\n\n            <!-- Seção: Componentes -->'
            );
        }

        // 3. Remover image-grid malformada
        html = html.replace(
            /<div class="image-grid">[\s\S]*?<\/div>/g,
            ''
        );

        return html;
    }

    createEquipmentGallery() {
        const mainImage = this.availableImages.equipment[0];
        const thumbnails = this.availableImages.equipment.slice(0, 6);
        
        return `
                <div class="equipment-showcase">
                    <h2 style="color: var(--primary-orange); margin-bottom: 30px; font-size: 2rem;">Determinador de Gordura SOX406</h2>
                    <div class="equipment-gallery">
                        <div class="main-image">
                            <img src="${mainImage.path}" 
                                 alt="Determinador de Gordura SOX406" 
                                 class="equipment-main-img"
                                 loading="eager">
                        </div>
                        <div class="thumbnail-gallery">
                            ${thumbnails.map(img => `
                            <img src="${img.path}" 
                                 alt="Vista do SOX406" 
                                 class="thumbnail"
                                 onclick="document.querySelector('.equipment-main-img').src='${img.path}'">
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
    }

    createInterfaceGallery() {
        const interfaceImages = this.availableImages.interface.slice(0, 8);
        const titles = [
            'Tela Principal', 'Menu de Configuração', 'Em Operação', 'Sistema de Alertas',
            'Configurações Avançadas', 'Monitor de Temperatura', 'Status do Sistema', 'Alarmes'
        ];
        const descriptions = [
            'Interface principal do equipamento',
            'Configuração de parâmetros',
            'Monitoramento em tempo real',
            'Avisos e alertas do sistema',
            'Ajustes detalhados de operação',
            'Controle de temperatura',
            'Estado atual do equipamento',
            'Sistema de notificações'
        ];
        
        const interfaceCards = interfaceImages.map((img, index) => `
                        <div class="interface-card">
                            <img src="${img.path}" 
                                 alt="${titles[index] || 'Interface'}" 
                                 loading="lazy">
                            <div class="interface-caption">
                                <h4>${titles[index] || 'Interface'}</h4>
                                <p>${descriptions[index] || 'Componente da interface'}</p>
                            </div>
                        </div>`).join('');

        return `
                <div class="interface-gallery">
                    <h3>Interface do Usuário</h3>
                    <div class="interface-grid">
                        ${interfaceCards}
                    </div>
                </div>`;
    }

    async fixHTMLStructure(html) {
        console.log('🔧 Corrigindo estrutura HTML...');
        
        // Remover elementos órfãos
        html = html.replace(/<div class="image-caption">[^<]*<\/div>\s*<\/div>\s*<\/div>/g, '');
        html = html.replace(/<\/div>\s*<\/div>\s*<div class="interface-card">/g, '');
        
        // Limpar espaços extras
        html = html.replace(/\n\s*\n\s*\n/g, '\n\n');
        
        // Garantir fechamento correto de sections
        html = html.replace(/(<section[^>]*>[\s\S]*?)(<section)/g, '$1            </section>\n\n            $2');
        
        return html;
    }
}

// Executar
if (require.main === module) {
    const restorer = new HTMLRestorer();
    restorer.restoreAndFix().catch(console.error);
}

module.exports = HTMLRestorer;