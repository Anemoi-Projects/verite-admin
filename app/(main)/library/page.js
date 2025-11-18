"use client";
import { ChevronDown, MoreHorizontal } from "lucide-react";

import { useEffect, useState } from "react";
import axios from "axios";
import * as Dialog from "@radix-ui/react-dialog";

import { toast } from "sonner";
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
import { useRouter } from "next/navigation";

import FAQCategoriesTable from "./components/FAQCategoriesTable";
import BlogCategoryForm from "./components/BlogCategoryForm";
import ResourceCategoriesTable from "./components/ResourceCategoriesTable";
import RegionStore from "@/store/RegionStore";
import RegionSelecter from "@/common-components/RegionSelecter";
const Page = () => {
  const [authToken, setAuthToken] = useState("");
  const [blogCategoryForm, setBlogCategoryForm] = useState({
    id: null,
    state: "add",
  });
  const [resourceCategoryForm, setResourceCategoryForm] = useState({
    id: null,
    state: "add",
  });
  const [faqCategoryForm, setFAQCategoryForm] = useState({
    id: null,
    state: "add",
  });
  const [showBlogCategoryPanel, setShowBlogCategoryPanel] = useState(false);
  const [showResourceCategoryPanel, setShowResourceCategoryPanel] =
    useState(false);
  const [showFAQCategoryPanel, setShowFAQCategoryPanel] = useState(false);
  const { region: selectedLanguage, setRegion: setSelectedLanguage } =
    RegionStore();
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [allBlogCategories, setAllBlogCategories] = useState([]);
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
                  setShowBlogCategoryPanel(true);
                  setBlogCategoryForm({
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
                  setBlogCategoryForm({
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
    data: allBlogCategories,
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
  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
    // getSinglePageData(e.target.value);
  };

  const deleteCategory = () => {
    let config = {
      method: "delete",
      maxBodyLength: Infinity,
      url: `${process.env.apiURL}/api/v1/admin/deleteCategory?id=${blogCategoryForm.id}`,
      headers: { Authorization: authToken },
    };

    axios
      .request(config)
      .then((response) => {
        // console.log(JSON.stringify(response.data));
        setBlogCategoryForm({
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
        setBlogCategoryForm({
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
      url:
        `${process.env.apiURL}/api/v1/admin/getAllCategories?slug=blog&lang=` +
        selectedLanguage,

      headers: {
        Authorization: token,
      },
    };

    axios
      .request(config)
      .then((response) => {
        setAllBlogCategories(response.data.data);
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
  }, [selectedLanguage]);

  return (
    <>
      <div className="p-6 space-y-10">
        {/* First Table Section */}
        <div className="flex justify-end">
          <RegionSelecter
            setRegion={setSelectedLanguage}
            region={selectedLanguage}
          />
        </div>
        <section>
          <div className="w-full gap-4  p-3  rounded overflow-hidden">
            <div className="flex justify-between my-3">
              <h2 className="text-2xl font-semibold mb-4 text-[#0D0E52]">
                Blog Categories
              </h2>
              <div>
                {" "}
                <button
                  onClick={() => {
                    setShowBlogCategoryPanel(true);
                    setBlogCategoryForm({ id: null, state: "add" });
                  }}
                  className="bg-gradient-to-r  from-[#140B49] to-[#140B49]/[0.72] text-white px-8 py-2 rounded-lg   block cursor-pointer"
                >
                  Add Blog Category
                </button>
              </div>
            </div>

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
                        No Blogs Categories Found.
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
                drafts
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
        </section>
      </div>
      {/* Second Table Section */}

      <ResourceCategoriesTable
        showBlogCategoryPanel={showResourceCategoryPanel}
        blogCategoryForm={resourceCategoryForm}
        setShowBlogCategoryPanel={setShowResourceCategoryPanel}
        selectedLanguage={selectedLanguage}
        setBlogCategoryForm={setResourceCategoryForm}
      />

      {/* Third Table Section */}

      <FAQCategoriesTable
        showBlogCategoryPanel={showFAQCategoryPanel}
        blogCategoryForm={faqCategoryForm}
        setShowBlogCategoryPanel={setShowFAQCategoryPanel}
        selectedLanguage={selectedLanguage}
        setBlogCategoryForm={setFAQCategoryForm}
      />
      {/* .........faq panel...... */}
      <Dialog.Root
        open={showBlogCategoryPanel}
        onOpenChange={() => {
          setShowBlogCategoryPanel(false);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/20 z-40" />

          <Dialog.Content className="fixed top-1/2 left-1/2 max-h-[90vh] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 transform rounded-lg bg-white p-6 shadow-lg z-50 overflow-y-auto transition-all animate-in fade-in-90">
            <div className="flex justify-between items-center mb-4 border-b-4 pb-2 border-[#140B49]">
              <div className="flex justify-center items-center gap-2">
                {" "}
                <Dialog.Close
                  className="rounded-full p-1 hover:bg-gray-100 transition"
                  aria-label="Close panel"
                >
                  <span
                    className="w-5 h-5 text-gray-500 hover:text-gray-700 transition"
                    strokeWidth={2.5}
                  >
                    x
                  </span>
                </Dialog.Close>
                <Dialog.Title className="text-lg font-semibold text-black">
                  {blogCategoryForm?.state?.toUpperCase()} Blog Category
                </Dialog.Title>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowBlogCategoryPanel(false);
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
            <BlogCategoryForm
              blogCategoryForm={blogCategoryForm}
              getAllBlogCategories={getAllBlogCategories}
              setShowBlogCategoryPanel={setShowBlogCategoryPanel}
              selectedLanguage={selectedLanguage}
            />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* ..........delete modal........ */}
      <Dialog.Root open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
          <Dialog.Content
            // minwidth="450px"
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg z-50 min-w-[550px]"
          >
            <Dialog.Title className="font-bold text-lg text-center my-5 text-black">
              Delete Blog Category
            </Dialog.Title>
            <Dialog.Description
              className="text-red-500 text-center text-sm mb-4"
              size="2"
              mb="4"
            >
              Are you sure you want to delete this Blog Category?
            </Dialog.Description>

            <div className="flex items-center justify-center my-5 gap-2">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                }}
                className="bg-[#5c5774]   text-white px-4 py-1.5 text-sm rounded"
              >
                Cancel
              </button>
              <button
                className="bg-gradient-to-r  from-[#8d0808] to-red-600 cursor-pointer hover:bg-gradient-to-l  text-white px-4 py-1.5 text-sm rounded"
                onClick={deleteCategory}
              >
                Delete
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};
export default Page;
