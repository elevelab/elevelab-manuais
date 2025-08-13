#!/usr/bin/env node

/**
 * Filtro Inteligente de Imagens Relevantes
 * 
 * Remove imagens irrelevantes, muito pequenas ou duplicadas
 */

const fs = require('fs');
const path = require('path');

class ImageFilter {
    constructor() {
        this.imagesPath = 'manuais/SOX406/images';
        this.filteredPath = 'manuais/SOX406/images-filtered';
        this.minSize = 5000; // 5KB mínimo
        this.irrelevantPatterns = [
            'pause', 'stop', 'enter', 'qr', 'code', 'watermark',
            'logo', 'brand', 'symbol', 'icon'
        ];
    }

    async filterImages() {
        console.log('🔍 Iniciando filtro inteligente de imagens...\n');
        
        // Criar diretório filtrado
        if (fs.existsSync(this.filteredPath)) {
            fs.rmSync(this.filteredPath, { recursive: true });
        }
        fs.mkdirSync(this.filteredPath, { recursive: true });
        
        const categories = ['equipment', 'interface', 'components', 'operation'];
        let totalOriginal = 0, totalFiltrado = 0, totalRemovido = 0;
        
        for (const category of categories) {
            console.log(`📂 Processando categoria: ${category.toUpperCase()}`);
            
            const categoryPath = path.join(this.imagesPath, category);
            const filteredCategoryPath = path.join(this.filteredPath, category);
            
            if (!fs.existsSync(categoryPath)) continue;
            
            fs.mkdirSync(filteredCategoryPath, { recursive: true });
            
            const files = fs.readdirSync(categoryPath)
                .filter(f => f.match(/\.(jpg|jpeg|png)$/i));
            
            totalOriginal += files.length;
            
            const filtered = await this.filterCategoryImages(categoryPath, files, category);
            
            // Copiar imagens aprovadas
            for (const file of filtered.approved) {
                fs.copyFileSync(
                    path.join(categoryPath, file.name),
                    path.join(filteredCategoryPath, file.name)
                );
            }
            
            console.log(`  ✅ Aprovadas: ${filtered.approved.length}`);
            console.log(`  ❌ Removidas: ${filtered.removed.length}`);
            
            if (filtered.removed.length > 0) {
                console.log('  📋 Motivos de remoção:');
                filtered.removed.forEach(item => {
                    console.log(`    • ${item.name}: ${item.reason}`);
                });
            }
            
            totalFiltrado += filtered.approved.length;
            totalRemovido += filtered.removed.length;
            console.log('');
        }
        
        console.log('📊 RESULTADO DO FILTRO:');
        console.log(`  Original: ${totalOriginal} imagens`);
        console.log(`  Filtrado: ${totalFiltrado} imagens`);
        console.log(`  Removidas: ${totalRemovido} imagens`);
        console.log(`  Economia: ${Math.round(totalRemovido/totalOriginal*100)}%`);
        
        // Atualizar HTML com imagens filtradas
        await this.updateHTMLWithFiltered();
        
        return {
            original: totalOriginal,
            filtered: totalFiltrado,
            removed: totalRemovido
        };
    }
    
    async filterCategoryImages(categoryPath, files, category) {
        const approved = [];
        const removed = [];
        
        for (const file of files) {
            const filePath = path.join(categoryPath, file);
            const stats = fs.statSync(filePath);
            
            // Verificar tamanho mínimo
            if (stats.size < this.minSize) {
                removed.push({
                    name: file,
                    reason: `Muito pequena (${Math.round(stats.size/1024)}KB)`
                });
                continue;
            }
            
            // Verificar padrões irrelevantes
            const isIrrelevant = this.irrelevantPatterns.some(pattern => 
                file.toLowerCase().includes(pattern)
            );
            
            if (isIrrelevant) {
                removed.push({
                    name: file,
                    reason: 'Conteúdo irrelevante'
                });
                continue;
            }
            
            // Verificar específicos por categoria
            if (category === 'interface') {
                // Manter apenas interfaces principais
                if (this.isMainInterface(file)) {
                    approved.push({ name: file, size: stats.size });
                } else {
                    removed.push({
                        name: file,
                        reason: 'Interface secundária'
                    });
                }
            } else if (category === 'operation') {
                // Remover watermarks e logos
                if (this.hasWatermark(file)) {
                    removed.push({
                        name: file,
                        reason: 'Contém watermark'
                    });
                } else {
                    approved.push({ name: file, size: stats.size });
                }
            } else {
                // Equipment e Components - manter todos válidos
                approved.push({ name: file, size: stats.size });
            }
        }
        
        return { approved, removed };
    }
    
    isMainInterface(filename) {
        const mainInterfaces = [
            'interface-10.jpg', 'interface-11.jpg', 'interface-12.jpg',
            'interface-14.jpg', 'interface-15.jpg', 'interface-19.jpg',
            'lcd-running.jpg', 'lcd-settings.jpg'
        ];
        return mainInterfaces.includes(filename);
    }
    
    hasWatermark(filename) {
        // Verificar se é muito pequeno ou contém padrões de watermark
        const watermarkPatterns = ['step1', 'preparation', 'aw'];
        return watermarkPatterns.some(pattern => 
            filename.toLowerCase().includes(pattern)
        );
    }
    
    async updateHTMLWithFiltered() {
        console.log('🔄 Atualizando HTML com imagens filtradas...');
        
        const htmlPath = 'manuais/SOX406/index.html';
        let html = fs.readFileSync(htmlPath, 'utf-8');
        
        // Substituir caminhos para usar imagens filtradas
        html = html.replace(/src="images\//g, 'src="images-filtered/');
        
        // Salvar versão filtrada
        const filteredHtmlPath = 'manuais/SOX406/index-filtered.html';
        fs.writeFileSync(filteredHtmlPath, html);
        
        console.log(`✅ HTML filtrado salvo: ${filteredHtmlPath}`);
    }
}

// Executar filtro
if (require.main === module) {
    const filter = new ImageFilter();
    filter.filterImages().catch(console.error);
}

module.exports = ImageFilter;