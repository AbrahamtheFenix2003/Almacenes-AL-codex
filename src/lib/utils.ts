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
