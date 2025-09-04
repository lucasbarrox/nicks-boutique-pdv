// Importa a biblioteca principal do React, necessária para criar componentes.
import React from 'react';

// Importa a biblioteca 'react-dom/client', que contém as ferramentas para renderizar
// a aplicação React dentro do DOM do navegador (o HTML).
import ReactDOM from 'react-dom/client';

// Importa o nosso componente principal, o 'App', que contém toda a estrutura de rotas e páginas.
import { App } from './App.tsx';

// Importa nosso arquivo de estilos globais. É crucial que ele seja importado aqui
// para que os estilos do Tailwind CSS sejam aplicados em toda a aplicação.
import './styles/globals.css';

// Importa a função 'initializeDb' do nosso arquivo de 'seed'.
// Esta função é responsável por popular o localStorage com dados iniciais (produtos, clientes, etc.)
// na primeira vez que a aplicação é executada.
import { initializeDb } from './lib/seed.ts';

// Executa a função de inicialização do banco de dados local.
// Isso garante que, ao carregar a aplicação, já teremos dados para visualizar e testar.
initializeDb();

// O ponto de entrada da nossa aplicação React.
// 1. ReactDOM.createRoot(...) seleciona o elemento <div> com o id 'root' no nosso arquivo index.html.
//    Este <div> é o "contêiner" onde toda a nossa aplicação vai viver.
// 2. .render(...) diz ao React para desenhar (renderizar) nosso conteúdo dentro daquele contêiner.
ReactDOM.createRoot(document.getElementById('root')!).render(
  // <React.StrictMode> é uma ferramenta de desenvolvimento que ajuda a encontrar problemas
  // potenciais no código. Ele não afeta a versão final (de produção) da aplicação.
  <React.StrictMode>
    {/* Renderiza o nosso componente principal App, que por sua vez renderiza todo o resto. */}
    <App />
  </React.StrictMode>,
)