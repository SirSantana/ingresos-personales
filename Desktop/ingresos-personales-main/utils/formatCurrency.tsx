// utils/formatCurrency.ts

export function formatCurrency(amount: number, currency: 'USD' | 'COP') {
  if (isNaN(amount)) return '';

  const locales = {
    USD: 'en-US',
    COP: 'es-CO',
  };

  const formatter = new Intl.NumberFormat(locales[currency], {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  });

  return formatter.format(amount);
}
