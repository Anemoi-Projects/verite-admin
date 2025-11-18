"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useParams } from "next/navigation";
import { Info } from "lucide-react";
import { Switch } from "radix-ui";
import dynamic from "next/dynamic";
const EditorComponent = dynamic(() => import("./EditorComponent"), {
  ssr: false,
});
function HeaderFooterForm({
  headerFooterFormState,
  getAllLinks,
  setHeaderFooterPanel,
  selectedLanguage,
}) {
  const { linkID, state, type } = headerFooterFormState;
  const appEnv = process.env.APP_ENV;
  const isViewMode = state === "view";
  const [slug, setSlug] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [initialData, setInitialData] = useState({});
  const [disclaimerData, setDisclaimerData] = useState("");
  const params = useParams();
  const [authToken, setAuthToken] = useState("");

  useEffect(() => {
    if (window.localStorage.getItem("authToken")) {
      setAuthToken(localStorage.getItem("authToken"));
    }
  }, [authToken]);
  const form = useForm({
    defaultValues: {
      title: "",
      disclaimer: "",
      url: "",
      externalURL: false,
      published: true,
    },
  });

  useEffect(() => {
    if (state === "add") {
      form.reset({
        title: "",
        url: "",
        externalURL: false,
        disclaimer: "",
        published: true,
      });
      setDisclaimerData("");
    } else if ((state === "edit" || state === "view") && linkID) {
      let api_url = `${process.env.apiURL}/api/v1/contents/getHeaderById?id=${linkID}&lang=${selectedLanguage}`;
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

          form.reset({
            title: data.title || "",
            disclaimer: data.disclaimer || "",
            url: data.url ? data.url : data.externalURL || "",
            externalURL: data.url ? false : true || false,
            published: data.published,
          });
          setDisclaimerData(data?.disclaimer || "");

          setInitialData({
            title: data.title || "",
            disclaimer: data.disclaimer || "",
            url: data.url ? data.url : data.externalURL || "",
            externalURL: data.url ? false : true || false,
            published: data.published,
          });
        })
        .catch((error) => {
          console.error("Failed to fetch data", error);
        });
    }
  }, [state, linkID]);
  // comment
  const handleDraftSave = () => {
    const isEditMode = state === "edit";

    const { title, url, externalURL, disclaimer, published } = form.getValues();

    if (isEditMode) {
      const hasChanges =
        title !== initialData.title ||
        url !== initialData.url ||
        externalURL !== initialData.externalURL ||
        published !== initialData.published ||
        (disclaimerData ?? "") !== (initialData.disclaimer ?? "");

      if (!hasChanges) {
        setHeaderFooterPanel(false);
        toast.error("No changes detected.");
        return;
      }
    }
    let data;
    if (externalURL) {
      data = JSON.stringify({
        title: title,
        externalURL: url,
        published: published,
        disclaimer: disclaimerData,
      });
    } else {
      data = JSON.stringify({
        title: title,
        url: url,
        published: published,
        disclaimer: disclaimerData,
      });
    }
    let api_url = `${process.env.apiURL}/api/v1/contents/editHeader?id=${linkID}&lang=${selectedLanguage}`;

    const method = "put";

    if (title && url) {
      const config = {
        method,
        maxBodyLength: Infinity,
        url: api_url,
        headers: {
          "Content-Type": "application/json",
          Authorization: authToken,
        },
        data: data,
      };

      axios
        .request(config)
        .then((response) => {
          toast.success(`Link updated successfully!`);
          getAllLinks();
          setHeaderFooterPanel(false);

          if (isEditMode) {
            setInitialData({
              title,
              url,
              externalURL,
              published,
              disclaimer,
            });
            setDisclaimerData("");
          }

          if (isAddMode) {
            form.reset({
              title: "",
              url: "",
              externalURL: false,
              published: true,
            });
            setDisclaimerData("");
          }
        })
        .catch((err) => {
          // toast("Failed to save Updated Data");
        });
    } else {
      toast("Please fill the mandatory fields (Title & Link) before Saving ");
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
          name={"url"}
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL/External Link</FormLabel>
              <FormControl>
                <Input {...field} disabled={isViewMode} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="externalURL"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start text-xs  pt-0 ">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>This is an External Link/URL</FormLabel>
              </div>
            </FormItem>
          )}
        />

        <div className="flex items-center gap-4">
          <Switch.Root
            checked={!form.watch("published")}
            onCheckedChange={(checked) => form.setValue("published", !checked)}
            className="w-12 h-6 rounded-full cursor-pointer bg-gray-300 data-[state=checked]:bg-[#140B49] relative transition-colors duration-300 ease-in-out"
          >
            <Switch.Thumb
              className="block w-5 h-5 bg-white rounded-full shadow-sm
                     transition-transform duration-300 ease-in-out
                     translate-x-0.5 data-[state=checked]:translate-x-6"
            />
          </Switch.Root>
          <label className="text-sm font-medium">
            Redirect to Coming Soon Page
          </label>
        </div>
        {initialData?.disclaimer && (
          <FormField
            control={form.control}
            name="disclaimer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Disclaimer</FormLabel>
                <FormControl>
                  <div className="w-full min-h-[500px]">
                    <EditorComponent
                      data={disclaimerData}
                      setEditorData={setDisclaimerData}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

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

export default HeaderFooterForm;
