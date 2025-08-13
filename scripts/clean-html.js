#!/usr/bin/env node

/**
 * Limpeza Final do HTML - Remove duplicatas e elementos vazios
 */

const fs = require('fs');
const path = require('path');

function cleanHTML() {
    const htmlPath = 'manuais/SOX406/index.html';
    let html = fs.readFileSync(htmlPath, 'utf-8');
    
    console.log('🧹 Limpando HTML...');
    
    // Remover divs vazios de image-card
    html = html.replace(/<div class="image-card">\s*<div class="image-caption">[^<]*<\/div>\s*<\/div>/g, '');
    
    // Remover elementos órfãos
    html = html.replace(/<div class="image-caption">[^<]*<\/div>\s*<\/div>\s*<div class="image-card">/g, '');
    
    // Remover thumbnail-gallery duplicada
    html = html.replace(/(<\/div>\s*<\/div>)\s*<div class="thumbnail-gallery">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g, '$1');
    
    // Remover interface-card duplicados
    const interfaceCardPattern = /<div class="interface-card">[\s\S]*?<\/div>\s*<\/div>/g;
    const interfaceCards = html.match(interfaceCardPattern);
    
    if (interfaceCards) {
        // Manter apenas os primeiros 4
        const uniqueCards = interfaceCards.slice(0, 4);
        
        // Substituir toda a interface-gallery
        const newInterfaceGallery = `
                <div class="interface-gallery">
                    <h3>Interface do Usuário</h3>
                    <div class="interface-grid">
                        ${uniqueCards.join('')}
                    </div>
                </div>`;
        
        // Remover todas as interface galleries e adicionar apenas uma
        html = html.replace(/<div class="interface-gallery">[\s\S]*?<\/div>\s*<\/div>/g, '');
        html = html.replace(/<!-- Seção: Componentes -->/g, 
            newInterfaceGallery + '\n\n<!-- Seção: Componentes -->');
    }
    
    // Limpar espaços extras
    html = html.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    fs.writeFileSync(htmlPath, html);
    console.log('✅ HTML limpo!');
}

cleanHTML();