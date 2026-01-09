"use client";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ClipLoader } from "react-spinners";
function PartnerForm({ teamFormState, getAllTeamMembers, setShowTeamPanel }) {
  const [authToken, setAuthToken] = useState("");
  const [loading, setLoading] = useState(false);
  const { ID, state } = teamFormState;
  const isViewMode = state === "view";
  const [imageFile, setImageFile] = useState(null);
  const [initialData, setInitialData] = useState({});

  const form = useForm({
    defaultValues: {
      name: "",
      url: "",

      logo: null,
    },
  });

  useEffect(() => {
    if (window.localStorage.getItem("authToken")) {
      setAuthToken(localStorage.getItem("authToken"));
    }
  }, [authToken]);

  useEffect(() => {
    if (state === "add") {
      form.reset({
        name: "",
        url: "",

        logo: null,
      });
    } else if ((state === "edit" || state === "view") && ID) {
      const config = {
        method: "get",
        maxBodyLength: Infinity,
        url: `${process.env.apiURL}/api/v1/partner/getPartner?id=${ID}`,
        headers: {},
      };

      axios
        .request(config)
        .then((response) => {
          const data = response.data.data;
          console.log("Resource data:", data);

          form.reset({
            name: data.name || "",
            url: data.url || "",

            logo: data.logo || null,
          });

          setInitialData({
            name: data.name || "",
            url: data.url || "",

            logo: data.logo || null,
          });
        })
        .catch((error) => {
          console.error("Failed to fetch Partner data", error);
        });
    }
  }, [state, ID]);
  // comment
  const handleDraftSave = () => {
    setLoading(false);
    const isEditMode = state === "edit";
    const isAddMode = state === "add";

    const { name, url, logo } = form.getValues();

    if (isEditMode) {
      const { name, url, logo } = form.getValues();

      const hasChanges =
        name !== initialData.name ||
        url !== initialData.url ||
        (logo && logo.name !== initialData.logo);

      console.log(hasChanges, "bug on edit");
      if (!hasChanges) {
        setShowTeamPanel(false);
        toast.error("No changes detected.");
        setLoading(false);
        return;
      }
    }

    const formData = new FormData();

    formData.append("name", name);
    formData.append("url", url);

    if (imageFile) {
      formData.append("logo", imageFile);
    } else {
      formData.append("logo", logo);
    }

    const api_url = isAddMode
      ? `${process.env.apiURL}/api/v1/partner/createPartner`
      : `${process.env.apiURL}/api/v1/partner/updatePartner?id=${ID}`;
    const method = isAddMode ? "post" : "put";

    if (name && url && logo) {
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
        .then(() => {
          toast.success(
            `Partner ${isAddMode ? "created" : "updated"} successfully!`
          );
          getAllTeamMembers();
          setShowTeamPanel(false);

          if (isEditMode) {
            setInitialData({
              name,
              url,
              logo,
            });
          }

          if (isAddMode) {
            form.reset({
              name: "",
              url: "",
              logo: null,
            });
          }
        })
        .catch((err) => {
          toast("Failed to save Partner", err);
        });
      setLoading(false);
    } else {
      toast.error(
        "Please fill the mandatory fields (name & url) before saving the Partner"
      );
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-4 ">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isViewMode}
                  placeholder={"Enter partners name"}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {initialData.logo && !imageFile ? (
          <img src={initialData.logo} className="mt-3" />
        ) : imageFile ? (
          <img src={URL.createObjectURL(imageFile)} className="mt-3" />
        ) : null}

        <FormField
          control={form.control}
          name="logo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Logo</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="application/logo"
                  disabled={isViewMode}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    field.onChange(file);
                    setImageFile(file);
                  }}
                />
              </FormControl>
              <FormMessage />
              <FormDescription>
                Image you are uploading must be of size
                <strong> 120 × 30</strong>.{" "}
              </FormDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isViewMode}
                  placeholder={"Enter partners website URL"}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="mt-6 flex gap-x-5">
          <Button
            type="submit"
            className="theme-button w-full"
            disabled={isViewMode || loading}
            onClick={handleDraftSave}
          >
            {loading ? <ClipLoader color="white" size={25} /> : "Save Partner"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default PartnerForm;
