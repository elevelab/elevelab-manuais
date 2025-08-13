#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Corrigir caminhos das imagens para GitHub Pages
const htmlFile = path.join(__dirname, '..', 'manuais', 'SOX406', 'index.html');

console.log('🔧 Corrigindo caminhos das imagens para GitHub Pages...');

// Ler o arquivo HTML
let content = fs.readFileSync(htmlFile, 'utf8');

// Substituir caminhos relativos por absolutos considerando o GitHub Pages
// De: src="images/
// Para: src="./images/
content = content.replace(/src="images\//g, 'src="./images/');

// Garantir que outros caminhos também estejam corretos
content = content.replace(/src="\.\/\.\/images\//g, 'src="./images/');
content = content.replace(/src="\/images\//g, 'src="./images/');

// Salvar o arquivo
fs.writeFileSync(htmlFile, content);

console.log('✅ Caminhos das imagens corrigidos!');
console.log('📁 Arquivo atualizado: manuais/SOX406/index.html');