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
function AdvisoryForm({
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
  const [slug, setSlug] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [initialData, setInitialData] = useState({});
  const [content, setContent] = useState("");
  const [tagOptions, setTagOptions] = useState([]);
  const form = useForm({
    defaultValues: {
      name: "",
      designation: "",

      picture: null,
      linkedIn: "",
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
      // getAllCategories(localStorage.getItem("authToken"));
    }
  }, [authToken]);
  const removeImage = (type) => {
    setImageFile(null);
    form.setValue("url", null);
  };

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
        url: `${process.env.apiURL}/api/v1/team/getMembers?type=AdvisoryTeam&id=${ID}&lang=${selectedLanguage}`,
        headers: {},
      };

      axios
        .request(config)
        .then((response) => {
          const data = response.data.data;
          console.log("Resource data:", data);

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
  // comment
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

      console.log(hasChanges, "bug on edit");
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
      ? `${process.env.apiURL}/api/v1/team/createMember?lang=${selectedLanguage}&type=advisoryTeam`
      : `${process.env.apiURL}/api/v1/team/editMember?lang=${selectedLanguage}&id=${ID}`;
    const method = isAddMode ? "post" : "put";
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }
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
            `Advisory Member ${isAddMode ? "created" : "updated"} successfully!`
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
          setLoading(false);
          toast("Failed to save Advisory Member", err);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
      toast(
        "Please fill the mandatory fields (name & designation) before saving the Resource"
      );
    }
  };

  // const getAllCategories = useCallback(
  //   (token) => {
  //     const config = {
  //       method: "get",
  //       maxBodyLength: Infinity,
  //       url: `${process.env.apiURL}/api/v1/admin/getAllCategories?slug=resources&lang=${selectedLanguage}`,
  //       headers: {
  //         Authorization: token,
  //       },
  //     };

  //     axios
  //       .request(config)
  //       .then((response) => {
  //         console.log(JSON.stringify(response.data));
  //         setTagOptions(response.data.data);
  //       })
  //       .catch((error) => {
  //         console.error("Error fetching categories:", error);
  //       });
  //   },
  //   [authToken]
  // );

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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} disabled={isViewMode} />
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
                <Input {...field} disabled={isViewMode} />
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
                <Input {...field} disabled={isViewMode} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* <FormField
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
        /> */}

        <div className="mt-6 flex gap-x-5">
          <button
            type="button"
            className="bg-gradient-to-r from-[#140B49] to-[#140B49]/[0.72] text-white px-4 py-1.5 text-sm rounded"
            disabled={loading}
            onClick={handleDraftSave}
          >
            Save Advisory Member
          </button>
        </div>
      </form>
    </Form>
  );
}

export default AdvisoryForm;
