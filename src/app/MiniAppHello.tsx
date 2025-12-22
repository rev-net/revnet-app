"use client";

import { sdk } from "@farcaster/frame-sdk";
import { useEffect, useState } from "react";

export function MiniAppHello() {
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      await sdk.actions.ready();

      try {
        await sdk.actions.addFrame();
      } catch (error) {
        if (error) {
          console.log("User rejected the mini app addition or domain manifest JSON is invalid");
        }
      }

      const ctx = await sdk.context;
      if (ctx?.user?.username) {
        setUserName(ctx.user.username);
      }
    };
    fetchUser();
  }, []);

  if (!userName) return null;

  return (
    <div className="flex items-center mb-4">
      <span className="text-lg">Hello {userName}!</span>
    </div>
  );
}

