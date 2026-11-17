"use client"

import { Button } from "@/components/Button"
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/Drawer"
import { Download } from "lucide-react"
import { useState } from "react"

const LABELS: Record<string, string> = {
  id: "Payment ID",
  created_at: "Created (UTC)",
  merchant: "Merchant",
  description: "Description",
  status: "Status",
  method: "Method",
  card_brand: "Card brand",
  last4: "Card last four",
  amount: "Amount",
  currency: "Currency",
}

type Scope = "filter" | "all"

const inputClass =
  "size-4 shrink-0 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-950 dark:focus:ring-blue-700/30"

/**
 * Options for the payments export. The file itself is built by
 * /api/payments/export, which validates the columns and scope again; the
 * checks here only keep the dialog from sending a request that is bound to fail.
 */
export function ExportDialog({
  query,
  columns,
  defaultColumns,
  filteredCount,
  allCount,
}: {
  /** The page's current query string, so "current filter" matches the table. */
  query: string
  columns: string[]
  defaultColumns: string[]
  filteredCount: number
  allCount: number
}) {
  const [open, setOpen] = useState(false)
  const [scope, setScope] = useState<Scope>("filter")
  const [selected, setSelected] = useState<string[]>(defaultColumns)

  const rowCount = scope === "all" ? allCount : filteredCount
  const canDownload = selected.length > 0

  // Keep the canonical column order, whatever order boxes were ticked in.
  const chosen = columns.filter((column) => selected.includes(column))

  const href = (() => {
    const params = new URLSearchParams(query)
    params.delete("page")
    params.set("scope", scope)
    params.set("columns", chosen.join(","))
    return `/api/payments/export?${params.toString()}`
  })()

  const toggle = (column: string, checked: boolean) =>
    setSelected((current) =>
      checked ? [...current, column] : current.filter((c) => c !== column),
    )

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="secondary" className="w-full gap-2 py-1.5 sm:w-fit">
          <Download
            className="-ml-0.5 size-4 shrink-0 text-gray-400 dark:text-gray-600"
            aria-hidden="true"
          />
          Export
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Export payments</DrawerTitle>
          <DrawerDescription>
            Choose what goes in the file. Card last four is left out unless you
            add it.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerBody className="flex flex-col gap-6">
          <fieldset>
            <legend className="text-sm font-medium text-gray-900 dark:text-gray-50">
              Scope
            </legend>
            <div className="mt-2 flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="radio"
                  name="scope"
                  className={inputClass}
                  checked={scope === "filter"}
                  onChange={() => setScope("filter")}
                />
                Current filter ({filteredCount.toLocaleString()} payments)
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="radio"
                  name="scope"
                  className={inputClass}
                  checked={scope === "all"}
                  onChange={() => setScope("all")}
                />
                All payments ({allCount.toLocaleString()} payments)
              </label>
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-medium text-gray-900 dark:text-gray-50">
              Columns
            </legend>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {columns.map((column) => (
                <label
                  key={column}
                  className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                >
                  <input
                    type="checkbox"
                    className={`${inputClass} rounded`}
                    checked={selected.includes(column)}
                    onChange={(event) => toggle(column, event.target.checked)}
                  />
                  {LABELS[column] ?? column}
                </label>
              ))}
            </div>
            {!canDownload && (
              <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-500">
                Select at least one column to download.
              </p>
            )}
          </fieldset>
        </DrawerBody>
        <DrawerFooter className="items-center">
          <p
            className="mb-2 text-sm text-gray-500 sm:mb-0 sm:mr-auto"
            aria-live="polite"
          >
            {rowCount.toLocaleString()} {rowCount === 1 ? "row" : "rows"} will
            be exported
          </p>
          {canDownload ? (
            <Button asChild onClick={() => setOpen(false)}>
              <a href={href}>Download CSV</a>
            </Button>
          ) : (
            <Button disabled>Download CSV</Button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
