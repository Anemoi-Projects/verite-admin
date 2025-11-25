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
import { Button } from "@/components/ui/button";
const EditorComponent = dynamic(() => import("./EditorComponent"), {
  ssr: false,
});
function HeaderFooterForm({
  headerFooterFormState,
  getAllLinks,
  setHeaderFooterPanel,
  selectedLanguage,
}) {
  const { linkID, state } = headerFooterFormState;
  const isViewMode = state === "view";
  const [initialData, setInitialData] = useState({});
  const [disclaimerData, setDisclaimerData] = useState("");
  const [authToken, setAuthToken] = useState("");
  const form = useForm({
    defaultValues: {
      title: "",
      disclaimer: "",
      url: "",
      externalURL: false,
      published: true,
    },
  });

  const getHeaderData = () => {
    let api_url = `${process.env.apiURL}/api/v1/contents/getHeaderById?id=${linkID}`;
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
  };

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
        url: url,
        published: published,
        disclaimer: disclaimerData,
        externalURL: true,
      });
    } else {
      data = JSON.stringify({
        title: title,
        url: url,
        published: published,
      });
    }
    let api_url = `${process.env.apiURL}/api/v1/contents/editHeader?id=${linkID}`;

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
          form.reset();
          setInitialData({
            title,
            url,
            externalURL,
            published,
            disclaimer,
          });
          setDisclaimerData("");
        })
        .catch((err) => {
          toast.error("Failed to save Updated Data");
        });
    } else {
      toast.error(
        "Please fill the mandatory fields (Title & Link) before Saving "
      );
    }
  };

  useEffect(() => {
    if (window.localStorage.getItem("authToken")) {
      setAuthToken(localStorage.getItem("authToken"));
    }
  }, [authToken]);

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
      getHeaderData();
    }
  }, [state, linkID]);
  // comment

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
                <Input
                  {...field}
                  disabled={isViewMode}
                  placeholder={"Enter Title"}
                />
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
                <Input
                  {...field}
                  disabled={isViewMode}
                  placeholder="Enter URL"
                />
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
          <Button
            type="submit"
            className={"theme-button w-full"}
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

export default HeaderFooterForm;
