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
import FAQCategoryForm from "./components/FAQCategoryForm";
const Page = () => {
  const [authToken, setAuthToken] = useState("");
  const [faqCategoryForm, setFaqCategoryForm] = useState({
    id: null,
    state: "add",
  });

  const [showFaqCategoryPanel, setShowFaqCategoryPanel] = useState(false);

  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [allFaqCategories, setAllFaqCategories] = useState([]);
  const columns = [
    {
      accessorKey: "Sr. No",
      header: "Sr. No",
      cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: "name",
      header: "Title",
      cell: ({ row }) => (row?.original?.name ? row?.original?.name : "N/A"),
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
                  setShowFaqCategoryPanel(true);
                  setFaqCategoryForm({
                    state: "edit",
                    id: row.original._id,
                  });
                }}
              >
                View/Edit
              </DropdownMenuItem>

              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => {
                  setShowDeleteModal(true);
                  setFaqCategoryForm({
                    state: "delete",
                    id: row.original._id,
                  });
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
    data: allFaqCategories,
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

  const deleteCategory = () => {
    let config = {
      method: "delete",
      maxBodyLength: Infinity,
      url: `${process.env.apiURL}/api/v1/admin/deleteCategory?id=${faqCategoryForm.id}`,
      headers: { Authorization: authToken },
    };

    axios
      .request(config)
      .then((response) => {
        // console.log(JSON.stringify(response.data));
        setFaqCategoryForm({
          state: "add",
          id: null,
        });
        setShowDeleteModal(false);
        toast.success("Blog Category deleted successfully", {
          className: "bg-green-700 text-white",
        });
        getAllBlogCategories();
      })
      .catch((error) => {
        setFaqCategoryForm({
          state: "add",
          id: null,
        });
        setShowDeleteModal(false);
        toast.error("Error while deleting FAQ");
        console.log(error);
      });
  };

  const getAllBlogCategories = (token) => {
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `${process.env.apiURL}/api/v1/admin/getAllCategories?slug=faq`,
      headers: {
        Authorization: token,
      },
    };

    axios
      .request(config)
      .then((response) => {
        setAllFaqCategories(response.data.data);
        console.log(JSON.stringify(response.data));
      })
      .catch((error) => {
        console.log(error);
      });
  };
  useEffect(() => {
    if (window.localStorage.getItem("authToken")) {
      setAuthToken(localStorage.getItem("authToken"));
      getAllBlogCategories(localStorage.getItem("authToken"));
    }
  }, []);

  return (
    <>
      <section>
        <div className="flex justify-between p-5 border-b">
          <h1 className="text-2xl font-medium">Categories Library</h1>
          <ThemeToggler />
        </div>
        <div className="w-full gap-4  p-3  rounded overflow-hidden">
          <div className="flex justify-between my-3">
            <h2 className="text-2xl font-semibold">FAQ Categories</h2>
            <div>
              <Button
                onClick={() => {
                  setShowFaqCategoryPanel(true);
                  setFaqCategoryForm({ id: null, state: "add" });
                }}
                className="theme-button"
              >
                Add FAQ Category
              </Button>
            </div>
          </div>

          <div className="p-5 border rounded-md ">
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
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="cursor-pointer">
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
                        No Categories Found.
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
                categories
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
        </div>
      </section>

      {/* .........faq panel...... */}
      <Sheet open={showFaqCategoryPanel} onOpenChange={setShowFaqCategoryPanel}>
        <SheetContent
          side="right"
          className="w-full sm:w-[450px] max-h-screen overflow-y-auto p-6"
        >
          <SheetHeader className={"p-0 py-4"}>
            <SheetTitle className="text-lg font-semibold ">
              {faqCategoryForm?.state?.toUpperCase()} FAQ Category
            </SheetTitle>
          </SheetHeader>
          {/* FORM */}
          <FAQCategoryForm
            faqCategoryForm={faqCategoryForm}
            getAllFaqCategories={getAllBlogCategories}
            setShowFaqCategoryPanel={setShowFaqCategoryPanel}
          />
        </SheetContent>
      </Sheet>

      {/* ..........delete modal........ */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Category Deletion</DialogTitle>
            <DialogDescription>
              Deleting this category will permanently erase category and
              associated details. Proceed with caution.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              type="button"
              onClick={deleteCategory}
              variant={"destructive"}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
export default Page;
