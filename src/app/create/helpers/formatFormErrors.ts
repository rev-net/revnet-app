import { FormikErrors } from "formik";

const MAX_ERRORS_TO_SHOW = 5;

/**
 * Formats Formik validation errors into a user-friendly string
 */
export function formatFormErrors(errors: FormikErrors<any>): string {
  const messages = formatError(errors);

  if (messages.length === 0) {
    return "Please fill in all required fields.";
  }

  if (messages.length === 1) {
    return messages[0];
  }

  return (
    messages.slice(0, MAX_ERRORS_TO_SHOW).join("\n") +
    (messages.length > MAX_ERRORS_TO_SHOW ? "\n..." : "")
  );
}

const formatError = (obj: any, path: string = ""): string[] => {
  const messages: string[] = [];

  if (typeof obj === "string") return [obj];

  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      if (item) {
        const currentPath = path ? `${path}[${index}]` : `[${index}]`;
        messages.push(...formatError(item, currentPath));
      }
    });
    return messages;
  }

  if (typeof obj === "object" && obj !== null) {
    Object.entries(obj).forEach(([key, value]) => {
      if (value) {
        const currentPath = path ? `${path}.${key}` : key;
        messages.push(...formatError(value, currentPath));
      }
    });
    return messages;
  }

  return [];
};
