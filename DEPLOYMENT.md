# Guia de Deployment - EleveLab Manuais

Este documento descreve como fazer o deployment do sistema de manuais EleveLab em diferentes ambientes.

## 🚀 Deployment Rápido

### 1. Preparar Build

```bash
# Instalar dependências
npm install

# Gerar build otimizado
npm run build

# Ou usando Makefile
make build
```

### 2. Testar Build Local

```bash
# Preview do build
npm run preview

# Ou usando Makefile
make preview
```

### 3. Deploy para Produção

#### Opção A: Servidor Web Tradicional

```bash
# Copiar arquivos para servidor
rsync -av dist/ user@servidor.com:/var/www/manuais/

# Ou via SCP
scp -r dist/* user@servidor.com:/var/www/manuais/
```

#### Opção B: AWS S3 + CloudFront

```bash
# Sync para S3
aws s3 sync dist/ s3://manuais-elevelab-bucket/ --delete

# Invalidar CloudFront
aws cloudfront create-invalidation --distribution-id E1234567890 --paths "/*"
```

#### Opção C: Netlify

```bash
# Via Netlify CLI
netlify deploy --dir=dist --prod

# Ou via drag-and-drop no painel web
# Arraste a pasta dist/ para netlify.com/drop
```

#### Opção D: Vercel

```bash
# Via Vercel CLI
vercel --prod

# Ou conectar repositório Git no painel web
```

## 🔧 Configuração de Servidor

### Apache (.htaccess)

```apache
# .htaccess para Apache
RewriteEngine On

# Força HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Compressão Gzip
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Cache Headers
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
</IfModule>

# Security Headers
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# SPA Fallback (se necessário)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

### Nginx

```nginx
# /etc/nginx/sites-available/manuais.elevelab.com.br
server {
    listen 80;
    server_name manuais.elevelab.com.br;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name manuais.elevelab.com.br;

    # SSL Configuration
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Document Root
    root /var/www/manuais;
    index index.html;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/xml+rss
        application/javascript
        application/json;

    # Security Headers
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src 'self' fonts.gstatic.com; img-src 'self' data:;" always;

    # Cache Control
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Main location
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API endpoints (se houver)
    location /api/ {
        # proxy_pass http://backend;
    }
}
```

## 🌍 CDN e Performance

### CloudFront (AWS)

```json
{
  "Comment": "EleveLab Manuais Distribution",
  "Enabled": true,
  "Origins": [{
    "Id": "S3-manuais-elevelab",
    "DomainName": "manuais-elevelab-bucket.s3.amazonaws.com",
    "S3OriginConfig": {
      "OriginAccessIdentity": ""
    }
  }],
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-manuais-elevelab",
    "ViewerProtocolPolicy": "redirect-to-https",
    "MinTTL": 0,
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {"Forward": "none"}
    },
    "Compress": true
  },
  "CacheBehaviors": [{
    "PathPattern": "assets/*",
    "TargetOriginId": "S3-manuais-elevelab",
    "ViewerProtocolPolicy": "https-only",
    "MinTTL": 31536000,
    "DefaultTTL": 31536000,
    "MaxTTL": 31536000,
    "Compress": true
  }]
}
```

## 🔐 Variáveis de Ambiente

### Produção

```bash
# .env.production
NODE_ENV=production
BASE_URL=https://manuais.elevelab.com.br
ANALYTICS_ID=GA_MEASUREMENT_ID
SENTRY_DSN=https://your-sentry-dsn
```

### Desenvolvimento

```bash
# .env.development
NODE_ENV=development
BASE_URL=http://localhost:3000
ENABLE_PERFORMANCE_MONITORING=true
```

## 📊 Monitoramento

### Google Analytics

```html
<!-- Global site tag (gtag.js) - Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Sentry (Monitoramento de Erros)

```javascript
import * as Sentry from "@sentry/browser";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: process.env.NODE_ENV
});
```

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Build and Deploy

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '16'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm install
    
    - name: Build
      run: npm run build
    
    - name: Deploy to S3
      env:
        AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
        AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
      run: |
        aws s3 sync dist/ s3://manuais-elevelab-bucket/ --delete
        aws cloudfront create-invalidation --distribution-id ${{ secrets.CLOUDFRONT_ID }} --paths "/*"
```

### GitLab CI

```yaml
# .gitlab-ci.yml
stages:
  - build
  - deploy

variables:
  NODE_VERSION: "16"

build:
  stage: build
  image: node:$NODE_VERSION
  script:
    - npm install
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 hour

deploy:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache rsync openssh
  script:
    - rsync -av dist/ $DEPLOY_USER@$DEPLOY_HOST:$DEPLOY_PATH/
  only:
    - main
```

## 🚨 Troubleshooting

### Problemas Comuns

1. **Arquivos não carregam após deploy**
   ```bash
   # Verificar permissões
   chmod -R 644 dist/
   find dist/ -type d -exec chmod 755 {} \;
   ```

2. **Erro 404 em rotas**
   ```nginx
   # Nginx: adicionar fallback SPA
   try_files $uri $uri/ /index.html;
   ```

3. **CORS errors**
   ```nginx
   # Nginx: headers CORS
   add_header Access-Control-Allow-Origin *;
   add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
   ```

4. **Performance lenta**
   ```bash
   # Verificar compressão
   curl -H "Accept-Encoding: gzip" -I https://manuais.elevelab.com.br
   
   # Verificar cache
   curl -I https://manuais.elevelab.com.br/assets/css/global.css
   ```

### Comandos Úteis

```bash
# Testar build local
make preview

# Verificar links quebrados
wget --spider -o wget.log -e robots=off -w 1 -r -p https://manuais.elevelab.com.br

# Testar performance
lighthouse https://manuais.elevelab.com.br --output html

# Verificar SSL
openssl s_client -connect manuais.elevelab.com.br:443 -servername manuais.elevelab.com.br
```

## ✅ Checklist de Deploy

- [ ] Build gerado com sucesso (`npm run build`)
- [ ] Preview testado localmente (`npm run preview`)
- [ ] Todas as imagens otimizadas
- [ ] Meta tags SEO configuradas
- [ ] Service worker funcionando
- [ ] HTTPS configurado
- [ ] Headers de segurança definidos
- [ ] Compressão gzip ativada
- [ ] Cache configurado adequadamente
- [ ] Analytics configurado
- [ ] Monitoramento de erros ativo
- [ ] Backup realizado

---

**Próximos passos após deploy:**
1. Testar todas as funcionalidades em produção
2. Configurar monitoramento contínuo
3. Agendar backups regulares
4. Documentar processo de rollback
5. Treinar equipe para manutenção