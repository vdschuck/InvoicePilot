export function calculateItemAmount(quantity: number, rate: number): number {
  return quantity * rate
}

export function calculateInvoiceTotal(items: { quantity: number; rate: number }[]): number {
  return items.reduce((total, item) => total + calculateItemAmount(item.quantity, item.rate), 0)
}
