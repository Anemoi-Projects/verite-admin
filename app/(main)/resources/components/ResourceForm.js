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
function ResourceForm({
  resourceFormState,
  getAllResources,
  setShowResourcePanel,
  selectedLanguage,
}) {
  const [authToken, setAuthToken] = useState("");

  const { resourceID, state } = resourceFormState;
  const isViewMode = state === "view";
  const [imageFile, setImageFile] = useState(null);
  const [slug, setSlug] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [initialData, setInitialData] = useState({});
  const [content, setContent] = useState("");
  const [tagOptions, setTagOptions] = useState([]);
  const form = useForm({
    defaultValues: {
      title: "",
      buttonName: "",
      tag: [],
      pdf: null,
    },
  });

  const handleImageChange = (e, type) => {
    console.log("Image changed:", e, type);
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // setImagePreview(URL.createObjectURL(file));
    }
  };
  useEffect(() => {
    if (window.localStorage.getItem("authToken")) {
      setAuthToken(localStorage.getItem("authToken"));
      getAllCategories(localStorage.getItem("authToken"));
    }
  }, [authToken]);
  const removeImage = (type) => {
    setImageFile(null);
    form.setValue("url", null);
  };

  useEffect(() => {
    if (state === "add") {
      form.reset({
        title: "",
        buttonName: "",
        tag: [],
        pdf: null,
      });
    } else if ((state === "edit" || state === "view") && resourceID) {
      const config = {
        method: "get",
        maxBodyLength: Infinity,
        url: `${process.env.apiURL}/api/v1/resources/getResourceById?id=${resourceID}&lang=${selectedLanguage}`,
        headers: {},
      };

      axios
        .request(config)
        .then((response) => {
          const data = response.data.data;
          console.log("Resource data:", data);

          form.reset({
            title: data.title || "",
            buttonName: data.buttonName || "",
            tag: data.tag?.join(", ") || "",

            pdf: data.url || null,
          });

          setInitialData({
            title: data.title || "",
            buttonName: data.buttonName || "",
            tag: data.tag?.join(", ") || "",
            pdf: data.url || null,
          });
        })
        .catch((error) => {
          console.error("Failed to fetch Resource data", error);
        });
    }
  }, [state, resourceID]);
  // comment
  const handleDraftSave = () => {
    const isEditMode = state === "edit";
    const isAddMode = state === "add";

    const { title, buttonName, tag, pdf } = form.getValues();

    if (isEditMode) {
      const { title, buttonName, tag, pdf } = form.getValues();

      const hasChanges =
        title !== initialData.title ||
        buttonName !== initialData.buttonName ||
        tag !== initialData.tag ||
        (pdf && pdf.name !== initialData.url);

      console.log(hasChanges, "bug on edit");
      if (!hasChanges) {
        setShowResourcePanel(false);
        toast.error("No changes detected.");
        return;
      }
    }

    const formData = new FormData();

    formData.append("title", title);
    formData.append("buttonName", buttonName);
    if (imageFile) {
      formData.append("pdf", imageFile);
    } else {
      formData.append("pdf", pdf);
    }
    let updatedTagArray;
    if (Array.isArray(tag)) {
      updatedTagArray = [...tag];
    } else if (typeof tag === "string") {
      updatedTagArray = tag.split(",").map((t) => t.trim());
    }
    formData.append("tag", JSON.stringify(updatedTagArray));
    const api_url = isAddMode
      ? `${process.env.apiURL}/api/v1/resources/addResource?lang=${selectedLanguage}`
      : `${process.env.apiURL}/api/v1/resources/editResourceById?id=${resourceID}&lang=${selectedLanguage}`;
    const method = isAddMode ? "post" : "put";

    if (title && buttonName && pdf && tag) {
      const config = {
        method,
        maxBodyLength: Infinity,
        url: api_url,
        headers: {
          Authorization: authToken,
          "Content-Type": "multipart/form-data",
        },
        data: formData,
      };

      axios
        .request(config)
        .then((response) => {
          toast(`Resource ${isAddMode ? "created" : "updated"} successfully!`);
          getAllResources();
          setShowResourcePanel(false);

          if (isEditMode) {
            setInitialData({
              title,
              buttonName,
              tag,
              url,
            });
          }

          if (isAddMode) {
            form.reset({
              title: "",
              buttonName: "",
              tag: [],
              pdf: null,
            });
          }
        })
        .catch((err) => {
          toast("Failed to save Resource");
        });
    } else {
      toast(
        "Please fill the mandatory fields (title & buttonName) before saving the Resource"
      );
    }
  };

  const getAllCategories = useCallback(
    (token) => {
      const config = {
        method: "get",
        maxBodyLength: Infinity,
        url: `${process.env.apiURL}/api/v1/admin/getAllCategories?slug=resources&lang=${selectedLanguage}`,
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

  const selectOptions = tagOptions.map((tag) => ({
    value: tag._id,
    label: `${tag.name} (${tag.slug})`,
  }));
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
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} disabled={isViewMode} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="buttonName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Button Name</FormLabel>
              <FormControl>
                <Input {...field} disabled={isViewMode} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {initialData.pdf && !imageFile && (
          <div className="mt-2 text-sm text-blue-600 underline">
            <a href={initialData.pdf} target="_blank" rel="noopener noreferrer">
              View existing PDF
            </a>
          </div>
        )}

        <FormField
          control={form.control}
          name="pdf"
          render={({ field }) => (
            <FormItem>
              <FormLabel>PDF Upload</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="application/pdf"
                  disabled={isViewMode}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    field.onChange(file);
                    setImageFile(file);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* 
        <FormField
          control={form.control}
          name="tag"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Resource Tags</FormLabel>
              <FormControl>
                <Input {...field} disabled={isViewMode} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        /> */}
        <FormField
          control={form.control}
          name="tag"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Resource Tags</FormLabel>
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

        <div className="mt-6 flex gap-x-5">
          <button
            type="button"
            className="bg-gradient-to-r from-[#140B49] to-[#140B49]/[0.72] text-white px-4 py-1.5 text-sm rounded"
            disabled={isViewMode}
            onClick={handleDraftSave}
          >
            Save Resource
          </button>
        </div>
      </form>
    </Form>
  );
}

export default ResourceForm;
