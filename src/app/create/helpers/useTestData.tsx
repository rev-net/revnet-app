import { useFormikContext } from "formik";
import { useEffect } from "react";
import { RevnetFormData } from "../types";
import { TEST_FORM_DATA } from "../constants";

export function useTestData() {
  const { setValues } = useFormikContext<RevnetFormData>()
  useEffect(() => {
    const fillTestData = () => {
      setValues(TEST_FORM_DATA);
      console.log("Test data loaded successfully! 🚀");
      console.log("Form fields populated with:");
      console.dir(TEST_FORM_DATA);
    };

    Object.defineProperty(window, "testdata", {
      get: () => {
        fillTestData();
        return "filled.";
      },
      configurable: true,
    });

    return () => {
      delete (window as any).testdata;
    };
  }, [setValues]);
}
