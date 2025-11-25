"use client";

import ThemeToggler from "@/common-components/ThemeToggler";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import axios from "axios";
import { ChevronDown, MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import HeaderFooterForm from "../components/HeaderFooterForm";

const Page = () => {
  const router = useRouter();
  const [allButtons, setAllButtons] = useState([]);
  const [buttonSorting, setButtonSorting] = useState([]);
  const [buttonFilter, setButtonFilter] = useState("");
  const [headerFooterFormState, setHeaderFooterFormState] = useState({
    linkID: null,
    state: "add",
    type: "link",
  });
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [showHeaderFooterPanel, setHeaderFooterPanel] = useState(false);
  const [allLinks, setAllLinks] = useState([]);

  const getAllLinks = () => {
    let config = {
      url: `${process.env.apiURL}/api/v1/contents/getHeader`,
      method: "get",
      maxBodyLength: Infinity,
      headers: {},
    };

    axios
      .request(config)
      .then((response) => {
        // console.log(JSON.stringify(response.data));
        setAllLinks(response.data.data?.links);
        setAllButtons(response.data.data?.ctaButtons);
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
      header: "Page Name",
      cell: ({ row }) => (row?.original?.title ? row?.original?.title : "N/A"),
    },

    {
      accessorKey: "url",
      header: "URL",
      cell: ({ row }) =>
        row?.original?.url ? row?.original?.url : row?.original?.externalURL,
    },

    {
      accessorKey: "actions",
      header: "Edit/View",
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
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      ),
    },
  ];

  const buttonColumns = [
    {
      id: "srNo",
      header: "Sr. No",
      cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: "title",
      header: "Button Title",
      cell: ({ row }) => row.original?.title ?? "N/A",
    },
    {
      accessorKey: "url",
      header: "URL",
      cell: ({ row }) => row.original?.url ?? "N/A",
    },
    {
      accessorKey: "actions",
      header: "Edit/View",
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
                      type: "button",
                    };
                  });
                  setHeaderFooterPanel(true);
                }}
              >
                Edit
              </DropdownMenuItem>
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

  const buttonTable = useReactTable({
    data: allButtons,
    columns: buttonColumns,
    state: {
      sorting: buttonSorting,
      globalFilter: buttonFilter,
    },
    onSortingChange: setButtonSorting,
    onGlobalFilterChange: setButtonFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
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
            <h1 className="text-2xl font-medium ">Header Links/Buttons</h1>
          </div>

          <ThemeToggler />
        </div>

        <section className="p-6">
          <h1 className="text-xl font-medium">Links</h1>
          <div className="my-4">
            {/* .............table........... */}

            <div className="w-full gap-4 p-5 border rounded overflow-hidden">
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
                  links
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

        {/* ................button table................ */}

        <section className="p-6 mt-5">
          <h1 className="text-xl font-medium"> Buttons</h1>

          <div className=" my-4 ">
            <div className="w-full gap-4 p-5 border rounded overflow-hidden">
              <div className="flex items-center py-4">
                <Input
                  placeholder="Search..."
                  value={buttonFilter}
                  onChange={(event) => setButtonFilter(event.target.value)}
                  className="max-w-sm"
                />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="ml-auto">
                      Columns <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {buttonTable
                      .getAllColumns()
                      .filter((column) => column.getCanHide())
                      .map((column) => (
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
                      ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="rounded-md border p-3">
                <Table>
                  <TableHeader>
                    {buttonTable.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id}>
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {buttonTable.getRowModel().rows.length ? (
                      buttonTable.getRowModel().rows.map((row) => (
                        <TableRow key={row.id}>
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
                          colSpan={buttonColumns.length}
                          className="text-center h-24"
                        >
                          No Buttons Found.
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
                    {buttonTable.getPaginationRowModel().rows.length > 0
                      ? buttonTable.getState().pagination.pageIndex *
                          buttonTable.getState().pagination.pageSize +
                        1
                      : 0}
                  </strong>
                  –
                  <strong>
                    {Math.min(
                      (buttonTable.getState().pagination.pageIndex + 1) *
                        buttonTable.getState().pagination.pageSize,
                      buttonTable.getFilteredRowModel().rows.length
                    )}
                  </strong>{" "}
                  of{" "}
                  <strong>
                    {buttonTable.getFilteredRowModel().rows.length}
                  </strong>{" "}
                  buttons
                </div>
                <div className="flex flex-row gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => buttonTable.previousPage()}
                    disabled={!buttonTable.getCanPreviousPage()}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => buttonTable.nextPage()}
                    disabled={!buttonTable.getCanNextPage()}
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
            {/* HEADER */}
            <SheetHeader className={"p-0"}>
              <SheetTitle className="text-lg font-semibold uppercase">
                {headerFooterFormState?.state?.toUpperCase()} header{" "}
                {headerFooterFormState?.state?.type}
              </SheetTitle>
            </SheetHeader>

            <HeaderFooterForm
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
