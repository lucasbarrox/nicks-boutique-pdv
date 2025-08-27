import React from 'react';

// A interface define as propriedades que o componente espera receber
interface Props {
  dateRange: { from?: string; to?: string };
  setDateRange: (range: { from?: string; to?: string }) => void;
}

export function DateRangePicker({ dateRange, setDateRange }: Props) {
  
  // Função para lidar com a mudança de data em qualquer um dos campos
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'from' | 'to') => {
    const value = e.target.value; // ex: "2025-08-27"
    setDateRange({ ...dateRange, [field]: value });
  };
  
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="date-from" className="text-sm font-semibold text-gray-600">De:</label>
      <input 
        id="date-from"
        type="date"
        value={dateRange.from || ''}
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