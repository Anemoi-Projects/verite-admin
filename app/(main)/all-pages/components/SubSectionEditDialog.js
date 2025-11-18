"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import axios from "axios";
import { toast } from "sonner";

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
import { ClipLoader } from "react-spinners";
import { useTheme } from "next-themes";

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
  const [loading, setLoading] = useState(false);
  const [authToken, setAuthToken] = useState("");
  const [mediaPreview, setMediaPreview] = useState(subsection?.subSectionMedia);
  const [mediaType, setMediaType] = useState(subsection?.mediaType || "image");
  const [selectedFile, setSelectedFile] = useState(null);
  const [originalData, setOriginalData] = useState(subsection);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) setAuthToken(token);
  }, []);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      heading: subsection.heading || "",
      subHeading: subsection.subHeading || "",
      description: subsection.description || "",
      ctaButton: subsection.ctaButton || "",
      ctaLink: subsection.ctaLink || "",
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
    const file = e.target.files[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video");
    const maxSizeMB = 10;
    if (isVideo && file.size > maxSizeMB * 1024 * 1024) {
      toast.error("Video must be less than 10 MB.");
      return;
    }

    setSelectedFile(file);
    setMediaType(file.type);
    setMediaPreview(URL.createObjectURL(file));
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
      toast.error("No changes made.");
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
      toast.error("No changes to update.");
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

        setOpen(false);
        getSinglePageData();
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
        <Button variant="outline" className="my-5 theme-button">
          Edit SubSection
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
            className="space-y-4 p-5"
          >
            {/* Heading */}
            <FormField
              control={form.control}
              name="heading"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Heading</FormLabel>
                  <FormControl>
                    <Input placeholder="Heading" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* SubHeading */}
            {subsection.subHeading && (
              <FormField
                control={form.control}
                name="subHeading"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SubHeading</FormLabel>
                    <FormControl>
                      <Input placeholder="SubHeading" {...field} />
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
                      <Textarea placeholder="Description" {...field} />
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
                      <Input placeholder="ctaButton" {...field} />
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
                      <Input placeholder="ctaLink" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* MEDIA */}
            {mediaPreview && (
              <div className="space-y-2">
                <FormLabel>Subsection Media</FormLabel>

                <div className="relative w-64 h-36">
                  {mediaType.startsWith("video") ? (
                    <video
                      src={mediaPreview}
                      controls
                      className="w-full h-full rounded border object-cover"
                    />
                  ) : (
                    <img
                      src={mediaPreview}
                      alt="Preview"
                      className="w-full h-full rounded border object-cover"
                    />
                  )}
                </div>

                <Input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleMediaChange}
                />
              </div>
            )}

            {/* Submit */}

            <Button type="submit" className={"w-full theme-button"}>
              {loading ? <ClipLoader size={25} color={"white"} /> : "Save"}
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
