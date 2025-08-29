import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  // NOVO: Efeito para fechar o modal com a tecla 'Esc'
  useEffect(() => {
    // Função que será chamada quando uma tecla for pressionada
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose(); // Chama a função de fechar
      }
    };

    // Adiciona o ouvinte de evento no documento
    window.addEventListener('keydown', handleEsc);

    // Função de limpeza: remove o ouvinte de evento quando o modal fecha ou é desmontado
    // Isso é muito importante para evitar vazamentos de memória.
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]); // O efeito depende da função onClose

  // Se o modal não estiver aberto, não renderiza nada.
  if (!isOpen) {
    return null;
  }

  return (
    // O div do fundo (backdrop)
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center"
      // REMOVIDO: A propriedade onClick={onClose} foi removida daqui.
    >
      {/* O painel do modal */}
      <div 
        className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl z-50 transform transition-all"
        onClick={(e) => e.stopPropagation()} // Isto impede que um clique DENTRO do modal o feche
      >
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h3 className="text-2xl font-bold text-text-primary">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-red-600 p-1 rounded-full">
            <X size={24} />
          </button>
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>
  );
}