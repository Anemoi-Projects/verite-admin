"use client";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ClipLoader } from "react-spinners";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import axios from "axios";

const AddEditAdminModal = ({
  mode,
  setIsOffCanvasOpen,
  isOffCanvasOpen,
  getAllAdmin,
  authToken,
  userData,
}) => {
  const formSchema = z.object({
    emailId: z.string().email({ message: "Invalid email address" }),
    fullName: z.string().min(2).max(100).trim().nonempty({
      message: "Full Name is required",
    }),
    password:
      mode === "add"
        ? z
            .string()
            .min(6, { message: "Password is required" })
            .max(16, { message: "Password must be 16 characters or less" })
        : z.string().optional(),
  });
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emailId: "",
      password: "",
      fullName: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const handleSubmit = (values) => {
    setLoading(true);
    let data = {
      email: values.emailId,
      password: values.password !== "" ? values?.password : null,
      fullName: values.fullName,
    };
    let config = {
      method: mode === "add" ? "post" : "put",
      maxBodyLength: Infinity,
      url:
        mode === "add"
          ? `${process.env.apiURL}/api/v1/admin/register`
          : `${process.env.apiURL}/api/v1/admin/updateAdmin?id=${userData?._id}`,
      headers: {
        Authorization: authToken,
        "Content-Type": "application/json",
      },
      data: data,
    };

    axios
      .request(config)
      .then((response) => {
        toast({
          title: response.data.data,
        });
        getAllAdmin();
        setLoading(false);
        form.reset();
        setIsOffCanvasOpen(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
        toast({
          title: "Something went wrong",
          variant: "destructive",
        });
      });
  };
  useEffect(() => {
    if ((mode === "edit") & (userData !== null)) {
      form.reset({
        emailId: userData?.emailId,
        fullName: userData?.fullName,
      });
    } else {
      form.reset({
        emailId: "",
        password: "",
        fullName: "",
      });
    }
  }, [form, userData, mode]);

  return (
    <Dialog open={isOffCanvasOpen} onOpenChange={setIsOffCanvasOpen}>
      <DialogContent className="min-w-[50%] max-w-full">
        <DialogHeader>
          <DialogTitle>
            {mode === "add"
              ? "Add New Admin"
              : mode === "edit"
              ? "Edit Testimonial Details"
              : "Testimonial Details"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-8"
          >
            <div className="flex flex-col gap-4 overflow-y-auto">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        className="form-control input-bg"
                        placeholder="Mandatory"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="emailId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email ID</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        className="form-control input-bg"
                        placeholder="Mandatory"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        className="form-control input-bg"
                        placeholder="Mandatory"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {mode !== "view" && (
                <div>
                  <Button type="submit" className={"block"} disabled={loading}>
                    {loading ? (
                      <ClipLoader size={20} color="white" />
                    ) : (
                      "Submit"
                    )}
                  </Button>
                </div>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditAdminModal;
