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
import { Textarea } from "@/components/ui/textarea";
function SEOForm({
  SEOFormState,
  getSinglePageData,
  setShowAddSEOPanel,
  language,
}) {
  const { pageID, state } = SEOFormState;
  const isViewMode = state === "view";
  const [slug, setSlug] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [initialData, setInitialData] = useState({});
  const [content, setContent] = useState("");
  const [authToken, setAuthToken] = useState("");
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setAuthToken(token);
    }
  }, [authToken]);
  const form = useForm({
    defaultValues: {
      seoTitle: "",
      seoDescription: "",
      tags: [],
      seoKeywords: [],
      ogTitle: "",
      ogDescription: "",
    },
  });

  useEffect(() => {
    if ((state === "edit" || state === "view") && pageID) {
      const config = {
        method: "get",
        maxBodyLength: Infinity,
        url: `${process.env.apiURL}/api/v1/contents/getPages?pageID=${pageID}&lang=${language}`,
        headers: {},
      };

      axios
        .request(config)
        .then((response) => {
          const data = response.data.data;

          form.reset({
            seoTitle: data.seoTitle || "",
            seoDescription: data.seoDescription || "",
            tags: data.tags?.join(", ") || "",
            seoKeywords: data.seoKeywords?.join(", ") || "",
            ogTitle: data.ogTitle || "",
            ogDescription: data.ogDescription || "",
          });

          setInitialData({
            seoTitle: data.seoTitle || "",
            seoDescription: data.seoDescription || "",
            tags: data.tags?.join(", ") || "",
            seoKeywords: data.seoKeywords?.join(", ") || "",
            ogTitle: data.ogTitle || "",
            ogDescription: data.ogDescription || "",
          });
        })
        .catch((error) => {
          console.error("Failed to fetch SEO data", error);
        });
    }
  }, [state, pageID]);

  const handleDraftSave = () => {
    const isEditMode = state === "edit";

    const {
      seoTitle,
      seoDescription,
      tags,
      seoKeywords,
      ogTitle,
      ogDescription,
    } = form.getValues();

    if (isEditMode) {
      const hasChanges =
        seoTitle !== initialData.seoTitle ||
        seoDescription !== initialData.seoDescription ||
        tags !== initialData.tags ||
        seoKeywords !== initialData.seoKeywords ||
        ogTitle !== initialData.ogTitle ||
        ogDescription !== initialData.ogDescription;

      if (!hasChanges) {
        setShowAddSEOPanel(false);
        toast.error("No changes detected.");
        return;
      }
    }

    // const formData = new FormData();
    // Object.entries(formData).forEach(([key, value]) => {
    //   if (typeof value === "string" && value.includes(",")) {
    //     const arrayValue = value
    //       .split(",")
    //       .map((item) => item.trim())
    //       .filter(Boolean);
    //     formData.append(key, JSON.stringify(arrayValue));
    //   } else {
    //     formData.append(key, value);
    //   }
    // });
    let data = JSON.stringify({
      seoTitle: seoTitle,
      seoDescription: seoDescription,
      seoKeywords: seoKeywords?.split(",")?.map((item) => item.trim()) || [],
      tags: tags?.split(",")?.map((item) => item.trim()) || [],
      ogTitle: ogTitle,
      ogDescription: ogDescription,
    });

    if (
      seoTitle &&
      seoDescription &&
      tags.length > 1 &&
      seoKeywords?.length > 1 &&
      ogTitle &&
      ogDescription
    ) {
      const config = {
        method: "put",
        maxBodyLength: Infinity,
        url: `${process.env.apiURL}/api/v1/admin/editSEO?pageID=${pageID}`,
        headers: {
          Authorization: authToken,
          "Content-Type": "application/json",
        },
        data: data,
      };

      axios
        .request(config)
        .then((response) => {
          toast.success(`SEO updated successfully!`, {
            className: "bg-green-700 text-white",
          });
          getSinglePageData();
          setShowAddSEOPanel(false);

          if (isEditMode) {
            setInitialData({
              seoTitle,
              seoDescription,
              tags,
              seoKeywords,
              ogTitle,
              ogDescription,
            });
          }
        })
        .catch((err) => {
          console.error("Failed to update SEO Settings", err);
          toast.error("Failed to update SEO Settings");
        });
    } else {
      toast.error("Please fill the mandatory fields (all fields)");
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
          name="seoTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SEO Title</FormLabel>
              <FormControl>
                <Input {...field} disabled={isViewMode} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="seoDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SEO Description</FormLabel>
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

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SEO Tags</FormLabel>
              <FormControl>
                <Input {...field} disabled={isViewMode} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="seoKeywords"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SEO Keywords</FormLabel>
              <FormControl>
                <Input {...field} disabled={isViewMode} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="ogTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>OG Title</FormLabel>
              <FormControl>
                <Input {...field} disabled={isViewMode} />
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

        <div className="mt-6 flex gap-x-5">
          <button
            type="button"
            className="bg-gradient-to-r from-[#140B49] to-[#140B49]/[0.72] text-white px-4 py-1.5 text-sm rounded"
            disabled={isViewMode}
            onClick={handleDraftSave}
          >
            Update
          </button>
        </div>
      </form>
    </Form>
  );
}

export default SEOForm;
