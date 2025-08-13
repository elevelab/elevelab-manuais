#!/usr/bin/env node

/**
 * Script para Adicionar Imagens ao Manual SOX406
 * 
 * Este script facilita a adição de imagens ao manual do SOX406,
 * criando estrutura de pastas, gerando HTML otimizado e 
 * configurando lazy loading automático.
 */

const fs = require('fs');
const path = require('path');

class SOX406ImageManager {
    constructor() {
        this.manualPath = 'manuais/sox406';
        this.imagesPath = path.join(this.manualPath, 'images');
        this.indexPath = path.join(this.manualPath, 'index.html');
        
        this.imageTemplates = {
            equipment: this.getEquipmentImageTemplate(),
            interface: this.getInterfaceImageTemplate(),
            components: this.getComponentsImageTemplate(),
            operation: this.getOperationImageTemplate(),
            samples: this.getSamplesImageTemplate(),
            maintenance: this.getMaintenanceImageTemplate()
        };
    }

    async addImages() {
        console.log('🖼️  Adicionando imagens ao Manual SOX406\n');

        try {
            await this.setupImageStructure();
            await this.updateHTML();
            await this.generateImageGuide();
            
            console.log('✅ Imagens adicionadas com sucesso ao SOX406!');
            console.log('\n📁 Estrutura criada:');
            console.log('   - manuais/sox406/images/');
            console.log('   - Placeholders otimizados no HTML');
            console.log('   - Guia de imagens gerado');
            
        } catch (error) {
            console.error('❌ Erro ao adicionar imagens:', error.message);
        }
    }

    async setupImageStructure() {
        console.log('📁 Criando estrutura de imagens...');

        // Criar diretórios
        const directories = [
            'equipment',     // Fotos do equipamento
            'interface',     // Tela LCD e controles
            'components',    // Componentes individuais
            'installation',  // Processo de instalação
            'operation',     // Operação passo a passo
            'samples',       // Preparo de amostras
            'maintenance',   // Manutenção e limpeza
            'troubleshooting' // Solução de problemas
        ];

        for (const dir of directories) {
            const fullPath = path.join(this.imagesPath, dir);
            if (!fs.existsSync(fullPath)) {
                fs.mkdirSync(fullPath, { recursive: true });
                console.log(`   ✅ Criado: ${dir}/`);
            }
        }

        // Criar arquivo README para cada diretório
        await this.createImageREADME();
    }

    async updateHTML() {
        console.log('📝 Atualizando HTML com imagens...');

        let html = fs.readFileSync(this.indexPath, 'utf-8');

        // Substituir placeholders por imagens otimizadas
        html = this.replaceEquipmentImages(html);
        html = this.replaceInterfaceImages(html);
        html = this.replaceComponentsImages(html);
        html = this.replaceOperationImages(html);
        html = this.addImageStyles(html);

        fs.writeFileSync(this.indexPath, html);
        console.log('   ✅ HTML atualizado com imagens');
    }

