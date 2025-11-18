import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { ClipLoader } from "react-spinners";
const formSchema = z.object({
  customerName: z
    .string()
    .min(1, { message: "Customer Name is required" })
    .max(100, { message: "Customer Name must be 100 characters or less" }),
  customerDesignation: z
    .string()
    .min(1, { message: "Customer Designation is required" })
    .max(100, {
      message: "Customer Designation must be 100 characters or less",
    }),
  customerReview: z
    .string()
    .min(1, { message: "Customer Review is required" })
    .max(1000, { message: "Customer Review must be 1000 characters or less" }),
  backgroundImage: z.any().optional(),
});
const TestimonialForm = ({
  mode,
  data,
  getAllTestimonials,
  setIsOffCanvasOpen,
}) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [profileChanged, setProfileChanged] = useState(false);
  const [existingImage, setExistingImage] = useState(
    data?.backgroundImage || null
  );
  const [loading, setLoading] = useState(false);
  const [authToken, setAuthToken] = useState("");
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: "",
      customerDesignation: "",
      customerReview: "",
      backgroundImage: null,
    },
  });
  const handleImageChange = (e) => {
    e.stopPropagation();
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setProfileChanged(true);
      form.setValue("backgroundImage", file);
    }
  };
  const handleRemoveImage = (e) => {
    e.preventDefault();
    setSelectedImage(null);
    setProfileChanged(false);
    setExistingImage(null);
    form.setValue("backgroundImage", null);
  };
  const handleSubmit = (values) => {
    setLoading(true);
    let formData = new FormData();
    formData.append("customerName", values?.customerName);
    formData.append("customerDesignation", values?.customerDesignation);
    formData.append("customerReview", values?.customerReview);
    if (selectedImage) {
      formData.append("backgroundImage", values?.backgroundImage);
    }

    let config = {
      method: mode === "add" ? "post" : "put",
      maxBodyLength: Infinity,
      url: `${process.env.apiURL}/api/v1/testimonial/${
        mode === "add"
          ? "createTestimonial"
          : `updateTestimonial?id=${data?._id}`
      }`,
      headers: {
        Authorization: authToken,
        "Content-Type": "multipart/form-data",
      },
      data: formData,
    };

    axios
      .request(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
        toast({
          title: `Testimonial ${
            mode === "add" ? "added" : "update"
          } successfully`,
        });
        getAllTestimonials();
        setLoading(false);
        setIsOffCanvasOpen(false);
      })
      .catch((error) => {
        toast({
          title: "Something went wrong",
          variant: "destructive",
        });
        setLoading(false);

        console.log(error);
      });
  };

  useEffect(() => {
    if (data) {
      form.reset({
        customerName: data?.customerName || "",
        customerDesignation: data?.customerDesignation || "",
        customerReview: data?.customerReview || "",
        backgroundImage: data?.backgroundImage || null,
      });
    }
  }, [data, form]);
  useEffect(() => {
    if (window.localStorage.getItem("authToken")) {
      setAuthToken(localStorage.getItem("authToken"));
    }
  }, [authToken]);
  return (
    <div className="p-5">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <div className="flex flex-col gap-4 overflow-y-auto">
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Name</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      className="form-control input-bg"
                      placeholder="Mandatory"
                      {...field}
                      disable={mode === "view"}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="customerDesignation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Designation</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      className="form-control input-bg"
                      placeholder="Mandatory"
                      {...field}
                      disable={mode === "view"}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="customerReview"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Review</FormLabel>
                  <FormControl>
                    <Textarea
                      type="text"
                      className="form-control input-bg"
                      placeholder="Mandatory"
                      {...field}
                      disable={mode === "view"}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="backgroundImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor={"backgroundImage"} className={"block"}>
                    <div className="">
                      <p className="py-2">Background Image</p>
                      {selectedImage && profileChanged ? (
                        <div className="">
                          <div className=" relative h-40 mt-2  overflow-hidden">
                            <img
                              src={URL.createObjectURL(selectedImage)}
                              className="object-cover object-center h-full w-full"
                              alt="backgroundImage"
                            />
                          </div>
                          {mode !== "view" && (
                            <Button
                              type="button"
                              className="bg-red-500 text-white w-1/4 mt-2"
                              onClick={(e) => handleRemoveImage(e)}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      ) : existingImage ? (
                        <div className="">
                          <div className="relative  h-40  overflow-hidden">
                            <img
                              src={existingImage}
                              className="object-cover object-center h-full w-full"
                              alt="backgroundImage"
                            />
                          </div>
                          {mode !== "view" && (
                            <Button
                              type="button"
                              className="bg-red-500 text-white w-1/4 mt-2"
                              onClick={(e) => handleRemoveImage(e)}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      ) : (
                        <Input
                          type="file"
                          accept=".png, .jpg, .jpeg"
                          //   className="hidden"
                          id="profilePicture"
                          {...form.register("backgroundImage")}
                          onChange={handleImageChange}
                          disable={mode === "view"}
                          className={"w-full"}
                        />
                      )}
                    </div>
                  </FormLabel>
                  <FormControl></FormControl>
                  <FormDescription>
                    The image size should be less than 5 MB
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {mode !== "view" && (
              <div>
                <Button type="submit" className={"block"}>
                  {loading ? <ClipLoader size={20} color="white" /> : "Submit"}
                </Button>
              </div>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
};

export default TestimonialForm;
