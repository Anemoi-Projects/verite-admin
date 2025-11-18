"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
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
import Select from "react-select";
function FAQCategoryForm({
  blogCategoryForm,
  getAllBlogCategories,
  setShowBlogCategoryPanel,
  selectedLanguage,
}) {
  const { id, state } = blogCategoryForm;
  const isViewMode = state === "view";
  const [slug, setSlug] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [initialData, setInitialData] = useState({});
  const [content, setContent] = useState("");
  const [tagOptions, setTagOptions] = useState([]);
  const [authToken, setAuthToken] = useState("");
  const form = useForm({
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (state === "add") {
      form.reset({
        name: "",
      });
    } else if ((state === "edit" || state === "view") && id) {
      const config = {
        method: "get",
        maxBodyLength: Infinity,
        url: `${process.env.apiURL}/api/v1/admin/getCategoryById?id=${id}`,
        headers: {},
      };

      axios
        .request(config)
        .then((response) => {
          const data = response.data.data;

          form.reset({
            name: data.name || "",
          });

          setInitialData({
            name: data.name || "",
          });
        })
        .catch((error) => {
          console.error("Failed to fetch FAQ Category data", error);
        });
    }
  }, [state, id]);
  // comment
  const handleDraftSave = () => {
    const isEditMode = state === "edit";
    const isAddMode = state === "add";

    const { name } = form.getValues();

    if (isEditMode) {
      const hasChanges = name !== initialData.name;

      if (!hasChanges) {
        setShowBlogCategoryPanel(false);
        toast.error("No changes detected.");
        return;
      }
    }
    let data;
    if (isAddMode) {
      data = JSON.stringify({
        name: name,
        slug: "faq",
      });
    } else {
      data = JSON.stringify({
        name: name,
      });
    }

    const url = isAddMode
      ? `${process.env.apiURL}/api/v1/admin/createCategory?lang=${selectedLanguage}`
      : `${process.env.apiURL}/api/v1/admin/updateCategory?id=${id}&lang=${selectedLanguage}`;
    const method = isAddMode ? "post" : "put";

    if (name) {
      const config = {
        method,
        maxBodyLength: Infinity,
        url,
        headers: {
          Authorization: authToken,
          "Content-Type": "application/json",
        },
        data: data,
      };

      axios
        .request(config)
        .then((response) => {
          toast.success(
            `FAQ Category ${isAddMode ? "created" : "updated"} successfully!`
          );
          getAllBlogCategories();
          setShowBlogCategoryPanel(false);

          if (isEditMode) {
            setInitialData({
              name,
            });
          }

          if (isAddMode) {
            form.reset({
              name: "",
            });
          }
        })
        .catch((err) => {
          toast("Failed to save FAQ Category");
        });
    } else {
      toast(
        "Please fill the mandatory fields (name) before saving the FAQ Category"
      );
    }
  };
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setAuthToken(token);
      getAllCategories(token);
    }
  }, []);
  const getAllCategories = useCallback(
    (token) => {
      const config = {
        method: "get",
        maxBodyLength: Infinity,
        url:
          "https://21-nexus-web-be.vercel.app/api/v1/admin/getAllCategories?slug=blog&lang=" +
          selectedLanguage,
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
    <Form {...form}>
      <form
        onSubmit={(e) => e.preventDefault()}
        className="space-y-4 text-black"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Name</FormLabel>
              <FormControl>
                <Input {...field} disabled={isViewMode} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="mt-6 flex gap-x-5">
          <button
            type="button"
            className="bg-gradient-to-r from-[#140B49] to-[#140B49]/[0.72] text-white px-4 py-1.5 text-sm rounded"
            disabled={isViewMode}
            onClick={handleDraftSave}
          >
            Save FAQ Category
          </button>
        </div>
      </form>
    </Form>
  );
}

export default FAQCategoryForm;
