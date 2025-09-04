// Importa os componentes essenciais da biblioteca 'react-router-dom' para gerenciar a navegação.
import { BrowserRouter, Route, Routes } from 'react-router-dom';

// Importa o componente 'Toaster' da biblioteca 'sonner', que é responsável por exibir as notificações bonitas.
import { Toaster } from 'sonner';

// Importa nosso componente de layout principal, que contém o menu lateral e a estrutura das páginas.
import { AppLayout } from './components/layout/appLayout';

// --- Importação de todas as nossas páginas ---
// Cada um desses arquivos representa uma tela completa do sistema.
import { PDV } from './pages/PDV';
import { Dashboard } from './pages/Dashboard';
import { Sales } from './pages/Sales';
import { SaleDetail } from './pages/SaleDetail';
import { Inventory } from './pages/inventory';
import { ProductDetail } from './pages/ProductDetail';
import { Customers } from './pages/Customers';
import { CustomerDetail } from './pages/CustomerDetail';
import { Deliveries } from './pages/Deliveries';
import { Sellers } from './pages/Sellers';
import { SellerDetail } from './pages/SellerDetail';

/**
 * Componente App
 * Este é o componente raiz da nossa aplicação.
 * Ele é responsável por configurar o sistema de rotas e renderizar as páginas corretas
 * com base na URL que o usuário está acessando.
 */
export function App() {
  return (
    // O BrowserRouter é o componente que "liga" a funcionalidade de roteamento do navegador à nossa aplicação.
    <BrowserRouter>
      {/* O Toaster é o componente que permite que as notificações apareçam em qualquer lugar do site. */}
      {/* richColors habilita cores diferentes para sucesso, erro, etc. position define onde elas aparecem. */}
      <Toaster richColors position="top-right" />

      {/* O componente Routes funciona como um contêiner para todas as nossas rotas individuais. */}
      <Routes>
        {/* Esta é uma rota "pai" ou "de layout". Todos os componentes dentro dela (as rotas "filhas")
            serão renderizados dentro do componente AppLayout, ou seja, com o menu lateral. */}
        <Route element={<AppLayout />}>

          {/* Rota para a página inicial (Caixa), acessível em "/" */}
          <Route path="/" element={<PDV />} />

          {/* Rota para a página de Dashboard, acessível em "/dashboard" */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Rota para a lista de Vendas, acessível em "/vendas" */}
          <Route path="/vendas" element={<Sales />} />
          {/* Rota para os detalhes de uma venda específica. O ':saleId' é um parâmetro dinâmico. */}
          <Route path="/vendas/:saleId" element={<SaleDetail />} />

          {/* Rota para o Estoque, acessível em "/estoque" */}
          <Route path="/estoque" element={<Inventory />} />
          {/* Rota para os detalhes de um produto específico. */}
          <Route path="/estoque/:productId" element={<ProductDetail />} />

          {/* Rota para a lista de Clientes, acessível em "/clientes" */}
          <Route path="/clientes" element={<Customers />} />
          {/* Rota para os detalhes/criação de um cliente. */}
          <Route path="/clientes/:customerId" element={<CustomerDetail />} />

          {/* Rota para as Taxas de Entrega, acessível em "/entregas" */}
          <Route path="/entregas" element={<Deliveries />} />
          
          {/* Rota para a lista de Vendedores, acessível em "/vendedores" */}
          <Route path="/vendedores" element={<Sellers />} />
          {/* Rota para os detalhes/criação de um vendedor. */}
          <Route path="/vendedores/:sellerId" element={<SellerDetail />} />

        </Route>
      </Routes>
    </BrowserRouter>
  )
}