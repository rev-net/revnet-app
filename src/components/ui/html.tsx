import DOMPurify from "dompurify";

export const Html = ({ source }: { source: string }) => {
  const purified = DOMPurify.sanitize(source);

  return (
    <div
      id="rich-text"
      dangerouslySetInnerHTML={{
        __html: purified,
      }}
    />
  );
};