    replaceEquipmentImages(html) {
        // Substituir showcase principal
        const equipmentShowcase = `
                <div class="equipment-showcase">
                    <h2 style="color: var(--primary-orange); margin-bottom: 30px; font-size: 2rem;">Determinador de Gordura SOX406</h2>
                    <div class="equipment-gallery">
                        <div class="main-image">
                            <img src="images/equipment/sox406-main.jpg" 
                                 alt="Determinador de Gordura SOX406 - Vista Frontal" 
                                 class="equipment-main-img"
                                 data-zoom="true"
                                 loading="eager">
                            <div class="image-overlay">
                                <span class="zoom-icon">🔍</span>
                                <span class="zoom-text">Clique para ampliar</span>
                            </div>
                        </div>
                        <div class="thumbnail-gallery">
                            <img src="images/equipment/sox406-front.jpg" 
                                 alt="Vista frontal do SOX406" 
                                 class="thumbnail active"
                                 data-main="images/equipment/sox406-main.jpg">
                            <img src="images/equipment/sox406-side.jpg" 
                                 alt="Vista lateral do SOX406" 
                                 class="thumbnail"
                                 data-main="images/equipment/sox406-side.jpg">
                            <img src="images/equipment/sox406-back.jpg" 
                                 alt="Vista traseira com conexões" 
                                 class="thumbnail"
                                 data-main="images/equipment/sox406-back.jpg">
                            <img src="images/equipment/sox406-inside.jpg" 
                                 alt="Vista interna dos componentes" 
                                 class="thumbnail"
                                 data-main="images/equipment/sox406-inside.jpg">
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

        return html.replace(
            /<div class="equipment-showcase">[\s\S]*?<\/div>/,
            equipmentShowcase
        );
    }

    replaceInterfaceImages(html) {
        // Adicionar galeria de interface na seção de operação
        const interfaceGallery = `
                <div class="interface-gallery">
                    <h3>Interface do Usuário</h3>
                    <div class="interface-grid">
                        <div class="interface-card">
                            <img src="images/interface/lcd-home.jpg" 
                                 alt="Tela inicial do SOX406" 
                                 loading="lazy">
                            <div class="interface-caption">
                                <h4>Tela Inicial</h4>
                                <p>Menu principal com opções Heating e Set</p>
                            </div>
                        </div>
                        <div class="interface-card">
                            <img src="images/interface/lcd-settings.jpg" 
                                 alt="Configurações de temperatura e tempo" 
                                 loading="lazy">
                            <div class="interface-caption">
                                <h4>Configurações</h4>
                                <p>Ajuste de temperatura e tempo de extração</p>
                            </div>
                        </div>
                        <div class="interface-card">
                            <img src="images/interface/lcd-running.jpg" 
                                 alt="Tela durante operação" 
                                 loading="lazy">
                            <div class="interface-caption">
                                <h4>Em Operação</h4>
                                <p>Monitoramento em tempo real</p>
                            </div>
                        </div>
                        <div class="interface-card">
                            <img src="images/interface/lcd-alarm.jpg" 
                                 alt="Tela de alerta de sobretemperatura" 
                                 loading="lazy">
                            <div class="interface-caption">
                                <h4>Sistema de Alertas</h4>
                                <p>Avisos de temperatura e segurança</p>
                            </div>
                        </div>
                    </div>
                </div>`;

        // Inserir após o grid de imagens na seção de operação
        return html.replace(
            /<div class="image-grid">[\s\S]*?<\/div>/,
            interfaceGallery
        );
    }

    replaceComponentsImages(html) {
        // Atualizar seção de componentes com imagens reais
        const componentsSection = `
                <div class="components-detailed">
                    <div class="component-showcase">
                        <div class="component-main">
                            <img src="images/components/sox406-exploded.jpg" 
                                 alt="Vista explodida dos componentes SOX406" 
                                 class="exploded-view"
                                 loading="lazy">
                            <div class="component-markers">
                                <div class="marker" data-component="soxhlet" style="top: 20%; left: 30%;">
                                    <span class="marker-number">1</span>
                                    <div class="marker-tooltip">Tubos Soxhlet</div>
                                </div>
                                <div class="marker" data-component="condenser" style="top: 15%; left: 60%;">
                                    <span class="marker-number">2</span>
                                    <div class="marker-tooltip">Condensadores</div>
                                </div>
                                <div class="marker" data-component="heater" style="top: 70%; left: 45%;">
                                    <span class="marker-number">3</span>
                                    <div class="marker-tooltip">Bloco Aquecedor</div>
                                </div>
                                <div class="marker" data-component="control" style="top: 40%; left: 80%;">
                                    <span class="marker-number">4</span>
                                    <div class="marker-tooltip">Painel de Controle</div>
                                </div>
                            </div>
                        </div>
                        <div class="component-details">
                            <div class="component-item active" data-component="soxhlet">
                                <img src="images/components/soxhlet-tubes.jpg" alt="Tubos Soxhlet">
                                <div class="component-info">
                                    <h4>Tubos Soxhlet</h4>
                                    <p>6 tubos de vidro borossilicato para extração contínua</p>
                                </div>
                            </div>
                            <div class="component-item" data-component="condenser">
                                <img src="images/components/condensers.jpg" alt="Sistema de Condensação">
                                <div class="component-info">
                                    <h4>Condensadores</h4>
                                    <p>Sistema de refrigeração por água para recuperação do solvente</p>
                                </div>
                            </div>
                            <div class="component-item" data-component="heater">
                                <img src="images/components/heating-block.jpg" alt="Bloco Aquecedor">
                                <div class="component-info">
                                    <h4>Bloco Aquecedor</h4>
                                    <p>Aquecimento uniforme até 280°C com controle PID</p>
                                </div>
                            </div>
                            <div class="component-item" data-component="control">
                                <img src="images/components/control-panel.jpg" alt="Painel de Controle">
                                <div class="component-info">
                                    <h4>Painel de Controle</h4>
                                    <p>Display LCD 4.3" com controle por microcomputador</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;

        return html.replace(
            /<div class="image-grid">[\s\S]*?<div class="content-grid">/,
            componentsSection + '\n\n                <div class="content-grid">'
        );
    }

