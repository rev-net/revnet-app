"use client";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { RelayrPostBundleResponse } from "juice-sdk-react";
import { PayAndDeploy } from "../buttons/PayAndDeploy";
import { useCreateForm } from "./useCreateForm";

interface Props {
  relayrResponse: RelayrPostBundleResponse;
  reset: () => void;
}

export function QuoteResponse(props: Props) {
  const { relayrResponse, reset } = props;
  const { revnetTokenSymbol, isSubmitting } = useCreateForm();

  return (
    <div className="flex flex-col items-start md:col-span-2 md:col-start-2">
      <div className="mt-2 text-xs italic">
        Quote valid until {format(relayrResponse.payment_info[0].payment_deadline, "h:mm:ss aaa")}.
        <Button
          variant="link"
          size="sm"
          className="px-1 text-xs italic"
          disabled={isSubmitting}
          onClick={() => reset()}
        >
          clear quote
        </Button>
      </div>
      <div className="mt-4">
        <PayAndDeploy relayrResponse={relayrResponse} revnetTokenSymbol={revnetTokenSymbol} />
      </div>
    </div>
  );
}
