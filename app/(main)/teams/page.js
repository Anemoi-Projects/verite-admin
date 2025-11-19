"use client";
import { Pencil, Trash2, Eye, ChevronDown, MoreHorizontal } from "lucide-react";

import React, { Suspense, useEffect, useState, useMemo } from "react";
import axios from "axios";

import { toast } from "sonner";
// import { useToast } from "@/hooks/use-toast";

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
import TeamForm from "./components/TeamForm";
import AdvisoryTable from "./components/AdvisoryTable";
import PartnerTable from "./components/PartnerTable";
import RegionStore from "@/store/RegionStore";
import RegionSelecter from "@/common-components/RegionSelecter";
import ThemeToggler from "@/common-components/ThemeToggler";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Page = () => {
  const [authToken, setAuthToken] = useState("");
  const router = useRouter();
  const { region: selectedLanguage, setRegion: setSelectedLanguage } =
    RegionStore();
  const [teamFormState, setTeamFormState] = useState({
    ID: null,
    state: "add",
  });
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showTeamPanel, setShowTeamPanel] = useState(false);
  const [allTeamMembers, setAllTeamMembers] = useState([]);

  useEffect(() => {
    if (window.localStorage.getItem("authToken")) {
      setAuthToken(localStorage.getItem("authToken"));
    }
  }, [authToken]);

  const deleteItem = () => {
    let config = {
      method: "delete",
      maxBodyLength: Infinity,
      url: `${process.env.apiURL}/api/v1/team/deleteMember?id=${teamFormState.ID}`,
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
        toast.success("Team Member deleted successfully", {
          className: "bg-white text-green-700 border border-green-500",
        });

        getAllTeamMembers();
      })
      .catch((error) => {
        setShowDeleteModal(false);
        toast.error("Error while deleting resource");
        console.log(error);
      });
  };

  const getAllTeamMembers = () => {
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `${process.env.apiURL}/api/v1/team/getMembers?type=internalTeam`,
      headers: {},
    };

    axios
      .request(config)
      .then((response) => {
        // console.log(JSON.stringify(response.data));
        setAllTeamMembers(response.data.data);
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
      accessorKey: "picture",
      header: "Picture",
      cell: ({ row }) =>
        row?.original?.picture ? (
          <img src={row.original.picture} className="h-20 w-20" />
        ) : (
          "N/A"
        ),
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (row?.original?.name ? row?.original?.name : "N/A"),
    },
    {
      accessorKey: "designation",
      header: "Designation",
      cell: ({ row }) =>
        row?.original?.designation ? row?.original?.designation : "N/A",
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
                  setTeamFormState((prev) => {
                    return { ID: row?.original?._id, state: "edit" };
                  });
                  setShowTeamPanel(true);
                }}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => {
                  setTeamFormState((prev) => {
                    return { ID: row?.original?._id, state: "delete" };
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
    data: allTeamMembers,
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
    if (selectedLanguage) {
      getAllTeamMembers();
    }
  }, [selectedLanguage]);
  return (
    <main className="flex-1 overflow-auto">
      <div className="flex justify-between p-5 border-b">
        <h1 className="text-2xl font-medium">Teams &amp; Partners</h1>
        <ThemeToggler />
      </div>
      <section className="p-6">
        <div className="flex justify-between items-center mb-4">
          {" "}
          <h2 className="text-lg font-medium mb-4">Teams Memebers</h2>
          <div className="flex gap-4 items-center">
            <Button
              className="theme-button"
              onClick={() => {
                setTeamFormState((prev) => {
                  return { ID: null, state: "add" };
                });
                setShowTeamPanel(true);
              }}
            >
              Add Team Member
            </Button>
          </div>
        </div>

        <div className=" mb-4 ">
          {/* .............table........... */}

          <div className=" p-5 border rounded-md ">
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
                        No Team Member Found.
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
                members
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

      <section>
        <PartnerTable selectedLanguage={selectedLanguage} />
      </section>

      {/* .........resource panel...... */}
      <Sheet open={showTeamPanel} onOpenChange={setShowTeamPanel}>
        <SheetContent
          side="right"
          className="h-full w-full sm:w-3/5 p-6 overflow-y-auto animate-in slide-in-from-right"
        >
          {/* HEADER */}
          <SheetHeader>
            <SheetTitle className="text-lg font-semibold">
              {teamFormState?.state?.toUpperCase()} Team Member
            </SheetTitle>
          </SheetHeader>

          {/* FORM */}
          <TeamForm
            teamFormState={teamFormState}
            getAllTeamMembers={getAllTeamMembers}
            setShowTeamPanel={setShowTeamPanel}
            selectedLanguage={selectedLanguage}
          />
        </SheetContent>
      </Sheet>

      {/* ..........delete modal........ */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Team Member Deletion</DialogTitle>
            <DialogDescription>
              Deleting this team member will permanently erase their profile and
              associated details. Proceed with caution.
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
