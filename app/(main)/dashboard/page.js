"use client";
import { Pencil, Trash2, Eye, MoreHorizontal, ChevronDown } from "lucide-react";

import React, { Suspense, useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input";
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
import { useRouter } from "next/navigation";
import RegionSelecter from "@/common-components/RegionSelecter";
import RegionStore from "@/store/RegionStore";
import { Card, CardContent } from "@/components/ui/card";
import ThemeToggler from "@/common-components/ThemeToggler";
const Page = () => {
  const router = useRouter();
  // const authToken = localStorage.getItem("authToken");
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
  const [pageStats, setPageStats] = useState({});
  const { region, setRegion } = RegionStore();

  const [allBlogs, setAllBlogs] = useState([]);

  const [authToken, setAuthToken] = useState("");

  useEffect(() => {
    if (window.localStorage.getItem("authToken")) {
      setAuthToken(window.localStorage.getItem("authToken"));
      getPageStats(window.localStorage.getItem("authToken"));
      getAllBlogs();
    }
  }, [region]);
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
        // console.log(JSON.stringify(response.data));
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
  const getAllBlogs = () => {
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `${process.env.apiURL}/api/v1/blogs/getAllBlogs?lang=${region}`,
      headers: { Authorization: authToken },
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

  const getPageStats = (token) => {
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `${process.env.apiURL}/api/v1/admin/getDashboardStats`,
      headers: { Authorization: token },
    };

    axios
      .request(config)
      .then((response) => {
        setPageStats(response.data.data);
        // console.log(JSON.stringify(response.data));
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const columns = [
    {
      accessorKey: "heading",
      header: "Title",
      cell: ({ row }) =>
        row?.original?.heading ? row?.original?.heading : "N/A",
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) =>
        row?.original?.description ? row?.original?.description : "N/A",
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
                  router.push(`/blogs/${row?.original?._id}`);
                }}
              >
                View/Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => {
                  setBlogFormState((prev) => {
                    return { blogId: row?.original?._id, state: "delete" };
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

  // useEffect(() => {

  //   getAllBlogs();
  // }, []);
  const StatCard = ({ icon, value, label, color }) => {
    const bgMap = {
      green: "bg-green-100",
      orange: "bg-orange-100",
      blue: "bg-blue-100",
      red: "bg-red-100",
    };
    return (
      <Card>
        <CardContent className={` rounded flex items-center gap-4`}>
          <div className={`text-3xl ${bgMap[color]} p-4`}>
            <img src={icon} alt="icon" />
          </div>
          <div>
            <div className="text-xl font-bold">{value}</div>
            <div className="text-sm ">{label}</div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <main className="flex-1">
      <div className="flex justify-between p-5 border-b">
        <h1 className="text-2xl font-medium">Dashboard</h1>
        <ThemeToggler />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-5 p-5">
        <StatCard
          color="green"
          icon="/images/file.png"
          value={pageStats?.pages}
          label="Total Pages"
        />
        <StatCard
          color="orange"
          icon="/images/watch.png"
          value={allBlogs?.length}
          label="Total Blogs"
        />
        <StatCard
          color="blue"
          icon="/images/crosshair.png"
          value={pageStats?.accounts}
          label="Admin User Accounts"
        />
      </div>
    </main>
  );
};

export default Page;
