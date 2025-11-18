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
import { Button } from "@/components/ui/button";
import { ClipLoader } from "react-spinners";
function FAQForm({
  faqFormState,
  getAllFAQs,
  setShowFAQPanel,
  selectedLanguage,
}) {
  const { faqID, state } = faqFormState;
  const isViewMode = state === "view";
  const [initialData, setInitialData] = useState({});
  const [tagOptions, setTagOptions] = useState([]);
  const [authToken, setAuthToken] = useState("");
  const [loading, setLoading] = useState(false);
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
    setLoading(true);
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
        setLoading(false);
        return;
      }
    }
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
      ? `${process.env.apiURL}/api/v1/faq/createFAQ`
      : `${process.env.apiURL}/api/v1/faq/updateFAQ?id=${faqID}`;
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
          setLoading(false);
        })
        .catch((err) => {
          toast.error("Failed to save FAQ");
          setLoading(false);
        });
    } else {
      toast(
        "Please fill the mandatory fields (Question & Answer) before saving the FAQ"
      );
      setLoading(false);
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
      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
        <FormField
          control={form.control}
          name="question"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isViewMode}
                  placeholder="Enter question"
                />
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
                  placeholder="Enter answer..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tag"
          render={({ field }) => (
            <FormItem>
              <FormLabel>FAQ Category</FormLabel>
              <FormControl>
                <Select
                  className="bg-transparent"
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
          <Button
            type="submit"
            className="theme-button w-full"
            disabled={isViewMode || loading}
            onClick={handleDraftSave}
          >
            {loading ? <ClipLoader size={25} color="white" /> : "Save FAQ"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default FAQForm;
