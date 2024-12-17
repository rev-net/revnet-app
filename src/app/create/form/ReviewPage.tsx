import { useFormikContext } from "formik";
import { RevnetFormData } from "../types";
import Image from "next/image";
import { ipfsUriToGatewayUrl } from "@/lib/ipfs";

export function ReviewPage() {
  const { values } = useFormikContext<RevnetFormData>();

  return (
    <div>
      <h2 className="text-2xl font-medium mb-7">3. Review and deploy</h2>

      <div className="mb-5">
        <div className="px-4 sm:px-0">
          <h3 className="font-medium">General</h3>
        </div>

        <div className="mt-6 border-t border-zinc-200">
          <dl className="divide-y divide-zinc-100">
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-md font-medium leading-6 text-zinc-900">
                Revnet name
              </dt>
              <dd className="mt-1 text-md leading-6 text-zinc-700 sm:col-span-2 sm:mt-0">
                {values.name}
              </dd>
            </div>
            {/* <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-md font-medium leading-6 text-zinc-900">
                Revnet tagline
              </dt>
              <dd className="mt-1 text-md leading-6 text-zinc-700 sm:col-span-2 sm:mt-0">
                {values.tagline}
              </dd>
            </div> */}
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-md font-medium leading-6 text-zinc-900">
                Revnet description
              </dt>
              <dd className="mt-1 text-md leading-6 text-zinc-700 sm:col-span-2 sm:mt-0">
                {values.description.split("\n").map((d, idx) => (
                  <p
                    className={
                      idx < values.description.length - 1 ? "" : "mb-3"
                    }
                    key={idx}
                  >
                    {d}
                  </p>
                ))}
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-md font-medium leading-6 text-zinc-900">
                Logo
              </dt>

              <dd className="mt-1 text-md leading-6 text-zinc-700 sm:col-span-2 sm:mt-0">
                {values.logoUri ? (
                  <Image
                    src={ipfsUriToGatewayUrl(values.logoUri)}
                    alt="Revnet logo"
                    width={80}
                    height={200}
                  />
                ) : (
                  "None"
                )}
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-md font-medium leading-6 text-zinc-900">
                Token
              </dt>
              <dd className="mt-1 text-md leading-6 text-zinc-700 sm:col-span-2 sm:mt-0">
                {values.tokenName} (${values.tokenSymbol})
              </dd>
            </div>
          </dl>
        </div>
        <div className="pt-5">
          <h3 className="mb-1 font-medium">Stages</h3>

          <dl>
            {values.stages.map((stage, idx) => {
              return (
                <div key={idx} className="py-6">
                  <div className="text-md font-medium mb-3 uppercase flex gap-3 items-center">
                    <span className="flex-shrink-0">Stage {idx + 1}</span>
                    <span className="h-[1px] w-full bg-zinc-100"></span>
                  </div>

                  <div className="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-md font-medium leading-6 text-zinc-900">
                      Duration
                    </dt>
                    <dd className="mt-1 text-md leading-6 text-zinc-700 sm:col-span-2 sm:mt-0">
                      {stage.boostDuration ? (
                        <>{stage.boostDuration} days</>
                      ) : (
                        "Forever"
                      )}
                    </dd>
                  </div>

                  <div className="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-md font-medium leading-6 text-zinc-900">
                      Token price ceiling
                    </dt>
                    <dd className="mt-1 text-md leading-6 text-zinc-700 sm:col-span-2 sm:mt-0">
                      +{stage.priceCeilingIncreasePercentage || 0}% every{" "}
                      {stage.priceCeilingIncreaseFrequency} days
                    </dd>
                  </div>

                  <div className="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-md font-medium leading-6 text-zinc-900">
                      Cash out tax rate
                    </dt>
                    <dd className="mt-1 text-md leading-6 text-zinc-700 sm:col-span-2 sm:mt-0">
                      {stage.priceFloorTaxIntensity}%
                    </dd>
                  </div>

                  <div className="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-md font-medium leading-6 text-zinc-900">
                      Operator split
                    </dt>
                    <dd className="mt-1 text-md leading-6 text-zinc-700 sm:col-span-2 sm:mt-0">
                      {stage.splitRate || 0}%{" "}
                    </dd>
                  </div>
                </div>
              );
            })}
          </dl>
        </div>
      </div>
    </div>
  );
}
