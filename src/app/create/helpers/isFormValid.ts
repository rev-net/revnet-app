import { RevnetFormData } from "@/app/create/types";

export const isFormValid = (values: RevnetFormData) => {
  if (!values.name || !values.tokenSymbol || !values.description) {
    return false;
  }

  if (!values.stages || values.stages.length === 0) {
    return false;
  }

  if (values.backedBy?.length === 0) return false;

  const isStagesValid = values.stages.every((stage) => {
    return (
      stage.initialIssuance !== undefined &&
      stage.initialIssuance !== "" &&
      stage.priceCeilingIncreasePercentage !== undefined &&
      stage.priceCeilingIncreasePercentage !== "" &&
      stage.priceCeilingIncreaseFrequency !== undefined &&
      stage.priceCeilingIncreaseFrequency !== "" &&
      (values.stages.indexOf(stage) === 0
        ? stage.initialOperator && stage.initialOperator !== ""
        : true)
    );
  });

  if (!values.chainIds || values.chainIds.length === 0) {
    return false;
  }

  return isStagesValid;
};
