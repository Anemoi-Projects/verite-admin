"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import axios from "axios";
import React, { useEffect, useState } from "react";
import TestimonialsTable from "./TestimonialsTable";
import TestimonialForm from "./TestimonialForm";
import DeleteTestimonial from "./DeleteTestimonial";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Page = () => {
  const [isOffCanvasOpen, setIsOffCanvasOpen] = useState(false);
  const [allTestimonials, setAllTestimonials] = useState([]);
  const [mode, setMode] = useState("add");
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [authToken, setAuthToken] = useState("");

  const getAllTestimonials = () => {
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `${process.env.apiURL}/api/v1/testimonial/getTestimonial`,
      headers: {},
    };

    axios
      .request(config)
      .then((response) => {
        // console.log(JSON.stringify(response.data));
        setAllTestimonials(response.data.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    getAllTestimonials();
  }, []);
  useEffect(() => {
    if (window.localStorage.getItem("authToken")) {
      setAuthToken(localStorage.getItem("authToken"));
    }
  }, [authToken]);
  return (
    <main className="flex-1  overflow-auto bg-white text-black">
      <div className="border-b border-gray-200 flex justify-between items-center p-5">
        <h1 className="text-2xl font-medium text-[#140B49] ">Testimonials</h1>
        <Button
          onClick={() => {
            setMode("add");
            setSelectedTestimonial(null);
            setIsOffCanvasOpen(true);
          }}
        >
          Add New Testimonial
        </Button>
      </div>
      <div className="p-5">
        <TestimonialsTable
          data={allTestimonials}
          setMode={setMode}
          setSelectedTestimonial={setSelectedTestimonial}
          setIsOffCanvasOpen={setIsOffCanvasOpen}
          setOpenDeleteModal={setOpenDeleteModal}
        />
      </div>
      {/* Sheet */}
      <Dialog open={isOffCanvasOpen} onOpenChange={setIsOffCanvasOpen}>
        <DialogContent className="min-w-[60%] max-w-full">
          <DialogHeader>
            <DialogTitle>
              {mode === "add"
                ? "Add New Testimonial"
                : mode === "edit"
                ? "Edit Testimonial Details"
                : "Testimonial Details"}
            </DialogTitle>
          </DialogHeader>
          <TestimonialForm
            data={selectedTestimonial}
            getAllTestimonials={getAllTestimonials}
            mode={mode}
            setIsOffCanvasOpen={setIsOffCanvasOpen}
            setDelModalOpen={setOpenDeleteModal}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}

      <DeleteTestimonial
        authToken={authToken}
        data={selectedTestimonial}
        delModalOpen={openDeleteModal}
        setDelModalOpen={setOpenDeleteModal}
        getAllTestimonials={getAllTestimonials}
      />
    </main>
  );
};

export default Page;
