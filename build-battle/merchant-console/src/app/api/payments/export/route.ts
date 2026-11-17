import { filterPayments, parseFilters, sortPayments } from "@/data/queries"
import { exportFilename, parseColumns, toCsv } from "@/lib/csv"
import { NextRequest, NextResponse } from "next/server"

const SCOPES = ["filter", "all"] as const

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 })
}

/**
 * Exports payments as CSV.
 *
 * - `columns`: comma-separated export columns, validated against the
 *   allowlist in `parseColumns`. Absent means the defaults (no card last four).
 * - `scope`: `filter` (default) honors the active filters; `all` ignores them.
 *
 * Both scopes go through the one query builder and are not paginated.
 */
export function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams

  const scope = params.get("scope") ?? "filter"
  if (!(SCOPES as readonly string[]).includes(scope)) {
    return badRequest("Unknown export scope.")
  }

  const selection = parseColumns(params.get("columns"))
  if (!selection.ok) return badRequest(selection.message)

  const filters = parseFilters(
    scope === "all" ? new URLSearchParams() : params,
  )
  const rows = sortPayments(
    filterPayments(filters),
    filters.sort,
    filters.direction,
  )

  // The filename label only ever comes from validated values: the scope, or a
  // status that parseFilters has already checked against its allowlist.
  const label =
    scope === "all" ? "all" : filters.status !== "all" ? filters.status : undefined

  return new Response(toCsv(rows, selection.columns), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${exportFilename(new Date(), label)}"`,
    },
  })
}