    replaceOperationImages(html) {
        // Adicionar imagens passo a passo na operação
        const operationSteps = `
                <div class="operation-visual-guide">
                    <h3>Guia Visual de Operação</h3>
                    <div class="operation-steps-visual">
                        <div class="step-visual">
                            <div class="step-image">
                                <img src="images/operation/step1-preparation.jpg" 
                                     alt="Preparação inicial do SOX406" 
                                     loading="lazy">
                            </div>
                            <div class="step-description">
                                <h4>1. Preparação</h4>
                                <p>Verificar nível de água e conectar mangueiras de refrigeração</p>
                            </div>
                        </div>
                        <div class="step-visual">
                            <div class="step-image">
                                <img src="images/operation/step2-samples.jpg" 
                                     alt="Colocação de amostras nos tubos" 
                                     loading="lazy">
                            </div>
                            <div class="step-description">
                                <h4>2. Inserir Amostras</h4>
                                <p>Colocar amostras preparadas nos tubos Soxhlet com solvente</p>
                            </div>
                        </div>
                        <div class="step-visual">
                            <div class="step-image">
                                <img src="images/operation/step3-program.jpg" 
                                     alt="Configuração de programa na tela LCD" 
                                     loading="lazy">
                            </div>
                            <div class="step-description">
                                <h4>3. Configurar Programa</h4>
                                <p>Selecionar temperatura, tempo e programa de extração</p>
                            </div>
                        </div>
                        <div class="step-visual">
                            <div class="step-image">
                                <img src="images/operation/step4-running.jpg" 
                                     alt="Equipamento em operação" 
                                     loading="lazy">
                            </div>
                            <div class="step-description">
                                <h4>4. Iniciar Processo</h4>
                                <p>Processo automático de aquecimento e extração</p>
                            </div>
                        </div>
                        <div class="step-visual">
                            <div class="step-image">
                                <img src="images/operation/step5-results.jpg" 
                                     alt="Coleta de resultados" 
                                     loading="lazy">
                            </div>
                            <div class="step-description">
                                <h4>5. Coleta de Resultados</h4>
                                <p>Retirar tubos, evaporar solvente e pesar resíduo</p>
                            </div>
                        </div>
                    </div>
                </div>`;

        return html.replace(
            /<div class="steps-list">/,
            operationSteps + '\n\n                <div class="steps-list">'
        );
    }

