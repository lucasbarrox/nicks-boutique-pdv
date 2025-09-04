// A importação do React não é estritamente necessária em arquivos JSX com as versões
// mais recentes, mas é uma boa prática mantê-la para clareza.
import React from 'react';

/**
 * @interface Props
 * Define as propriedades que o componente DateRangePicker espera receber de seu componente pai.
 * @param {object} dateRange - Um objeto contendo as datas de início ('from') e fim ('to') como strings.
 * @param setDateRange - Uma função de callback que será chamada sempre que uma das datas for alterada.
 */
interface Props {
  dateRange: { from?: string; to?: string };
  setDateRange: (range: { from?: string; to?: string }) => void;
}

/**
 * Componente DateRangePicker
 * Um componente de UI reutilizável que renderiza dois campos de data (início e fim)
 * para criar um filtro de intervalo de datas.
 */
export function DateRangePicker({ dateRange, setDateRange }: Props) {
  
  /**
   * Função para lidar com a mudança de data em qualquer um dos campos (início ou fim).
   * @param {React.ChangeEvent<HTMLInputElement>} e - O evento de mudança do input.
   * @param {'from' | 'to'} field - Identifica qual campo ('from' ou 'to') está sendo alterado.
   */
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'from' | 'to') => {
    const value = e.target.value; // Pega o valor do input, ex: "2025-09-03"
    // Chama a função do componente pai para atualizar o estado do intervalo de datas,
    // mantendo a data que não mudou e atualizando a que mudou.
    setDateRange({ ...dateRange, [field]: value });
  };
  
  return (
    // Container principal que organiza os elementos em linha com um espaçamento.
    <div className="flex items-center gap-2">
      <label htmlFor="date-from" className="text-sm font-semibold text-gray-600">De:</label>
      <input 
        id="date-from"
        type="date"
        // O valor do input é controlado pelo estado do componente pai.
        value={dateRange.from || ''}
        // Quando o valor muda, a função handleDateChange é chamada.
        onChange={(e) => handleDateChange(e, 'from')} 
        className="p-2 border border-gray-300 rounded-lg text-sm bg-white"
      />
      <label htmlFor="date-to" className="text-sm font-semibold text-gray-600">Até:</label>
      <input
        id="date-to"
        type="date"
        value={dateRange.to || ''}
        onChange={(e) => handleDateChange(e, 'to')}
        className="p-2 border border-gray-300 rounded-lg text-sm bg-white"
      />
    </div>
  );
}