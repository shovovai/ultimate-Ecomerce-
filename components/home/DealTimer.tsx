"use client";

import { Fragment, useEffect, useState } from "react";

const pad = (n: number) => String(n).padStart(2, "0");

/** Counts down to local midnight, when the day's deals roll over */
const DealTimer = () => {
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

  const parts =
    secondsLeft === null
      ? ["--", "--", "--"]
      : [pad(Math.floor(secondsLeft / 3600)), pad(Math.floor((secondsLeft % 3600) / 60)), pad(secondsLeft % 60)];

  return (
    <div className="flex items-center gap-1" role="timer" aria-label="Time left on today's deals">
      {parts.map((part, i) => (
        <Fragment key={i}>
          {i > 0 && <span className="text-cream/40">:</span>}
          <span className="min-w-[2.4rem] rounded-lg bg-white/10 px-1.5 py-1 text-center font-display text-lg tabular-nums leading-none text-cream">
            {part}
          </span>
        </Fragment>
      ))}
    </div>
  );
};

export default DealTimer;
