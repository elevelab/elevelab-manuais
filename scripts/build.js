#!/usr/bin/env node

/**
 * Script de Build EleveLab Manuais
 * 
 * Script completo para preparar os manuais para produção:
 * - Minifica CSS e JavaScript
 * - Otimiza imagens
 * - Gera sitemap.xml
 * - Valida HTML
 * - Configura service worker
 * - Gera estatísticas de build
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class EleveLabBuilder {
    constructor() {
        this.buildDir = 'dist';
        this.sourceDir = '.';
        this.stats = {
            startTime: Date.now(),
            files: {
                html: 0,
                css: 0,
                js: 0,
                images: 0,
                other: 0
            },
            sizes: {
                original: 0,
                minified: 0
            },
            errors: [],
            warnings: []
        };

        this.config = this.loadConfig();
    }

    loadConfig() {
        const defaultConfig = {
            minify: {
                html: true,
                css: true,
                js: true
            },
            optimize: {
                images: true
            },
            generate: {
                sitemap: true,
                serviceWorker: true,
                manifest: true
            },
            output: {
                directory: 'dist',
                clean: true
            },
            seo: {
                baseUrl: 'https://manuais.elevelab.com.br',
                generateMetaTags: true
            }
        };

        // Carregar config personalizada se existir
        const configPath = 'build.config.json';
        if (fs.existsSync(configPath)) {
            const customConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
            return { ...defaultConfig, ...customConfig };
        }

        return defaultConfig;
    }

    async build() {
        console.log('🚀 Iniciando build dos Manuais EleveLab\n');

        try {
            await this.setupBuildDirectory();
            await this.copySourceFiles();
            await this.processAssets();
            await this.optimizeImages();
            await this.generateSEOFiles();
            await this.generateServiceWorker();
            await this.generateManifest();
            await this.validateOutput();
            
            this.printBuildSummary();
            console.log('\n✅ Build concluído com sucesso!');

        } catch (error) {
            console.error('❌ Erro durante o build:', error.message);
            process.exit(1);
        }
    }

    async setupBuildDirectory() {
        console.log('📁 Configurando diretório de build...');

        if (this.config.output.clean && fs.existsSync(this.buildDir)) {
            fs.rmSync(this.buildDir, { recursive: true, force: true });
        }

        if (!fs.existsSync(this.buildDir)) {
            fs.mkdirSync(this.buildDir, { recursive: true });
        }

        console.log(`   ✅ Diretório ${this.buildDir} preparado\n`);
    }

    async copySourceFiles() {
        console.log('📋 Copiando arquivos fonte...');

        const filesToCopy = [
            'index.html',
            'manuais/',
            'assets/',
            'templates/',
            'README.md'
        ];

        for (const file of filesToCopy) {
            await this.copyRecursive(file, path.join(this.buildDir, file));
        }

        console.log('   ✅ Arquivos copiados\n');
    }

    async copyRecursive(src, dest) {
        if (!fs.existsSync(src)) {
            console.log(`   ⚠️  Arquivo não encontrado: ${src}`);
            return;
        }

        const stat = fs.statSync(src);

        if (stat.isDirectory()) {
            if (!fs.existsSync(dest)) {
                fs.mkdirSync(dest, { recursive: true });
            }

            const files = fs.readdirSync(src);
            for (const file of files) {
                await this.copyRecursive(
                    path.join(src, file),
                    path.join(dest, file)
                );
            }
        } else {
            const destDir = path.dirname(dest);
            if (!fs.existsSync(destDir)) {
                fs.mkdirSync(destDir, { recursive: true });
            }

            fs.copyFileSync(src, dest);
            this.updateFileStats(src);
        }
    }

    updateFileStats(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        const size = fs.statSync(filePath).size;

        this.stats.sizes.original += size;

        switch (ext) {
            case '.html':
                this.stats.files.html++;
                break;
            case '.css':
                this.stats.files.css++;
                break;
            case '.js':
                this.stats.files.js++;
                break;
            case '.jpg':
            case '.jpeg':
            case '.png':
            case '.gif':
            case '.webp':
                this.stats.files.images++;
                break;
            default:
                this.stats.files.other++;
        }
    }

    async processAssets() {
        console.log('⚙️  Processando assets...');

        if (this.config.minify.css) {
            await this.minifyCSS();
        }

        if (this.config.minify.js) {
            await this.minifyJS();
        }

        if (this.config.minify.html) {
            await this.minifyHTML();
        }

        console.log('   ✅ Assets processados\n');
    }

    async minifyCSS() {
        const cssFiles = this.findFiles(path.join(this.buildDir, 'assets/css'), '.css');
        
        for (const file of cssFiles) {
            try {
                let content = fs.readFileSync(file, 'utf-8');
                const originalSize = content.length;

                // Minificação simples de CSS
                content = content
                    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comentários
                    .replace(/\s+/g, ' ') // Normaliza espaços
                    .replace(/;\s*}/g, '}') // Remove ; antes de }
                    .replace(/{\s+/g, '{') // Remove espaços após {
                    .replace(/}\s+/g, '}') // Remove espaços após }
                    .replace(/,\s+/g, ',') // Remove espaços após ,
                    .replace(/:\s+/g, ':') // Remove espaços após :
                    .trim();

                fs.writeFileSync(file, content);
                
                const newSize = content.length;
                const savings = ((originalSize - newSize) / originalSize * 100).toFixed(1);
                console.log(`   📄 ${path.basename(file)}: ${originalSize} → ${newSize} bytes (-${savings}%)`);
                
                this.stats.sizes.minified += newSize;
            } catch (error) {
                this.stats.errors.push(`Erro ao minificar CSS ${file}: ${error.message}`);
            }
        }
    }

    async minifyJS() {
        const jsFiles = this.findFiles(path.join(this.buildDir, 'assets/js'), '.js');
        
        for (const file of jsFiles) {
            try {
                let content = fs.readFileSync(file, 'utf-8');
                const originalSize = content.length;

                // Minificação básica de JavaScript
                content = content
                    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comentários de bloco
                    .replace(/\/\/.*$/gm, '') // Remove comentários de linha
                    .replace(/\s+/g, ' ') // Normaliza espaços
                    .replace(/;\s*}/g, '}') // Remove ; desnecessários
                    .replace(/{\s+/g, '{') // Limpa espaços após {
                    .replace(/}\s+/g, '}') // Limpa espaços após }
                    .trim();

                fs.writeFileSync(file, content);
                
                const newSize = content.length;
                const savings = ((originalSize - newSize) / originalSize * 100).toFixed(1);
                console.log(`   📄 ${path.basename(file)}: ${originalSize} → ${newSize} bytes (-${savings}%)`);
                
                this.stats.sizes.minified += newSize;
            } catch (error) {
                this.stats.errors.push(`Erro ao minificar JS ${file}: ${error.message}`);
            }
        }
    }

    async minifyHTML() {
        const htmlFiles = this.findFiles(this.buildDir, '.html');
        
        for (const file of htmlFiles) {
            try {
                let content = fs.readFileSync(file, 'utf-8');
                const originalSize = content.length;

                // Minificação básica de HTML
                content = content
                    .replace(/<!--[\s\S]*?-->/g, '') // Remove comentários HTML
                    .replace(/\s+/g, ' ') // Normaliza espaços
                    .replace(/>\s+</g, '><') // Remove espaços entre tags
                    .trim();

                fs.writeFileSync(file, content);
                
                const newSize = content.length;
                const savings = ((originalSize - newSize) / originalSize * 100).toFixed(1);
                console.log(`   📄 ${path.relative(this.buildDir, file)}: ${originalSize} → ${newSize} bytes (-${savings}%)`);
                
                this.stats.sizes.minified += newSize;
            } catch (error) {
                this.stats.errors.push(`Erro ao minificar HTML ${file}: ${error.message}`);
            }
        }
    }

    async optimizeImages() {
        if (!this.config.optimize.images) return;

        console.log('🖼️  Otimizando imagens...');
        
        try {
            // Executar o otimizador de imagens
            const ImageOptimizer = require('./optimize-images.js');
            const optimizer = new ImageOptimizer({
                inputDir: path.join(this.buildDir, 'assets/images'),
                outputDir: path.join(this.buildDir, 'assets/images/optimized')
            });
            
            await optimizer.optimize();
            console.log('   ✅ Imagens otimizadas\n');
        } catch (error) {
            this.stats.warnings.push(`Otimização de imagens falhou: ${error.message}`);
            console.log('   ⚠️  Otimização de imagens pulada\n');
        }
    }

    async generateSEOFiles() {
        console.log('🔍 Gerando arquivos SEO...');

        if (this.config.generate.sitemap) {
            await this.generateSitemap();
        }

        await this.generateRobotsTxt();
        await this.addMetaTags();

        console.log('   ✅ Arquivos SEO gerados\n');
    }

    async generateSitemap() {
        const sitemap = this.buildSitemap();
        fs.writeFileSync(path.join(this.buildDir, 'sitemap.xml'), sitemap);
        console.log('   📄 sitemap.xml gerado');
    }

    buildSitemap() {
        const baseUrl = this.config.seo.baseUrl;
        const urls = [];

        // Página principal
        urls.push({
            loc: baseUrl,
            lastmod: new Date().toISOString().split('T')[0],
            changefreq: 'weekly',
            priority: '1.0'
        });

        // Páginas dos manuais
        const manualsDir = path.join(this.buildDir, 'manuais');
        if (fs.existsSync(manualsDir)) {
            const manuals = fs.readdirSync(manualsDir, { withFileTypes: true })
                .filter(dirent => dirent.isDirectory())
                .map(dirent => dirent.name);

            for (const manual of manuals) {
                urls.push({
                    loc: `${baseUrl}/manuais/${manual}/`,
                    lastmod: new Date().toISOString().split('T')[0],
                    changefreq: 'monthly',
                    priority: '0.8'
                });
            }
        }

        return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `    <url>
        <loc>${url.loc}</loc>
        <lastmod>${url.lastmod}</lastmod>
        <changefreq>${url.changefreq}</changefreq>
        <priority>${url.priority}</priority>
    </url>`).join('\n')}
</urlset>`;
    }

    async generateRobotsTxt() {
        const robots = `User-agent: *
Allow: /

Sitemap: ${this.config.seo.baseUrl}/sitemap.xml

# EleveLab Manuais
# Equipamentos científicos de qualidade
`;

        fs.writeFileSync(path.join(this.buildDir, 'robots.txt'), robots);
        console.log('   📄 robots.txt gerado');
    }

    async addMetaTags() {
        const htmlFiles = this.findFiles(this.buildDir, '.html');
        
        for (const file of htmlFiles) {
            try {
                let content = fs.readFileSync(file, 'utf-8');
                
                // Adicionar meta tags Open Graph e Twitter Card se não existirem
                if (!content.includes('og:title')) {
                    const title = this.extractTitle(content) || 'EleveLab Manuais';
                    const description = this.extractDescription(content) || 'Manuais interativos dos equipamentos científicos EleveLab';
                    
                    const metaTags = `
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${this.config.seo.baseUrl}${this.getRelativeUrl(file)}">
    <meta property="og:image" content="${this.config.seo.baseUrl}/assets/images/elevelab-og-image.jpg">
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${this.config.seo.baseUrl}/assets/images/elevelab-og-image.jpg">
    
    <!-- Structured Data -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "${title}",
        "description": "${description}",
        "url": "${this.config.seo.baseUrl}${this.getRelativeUrl(file)}",
        "publisher": {
            "@type": "Organization",
            "name": "EleveLab Equipamentos Científicos",
            "url": "https://www.elevelab.com.br"
        }
    }
    </script>`;

                    content = content.replace('</head>', `${metaTags}\n</head>`);
                    fs.writeFileSync(file, content);
                }
            } catch (error) {
                this.stats.warnings.push(`Erro ao adicionar meta tags em ${file}: ${error.message}`);
            }
        }

        console.log('   📄 Meta tags SEO adicionadas');
    }

    async generateServiceWorker() {
        if (!this.config.generate.serviceWorker) return;

        console.log('⚙️  Gerando Service Worker...');

        const swContent = this.buildServiceWorker();
        fs.writeFileSync(path.join(this.buildDir, 'sw.js'), swContent);
        
        console.log('   📄 Service Worker gerado\n');
    }

    buildServiceWorker() {
        const version = `v${Date.now()}`;
        
        return `// EleveLab Manuais Service Worker
// Versão: ${version}

const CACHE_NAME = 'elevelab-manuais-${version}';
const urlsToCache = [
    '/',
    '/index.html',
    '/assets/css/global.css',
    '/assets/js/navigation.js',
    '/assets/js/modules/manual-navigator.js',
    '/assets/css/navigation-styles.css'
];

// Instalação do Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache aberto');
                return cache.addAll(urlsToCache);
            })
    );
});

// Ativação do Service Worker
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Removendo cache antigo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Interceptação de requisições
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Retorna do cache se encontrado
                if (response) {
                    return response;
                }

                return fetch(event.request).then(response => {
                    // Verifica se recebeu uma resposta válida
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // Clone da resposta
                    const responseToCache = response.clone();

                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                });
            })
    );
});`;
    }

    async generateManifest() {
        if (!this.config.generate.manifest) return;

        console.log('📱 Gerando Web App Manifest...');

        const manifest = {
            name: "EleveLab Manuais",
            short_name: "EleveLab",
            description: "Manuais interativos dos equipamentos científicos EleveLab",
            start_url: "/",
            display: "standalone",
            background_color: "#f8f9fa",
            theme_color: "#E73700",
            icons: [
                {
                    src: "/assets/images/icon-192.png",
                    sizes: "192x192",
                    type: "image/png"
                },
                {
                    src: "/assets/images/icon-512.png",
                    sizes: "512x512",
                    type: "image/png"
                }
            ]
        };

        fs.writeFileSync(
            path.join(this.buildDir, 'manifest.json'), 
            JSON.stringify(manifest, null, 2)
        );
        
        console.log('   📄 Web App Manifest gerado\n');
    }

    async validateOutput() {
        console.log('🔍 Validando saída...');

        // Verificar arquivos essenciais
        const essentialFiles = [
            'index.html',
            'assets/css/global.css',
            'assets/js/navigation.js'
        ];

        for (const file of essentialFiles) {
            const filePath = path.join(this.buildDir, file);
            if (!fs.existsSync(filePath)) {
                this.stats.errors.push(`Arquivo essencial não encontrado: ${file}`);
            }
        }

        // Verificar manuais
        const manualsDir = path.join(this.buildDir, 'manuais');
        if (fs.existsSync(manualsDir)) {
            const manuals = fs.readdirSync(manualsDir, { withFileTypes: true })
                .filter(dirent => dirent.isDirectory());

            for (const manual of manuals) {
                const indexPath = path.join(manualsDir, manual.name, 'index.html');
                if (!fs.existsSync(indexPath)) {
                    this.stats.errors.push(`Manual sem index.html: ${manual.name}`);
                }
            }
        }

        console.log('   ✅ Validação concluída\n');
    }

    printBuildSummary() {
        const duration = Date.now() - this.stats.startTime;
        
        console.log('\n' + '='.repeat(60));
        console.log('📊 RESUMO DO BUILD');
        console.log('='.repeat(60));
        
        console.log(`⏱️  Tempo de build: ${(duration / 1000).toFixed(2)}s`);
        console.log(`📁 Diretório de saída: ${this.buildDir}/`);
        
        console.log('\n📄 Arquivos processados:');
        console.log(`   HTML: ${this.stats.files.html}`);
        console.log(`   CSS: ${this.stats.files.css}`);
        console.log(`   JS: ${this.stats.files.js}`);
        console.log(`   Imagens: ${this.stats.files.images}`);
        console.log(`   Outros: ${this.stats.files.other}`);
        
        if (this.stats.sizes.original > 0) {
            const totalFiles = Object.values(this.stats.files).reduce((a, b) => a + b, 0);
            const savings = ((this.stats.sizes.original - this.stats.sizes.minified) / this.stats.sizes.original * 100).toFixed(1);
            console.log(`\n💾 Tamanhos:`);
            console.log(`   Original: ${this.formatBytes(this.stats.sizes.original)}`);
            console.log(`   Minificado: ${this.formatBytes(this.stats.sizes.minified)}`);
            console.log(`   Economia: ${savings}%`);
        }

        if (this.stats.warnings.length > 0) {
            console.log('\n⚠️  Avisos:');
            this.stats.warnings.forEach(warning => console.log(`   ${warning}`));
        }

        if (this.stats.errors.length > 0) {
            console.log('\n❌ Erros:');
            this.stats.errors.forEach(error => console.log(`   ${error}`));
        }
    }

    // Métodos utilitários

    findFiles(dir, extension) {
        if (!fs.existsSync(dir)) return [];
        
        const files = [];
        
        function search(currentDir) {
            const items = fs.readdirSync(currentDir, { withFileTypes: true });
            
            for (const item of items) {
                const fullPath = path.join(currentDir, item.name);
                
                if (item.isDirectory()) {
                    search(fullPath);
                } else if (item.name.endsWith(extension)) {
                    files.push(fullPath);
                }
            }
        }
        
        search(dir);
        return files;
    }

    extractTitle(content) {
        const match = content.match(/<title>(.*?)<\/title>/);
        return match ? match[1] : null;
    }

    extractDescription(content) {
        const match = content.match(/<meta name="description" content="(.*?)"/);
        return match ? match[1] : null;
    }

    getRelativeUrl(filePath) {
        return '/' + path.relative(this.buildDir, filePath).replace(/\\/g, '/');
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// CLI Interface
if (require.main === module) {
    const builder = new EleveLabBuilder();
    builder.build().catch(console.error);
}

module.exports = EleveLabBuilder;