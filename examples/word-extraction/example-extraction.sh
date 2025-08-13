#!/bin/bash

# Exemplo de uso do extrator de imagens

echo "📄 Extrator de Imagens - Exemplo de Uso"
echo ""

# Verificar se arquivo foi fornecido
if [ -z "$1" ]; then
    echo "❌ Uso: ./example-extraction.sh <arquivo.docx> [manual-name]"
    echo "   Exemplo: ./example-extraction.sh manual-sox406.docx sox406"
    exit 1
fi

WORD_FILE="$1"
MANUAL_NAME="${2:-$(basename "$WORD_FILE" .docx)}"

echo "📁 Arquivo Word: $WORD_FILE"
echo "🎯 Manual de destino: $MANUAL_NAME"
echo ""

# Verificar se arquivo existe
if [ ! -f "$WORD_FILE" ]; then
    echo "❌ Arquivo não encontrado: $WORD_FILE"
    exit 1
fi

# Executar extração
echo "🚀 Iniciando extração..."
node ../scripts/extract-word-images.js "$WORD_FILE" "$MANUAL_NAME"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Extração concluída com sucesso!"
    echo "📁 Verifique as imagens em: manuais/$MANUAL_NAME/images/"
    echo ""
    echo "🔄 Próximos passos:"
    echo "   1. Revisar classificação das imagens"
    echo "   2. Atualizar HTML do manual"
    echo "   3. Testar localmente"
else
    echo "❌ Erro na extração"
    exit 1
fi
