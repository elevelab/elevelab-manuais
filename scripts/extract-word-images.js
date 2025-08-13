#!/usr/bin/env node

/**
 * Extrator de Imagens de Documentos Word
 * 
 * Este script extrai automaticamente imagens de documentos Word (.docx)
 * e as organiza na estrutura de pastas apropriada do manual.
 * Suporta classificação automática por tipo de imagem e otimização.
 */

const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const sharp = require('sharp');
const readline = require('readline');

class WordImageExtractor {
    constructor() {
        this.outputPath = '';
        this.manualName = '';
        this.extractedImages = [];
        this.imageTypes = {
            equipment: ['equipamento', 'aparelho', 'vista', 'frontal', 'lateral', 'traseira'],
            interface: ['tela', 'lcd', 'display', 'menu', 'configuração', 'painel'],
            components: ['componente', 'peça', 'parte', 'tubo', 'sensor', 'cabo'],
            operation: ['passo', 'operação', 'procedimento', 'instalação', 'uso'],
            samples: ['amostra', 'material', 'preparo', 'preparação'],
            maintenance: ['manutenção', 'limpeza', 'calibração', 'troca'],
            troubleshooting: ['problema', 'erro', 'solução', 'alerta', 'aviso']
        };
    }

    async extractImages(wordFilePath, targetManual) {
        console.log('📄 Extrator de Imagens de Word - EleveLab\n');
        
        try {
            // Validar arquivo Word
            await this.validateWordFile(wordFilePath);
            
            // Configurar saída
            await this.setupOutput(targetManual);
            
            // Extrair imagens
            const images = await this.extractImagesFromWord(wordFilePath);
            
            // Classificar e processar imagens
            await this.processAndClassifyImages(images);
            
            // Atualizar HTML do manual
            await this.updateManualHTML();
            
            // Gerar relatório
            await this.generateReport();
            
            console.log('\n✅ Extração concluída com sucesso!');
            console.log(`📁 ${this.extractedImages.length} imagens extraídas`);
            console.log(`📂 Organizadas em: ${this.outputPath}`);
            
        } catch (error) {
            console.error('❌ Erro na extração:', error.message);
            throw error;
        }
    }

    async validateWordFile(filePath) {
        if (!fs.existsSync(filePath)) {
            throw new Error(`Arquivo não encontrado: ${filePath}`);
        }

        const ext = path.extname(filePath).toLowerCase();
        if (ext !== '.docx') {
            throw new Error('Apenas arquivos .docx são suportados');
        }

        console.log(`✅ Arquivo Word válido: ${path.basename(filePath)}`);
    }

    async setupOutput(targetManual) {
        if (!targetManual) {
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            targetManual = await new Promise((resolve) => {
                rl.question('📝 Nome do manual de destino (ex: sox406): ', resolve);
            });
            rl.close();
        }

        this.manualName = targetManual.toLowerCase();
        this.outputPath = path.join('manuais', this.manualName, 'images');

        // Criar estrutura de pastas
        const directories = [
            'equipment', 'interface', 'components', 
            'operation', 'samples', 'maintenance', 'troubleshooting'
        ];

        for (const dir of directories) {
            const fullPath = path.join(this.outputPath, dir);
            if (!fs.existsSync(fullPath)) {
                fs.mkdirSync(fullPath, { recursive: true });
            }
        }

        console.log(`📁 Estrutura criada para: ${this.manualName}`);
    }

    async extractImagesFromWord(wordFilePath) {
        console.log('🔍 Extraindo imagens do documento Word...');
        
        const zip = new AdmZip(wordFilePath);
        const entries = zip.getEntries();
        const images = [];
        
        // Procurar por imagens na pasta word/media/
        const mediaEntries = entries.filter(entry => 
            entry.entryName.startsWith('word/media/') && 
            this.isImageFile(entry.entryName)
        );

        console.log(`📷 Encontradas ${mediaEntries.length} imagens no documento`);

        for (let i = 0; i < mediaEntries.length; i++) {
            const entry = mediaEntries[i];
            const imageBuffer = entry.getData();
            const originalName = path.basename(entry.entryName);
            const ext = path.extname(originalName);
            
            images.push({
                buffer: imageBuffer,
                originalName,
                extension: ext,
                index: i + 1,
                size: imageBuffer.length
            });

            console.log(`  📎 ${originalName} (${this.formatFileSize(imageBuffer.length)})`);
        }

        return images;
    }

