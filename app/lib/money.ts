type MoneyLike = {
  amount?: string | number | null;
  currencyCode?: string | null;
};

const formatters = new Map<string, Intl.NumberFormat>();

/** "₹999" — whole rupees without decimals, paise only when present. */
export function formatMoney(money: MoneyLike | null | undefined) {
  if (!money || money.amount == null || !money.currencyCode) return '';
  const amount = Number(money.amount);
  const fractional = Math.round(amount * 100) % 100 !== 0;
  const key = `${money.currencyCode}:${fractional}`;
  let formatter = formatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: money.currencyCode,
      minimumFractionDigits: fractional ? 2 : 0,
      maximumFractionDigits: fractional ? 2 : 0,
    });
    formatters.set(key, formatter);
  }
  return formatter.format(amount);
}
