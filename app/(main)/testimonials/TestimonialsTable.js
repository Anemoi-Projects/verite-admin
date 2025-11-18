"use client";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { Eye, Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function TestimonialsTable({
  data,
  setMode,
  setSelectedTestimonial,
  setIsOffCanvasOpen,
  setOpenDeleteModal,
}) {
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const router = useRouter();
  const columns = [
    {
      header: "Sr. No.",
      cell: ({ row }) => <div className="capitalize">{row?.index + 1}</div>,
    },
    {
      accessorKey: "customerName",
      header: "Customer Name",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("customerName")}</div>
      ),
    },
    {
      accessorKey: "customerDesignation",
      header: "Customer Designation",
      cell: ({ row }) => (
        <div className="">{row.getValue("customerDesignation")}</div>
      ),
    },

    {
      id: "actions",
      header: "Actions",
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-x-4">
            <Eye
              size={18}
              className="cursor-pointer text-yellow-700"
              onClick={() => {
                setMode("view");
                setSelectedTestimonial(row.original);
                setIsOffCanvasOpen(true);
              }}
            />
            <Pencil
              size={18}
              className="cursor-pointer text-green-500"
              onClick={() => {
                setMode("edit");
                setSelectedTestimonial(row.original);
                setIsOffCanvasOpen(true);
              }}
            />
            <Trash2
              size={18}
              className="cursor-pointer text-red-500"
              onClick={() => {
                setSelectedTestimonial(row.original);
                setOpenDeleteModal(true);
              }}
            />
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <input
          placeholder="Search..."
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm border p-2 rounded-md block ml-auto"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  className="cursor-pointer hover:bg-gray-200/60"
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between flex-row gap-2 py-4">
        <div className="text-xs text-muted-foreground">
          Showing{" "}
          <strong>
            {table.getPaginationRowModel().rows.length > 0
              ? table.getState().pagination.pageIndex *
                  table.getState().pagination.pageSize +
                1
              : 0}
          </strong>
          –
          <strong>
            {Math.min(
              (table.getState().pagination.pageIndex + 1) *
                table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}
          </strong>{" "}
          of <strong>{table.getFilteredRowModel().rows.length}</strong>{" "}
          testimonials
        </div>
        <div className="flex flex-row gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
