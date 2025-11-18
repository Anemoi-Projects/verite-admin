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

const EditorComponent = dynamic(() => import("./EditorComponent"), {
  ssr: false,
});

export default function Page() {
  const params = useParams();
  const [authToken, setAuthToken] = useState("");
  const [blogContent, setBlogContent] = useState("");
  const [singleBlogData, setSingleBlogData] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewAuthor, setImagePreviewAuthor] = useState(null);
  const [imageFileAuthor, setImageFileAuthor] = useState(null);
  const [tagOptions, setTagOptions] = useState([]);
  const [isViewMode, setIsViewMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      heading: "",
      slug: "",
      description: "",
      tags: [],
      thumbnail: null,
      seoTitle: "",
      seoDescription: "",
      seoKeywords: [],
      ogTitle: "",
      ogDescription: "",
    },
  });

  const getAllCategories = (token, lang) => {
    const config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `${process.env.apiURL}/api/v1/admin/getAllCategories?slug=blog&lang=${lang}`,
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
    if (token && lang) {
    }
  };

  const getSingleBlogData = useCallback(() => {
    if (!params?.id) return;
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `${process.env.apiURL}/api/v1/blogs/getBlog?id=${params?.id}`,
      headers: {},
    };

    axios
      .request(config)
      .then((response) => {
        const data = response.data.data;
        getAllCategories(authToken, data?.language);
        setSingleBlogData(data);
        form.reset({
          heading: data.heading,
          slug: data.slug,
          description: data.description,
          thumbnail: data.thumbnail,
          seoTitle: data.seoTitle,
          seoDescription: data.seoDescription,
          ogTitle: data.ogTitle,
          ogDescription: data.ogDescription,
          status: data.status,
          tags: data.tags?.join(", ") || "",
          seoKeywords: data.seoKeywords?.join(", ") || "",
        });
        setBlogContent(data?.content);
        if (data.thumbnail) {
          setImagePreview(data.thumbnail);
        }
        if (data.authorImage) {
          setImagePreviewAuthor(data.authorImage);
        }
      })
      .catch(console.error);
  }, [params?.id, form]);

  useEffect(() => {
    getSingleBlogData();
  }, [getSingleBlogData]);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setAuthToken(token);
    }
    console.log("token", token);
  }, []);
  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === "thumbnail") {
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
      }
    }
  };

  const removeImage = (type) => {
    if (type === "thumbnail") {
      setImagePreview(null);
      setImageFile(null);
      form.setValue("thumbnail", null);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    console.log("tags", typeof data?.tags);
    const formData = new FormData();

    formData.append("heading", data.heading);
    formData.append("slug", data.slug);
    formData.append("description", data.description);
    formData.append("seoTitle", data?.seoTitle);
    formData.append("seoDescription", data?.seoDescription);
    formData.append("ogTitle", data?.ogTitle);
    formData.append("ogDescription", data?.ogDescription);

    let updatedTagArray;
    if (Array.isArray(data.tags)) {
      updatedTagArray = [...data.tags];
    } else if (typeof data.tags === "string") {
      updatedTagArray = data.tags.split(",").map((t) => t.trim());
    }
    formData.append("tags", JSON.stringify(updatedTagArray));

    formData.append(
      "seoKeywords",
      JSON.stringify(
        data?.seoKeywords
          ?.split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      )
    );

    if (imageFile) {
      formData.append("thumbnail", imageFile);
    }

    if (imageFileAuthor) {
      formData.append("authorImage", imageFileAuthor);
    }
    if (blogContent !== "") {
      console.log(blogContent);
      formData.append("content", blogContent);
    }

    let config = {
      method: "put",
      maxBodyLength: Infinity,
      url: `${process.env.apiURL}/api/v1/blogs/editBlog?id=${params?.id}`,
      headers: {
        Authorization: authToken,

        "Content-Type": "multipart/form-data",
      },
      data: formData,
    };
    axios
      .request(config)
      .then((response) => {
        toast.success("Blog updated successfully", {
          className: "bg-green-700 text-white",
        });
        getSingleBlogData();
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
        toast.error("Something went wrong", {
          className: "bg-red-700 text-white",
        });
      });
  };

  const publishBlog = () => {
    setPublishLoading(true);
    const formData = new FormData();
    formData.append("status", "published");
    let config = {
      method: "put",
      maxBodyLength: Infinity,
      url: `${process.env.apiURL}/api/v1/blogs/editBlog?id=${params?.id}`,
      headers: {
        Authorization: authToken,

        "Content-Type": "multipart/form-data",
      },
      data: formData,
    };
    axios
      .request(config)
      .then((response) => {
        toast.success("Blog updated successfully", {
          className: "bg-green-700 text-white",
        });
        setPublishLoading(false);
        getSingleBlogData();
      })
      .catch((error) => {
        console.log(error);
        setPublishLoading(false);
        toast.error("Something went wrong", {
          className: "bg-red-700 text-white",
        });
      });
  };

  const selectOptions = tagOptions.map((tag) => ({
    value: tag._id,
    label: `${tag.name} (${tag.slug})`,
  }));
  return (
    <div className="bg-white text-black w-full">
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <h1 className="text-xl font-bold">Blog Editor</h1>
        <div className="space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={form.handleSubmit(onSubmit)}
            disabled={loading || publishLoading}
          >
            {loading ? <ClipLoader size={20} /> : "Save Draft"}
          </Button>
          <Button
            type="button"
            onClick={publishBlog}
            disabled={loading || publishLoading}
          >
            {publishLoading ? <ClipLoader size={20} /> : "Publish"}
          </Button>
        </div>
      </header>

      <main className="flex p-6 gap-6">
        <Form {...form}>
          <form
            id="blog-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex gap-6 w-full"
          >
            <div className="w-2/3 min-h-[500px]">
              <EditorComponent
                data={blogContent}
                setEditorData={setBlogContent}
              />
            </div>

            <div className="w-1/3 border rounded-md p-4 space-y-4 max-h-[720px] overflow-y-auto">
              <h2 className="text-xl font-semibold">Blog Settings</h2>
              {[
                { title: "Heading", value: "heading" },
                { title: "Blog URL", value: "slug" },
                { title: "Description", value: "description" },

                { title: "SEO Title", value: "seoTitle" },
                { title: "SEO Description", value: "seoDescription" },
                { title: "SEO Keywords", value: "seoKeywords" },
                { title: "OG Title", value: "ogTitle" },
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
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Blog Tags</FormLabel>
                    <FormControl>
                      <Select
                        isMulti
                        isDisabled={isViewMode}
                        options={selectOptions}
                        value={selectOptions.filter((option) =>
                          field.value?.includes(option.value)
                        )}
                        onChange={(selectedOptions) => {
                          field.onChange(
                            selectedOptions.map((option) => option.value)
                          );
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ogDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OG Description</FormLabel>
                    <FormControl>
                      <Textarea
                        className="min-h-[150px] resize-none"
                        {...field}
                        disabled={isViewMode}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {imagePreview && (
                <div className="relative w-fit">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-32 w-32 rounded border object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage("thumbnail")}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              <label>Thumbnail Image</label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, "thumbnail")}
                disabled={isViewMode}
              />
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
}
