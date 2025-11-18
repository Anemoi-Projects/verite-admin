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
  const appEnv = process.env.APP_ENV;
  const [authToken, setAuthToken] = useState("");

  useEffect(() => {
    if (window.localStorage.getItem("authToken")) {
      setAuthToken(localStorage.getItem("authToken"));
    }
  }, [authToken]);
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
      const api_url = `${process.env.apiURL}/api/v1/contents/getFooterById?id=${linkID}&lang=${selectedLanguage}`;
      axios
        .get(api_url)
        .then((response) => {
          const data = response.data.data;

          const formData = {
            key: data.key,
            title: data.title || "",
            url: data.url || data.externalURL || "",
            externalURL: data.url ? false : true,
            published: data.published ?? true, // this might also be undefined in root
            sections:
              data.sections?.map((section) => ({
                title: section.title || "",
                url: section.url || "",
                externalURL: section.externalURL ?? false,
                published: section.published, // ensure it's always a boolean
              })) || [],
          };

          form.reset(formData);

          setInitialData(formData);
        })
        .catch((error) => {
          console.error("Failed to fetch data", error);
        });
    }
  }, [state, linkID]);

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

    // Convert sections based on externalURL (externalURL)
    const transformedSections = sections.map((section) => {
      const { title, url, externalURL, published } = section;
      return { title, externalURL, url, published };
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
      url: `${process.env.apiURL}/api/v1/contents/editFooter?id=${linkID}&lang=${selectedLanguage}`,
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
                <Input
                  {...field}
                  disabled={
                    form.getValues("key") === "copyright" ? false : true
                  }
                />
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
              <div
                key={section.id}
                className="p-4 border rounded-md space-y-2 bg-gray-50"
              >
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

                <FormField
                  control={form.control}
                  name={`sections.${index}.published`}
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormLabel>Redirect to coming soon page</FormLabel>
                      <FormControl>
                        <Switch.Root
                          checked={!field.value}
                          onCheckedChange={(checked) =>
                            field.onChange(!checked)
                          }
                          disabled={isViewMode}
                          className="w-12 h-6 rounded-full cursor-pointer bg-gray-300 data-[state=checked]:bg-[#140B49] relative transition-colors duration-300 ease-in-out"
                        >
                          <Switch.Thumb
                            className="block w-5 h-5 bg-white rounded-full shadow-sm
                     transition-transform duration-300 ease-in-out
                     translate-x-0.5 data-[state=checked]:translate-x-6"
                          />
                        </Switch.Root>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            ))}
          </div>
        )}

        {/* Submit Button */}
        <div className="mt-6 flex gap-x-5">
          <button
            type="button"
            className="bg-gradient-to-r from-[#140B49] to-[#140B49]/[0.72] text-white px-4 py-1.5 text-sm rounded"
            disabled={isViewMode}
            onClick={handleDraftSave}
          >
            Save
          </button>
        </div>
      </form>
    </Form>
  );
}

export default FooterForm;
