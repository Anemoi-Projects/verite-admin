/* eslint-disable react/jsx-key */
"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ClipLoader } from "react-spinners";

export const CommonDeleteModal = ({setDelModalOpen,delModalOpen,handleEvent,dialogTitle,dialogDescription,loading }) => {
  
  return (
      <Dialog open={delModalOpen} onOpenChange={()=>setDelModalOpen(false)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-center">{dialogTitle}</DialogTitle>
          </DialogHeader>
          <div>
            <p className="text-center">
              {dialogDescription}
            </p>
          </div>
          <div className="flex justify-center gap-3 mt-3">
            <Button variant="destructive" disabled={loading} onClick={handleEvent}>
            {loading ? (
                <ClipLoader size={20} color={"#ffffff"} />
              ) : (
                "Delete"
              )}
            </Button>
            <Button
              variant="secondary"
              onClick={()=>setDelModalOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
  );
};