    addImageStyles(html) {
        // Adicionar estilos específicos para imagens
        const imageStyles = `
        /* Estilos para Galeria de Equipamento */
        .equipment-gallery {
            display: flex;
            flex-direction: column;
            gap: 20px;
            max-width: 800px;
            margin: 0 auto;
        }

        .main-image {
            position: relative;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: var(--shadow);
        }

        .equipment-main-img {
            width: 100%;
            height: 400px;
            object-fit: cover;
            cursor: zoom-in;
            transition: transform 0.3s ease;
        }

        .equipment-main-img:hover {
            transform: scale(1.02);
        }

        .image-overlay {
            position: absolute;
            bottom: 15px;
            right: 15px;
            background: rgba(0,0,0,0.7);
            color: white;
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 12px;
            display: flex;
            align-items: center;
            gap: 5px;
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .main-image:hover .image-overlay {
            opacity: 1;
        }

        .thumbnail-gallery {
            display: flex;
            gap: 10px;
            justify-content: center;
            flex-wrap: wrap;
        }

        .thumbnail {
            width: 80px;
            height: 80px;
            border-radius: 8px;
            object-fit: cover;
            cursor: pointer;
            border: 3px solid transparent;
            transition: all 0.3s ease;
        }

        .thumbnail.active,
        .thumbnail:hover {
            border-color: var(--primary-orange);
            transform: scale(1.1);
        }

        .equipment-specs-visual {
            display: flex;
            justify-content: center;
            gap: 40px;
            margin-top: 30px;
            flex-wrap: wrap;
        }

        .spec-highlight {
            text-align: center;
            padding: 20px;
            background: white;
            border-radius: 15px;
            box-shadow: var(--shadow);
            min-width: 120px;
        }

        .spec-number {
            display: block;
            font-size: 2rem;
            font-weight: 700;
            color: var(--primary-orange);
            margin-bottom: 5px;
        }

        .spec-label {
            font-size: 0.9rem;
            color: var(--text-dark);
            font-weight: 500;
        }

        /* Interface Gallery */
        .interface-gallery {
            margin: 40px 0;
        }

        .interface-gallery h3 {
            text-align: center;
            color: var(--secondary-black);
            margin-bottom: 30px;
            font-size: 1.8rem;
        }

        .interface-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
        }

        .interface-card {
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: var(--shadow);
            transition: transform 0.3s ease;
        }

        .interface-card:hover {
            transform: translateY(-5px);
        }

        .interface-card img {
            width: 100%;
            height: 180px;
            object-fit: cover;
        }

        .interface-caption {
            padding: 20px;
        }

        .interface-caption h4 {
            color: var(--secondary-black);
            margin-bottom: 10px;
            font-size: 1.2rem;
        }

        .interface-caption p {
            color: #666;
            font-size: 0.9rem;
            line-height: 1.5;
        }

        /* Components Detailed */
        .components-detailed {
            margin: 40px 0;
        }

        .component-showcase {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 30px;
            background: white;
            border-radius: var(--border-radius);
            padding: 30px;
            box-shadow: var(--shadow);
        }

        .component-main {
            position: relative;
        }

        .exploded-view {
            width: 100%;
            height: 400px;
            object-fit: contain;
            border-radius: 10px;
        }

        .component-markers {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
        }

        .marker {
            position: absolute;
            cursor: pointer;
        }

        .marker-number {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 30px;
            height: 30px;
            background: var(--primary-orange);
            color: white;
            border-radius: 50%;
            font-weight: bold;
            font-size: 14px;
            box-shadow: 0 2px 10px rgba(231, 55, 0, 0.3);
            transition: transform 0.3s ease;
        }

        .marker:hover .marker-number {
            transform: scale(1.2);
        }

        .marker-tooltip {
            position: absolute;
            top: -40px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--secondary-black);
            color: white;
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 12px;
            white-space: nowrap;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
        }

        .marker:hover .marker-tooltip {
            opacity: 1;
        }

        .component-details {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }

        .component-item {
            display: flex;
            gap: 15px;
            padding: 15px;
            border-radius: 10px;
            cursor: pointer;
            transition: var(--transition);
            border: 2px solid transparent;
        }

        .component-item:hover,
        .component-item.active {
            background: var(--light-gray);
            border-color: var(--primary-orange);
        }

        .component-item img {
            width: 60px;
            height: 60px;
            object-fit: cover;
            border-radius: 8px;
        }

        .component-info h4 {
            font-size: 1rem;
            color: var(--secondary-black);
            margin-bottom: 5px;
        }

        .component-info p {
            font-size: 0.85rem;
            color: #666;
            line-height: 1.4;
        }

        /* Operation Visual Guide */
        .operation-visual-guide {
            margin: 40px 0;
            background: white;
            border-radius: var(--border-radius);
            padding: 30px;
            box-shadow: var(--shadow);
        }

        .operation-visual-guide h3 {
            text-align: center;
            color: var(--secondary-black);
            margin-bottom: 30px;
            font-size: 1.8rem;
        }

        .operation-steps-visual {
            display: flex;
            flex-direction: column;
            gap: 25px;
        }

        .step-visual {
            display: flex;
            align-items: center;
            gap: 25px;
            padding: 20px;
            border-radius: 15px;
            transition: var(--transition);
        }

        .step-visual:hover {
            background: var(--light-gray);
        }

        .step-image {
            flex-shrink: 0;
        }

        .step-image img {
            width: 120px;
            height: 120px;
            object-fit: cover;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .step-description h4 {
            color: var(--primary-orange);
            font-size: 1.3rem;
            margin-bottom: 10px;
        }

        .step-description p {
            color: var(--text-dark);
            line-height: 1.6;
        }

        /* Responsive Images */
        @media (max-width: 768px) {
            .equipment-gallery {
                max-width: 100%;
            }

            .equipment-main-img {
                height: 250px;
            }

            .thumbnail {
                width: 60px;
                height: 60px;
            }

            .equipment-specs-visual {
                gap: 20px;
            }

            .component-showcase {
                grid-template-columns: 1fr;
            }

            .operation-steps-visual .step-visual {
                flex-direction: column;
                text-align: center;
            }

            .step-image img {
                width: 100px;
                height: 100px;
            }
        }

        /* Image Loading States */
        img[loading="lazy"] {
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        img[loading="lazy"].loaded {
            opacity: 1;
        }

        /* Zoom Modal */
        .image-zoom-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }

        .image-zoom-modal.active {
            opacity: 1;
            visibility: visible;
        }

        .image-zoom-modal img {
            max-width: 90%;
            max-height: 90%;
            object-fit: contain;
            border-radius: 10px;
        }

        .zoom-close {
            position: absolute;
            top: 20px;
            right: 20px;
            background: var(--primary-orange);
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 20px;
            border: none;
        }`;

        // Inserir estilos antes do fechamento do </style>
        return html.replace('</style>', imageStyles + '\n        </style>');
    }

