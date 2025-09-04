// Importa as ferramentas essenciais do React e os 'contratos' (tipos) de dados.
import React, { useState, useEffect } from 'react';
import { Product, ProductVariant } from '@/types';

// Importa os ícones que usaremos nos botões.
import { Plus, Trash2 } from 'lucide-react';

/**
 * @interface ProductFormProps
 * Define as propriedades que o componente ProductForm espera receber.
 * @param {Product | null} productToEdit - Um objeto de produto existente para pré-preencher o formulário no modo de edição.
 * @param onSave - Uma função de callback que será chamada quando o formulário for enviado, passando os dados do produto.
 * @param onCancel - Uma função de callback que será chamada para fechar o formulário/modal.
 */
interface ProductFormProps {
  onSave: (product: Omit<Product, 'id'>, id?: string) => void;
  onCancel: () => void;
  productToEdit?: Product | null;
}

// Define um tipo local para o estado das variantes dentro do formulário.
// Usamos `& { sku?: string }` para que possamos manter o SKU original ao editar.
type VariantState = Omit<ProductVariant, 'sku'> & { sku?: string };

/**
 * Componente ProductForm
 * Um formulário reutilizável para criar e editar produtos e suas múltiplas variações.
 */
export function ProductForm({ onSave, onCancel, productToEdit }: ProductFormProps) {
  // --- ESTADO DO COMPONENTE ---
  // Estados para os campos principais do produto.
  const [name, setName] = useState('');
  const [basePrice, setBasePrice] = useState(0);
  const [costPrice, setCostPrice] = useState(0);
  // O estado das variantes é um array, pois um produto pode ter múltiplas.
  const [variants, setVariants] = useState<VariantState[]>([{ color: '', size: '', stock: 0 }]);

  // --- EFEITOS ---
  // Este useEffect reage a mudanças na propriedade 'productToEdit'.
  // Se recebermos um produto para editar, ele preenche todos os estados com os dados existentes.
  // Se não, ele limpa o formulário para o modo de criação.
  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setBasePrice(productToEdit.basePrice);
      setCostPrice(productToEdit.costPrice || 0);
      setVariants(productToEdit.variants);
    } else {
      setName('');
      setBasePrice(0);
      setCostPrice(0);
      setVariants([{ color: '', size: '', stock: 0 }]);
    }
  }, [productToEdit]);

  // --- FUNÇÕES DE MANIPULAÇÃO (HANDLERS) ---

  /**
   * Atualiza um campo específico de uma variante específica no array de variantes.
   * @param {number} index - O índice da variante no array.
   * @param {keyof VariantState} field - O nome do campo a ser alterado ('color', 'size' ou 'stock').
   * @param {string | number} value - O novo valor para o campo.
   */
  const handleVariantChange = (index: number, field: keyof VariantState, value: string | number) => {
    const newVariants = [...variants]; // Cria uma cópia do array para não modificar o estado diretamente.
    (newVariants[index] as any)[field] = value;
    setVariants(newVariants);
  };

  // Adiciona um novo formulário de variante em branco à lista.
  const addVariant = () => {
    setVariants([...variants, { color: '', size: '', stock: 0 }]);
  };

  // Remove um formulário de variante da lista.
  const removeVariant = (index: number) => {
    // Só permite remover se houver mais de uma variante.
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== index));
    }
  };

  /**
   * Chamado quando o formulário é enviado.
   * Ele agrupa todos os dados do estado, formata e chama a função onSave.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData = {
      name,
      description: '', // Campo de descrição pode ser adicionado ao formulário se necessário.
      basePrice,
      costPrice,
      // Mapeia as variantes do estado para o formato final, garantindo a criação de um novo SKU se não existir um.
      variants: variants.map(v => ({
        ...v,
        stock: Number(v.stock), // Garante que o estoque é um número.
        // Se a variante já tem um SKU (modo de edição), mantém. Se não, gera um SKU simples.
        sku: v.sku || `${name.substring(0, 2).toUpperCase()}-${v.color.substring(0, 2).toUpperCase()}-${v.size}-${Math.floor(Math.random() * 1000)}`
      }))
    };
    // Chama a função do componente pai, passando os dados e o ID (se for edição).
    onSave(productData, productToEdit?.id);
  };

  // Variável booleana para sabermos facilmente se estamos editando ou criando.
  const isEditing = !!productToEdit;


  // --- RENDERIZAÇÃO DO JSX ---
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Seção de Dados Principais do Produto */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block font-semibold mb-1">Nome do Produto</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-primary outline-none" required />
        </div>
        <div>
          <label className="block font-semibold mb-1">Preço de Venda (R$)</label>
          <input type="number" step="0.01" value={basePrice} onChange={(e) => setBasePrice(parseFloat(e.target.value))} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-primary outline-none" required />
        </div>
        <div>
          <label className="block font-semibold mb-1">Preço de Custo (R$)</label>
          <input type="number" step="0.01" value={costPrice} onChange={(e) => setCostPrice(parseFloat(e.target.value))} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-primary outline-none" />
        </div>
      </div>
      
      {/* Seção de Variações, renderizada dinamicamente */}
      <div className="border-t pt-4">
        <h4 className="font-bold text-lg mb-2">Variações (Cor, Tamanho, Estoque)</h4>
        {variants.map((variant, index) => (
          <div key={index} className="grid grid-cols-12 gap-2 mb-2 p-2 border rounded-lg items-center">
            <input type="text" placeholder="Cor" value={variant.color} onChange={(e) => handleVariantChange(index, 'color', e.target.value)} className="col-span-4 p-2 border rounded-lg focus:ring-2 focus:ring-pink-primary outline-none" required />
            <input type="text" placeholder="Tamanho" value={variant.size} onChange={(e) => handleVariantChange(index, 'size', e.target.value)} className="col-span-4 p-2 border rounded-lg focus:ring-2 focus:ring-pink-primary outline-none" required />
            <input type="number" placeholder="Estoque" value={variant.stock} onChange={(e) => handleVariantChange(index, 'stock', parseInt(e.target.value, 10))} className="col-span-3 p-2 border rounded-lg focus:ring-2 focus:ring-pink-primary outline-none" required />
            {variants.length > 1 && <button type="button" onClick={() => removeVariant(index)} className="col-span-1 text-red-500 hover:bg-red-100 rounded-full p-2"><Trash2 size={18}/></button>}
          </div>
        ))}
        <button type="button" onClick={addVariant} className="flex items-center gap-2 text-sm font-semibold text-pink-primary mt-2 hover:underline">
          <Plus size={16}/> Adicionar Variação
        </button>
      </div>

      {/* Botões de Ação */}
      <div className="flex justify-end gap-4 pt-4 border-t mt-6">
        <button type="button" onClick={onCancel} className="px-6 py-2 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300">Cancelar</button>
        <button type="submit" className="px-6 py-2 bg-pink-primary text-white rounded-lg font-semibold hover:bg-pink-primary/90">
          {isEditing ? 'Salvar Alterações' : 'Salvar Produto'}
        </button>
      </div>
    </form>
  );
}