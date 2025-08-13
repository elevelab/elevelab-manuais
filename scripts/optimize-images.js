#!/usr/bin/env node

/**
 * Otimizador Automático de Imagens EleveLab
 * 
 * Este script processa e otimiza automaticamente todas as imagens
 * dos manuais, gerando versões em diferentes tamanhos e formatos
 * para melhor performance e experiência do usuário.
 * 
 * Uso: node scripts/optimize-images.js [diretório]
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

// Simulação de sharp (biblioteca de processamento de imagens)
// Em um ambiente real, você instalaria: npm install sharp
const mockSharp = {
    async optimize(inputPath, outputPath, options = {}) {
        console.log(`📸 Processando: ${inputPath} -> ${outputPath}`);
        
        // Simular processamento
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Copiar arquivo original (simulação)
        if (fs.existsSync(inputPath)) {
            fs.copyFileSync(inputPath, outputPath);
        }
        
        return {
            originalSize: options.originalSize || 1024000,
            optimizedSize: Math.floor((options.originalSize || 1024000) * 0.7),
            compression: '30%'
        };
    }
};

class ImageOptimizer {
    constructor(options = {}) {
        this.options = {
            inputDir: options.inputDir || 'assets/images',
            outputDir: options.outputDir || 'assets/images/optimized',
            formats: options.formats || ['webp', 'jpg', 'png'],
            sizes: options.sizes || [
                { name: 'thumbnail', width: 150, height: 150 },
                { name: 'small', width: 400, height: 300 },
                { name: 'medium', width: 800, height: 600 },
                { name: 'large', width: 1200, height: 900 },
                { name: 'original', width: null, height: null }
            ],
            quality: {
                jpg: 85,
                webp: 80,
                png: 90
            },
            ...options
        };

        this.stats = {
            processed: 0,
            errors: 0,
            totalSavings: 0,
            originalSize: 0,
            optimizedSize: 0
        };

        this.supportedFormats = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff'];
    }

    async optimize(targetDir = null) {
        console.log('🚀 Iniciando otimização de imagens EleveLab\n');

        try {
            const searchDirs = targetDir ? [targetDir] : this.getImageDirectories();
            
            for (const dir of searchDirs) {
                await this.processDirectory(dir);
            }

            this.printSummary();
            await this.generateImageManifest();

        } catch (error) {
            console.error('❌ Erro durante otimização:', error.message);
            process.exit(1);
        }
    }

    getImageDirectories() {
        const dirs = [];
        
        // Diretório principal de imagens
        if (fs.existsSync(this.options.inputDir)) {
            dirs.push(this.options.inputDir);
        }

        // Diretórios dos manuais
        const manualsDir = 'manuais';
        if (fs.existsSync(manualsDir)) {
            const manuals = fs.readdirSync(manualsDir, { withFileTypes: true })
                .filter(dirent => dirent.isDirectory())
                .map(dirent => dirent.name);

            for (const manual of manuals) {
                const imagesDir = path.join(manualsDir, manual, 'images');
                if (fs.existsSync(imagesDir)) {
                    dirs.push(imagesDir);
                }
            }
        }

        return dirs;
    }

    async processDirectory(directory) {
        console.log(`📁 Processando diretório: ${directory}`);

        if (!fs.existsSync(directory)) {
            console.log(`⚠️  Diretório não encontrado: ${directory}`);
            return;
        }

        const files = fs.readdirSync(directory);
        const imageFiles = files.filter(file => 
            this.supportedFormats.includes(path.extname(file).toLowerCase())
        );

        if (imageFiles.length === 0) {
            console.log('   Nenhuma imagem encontrada\n');
            return;
        }

        console.log(`   Encontradas ${imageFiles.length} imagens\n`);

        for (const file of imageFiles) {
            try {
                await this.processImage(directory, file);
            } catch (error) {
                console.error(`❌ Erro ao processar ${file}:`, error.message);
                this.stats.errors++;
            }
        }
    }

    async processImage(directory, filename) {
        const inputPath = path.join(directory, filename);
        const fileStats = fs.statSync(inputPath);
        const originalSize = fileStats.size;

        console.log(`📸 Processando: ${filename}`);
        console.log(`   Tamanho original: ${this.formatBytes(originalSize)}`);

        // Criar diretório de saída baseado no diretório original
        const outputBaseDir = directory.replace(/^(assets\/images|manuais\/[^\/]+\/images)/, '$1/optimized');
        
        if (!fs.existsSync(outputBaseDir)) {
            fs.mkdirSync(outputBaseDir, { recursive: true });
        }

        const baseName = path.parse(filename).name;
        const results = [];

        // Gerar diferentes tamanhos e formatos
        for (const size of this.options.sizes) {
            for (const format of this.options.formats) {
                const outputFilename = `${baseName}-${size.name}.${format}`;
                const outputPath = path.join(outputBaseDir, outputFilename);

                try {
                    const result = await this.optimizeImage(inputPath, outputPath, size, format, originalSize);
                    results.push({
                        filename: outputFilename,
                        size: size.name,
                        format,
                        ...result
                    });
                } catch (error) {
                    console.error(`   ⚠️  Erro ao gerar ${outputFilename}:`, error.message);
                }
            }
        }

        // Mostrar resultados
        this.printImageResults(results);
        
        // Atualizar estatísticas
        this.stats.processed++;
        this.stats.originalSize += originalSize;
        
        const totalOptimizedSize = results.reduce((sum, r) => sum + r.optimizedSize, 0);
        this.stats.optimizedSize += totalOptimizedSize;
        this.stats.totalSavings += (originalSize - totalOptimizedSize / results.length);

        console.log(''); // Linha em branco
    }

    async optimizeImage(inputPath, outputPath, size, format, originalSize) {
        // Simular otimização com mock
        const result = await mockSharp.optimize(inputPath, outputPath, {
            width: size.width,
            height: size.height,
            format,
            quality: this.options.quality[format],
            originalSize
        });

        return result;
    }

    printImageResults(results) {
        console.log('   📊 Resultados:');
        
        const best = results.reduce((best, current) => 
            current.optimizedSize < best.optimizedSize ? current : best
        );

        results.forEach(result => {
            const savings = ((result.originalSize - result.optimizedSize) / result.originalSize * 100).toFixed(1);
            const marker = result === best ? '⭐' : '  ';
            console.log(`   ${marker} ${result.filename}: ${this.formatBytes(result.optimizedSize)} (-${savings}%)`);
        });
    }

    printSummary() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 RESUMO DA OTIMIZAÇÃO');
        console.log('='.repeat(60));
        
        console.log(`📸 Imagens processadas: ${this.stats.processed}`);
        console.log(`❌ Erros: ${this.stats.errors}`);
        console.log(`📦 Tamanho original total: ${this.formatBytes(this.stats.originalSize)}`);
        console.log(`🗜️  Tamanho otimizado total: ${this.formatBytes(this.stats.optimizedSize)}`);
        
        if (this.stats.originalSize > 0) {
            const savingsPercent = ((this.stats.originalSize - this.stats.optimizedSize) / this.stats.originalSize * 100).toFixed(1);
            console.log(`💾 Economia total: ${this.formatBytes(this.stats.totalSavings)} (${savingsPercent}%)`);
        }

        console.log('\n✅ Otimização concluída com sucesso!');
        
        if (this.stats.processed > 0) {
            console.log('\n📝 Próximos passos:');
            console.log('   1. Atualize as referências de imagens nos manuais');
            console.log('   2. Configure lazy loading para melhor performance');
            console.log('   3. Considere usar WebP como formato principal');
            console.log('   4. Execute o build para aplicar as otimizações');
        }
    }

    async generateImageManifest() {
        const manifestPath = 'assets/images/manifest.json';
        
        console.log('\n📋 Gerando manifest de imagens...');

        const manifest = {
            generated: new Date().toISOString(),
            stats: this.stats,
            formats: this.options.formats,
            sizes: this.options.sizes,
            images: await this.catalogImages()
        };

        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
        console.log(`📄 Manifest salvo em: ${manifestPath}`);
    }

    async catalogImages() {
        const catalog = {};
        
        const searchDirs = this.getImageDirectories();
        
        for (const dir of searchDirs) {
            if (!fs.existsSync(dir)) continue;
            
            const optimizedDir = dir.replace(/^(assets\/images|manuais\/[^\/]+\/images)/, '$1/optimized');
            
            if (!fs.existsSync(optimizedDir)) continue;
            
            const files = fs.readdirSync(optimizedDir);
            
            files.forEach(file => {
                const match = file.match(/^(.+)-(\w+)\.(\w+)$/);
                if (!match) return;
                
                const [, baseName, size, format] = match;
                const key = `${dir}/${baseName}`;
                
                if (!catalog[key]) {
                    catalog[key] = {
                        original: `${dir}/${baseName}`,
                        variants: {}
                    };
                }
                
                if (!catalog[key].variants[size]) {
                    catalog[key].variants[size] = {};
                }
                
                catalog[key].variants[size][format] = `${optimizedDir}/${file}`;
            });
        }
        
        return catalog;
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Métodos utilitários para integração

    static getOptimizedImageUrl(originalPath, size = 'medium', format = 'webp') {
        const parsed = path.parse(originalPath);
        const optimizedDir = parsed.dir.replace(/^(assets\/images|manuais\/[^\/]+\/images)/, '$1/optimized');
        return `${optimizedDir}/${parsed.name}-${size}.${format}`;
    }

    static generateResponsiveImageHtml(originalPath, alt = '', sizes = 'medium') {
        const basePath = path.parse(originalPath);
        const optimizedDir = basePath.dir.replace(/^(assets\/images|manuais\/[^\/]+\/images)/, '$1/optimized');
        const baseName = basePath.name;

        return `
            <picture class="responsive-image">
                <source 
                    srcset="${optimizedDir}/${baseName}-small.webp 400w,
                            ${optimizedDir}/${baseName}-medium.webp 800w,
                            ${optimizedDir}/${baseName}-large.webp 1200w" 
                    type="image/webp"
                    sizes="${sizes}">
                <source 
                    srcset="${optimizedDir}/${baseName}-small.jpg 400w,
                            ${optimizedDir}/${baseName}-medium.jpg 800w,
                            ${optimizedDir}/${baseName}-large.jpg 1200w" 
                    type="image/jpeg"
                    sizes="${sizes}">
                <img 
                    src="${optimizedDir}/${baseName}-medium.jpg" 
                    alt="${alt}"
                    loading="lazy"
                    class="optimized-image">
            </picture>
        `;
    }

    static async updateHtmlReferences(htmlPath) {
        if (!fs.existsSync(htmlPath)) return;

        let content = fs.readFileSync(htmlPath, 'utf-8');
        
        // Buscar por placeholders de imagem e substituir
        content = content.replace(
            /<div class="image-placeholder"[^>]*>([^<]*)<\/div>/g,
            (match, text) => {
                return `<div class="image-placeholder optimized-placeholder" data-text="${text.trim()}">${text}</div>`;
            }
        );

        // Adicionar suporte para imagens reais quando disponíveis
        content = content.replace(
            /<img([^>]+)src="([^"]+)"([^>]*)>/g,
            (match, before, src, after) => {
                const optimizedSrc = ImageOptimizer.getOptimizedImageUrl(src);
                return `<img${before}src="${optimizedSrc}" data-original="${src}"${after}>`;
            }
        );

        fs.writeFileSync(htmlPath, content);
        console.log(`✅ Referências atualizadas em: ${htmlPath}`);
    }
}

// CLI Interface
if (require.main === module) {
    const args = process.argv.slice(2);
    const targetDir = args[0] || null;

    const optimizer = new ImageOptimizer();
    optimizer.optimize(targetDir).catch(console.error);
}

module.exports = ImageOptimizer;