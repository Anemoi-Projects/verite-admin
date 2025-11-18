"use client";
import ThemeToggler from "@/common-components/ThemeToggler";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useEffect, useState } from "react";
import { toast } from "sonner";
import FAQForm from "./components/FAQForm";
const Page = () => {
  const [faqFormState, setFAQFormState] = useState({
    faqID: null,
    state: "add",
  });
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFAQPanel, setShowFAQPanel] = useState(false);
  const [allFAQs, setAllFAQs] = useState([]);
  const [authToken, setAuthToken] = useState("");

  useEffect(() => {
    if (window.localStorage.getItem("authToken")) {
      setAuthToken(localStorage.getItem("authToken"));
    }
  }, [authToken]);

  const deleteFAQ = () => {
    let config = {
      method: "delete",
      maxBodyLength: Infinity,
      url: `${process.env.apiURL}/api/v1/faq/deleteFAQ?id=${faqFormState.faqID}`,
      headers: { Authorization: authToken },
    };

    axios
      .request(config)
      .then((response) => {
        // console.log(JSON.stringify(response.data));
        setFAQFormState((prev) => {
          return { faqID: null, state: "add" };
        });
        setShowDeleteModal(false);
        toast.success("FAQ deleted successfully", {
          className: "bg-green-700 text-white",
        });
        getAllFAQs();
      })
      .catch((error) => {
        setShowDeleteModal(false);
        toast.error("Error while deleting FAQ");
        console.log(error);
      });
  };
  const getAllFAQs = () => {
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `${process.env.apiURL}/api/v1/faq/getAllFAQ`,
      headers: {},
    };

    axios
      .request(config)
      .then((response) => {
        // console.log(JSON.stringify(response.data));
        setAllFAQs(response.data.data);
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
      accessorKey: "Question",
      header: "Question",
      cell: ({ row }) =>
        row?.original?.question ? row?.original?.question : "N/A",
    },

    {
      accessorKey: "Answer",
      header: "Answer",
      cell: ({ row }) =>
        row?.original?.answer ? row?.original?.answer : "N/A",
    },
    {
      accessorKey: "categories",
      header: "Tag",
      cell: ({ row }) =>
        row?.original?.categories?.length > 0
          ? row?.original?.categories?.join(", ") || ""
          : "N/A",
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
                  setFAQFormState((prev) => {
                    return { faqID: row?.original?._id, state: "edit" };
                  });
                  setShowFAQPanel(true);
                }}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => {
                  setFAQFormState((prev) => {
                    return { faqID: row?.original?._id, state: "delete" };
                  });
                  setShowDeleteModal(true);
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      ),
    },
  ];

  const table = useReactTable({
    data: allFAQs,
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
    getAllFAQs();
  }, []);
  return (
    <main className="flex-1 overflow-auto">
      <div className="flex justify-between p-5 border-b">
        <h1 className="text-2xl font-medium">FAQs</h1>
        <ThemeToggler />
      </div>
      <section className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">FAQ ID/ Heading</h2>
          <div className="flex gap-4 items-center">
            <Button
              className="theme-button"
              onClick={() => {
                setFAQFormState((prev) => {
                  return { faqID: null, state: "add" };
                });
                setShowFAQPanel(true);
              }}
            >
              Add FAQ
            </Button>
          </div>
        </div>

        <div className=" mb-4 ">
          {/* .............table........... */}

          <div className="w-full gap-4  p-5 border rounded">
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
                        No FAQ Found.
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
                questions
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

      {/* .........faq panel...... */}
      <Sheet open={showFAQPanel} onOpenChange={setShowFAQPanel}>
        <SheetContent
          side="right"
          className="w-full sm:w-[450px] max-h-screen overflow-y-auto p-6"
        >
          <SheetHeader className={"p-0 py-4"}>
            <SheetTitle className="text-lg font-semibold ">
              {faqFormState?.state?.toUpperCase()} FAQ
            </SheetTitle>
          </SheetHeader>
          {/* FORM */}
          <FAQForm
            faqFormState={faqFormState}
            getAllFAQs={getAllFAQs}
            setShowFAQPanel={setShowFAQPanel}
          />
        </SheetContent>
      </Sheet>

      {/* ..........delete modal........ */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm FAQ Deletion</DialogTitle>
            <DialogDescription>
              Deleting this question will permanently erase question. Proceed
              with caution.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="button" onClick={deleteFAQ} variant={"destructive"}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default Page;
