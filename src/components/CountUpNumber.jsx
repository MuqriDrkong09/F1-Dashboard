import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import useMediaQuery from "@mui/material/useMediaQuery";

/**
 * Animates an integer from 0 to `end` (easing). Respects reduced motion.
 */
export default function CountUpNumber({
  end,
  duration = 900,
  decimals = 0,
  component = "span",
  sx,
}) {
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)", {
    defaultMatches: false,
  });
  const [value, setValue] = useState(prefersReducedMotion ? end : 0);

  useEffect(() => {
    if (prefersReducedMotion) {
      setValue(end);
      return;
    }

    let raf = 0;
    const startVal = 0;
    const t0 = performance.now();

    const step = (t) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - (1 - p) ** 3;
      setValue(startVal + (end - startVal) * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [end, duration, prefersReducedMotion]);

  const text =
    decimals > 0 ? value.toFixed(decimals) : String(Math.round(value));

  return (
    <Box component={component} sx={sx}>
      {text}
    </Box>
  );
}
