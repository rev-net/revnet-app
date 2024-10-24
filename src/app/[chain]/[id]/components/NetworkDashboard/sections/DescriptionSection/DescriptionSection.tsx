import {
  useJBProjectMetadataContext,
} from "juice-sdk-react";

export function DescriptionSection() {
  const { metadata } = useJBProjectMetadataContext();

  const { description } = metadata?.data ?? {};

  return (
    <>
      {description
        ? description.split("\n").map((d, idx) => (
            <p className="mb-3" key={idx}>
              {d}
            </p>
          ))
        : null}
    </>
  );
}
