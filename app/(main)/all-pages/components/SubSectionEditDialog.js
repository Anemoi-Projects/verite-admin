"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { ClipLoader } from "react-spinners";
import { useTheme } from "next-themes";

import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

const schema = z.object({
  heading: z.string().min(1, "Heading is required"),
  subHeading: z.string().optional(),
  description: z.string().optional(),
  ctaButton: z.string().optional(),
  ctaLink: z.string().optional(),
});

export function SubsectionEditDialog({ subsection, getSinglePageData }) {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const [authToken, setAuthToken] = useState("");
  const [loading, setLoading] = useState(false);

  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState("image");
  const [selectedFile, setSelectedFile] = useState(null);
  const [originalData, setOriginalData] = useState(subsection);

  useEffect(() => {
    const t = localStorage.getItem("authToken");
    if (t) setAuthToken(t);
  }, []);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      heading: "",
      subHeading: "",
      description: "",
      ctaButton: "",
      ctaLink: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        heading: subsection.heading || "",
        subHeading: subsection.subHeading || "",
        description: subsection.description || "",
        ctaButton: subsection.ctaButton || "",
        ctaLink: subsection.ctaLink || "",
      });

      setMediaPreview(subsection?.subSectionMedia || null);
      setMediaType(subsection?.mediaType || "image");
      setSelectedFile(null);
      setOriginalData(subsection);
    }
  }, [open, subsection, form]);

  const handleMediaChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video");

    if (isVideo) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Video must be less than 10 MB.");
        return;
      }
      setSelectedFile(file);
      setMediaType("video");
      setMediaPreview(URL.createObjectURL(file));
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      if (img.width !== img.height) {
        toast.error("Image must be perfectly square (equal width and height).");
        URL.revokeObjectURL(url);
        return;
      }

      setSelectedFile(file);
      setMediaType("image");
      setMediaPreview(url);
    };
    img.onerror = () => {
      toast.error("Invalid image file.");
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const hasChanged = (values) => {
    return (
      values.heading !== originalData.heading ||
      values.subHeading !== originalData.subHeading ||
      values.description !== originalData.description ||
      values.ctaButton !== originalData.ctaButton ||
      values.ctaLink !== originalData.ctaLink ||
      selectedFile !== null
    );
  };

  const onSubmit = async (values) => {
    setLoading(true);

    if (!hasChanged(values)) {
      toast.error("No changes detected.");
      setOpen(false);
      setLoading(false);
      return;
    }

    const data = new FormData();

    const appendIfChanged = (key) => {
      if (values[key] !== originalData[key] && values[key] !== undefined) {
        data.append(key, values[key]);
      }
    };

    appendIfChanged("heading");
    appendIfChanged("subHeading");
    appendIfChanged("description");
    appendIfChanged("ctaButton");
    appendIfChanged("ctaLink");

    if (selectedFile) {
      data.append("subSectionMedia", selectedFile);
    }

    if ([...data.keys()].length === 0) {
      toast.error("No updates detected.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.put(
        `${process.env.apiURL}/api/v1/admin/updateSubSection?subSectionId=${subsection._id}`,
        data,
        {
          headers: {
            Authorization: authToken,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.data.success) {
        toast.success("Subsection updated successfully", {
          className: "bg-green-700 text-white",
        });
        getSinglePageData();
        setOpen(false);
      }
    } catch (err) {
      toast.error("Failed to update subsection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="theme-button my-5">
          Edit Subsection
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-1/2 min-w-[50vw] max-h-screen overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>Edit Subsection</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5 p-5"
          >
            {/* Heading */}
            <FormField
              control={form.control}
              name="heading"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Heading</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Heading" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* SubHeading (only if exists) */}
            {subsection.subHeading && (
              <FormField
                control={form.control}
                name="subHeading"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sub Heading</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Sub Heading" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Description */}
            {subsection.description && (
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* CTA Button */}
            {subsection.ctaButton && (
              <FormField
                control={form.control}
                name="ctaButton"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CTA Button</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="CTA Text" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* CTA Link */}
            {subsection.ctaLink && (
              <FormField
                control={form.control}
                name="ctaLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CTA Link</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="CTA Link" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* MEDIA PREVIEW */}
            {mediaPreview && (
              <div className="space-y-2">
                <FormLabel>Subsection Media</FormLabel>

                <div className="relative w-64 h-64">
                  {mediaType.startsWith("video") ? (
                    <video
                      src={mediaPreview}
                      controls
                      className="w-full h-full rounded border object-cover"
                    />
                  ) : (
                    <img
                      src={mediaPreview}
                      className="w-full h-full rounded border object-cover"
                    />
                  )}
                </div>

                <Input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleMediaChange}
                />

                <p className="text-gray-400 text-sm">
                  Image must be a <strong>perfect square</strong> (equal width &
                  height).
                </p>
              </div>
            )}

            {/* Save Button */}
            <Button type="submit" className="w-full theme-button">
              {loading ? <ClipLoader size={25} color="white" /> : "Save"}
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
