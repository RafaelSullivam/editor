# Editor de Layouts de Relatórios

Um editor visual poderoso para criar layouts de relatórios e faturas com exportação em múltiplos formatos.

## 🎯 Funcionalidades

- **Editor Visual**: Interface drag-and-drop para criação de layouts
- **Elementos Diversos**: Texto, imagens, tabelas, QR codes, códigos de barras, linhas e retângulos
- **Sistema de Grid**: Snap automático para alinhamento preciso
- **Templates Dinâmicos**: Suporte a campos dinâmicos com interpolação de dados
- **Múltiplas Exportações**:
  - PDF via jsPDF
  - HTML/CSS posicionado
  - JSON de layout
  - Código TypeScript para jsPDF

## 🚀 Tecnologias

- **Frontend**: React 18 + TypeScript + Vite
- **Estilização**: TailwindCSS
- **Estado**: Zustand
- **Formulários**: React Hook Form + Zod
- **PDF**: PDF.js (visualização) + jsPDF (geração)
- **Interatividade**: Interact.js (drag/resize/rotate)
- **Ícones**: React Icons

## 📦 Instalação

```bash
# Clone o repositório
git clone <repository-url>
cd editor

# Instale as dependências
npm install

# Execute o projeto
npm run dev
```

## 🎨 Uso Básico

1. **Carregar PDF de Fundo** (opcional):
   - Clique em "Carregar PDF" na toolbar
   - Selecione um arquivo PDF para usar como base

2. **Adicionar Elementos**:
   - Use os botões na toolbar para adicionar elementos
   - Clique no canvas para posicionar
   - Arraste para mover, use as alças para redimensionar

3. **Editar Propriedades**:
   - Selecione um elemento para ver suas propriedades
   - Ajuste fonte, cor, tamanho, etc.

4. **Campos Dinâmicos**:
   - Use a sintaxe `{{campo.subcampo}}` para dados dinâmicos
   - Ex: `{{cliente.nome}}`, `{{fatura.total}}`

5. **Exportar**:
   - PDF: Gera documento PDF final
   - HTML: Código HTML/CSS para web
   - JSON: Estrutura do layout para salvar/carregar

## 📋 Exemplos Inclusos

### Fatura Comercial (`examples/layouts/invoice.json`)
Template completo de fatura com:
- Cabeçalho da empresa
- Dados do cliente
- Tabela de itens
- Totais e descontos
- QR Code PIX
- Informações de pagamento

**Dados**: `examples/data/invoice-data.json`

### Relatório de Vendas (`examples/layouts/sales-report.json`)
Relatório analítico com:
- Logo e título
- Métricas resumidas
- Tabelas de produtos e regiões
- Área para gráficos
- Observações e insights

**Dados**: `examples/data/sales-report-data.json`

## 🔧 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── PDFViewer.tsx   # Visualizador de PDF
│   ├── CanvasOverlay.tsx # Overlay interativo
│   └── Toolbar.tsx     # Barra de ferramentas
├── services/           # Serviços de exportação
│   ├── pdfExport.ts    # Geração de PDF
│   └── htmlExport.ts   # Geração de HTML
├── store/              # Estado global
│   └── editor.ts       # Store Zustand
├── types/              # Tipos TypeScript
│   └── layout.ts       # Schemas e tipos
└── utils/              # Utilitários
    └── helpers.ts      # Funções auxiliares
```

## 📝 Formato de Layout

Os layouts são salvos em JSON com a seguinte estrutura:

```typescript
interface Layout {
  id: string;
  name: string;
  version: string;
  config: EditorConfig;
  pages: Page[];
  metadata: LayoutMetadata;
}
```

### Tipos de Elementos Suportados

- **text**: Texto com formatação completa
- **image**: Imagens com controle de fit
- **rectangle**: Retângulos com fill e stroke
- **line**: Linhas com estilos diversos
- **table**: Tabelas com dados dinâmicos
- **qrcode**: QR Codes com níveis de correção
- **barcode**: Códigos de barras (Code128, EAN13, etc.)
- **field**: Campos de entrada de dados

## 🎛️ Configurações

### Grid e Snap
```typescript
const config = {
  snapToGrid: true,      // Snap para grid
  snapToElements: true,  // Snap para outros elementos
  gridSize: 5,          // Tamanho do grid em mm
  snapThreshold: 5      // Distância para snap
};
```

### Página
```typescript
const pageConfig = {
  width: 210,           // Largura em mm (A4)
  height: 297,          // Altura em mm (A4)
  orientation: 'portrait',
  margins: { top: 20, right: 20, bottom: 20, left: 20 }
};
```

## 🔄 API de Exportação

### PDF Export
```typescript
import { PDFExportService } from './services/pdfExport';

const pdfService = new PDFExportService();
const pdfDoc = pdfService.renderToJsPDF(layout, data);
pdfDoc.save('documento.pdf');
```

### HTML Export
```typescript
import { HTMLExportService } from './services/htmlExport';

const htmlService = new HTMLExportService();
const html = htmlService.renderToHTML(layout, data);
```

### Dados Dinâmicos
Os dados devem seguir a estrutura referenciada nos templates:

```json
{
  "empresa": {
    "nome": "Minha Empresa",
    "endereco": "Rua Example, 123"
  },
  "cliente": {
    "nome": "Cliente Nome"
  },
  "itens": [
    { "descricao": "Item 1", "valor": "R$ 100,00" }
  ]
}
```

## 🧪 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview

# Linting
npm run lint

# Formatação
npm run format
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Para dúvidas e suporte:
- Abra uma [Issue](issues) no GitHub
- Consulte a [documentação](docs) completa
- Confira os [exemplos](examples) inclusos

---

Desenvolvido com ❤️ usando React + TypeScript
