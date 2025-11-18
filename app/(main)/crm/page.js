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
// import ResourceCategoryForm from "./ResourceCategoryForm";
// import AdvisoryForm from "./AdvisoryForm";
const Page = ({ selectedLanguage }) => {
  const [authToken, setAuthToken] = useState("");
  const [showPanel, setShowPanel] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [allTableData, setAllTableData] = useState([]);

  const [teamFormState, setTeamFormState] = useState({
    ID: null,
    state: "add",
  });
  const columns = [
    {
      accessorKey: "Sr. No",
      header: "Sr. No",
      cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: "name",
      header: " Name",
      cell: ({ row }) =>
        row?.original?.firstName
          ? row?.original?.firstName && row?.original?.lastName
            ? row?.original?.firstName + " " + row?.original?.lastName
            : "N/A"
          : "N/A",
    },

    {
      accessorKey: "emailID",
      header: "Email",
      cell: ({ row }) =>
        row?.original?.emailID ? row?.original?.emailID : "N/A",
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
              {/* <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => {
                  setShowPanel(true);
                  setTeamFormState({
                    state: "edit",
                    ID: row.original._id,
                  });
                }}
              >
                View/Edit
              </DropdownMenuItem> */}

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
    console.log(teamFormState, "bug");
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
    <div className="p-6 space-y-10">
      {/* First Table Section */}
      <section>
        <div className="flex justify-between my-3">
          <h2 className="text-2xl font-semibold mb-4 text-[#0D0E52]">CRM</h2>
          <div>
            {" "}
            {/* <button
              onClick={() => {
                setShowPanel(true);
                setShowForm({ id: null, state: "add" });
              }}
              className="bg-gradient-to-r  from-[#140B49] to-[#140B49]/[0.72] text-white px-8 py-2 rounded-lg   block cursor-pointer"
            >
              Add Advisory Member
            </button> */}
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
                    No CRM Found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* .........add Resource panel...... */}
      <Dialog.Root
        open={showPanel}
        onOpenChange={() => {
          setShowPanel(false);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/20 z-40" />

          <Dialog.Content className="fixed right-0 top-0 h-full w-full sm:w-2/5 bg-white border-l shadow-lg z-50 p-6 overflow-y-auto transition-all animate-in slide-in-from-right">
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
                  {showForm?.state?.toUpperCase()} Advisory Team Member
                </Dialog.Title>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowPanel(false);
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
            {/* <AdvisoryForm
              teamFormState={teamFormState}
              getAllTeamMembers={getAllAdvisoryMembers}
              setShowTeamPanel={setShowPanel}
              selectedLanguage={selectedLanguage}
            /> */}
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
              Delete Enquiry
            </Dialog.Title>
            <Dialog.Description
              className="text-red-500 text-center text-sm mb-4"
              size="2"
              mb="4"
            >
              Are you sure you want to delete this Enquiry?
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
                onClick={deleteItem}
              >
                Delete
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};
export default Page;