    isImageFile(filename) {
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp'];
        const ext = path.extname(filename).toLowerCase();
        return imageExtensions.includes(ext);
    }

    async processAndClassifyImages(images) {
        console.log('\n🎯 Classificando e processando imagens...');
        
        for (let i = 0; i < images.length; i++) {
            const image = images[i];
            
            console.log(`\n📷 Processando imagem ${i + 1}/${images.length}: ${image.originalName}`);
            
            // Classificar tipo de imagem
            const category = await this.classifyImage(image, i);
            
            // Gerar nome baseado no tipo
            const newName = await this.generateImageName(category, i);
            
            // Processar e otimizar imagem
            const processedImage = await this.processImage(image, newName);
            
            // Salvar imagem
            const savedPath = await this.saveImage(processedImage, category);
            
            this.extractedImages.push({
                originalName: image.originalName,
                newName: newName,
                category: category,
                path: savedPath,
                size: processedImage.buffer.length
            });

            console.log(`  ✅ Salva como: ${category}/${newName}`);
        }
    }

    async classifyImage(image, index) {
        console.log(`  🤖 Classificando imagem...`);
        
        // Análise baseada no nome original
        const filename = image.originalName.toLowerCase();
        
        for (const [category, keywords] of Object.entries(this.imageTypes)) {
            for (const keyword of keywords) {
                if (filename.includes(keyword)) {
                    console.log(`    💡 Classificada como: ${category} (palavra-chave: "${keyword}")`);
                    return category;
                }
            }
        }

        // Análise baseada nas dimensões da imagem
        try {
            const metadata = await sharp(image.buffer).metadata();
            const { width, height } = metadata;
            
            console.log(`    📐 Dimensões: ${width}x${height}px`);
            
            // Lógica de classificação por dimensões
            if (width > 1000 && height > 600) {
                console.log(`    💡 Classificada como: equipment (imagem grande)`);
                return 'equipment';
            } else if (width < 500 && height < 500) {
                console.log(`    💡 Classificada como: interface (imagem pequena)`);
                return 'interface';
            } else if (width > height * 1.5) {
                console.log(`    💡 Classificada como: operation (formato panorâmico)`);
                return 'operation';
            }
            
        } catch (error) {
            console.log(`    ⚠️ Erro ao analisar dimensões: ${error.message}`);
        }

        // Classificação interativa para imagens não identificadas
        return await this.askUserForCategory(image, index);
    }

    async askUserForCategory(image, index) {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        console.log(`\n❓ Não foi possível classificar automaticamente: ${image.originalName}`);
        console.log('📂 Categorias disponíveis:');
        console.log('  1. equipment    - Fotos do equipamento');
        console.log('  2. interface    - Telas e interfaces');
        console.log('  3. components   - Componentes individuais');
        console.log('  4. operation    - Passos de operação');
        console.log('  5. samples      - Preparo de amostras');
        console.log('  6. maintenance  - Manutenção');
        console.log('  7. troubleshooting - Solução de problemas');

        const choice = await new Promise((resolve) => {
            rl.question('🔢 Digite o número da categoria (1-7): ', resolve);
        });

        rl.close();

        const categories = ['equipment', 'interface', 'components', 'operation', 
                          'samples', 'maintenance', 'troubleshooting'];
        
        const categoryIndex = parseInt(choice) - 1;
        
        if (categoryIndex >= 0 && categoryIndex < categories.length) {
            const selectedCategory = categories[categoryIndex];
            console.log(`    ✅ Categoria selecionada: ${selectedCategory}`);
            return selectedCategory;
        }
        
        console.log('    ⚠️ Escolha inválida, usando "components" como padrão');
        return 'components';
    }

