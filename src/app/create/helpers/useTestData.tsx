import { useFormikContext } from "formik";
import { useEffect } from "react";
import { SHORTER_TEST_FORM_DATA, TEST_FORM_DATA } from "../constants";
import { RevnetFormData } from "../types";

export function useTestData() {
  const { setValues } = useFormikContext<RevnetFormData>();
  useEffect(() => {
    const fillTestData = (data: RevnetFormData) => {
      setValues(data);
      console.log("Test data loaded successfully! 🚀");
      console.log("Form fields populated with:");
      console.dir(data);
    };

    Object.defineProperty(window, "testdata", {
      get: () => {
        fillTestData(TEST_FORM_DATA);
        return "filled.";
      },
      configurable: true,
    });

    Object.defineProperty(window, "testdata2", {
      get: () => {
        fillTestData(SHORTER_TEST_FORM_DATA);
        return "filled.";
      },
      configurable: true,
    });

    return () => {
      delete (window as any).testdata;
    };
  }, [setValues]);
}
