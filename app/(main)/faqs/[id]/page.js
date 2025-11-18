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

export default function Page() {
  const params = useParams();
  const [singleBlogData, setSingleBlogData] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewAuthor, setImagePreviewAuthor] = useState(null);
  const [imageFileAuthor, setImageFileAuthor] = useState(null);

  const [isViewMode, setIsViewMode] = useState(false);

  const form = useForm({
    defaultValues: {
      heading: "",
      slug: "",
      description: "",
      content: "",
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

  // const getSingleBlogData = useCallback(() => {
  //   if (!params?.id) return;
  //   let config = {
  //     method: "get",
  //     maxBodyLength: Infinity,
  //     url: `${process.env.apiURL}/api/v1/blogs/getBlog?id=${params?.id}&lang="en"`,
  //     headers: {},
  //   };

  //   axios
  //     .request(config)
  //     .then((response) => {
  //       const data = response.data.data;
  //       setSingleBlogData(data);
  //       form.reset({
  //         heading: data.heading,
  //         slug: data.slug,
  //         description: data.description,
  //         content: data.content,
  //         thumbnail: data.thumbnail,
  //         authorName: data.authorName,
  //         authorBio: data.authorBio,
  //         authorImage: data.authorImage,
  //         seoTitle: data.seoTitle,
  //         seoDescription: data.seoDescription,
  //         ogTitle: data.ogTitle,
  //         ogDescription: data.ogDescription,
  //         status: data.status,
  //         tags: data.tags?.join(", ") || "",
  //         seoKeywords: data.seoKeywords?.join(", ") || "",
  //       });
  //       if (data.thumbnail) {
  //         setImagePreview(data.thumbnail);
  //       }
  //       if (data.authorImage) {
  //         setImagePreviewAuthor(data.authorImage);
  //       }
  //     })
  //     .catch(console.error);
  // }, [params?.id, form]);

  // useEffect(() => {
  //   getSingleBlogData();
  // }, [getSingleBlogData]);

  const handleImageChange = (e, type) => {
    console.log("Image changed:", e, type);
    const file = e.target.files[0];
    if (file) {
      if (type === "thumbnail") {
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
      } else {
        setImageFileAuthor(file);
        setImagePreviewAuthor(URL.createObjectURL(file));
      }
    }
  };

  const removeImage = (type) => {
    if (type === "thumbnail") {
      setImagePreview(null);
      setImageFile(null);
      form.setValue("thumbnail", null);
    } else {
      setImagePreviewAuthor(null);
      setImageFileAuthor(null);
      form.setValue("authorImage", null);
    }
  };

  const onSubmit = async (data) => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === "string" && value.includes(",")) {
        const arrayValue = value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
        formData.append(key, JSON.stringify(arrayValue));
      } else {
        formData.append(key, value);
      }
    });

    if (imageFile) {
      formData.append("thumbnail", imageFile);
    }

    if (imageFileAuthor) {
      formData.append("authorImage", imageFileAuthor);
    }

    let config = {
      method: "put",
      maxBodyLength: Infinity,
      url: `${process.env.apiURL}/api/v1/blogs/editBlog?id=${params?.id}`,
      headers: {
        // Authorization: authToken,

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
      })
      .catch(console.error);
  };

  return (
    <div className="bg-white text-black w-full">
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <h1 className="text-xl font-bold">FAQ</h1>
      </header>

      <main className=" p-6 gap-6">
        <Form {...form}>
          <form
            id="blog-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="gap-6 w-full"
          >
            <div className="w-full border rounded-md p-4 space-y-4 max-h-[720px] overflow-y-auto">
              {["question"].map((fieldName) => (
                <FormField
                  key={fieldName}
                  control={form.control}
                  name={fieldName}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {fieldName.replace(/([A-Z])/g, " $1")}
                      </FormLabel>
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
                name="answer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Answer</FormLabel>
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
            </div>
          </form>
        </Form>
        <div className="space-x-2 mt-5">
          {/* <Button
            type="button"
            variant="outline"
            onClick={form.handleSubmit(onSubmit)}
          >
            Save FAQ
          </Button> */}
          <Button variant="outline" className={"bg-black text-white"}>
            Save FAQ
          </Button>
        </div>
      </main>
    </div>
  );
}
