import { useEffect, useState } from "react";

export const useCountdownToDate = (date: Date | undefined) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>();

  const endSeconds = date ? date.getTime() / 1000 : undefined;

  useEffect(() => {
    if (!endSeconds) return;

    const updateSecondsRemaining = () => {
      const now = Date.now() / 1000;
      const _secondsRemaining = endSeconds - now > 0 ? endSeconds - now : 0;
      setSecondsRemaining(_secondsRemaining);
    };
    updateSecondsRemaining(); // call immediately

    const timer = setInterval(updateSecondsRemaining, 1000); // update every second
    return () => clearInterval(timer);
  }, [endSeconds]);

  return secondsRemaining;
};
