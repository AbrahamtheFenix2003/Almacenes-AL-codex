import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  valueColor?: string;
}

const StatCard = ({ title, value, valueColor = "text-gray-900" }: StatCardProps) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className={`text-3xl font-bold ${valueColor}`}>
        {value}
      </div>
    </CardContent>
  </Card>
);

interface SupplierStatsProps {
  totalProveedores: number;
  proveedoresActivos: number;
  productosSuministrados: number;
  calificacionPromedio: number;
}

export const SupplierStats = ({
  totalProveedores,
  proveedoresActivos,
  productosSuministrados,
  calificacionPromedio,
}: SupplierStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard title="Total Proveedores" value={totalProveedores} />
      <StatCard title="Proveedores Activos" value={proveedoresActivos} valueColor="text-green-600" />
      <StatCard title="Productos Suministrados" value={productosSuministrados} />
      <StatCard title="Calificación Promedio" value={calificacionPromedio.toFixed(1)} valueColor="text-green-600" />
    </div>
  );
};
