"use client";

import { useEffect, useState } from "react";
import { Timer } from "lucide-react";

const TimeUnit = ({ value, label }: { value: string; label: string }) => (
  <div className="flex min-w-14 flex-col items-center rounded-xl bg-cream p-2 sm:p-3">
    <span className="font-display text-lg font-semibold tabular-nums text-ink sm:text-2xl md:text-3xl">
      {value}
    </span>
    <span className="text-xs font-medium text-gray-600 sm:text-sm">{label}</span>
  </div>
);

const pad = (n: number) => String(n).padStart(2, "0");

/** Real countdown to local midnight, when today's deals roll over */
const DealCountdown = () => {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      setSecondsLeft(Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000)));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const s = secondsLeft;
  const hours = s === null ? "--" : pad(Math.floor(s / 3600));
  const minutes = s === null ? "--" : pad(Math.floor((s % 3600) / 60));
  const seconds = s === null ? "--" : pad(s % 60);

  return (
    <div className="flex items-center gap-2 sm:gap-4">
      <div className="flex items-center gap-1 text-marigold sm:gap-2">
        <Timer className="h-4 w-4 sm:h-5 sm:w-5" />
        <span className="text-sm font-semibold sm:text-base">Today&apos;s deals end in:</span>
      </div>
      <div className="grid grid-cols-3 gap-1 sm:gap-2" role="timer">
        <TimeUnit value={hours} label="Hours" />
        <TimeUnit value={minutes} label="Mins" />
        <TimeUnit value={seconds} label="Secs" />
      </div>
    </div>
  );
};

export default DealCountdown;
