#!/usr/bin/env node

/**
 * Diagnóstico de Imagens - Verificar caminhos e acessibilidade
 */

const fs = require('fs');
const path = require('path');

function diagnoseImages() {
    console.log('🔍 DIAGNÓSTICO DE IMAGENS\n');
    
    // 1. Verificar estrutura de diretórios
    console.log('📁 ESTRUTURA DE DIRETÓRIOS:');
    const manualPath = 'manuais/SOX406';
    const imagesPath = path.join(manualPath, 'images');
    const htmlPath = path.join(manualPath, 'index.html');
    
    console.log(`✓ Manual path: ${path.resolve(manualPath)}`);
    console.log(`✓ Images path: ${path.resolve(imagesPath)}`);
    console.log(`✓ HTML file: ${path.resolve(htmlPath)}`);
    console.log('');
    
    // 2. Verificar se arquivos existem
    console.log('📋 VERIFICAÇÃO DE ARQUIVOS:');
    console.log(`HTML existe: ${fs.existsSync(htmlPath) ? '✅' : '❌'}`);
    console.log(`Diretório images existe: ${fs.existsSync(imagesPath) ? '✅' : '❌'}`);
    console.log('');
    
    // 3. Verificar imagens por categoria
    const categories = ['equipment', 'interface', 'components', 'operation'];
    
    console.log('🖼️ VERIFICAÇÃO DE IMAGENS POR CATEGORIA:');
    categories.forEach(category => {
        const categoryPath = path.join(imagesPath, category);
        
        if (fs.existsSync(categoryPath)) {
            const files = fs.readdirSync(categoryPath)
                .filter(f => f.match(/\.(jpg|jpeg|png)$/i))
                .sort();
                
            console.log(`📂 ${category.toUpperCase()}: ${files.length} imagens`);
            files.forEach(file => {
                const filePath = path.join(categoryPath, file);
                const stats = fs.statSync(filePath);
                const relativePath = `images/${category}/${file}`;
                console.log(`   • ${file} (${Math.round(stats.size/1024)}KB) → ${relativePath}`);
            });
        } else {
            console.log(`📂 ${category.toUpperCase()}: ❌ Diretório não existe`);
        }
        console.log('');
    });
    
    // 4. Analisar HTML para caminhos de imagem
    console.log('🔍 ANÁLISE DO HTML:');
    if (fs.existsSync(htmlPath)) {
        const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
        
        // Procurar por todas as referências de imagem
        const imageReferences = htmlContent.match(/src="[^"]*images\/[^"]*"/g) || [];
        console.log(`Referências de imagem no HTML: ${imageReferences.length}`);
        
        imageReferences.slice(0, 10).forEach((ref, i) => {
            const imagePath = ref.match(/src="([^"]*)"/)[1];
            const fullImagePath = path.join(manualPath, imagePath);
            const exists = fs.existsSync(fullImagePath);
            console.log(`   ${i+1}. ${imagePath} → ${exists ? '✅' : '❌'}`);
        });
        
        if (imageReferences.length > 10) {
            console.log(`   ... e mais ${imageReferences.length - 10} referências`);
        }
    }
    console.log('');
    
    // 5. Gerar HTML de teste simples
    console.log('🧪 CRIANDO TESTE SIMPLES...');
    const testHTML = createTestHTML();
    const testPath = path.join(manualPath, 'test-images.html');
    fs.writeFileSync(testPath, testHTML);
    console.log(`✅ Arquivo de teste criado: ${testPath}`);
    console.log('   Abra este arquivo no navegador para testar as imagens');
}

function createTestHTML() {
    const categories = ['equipment', 'interface', 'components', 'operation'];
    let testContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Teste de Imagens - SOX406</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .category { margin: 20px 0; }
        .image-test { margin: 10px; display: inline-block; }
        .image-test img { width: 200px; height: 150px; object-fit: cover; border: 1px solid #ccc; }
        .status { color: green; }
        .error { color: red; }
    </style>
</head>
<body>
    <h1>🧪 Teste de Imagens Extraídas - SOX406</h1>
    <p><em>Este arquivo testa se todas as imagens estão carregando corretamente</em></p>
`;

    categories.forEach(category => {
        const categoryPath = `manuais/SOX406/images/${category}`;
        
        if (fs.existsSync(categoryPath)) {
            const files = fs.readdirSync(categoryPath)
                .filter(f => f.match(/\.(jpg|jpeg|png)$/i))
                .sort();
                
            testContent += `
    <div class="category">
        <h2>📂 ${category.toUpperCase()} (${files.length} imagens)</h2>
`;
            
            files.forEach(file => {
                const imagePath = `images/${category}/${file}`;
                testContent += `
        <div class="image-test">
            <img src="${imagePath}" 
                 alt="${file}" 
                 onload="this.nextElementSibling.innerHTML='✅ OK'"
                 onerror="this.nextElementSibling.innerHTML='❌ ERRO'">
            <div class="status">🔄 Carregando...</div>
            <p><small>${file}</small></p>
        </div>`;
            });
            
            testContent += `
    </div>`;
        }
    });

    testContent += `
    <script>
        // Contar imagens carregadas
        let totalImages = document.querySelectorAll('img').length;
        let loadedImages = 0;
        let errorImages = 0;
        
        document.querySelectorAll('img').forEach(img => {
            img.onload = function() {
                loadedImages++;
                updateStatus();
            };
            img.onerror = function() {
                errorImages++;
                updateStatus();
            };
        });
        
        function updateStatus() {
            if (loadedImages + errorImages === totalImages) {
                document.body.insertAdjacentHTML('afterbegin', 
                    '<div style="background: ' + (errorImages === 0 ? '#d4edda' : '#f8d7da') + 
                    '; padding: 10px; margin-bottom: 20px; border-radius: 5px;">' +
                    '<strong>Resultado:</strong> ' + loadedImages + ' imagens carregadas, ' + 
                    errorImages + ' erros de ' + totalImages + ' total</div>');
            }
        }
    </script>
</body>
</html>`;

    return testContent;
}

diagnoseImages();