    async createImageREADME() {
        const readmeContent = `# Imagens do Manual SOX406

## Estrutura de Pastas

### equipment/
Fotos do equipamento completo:
- sox406-main.jpg (imagem principal - frontal)
- sox406-front.jpg (vista frontal)
- sox406-side.jpg (vista lateral)
- sox406-back.jpg (vista traseira com conexões)
- sox406-inside.jpg (vista interna)

**Especificações recomendadas:**
- Resolução: 1200x900px ou superior
- Formato: JPG (qualidade 85%)
- Fundo: Neutro (branco/cinza claro)

### interface/
Capturas da tela LCD:
- lcd-home.jpg (tela inicial)
- lcd-settings.jpg (configurações)
- lcd-running.jpg (em operação)
- lcd-alarm.jpg (alertas)

**Especificações recomendadas:**
- Resolução: 800x600px
- Formato: JPG ou PNG
- Qualidade: Alta (telas devem ser legíveis)

### components/
Componentes individuais:
- sox406-exploded.jpg (vista explodida)
- soxhlet-tubes.jpg (tubos de extração)
- condensers.jpg (sistema de condensação)
- heating-block.jpg (bloco aquecedor)
- control-panel.jpg (painel de controle)

**Especificações recomendadas:**
- Resolução: 800x600px
- Formato: JPG
- Fundo: Neutro para destaque

### operation/
Passos da operação:
- step1-preparation.jpg (preparação inicial)
- step2-samples.jpg (inserção de amostras)
- step3-program.jpg (configuração)
- step4-running.jpg (equipamento funcionando)
- step5-results.jpg (coleta de resultados)

**Especificações recomendadas:**
- Resolução: 600x600px
- Formato: JPG
- Composição: Mostrar ação sendo realizada

## Como Adicionar Imagens

1. **Fotografar o equipamento:**
   - Use boa iluminação
   - Fundo neutro
   - Múltiplos ângulos
   - Detalhes importantes em foco

2. **Processar as imagens:**
   - Redimensionar conforme especificações
   - Ajustar brilho/contraste
   - Salvar com nomes exatos

3. **Colocar nas pastas:**
   - Usar nomes de arquivo exatos
   - Verificar tamanhos
   - Testar carregamento

4. **Otimizar automaticamente:**
   \`\`\`bash
   npm run optimize-images
   \`\`\`

## Formatos Suportados
- JPG (recomendado para fotos)
- PNG (para capturas de tela)
- WebP (gerado automaticamente)

## Lazy Loading
Todas as imagens (exceto a principal) usam lazy loading automático para melhor performance.

## Zoom de Imagens
As imagens principais têm função de zoom ao clicar.
`;

        fs.writeFileSync(
            path.join(this.imagesPath, 'README.md'),
            readmeContent
        );
    }

