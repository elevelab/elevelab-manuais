#!/usr/bin/env node

/**
 * Solução Completa - Recriar HTML Limpo
 */

const fs = require('fs');

function completeHTMLFix() {
    console.log('🔄 Recriando HTML completamente limpo...');
    
    // Restaurar do backup primeiro
    const backupContent = fs.readFileSync('manuais/SOX406/index.html.backup', 'utf-8');
    
    // Obter imagens disponíveis
    const equipment = [
        'equipment-6.jpg', 'equipment-7.jpg', 'sox406-front.jpg', 
        'sox406-inside.jpg', 'sox406-main.jpg', 'sox406-side.jpg'
    ];
    
    const interface = [
        'interface-10.jpg', 'interface-11.jpg', 'interface-12.jpg', 'interface-13.jpg',
        'interface-14.jpg', 'interface-15.jpg', 'interface-16.jpg', 'interface-17.jpg',
        'interface-18.jpg', 'interface-19.jpg', 'interface-8.jpg', 'interface-9.jpg',
        'lcd-alarm.jpg', 'lcd-home.jpg', 'lcd-running.jpg', 'lcd-settings.jpg'
    ];

    // Criar HTML limpo baseado no backup
    let cleanHTML = backupContent;
    
    // 1. Remover todas as galerias malformadas
    cleanHTML = cleanHTML.replace(/<div class="interface-gallery">[\s\S]*?<\/div>\s*<\/div>/g, '');
    cleanHTML = cleanHTML.replace(/<div class="image-grid">[\s\S]*?<\/div>/g, '');
    
    // 2. Corrigir equipment showcase
    const equipmentGallery = `
                <div class="equipment-showcase">
                    <h2 style="color: var(--primary-orange); margin-bottom: 30px; font-size: 2rem;">Determinador de Gordura SOX406</h2>
                    <div class="equipment-gallery">
                        <div class="main-image">
                            <img src="images/equipment/${equipment[0]}" 
                                 alt="Determinador de Gordura SOX406" 
                                 class="equipment-main-img"
                                 loading="eager">
                        </div>
                        <div class="thumbnail-gallery">
                            ${equipment.slice(0, 4).map(img => `
                            <img src="images/equipment/${img}" 
                                 alt="Vista do SOX406" 
                                 class="thumbnail"
                                 onclick="document.querySelector('.equipment-main-img').src='images/equipment/${img}'">`).join('')}
                        </div>
                    </div>
                    <div class="equipment-specs-visual">
                        <div class="spec-highlight">
                            <span class="spec-number">6</span>
                            <span class="spec-label">Posições de Amostra</span>
                        </div>
                        <div class="spec-highlight">
                            <span class="spec-number">280°C</span>
                            <span class="spec-label">Temperatura Máxima</span>
                        </div>
                        <div class="spec-highlight">
                            <span class="spec-number">4.3"</span>
                            <span class="spec-label">Display LCD</span>
                        </div>
                    </div>
                </div>`;
    
    // Substituir equipment showcase
    cleanHTML = cleanHTML.replace(
        /<div class="equipment-showcase">[\s\S]*?<div class="equipment-specs-visual">[\s\S]*?<\/div>\s*<\/div>/,
        equipmentGallery
    );
    
    // 3. Adicionar interface gallery antes dos componentes
    const interfaceGallery = `
                <div class="interface-gallery">
                    <h3>Interface do Usuário</h3>
                    <div class="interface-grid">
                        ${interface.slice(0, 8).map((img, i) => {
                            const titles = ['Display Principal', 'Configurações', 'Em Operação', 'Alertas', 'Menu Avançado', 'Temperatura', 'Status', 'Alarmes'];
                            const descriptions = ['Interface principal', 'Configuração de parâmetros', 'Monitoramento em tempo real', 'Sistema de alertas', 'Configurações avançadas', 'Controle de temperatura', 'Estado do sistema', 'Notificações'];
                            return `
                        <div class="interface-card">
                            <img src="images/interface/${img}" 
                                 alt="${titles[i]}" 
                                 loading="lazy">
                            <div class="interface-caption">
                                <h4>${titles[i]}</h4>
                                <p>${descriptions[i]}</p>
                            </div>
                        </div>`;
                        }).join('')}
                    </div>
                </div>
`;
    
    // Adicionar antes dos componentes
    cleanHTML = cleanHTML.replace(
        /<!-- Seção: Componentes -->/,
        interfaceGallery + '\n            <!-- Seção: Componentes -->'
    );
    
    // 4. Limpar elementos órfãos e duplicados
    cleanHTML = cleanHTML.replace(/<div class="interface-card">\s*<img[^>]*>\s*<div class="interface-caption">[^<]*<h4>[^<]*<\/h4>[^<]*<p>[^<]*<\/p>/g, '');
    cleanHTML = cleanHTML.replace(/<div class="image-caption">[^<]*<\/div>\s*<\/div>/g, '');
    cleanHTML = cleanHTML.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    // Salvar
    fs.writeFileSync('manuais/SOX406/index.html', cleanHTML);
    console.log('✅ HTML completamente recriado!');
    console.log(`📷 Equipment: ${equipment.length} imagens`);
    console.log(`💻 Interface: 8 imagens principais`);
}

completeHTMLFix();