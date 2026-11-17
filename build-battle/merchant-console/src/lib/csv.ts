import { merchantById } from "@/data/merchants"
import { Payment } from "@/data/types"
import { formatMoney } from "./money"

/**
 * CSV export for the payments table.
 *
 * `toCsv` writes whichever columns it is given, in that order. The export
 * route picks them with `parseColumns`, which leaves the card last four out
 * unless ops asks for it.
 */

export const EXPORT_COLUMNS = [
  "id",
  "created_at",
  "merchant",
  "description",
  "status",
  "method",
  "card_brand",
  "last4",
  "amount",
  "currency",
] as const

export type ExportColumn = (typeof EXPORT_COLUMNS)[number]

/** What ops gets unless they choose otherwise. Card last four is opt-in. */
export const DEFAULT_EXPORT_COLUMNS: readonly ExportColumn[] =
  EXPORT_COLUMNS.filter((column) => column !== "last4")

export type ColumnSelection =
  | { ok: true; columns: ExportColumn[] }
  | { ok: false; message: string }

/**
 * Turns the client's `columns` param into a validated, ordered column list.
 * Column names arrive from the client, so every one is checked against
 * EXPORT_COLUMNS here. Nothing unvalidated reaches the serializer.
 *
 * `null` (param absent) means the defaults. An empty selection is rejected,
 * because an export with no columns is not a file anyone wants.
 */
export function parseColumns(raw: string | null): ColumnSelection {
  if (raw === null) return { ok: true, columns: [...DEFAULT_EXPORT_COLUMNS] }

  const requested = raw
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean)
  if (requested.length === 0) {
    return { ok: false, message: "Select at least one column to export." }
  }

  const columns: ExportColumn[] = []
  for (const name of requested) {
    if (!(EXPORT_COLUMNS as readonly string[]).includes(name)) {
      return { ok: false, message: "Unknown export column." }
    }
    if (!columns.includes(name as ExportColumn)) {
      columns.push(name as ExportColumn)
    }
  }
  return { ok: true, columns }
}

function escapeCell(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

function cell(payment: Payment, column: ExportColumn): string {
  switch (column) {
    case "id":
      return payment.id
    case "created_at":
      return payment.createdAt
    case "merchant":
      return merchantById(payment.merchantId)?.name ?? payment.merchantId
    case "description":
      return payment.description
    case "status":
      return payment.status
    case "method":
      return payment.method
    case "card_brand":
      return payment.cardBrand ?? ""
    case "last4":
      return payment.last4 ?? ""
    case "amount":
      return formatMoney(payment.amount, payment.currency)
    case "currency":
      return payment.currency
  }
}

export function toCsv(
  payments: Payment[],
  columns: readonly ExportColumn[] = EXPORT_COLUMNS,
): string {
  const header = columns.join(",")
  const rows = payments.map((payment) =>
    columns.map((column) => escapeCell(cell(payment, column))).join(","),
  )
  return [header, ...rows].join("\n")
}

/**
 * `scope` labels what the file contains, e.g. `disputed` or `all`. Callers pass
 * only values they have already validated against an allowlist.
 */
export function exportFilename(date = new Date(), scope?: string): string {
  const day = date.toISOString().slice(0, 10)
  return scope ? `payments-${scope}-${day}.csv` : `payments-${day}.csv`
}
