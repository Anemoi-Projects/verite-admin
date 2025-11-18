import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { useState } from "react";
import { ClipLoader } from "react-spinners";
const DeleteTestimonial = ({
  delModalOpen,
  setDelModalOpen,
  authToken,
  data,
  getAllTestimonials,
}) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleEvent = () => {
    setLoading(true);
    let config = {
      method: "delete",
      maxBodyLength: Infinity,
      url: `${process.env.apiURL}/api/v1/testimonial/deleteTestimonial?id=${data?._id}`,
      headers: {
        Authorization: authToken,
      },
    };

    axios
      .request(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
        toast({
          title: "Testimonial deleted successfully",
        });
        getAllTestimonials();
        setLoading(false);
        setDelModalOpen(false);
      })
      .catch((error) => {
        console.log(error);
        toast({
          title: "Something went wrong",
          variant: "destructive",
        });
        setLoading(false);
      });
  };
  return (
    <Dialog open={delModalOpen} onOpenChange={() => setDelModalOpen(false)}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center">
            Are you sure you want to delete
          </DialogTitle>
        </DialogHeader>
        <div>
          <p className="text-center">
            {`Do you really want to delete this testimonial ? This process can't
            be reversed.`}
          </p>
        </div>
        <div className="flex justify-center gap-3 mt-3">
          <Button
            variant="destructive"
            disabled={loading}
            onClick={handleEvent}
          >
            {loading ? <ClipLoader size={20} color={"#ffffff"} /> : "Delete"}
          </Button>
          <Button variant="secondary" onClick={() => setDelModalOpen(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteTestimonial;
