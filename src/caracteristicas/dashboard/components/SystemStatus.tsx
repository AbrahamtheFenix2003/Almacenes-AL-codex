import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const systemStatus = [
  { label: "Base de datos", level: "ok" as const },
  { label: "Conexion de red", level: "ok" as const },
  { label: "Lectores RFID", level: "warning" as const },
  { label: "Backup automatico", level: "ok" as const },
];

const systemStyles = {
  ok: "bg-[#e5f7ed] text-[#1f8f4d]",
  warning: "bg-[#fff6da] text-[#b8860b]",
};

export function SystemStatus() {
  return (
    <Card>
      <CardHeader className="px-7 pt-7 pb-4">
        <CardTitle className="text-xl">Estado del sistema</CardTitle>
        <p className="text-sm text-[color:var(--muted-foreground)]">Monitoreo en tiempo real de los servicios clave</p>
      </CardHeader>
      <CardContent className="px-7 pb-7">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {systemStatus.map((item) => (
            <div
              key={item.label}
              className={`flex items-center justify-between rounded-[18px] px-4 py-3 text-sm font-semibold ${systemStyles[item.level]}`}
            >
              <span>{item.label}</span>
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-current opacity-60 animate-ping" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-current" />
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
