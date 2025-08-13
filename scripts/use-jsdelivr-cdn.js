#!/usr/bin/env node

/**
 * SOLUÇÃO FINAL: Usar jsDelivr CDN para servir imagens do GitHub
 * jsDelivr é um CDN gratuito e confiável para arquivos do GitHub
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 APLICANDO SOLUÇÃO COM jsDelivr CDN\n');

const htmlFile = path.join(__dirname, '..', 'manuais', 'SOX406', 'index.html');

// Ler o arquivo HTML
let content = fs.readFileSync(htmlFile, 'utf8');

// Base URL para jsDelivr (mais confiável que raw.githubusercontent.com)
const jsdelivrBase = 'https://cdn.jsdelivr.net/gh/elevelab/elevelab-manuais@main/manuais/SOX406/';

// Padrões para substituir
const patterns = [
    // Substituir raw.githubusercontent.com por jsdelivr
    { 
        from: /https:\/\/raw\.githubusercontent\.com\/elevelab\/elevelab-manuais\/main\/manuais\/SOX406\//g,
        to: jsdelivrBase
    }
];

let totalReplacements = 0;

patterns.forEach(pattern => {
    const matches = content.match(pattern.from);
    if (matches) {
        content = content.replace(pattern.from, pattern.to);
        totalReplacements += matches.length;
        console.log(`✅ Substituído ${matches.length} URLs para jsDelivr`);
    }
});

// Adicionar preload para as imagens principais
const preloadImages = `
    <!-- Preload de imagens principais para melhor performance -->
    <link rel="preload" as="image" href="${jsdelivrBase}images/equipment/equipment-6.jpg">
    <link rel="preload" as="image" href="${jsdelivrBase}images/interface/interface-10.jpg">
    <link rel="preload" as="image" href="${jsdelivrBase}images/interface/interface-11.jpg">
    <link rel="preload" as="image" href="${jsdelivrBase}images/interface/interface-12.jpg">
`;

// Adicionar após <head>
content = content.replace('<head>', '<head>\n' + preloadImages);

// Salvar
fs.writeFileSync(htmlFile, content);

console.log('\n' + '='.repeat(60));
console.log('✅ MIGRAÇÃO PARA jsDelivr CDN CONCLUÍDA!');
console.log('='.repeat(60));
console.log('\n📌 Agora usando jsDelivr CDN:');
console.log(`   ${jsdelivrBase}images/...`);
console.log('\n💡 Vantagens do jsDelivr:');
console.log('   ✓ CDN global com alta disponibilidade');
console.log('   ✓ Cache otimizado para arquivos do GitHub');
console.log('   ✓ Suporte CORS adequado');
console.log('   ✓ Compressão automática');
console.log('   ✓ 100% gratuito e confiável');
console.log('\n🚀 Faça commit e push!');
console.log('\n⏱️  jsDelivr atualiza em ~10 minutos após o push');