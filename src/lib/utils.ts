const currencyFormatter = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function formatCurrency(
  value: number | null | undefined,
  options?: Intl.NumberFormatOptions
) {
  const amount = Number(value ?? 0);

  const formatter =
    options && Object.keys(options).length > 0
      ? new Intl.NumberFormat('es-PE', {
          style: 'currency',
          currency: 'PEN',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
          ...options,
        })
      : currencyFormatter;

  const formatted = formatter.format(amount);

  return formatted.replace('\u00A0', ' ').replace('S/', 'S/.');
}

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD usando la zona horaria local
 * Evita problemas de zona horaria que ocurren con toISOString()
 * 
 * @returns string - Fecha en formato YYYY-MM-DD (ej: "2025-10-08")
 */
export function getFechaLocal(): string {
  const hoy = new Date();
  const year = hoy.getFullYear();
  const month = String(hoy.getMonth() + 1).padStart(2, '0');
  const day = String(hoy.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
