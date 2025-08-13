#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Aplicando correção com URLs absolutas para GitHub Pages...\n');

const htmlFile = path.join(__dirname, '..', 'manuais', 'SOX406', 'index.html');

// Ler o arquivo HTML
let content = fs.readFileSync(htmlFile, 'utf8');

// Base URL do GitHub Pages
const baseUrl = '/elevelab-manuais/manuais/SOX406/';

// Substituir todos os src="images/ por URLs absolutas
content = content.replace(
    /src="images\//g,
    `src="${baseUrl}images/`
);

// Corrigir também os onclick
content = content.replace(
    /\.src='images\//g,
    `.src='${baseUrl}images/`
);

// Adicionar uma tag base no head como fallback
const baseTag = `    <base href="/elevelab-manuais/manuais/SOX406/">`;
if (!content.includes('<base')) {
    content = content.replace('<head>', '<head>\n' + baseTag);
}

// Salvar
fs.writeFileSync(htmlFile, content);

console.log('✅ URLs convertidas para formato absoluto do GitHub Pages');
console.log(`📌 Base URL: ${baseUrl}`);
console.log('🚀 Faça commit e push!');