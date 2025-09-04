// Importa as ferramentas da biblioteca 'react-router-dom':
// NavLink: para criar links de navegação que "sabem" se estão ativos.
// Outlet: um marcador de posição onde as páginas da rota atual serão renderizadas.
// useLocation: um hook que nos dá informações sobre a URL atual.
import { NavLink, Outlet, useLocation } from 'react-router-dom';

// Importa os ícones que usaremos no menu lateral.
import { ShoppingCart, Tag, History, Users, Truck, UserCheck, LayoutDashboard } from 'lucide-react';

// Importa nosso novo componente de Carrinho, que será a coluna da direita.
import { Cart } from '@/components/cart/Cart';

// Define os itens do nosso menu de navegação em um array de objetos.
// Isso torna o código mais limpo e fácil de manter.
const navItems = [
  { href: '/', icon: ShoppingCart, label: 'Caixa (PDV)' },
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/vendas', icon: History, label: 'Vendas' },
  { href: '/estoque', icon: Tag, label: 'Estoque' },
  { href: '/clientes', icon: Users, label: 'Clientes' },
  { href: '/entregas', icon: Truck, label: 'Entregas' },
  { href: '/vendedores', icon: UserCheck, label: 'Vendedores' },
];

/**
 * Componente AppLayout
 * Este é o "molde" principal da nossa aplicação. Ele cria a estrutura visual
 * com o menu lateral esquerdo, a área de conteúdo central e o carrinho lateral direito (condicional).
 * Qualquer página renderizada dentro dele herdará essa estrutura.
 */
export function AppLayout() {
  // O hook useLocation nos permite saber em qual URL o usuário está no momento.
  const location = useLocation();
  
  // Verificamos se o caminho da URL é exatamente '/', que é a nossa página do PDV.
  // Esta variável será usada para decidir se mostramos o carrinho ou não.
  const isPdvPage = location.pathname === '/';

  return (
    // O container principal que ocupa toda a tela (h-screen) e organiza os filhos em linha (flex).
    // 'overflow-hidden' previne barras de rolagem indesejadas na página inteira.
    <div className="h-screen flex overflow-hidden bg-gray-50">
      
      {/* Coluna 1: O menu lateral esquerdo. */}
      <aside className="w-64 bg-white border-r border-border-neutral flex flex-col hidden md:flex">
        {/* Cabeçalho do menu com o nome da loja. */}
        <div className="p-6 border-b border-border-neutral">
            <h1 className="text-2xl font-bold text-pink-primary">Nick's Boutique</h1>
            <p className="text-sm text-text-primary/70">PDV & Gestão</p>
        </div>
        {/* A lista de links de navegação. */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {/* Mapeamos o array navItems para criar cada link do menu dinamicamente. */}
            {navItems.map((item) => (
                <NavLink 
                    key={item.href}
                    to={item.href}
                    // A propriedade 'end' garante que o link "/" só fique ativo na página inicial exata.
                    end={item.href === '/'}
                    // O NavLink nos permite estilizar o link com base em seu estado (ativo ou não).
                    className={({ isActive }) => `
                        flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                        ${isActive 
                            ? 'bg-pink-primary text-white' // Estilo se o link estiver ativo
                            : 'text-text-primary hover:bg-pink-light/30' // Estilo padrão
                        }
                    `}
                >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                </NavLink>
            ))}
        </nav>
      </aside>

      {/* Coluna 2: A área de conteúdo principal. */}
      <main className="flex-1 overflow-y-auto p-4">
        {/* O <Outlet> é onde o React Router irá renderizar a página da rota atual (PDV, Dashboard, etc.). */}
        <Outlet />
      </main>
      
      {/* Coluna 3: O carrinho, renderizado condicionalmente. */}
      {/* A expressão {isPdvPage && (...)} significa: "Se a variável isPdvPage for verdadeira, renderize o que está dentro". */}
      {isPdvPage && (
        <div className="w-80 border-l border-border-neutral h-full shadow-lg hidden lg:block">
          <Cart />
        </div>
      )}
    </div>
  )
}