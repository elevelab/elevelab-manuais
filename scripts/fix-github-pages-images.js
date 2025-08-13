#!/usr/bin/env node

/**
 * Script para corrigir definitivamente os caminhos de imagens para GitHub Pages
 * Baseado nas melhores práticas de 2024
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Corrigindo caminhos de imagens para GitHub Pages...\n');

const htmlFile = path.join(__dirname, '..', 'manuais', 'SOX406', 'index.html');

// Ler o arquivo HTML
let content = fs.readFileSync(htmlFile, 'utf8');

// Estatísticas
let replacements = 0;

// 1. Corrigir todos os src de imagens
// GitHub Pages precisa de caminhos sem ./ inicial quando em subdiretório
const patterns = [
    // Padrão atual com ./
    { from: /src="\.\/images\//g, to: 'src="images/' },
    // Padrão com / absoluto
    { from: /src="\/images\//g, to: 'src="images/' },
    // Padrão com query string
    { from: /src="images\/([^"]+)\?v=\d+"/g, to: 'src="images/$1"' },
    // Onclick handlers
    { from: /\.src='\.\/images\//g, to: '.src=\'images/' },
    { from: /\.src='\/images\//g, to: '.src=\'images/' },
];

patterns.forEach(pattern => {
    const matches = content.match(pattern.from);
    if (matches) {
        content = content.replace(pattern.from, pattern.to);
        replacements += matches.length;
        console.log(`✅ Substituído ${matches.length} ocorrências de: ${pattern.from}`);
    }
});

// 2. Garantir que não há caminhos absolutos de arquivo local
content = content.replace(/file:\/\/\/[^"]+/g, (match) => {
    console.log(`❌ Removido caminho absoluto local: ${match.substring(0, 50)}...`);
    replacements++;
    return '';
});

// 3. Adicionar atributo loading="lazy" onde não existe
content = content.replace(/<img\s+([^>]*?)(?!loading)([^>]*?)>/g, (match, p1, p2) => {
    if (!match.includes('loading')) {
        replacements++;
        return `<img ${p1}${p2} loading="lazy">`;
    }
    return match;
});

// 4. Adicionar tratamento de erro em todas as imagens
content = content.replace(/<img\s+([^>]*?)>/g, (match) => {
    if (!match.includes('onerror')) {
        replacements++;
        return match.replace('>', ' onerror="this.style.display=\'none\'; console.error(\'Imagem não encontrada:\', this.src);">');
    }
    return match;
});

// Salvar o arquivo
fs.writeFileSync(htmlFile, content);

console.log('\n📊 Resumo das correções:');
console.log(`- Total de substituições: ${replacements}`);
console.log('- Caminhos corrigidos para formato relativo simples');
console.log('- Removidos caminhos absolutos locais');
console.log('- Adicionado lazy loading');
console.log('- Adicionado tratamento de erro');

console.log('\n✅ Arquivo corrigido com sucesso!');
console.log('📁 ' + htmlFile);

// Verificar se as imagens realmente existem
console.log('\n🔍 Verificando imagens físicas...');
const imagesDir = path.join(__dirname, '..', 'manuais', 'SOX406', 'images');
const imageTypes = ['equipment', 'interface', 'operation', 'components'];

imageTypes.forEach(type => {
    const dir = path.join(imagesDir, type);
    if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir).filter(f => /\.(jpg|jpeg|png|gif|svg)$/i.test(f));
        console.log(`📁 ${type}/: ${files.length} imagens encontradas`);
    }
});

console.log('\n💡 Próximos passos:');
console.log('1. Commit e push das mudanças');
console.log('2. Aguardar o GitHub Actions fazer o deploy');
console.log('3. Limpar cache do navegador (Ctrl+F5)');
console.log('4. Acessar: https://elevelab.github.io/elevelab-manuais/manuais/SOX406/');