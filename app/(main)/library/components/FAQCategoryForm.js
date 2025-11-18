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
import { Button } from "@/components/ui/button";
import { ClipLoader } from "react-spinners";
function FAQCategoryForm({
  faqCategoryForm,
  getAllFaqCategories,
  setShowFaqCategoryPanel,
}) {
  const { id, state } = faqCategoryForm;
  const isViewMode = state === "view";

  const [initialData, setInitialData] = useState({});
  const [authToken, setAuthToken] = useState("");
  const [loading, setLoading] = useState(false);
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
    setLoading(true);
    const isEditMode = state === "edit";
    const isAddMode = state === "add";

    const { name } = form.getValues();

    if (isEditMode) {
      const hasChanges = name !== initialData.name;

      if (!hasChanges) {
        setShowFaqCategoryPanel(false);
        toast.error("No changes detected.");
        setLoading(false);
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
      ? `${process.env.apiURL}/api/v1/admin/createCategory`
      : `${process.env.apiURL}/api/v1/admin/updateCategory?id=${id}`;
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
          getAllFaqCategories();
          setShowFaqCategoryPanel(false);

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
          setLoading(false);
        })
        .catch((err) => {
          toast("Failed to save FAQ Category");
        });
      setLoading(false);
    } else {
      toast(
        "Please fill the mandatory fields (name) before saving the FAQ Category"
      );
      setLoading(false);
    }
  };
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setAuthToken(token);
    }
  }, []);

  return (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isViewMode}
                  placeholder="Enter category name"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="button"
          disabled={isViewMode || loading}
          className="theme-button w-full"
          onClick={handleDraftSave}
        >
          {loading ? (
            <ClipLoader size={25} color="white" />
          ) : (
            "Save FAQ Category"
          )}
        </Button>
      </form>
    </Form>
  );
}

export default FAQCategoryForm;