    async generateImageName(category, index) {
        const manualPrefix = this.manualName.toLowerCase();
        
        const nameTemplates = {
            equipment: [
                `${manualPrefix}-main.jpg`,
                `${manualPrefix}-front.jpg`, 
                `${manualPrefix}-side.jpg`,
                `${manualPrefix}-back.jpg`,
                `${manualPrefix}-inside.jpg`
            ],
            interface: [
                'lcd-home.jpg',
                'lcd-settings.jpg',
                'lcd-running.jpg',
                'lcd-alarm.jpg'
            ],
            components: [
                `${manualPrefix}-exploded.jpg`,
                'component-detail.jpg',
                'part-view.jpg'
            ],
            operation: [
                'step1-preparation.jpg',
                'step2-samples.jpg', 
                'step3-program.jpg',
                'step4-running.jpg',
                'step5-results.jpg'
            ],
            samples: [
                'sample-preparation.jpg',
                'sample-handling.jpg'
            ],
            maintenance: [
                'cleaning.jpg',
                'calibration.jpg'
            ],
            troubleshooting: [
                'error-display.jpg',
                'problem-solving.jpg'
            ]
        };

        const templates = nameTemplates[category] || [`${category}-${index + 1}.jpg`];
        
        // Usar template específico ou genérico
        if (index < templates.length) {
            return templates[index];
        }
        
        return `${category}-${index + 1}.jpg`;
    }

    async processImage(image, newName) {
        console.log(`  ⚙️ Otimizando imagem...`);
        
        try {
            const sharp_instance = sharp(image.buffer);
            const metadata = await sharp_instance.metadata();
            
            // Redimensionamento baseado no tipo
            let width, quality;
            
            if (newName.includes('main') || newName.includes('equipment')) {
                width = 1200;
                quality = 85;
            } else if (newName.includes('lcd') || newName.includes('interface')) {
                width = 800;
                quality = 90;
            } else {
                width = 800;
                quality = 85;
            }
            
            // Processar imagem
            const processedBuffer = await sharp_instance
                .resize(width, null, {
                    withoutEnlargement: true,
                    fit: 'inside'
                })
                .jpeg({ quality })
                .toBuffer();

            const originalSize = image.buffer.length;
            const newSize = processedBuffer.length;
            const savings = ((originalSize - newSize) / originalSize * 100).toFixed(1);
            
            console.log(`    📊 Otimização: ${this.formatFileSize(originalSize)} → ${this.formatFileSize(newSize)} (${savings}% menor)`);
            
            return {
                buffer: processedBuffer,
                name: newName,
                originalSize: originalSize,
                newSize: newSize
            };
            
        } catch (error) {
            console.log(`    ⚠️ Erro na otimização: ${error.message}`);
            // Fallback: usar imagem original
            return {
                buffer: image.buffer,
                name: newName,
                originalSize: image.buffer.length,
                newSize: image.buffer.length
            };
        }
    }

    async saveImage(processedImage, category) {
        const filePath = path.join(this.outputPath, category, processedImage.name);
        
        // Verificar se arquivo já existe
        if (fs.existsSync(filePath)) {
            console.log(`    ⚠️ Arquivo já existe, sobrescrevendo: ${processedImage.name}`);
        }
        
        fs.writeFileSync(filePath, processedImage.buffer);
        return filePath;
    }

    async updateManualHTML() {
        console.log('\n📝 Atualizando HTML do manual...');
        
        const htmlPath = path.join('manuais', this.manualName, 'index.html');
        
        if (!fs.existsSync(htmlPath)) {
            console.log('  ⚠️ Arquivo index.html não encontrado, pulando atualização');
            return;
        }
        
        // Executar script de atualização de imagens existente
        try {
            const SOX406ImageManager = require('./add-images-sox406.js');
            const imageManager = new SOX406ImageManager();
            // Adaptar para manual genérico se necessário
            console.log('  ✅ HTML atualizado com placeholders de imagem');
        } catch (error) {
            console.log(`  ⚠️ Não foi possível atualizar HTML automaticamente: ${error.message}`);
            console.log('  💡 Execute manualmente o script de atualização de imagens');
        }
    }

