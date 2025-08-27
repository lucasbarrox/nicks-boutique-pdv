import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AppLayout } from './components/layout/appLayout';
import { PDV } from './pages/PDV';
import { Sales } from './pages/Sales';
import { Inventory } from './pages/inventory';
import { ProductDetail } from './pages/ProductDetail';
import { Customers } from './pages/Customers';
import { CustomerDetail } from './pages/CustomerDetail';
import { Deliveries } from './pages/Deliveries';
import { Sellers } from './pages/Sellers';
import { SellerDetail } from './pages/SellerDetail';
import { SaleDetail } from './pages/SaleDetail';

export function App() {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-right" />
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<PDV />} />
          <Route path="/vendas" element={<Sales />} />
          <Route path="/vendas/:saleId" element={<SaleDetail />} />
          <Route path="/estoque" element={<Inventory />} />
          <Route path="/estoque/:productId" element={<ProductDetail />} />
          <Route path="/clientes" element={<Customers />} />
          <Route path="/clientes/:customerId" element={<CustomerDetail />} />
          <Route path="/entregas" element={<Deliveries />} />
          <Route path="/vendedores" element={<Sellers />} />
          <Route path="/vendedores/:sellerId" element={<SellerDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}