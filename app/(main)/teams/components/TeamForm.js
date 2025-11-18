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
import { Button } from "@/components/ui/button";
function TeamForm({
  teamFormState,
  getAllTeamMembers,
  setShowTeamPanel,
  selectedLanguage,
}) {
  const [authToken, setAuthToken] = useState("");
  const [loading, setLoading] = useState(false);
  const { ID, state } = teamFormState;
  const isViewMode = state === "view";
  const [imageFile, setImageFile] = useState(null);
  const [initialData, setInitialData] = useState({});

  const form = useForm({
    defaultValues: {
      name: "",
      designation: "",
      picture: null,
      linkedIn: "",
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
        designation: "",
        picture: null,
        linkedIn: "",
      });
    } else if ((state === "edit" || state === "view") && ID) {
      const config = {
        method: "get",
        maxBodyLength: Infinity,
        url: `${process.env.apiURL}/api/v1/team/getMembers?type=internalTeam&id=${ID}&lang=${selectedLanguage}`,
        headers: {},
      };

      axios
        .request(config)
        .then((response) => {
          const data = response.data.data;
          form.reset({
            name: data.name || "",
            designation: data.designation || "",
            picture: data.picture || null,
            linkedIn: data.linkedIn || "",
          });

          setInitialData({
            name: data.name || "",
            designation: data.designation || "",
            picture: data.picture || null,
            linkedIn: data.linkedIn || "",
          });
        })
        .catch((error) => {
          console.error("Failed to fetch Resource data", error);
        });
    }
  }, [state, ID]);

  const handleDraftSave = () => {
    if (loading) return;
    setLoading(true);
    const isEditMode = state === "edit";
    const isAddMode = state === "add";

    const { name, designation, picture, linkedIn } = form.getValues();

    if (isEditMode) {
      const hasChanges =
        name !== initialData.name ||
        designation !== initialData.designation ||
        linkedIn !== initialData.linkedIn ||
        (picture && picture.name !== initialData.picture);
      if (!hasChanges) {
        setLoading(false);
        setShowTeamPanel(false);
        toast.error("No changes detected.");
        return;
      }
    }

    const formData = new FormData();

    formData.append("name", name);
    formData.append("designation", designation);

    if (imageFile) {
      formData.append("picture", imageFile);
    } else {
      formData.append("picture", picture);
    }
    if (linkedIn) {
      formData.append("linkedIn", linkedIn);
    }

    const api_url = isAddMode
      ? `${process.env.apiURL}/api/v1/team/createMember?type=internalTeam`
      : `${process.env.apiURL}/api/v1/team/editMember?id=${ID}&type=internalTeam`;
    const method = isAddMode ? "post" : "put";

    if (name && designation && picture) {
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
          toast.success(
            `Team Member ${isAddMode ? "created" : "updated"} successfully!`
          );
          getAllTeamMembers();
          setShowTeamPanel(false);

          if (isEditMode) {
            setInitialData({
              name,
              designation,
              linkedIn,
              picture,
            });
          }

          if (isAddMode) {
            form.reset({
              name: "",
              designation: "",
              linkedIn: "",
              picture: null,
            });
          }
        })
        .catch((err) => {
          toast("Failed to save Team Member", err);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      toast(
        "Please fill the mandatory fields (name & designation) before saving the Resource"
      );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
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
                  placeholder="Enter Name"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {initialData.picture && !imageFile ? (
          <img className="w-[300px] h-[200px]" src={initialData.picture} />
        ) : imageFile ? (
          <img
            className="w-[300px] h-[200px]"
            src={URL.createObjectURL(imageFile)}
          />
        ) : null}

        <FormField
          control={form.control}
          name="picture"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Picture</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="application/picture"
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

        <FormField
          control={form.control}
          name="designation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Designation</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isViewMode}
                  placeholder="Enter designation"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="linkedIn"
          render={({ field }) => (
            <FormItem>
              <FormLabel>LinkedIn</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isViewMode}
                  placeholder="Enter LinkedIm URL"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="mt-6 flex gap-x-5">
          <Button
            type="button"
            className="theme-button w-full"
            disabled={loading}
            onClick={handleDraftSave}
          >
            Save Team Member
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default TeamForm;
