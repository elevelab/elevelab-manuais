# 📄 Extrator de Imagens de Word - EleveLab

Automatize completamente a extração e organização de imagens de documentos Word para os manuais EleveLab.

## 🚀 Setup Inicial (Primeira vez)

```bash
# 1. Instalar dependências necessárias
make setup-word-extractor
# ou
node scripts/setup-word-extractor.js

# 2. Verificar se tudo está funcionando
npm run extract-word-images --help
```

## 📥 Como Usar

### Método 1: Makefile (Recomendado)
```bash
make extract-word FILE=manual-sox406.docx MANUAL=sox406
```

### Método 2: NPM Script
```bash
npm run extract-word-images manual-sox406.docx sox406
```

### Método 3: Node Direto
```bash
node scripts/extract-word-images.js manual-sox406.docx sox406
```

### Modo Interativo
```bash
# O script perguntará o nome do manual se não fornecido
node scripts/extract-word-images.js manual-sox406.docx
```

## 🎯 O que o Sistema Faz

### 1. Extração Inteligente
- ✅ Lê arquivos .docx nativamente
- ✅ Extrai todas as imagens incorporadas
- ✅ Preserva qualidade original
- ✅ Suporta JPG, PNG, GIF, BMP, TIFF, WebP

### 2. Classificação Automática
- **Por Nome do Arquivo:**
  - `equipamento`, `aparelho`, `vista` → `equipment/`
  - `tela`, `lcd`, `display`, `menu` → `interface/`
  - `componente`, `peça`, `tubo` → `components/`
  - `passo`, `operação`, `uso` → `operation/`
  - `amostra`, `preparo` → `samples/`
  - `manutenção`, `limpeza` → `maintenance/`
  - `problema`, `erro`, `solução` → `troubleshooting/`

- **Por Dimensões:**
  - Imagens grandes (>1000x600px) → `equipment/`
  - Imagens pequenas (<500x500px) → `interface/`
  - Formato panorâmico → `operation/`

- **Classificação Manual:**
  - Se não conseguir classificar, pergunta ao usuário

### 3. Nomenclatura Inteligente
- **Equipment**: `sox406-main.jpg`, `sox406-front.jpg`, `sox406-side.jpg`
- **Interface**: `lcd-home.jpg`, `lcd-settings.jpg`, `lcd-running.jpg`
- **Operation**: `step1-preparation.jpg`, `step2-samples.jpg`
- **Components**: `sox406-exploded.jpg`, `component-detail.jpg`

### 4. Otimização Automática
- **Redimensionamento inteligente** baseado no tipo
- **Compressão JPEG otimizada** (85-90% qualidade)
- **Conversão de formatos** quando necessário
- **Remoção de metadados** desnecessários

### 5. Organização Completa
```
manuais/sox406/images/
├── equipment/
│   ├── sox406-main.jpg      (1200px, 85% quality)
│   ├── sox406-front.jpg     
│   ├── sox406-side.jpg      
│   └── sox406-back.jpg      
├── interface/
│   ├── lcd-home.jpg         (800px, 90% quality)
│   ├── lcd-settings.jpg     
│   └── lcd-running.jpg      
├── components/
│   ├── sox406-exploded.jpg  (800px, 85% quality)
│   └── component-detail.jpg 
├── operation/
│   ├── step1-preparation.jpg
│   ├── step2-samples.jpg    
│   └── step3-program.jpg    
└── RELATORIO-IMAGENS.md     (relatório detalhado)
```

## 📊 Exemplo de Saída

```
📄 Extrator de Imagens de Word - EleveLab

✅ Arquivo Word válido: manual-sox406.docx
📁 Estrutura criada para: sox406
🔍 Extraindo imagens do documento Word...
📷 Encontradas 12 imagens no documento
  📎 image1.jpg (2.3 MB)
  📎 image2.png (1.8 MB)
  📎 image3.jpg (1.2 MB)

🎯 Classificando e processando imagens...

📷 Processando imagem 1/12: image1.jpg
  🤖 Classificando imagem...
    💡 Classificada como: equipment (palavra-chave: "equipamento")
  ⚙️ Otimizando imagem...
    📊 Otimização: 2.3 MB → 1.1 MB (52.2% menor)
  ✅ Salva como: equipment/sox406-main.jpg

📝 Atualizando HTML do manual...
  ✅ HTML atualizado com placeholders de imagem

📋 Gerando relatório...
  📄 Relatório salvo: manuais/sox406/RELATORIO-IMAGENS.md

✅ Extração concluída com sucesso!
📁 12 imagens extraídas
📂 Organizadas em: manuais/sox406/images

📊 Resumo da Extração:
  📁 equipment: 5 imagens
  📁 interface: 3 imagens  
  📁 operation: 4 imagens
  💾 Tamanho total: 8.7 MB
```

## 🔧 Requisitos do Documento Word

### ✅ Formato Suportado
- **Apenas .docx** (não .doc)
- Word 2007 ou superior
- Imagens **incorporadas** no documento (não linkadas)

### 💡 Dicas para Melhor Resultado

1. **Nomes Descritivos:**
   ```
   ✅ Bom: "sox406-vista-frontal.jpg"
   ❌ Ruim: "image1.jpg"
   ```

2. **Organização no Word:**
   - Manter imagens próximas ao texto relacionado
   - Usar legendas descritivas
   - Evitar imagens muito pequenas ou pixeladas

3. **Qualidade das Imagens:**
   - Resolução mínima: 600x400px
   - Formato original preferido: JPG ou PNG
   - Evitar imagens muito comprimidas

## 🚀 Fluxo de Trabalho Completo

```bash
# 1. Extrair imagens do Word
make extract-word FILE=manual-sox406.docx MANUAL=sox406

# 2. Revisar classificação (opcional)
ls manuais/sox406/images/*/

# 3. Atualizar HTML do manual (se necessário)
node scripts/add-images-sox406.js

# 4. Testar localmente
make dev

# 5. Otimizar novamente se necessário
make optimize

# 6. Build para produção
make build
```

## 🎛️ Opções Avançadas

### Classificação Personalizada
```javascript
// Editar imageTypes em extract-word-images.js
this.imageTypes = {
    equipment: ['equipamento', 'aparelho', 'seu-termo-personalizado'],
    // ... outros tipos
};
```

### Otimização Personalizada
```javascript
// Ajustar qualidade/tamanho por tipo
if (newName.includes('main')) {
    width = 1600;  // Imagem principal maior
    quality = 90;  // Qualidade maior
}
```

## 🆘 Troubleshooting

### Erro: "Arquivo não encontrado"
```bash
# Verificar caminho absoluto ou relativo
ls -la manual-sox406.docx
```

### Erro: "sharp installation failed"
```bash
# Reinstalar sharp para sua arquitetura
npm uninstall sharp
npm install sharp
```

### Erro: "Módulo não encontrado"
```bash
# Executar setup novamente
make setup-word-extractor
```

### Imagens não aparecem no manual
```bash
# Atualizar HTML do manual
node scripts/add-images-sox406.js

# Ou usar script específico para seu manual
# (pode precisar adaptar o script para outros manuais)
```

## 📞 Suporte

- 📧 **Email:** contato@elevelab.com.br
- 📱 **WhatsApp:** (51) 9 9858-4548
- 🐛 **Issues:** Reporte problemas no repositório

---

**✨ Agora seu processo de criação de manuais está completamente automatizado!**

1. **Word → Imagens** (automático)
2. **Classificação** (automático)  
3. **Otimização** (automático)
4. **Organização** (automático)
5. **Relatórios** (automático)

Economize horas de trabalho manual com este sistema inteligente! 🚀