    async generateImageGuide() {
        const guideContent = `# Guia Rápido - Imagens SOX406

## ✅ Checklist de Imagens Necessárias

### 📷 Equipamento (Prioridade ALTA)
- [ ] sox406-main.jpg - Imagem principal frontal
- [ ] sox406-front.jpg - Vista frontal
- [ ] sox406-side.jpg - Vista lateral  
- [ ] sox406-back.jpg - Vista traseira
- [ ] sox406-inside.jpg - Componentes internos

### 📱 Interface LCD (Prioridade ALTA)
- [ ] lcd-home.jpg - Tela inicial
- [ ] lcd-settings.jpg - Configurações
- [ ] lcd-running.jpg - Em operação
- [ ] lcd-alarm.jpg - Tela de alerta

### 🔧 Componentes (Prioridade MÉDIA)
- [ ] sox406-exploded.jpg - Vista explodida
- [ ] soxhlet-tubes.jpg - Tubos Soxhlet
- [ ] condensers.jpg - Condensadores
- [ ] heating-block.jpg - Bloco aquecedor
- [ ] control-panel.jpg - Painel controle

### 👨‍🔬 Operação (Prioridade MÉDIA)
- [ ] step1-preparation.jpg - Preparação
- [ ] step2-samples.jpg - Amostras
- [ ] step3-program.jpg - Programação
- [ ] step4-running.jpg - Funcionamento
- [ ] step5-results.jpg - Resultados

## 🚀 Comandos Úteis

\`\`\`bash
# Otimizar todas as imagens
npm run optimize-images

# Testar manual local
npm run dev

# Build final
npm run build
\`\`\`

## 📏 Tamanhos Recomendados

| Tipo | Largura | Altura | Formato |
|------|---------|--------|---------|
| Principal | 1200px | 900px | JPG |
| Interface | 800px | 600px | PNG |
| Componentes | 800px | 600px | JPG |
| Operação | 600px | 600px | JPG |

## 🎯 Dicas de Fotografia

1. **Iluminação:** Use luz natural ou softbox
2. **Fundo:** Branco ou cinza neutro
3. **Ângulo:** Múltiplas perspectivas
4. **Foco:** Detalhes importantes nítidos
5. **Composição:** Regra dos terços

## ❓ Precisa de Ajuda?

- 📧 Contato: contato@elevelab.com.br
- 📱 WhatsApp: (51) 9 9858-4548
`;

        fs.writeFileSync(
            path.join(this.manualPath, 'IMAGENS-GUIA.md'),
            guideContent
        );
    }

    // Template methods para diferentes tipos de imagem
    getEquipmentImageTemplate() {
        return `
            <div class="equipment-gallery">
                <div class="main-image">
                    <img src="images/equipment/sox406-main.jpg" 
                         alt="Determinador de Gordura SOX406" 
                         class="equipment-main-img"
                         loading="eager">
                </div>
                <div class="thumbnail-gallery">
                    <!-- Thumbnails aqui -->
                </div>
            </div>
        `;
    }

    getInterfaceImageTemplate() {
        return `
            <div class="interface-grid">
                <div class="interface-card">
                    <img src="images/interface/lcd-home.jpg" 
                         alt="Tela inicial" 
                         loading="lazy">
                </div>
            </div>
        `;
    }

    getComponentsImageTemplate() {
        return `
            <div class="component-showcase">
                <img src="images/components/sox406-exploded.jpg" 
                     alt="Componentes do SOX406"
                     loading="lazy">
            </div>
        `;
    }

    getOperationImageTemplate() {
        return `
            <div class="step-visual">
                <img src="images/operation/step1.jpg" 
                     alt="Passo da operação"
                     loading="lazy">
            </div>
        `;
    }

    getSamplesImageTemplate() {
        return `
            <img src="images/samples/sample-preparation.jpg" 
                 alt="Preparo de amostras"
                 loading="lazy">
        `;
    }

    getMaintenanceImageTemplate() {
        return `
            <img src="images/maintenance/cleaning.jpg" 
                 alt="Procedimento de limpeza"
                 loading="lazy">
        `;
    }
}

// CLI Interface
if (require.main === module) {
    const manager = new SOX406ImageManager();
    manager.addImages().catch(console.error);
}

module.exports = SOX406ImageManager;