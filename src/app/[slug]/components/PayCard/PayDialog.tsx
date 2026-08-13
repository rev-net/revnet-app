"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function PayDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          aria-label="Pay unavailable"
          className="w-full cursor-not-allowed bg-zinc-300 text-zinc-600 hover:bg-zinc-300"
        >
          Pay
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Payments unavailable</DialogTitle>
          <DialogDescription className="pt-2 text-base text-zinc-700">
            All projects have been migrated to another version, check back soon.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
