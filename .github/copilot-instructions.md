# Editor de Layouts de Relatórios

Este é um projeto TypeScript completo para um Editor de Layouts de Relatórios com as seguintes características:

## Stack Tecnológica
- **Frontend**: React + TypeScript + Vite
- **Visualização PDF**: PDF.js (pdfjs-dist)
- **Interação**: Interact.js (drag/resize/rotate/snap)
- **Geração PDF**: jsPDF + autoTable
- **Estado**: Zustand
- **Formulários**: React Hook Form + Zod
- **Estilo**: TailwindCSS
- **Qualidade**: ESLint + Prettier + Husky

## Funcionalidades Principais
- Upload e visualização de PDF base (múltiplas páginas)
- Editor visual com drag, resize, rotate, snap
- Elementos: texto, imagem, retângulo, linha, tabela, QRCode, campos dinâmicos
- Ferramentas: réguas, grade, guias, Z-order, agrupamento
- Exportação: JSON schema, HTML/CSS, código TypeScript para jsPDF
- Precisão em milímetros com conversão mm↔px
- Suporte a fontes customizadas
- Paginação automática para tabelas
- Preview de PDF em tela

## Estrutura do Projeto
- `/editor` - Aplicação React principal
- `/render` - Módulo de renderização jsPDF
- `/types` - Schemas TypeScript + Zod
- `/services` - Exportação PDF/HTML
- `/components` - Componentes React
- `/examples` - Layouts e dados de exemplo

## Scripts Disponíveis
- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build de produção
- `npm run lint` - Verificação de código
- `npm run test` - Testes com Vitest
- `npm run preview` - Preview do build
