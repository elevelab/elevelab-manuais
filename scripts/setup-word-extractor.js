#!/usr/bin/env node

/**
 * Setup do Extrator de Imagens de Word
 * 
 * Instala as dependências necessárias e configura o ambiente
 * para extração automática de imagens de documentos Word.
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class WordExtractorSetup {
    constructor() {
        this.dependencies = [
            'adm-zip@^0.5.10',
            'sharp@^0.32.6'
        ];
    }

    async setup() {
        console.log('🚀 Configurando Extrator de Imagens de Word\n');
        
        try {
            await this.checkNodeVersion();
            await this.installDependencies();
            await this.verifyInstallation();
            await this.createExampleFiles();
            
            console.log('\n✅ Setup concluído com sucesso!');
            console.log('\n📝 Como usar:');
            console.log('  npm run extract-word-images manual.docx nome-do-manual');
            console.log('  ou');
            console.log('  node scripts/extract-word-images.js manual.docx nome-do-manual');
            
        } catch (error) {
            console.error('\n❌ Erro no setup:', error.message);
            process.exit(1);
        }
    }

    async checkNodeVersion() {
        console.log('🔍 Verificando versão do Node.js...');
        
        const nodeVersion = process.version;
        const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
        
        console.log(`   Node.js: ${nodeVersion}`);
        
        if (majorVersion < 14) {
            throw new Error('Node.js 14 ou superior é necessário');
        }
        
        console.log('   ✅ Versão do Node.js compatível');
    }

    async installDependencies() {
        console.log('\n📦 Instalando dependências...');
        
        for (const dep of this.dependencies) {
            console.log(`   Instalando ${dep}...`);
            await this.runCommand(`npm install ${dep}`);
        }
        
        console.log('   ✅ Dependências instaladas');
    }

    async verifyInstallation() {
        console.log('\n✅ Verificando instalação...');
        
        try {
            // Testar adm-zip
            require('adm-zip');
            console.log('   ✅ adm-zip funcionando');
            
            // Testar sharp
            const sharp = require('sharp');
            console.log('   ✅ sharp funcionando');
            
            // Testar criação de imagem simples
            await sharp({
                create: {
                    width: 100,
                    height: 100,
                    channels: 3,
                    background: { r: 255, g: 255, b: 255 }
                }
            })
            .jpeg()
            .toBuffer();
            
            console.log('   ✅ Processamento de imagem funcionando');
            
        } catch (error) {
            throw new Error(`Erro na verificação: ${error.message}`);
        }
    }

    async createExampleFiles() {
        console.log('\n📄 Criando arquivos de exemplo...');
        
        // Criar diretório de exemplos se não existir
        const examplesDir = 'examples/word-extraction';
        if (!fs.existsSync(examplesDir)) {
            fs.mkdirSync(examplesDir, { recursive: true });
            console.log('   📁 Diretório de exemplos criado');
        }

        // README de exemplo
        const readmeContent = `# Extração de Imagens de Word - Exemplos

## Como usar

1. **Preparar o documento Word:**
   - Salvar como .docx (não .doc)
   - Imagens devem estar incorporadas no documento
   - Nomes descritivos ajudam na classificação automática

2. **Executar extração:**
   \`\`\`bash
   # Método 1: npm script
   npm run extract-word-images manual-sox406.docx sox406

   # Método 2: node direto
   node scripts/extract-word-images.js manual-sox406.docx sox406
   \`\`\`

3. **Resultado:**
   - Imagens extraídas e organizadas em \`manuais/sox406/images/\`
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

\`\`\`
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
\`\`\`

## Otimizações Aplicadas

- **Redimensionamento inteligente**
- **Compressão JPEG otimizada**  
- **Conversão de formatos quando necessário**
- **Remoção de metadados desnecessários**

## Próximos Passos

1. Revisar imagens classificadas
2. Renomear se necessário  
3. Executar \`node scripts/add-images-sox406.js\` para atualizar HTML
4. Testar com \`npm run dev\`
5. Build final com \`npm run build\`
`;

        fs.writeFileSync(path.join(examplesDir, 'README.md'), readmeContent);
        console.log('   📄 README de exemplos criado');

        // Script de exemplo
        const exampleScript = `#!/bin/bash

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
MANUAL_NAME="\${2:-\$(basename \"\$WORD_FILE\" .docx)}"

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
`;

        fs.writeFileSync(path.join(examplesDir, 'example-extraction.sh'), exampleScript);
        fs.chmodSync(path.join(examplesDir, 'example-extraction.sh'), '755');
        console.log('   📜 Script de exemplo criado');
    }

    async runCommand(command) {
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject(new Error(`Comando falhou: ${command}\n${error.message}`));
                    return;
                }
                resolve(stdout);
            });
        });
    }
}

// Executar setup se chamado diretamente
if (require.main === module) {
    const setup = new WordExtractorSetup();
    setup.setup().catch(console.error);
}

module.exports = WordExtractorSetup;