#!/usr/bin/env node

/**
 * Corrigir caminhos de imagem para caminhos absolutos
 */

const fs = require('fs');
const path = require('path');

function fixImagePaths() {
    console.log('🔧 Corrigindo caminhos de imagem...\n');
    
    const htmlPath = 'manuais/SOX406/index.html';
    let html = fs.readFileSync(htmlPath, 'utf-8');
    
    // Obter caminho absoluto do projeto
    const projectPath = process.cwd();
    const absoluteImagesPath = `file://${projectPath}/manuais/SOX406/images`;
    
    console.log(`Caminho absoluto: ${absoluteImagesPath}`);
    
    // Substituir caminhos relativos por absolutos
    html = html.replace(/src="images\//g, `src="${absoluteImagesPath}/`);
    
    // Adicionar cache busting
    html = html.replace(/\.jpg"/g, '.jpg?v=' + Date.now() + '"');
    
    // Salvar versão com caminhos absolutos
    const absoluteHtmlPath = 'manuais/SOX406/index-absolute.html';
    fs.writeFileSync(absoluteHtmlPath, html);
    
    console.log(`✅ Arquivo criado: ${absoluteHtmlPath}`);
    console.log('📝 Este arquivo usa caminhos absolutos para as imagens');
    
    return absoluteHtmlPath;
}

// Também criar uma versão de servidor local simples
function createLocalServer() {
    const serverScript = `#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    let filePath = path.join(__dirname, '..', 'manuais/SOX406', req.url === '/' ? 'index.html' : req.url);
    
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Arquivo não encontrado');
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Erro interno do servidor');
            }
        } else {
            let contentType = 'text/html';
            const ext = path.extname(filePath);
            
            switch (ext) {
                case '.jpg':
                case '.jpeg':
                    contentType = 'image/jpeg';
                    break;
                case '.png':
                    contentType = 'image/png';
                    break;
                case '.css':
                    contentType = 'text/css';
                    break;
                case '.js':
                    contentType = 'application/javascript';
                    break;
            }
            
            res.writeHead(200, { 
                'Content-Type': contentType,
                'Access-Control-Allow-Origin': '*'
            });
            res.end(content);
        }
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(\`🌐 Servidor rodando em http://localhost:\${PORT}\`);
    console.log('📱 Abra este endereço no navegador para ver o manual\');
    console.log('⏹️  Pressione Ctrl+C para parar o servidor\');
});`;

    fs.writeFileSync('scripts/local-server.js', serverScript);
    fs.chmodSync('scripts/local-server.js', '755');
    
    console.log('✅ Servidor local criado: scripts/local-server.js');
    console.log('   Execute: node scripts/local-server.js');
}

const absolutePath = fixImagePaths();
createLocalServer();

console.log('\n🎯 SOLUÇÕES CRIADAS:');
console.log('1. Arquivo com caminhos absolutos: ' + absolutePath);
console.log('2. Servidor local: node scripts/local-server.js');
console.log('\n💡 TESTE AMBAS AS OPÇÕES PARA VER QUAL FUNCIONA MELHOR!');