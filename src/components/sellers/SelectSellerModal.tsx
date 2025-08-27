import { useState, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { db } from '@/lib/db';
import { Seller } from '@/types';
import { Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (seller: Seller) => void;
}

export function SelectSellerModal({ isOpen, onClose, onSelect }: Props) {
  const [sellers] = useState(() => db.sellers.getAll());
  const [search, setSearch] = useState('');
  
  const filteredSellers = useMemo(() => {
    if (!search.trim()) return sellers;
    return sellers.filter(s => 
      s.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [sellers, search]);

  const handleSelect = (seller: Seller) => {
    onSelect(seller);
    onClose();
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Selecionar Vendedor">
       <div className="flex gap-4 mb-4">
        <input 
          type="text" 
          placeholder="Buscar por nome..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-primary outline-none" 
        />
        <Link to="/vendedores/novo" className="flex items-center gap-2 px-4 py-2 bg-pink-primary text-white rounded-lg font-semibold whitespace-nowrap hover:bg-pink-primary/90">
          <UserPlus size={18} /> Novo
        </Link>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {filteredSellers.map(s => (
          <div key={s.id} onClick={() => handleSelect(s)} className="p-3 hover:bg-pink-light/30 rounded-lg cursor-pointer">
            <p className="font-bold">{s.name}</p>
          </div>
        ))}
      </div>
    </Modal>
  )
}