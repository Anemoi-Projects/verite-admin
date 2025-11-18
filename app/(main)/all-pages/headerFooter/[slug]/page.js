"use client";
import { Pencil, Trash2, Eye, ChevronDown, MoreHorizontal } from "lucide-react";

import React, { Suspense, useEffect, useState, useMemo } from "react";
import axios from "axios";
import * as Dialog from "@radix-ui/react-dialog";
// import FAQForm from "./components/FAQForm";
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
import { useParams } from "next/navigation";
import HeaderFooterForm from "../../components/HeaderFooterForm";
import RegionStore from "@/store/RegionStore";
import RegionSelecter from "@/common-components/RegionSelecter";

const Page = () => {
  const params = useParams();
  const [allButtons, setAllButtons] = useState([]);
  const [buttonSorting, setButtonSorting] = useState([]);
  const [buttonFilter, setButtonFilter] = useState("");

  const router = useRouter();
  const { region, setRegion } = RegionStore();

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showHeaderFooterPanel, setHeaderFooterPanel] = useState(false);
  const [allLinks, setAllLinks] = useState([]);

  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
  };

  const deleteFAQ = () => {
    let config = {
      method: "delete",
      maxBodyLength: Infinity,
      url: `${process.env.apiURL}/api/v1/faq/deleteFAQ?id=${headerFooterFormState.linkID}`,
      headers: {},
    };

    axios
      .request(config)
      .then((response) => {
        // console.log(JSON.stringify(response.data));
        setHeaderFooterFormState((prev) => {
          return { linkID: null, state: "add" };
        });
        setShowDeleteModal(false);
        toast.success("FAQ deleted successfully", {
          className: "bg-green-700 text-white",
        });
        getAllLinks();
      })
      .catch((error) => {
        setShowDeleteModal(false);
        toast.error("Error while deleting FAQ");
        console.log(error);
      });
  };
  const getAllLinks = () => {
    let url;

    if (params.slug === "Header") {
      url = `${process.env.apiURL}/api/v1/contents/getHeader?lang=` + region;
    } else {
      url = `${process.env.apiURL}/api/v1/contents/getFooter?lang=` + region;
    }

    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url,
      headers: {},
    };

    axios
      .request(config)
      .then((response) => {
        // console.log(JSON.stringify(response.data));
        setAllLinks(response.data.data?.links);
        setAllButtons(response.data.data?.ctaButton);
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
      accessorKey: "url",
      header: "Slug",
      cell: ({ row }) =>
        row?.original?.url ? row?.original?.url : row?.original?.externalURL,
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
      header: "Button Slug",
      cell: ({ row }) => row.original?.url ?? "N/A",
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
    if (region) {
      getAllLinks();
    }
  }, [region]);
  return (
    <>
      <main className="flex-1 overflow-auto bg-white text-black">
        <div className="flex justify-between items-center border-b py-4 pl-6  border-gray-200">
          <h1 className="text-2xl font-medium   text-[#140B49] ">
            {" "}
            {params.slug} Links/Buttons
          </h1>
        </div>
        <section className="p-6">
          <div className="flex justify-between items-center mb-4">
            {" "}
            <h1 className="text-xl font-medium   text-[#140B49] "> Links</h1>
            <div className="flex gap-4  items-center">
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
          <div className="flex justify-between items-center mb-4">
            {" "}
            <h1 className="text-xl font-medium   text-[#140B49] "> Buttons</h1>
          </div>

          <div className=" mb-4 ">
            <div className="w-full gap-4  p-3 border border-slate-200 rounded overflow-hidden">
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

        {/* .........header footer panel...... */}
        <Dialog.Root
          open={showHeaderFooterPanel}
          onOpenChange={() => {
            setHeaderFooterPanel(false);
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
                    {headerFooterFormState?.state?.toUpperCase()} {params?.slug}{" "}
                    {headerFooterFormState?.state?.type}
                  </Dialog.Title>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setHeaderFooterPanel(false);
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              <HeaderFooterForm
                headerFooterFormState={headerFooterFormState}
                getAllLinks={getAllLinks}
                setHeaderFooterPanel={setHeaderFooterPanel}
                selectedLanguage={region}
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
                Delete FAQ
              </Dialog.Title>
              <Dialog.Description
                className="text-red-500 text-center text-sm mb-4"
                size="2"
                mb="4"
              >
                Are you sure you want to delete this FAQ?
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
                  onClick={deleteFAQ}
                >
                  Delete
                </button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </main>
    </>
  );
};

export default Page;
