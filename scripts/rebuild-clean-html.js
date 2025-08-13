#!/usr/bin/env node

/**
 * Reconstroi HTML completamente limpo com apenas imagens reais
 */

const fs = require('fs');
const path = require('path');

function rebuildHTML() {
    console.log('🔄 Reconstruindo HTML limpo...');
    
    // Obter imagens reais disponíveis
    const imagesPath = 'manuais/SOX406/images';
    const equipmentImages = fs.readdirSync(path.join(imagesPath, 'equipment')).filter(f => f.endsWith('.jpg'));
    const interfaceImages = fs.readdirSync(path.join(imagesPath, 'interface')).filter(f => f.endsWith('.jpg'));
    const operationImages = fs.readdirSync(path.join(imagesPath, 'operation')).filter(f => f.endsWith('.jpg'));
    
    console.log(`Equipment: ${equipmentImages.length}, Interface: ${interfaceImages.length}, Operation: ${operationImages.length}`);
    
    // HTML Base
    const htmlTemplate = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manual SOX406 - Determinador de Gordura | EleveLab</title>
    <meta name="description" content="Manual interativo do Determinador de Gordura SOX406 - EleveLab Equipamentos Científicos">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet">
    <style>
        /* Estilos CSS completos aqui - copiados do arquivo original */
        ${getCSSStyles()}
    </style>
</head>
<body class="loading">
    ${getHeader()}
    ${getNavigation()}
    <main class="main">
        <div class="container">
            ${getOverviewSection(equipmentImages)}
            ${getSpecificationsSection()}
            ${getComponentsSection(interfaceImages)}
            ${getInstallationSection(operationImages)}
            ${getOperationSection()}
            ${getMaintenanceSection()}
            ${getTroubleshootingSection()}
            ${getWarrantySection()}
        </div>
    </main>
    ${getFooter()}
    ${getJavaScript()}
</body>
</html>`;

    fs.writeFileSync('manuais/SOX406/index.html', htmlTemplate);
    console.log('✅ HTML reconstruído!');
}

function getCSSStyles() {
    // Ler CSS do arquivo original
    const originalHTML = fs.readFileSync('manuais/SOX406/index.html.backup', 'utf-8');
    const cssMatch = originalHTML.match(/<style>([\s\S]*?)<\/style>/);
    return cssMatch ? cssMatch[1] : '';
}

function getHeader() {
    return `
    <!-- Header -->
    <header class="header">
        <div class="container">
            <div class="header-content">
                <div class="logo">
                    <div class="logo-circles">
                        <div class="circle-row">
                            <div class="circle large"></div>
                        </div>
                        <div class="circle-row">
                            <div class="circle medium"></div>
                            <div class="circle small"></div>
                        </div>
                    </div>
                    <div>
                        <div class="logo-text">EleveLab</div>
                        <div class="logo-subtitle">EQUIPAMENTOS CIENTÍFICOS</div>
                    </div>
                </div>
                
                <button class="mobile-menu-toggle" onclick="toggleMobileMenu()">
                    <div class="hamburger"></div>
                    <div class="hamburger"></div>
                    <div class="hamburger"></div>
                </button>
            </div>
        </div>
    </header>`;
}

function getNavigation() {
    return `
    <!-- Navegação -->
    <nav class="nav">
        <div class="container">
            <div class="nav-content" id="navContent">
                <span class="nav-item active" onclick="showSection('overview', this)">Visão Geral</span>
                <span class="nav-item" onclick="showSection('specifications', this)">Especificações</span>
                <span class="nav-item" onclick="showSection('components', this)">Componentes</span>
                <span class="nav-item" onclick="showSection('installation', this)">Instalação</span>
                <span class="nav-item" onclick="showSection('operation', this)">Operação</span>
                <span class="nav-item" onclick="showSection('maintenance', this)">Manutenção</span>
                <span class="nav-item" onclick="showSection('troubleshooting', this)">Solução de Problemas</span>
                <span class="nav-item" onclick="showSection('warranty', this)">Garantia</span>
            </div>
        </div>
    </nav>`;
}

function getOverviewSection(equipmentImages) {
    const mainImage = equipmentImages[0] || 'equipment-6.jpg';
    const thumbnails = equipmentImages.slice(0, 4);
    
    return `
            <!-- Seção: Visão Geral -->
            <section id="overview" class="section active">
                <div class="section-header">
                    <h1 class="section-title">Determinador de Gordura Automatizado</h1>
                    <p class="section-subtitle">Manual do Usuário - SOX406 - Equipamento de alta precisão para análise de gordura baseado no princípio de extração Soxhlet</p>
                </div>

                <div class="warning-box">
                    <div class="warning-icon">⚠️</div>
                    <div class="warning-content">
                        <strong>IMPORTANTE:</strong> Leia este manual cuidadosamente antes da instalação e operação do equipamento.
                    </div>
                </div>

                <div class="equipment-showcase">
                    <h2 style="color: var(--primary-orange); margin-bottom: 30px; font-size: 2rem;">Determinador de Gordura SOX406</h2>
                    <div class="equipment-gallery">
                        <div class="main-image">
                            <img src="images/equipment/${mainImage}" 
                                 alt="Determinador de Gordura SOX406" 
                                 class="equipment-main-img"
                                 loading="eager">
                        </div>
                        <div class="thumbnail-gallery">
                            ${thumbnails.map(img => `
                            <img src="images/equipment/${img}" 
                                 alt="Vista do SOX406" 
                                 class="thumbnail"
                                 onclick="document.querySelector('.equipment-main-img').src='images/equipment/${img}'">
                            `).join('')}
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
                </div>

                <div class="highlight-box">
                    <h2 class="highlight-title">Extrator de Gordura Automatizado EleveLab</h2>
                    <p class="highlight-content">Projetado com base no princípio de extração a quente para determinação do teor de gordura/extrato etéreo/lipídios. Necessita apenas um toque do operador para realizar as etapas de elevação, pré-aquecimento, extração, diluição e recuperação de solvente de forma automática.</p>
                </div>

                <div class="content-grid">
                    <div class="content-card">
                        <h2 class="card-title">🎯 Aplicações Principais</h2>
                        <div class="card-content">
                            <p>O Analisador de Gordura SOX406 é projetado segundo a norma GB/T 14772-2008 e pode medir:</p>
                            <ul>
                                <li><strong>Alimentos & Bebidas:</strong> Análise de gordura em produtos alimentícios</li>
                                <li><strong>Grãos & Óleos:</strong> Determinação de lipídios em sementes e grãos</li>
                                <li><strong>Nutrição Animal:</strong> Extrato etéreo em rações</li>
                                <li><strong>Farmacêuticas:</strong> Compostos orgânicos solúveis</li>
                                <li><strong>Ambiental:</strong> Óleos e graxas em águas residuais</li>
                                <li><strong>Química & Petroquímica:</strong> Análises de compostos orgânicos</li>
                            </ul>
                        </div>
                    </div>

                    <div class="content-card">
                        <h2 class="card-title">⚗️ Princípio de Funcionamento</h2>
                        <div class="card-content">
                            <p>O instrumento utiliza o método gravimétrico para medir o conteúdo de gordura de acordo com o <strong>princípio de extração Soxhlet</strong>.</p>
                            <p style="margin-top: 15px;">Após a extração da amostra usando éter anidro ou éter de petróleo, a gordura é extraída da amostra, seca e pesada. A diferença de massa calculada antes e após a extração representa o conteúdo de gordura.</p>
                            <p style="margin-top: 15px;"><strong>Automação completa:</strong> Cinco programas de extração para diferentes demandas com processo totalmente automatizado.</p>
                        </div>
                    </div>
                </div>
            </section>`;
}

function getComponentsSection(interfaceImages) {
    const interfaceCards = interfaceImages.slice(0, 4).map((img, index) => {
        const titles = ['Interface LCD', 'Configurações', 'Sistema de Monitoramento', 'Painel de Controle'];
        const descriptions = [
            'Tela principal do equipamento',
            'Configuração de parâmetros',
            'Monitoramento em tempo real',
            'Controles e indicadores'
        ];
        
        return `
                        <div class="interface-card">
                            <img src="images/interface/${img}" 
                                 alt="${titles[index]}" 
                                 loading="lazy">
                            <div class="interface-caption">
                                <h4>${titles[index]}</h4>
                                <p>${descriptions[index]}</p>
                            </div>
                        </div>`;
    });

    return `
            <!-- Seção: Componentes -->
            <section id="components" class="section">
                <div class="section-header">
                    <h1 class="section-title">Componentes do Instrumento</h1>
                    <p class="section-subtitle">Identificação dos componentes principais do equipamento</p>
                </div>

                <div class="interface-gallery">
                    <h3>Interface do Usuário</h3>
                    <div class="interface-grid">
                        ${interfaceCards.join('')}
                    </div>
                </div>

                <div class="content-grid">
                    <div class="content-card">
                        <h2 class="card-title">🔧 Componentes Principais</h2>
                        <div class="card-content">
                            <ol>
                                <li><strong>Esferas Deslizantes:</strong> Permitem o movimento vertical dos tubos de condensação</li>
                                <li><strong>Tubos de Condensação:</strong> Sistema de condensação eficiente para recuperação de solvente</li>
                                <li><strong>Torneiras (Plug Cock):</strong> Controlam o fluxo de solvente durante o processo</li>
                                <li><strong>Copos de Extração (80mL):</strong> Recipientes onde ocorre a extração da gordura</li>
                                <li><strong>Interface de Energia:</strong> Conexão elétrica principal com proteções</li>
                            </ol>
                        </div>
                    </div>

                    <div class="content-card">
                        <h2 class="card-title">💧 Sistema de Refrigeração</h2>
                        <div class="card-content">
                            <p><strong>Entrada de Água:</strong> Conectar à válvula de água corrente com fluxo de 1-2 L/min</p>
                            <p style="margin-top: 15px;"><strong>Saída de Água:</strong> Conectar ao sistema de drenagem</p>
                        </div>
                    </div>
                </div>
            </section>`;
}

// Outras funções para as demais seções...
function getSpecificationsSection() { return '<!-- Especificações -->'; }
function getInstallationSection() { return '<!-- Instalação -->'; }
function getOperationSection() { return '<!-- Operação -->'; }
function getMaintenanceSection() { return '<!-- Manutenção -->'; }
function getTroubleshootingSection() { return '<!-- Troubleshooting -->'; }
function getWarrantySection() { return '<!-- Garantia -->'; }
function getFooter() { return '<!-- Footer -->'; }
function getJavaScript() { return '<script>/* JS aqui */</script>'; }

rebuildHTML();