"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm, useFieldArray } from "react-hook-form";
import { useParams } from "next/navigation";
import { Info } from "lucide-react";
import { Switch } from "radix-ui";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
function FooterForm({
  headerFooterFormState,
  getAllLinks,
  setHeaderFooterPanel,
  selectedLanguage,
}) {
  const { linkID, state } = headerFooterFormState;
  const isViewMode = state === "view";
  const isEditMode = state === "edit";
  const isAddMode = state === "add";
  const [authToken, setAuthToken] = useState("");
  const [initialData, setInitialData] = useState({});
  const form = useForm({
    defaultValues: {
      key: "",
      title: "",
      url: "",
      externalURL: false,
      sections: [],
      published: true,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "sections",
  });

  const getFooterData = () => {
    const api_url = `${process.env.apiURL}/api/v1/contents/getFooterById?id=${linkID}`;
    const config = {
      method: "get",
      maxBodyLength: Infinity,
      url: api_url,
      headers: {
        Authorization: authToken,
      },
    };

    axios
      .request(config)
      .then((response) => {
        const data = response.data.data;
        console.log(data.key);
        const formData = {
          key: data.key,
          title: data.title || "",
          url: data.url || "",
          published: data.published ?? true,
          sections:
            data.sections?.map((section) => ({
              title: section.title || "",
              url: section.url || "",
              published: section.published,
              _id: section?._id,
            })) || [],
        };

        form.reset(formData);

        setInitialData(formData);
      })
      .catch((error) => {
        console.error("Failed to fetch data", error);
      });
  };

  const handleDraftSave = () => {
    const { title, url, externalURL, sections, published, key } =
      form.getValues();

    if (isEditMode) {
      const hasChanges =
        title !== initialData.title ||
        url !== initialData.url ||
        externalURL !== initialData.externalURL ||
        published !== initialData.published ||
        JSON.stringify(sections) !== JSON.stringify(initialData.sections);
      if (!hasChanges) {
        setHeaderFooterPanel(false);
        toast.error("No changes detected.");
        return;
      }
    }

    if (!title || !url) {
      toast("Please fill the mandatory fields (Title & Link) before Saving ");
      return;
    }

    const transformedSections = sections.map((section) => {
      const { title, url, published, _id } = section;
      return { title, url, published, _id };
    });

    const payload = {
      title,
      url,
      sections: transformedSections,
      published: published,
    };

    const config = {
      method: "put",
      maxBodyLength: Infinity,
      url: `${process.env.apiURL}/api/v1/contents/editFooter?id=${linkID}`,
      headers: { "Content-Type": "application/json", Authorization: authToken },
      data: JSON.stringify(payload),
    };

    axios
      .request(config)
      .then(() => {
        toast.success("Link updated successfully!");
        getAllLinks();
        setHeaderFooterPanel(false);
        if (isEditMode) {
          setInitialData({ title, url, externalURL, sections });
        }
        if (isAddMode) {
          form.reset({
            title: "",
            url: "",
            externalURL: false,
            sections: [],
            published: true,
            key: "",
          });
        }
      })
      .catch((err) => {
        console.error("Error updating link", err);
        toast.error("Failed to save data.");
      });
  };

  useEffect(() => {
    if (window.localStorage.getItem("authToken")) {
      setAuthToken(localStorage.getItem("authToken"));
    }
  }, [authToken]);

  useEffect(() => {
    if (isAddMode) {
      form.reset({
        title: "",
        url: "",
        externalURL: false,
        sections: [],
        published: true,
        key: "",
      });
    } else if ((isEditMode || isViewMode) && linkID) {
      getFooterData();
    }
  }, [state, linkID]);

  return (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>

              <FormControl>
                <Input {...field} placeholder="Enter title" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Sections Editing */}
        {fields?.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Sections</h3>
            {fields.map((section, index) => (
              <Card key={section.id}>
                <CardContent className="space-y-3">
                  <FormField
                    control={form.control}
                    name={`sections.${index}.title`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Link Title</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={
                              isViewMode || initialData?.title === "Socials"
                            }
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`sections.${index}.url`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Link URL</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isViewMode} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Submit Button */}
        <div className="mt-6 flex gap-x-5">
          <Button
            type="submit"
            className="theme-button w-full"
            disabled={isViewMode}
            onClick={handleDraftSave}
          >
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default FooterForm;
