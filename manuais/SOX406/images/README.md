# Imagens do Manual SOX406

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
   ```bash
   npm run optimize-images
   ```

## Formatos Suportados
- JPG (recomendado para fotos)
- PNG (para capturas de tela)
- WebP (gerado automaticamente)

## Lazy Loading
Todas as imagens (exceto a principal) usam lazy loading automático para melhor performance.

## Zoom de Imagens
As imagens principais têm função de zoom ao clicar.
