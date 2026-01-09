"use client";

import { Button } from "@/components/ui/button";
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
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ClipLoader } from "react-spinners";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  designation: z.string().min(1, "Designation is required"),
  linkedIn: z.string().url("Enter a valid LinkedIn URL").optional(),
  picture: z.any().optional(),
});

function TeamForm({
  teamFormState,
  getAllTeamMembers,
  setShowTeamPanel,
  selectedLanguage,
}) {
  const { ID, state } = teamFormState;
  const isViewMode = state === "view";
  const isAddMode = state === "add";
  const isEditMode = state === "edit";

  const [authToken, setAuthToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      designation: "",
      linkedIn: "",
      picture: null,
    },
  });

  const handleImageChange = (file) => {
    if (!file) return;

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      if (img.width !== 150 || img.height !== 150) {
        toast.error("Image must be exactly 150 × 150 pixels.");
        URL.revokeObjectURL(url);
        return;
      }

      setImageFile(file);
      setImagePreview(url);
    };

    img.onerror = () => {
      toast.error("Invalid image.");
      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  const hasChanges = (vals) => {
    return (
      vals.name !== initialData.name ||
      vals.designation !== initialData.designation ||
      vals.linkedIn !== initialData.linkedIn ||
      imageFile !== null
    );
  };

  const handleSave = (values) => {
    if (loading) return;
    setLoading(true);

    if (!values.name || !values.designation) {
      toast.error("Name & Designation are required.");
      setLoading(false);
      return;
    }

    if (isEditMode && !hasChanges(values)) {
      toast.error("No changes detected.");
      setShowTeamPanel(false);
      setLoading(false);
      return;
    }

    const fd = new FormData();

    if (isAddMode) {
      fd.append("name", values.name);
      fd.append("designation", values.designation);
      if (values.linkedIn) fd.append("linkedIn", values.linkedIn);
    }

    if (isEditMode) {
      if (values.name !== initialData.name) fd.append("name", values.name);

      if (values.designation !== initialData.designation)
        fd.append("designation", values.designation);

      if (values.linkedIn !== initialData.linkedIn)
        fd.append("linkedIn", values.linkedIn);
    }

    if (imageFile) {
      fd.append("picture", imageFile);
    }

    const url = isAddMode
      ? `${process.env.apiURL}/api/v1/team/createMember?type=internalTeam`
      : `${process.env.apiURL}/api/v1/team/updateMember?id=${ID}&type=internalTeam`;

    const method = isAddMode ? "post" : "put";

    axios({
      method,
      url,
      data: fd,
      headers: {
        Authorization: authToken,
        "Content-Type": "multipart/form-data",
      },
    })
      .then(() => {
        toast.success(
          `Team Member ${isAddMode ? "created" : "updated"} successfully!`,
          { className: "bg-green-700 text-white" }
        );

        getAllTeamMembers();
        setShowTeamPanel(false);
      })
      .catch(() => {
        toast.error("Failed to save team member.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = localStorage.getItem("authToken");
    if (t) setAuthToken(t);
  }, []);

  useEffect(() => {
    if (isAddMode) {
      form.reset({
        name: "",
        designation: "",
        linkedIn: "",
        picture: null,
      });
      setInitialData({});
      setImagePreview(null);
      setImageFile(null);
      return;
    }

    if ((isEditMode || isViewMode) && ID) {
      axios
        .get(
          `${process.env.apiURL}/api/v1/team/getMembers?type=internalTeam&id=${ID}&lang=${selectedLanguage}`
        )
        .then((res) => {
          const data = res.data.data;

          const preset = {
            name: data.name || "",
            designation: data.designation || "",
            linkedIn: data.linkedIn || "",
            picture: data.picture || null,
          };

          form.reset(preset);
          setInitialData(preset);
          setImagePreview(data.picture || null);
          setImageFile(null);
        })
        .catch(() => {
          toast.error("Failed to fetch team member details.");
        });
    }
  }, [state, ID]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
        {/* Name */}
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

        {/* Image Preview */}
        {imagePreview && (
          <img
            src={imagePreview}
            className="w-[150px] h-[150px] rounded border object-cover"
          />
        )}

        {/* Picture Upload */}
        <FormField
          control={form.control}
          name="picture"
          render={() => (
            <FormItem>
              <FormLabel>Picture</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  disabled={isViewMode}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    handleImageChange(file);
                    form.setValue("picture", file);
                  }}
                />
              </FormControl>
              <FormMessage />
              <FormDescription>
                Image you are uploading must be of size
                <strong> 150 × 150</strong>.
              </FormDescription>
            </FormItem>
          )}
        />

        {/* Designation */}
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
                  placeholder="Enter Designation"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* LinkedIn */}
        <FormField
          control={form.control}
          name="linkedIn"
          render={({ field }) => (
            <FormItem>
              <FormLabel>LinkedIn URL</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isViewMode}
                  placeholder="Enter LinkedIn URL"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* SAVE BUTTON */}
        <div className="mt-6">
          <Button
            className="theme-button w-full"
            disabled={loading || isViewMode}
            // onClick={handleSave}
            type="submit"
          >
            {loading ? (
              <ClipLoader size={25} color="white" />
            ) : (
              "Save Team Member"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default TeamForm;
