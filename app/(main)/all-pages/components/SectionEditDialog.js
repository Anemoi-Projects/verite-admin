"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ClipLoader } from "react-spinners";

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

import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
  FormLabel,
} from "@/components/ui/form";

const SectionSchema = z.object({
  headline: z.string().min(1, "Headline is required"),

  subHeadline: z.string().optional(),
  description: z.string().optional(),

  ctaButton: z.string().optional(),
  ctaLink: z.string().optional(),

  sectionBackground: z.any().optional(),
});

export function SectionEditDialog({ section, getSinglePageData }) {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const [authToken, setAuthToken] = useState("");
  const [mediaPreview, setMediaPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("authToken");
    if (t) setAuthToken(t);
  }, []);

  const form = useForm({
    resolver: zodResolver(SectionSchema),
    defaultValues: {
      headline: "",
      subHeadline: "",
      description: "",
      ctaButton: "",
      ctaLink: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        headline: section?.headline || "",
        subHeadline: section?.subHeadline || "",
        description: section?.description || "",
        ctaButton: section?.ctaButton || "",
        ctaLink: section?.ctaLink || "",
      });

      setMediaPreview(section?.sectionBackground?.[theme] || null);
      setSelectedFile(null);
    }
  }, [open, section, theme, form]);

  const handleMediaChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video");

    if (isVideo && file.size > 10 * 1024 * 1024) {
      toast.error("Video must be under 10 MB.");
      return;
    }

    if (!isVideo) {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        if (img.width !== 1440 || img.height !== 800) {
          toast.error("Image must be exactly 1440×800.");
          URL.revokeObjectURL(url);
          return;
        }
        setSelectedFile(file);
        setMediaPreview(url);
      };
      img.onerror = () => {
        toast.error("Invalid image.");
        URL.revokeObjectURL(url);
      };
      img.src = url;
      return;
    }
    setSelectedFile(file);
    setMediaPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (values) => {
    setLoading(true);

    const data = new FormData();

    Object.keys(values).forEach((key) => {
      if (values[key] !== section[key] && values[key] !== undefined) {
        data.append(key, values[key]);
      }
    });

    if (selectedFile) {
      data.append("sectionBackground", selectedFile);
    }

    if ([...data.keys()].length === 0) {
      toast.error("No changes detected.");
      setLoading(false);
      setOpen(false);
      return;
    }

    try {
      const res = await axios.put(
        `${process.env.apiURL}/api/v1/admin/updateSection?sectionId=${section._id}&theme=${theme}`,
        data,
        {
          headers: {
            Authorization: authToken,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.data.success) {
        toast("Section updated successfully", {
          className: "bg-green-700 text-white",
        });
        getSinglePageData();
        setOpen(false);
      }
    } catch (err) {
      toast.error("Failed to update section.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="theme-button">
          Edit Section
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-1/2 min-w-[50vw] max-h-screen overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>Edit Section</SheetTitle>
        </SheetHeader>

        <div className="p-5 pt-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* HEADLINE */}
              <FormField
                control={form.control}
                name="headline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Headline</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Headline" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {section?.subHeadline && (
                <FormField
                  control={form.control}
                  name="subHeadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subheadline</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Subheadline" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {section?.description && (
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

              {section?.ctaButton && (
                <FormField
                  control={form.control}
                  name="ctaButton"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CTA Button</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="CTA Button" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {section?.ctaLink && (
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

              {/* MEDIA */}
              {mediaPreview && (
                <div className="space-y-2">
                  <FormLabel>Section Media</FormLabel>

                  <div className="relative w-64 h-36">
                    {selectedFile?.type?.startsWith("video") ||
                    section?.media_type?.startsWith("video") ? (
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
                    Image you are uploading must be of size
                    <strong>1440 × 800</strong>.
                  </p>
                </div>
              )}

              <Button className="theme-button w-full" type="submit">
                {loading ? <ClipLoader size={24} color="white" /> : "Save"}
              </Button>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
