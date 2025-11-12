import React from 'react';

interface Props {
  dateRange: { from?: string; to?: string };
  setDateRange: (range: { from?: string; to?: string }) => void;
}


export function DateRangePicker({ dateRange, setDateRange }: Props) {
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'from' | 'to') => {
    const value = e.target.value;
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