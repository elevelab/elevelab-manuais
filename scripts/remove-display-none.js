#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 REMOVENDO display:none do onerror...\n');

const htmlFile = path.join(__dirname, '..', 'manuais', 'SOX406', 'index.html');

// Ler o arquivo HTML
let content = fs.readFileSync(htmlFile, 'utf8');

// Contar quantas vezes aparece
const matches = content.match(/onerror="this\.style\.display='none'/g);
console.log(`❌ Encontradas ${matches ? matches.length : 0} ocorrências de display:none no onerror`);

// REMOVER o display='none' que está escondendo as imagens!
content = content.replace(
    /onerror="this\.style\.display='none'; console\.error\('Imagem não encontrada:', this\.src\);"/g,
    'onerror="console.error(\'Erro ao carregar imagem:\', this.src); this.style.border=\'2px solid red\';"'
);

// Também remover dos que só tem display:none
content = content.replace(
    /onerror="this\.style\.display='none'"/g,
    'onerror="console.error(\'Erro:\', this.src); this.style.opacity=\'0.5\';"'
);

// Salvar
fs.writeFileSync(htmlFile, content);

console.log('✅ CORRIGIDO! Removido display:none');
console.log('📌 Agora as imagens mostrarão borda vermelha em caso de erro');
console.log('📌 Mas NÃO serão escondidas!');
console.log('\n🚀 Faça commit e push AGORA!');