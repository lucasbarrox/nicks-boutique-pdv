import { useState, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { db } from '@/lib/db';
import { Customer } from '@/types';
import { UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (customer: Customer) => void;
}

export function SelectCustomerModal({ isOpen, onClose, onSelect }: Props) {
  const [customers] = useState(() => db.customers.getAll());
  const [search, setSearch] = useState('');
  
  const filteredCustomers = useMemo(() => {
    if (!search.trim()) return customers;
    return customers.filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase()) || 
      c.phone.includes(search)
    );
  }, [customers, search]);
  
  const handleSelect = (customer: Customer) => {
    onSelect(customer);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Selecionar Cliente">
      <div className="flex gap-4 mb-4">
        <input 
          type="text" 
          placeholder="Buscar por nome ou telefone..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-primary outline-none" 
        />
        <Link to="/clientes/novo" className="flex items-center gap-2 px-4 py-2 bg-pink-primary text-white rounded-lg font-semibold whitespace-nowrap hover:bg-pink-primary/90">
          <UserPlus size={18} /> Novo
        </Link>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {filteredCustomers.length > 0 ? filteredCustomers.map(c => (
          <div key={c.id} onClick={() => handleSelect(c)} className="p-3 hover:bg-pink-light/30 rounded-lg cursor-pointer">
            <p className="font-bold">{c.name}</p>
            <p className="text-sm text-gray-600">{c.phone}</p>
          </div>
        )) : (
          <div className="text-center py-8 text-gray-500">
            <p>Nenhum cliente encontrado.</p>
          </div>
        )}
      </div>
    </Modal>
  )
}