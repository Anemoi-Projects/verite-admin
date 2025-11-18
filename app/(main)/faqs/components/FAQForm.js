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
function FAQForm({
  faqFormState,
  getAllFAQs,
  setShowFAQPanel,
  selectedLanguage,
}) {
  const { faqID, state } = faqFormState;
  const isViewMode = state === "view";
  const [slug, setSlug] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [initialData, setInitialData] = useState({});
  const [content, setContent] = useState("");
  const [tagOptions, setTagOptions] = useState([]);
  const [authToken, setAuthToken] = useState("");
  const form = useForm({
    defaultValues: {
      question: "",
      answer: "",
      tag: [],
    },
  });

  useEffect(() => {
    if (state === "add") {
      form.reset({
        question: "",
        answer: "",
        tag: [],
      });
    } else if ((state === "edit" || state === "view") && faqID) {
      const config = {
        method: "get",
        maxBodyLength: Infinity,
        url: `${process.env.apiURL}/api/v1/faq/getFAQ?id=${faqID}&lang=${selectedLanguage}`,
        headers: {},
      };

      axios
        .request(config)
        .then((response) => {
          const data = response.data.data;

          form.reset({
            question: data.question || "",
            answer: data.answer || "",
            tag: data.tag?.join(", ") || "",
          });

          setInitialData({
            title: data.question || "",
            description: data.answer || "",
            tag: data.tag?.join(", ") || "",
          });
        })
        .catch((error) => {
          console.error("Failed to fetch FAQ data", error);
        });
    }
  }, [state, faqID]);
  // comment
  const handleDraftSave = () => {
    const isEditMode = state === "edit";
    const isAddMode = state === "add";

    const { question, answer, tag } = form.getValues();

    if (isEditMode) {
      const hasChanges =
        question !== initialData.question ||
        answer !== initialData.answer ||
        tag !== initialData.tag;

      if (!hasChanges) {
        setShowFAQPanel(false);
        toast.error("No changes detected.");
        return;
      }
    }
    console.log("tag", tag, authToken);

    let data;
    if (isAddMode) {
      data = JSON.stringify({
        question: question,
        answer: answer,
        tag: tag?.length > 0 ? tag : [],
      });
    } else {
      const idArray =
        typeof tag === "string"
          ? tag
              .split(",")
              .map((id) => id.replace(/"/g, "").trim())
              .filter(Boolean)
          : [...tag];
      data = JSON.stringify({
        question: question,
        answer: answer,
        tag: idArray,
      });
    }

    const url = isAddMode
      ? `${process.env.apiURL}/api/v1/faq/createFAQ?lang=${selectedLanguage}`
      : `${process.env.apiURL}/api/v1/faq/editFAQ?id=${faqID}&lang=${selectedLanguage}`;
    const method = isAddMode ? "post" : "put";

    if (question && answer && tag?.length > 0) {
      const config = {
        method,
        maxBodyLength: Infinity,
        url,
        headers: {
          "Content-Type": "application/json",
          Authorization: authToken,
        },
        data: data,
      };

      axios
        .request(config)
        .then((response) => {
          toast.success(
            `FAQ ${isAddMode ? "created" : "updated"} successfully!`
          );
          getAllFAQs();
          setShowFAQPanel(false);

          if (isEditMode) {
            setInitialData({
              question,
              answer,
              tag,
            });
          }

          if (isAddMode) {
            form.reset({
              question: "",
              answer: "",
              tag: [],
            });
          }
        })
        .catch((err) => {
          toast("Failed to save FAQ");
        });
    } else {
      toast(
        "Please fill the mandatory fields (Question & Answer) before saving the FAQ"
      );
    }
  };
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setAuthToken(token);
      getAllCategories(token);
    }
  }, []);
  const getAllCategories = useCallback(
    (token) => {
      const config = {
        method: "get",
        maxBodyLength: Infinity,
        url: `${process.env.apiURL}/api/v1/admin/getAllCategories?slug=faq&lang=${selectedLanguage}`,
        headers: {
          Authorization: token,
        },
      };

      axios
        .request(config)
        .then((response) => {
          console.log(JSON.stringify(response.data));
          setTagOptions(response.data.data);
        })
        .catch((error) => {
          console.error("Error fetching categories:", error);
        });
    },
    [authToken]
  );
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
          name="question"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question</FormLabel>
              <FormControl>
                <Input {...field} disabled={isViewMode} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="answer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Answer</FormLabel>
              <FormControl>
                <Textarea
                  className="min-h-[150px] resize-none"
                  {...field}
                  disabled={isViewMode}
                />
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
              <FormLabel>FAQ Tags</FormLabel>
              <FormControl>
                <Input {...field} disabled={isViewMode} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        /> */}
        <FormField
          control={form.control}
          name="tag"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Blog Tags</FormLabel>
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
        />

        <div className="mt-6 flex gap-x-5">
          <button
            type="button"
            className="bg-gradient-to-r from-[#140B49] to-[#140B49]/[0.72] text-white px-4 py-1.5 text-sm rounded"
            disabled={isViewMode}
            onClick={handleDraftSave}
          >
            Save FAQ
          </button>
        </div>
      </form>
    </Form>
  );
}

export default FAQForm;
