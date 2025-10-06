import { Card } from '@/components/ui/card';
import { AlertCircle, CheckCircle } from 'lucide-react';
import type { SesionCaja } from '../types/index';

interface CashBalanceCardProps {
  sesion: SesionCaja | null;
}

export default function CashBalanceCard({ sesion }: CashBalanceCardProps) {
  if (!sesion) {
    return (
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="h-5 w-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-500">
            No hay sesión de caja activa
          </span>
        </div>
        <p className="text-sm text-gray-500">
          Haz clic en "Abrir Caja" para iniciar una nueva sesión
        </p>
      </Card>
    );
  }

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatCurrency = (amount: number | undefined) => {
    return `€${(amount || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const esCerrada = sesion.estado === 'Cerrada';
  const IconEstado = esCerrada ? AlertCircle : CheckCircle;
  const colorEstado = esCerrada ? 'text-red-500' : 'text-green-500';
  const bgEstado = esCerrada ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700';

  return (
    <Card className="p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <IconEstado className={`h-5 w-5 ${colorEstado}`} />
        <span className="text-sm font-medium">
          Estado de Caja - {sesion.fecha}
        </span>
        <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded ${bgEstado}`}>
          {sesion.estado.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Apertura */}
        <div>
          <div className="text-sm text-gray-500 mb-1">Apertura</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(sesion.montoInicial)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {formatTime(sesion.horaApertura)} - {sesion.usuarioApertura}
          </div>
        </div>

        {/* Cierre */}
        <div>
          <div className="text-sm text-gray-500 mb-1">Cierre</div>
          <div className="text-2xl font-bold text-gray-900">
            {esCerrada ? formatCurrency(sesion.montoFinal) : '-'}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {esCerrada ? `${formatTime(sesion.horaCierre)} - ${sesion.usuarioCierre || '-'}` : 'Caja abierta'}
          </div>
        </div>

        {/* Total Calculado */}
        <div>
          <div className="text-sm text-gray-500 mb-1">Total Calculado</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(sesion.totalCalculado)}
          </div>
        </div>

        {/* Diferencia */}
        <div>
          <div className="text-sm text-gray-500 mb-1">Diferencia</div>
          <div className={`text-2xl font-bold ${sesion.diferencia === 0 ? 'text-gray-900' : 'text-red-600'}`}>
            {esCerrada && sesion.diferencia !== undefined
              ? sesion.diferencia === 0
                ? 'Sin diferencia'
                : formatCurrency(sesion.diferencia)
              : '-'}
          </div>
        </div>
      </div>
    </Card>
  );
}
