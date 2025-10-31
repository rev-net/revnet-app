"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";

export function TransactionsFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get("status") || "all";

  const handleValueChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === "all") {
      params.delete("status");
    } else {
      params.set("status", value);
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <Select value={status} onValueChange={handleValueChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Filter by status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All statuses</SelectItem>
        <SelectItem value="pending">Pending</SelectItem>
        <SelectItem value="claimable">Claimable</SelectItem>
        <SelectItem value="claimed">Claimed</SelectItem>
      </SelectContent>
    </Select>
  );
}
