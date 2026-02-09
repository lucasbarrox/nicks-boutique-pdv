import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Receipt, 
  Package, 
  Users, 
  Truck, 
  UserCheck,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { useState } from 'react';

export function AppLayout() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { icon: ShoppingBag, label: 'PDV / Caixa', path: '/' },
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Receipt, label: 'Vendas', path: '/vendas' },
    { icon: Package, label: 'Estoque', path: '/estoque' },
    { icon: Users, label: 'Clientes', path: '/clientes' },
    { icon: Truck, label: 'Entregas', path: '/entregas' },
    { icon: UserCheck, label: 'Vendedores', path: '/vendedores' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-pink-primary">Nick's Boutique</h1>
          <p className="text-xs text-gray-400">Sistema de Gestão</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-pink-50 text-pink-primary font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button className="flex items-center gap-3 p-3 w-full rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors">
            <LogOut size={20} />
            Sair
          </button>
        </div>
      </aside>

      {/* Mobile Header & Menu */}
      <div className={`fixed inset-0 bg-black/50 z-40 md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`} onClick={() => setIsMobileMenuOpen(false)} />
      
      <aside className={`fixed inset-y-0 left-0 w-64 bg-white z-50 transform transition-transform duration-200 md:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <span className="font-bold text-pink-primary">Menu</span>
          <button onClick={() => setIsMobileMenuOpen(false)}><X size={24} /></button>
        </div>
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 p-3 rounded-lg ${
                isActive(item.path) ? 'bg-pink-50 text-pink-primary' : 'text-gray-600'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header Bar */}
        <header className="md:hidden bg-white p-4 border-b border-gray-200 flex items-center justify-between">
          <button onClick={() => setIsMobileMenuOpen(true)}>
            <Menu size={24} className="text-gray-600" />
          </button>
          <span className="font-bold text-gray-800">Nick's Boutique</span>
          <div className="w-6" /> {/* Spacer */}
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}