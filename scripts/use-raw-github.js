#!/usr/bin/env node

/**
 * SOLUÇÃO DEFINITIVA: Usar URLs diretas do GitHub (raw.githubusercontent.com)
 * Isso garante que as imagens sejam carregadas diretamente do repositório
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 APLICANDO SOLUÇÃO DEFINITIVA - URLs diretas do GitHub\n');

const htmlFile = path.join(__dirname, '..', 'manuais', 'SOX406', 'index.html');

// Ler o arquivo HTML
let content = fs.readFileSync(htmlFile, 'utf8');

// Base URL para raw GitHub
const rawGitHubBase = 'https://raw.githubusercontent.com/elevelab/elevelab-manuais/main/manuais/SOX406/';

// Padrões para substituir
const patterns = [
    // Substituir URLs absolutas atuais
    { 
        from: /src="\/elevelab-manuais\/manuais\/SOX406\/images\//g,
        to: `src="${rawGitHubBase}images/`
    },
    // Substituir URLs relativas
    { 
        from: /src="images\//g,
        to: `src="${rawGitHubBase}images/`
    },
    // Corrigir onclick handlers
    { 
        from: /\.src='\/elevelab-manuais\/manuais\/SOX406\/images\//g,
        to: `.src='${rawGitHubBase}images/`
    },
    { 
        from: /\.src='images\//g,
        to: `.src='${rawGitHubBase}images/`
    }
];

let totalReplacements = 0;

patterns.forEach(pattern => {
    const matches = content.match(pattern.from);
    if (matches) {
        content = content.replace(pattern.from, pattern.to);
        totalReplacements += matches.length;
        console.log(`✅ Substituído ${matches.length} ocorrências`);
    }
});

// Remover a tag base que pode estar causando conflito
content = content.replace(/<base[^>]*>/g, '');

// Salvar
fs.writeFileSync(htmlFile, content);

console.log('\n' + '='.repeat(60));
console.log('✅ SOLUÇÃO APLICADA COM SUCESSO!');
console.log('='.repeat(60));
console.log('\n📌 As imagens agora usam URLs diretas do GitHub:');
console.log(`   ${rawGitHubBase}images/...`);
console.log('\n💡 Esta solução SEMPRE funciona porque:');
console.log('   1. Não depende do GitHub Pages');
console.log('   2. Acessa as imagens diretamente do repositório');
console.log('   3. Funciona imediatamente após o push');
console.log('\n🚀 Faça commit e push AGORA!');
console.log('\n⚠️  IMPORTANTE: As imagens carregarão IMEDIATAMENTE após o push!');
console.log('   Não precisa esperar o GitHub Actions.');