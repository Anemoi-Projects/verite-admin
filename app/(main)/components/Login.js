"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeClosed, RefreshCcw } from "lucide-react";
import { ClipLoader } from "react-spinners";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  captchaInput: z.string().min(1, "Security text is required"),
});

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [captcha, setCaptcha] = useState("");
  const [enteredCaptcha, setEnteredCaptcha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");

  const refreshCaptcha = () => {
    const newCaptcha = Math.random().toString(36).substring(2, 7);
    setCaptcha(newCaptcha);
  };
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      captchaInput: "",
    },
  });

  const router = useRouter();

  const submitHandler = (values) => {
    if (values.email === "" || values.password === "") {
      toast.error("Please fill all the fields");
      return;
    }

    setLoading(true);
    if (values.captchaInput !== captcha) {
      setError("CAPTCHA text does not match. Please try again.");
      setLoading(false);
      return;
    }
    let data = JSON.stringify(values);

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `${process.env.apiURL}/api/v1/admin/login`,
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    axios
      .request(config)
      .then((response) => {
        if (response.data.success) {
          localStorage.setItem("authToken", response.data.data);
          router.push("/dashboard");
          toast.success("Logged in successfully", {
            className: "bg-green-700 text-white",
          });
          setLoading(false);
        } else {
          toast.error(response.data.message);
          setLoading(false);
          console.error("Error logging in:", response);
        }
      })
      .catch((error) => {
        toast.error("Something Went Wrong");
        setLoading(false);
        console.log(error);
      });
  };
  useEffect(() => {
    refreshCaptcha();
  }, []);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-full lg:w-1/2 p-10">
        <Card>
          <CardContent>
            <div className="flex items-center justify-center gap-x-1">
              <Image
                className="object-cover "
                src={"/logo.png"}
                height={50}
                width={50}
                alt="verite"
              />

              <h2 className="text-3xl font-semibold ">AKTOrigins</h2>
            </div>
            <p className="text-lg mb-5">Welcome, please sign in.</p>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(submitHandler)}
                className="space-y-6"
              >
                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email ID</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your email..."
                          className=""
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative flex items-center">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password..."
                            className="w-full pr-10"
                            {...field}
                          />

                          <span
                            className="absolute right-3 cursor-pointer"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeClosed size={20} />
                            ) : (
                              <Eye size={20} />
                            )}
                          </span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Captcha */}
                <FormField
                  control={form.control}
                  name="captchaInput"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Security Text</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-3">
                          <Input
                            placeholder="Enter the shown text"
                            className=""
                            {...field}
                          />

                          <div className="border px-4 py-1 rounded-md flex items-center gap-3">
                            <span className="font-bold text-lg select-none">
                              {captcha}
                            </span>

                            <Button
                              type="button"
                              variant="ghost"
                              onClick={refreshCaptcha}
                              className="h-8 w-8 p-0"
                            >
                              <RefreshCcw size={16} />
                            </Button>
                          </div>
                        </div>
                      </FormControl>

                      {error && <p className="text-red-500 text-sm">{error}</p>}

                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="theme-button w-full"
                >
                  {loading ? (
                    <ClipLoader size={20} color="#f4f0f0" />
                  ) : (
                    "Log in"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
