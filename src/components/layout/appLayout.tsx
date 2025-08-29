import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { ShoppingCart, Tag, History, Users, Truck, UserCheck, LayoutDashboard } from 'lucide-react';
import { Cart } from '@/components/cart/Cart';

const navItems = [
  { href: '/', icon: ShoppingCart, label: 'Caixa (PDV)' },
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/vendas', icon: History, label: 'Vendas' },
  { href: '/estoque', icon: Tag, label: 'Estoque' },
  { href: '/clientes', icon: Users, label: 'Clientes' },
  { href: '/entregas', icon: Truck, label: 'Entregas' },
  { href: '/vendedores', icon: UserCheck, label: 'Vendedores' },
];

export function AppLayout() {
  const location = useLocation();
  const isPdvPage = location.pathname === '/';

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      <aside className="w-64 bg-white border-r border-border-neutral flex-col hidden md:flex">
        <div className="p-6 border-b border-border-neutral">
            <h1 className="text-2xl font-bold text-pink-primary">Nick's Boutique</h1>
            <p className="text-sm text-text-primary/70">PDV & Gestão</p>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => (
                <NavLink 
                    key={item.href}
                    to={item.href}
                    end={item.href === '/'}
                    className={({ isActive }) => `
                        flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                        ${isActive 
                            ? 'bg-pink-primary text-white' 
                            : 'text-text-primary hover:bg-pink-light/30'
                        }
                    `}
                >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                </NavLink>
            ))}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto p-4">
        <Outlet />
      </main>
      
      {isPdvPage && (
        <div className="w-80 border-l border-border-neutral h-full shadow-lg hidden lg:block">
          <Cart />
        </div>
      )}
    </div>
  )
}