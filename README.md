# EleveLab - Sistema de Manuais Interativos

Sistema completo de manuais interativos para equipamentos científicos EleveLab.

## 🚀 Deploy Automático com GitHub Actions

Este repositório está configurado para deploy automático no GitHub Pages. Toda alteração na branch `main` é automaticamente publicada.

### Status do Deploy
![Deploy Status](https://github.com/[seu-usuario]/elevelab-manuais/actions/workflows/deploy.yml/badge.svg)

### Como funciona:
1. **Push para `main`** → GitHub Actions inicia automaticamente
2. **Build automático** → Prepara arquivos para produção
3. **Deploy para Pages** → Site atualizado em ~2 minutos
4. **URL de produção** → `https://[seu-usuario].github.io/elevelab-manuais/`

## 📁 Estrutura do Projeto

```
elevelab-manuais/
├── index.html                    # Página principal do catálogo
├── assets/                       # Recursos compartilhados
│   ├── css/
│   │   └── global.css           # Estilos globais para todos os manuais
│   ├── js/
│   │   └── navigation.js        # JavaScript para navegação e funcionalidades
│   └── images/                  # Imagens compartilhadas
├── manuais/                     # Diretório dos manuais
│   ├── sox406/                  # Manual do SOX406 (já existente)
│   │   └── index.html
│   ├── analisador-fibras/       # Manual do Analisador de Fibras
│   │   └── index.html
│   ├── destilador-nitrogenio/   # Manual do Destilador de Nitrogênio
│   │   └── index.html
│   ├── biorreator/              # Manual do Biorreator
│   │   └── index.html
│   └── fotobiorreator/          # Manual do Fotobiorreator
│       └── index.html
├── templates/                   # Templates para novos manuais
│   └── manual-template.html     # Template base para criação de novos manuais
└── README.md                    # Este arquivo
```

## 🚀 Funcionalidades

### Página Principal (index.html)
- **Catálogo visual** de todos os equipamentos
- **Sistema de busca** por equipamento ou palavra-chave
- **Filtros por categoria** (Determinadores, Analisadores, etc.)
- **Cards interativos** com informações de cada equipamento
- **Design responsivo** para desktop e mobile

### Manuais Individuais
- **Navegação por seções** (Visão Geral, Especificações, etc.)
- **Interface responsiva** com menu mobile
- **Conteúdo estruturado** e fácil navegação
- **Recursos visuais** com placeholders para imagens
- **Sistema de impressão** otimizado

### Sistema Global
- **CSS compartilhado** para consistência visual
- **JavaScript modular** para funcionalidades comuns
- **Navegação fluida** entre seções
- **Acessibilidade** (ARIA, navegação por teclado)
- **Performance otimizada**

## 🎨 Design System

### Cores
- **Laranja Principal:** `#E73700` (cor da marca EleveLab)
- **Preto Secundário:** `#1a1d1f`
- **Cinza Claro:** `#f8f9fa`
- **Branco:** `#ffffff`
- **Texto:** `#333333`

### Tipografia
- **Fonte:** Poppins (Google Fonts)
- **Pesos:** 300, 400, 600, 700

### Componentes
- **Cards:** Bordas arredondadas, sombras suaves
- **Botões:** Estilo pill com gradientes
- **Tabelas:** Zebradas com hover states
- **Seções:** Headers com gradiente laranja

## 📱 Responsividade

- **Desktop:** Layout completo com sidebar e grid
- **Tablet:** Layout adaptado com menu colapsável
- **Mobile:** Interface otimizada com menu hamburger

## 🛠️ Tecnologias

- **HTML5** semântico e acessível
- **CSS3** com variáveis e grid layout
- **JavaScript ES6+** modular
- **Design Responsivo** mobile-first
- **Performance** otimizada com lazy loading

## 📋 Como Usar

### Visualizar o Catálogo
1. Abra `index.html` no navegador
2. Navegue pelos equipamentos
3. Use filtros e busca conforme necessário
4. Clique nos equipamentos para acessar os manuais

### Acessar Manuais
1. Cada manual tem navegação própria
2. Use o menu superior para navegar entre seções
3. Menu mobile disponível em telas menores
4. Botão "Voltar ao Catálogo" sempre visível

### Criar Novos Manuais
1. Use o template em `templates/manual-template.html`
2. Substitua os placeholders `{{VARIABLE}}` pelo conteúdo
3. Adicione o novo manual ao catálogo principal
4. Mantenha a estrutura de diretórios

## 📝 Estrutura dos Manuais

Cada manual segue a mesma estrutura de seções:

1. **Visão Geral** - Introdução e aplicações
2. **Especificações** - Dados técnicos
3. **Componentes** - Partes do equipamento
4. **Instalação** - Procedimentos de instalação
5. **Operação** - Como usar o equipamento
6. **Amostras/Cultivos** - Preparo de amostras
7. **Manutenção** - Cuidados e manutenção
8. **Solução de Problemas** - Troubleshooting
9. **Garantia** - Termos e contatos

## 🔧 Personalização

### Adicionando Novo Equipamento
1. Copie o template de `templates/manual-template.html`
2. Crie nova pasta em `manuais/nome-equipamento/`
3. Substitua os placeholders pelo conteúdo real
4. Adicione card no `index.html` principal
5. Configure função `openManual()` se necessário

### Modificando Estilos
- Edite `assets/css/global.css` para mudanças globais
- Mantenha as variáveis CSS no `:root`
- Use classes utilitárias quando possível

### Adicionando Funcionalidades
- JavaScript modular em `assets/js/navigation.js`
- Mantenha compatibilidade com todos os manuais
- Teste em dispositivos móveis

## 📧 Contato EleveLab

- **Telefone/WhatsApp:** (51) 9 9858-4548
- **Email:** contato@elevelab.com.br
- **Website:** www.elevelab.com.br
- **Endereço:** Av. Benjamin Constant 19, Loja 35, São João, Porto Alegre-RS

## 📄 Licença

© 2024 EleveLab - Equipamentos Científicos. Todos os direitos reservados.

---

**Versão:** 1.0  
**Data:** Janeiro 2024  
**Autor:** EleveLab Team
