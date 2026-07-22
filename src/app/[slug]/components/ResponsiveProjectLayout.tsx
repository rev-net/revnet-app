"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { ProjectMenu } from "./ProjectMenu";

export function ResponsiveProjectLayout({
  sidebar,
  activity,
  preMenu,
  children,
}: {
  sidebar: ReactNode;
  activity: ReactNode;
  preMenu?: ReactNode;
  children: ReactNode;
}) {
  const segment = useSelectedLayoutSegment();
  const [isPhone, setIsPhone] = useState(false);
  const [activitySelected, setActivitySelected] = useState(segment === null);

  useEffect(() => {
    const phoneQuery = window.matchMedia("(max-width: 600px)");
    const apply = () => setIsPhone(phoneQuery.matches);
    apply();
    phoneQuery.addEventListener("change", apply);
    return () => phoneQuery.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (segment) setActivitySelected(false);
  }, [segment]);

  const activityActive = isPhone && activitySelected;

  return (
    <div className="mb-10 flex w-full flex-col px-4 pb-5 min-[601px]:flex-row min-[601px]:gap-6 sm:container md:gap-10">
      <aside className="contents min-[601px]:flex min-[601px]:w-[240px] min-[601px]:shrink-0 min-[601px]:flex-col md:w-[300px]">
        <div className="order-1 min-[601px]:order-none">{sidebar}</div>
        <div
          className={`order-3 ${
            activityActive ? "block" : "hidden"
          } min-[601px]:order-none min-[601px]:block`}
        >
          {activity}
        </div>
      </aside>

      <div className="contents min-[601px]:mx-auto min-[601px]:flex min-[601px]:min-w-0 min-[601px]:max-w-4xl min-[601px]:flex-1 min-[601px]:flex-col min-[601px]:gap-6 min-[601px]:pb-10">
        {preMenu ? (
          <div
            className={`order-3 pt-6 ${
              activityActive ? "hidden" : "block"
            } min-[601px]:order-none min-[601px]:block min-[601px]:pt-0`}
          >
            {preMenu}
          </div>
        ) : null}

        <div className="order-2 mt-2 min-[601px]:order-none min-[601px]:mt-0">
          <ProjectMenu
            mobileActivityActive={activityActive}
            onMobileActivityChange={setActivitySelected}
          />
        </div>

        <div
          className={`order-4 pt-6 ${
            activityActive ? "hidden" : "block"
          } min-[601px]:order-none min-[601px]:block min-[601px]:pt-0`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
