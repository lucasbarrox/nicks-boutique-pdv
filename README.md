# Nick's Boutique - Sistema de Ponto de Venda (PDV)

Este é um sistema de PDV completo para a boutique de moda feminina "Nick's Boutique", desenvolvido com React, TypeScript, Vite e Tailwind CSS.

## Funcionalidades Implementadas

-   **Caixa (PDV)**: Busca de produtos, adição ao carrinho, gerenciamento de quantidades e finalização de vendas.
-   **Histórico de Vendas**: Lista de todas as vendas realizadas.
-   **Gestão de Estoque**: Visualização detalhada do estoque por produto e suas variações (SKUs).
-   **Persistência de Dados**: Todas as informações são salvas localmente no navegador usando `localStorage`, simulando um banco de dados.
-   **Design System**: Interface moderna e intuitiva seguindo a paleta de cores "Branco & Rosa".

## Stack de Tecnologia

-   **Framework**: [React](https://reactjs.org/) (com [Vite](https://vitejs.dev/))
-   **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
-   **Estilização**: [Tailwind CSS](https://tailwindcss.com/)
-   **Gerenciamento de Estado**: [Zustand](https://github.com/pmndrs/zustand)
-   **Roteamento**: [React Router DOM](https://reactrouter.com/)
-   **Ícones**: [Lucide React](https://lucide.dev/)

---

## Como Executar o Projeto Localmente

### Pré-requisitos

-   [Node.js](https://nodejs.org/) (versão 18 ou superior)
-   [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)

### 1. Clone o Repositório

Primeiro, você precisa ter os arquivos do projeto. Se estivesse no GitHub, você faria:
`git clone <URL_DO_REPOSITORIO>`

Como o código foi fornecido diretamente, crie uma pasta para o projeto e salve todos os arquivos dentro dela, mantendo a estrutura de pastas descrita.

### 2. Instale as Dependências

Navegue até a pasta raiz do projeto pelo seu terminal e execute o seguinte comando para instalar todas as bibliotecas necessárias:

```bash
npm install
```

### 3. Execute o Servidor de Desenvolvimento

Após a instalação ser concluída, inicie a aplicação em modo de desenvolvimento com o comando:

```bash
npm run dev
```

O terminal irá exibir uma mensagem indicando que o servidor está rodando, geralmente em `http://localhost:5173`. Abra este endereço no seu navegador.

A aplicação irá carregar e popular o `localStorage` com dados de exemplo (produtos e clientes) na primeira vez que for executada. Agora você pode testar todas as funcionalidades!

### Scripts Disponíveis

-   `npm run dev`: Inicia o servidor de desenvolvimento.
-   `npm run build`: Compila a aplicação para produção.
-   `npm run preview`: Inicia um servidor local para visualizar a versão de produção.