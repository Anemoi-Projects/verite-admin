"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";

function BlogForm({ blogFormState, getAllBlogs, setShowAddBlogPanel }) {
  const { blogId, state } = blogFormState;
  const isViewMode = state === "view";
  const [slug, setSlug] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [initialData, setInitialData] = useState({});
  const [content, setContent] = useState("");

  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      tag: "",
      slug: "",
      authorName: "",
    },
  });

  useEffect(() => {
    if (state === "add") {
      form.reset({
        title: "",
        description: "",
        tag: "",
        slug: "",
        authorName: "",
      });
      setThumbnail(null);
      setThumbnailPreview(null);
      setContent("");
      setSlug("");
    } else if ((state === "edit" || state === "view") && blogId) {
      const config = {
        method: "get",
        maxBodyLength: Infinity,
        url: `${process.env.apiURL}/api/v1/blogs/getBlog?id=${blogId}`,
        headers: {},
      };

      axios
        .request(config)
        .then((response) => {
          const data = response.data.data;

          form.reset({
            title: data.heading || "",
            description: data.description || "",
            tag: data.tag || "",
            slug: data.slug || "",
            authorName: data.authorName || "",
          });

          setContent(data.html || "");
          setThumbnail(data.thumbnail || "");
          setThumbnailPreview(null);
          setSlug(data.slug || "");

          setInitialData({
            title: data.heading || "",
            description: data.description || "",
            tag: data.tag || "",
            content: data.html || "",
            thumbnail: data.thumbnail || "",
            slug: data.slug || "",
            authorName: data.authorName || "",
          });
        })
        .catch((error) => {
          console.error("Failed to fetch blog data", error);
        });
    }
  }, [state, blogId]);
  // comment
  const handleDraftSave = () => {
    const isEditMode = state === "edit";
    const isAddMode = state === "add";

    const { title, description, tag, slug, authorName } = form.getValues();

    if (isEditMode) {
      const hasChanges =
        title !== initialData.title ||
        authorName !== initialData.authorName ||
        slug !== initialData.slug ||
        description !== initialData.description ||
        tag !== initialData.tag ||
        content !== initialData.content ||
        (thumbnail && thumbnail !== initialData.thumbnail);

      if (!hasChanges) {
        setShowAddBlogPanel(false);
        toast("No changes detected.");
        return;
      }
    }

    const formData = new FormData();
    formData.append("heading", title);
    formData.append("description", description);
    formData.append("tag", tag);
    formData.append("content", content);
    formData.append("slug", slug);
    formData.append("authorName", authorName);
    if (thumbnail instanceof File) {
      formData.append("thumbnail", thumbnail);
    }

    const url = isAddMode
      ? `${process.env.apiURL}/api/v1/blogs/createBlog`
      : `${process.env.apiURL}/api/v1/blogs/editBlog?id=${blogId}`;
    const method = isAddMode ? "post" : "put";

    if (title && description && tag && slug && authorName) {
      const config = {
        method,
        maxBodyLength: Infinity,
        url,
        headers: {
          "Content-Type": "multipart/form-data",
        },
        data: formData,
      };

      axios
        .request(config)
        .then((response) => {
          toast(`Blog ${isAddMode ? "created" : "updated"} successfully!`);
          getAllBlogs();
          setShowAddBlogPanel(false);

          if (isEditMode) {
            setInitialData({
              title,
              description,
              tag,
              content,
              thumbnail,
              authorName,
            });
          }

          if (isAddMode) {
            form.reset({
              title: "",
              description: "",
              tag: "",
              slug: "",
              authorName: "",
            });
            setContent("");
            setThumbnail(null);
            setThumbnailPreview(null);
          }
        })
        .catch((err) => {
          console.error("Failed to save draft", err);
          toast("Failed to save draft");
        });
    } else {
      toast(
        "Please fill the mandatory fields (Title,Description,Tag And Slug)"
      );
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => e.preventDefault()}
        className="space-y-4 text-black"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Blog Title</FormLabel>
              <FormControl>
                <Input {...field} disabled={isViewMode} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Blog Description</FormLabel>
              <FormControl>
                <Input {...field} disabled={isViewMode} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tag"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Blog Tag</FormLabel>
              <FormControl>
                <Input {...field} disabled={isViewMode} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Blog Slug</FormLabel>
              <FormControl>
                <Input {...field} disabled={isViewMode} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="authorName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Author Name</FormLabel>
              <FormControl>
                <Input {...field} disabled={isViewMode} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Thumbnail Upload & Preview */}
        {/* <div>
          <label htmlFor="thumbnail">Blog Thumbnail</label>
          {(thumbnailPreview ||
            (thumbnail && typeof thumbnail === "string")) && (
            <img
              src={thumbnailPreview || thumbnail}
              alt="Blog Thumbnail"
              className="w-48 h-auto rounded border border-gray-300 mt-2"
            />
          )}
          {!isViewMode && (
            <Input
              id="thumbnail"
              type="file"
              accept="image/*"
              className="mt-2"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setThumbnail(file);
                  setThumbnailPreview(URL.createObjectURL(file));
                }
              }}
            />
          )}
        </div> */}

        {/* {!isViewMode && (
          <div>
            <label htmlFor="content">Content</label>
            <textarea
              id="content"
              className="w-full border px-2 py-1 rounded text-sm cursor-pointer text-black mt-2"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
            />
          </div>
        )} */}

        <div className="mt-6 flex gap-x-5">
          <button
            type="button"
            className="bg-gradient-to-r from-[#140B49] to-[#140B49]/[0.72] text-white px-4 py-1.5 text-sm rounded"
            disabled={isViewMode}
            onClick={handleDraftSave}
          >
            Save Draft
          </button>
        </div>
      </form>
    </Form>
  );
}

export default BlogForm;
