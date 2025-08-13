#!/bin/bash

# Build script para preparar os manuais para deploy
echo "🚀 Iniciando build dos manuais EleveLab..."

# Criar diretório de build
rm -rf dist
mkdir -p dist

# Copiar manuais
echo "📁 Copiando manuais..."
cp -r manuais dist/

# Copiar assets se existirem
if [ -d assets ]; then
    echo "🎨 Copiando assets..."
    cp -r assets dist/
fi

# Copiar templates se existirem
if [ -d templates ]; then
    echo "📄 Copiando templates..."
    cp -r templates dist/
fi

# Otimizar imagens (se tiver imagemin instalado)
if command -v imagemin &> /dev/null; then
    echo "🖼️  Otimizando imagens..."
    find dist -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" \) -exec imagemin {} --out-dir=$(dirname {}) \; 2>/dev/null || true
fi

# Criar arquivo _config.yml para GitHub Pages (evitar processar com Jekyll)
cat > dist/_config.yml << EOF
# GitHub Pages config
theme: null
plugins: []
EOF

# Criar arquivo .nojekyll (previne processamento Jekyll)
touch dist/.nojekyll

echo "✅ Build concluído com sucesso!"
echo "📂 Arquivos prontos em: dist/"

# Listar conteúdo do build
echo ""
echo "📋 Conteúdo do build:"
ls -la dist/manuais/ 2>/dev/null || ls -la dist/