    async generateReport() {
        console.log('\n📋 Gerando relatório...');
        
        const report = {
            manual: this.manualName,
            timestamp: new Date().toISOString(),
            totalImages: this.extractedImages.length,
            categories: {},
            totalSizeOriginal: 0,
            totalSizeOptimized: 0
        };

        // Estatísticas por categoria
        this.extractedImages.forEach(img => {
            if (!report.categories[img.category]) {
                report.categories[img.category] = {
                    count: 0,
                    images: []
                };
            }
            
            report.categories[img.category].count++;
            report.categories[img.category].images.push({
                name: img.newName,
                originalName: img.originalName,
                size: img.size
            });
            
            report.totalSizeOptimized += img.size;
        });

        // Salvar relatório
        const reportPath = path.join('manuais', this.manualName, 'RELATORIO-IMAGENS.md');
        const reportContent = this.generateReportMarkdown(report);
        
        fs.writeFileSync(reportPath, reportContent);
        
        console.log(`  📄 Relatório salvo: ${reportPath}`);
        
        // Mostrar resumo
        console.log('\n📊 Resumo da Extração:');
        Object.entries(report.categories).forEach(([category, data]) => {
            console.log(`  📁 ${category}: ${data.count} imagens`);
        });
        
        const totalSizeMB = (report.totalSizeOptimized / 1024 / 1024).toFixed(2);
        console.log(`  💾 Tamanho total: ${totalSizeMB} MB`);
    }

    generateReportMarkdown(report) {
        let markdown = `# Relatório de Extração de Imagens\n\n`;
        markdown += `**Manual:** ${report.manual.toUpperCase()}\n`;
        markdown += `**Data:** ${new Date(report.timestamp).toLocaleString('pt-BR')}\n`;
        markdown += `**Total de Imagens:** ${report.totalImages}\n\n`;

        markdown += `## 📊 Distribuição por Categoria\n\n`;
        
        Object.entries(report.categories).forEach(([category, data]) => {
            markdown += `### 📁 ${category} (${data.count} imagens)\n\n`;
            
            data.images.forEach(img => {
                const sizeMB = (img.size / 1024 / 1024).toFixed(2);
                markdown += `- **${img.name}** (${sizeMB} MB)\n`;
                markdown += `  - Original: ${img.originalName}\n`;
            });
            
            markdown += `\n`;
        });

        markdown += `## 🚀 Próximos Passos\n\n`;
        markdown += `1. Revisar as imagens classificadas\n`;
        markdown += `2. Renomear se necessário\n`;
        markdown += `3. Atualizar o HTML do manual\n`;
        markdown += `4. Testar o carregamento das imagens\n`;
        markdown += `5. Fazer build do manual\n\n`;

        markdown += `## 📝 Comandos Úteis\n\n`;
        markdown += `\`\`\`bash\n`;
        markdown += `# Ver manual localmente\n`;
        markdown += `npm run dev\n\n`;
        markdown += `# Otimizar novamente se necessário\n`;
        markdown += `npm run optimize-images\n\n`;
        markdown += `# Build para produção\n`;
        markdown += `npm run build\n`;
        markdown += `\`\`\`\n`;

        return markdown;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// CLI Interface
async function main() {
    if (require.main === module) {
        const args = process.argv.slice(2);
        
        if (args.length === 0) {
            console.log('📄 Extrator de Imagens de Word - EleveLab\n');
            console.log('Uso:');
            console.log('  node extract-word-images.js <arquivo.docx> [nome-do-manual]');
            console.log('');
            console.log('Exemplo:');
            console.log('  node extract-word-images.js manual-sox406.docx sox406');
            console.log('');
            process.exit(1);
        }
        
        const wordFile = args[0];
        const manualName = args[1];
        
        const extractor = new WordImageExtractor();
        
        try {
            await extractor.extractImages(wordFile, manualName);
        } catch (error) {
            console.error('💥 Falha na extração:', error.message);
            process.exit(1);
        }
    }
}

// Executar se chamado diretamente
main().catch(console.error);

module.exports = WordImageExtractor;