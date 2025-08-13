# Extração de Imagens de Word - Exemplos

## Como usar

1. **Preparar o documento Word:**
   - Salvar como .docx (não .doc)
   - Imagens devem estar incorporadas no documento
   - Nomes descritivos ajudam na classificação automática

2. **Executar extração:**
   ```bash
   # Método 1: npm script
   npm run extract-word-images manual-sox406.docx sox406

   # Método 2: node direto
   node scripts/extract-word-images.js manual-sox406.docx sox406
   ```

3. **Resultado:**
   - Imagens extraídas e organizadas em `manuais/sox406/images/`
   - Classificação automática por tipo
   - Otimização automática de tamanho
   - Relatório detalhado gerado

## Classificação Automática

O sistema classifica imagens automaticamente baseado em:

### Por Nome de Arquivo
- **equipment**: equipamento, aparelho, vista, frontal, lateral, traseira
- **interface**: tela, lcd, display, menu, configuração, painel  
- **components**: componente, peça, parte, tubo, sensor, cabo
- **operation**: passo, operação, procedimento, instalação, uso
- **samples**: amostra, material, preparo, preparação
- **maintenance**: manutenção, limpeza, calibração, troca
- **troubleshooting**: problema, erro, solução, alerta, aviso

### Por Dimensões
- Imagens grandes (>1000x600): equipment
- Imagens pequenas (<500x500): interface  
- Formato panorâmico: operation

### Classificação Manual
Se não conseguir classificar automaticamente, o sistema perguntará ao usuário.

## Estrutura Gerada

```
manuais/sox406/images/
├── equipment/
│   ├── sox406-main.jpg
│   ├── sox406-front.jpg
│   └── sox406-side.jpg
├── interface/
│   ├── lcd-home.jpg
│   └── lcd-settings.jpg
├── components/
│   └── sox406-exploded.jpg
└── operation/
    ├── step1-preparation.jpg
    └── step2-samples.jpg
```

## Otimizações Aplicadas

- **Redimensionamento inteligente**
- **Compressão JPEG otimizada**  
- **Conversão de formatos quando necessário**
- **Remoção de metadados desnecessários**

## Próximos Passos

1. Revisar imagens classificadas
2. Renomear se necessário  
3. Executar `node scripts/add-images-sox406.js` para atualizar HTML
4. Testar com `npm run dev`
5. Build final com `npm run build`
