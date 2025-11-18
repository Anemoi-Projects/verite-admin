"use client";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState, useCallback, useEffect } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import Select from "react-select";
import { ClipLoader } from "react-spinners";
import RegionStore from "@/store/RegionStore";

const EditorComponent = dynamic(() => import("./EditorComponent"), {
  ssr: false,
});

export default function Page() {
  const router = useRouter();
  const [authToken, setAuthToken] = useState("");
  const { region, setRegion } = RegionStore();

  const [loading, setLoading] = useState(false);
  const [tagOptions, setTagOptions] = useState([]);
  const [isViewMode, setIsViewMode] = useState(false);

  const form = useForm({
    defaultValues: {
      heading: "",
      slug: "",
      description: "",

      tags: [],
      thumbnail: null,
      authorName: "",
      authorBio: "",
      authorImage: null,
      seoTitle: "",
      seoDescription: "",
      seoKeywords: [],
      ogTitle: "",
      ogDescription: "",
    },
  });

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setAuthToken(token);
      getAllCategories(token);
    }
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    const formData = new FormData();

    formData.append("heading", data.heading);
    formData.append("slug", data.slug);
    formData.append("description", data.description);

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `${process.env.apiURL}/api/v1/blogs/createBlog?lang=${region}`,
      headers: {
        Authorization: authToken,
        "Content-Type": "multipart/form-data",
      },
      data: formData,
    };
    axios
      .request(config)
      .then((response) => {
        setLoading(false);
        toast.success("Blog Created successfully");
        router.push("/blogs");
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
        toast.error("Something went wrong", {
          className: "bg-red-700 text-white",
        });
      });
  };

  const getAllCategories = useCallback(
    (token) => {
      const config = {
        method: "get",
        maxBodyLength: Infinity,
        url: `${process.env.apiURL}/api/v1/admin/getAllCategories?slug=blog&lang=${region}`,
        headers: {
          Authorization: token,
        },
      };

      axios
        .request(config)
        .then((response) => {
          console.log(JSON.stringify(response.data));
          setTagOptions(response.data.data);
        })
        .catch((error) => {
          console.error("Error fetching categories:", error);
        });
    },
    [authToken]
  );

  return (
    <div className="bg-white text-black w-full">
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <h1 className="text-xl font-bold">Add New Blog</h1>
      </header>

      <main className="flex p-6 gap-6">
        <Form {...form}>
          <form
            id="blog-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex gap-6 w-full"
          >
            <div className="w-1/2 mx-auto border rounded-md p-4 space-y-4 max-h-[720px] overflow-y-auto">
              <div>
                <label
                  class="flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 data-[error=true]:text-destructive mb-2"
                  for="lang"
                >
                  Language
                </label>
                <select
                  id="lang"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full border border-slate-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 px-6 py-2 focus:border-blue-500  p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                >
                  <option>Choose Language</option>
                  <option value={"en"}>English</option>
                  <option value={"de"}>German</option>
                </select>
              </div>
              {[
                { title: "Heading", value: "heading" },
                { title: "Blog URL", value: "slug" },
                { title: "Description", value: "description" },
              ].map((fieldName) => (
                <FormField
                  key={fieldName.value}
                  control={form.control}
                  name={fieldName.value}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{fieldName.title}</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isViewMode} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}

              <Button type="submit" disabled={loading}>
                {loading ? <ClipLoader size={20} /> : "Submit"}
              </Button>
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
}
