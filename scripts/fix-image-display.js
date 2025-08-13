#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Corrigindo display das imagens...\n');

const htmlFile = path.join(__dirname, '..', 'manuais', 'SOX406', 'index.html');

// Ler o arquivo HTML
let content = fs.readFileSync(htmlFile, 'utf8');

// 1. Corrigir CSS das imagens para garantir que apareçam
const cssFixPattern = `.equipment-main-img {
            width: 100%;
            height: 400px;
            object-fit: cover;`;

const cssFixReplacement = `.equipment-main-img {
            width: 100%;
            height: auto;
            min-height: 300px;
            max-height: 500px;
            object-fit: contain;
            background: #f0f0f0;`;

content = content.replace(cssFixPattern, cssFixReplacement);

// 2. Adicionar CSS para thumbnails
const thumbnailCssFix = `.thumbnail {
            width: 80px;
            height: 80px;
            object-fit: cover;`;

const thumbnailReplacement = `.thumbnail {
            width: 80px;
            height: 80px;
            object-fit: contain;
            background: #f8f9fa;`;

content = content.replace(thumbnailCssFix, thumbnailReplacement);

// 3. Adicionar verificação de carregamento inline nas imagens principais
content = content.replace(
    /<img src="images\/equipment\/equipment-6\.jpg"/g,
    '<img src="images/equipment/equipment-6.jpg" style="display: block; width: 100%; height: auto;"'
);

// 4. Adicionar estilo de debug temporário
const debugStyle = `
        /* DEBUG TEMPORÁRIO - REMOVER APÓS CONFIRMAR */
        img {
            border: 1px solid #ddd !important;
            min-width: 50px;
            min-height: 50px;
            background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23f0f0f0"/><text x="50%" y="50%" font-family="Arial" font-size="12" fill="%23999" text-anchor="middle" dominant-baseline="middle">Carregando...</text></svg>') center/cover;
        }
        
        img[src*="equipment"] {
            min-height: 200px !important;
        }
        
        img[src*="interface"] {
            min-height: 100px !important;
        }
    </style>`;

// Adicionar antes do </head>
content = content.replace('</head>', debugStyle + '\n    </head>');

// Salvar
fs.writeFileSync(htmlFile, content);

console.log('✅ Correções aplicadas!');
console.log('\n📋 Mudanças feitas:');
console.log('1. Ajustado CSS para object-fit: contain');
console.log('2. Adicionado background cinza para visualizar área da imagem');
console.log('3. Alterado height de fixo para auto');
console.log('4. Adicionado estilo de debug com bordas');
console.log('\n🔄 Faça commit e push para testar!');