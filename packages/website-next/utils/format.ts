export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount);
}

