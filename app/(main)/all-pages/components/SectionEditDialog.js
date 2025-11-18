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
import { toast } from "sonner";
import axios from "axios";
import { useTheme } from "next-themes";

export function SectionEditDialog({ section, getSinglePageData }) {
  const { theme } = useTheme();

  const [mediaPreview, setMediaPreview] = useState(
    section?.sectionBackground?.[theme] || null
  );
  const [selectedFile, setSelectedFile] = useState(null);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState(section);
  const [originalData, setOriginalData] = useState(section);
  const [error, setError] = useState("");
  const [authToken, setAuthToken] = useState("");

  useEffect(() => {
    if (window.localStorage.getItem("authToken")) {
      setAuthToken(localStorage.getItem("authToken"));
    }
  }, []);

  useEffect(() => {
    if (open) {
      setMediaPreview(section?.sectionBackground?.[theme] || null);
      setFormData(section);
      setOriginalData(section);
      setSelectedFile(null);
      setError("");
    }
  }, [open, section, theme]);

  // --------------------------
  // Track changes
  // --------------------------
  const hasChanged = () => {
    return (
      formData.headline !== originalData.headline ||
      formData.subHeadline !== originalData.subHeadline ||
      formData.description !== originalData.description ||
      formData.ctaButton !== originalData.ctaButton ||
      formData.ctaLink !== originalData.ctaLink ||
      selectedFile !== null
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
    setMediaPreview(URL.createObjectURL(file));
  };

  // --------------------------
  // Save Only Changed Data
  // --------------------------
  const handleSave = async () => {
    if (!hasChanged()) {
      toast.error("No changes made.");
      setOpen(false);
      return;
    }

    if (!formData.headline?.trim()) {
      toast.error("Headline is required.");
      setError("Headline is required.");
      return;
    }

    const data = new FormData();

    const appendIfChanged = (key) => {
      if (formData[key] !== originalData[key] && formData[key] !== undefined) {
        data.append(key, formData[key]);
      }
    };

    appendIfChanged("headline");
    appendIfChanged("subHeadline");
    appendIfChanged("description");
    appendIfChanged("ctaButton");
    appendIfChanged("ctaLink");

    // --------------------------
    // MEDIA — send only FILE
    // Key must be: sectionBackground
    // --------------------------
    if (selectedFile) {
      data.append("sectionBackground", selectedFile);
    }

    // FormData is empty → nothing to send
    if ([...data.keys()].length === 0) {
      toast.error("No changes detected.");
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

        setOpen(false);
        getSinglePageData();
      }
    } catch (err) {
      toast.error("Failed to update section.");
      setError(err.message || "Something went wrong.");
      setOpen(false);
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
        className="
          w-1/2 min-w-[50vw] 
          max-h-screen overflow-y-auto 
          
        "
      >
        <SheetHeader>
          <SheetTitle>Edit Section</SheetTitle>
        </SheetHeader>

        <div className="space-y-4  p-5 pt-0">
          <label className="text-sm font-medium text-gray-900">Headline</label>
          <Input
            name="headline"
            value={formData.headline || ""}
            onChange={handleChange}
            placeholder="Headline"
          />

          {section?.subHeadline && (
            <div>
              <label className="text-sm font-medium text-gray-900">
                SubHeadline
              </label>
              <Textarea
                name="subHeadline"
                value={formData.subHeadline || ""}
                onChange={handleChange}
                placeholder="Subheadline"
              />
            </div>
          )}

          {section?.description && (
            <>
              <label className="text-sm font-medium text-gray-900">
                Description
              </label>
              <Textarea
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                placeholder="Description"
              />
            </>
          )}

          {section?.ctaButton && (
            <>
              <label className="text-sm font-medium text-gray-900">
                CTA Button
              </label>
              <Input
                name="ctaButton"
                value={formData.ctaButton || ""}
                onChange={handleChange}
                placeholder="ctaButton"
              />
            </>
          )}

          {section?.ctaLink && (
            <>
              <label className="text-sm font-medium text-gray-900">
                CTA Link
              </label>
              <Input
                name="ctaLink"
                value={formData.ctaLink || ""}
                onChange={handleChange}
                placeholder="ctaLink"
              />
            </>
          )}

          {mediaPreview && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">
                Section Media
              </label>

              <div className="relative w-64 h-36">
                {selectedFile?.type?.startsWith("video") ||
                formData.media_type?.startsWith("video") ? (
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

          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        <SheetFooter className="mt-6">
          <Button onClick={handleSave}>Save</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
