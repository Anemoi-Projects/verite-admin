"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
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
import { ChevronDown, Eye, Pencil, Trash2 } from "lucide-react";
import { useCallback } from "react";
import AddEditAdminModal from "./AddEditAdminModal";
import { CommonDeleteModal } from "@/common-components/DeleteModal";
import { toast } from "sonner";

const Page = () => {
  const [authToken, setAuthToken] = useState("");
  const [mode, setMode] = useState("add");
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [admin, setAdmin] = useState([]);
  const [isOffCanvasOpen, setIsOffCanvasOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const getAllAdmin = useCallback(() => {
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `${process.env.apiURL}/api/v1/admin/getAllAdmin`,
      headers: {
        Authorization: authToken,
      },
    };

    axios
      .request(config)
      .then((response) => {
        setAdmin(response.data.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [authToken]);

  const handleAdminDelete = () => {
    let config = {
      method: "delete",
      maxBodyLength: Infinity,
      url: `${process.env.apiURL}/api/v1/admin/delete/${selectedRow}`,
      headers: {
        Authorization: authToken,
      },
    };

    axios
      .request(config)
      .then((response) => {
        toast.success(response.data.data, {
          className: "bg-green-700 text-white",
        });
        getAllAdmin();
        setLoading(false);
        setIsModalOpen(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
        toast.error("Something went wrong", {
          className: "bg-red-700 text-white",
        });
      });
  };

  const columns = [
    {
      id: "srNo",
      header: "Sr. No",
      cell: ({ row }) => row.index + 1,
    },

    {
      accessorKey: "Full Name",
      header: "User Name",
      cell: ({ row }) => row?.original?.fullName || "N/A",
    },

    {
      accessorKey: "Email ID",
      header: "Email ID",
      cell: ({ row }) => row?.original?.emailId || "N/A",
    },
    {
      accessorKey: "Role",
      header: "Role",
      cell: ({ row }) => row?.original?.role || "N/A",
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex  items-center gap-x-4">
          <Pencil
            size={18}
            className="cursor-pointer text-green-500"
            onClick={() => {
              setSelectedRow(row.original);
              setMode("edit");
              setIsOffCanvasOpen(true);
            }}
          />
          <Trash2
            size={18}
            className="cursor-pointer text-red-500"
            onClick={() => {
              setSelectedRow(row.original._id);
              setIsModalOpen(true);
            }}
          />
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: admin,
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
    if (window.localStorage.getItem("authToken")) {
      setAuthToken(localStorage.getItem("authToken"));
    }
  }, [authToken]);

  useEffect(() => {
    getAllAdmin();
  }, [authToken, getAllAdmin]);
  return (
    <div className="flex-1 bg-white text-black">
      <div className="flex justify-between items-center border-b py-4 p-6  border-gray-200">
        <h1 className="text-2xl font-medium   text-[#140B49] ">Admin Users</h1>
        <div className="flex gap-4 items-center">
          <button
            className="bg-gradient-to-r  from-[#140B49] to-[#140B49]/[0.72] text-white px-8 py-2 rounded-lg  block cursor-pointer"
            onClick={() => {
              setMode("add");
              setIsOffCanvasOpen(true);
            }}
          >
            Add Admin
          </button>
        </div>
      </div>
      <div className="w-full gap-4 p-6">
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
                    Admin Account Not Found.
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
            of <strong>{table.getFilteredRowModel().rows.length}</strong> admins
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
      <AddEditAdminModal
        mode={mode}
        setIsOffCanvasOpen={setIsOffCanvasOpen}
        isOffCanvasOpen={isOffCanvasOpen}
        getAllAdmin={getAllAdmin}
        authToken={authToken}
        userData={selectedRow}
      />
      <CommonDeleteModal
        delModalOpen={isModalOpen}
        setDelModalOpen={setIsModalOpen}
        handleEvent={handleAdminDelete}
        loading={loading}
        dialogTitle={"Are you sure you want to delete this admin?"}
        dialogDescription={
          "Do you really want to delete this admin? This process can't be reversed."
        }
      />
    </div>
  );
};

export default Page;
