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
import { Label } from "@/components/ui/label";
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
import { Textarea } from "@/components/ui/textarea";
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
const Page = ({ selectedLanguage }) => {
  const [authToken, setAuthToken] = useState("");
  const [showPanel, setShowPanel] = useState(false);
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [allTableData, setAllTableData] = useState([]);
  const [teamFormState, setTeamFormState] = useState({
    state: "add",
    ID: null,
    data: null,
  });
  const columns = [
    {
      accessorKey: "Sr. No",
      header: "Sr. No",
      cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: "fullName",
      header: "Name",
      cell: ({ row }) => row?.original?.fullName ?? "N/A",
    },

    {
      accessorKey: "emailId",
      header: "Email",
      cell: ({ row }) =>
        row?.original?.emailId ? row?.original?.emailId : "N/A",
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
                  setShowPanel(true);
                  setTeamFormState({
                    state: "view",
                    ID: row.original._id,
                    data: row.original,
                  });
                }}
              >
                View
              </DropdownMenuItem>

              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => {
                  setShowDeleteModal(true);
                  setTeamFormState({
                    state: "delete",
                    ID: row.original._id,
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
    data: allTableData,
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
  const getAllAdvisoryMembers = (token) => {
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: process.env.apiURL + "/api/v1/enquiry/getEnquiry",
      headers: {
        Authorization: token,
      },
    };

    axios
      .request(config)
      .then((response) => {
        setAllTableData(response.data.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    if (window.localStorage.getItem("authToken")) {
      setAuthToken(localStorage.getItem("authToken"));
      getAllAdvisoryMembers(localStorage.getItem("authToken"));
    }
  }, [selectedLanguage]);
  const deleteItem = () => {
    let config = {
      method: "delete",
      maxBodyLength: Infinity,
      url: `${process.env.apiURL}/api/v1/enquiry/deleteEnquiry?id=${teamFormState.ID}`,
      headers: {
        Authorization: authToken,
      },
    };

    axios
      .request(config)
      .then((response) => {
        setTeamFormState((prev) => {
          return { ID: null, state: "add" };
        });
        setShowDeleteModal(false);
        toast.success(" deleted successfully", {
          className: "bg-white text-green-700 border border-green-500",
        });

        getAllAdvisoryMembers(authToken);
      })
      .catch((error) => {
        setShowDeleteModal(false);
        toast.error("Error while deleting resource");
        console.log(error);
      });
  };

  return (
    <main className="flex-1 overflow-auto">
      <div className="flex justify-between p-5 border-b">
        <h1 className="text-2xl font-medium">Messages</h1>
        <ThemeToggler />
      </div>
      <section className="p-5">
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
                    No CRM Found.
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
            messages
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
      </section>
      {/* .........Message Data...... */}
      <Sheet open={showPanel} onOpenChange={setShowPanel}>
        <SheetContent
          side="right"
          className="w-full sm:w-[450px] max-h-screen overflow-y-auto p-6"
        >
          <SheetHeader className={"p-0 py-4"}>
            <SheetTitle className="text-lg font-semibold ">
              Message Details
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-5">
            <div>
              <Label htmlFor="fullName" className={"mb-3"}>
                Full Name
              </Label>
              <Input
                id="fullName"
                type="text"
                value={teamFormState?.data?.fullName ?? "NA"}
              />
            </div>
            <div>
              <Label htmlFor="emailId" className={"mb-3"}>
                Email ID
              </Label>
              <Input
                id="emailId"
                type="text"
                value={teamFormState?.data?.emailId ?? "NA"}
              />
            </div>
            <div>
              <Label htmlFor="message" className={"mb-3"}>
                Message
              </Label>
              <Textarea
                id="message"
                type="text"
                value={teamFormState?.data?.message ?? "NA"}
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* ..........delete modal........ */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Message Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this message?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="button" onClick={deleteItem} variant={"destructive"}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};
export default Page;
