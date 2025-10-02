import { Card } from '@/components/ui/card';
import { Users, UserCheck, TrendingUp, ShoppingCart } from 'lucide-react';
import type { Cliente } from '../pages/ClientesPage';

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
}

function StatCard({ title, value, subtitle, icon }: StatCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className="text-blue-600">{icon}</div>
      </div>
    </Card>
  );
}

interface ClientStatsProps {
  clientes: Cliente[];
}

export function ClientStats({ clientes }: ClientStatsProps) {
  // Calcular estadísticas
  const totalClientes = clientes.length;
  const clientesActivos = clientes.filter(c => c.estado === 'Activo').length;
  const clientesEmpresas = clientes.filter(c => c.tipo === 'Empresa').length;
  const clientesIndividuales = clientes.filter(c => c.tipo === 'Individual').length;

  const montoTotal = clientes.reduce((acc, c) => acc + c.montoTotalComprado, 0);
  const comprasTotales = clientes.reduce((acc, c) => acc + c.comprasTotales, 0);
  const promedioCompras = totalClientes > 0 ? Math.round(comprasTotales / totalClientes) : 0;
  const promedioVentas = totalClientes > 0 ? montoTotal / totalClientes : 0;

  const porcentajeActivos = totalClientes > 0 ? ((clientesActivos / totalClientes) * 100).toFixed(1) : '0';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Total Clientes"
        value={totalClientes.toString()}
        subtitle={`${clientesEmpresas} empresas, ${clientesIndividuales} individuales`}
        icon={<Users className="w-6 h-6" />}
      />
      <StatCard
        title="Clientes Activos"
        value={clientesActivos.toString()}
        subtitle={`${porcentajeActivos}% del total`}
        icon={<UserCheck className="w-6 h-6" />}
      />
      <StatCard
        title="Ventas Totales"
        value={`₡${montoTotal.toLocaleString('es-CR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
        subtitle={`Promedio: ₡${promedioVentas.toLocaleString('es-CR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`}
        icon={<TrendingUp className="w-6 h-6" />}
      />
      <StatCard
        title="Compras Promedio"
        value={promedioCompras.toString()}
        subtitle="compras por cliente"
        icon={<ShoppingCart className="w-6 h-6" />}
      />
    </div>
  );
}
