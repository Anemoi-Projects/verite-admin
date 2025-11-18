"use client";
import { ChevronDown, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { useEffect, useState } from "react";
import axios from "axios";
import * as Dialog from "@radix-ui/react-dialog";
import BlogForm from "../components/BlogForm";
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
import RegionSelecter from "@/common-components/RegionSelecter";
import RegionStore from "@/store/RegionStore";
const Page = () => {
  const router = useRouter();
  const [showAddBlogPanel, setShowAddBlogPanel] = useState(false);
  const [blogFormState, setBlogFormState] = useState({
    blogId: null,
    state: "add",
  });
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [authToken, setAuthToken] = useState("");
  const { region, setRegion } = RegionStore();

  const [allBlogs, setAllBlogs] = useState([]);
  useEffect(() => {
    if (window.localStorage.getItem("authToken")) {
      setAuthToken(localStorage.getItem("authToken"));
    }
  }, [authToken]);
  const deleteBlog = () => {
    let config = {
      method: "delete",
      maxBodyLength: Infinity,
      url: `${process.env.apiURL}/api/v1/blogs/deleteBlog?id=${blogFormState.blogId}`,
      headers: { Authorization: authToken },
    };

    axios
      .request(config)
      .then((response) => {
        setBlogFormState((prev) => {
          return { blogId: null, state: "add" };
        });
        setShowDeleteModal(false);
        toast.success("Blog deleted successfully", {
          className: "bg-green-700 text-white",
        });
        getAllBlogs();
      })
      .catch((error) => {
        setShowDeleteModal(false);
        toast.error("Error while deleting blog");
        console.log(error);
      });
  };
  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
  };
  const getAllBlogs = () => {
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `${process.env.apiURL}/api/v1/blogs/getAllBlogs?lang=${region}`,
      headers: {},
    };

    axios
      .request(config)
      .then((response) => {
        // console.log(JSON.stringify(response.data));
        setAllBlogs(response.data.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const columns = [
    {
      header: "Sr No",
      accessorKey: "srNo",
      cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: "heading",
      header: "Title",
      cell: ({ row }) => {
        const text = row?.original?.heading || "N/A";
        return text.length > 40 ? `${text.slice(0, 40)}...` : text;
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const text = row?.original?.description || "N/A";
        return text.length > 80 ? `${text.slice(0, 80)}...` : text;
      },
    },
    {
      accessorKey: "authorName",
      header: "Author Name",
      cell: ({ row }) =>
        row?.original?.authorName ? row?.original?.authorName : "N/A",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) =>
        row?.original?.status ? row?.original?.status : "N/A",
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-x-4">
          <Pencil
            size={18}
            className="cursor-pointer text-green-500"
            onClick={() => {
              router.push(`/blogs/${row.original._id}`);
            }}
          />
          <Trash2
            size={18}
            className="cursor-pointer text-red-500"
            onClick={() => {
              setShowDeleteModal(true);
              setBlogFormState({
                state: "delete",
                blogId: row.original._id,
              });
            }}
          />
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: allBlogs,
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
    if (region) {
      getAllBlogs();
    }
  }, [region]);
  return (
    <main className="flex-1 overflow-auto bg-white text-black">
      <div className="flex justify-between items-center border-b py-4 pl-6  border-gray-200">
        <h1 className="text-2xl font-medium   text-[#140B49] ">Blogs</h1>
      </div>
      <section className="p-6">
        <div className="flex justify-between items-center mb-4">
          {" "}
          <h2 className="text-lg font-medium mb-4 text-[#243874]">
            Blog ID/ Heading
          </h2>
          <div className="flex gap-4 items-center">
            <button
              className="bg-gradient-to-r  from-[#140B49] to-[#140B49]/[0.72] text-white px-8 py-2 rounded-lg  block cursor-pointer"
              onClick={() => {
                router.push("/blogs/add-blog");
              }}
            >
              Add Blog
            </button>
            <RegionSelecter region={region} setRegion={setRegion} />
          </div>
        </div>
        <div className=" mb-4 ">
          {/* .............table........... */}

          <div className="w-full gap-4  p-3 border border-slate-200 rounded overflow-hidden">
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
                        No Pages Found.
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
                blogs
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
      <Dialog.Root
        open={showAddBlogPanel}
        onOpenChange={() => {
          setBlogFormState({ blogId: null, state: "add" });
          setShowAddBlogPanel(false);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/20 z-40" />

          <Dialog.Content className="fixed right-0 top-0 h-full w-full sm:w-1/3 bg-white border-l shadow-lg z-50 p-6 overflow-y-auto transition-all animate-in slide-in-from-right">
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
                  {blogFormState?.state?.toUpperCase()} Blog
                </Dialog.Title>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setBlogFormState({ blogId: null, state: "add" });
                    setShowAddBlogPanel(false);
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
            <BlogForm
              blogFormState={blogFormState}
              getAllBlogs={getAllBlogs}
              setShowAddBlogPanel={setShowAddBlogPanel}
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
              Delete Blog
            </Dialog.Title>
            <Dialog.Description
              className="text-red-500 text-center text-sm mb-4"
              size="2"
              mb="4"
            >
              Are you sure you want to delete this blog?
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
                onClick={deleteBlog}
              >
                Delete
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </main>
  );
};

export default Page;
