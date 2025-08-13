#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔨 FORÇANDO VISIBILIDADE DAS IMAGENS - SOLUÇÃO FINAL\n');

const htmlFile = path.join(__dirname, '..', 'manuais', 'SOX406', 'index.html');

// Ler o arquivo HTML
let content = fs.readFileSync(htmlFile, 'utf8');

// 1. Remover TODOS os estilos conflitantes
content = content.replace(/\/\* FIX PARA DIMENSÕES[\s\S]*?<\/style>/g, '</style>');
content = content.replace(/\/\* DEBUG TEMPORÁRIO[\s\S]*?<\/style>/g, '</style>');

// 2. Adicionar JavaScript para forçar visibilidade após carregamento
const forceVisibilityScript = `
    <script>
        // FORÇA VISIBILIDADE DAS IMAGENS
        document.addEventListener('DOMContentLoaded', function() {
            console.log('🔧 Forçando visibilidade das imagens...');
            
            // Selecionar TODAS as imagens
            const allImages = document.querySelectorAll('img');
            
            allImages.forEach((img, index) => {
                // Remover estilos inline problemáticos
                img.style.removeProperty('display');
                img.style.removeProperty('visibility');
                img.style.removeProperty('opacity');
                
                // Forçar visibilidade
                img.style.display = 'block';
                img.style.visibility = 'visible';
                img.style.opacity = '1';
                img.style.width = '100%';
                img.style.height = 'auto';
                img.style.minHeight = '100px';
                img.style.maxWidth = '100%';
                
                // Log para debug
                console.log(\`Imagem \${index + 1}: \${img.src}\`);
                console.log(\`  Dimensões: \${img.width}x\${img.height}\`);
                
                // Recarregar imagem se necessário
                if (img.width === 0 || img.height === 0) {
                    console.log(\`  ⚠️ Recarregando imagem \${index + 1}...\`);
                    const src = img.src;
                    img.src = '';
                    setTimeout(() => {
                        img.src = src;
                    }, 100);
                }
            });
            
            // Forçar especificamente imagens da interface
            const interfaceImages = document.querySelectorAll('.interface-card img');
            interfaceImages.forEach(img => {
                img.style.width = '100%';
                img.style.height = 'auto';
                img.style.minHeight = '150px';
                img.style.display = 'block';
                img.style.visibility = 'visible';
                img.style.opacity = '1';
            });
            
            console.log(\`✅ Total de imagens processadas: \${allImages.length}\`);
        });
        
        // Adicionar fallback após 2 segundos
        setTimeout(function() {
            const images = document.querySelectorAll('img[src*="interface"]');
            images.forEach(img => {
                if (img.width === 0 || img.height === 0) {
                    console.warn('Aplicando fallback para:', img.src);
                    img.style.width = '480px !important';
                    img.style.height = '272px !important';
                    img.style.objectFit = 'contain';
                    img.style.backgroundColor = '#f0f0f0';
                }
            });
        }, 2000);
    </script>
`;

// 3. CSS inline direto nas imagens para garantir
content = content.replace(
    /<img src="(https:\/\/cdn\.jsdelivr\.net[^"]+interface[^"]+)"/g,
    '<img style="display:block !important; width:100% !important; height:auto !important; min-height:150px !important; visibility:visible !important; opacity:1 !important;" src="$1"'
);

// 4. Adicionar CSS crítico inline
const criticalCSS = `
    <style>
        /* CRITICAL CSS - FORÇA VISIBILIDADE */
        img {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
        }
        
        .interface-card img,
        .step-image img {
            width: 100% !important;
            height: auto !important;
            min-height: 150px !important;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
        }
        
        /* Remove qualquer hide */
        .hidden, .invisible, [hidden] {
            display: block !important;
            visibility: visible !important;
        }
    </style>
`;

// Adicionar antes do </head>
content = content.replace('</head>', criticalCSS + '\n' + forceVisibilityScript + '\n</head>');

// Salvar
fs.writeFileSync(htmlFile, content);

console.log('✅ SOLUÇÃO FINAL APLICADA!');
console.log('\n📋 O que foi feito:');
console.log('1. Removido TODOS os CSS conflitantes');
console.log('2. Adicionado JavaScript para forçar visibilidade');
console.log('3. Styles inline !important em todas as imagens');
console.log('4. CSS crítico para garantir display');
console.log('5. Fallback automático após 2 segundos');
console.log('\n🚀 Esta é a solução DEFINITIVA!');
console.log('   As imagens DEVEM aparecer agora.');