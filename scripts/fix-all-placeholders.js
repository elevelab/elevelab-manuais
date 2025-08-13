#!/usr/bin/env node

/**
 * Script para Substituir TODOS os Placeholders por Imagens Reais
 * 
 * Remove todos os placeholders e usa apenas as imagens reais extraídas do Word
 */

const fs = require('fs');
const path = require('path');

class PlaceholderFixer {
    constructor() {
        this.manualPath = 'manuais/SOX406';
        this.htmlPath = path.join(this.manualPath, 'index.html');
        this.imagesPath = path.join(this.manualPath, 'images');
        this.realImages = [];
    }

    async fixAllPlaceholders() {
        console.log('🔧 Substituindo TODOS os placeholders por imagens reais\n');
        
        try {
            // Escanear imagens reais disponíveis
            await this.scanRealImages();
            
            // Ler HTML
            let html = fs.readFileSync(this.htmlPath, 'utf-8');
            
            // Remover/substituir todos os placeholders
            html = await this.removeAllPlaceholders(html);
            html = await this.addRealImagesOnly(html);
            
            // Salvar
            fs.writeFileSync(this.htmlPath, html);
            
            console.log('✅ Todos os placeholders substituídos!');
            console.log(`📷 ${this.realImages.length} imagens reais mapeadas`);
            
        } catch (error) {
            console.error('❌ Erro:', error.message);
        }
    }

    async scanRealImages() {
        console.log('📷 Escaneando imagens reais...');
        
        const categories = ['equipment', 'interface', 'components', 'operation'];
        
        for (const category of categories) {
            const categoryPath = path.join(this.imagesPath, category);
            
            if (fs.existsSync(categoryPath)) {
                const files = fs.readdirSync(categoryPath)
                    .filter(file => file.match(/\.(jpg|jpeg|png)$/i))
                    .sort();
                
                files.forEach(file => {
                    this.realImages.push({
                        category: category,
                        filename: file,
                        path: `images/${category}/${file}`
                    });
                });
                
                console.log(`  📂 ${category}: ${files.length} imagens reais`);
            }
        }
    }

    async removeAllPlaceholders(html) {
        console.log('🗑️ Removendo placeholders...');
        
        // Remover todos os image-placeholder divs
        html = html.replace(/<div class="image-placeholder">[^<]*<br>[^<]*<\/div>/g, '');
        
        // Remover image-cards vazios
        html = html.replace(/<div class="image-card">\s*<div class="image-placeholder">[^<]*<\/div>\s*<div class="image-caption">[^<]*<\/div>\s*<\/div>/g, '');
        
        return html;
    }

    async addRealImagesOnly(html) {
        console.log('📷 Adicionando apenas imagens reais...');
        
        // Criar galeria com imagens de equipamento reais
        const equipmentImages = this.realImages.filter(img => img.category === 'equipment');
        
        if (equipmentImages.length > 0) {
            const mainImage = equipmentImages[0];
            const thumbnails = equipmentImages.slice(0, 4);
            
            const equipmentGallery = `
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
            
            // Substituir equipment showcase
            html = html.replace(
                /<div class="equipment-showcase">[\s\S]*?<\/div>\s*<\/div>/,
                equipmentGallery
            );
        }

        // Criar galeria de interface com imagens reais
        const interfaceImages = this.realImages.filter(img => img.category === 'interface');
        
        if (interfaceImages.length > 0) {
            const interfaceCards = interfaceImages.slice(0, 4).map((img, index) => {
                const titles = ['Tela LCD', 'Configurações', 'Em Operação', 'Sistema de Alertas'];
                const descriptions = [
                    'Interface principal do equipamento',
                    'Ajuste de parâmetros',
                    'Monitoramento em tempo real',
                    'Avisos e alertas do sistema'
                ];
                
                return `
                        <div class="interface-card">
                            <img src="${img.path}" 
                                 alt="${titles[index] || 'Interface'}" 
                                 loading="lazy">
                            <div class="interface-caption">
                                <h4>${titles[index] || 'Interface'}</h4>
                                <p>${descriptions[index] || 'Componente da interface'}</p>
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

            // Substituir interface gallery existente
            html = html.replace(
                /<div class="interface-gallery">[\s\S]*?<\/div>\s*<\/div>/,
                interfaceGallery
            );
        }

        // Criar grid de imagens reais para componentes
        if (this.realImages.length > 4) {
            const componentImages = this.realImages.slice(0, 6);
            
            const imageGrid = `
                <div class="image-grid">
                    ${componentImages.map(img => `
                    <div class="image-card">
                        <img src="${img.path}" 
                             alt="Componente do SOX406" 
                             style="width: 100%; height: 200px; object-fit: cover; border-radius: 10px;">
                        <div class="image-caption">Componente - ${img.filename}</div>
                    </div>
                    `).join('')}
                </div>`;

            // Adicionar antes dos componentes principais
            html = html.replace(
                /<div class="content-grid">/,
                imageGrid + '\n\n                <div class="content-grid">'
            );
        }

        return html;
    }
}

// CLI
if (require.main === module) {
    const fixer = new PlaceholderFixer();
    fixer.fixAllPlaceholders().catch(console.error);
}

module.exports = PlaceholderFixer;