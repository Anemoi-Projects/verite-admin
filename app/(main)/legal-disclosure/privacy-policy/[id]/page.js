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
import { useSearchParams } from "next/navigation";
const EditorComponent = dynamic(() => import("./EditorComponent"), {
  ssr: false,
});

export default function Page() {
  const params = useParams();
  const router = useRouter();
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
  const searchParams = useSearchParams();
  const selectedLanguage = searchParams.get("language");
  console.log(params, "data", selectedLanguage);
  const form = useForm({
    defaultValues: {
      heading: "",
      subHeading: "",
      media: null,
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
      url: `${process.env.apiURL}/api/v1/contents/getFooterPage?slug=/privacy-policy&lang=${selectedLanguage}`,
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
          subHeading: data.subHeading,
          media: data.media,
        });
        setBlogContent(data?.content);
        if (data.media) {
          setImagePreview(data.media);
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
      if (type === "media") {
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
      }
    }
  };

  const removeImage = (type) => {
    if (type === "media") {
      setImagePreview(null);
      setImageFile(null);
      form.setValue("media", null);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);

    const formData = new FormData();

    formData.append("heading", data.heading);
    formData.append("subHeading", data.subHeading);
    if (blogContent !== "") {
      console.log(blogContent);
      formData.append("content", blogContent);
    }
    if (imageFile) {
      formData.append("media", imageFile);
    }

    let config = {
      method: "put",
      maxBodyLength: Infinity,
      url: `${process.env.apiURL}/api/v1/contents/editFooterPage?id=${params?.id}`,
      headers: {
        Authorization: authToken,

        "Content-Type": "multipart/form-data",
      },
      data: formData,
    };
    axios
      .request(config)
      .then((response) => {
        toast.success("Privacy Policy updated successfully", {
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
        toast.success("Privacy Policy updated successfully", {
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
        <div className="flex gap-5">
          {" "}
          <button
            onClick={() => router.push("/legal-disclosure")}
            className="text-sm px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
          >
            ← Back
          </button>
          <h1 className="text-xl font-bold">Privacy Policy Editor</h1>
        </div>

        <div className="space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={form.handleSubmit(onSubmit)}
            disabled={loading || publishLoading}
          >
            {loading ? <ClipLoader size={20} /> : "Save "}
          </Button>
          {/* <Button
            type="button"
            onClick={publishBlog}
            disabled={loading || publishLoading}
          >
            {publishLoading ? <ClipLoader size={20} /> : "Publish"}
          </Button> */}
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
              <h2 className="text-xl font-semibold">Privacy Policy Settings</h2>
              {["heading", "subHeading"].map((fieldName) => (
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
              {imagePreview && (
                <div className="relative w-fit">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-32 w-32 rounded border object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage("media")}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              <label>Image</label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, "media")}
                disabled={isViewMode}
              />
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
}
