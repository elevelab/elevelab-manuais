# EleveLab Manuais - Comandos de Automação
# Facilita desenvolvimento, build e deployment

.PHONY: help install dev build clean deploy generate optimize test

# Cores para output
GREEN = \033[0;32m
YELLOW = \033[1;33m
RED = \033[0;31m
NC = \033[0m # No Color

help: ## Mostra esta ajuda
	@echo "$(GREEN)EleveLab Manuais - Comandos Disponíveis$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(YELLOW)%-15s$(NC) %s\n", $$1, $$2}'

install: ## Instala dependências
	@echo "$(GREEN)Instalando dependências...$(NC)"
	npm install
	@echo "$(GREEN)✅ Dependências instaladas$(NC)"

dev: ## Inicia servidor de desenvolvimento
	@echo "$(GREEN)Iniciando servidor de desenvolvimento...$(NC)"
	npm run dev

build: ## Gera build para produção
	@echo "$(GREEN)Gerando build para produção...$(NC)"
	npm run build
	@echo "$(GREEN)✅ Build gerado em dist/$(NC)"

clean: ## Limpa arquivos de build
	@echo "$(YELLOW)Limpando arquivos de build...$(NC)"
	rm -rf dist/
	rm -rf node_modules/.cache/
	@echo "$(GREEN)✅ Arquivos limpos$(NC)"

optimize: ## Otimiza imagens
	@echo "$(GREEN)Otimizando imagens...$(NC)"
	npm run optimize-images
	@echo "$(GREEN)✅ Imagens otimizadas$(NC)"

generate: ## Gera novo manual (interativo)
	@echo "$(GREEN)Gerando novo manual...$(NC)"
	npm run generate

extract-word: ## Extrai imagens de documento Word (usage: make extract-word FILE=manual.docx MANUAL=sox406)
	@echo "$(GREEN)Extraindo imagens de documento Word...$(NC)"
	@if [ -z "$(FILE)" ]; then \
		echo "$(RED)❌ Uso: make extract-word FILE=manual.docx MANUAL=nome-do-manual$(NC)"; \
		exit 1; \
	fi
	npm run extract-word-images $(FILE) $(MANUAL)

setup-word-extractor: ## Instala dependências para extração de Word
	@echo "$(GREEN)Configurando extrator de Word...$(NC)"
	node scripts/setup-word-extractor.js

preview: ## Preview do build de produção
	@echo "$(GREEN)Iniciando preview de produção...$(NC)"
	npm run preview

deploy: clean build ## Deploy para produção
	@echo "$(GREEN)Fazendo deploy...$(NC)"
	@echo "$(YELLOW)⚠️  Configure seu método de deploy$(NC)"
	# rsync -av dist/ user@server:/path/to/site/
	# aws s3 sync dist/ s3://your-bucket/
	# netlify deploy --dir=dist --prod
	@echo "$(GREEN)✅ Deploy configurado$(NC)"

lint: ## Verifica qualidade do código
	@echo "$(GREEN)Verificando qualidade do código...$(NC)"
	npm run lint

test: ## Executa testes
	@echo "$(GREEN)Executando testes...$(NC)"
	npm test

stats: ## Mostra estatísticas do projeto
	@echo "$(GREEN)Estatísticas do projeto:$(NC)"
	@echo "📁 Manuais: $(shell ls manuais/ | wc -l | xargs)"
	@echo "📄 Assets CSS: $(shell find assets/css -name "*.css" | wc -l | xargs)"
	@echo "📄 Assets JS: $(shell find assets/js -name "*.js" | wc -l | xargs)"
	@echo "🖼️  Templates: $(shell ls templates/ | wc -l | xargs)"
	@echo "📊 Scripts: $(shell ls scripts/ | wc -l | xargs)"

validate: ## Valida estrutura dos manuais
	@echo "$(GREEN)Validando estrutura dos manuais...$(NC)"
	@for manual in manuais/*/; do \
		if [ -f "$$manual/index.html" ]; then \
			echo "$(GREEN)✅ $$manual$(NC)"; \
		else \
			echo "$(RED)❌ $$manual - index.html não encontrado$(NC)"; \
		fi \
	done

backup: ## Cria backup do projeto
	@echo "$(GREEN)Criando backup...$(NC)"
	@timestamp=$$(date +%Y%m%d_%H%M%S); \
	tar -czf "elevelab-manuais_backup_$$timestamp.tar.gz" \
		--exclude='node_modules' \
		--exclude='dist' \
		--exclude='*.tar.gz' \
		.; \
	echo "$(GREEN)✅ Backup criado: elevelab-manuais_backup_$$timestamp.tar.gz$(NC)"

update: ## Atualiza sistema (git pull + npm install)
	@echo "$(GREEN)Atualizando sistema...$(NC)"
	git pull origin main
	npm install
	@echo "$(GREEN)✅ Sistema atualizado$(NC)"

check: ## Verifica saúde do projeto
	@echo "$(GREEN)Verificando saúde do projeto...$(NC)"
	@echo "📦 Node.js: $$(node --version 2>/dev/null || echo 'não instalado')"
	@echo "📦 NPM: $$(npm --version 2>/dev/null || echo 'não instalado')"
	@echo "🌐 Servidor HTTP: $$(which http-server >/dev/null && echo 'disponível' || echo 'instale com: npm install -g http-server')"
	@echo ""
	@$(MAKE) validate

docs: ## Gera documentação do projeto
	@echo "$(GREEN)Documentação disponível em:$(NC)"
	@echo "📖 README.md - Documentação principal"
	@echo "📋 package.json - Configuração do projeto"
	@echo "🔧 Makefile - Este arquivo de comandos"
	@echo "📁 templates/ - Templates para novos manuais"
	@echo "📁 scripts/ - Scripts de automação"

# Comandos de desenvolvimento rápido

new-manual: ## Cria novo manual rapidamente
	@echo "$(GREEN)Criando novo manual...$(NC)"
	@read -p "Nome do equipamento (ex: digestor-microondas): " name; \
	read -p "Título completo: " title; \
	node scripts/generate-manual.js --name "$$name" --title "$$title"

update-catalog: ## Atualiza catálogo principal
	@echo "$(YELLOW)Atualizando referências no catálogo...$(NC)"
	@echo "$(GREEN)✅ Execute 'make build' para aplicar mudanças$(NC)"

serve-local: ## Servidor local simples (sem npm)
	@echo "$(GREEN)Iniciando servidor local simples...$(NC)"
	@if command -v python3 >/dev/null; then \
		python3 -m http.server 8000; \
	elif command -v python >/dev/null; then \
		python -m SimpleHTTPServer 8000; \
	else \
		echo "$(RED)Python não encontrado. Use 'make dev' em vez disso.$(NC)"; \
	fi

# Comandos de manutenção

fix-permissions: ## Corrige permissões dos arquivos
	@echo "$(GREEN)Corrigindo permissões...$(NC)"
	chmod +x scripts/*.js
	find . -name "*.html" -exec chmod 644 {} \;
	find . -name "*.css" -exec chmod 644 {} \;
	find . -name "*.js" -exec chmod 644 {} \;
	@echo "$(GREEN)✅ Permissões corrigidas$(NC)"

security-check: ## Verifica segurança básica
	@echo "$(GREEN)Verificando segurança...$(NC)"
	@echo "🔍 Procurando por chaves ou senhas expostas..."
	@! grep -r -i "password\|secret\|key\|token" --include="*.html" --include="*.js" --include="*.css" . || echo "$(RED)⚠️  Possíveis credenciais encontradas$(NC)"
	@echo "$(GREEN)✅ Verificação de segurança concluída$(NC)"

# Comandos de produção

production-check: ## Verifica se está pronto para produção
	@echo "$(GREEN)Verificando preparação para produção...$(NC)"
	@$(MAKE) validate
	@$(MAKE) security-check
	@$(MAKE) build
	@echo "$(GREEN)✅ Pronto para produção$(NC)"

# Comandos especiais

demo: build ## Prepara demo completo
	@echo "$(GREEN)Preparando demo...$(NC)"
	@$(MAKE) optimize
	@$(MAKE) preview
	@echo "$(GREEN)✅ Demo iniciado em http://localhost:3001$(NC)"

all: clean install build ## Faz tudo: limpa, instala e builda
	@echo "$(GREEN)✅ Processo completo finalizado!$(NC)"

# Comando padrão
.DEFAULT_GOAL := help