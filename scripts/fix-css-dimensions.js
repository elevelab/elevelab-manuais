#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 CORRIGINDO DIMENSÕES CSS DAS IMAGENS...\n');

const htmlFile = path.join(__dirname, '..', 'manuais', 'SOX406', 'index.html');

// Ler o arquivo HTML
let content = fs.readFileSync(htmlFile, 'utf8');

// 1. Remover o CSS de debug que está causando problemas
content = content.replace(/\/\* DEBUG TEMPORÁRIO[\s\S]*?\*\/[\s\S]*?img\[src\*="interface"\]\s*\{[\s\S]*?\}/g, '');

// 2. Corrigir CSS das thumbnails
content = content.replace(
    /\.thumbnail\s*\{[^}]*\}/g,
    `.thumbnail {
            width: 80px !important;
            height: 80px !important;
            object-fit: cover !important;
            cursor: pointer;
            border: 2px solid #ddd;
            border-radius: 8px;
            transition: all 0.3s ease;
        }`
);

// 3. Adicionar !important para forçar tamanhos corretos
content = content.replace(
    /\.interface-card img\s*\{[^}]*\}/g,
    `.interface-card img {
            width: 100% !important;
            height: auto !important;
            min-height: 150px !important;
            max-height: 300px !important;
            object-fit: contain !important;
            border-radius: 8px;
            background: #f5f5f5;
        }`
);

// 4. Adicionar CSS específico para corrigir dimensões
const fixCSS = `
    <style>
        /* FIX PARA DIMENSÕES DAS IMAGENS */
        .interface-gallery img {
            width: 100% !important;
            height: auto !important;
            min-height: 150px !important;
            display: block !important;
        }
        
        .equipment-main-img {
            width: 100% !important;
            height: auto !important;
            min-height: 300px !important;
            max-height: 500px !important;
        }
        
        .step-image img {
            width: 100% !important;
            height: auto !important;
            min-height: 100px !important;
        }
        
        /* Remover styles inline conflitantes */
        img[style*="display: block"] {
            display: block !important;
            width: 100% !important;
            height: auto !important;
        }
        
        /* Fix específico para interface cards */
        .interface-card {
            min-height: 250px !important;
        }
        
        .interface-card img {
            min-height: 150px !important;
            width: 100% !important;
            height: auto !important;
        }
    </style>
`;

// Adicionar antes do </head>
content = content.replace('</head>', fixCSS + '\n</head>');

// 5. Remover style inline que pode estar causando problema
content = content.replace(/style="display: block; width: 100%; height: auto;"/g, '');

// Salvar
fs.writeFileSync(htmlFile, content);

console.log('✅ DIMENSÕES CSS CORRIGIDAS!');
console.log('\n📋 Correções aplicadas:');
console.log('1. Removido CSS de debug problemático');
console.log('2. Forçado dimensões corretas com !important');
console.log('3. Adicionado min-height para garantir visibilidade');
console.log('4. Removido styles inline conflitantes');
console.log('\n🚀 Faça commit e push AGORA!');