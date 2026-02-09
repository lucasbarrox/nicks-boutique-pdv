import { Truck } from 'lucide-react';

export function Deliveries() {
  return (
    <div className="p-10 text-center flex flex-col items-center justify-center h-full text-gray-500">
        <Truck size={64} className="mb-4 text-gray-300" />
        <h2 className="text-xl font-bold mb-2">Módulo de Entregas</h2>
        <p>A gestão de taxas de entrega será ativada em breve no modo Online.</p>
    </div>
  );
}