"use client";
import { ChevronDown, MoreHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import FooterForm from "./FooterForm";
import RegionStore from "@/store/RegionStore";
import RegionSelecter from "@/common-components/RegionSelecter";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import ThemeToggler from "@/common-components/ThemeToggler";

const Page = () => {
  const router = useRouter();
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [showHeaderFooterPanel, setHeaderFooterPanel] = useState(false);
  const [allLinks, setAllLinks] = useState([]);
  const [headerFooterFormState, setHeaderFooterFormState] = useState({
    linkID: null,
    state: "add",
    type: "link",
  });

  const getAllLinks = () => {
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `${process.env.apiURL}/api/v1/contents/getFooter`,
      headers: {},
    };

    axios
      .request(config)
      .then((response) => {
        // console.log(JSON.stringify(response.data));
        setAllLinks(response.data.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const columns = [
    {
      id: "srNo",
      header: "Sr. No",
      cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (row?.original?.title ? row?.original?.title : "N/A"),
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button aria-haspopup="true" size="icon" variant="ghost">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => {
                  setHeaderFooterFormState((prev) => {
                    return {
                      linkID: row?.original?._id,
                      state: "edit",
                      type: "link",
                    };
                  });
                  setHeaderFooterPanel(true);
                }}
              >
                Edit
              </DropdownMenuItem>
              {/* <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => {
                  setHeaderFooterFormState((prev) => {
                    return { linkID: row?.original?._id, state: "delete" };
                  });
                  setShowDeleteModal(true);
                }}
              >
                Delete
              </DropdownMenuItem> */}
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      ),
    },
  ];

  const table = useReactTable({
    data: allLinks,
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

  useEffect(() => {
    getAllLinks();
  }, []);
  return (
    <>
      <main className="flex-1 overflow-auto">
        <div className="flex justify-between items-center border-b p-5">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push("/all-pages")}
              className="text-sm px-4 py-2 "
            >
              ← Back
            </Button>
            <h1 className="text-2xl font-medium ">Footer Sections</h1>
          </div>

          <ThemeToggler />
        </div>
        <section className="p-6">
          <h1 className="text-xl font-medium">Sections</h1>

          <div className=" my-4 ">
            {/* .............table........... */}
            <div className="w-full gap-4  p-3 border rounded overflow-hidden">
              <div className="flex items-center py-4">
                <Input
                  placeholder="Search..."
                  value={globalFilter}
                  onChange={(event) => setGlobalFilter(event.target.value)}
                  className="max-w-sm"
                />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="ml-auto">
                      Columns <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {table
                      .getAllColumns()
                      .filter((column) => column.getCanHide())
                      .map((column) => {
                        return (
                          <DropdownMenuCheckboxItem
                            key={column.id}
                            className="capitalize"
                            checked={column.getIsVisible()}
                            onCheckedChange={(value) =>
                              column.toggleVisibility(!!value)
                            }
                          >
                            {column.id}
                          </DropdownMenuCheckboxItem>
                        );
                      })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="rounded-md border p-3">
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
                          key={row.id}
                          data-state={row.getIsSelected() && "selected"}
                          className={""}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell
                              key={cell.id}
                              className="cursor-pointer max-w-[70px] truncate"
                            >
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
                          No Link Found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-between  flex-row gap-2 py-4">
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
                  sections
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

            {/* ...........table............. */}
          </div>
        </section>

        {/* Panel to Edit Header links */}
        <Sheet open={showHeaderFooterPanel} onOpenChange={setHeaderFooterPanel}>
          <SheetContent
            side="right"
            className="h-full w-full sm:w-3/5 p-6 overflow-y-auto animate-in slide-in-from-right"
          >
            <SheetHeader>
              <SheetTitle className="text-lg font-semibold uppercase">
                {headerFooterFormState?.state?.toUpperCase()} Footer{" "}
                {headerFooterFormState?.state?.type}
              </SheetTitle>
            </SheetHeader>

            <FooterForm
              headerFooterFormState={headerFooterFormState}
              getAllLinks={getAllLinks}
              setHeaderFooterPanel={setHeaderFooterPanel}
            />
          </SheetContent>
        </Sheet>
      </main>
    </>
  );
};

export default Page;
