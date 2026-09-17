import React, { useEffect, useState, useRef } from "react";

export function Counter({ value, className = "" }) {
  const [displayValue, setDisplayValue] = useState("0");
  const nodeRef = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const element = nodeRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          animateValue();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [value]);

  const animateValue = () => {
    const match = value.match(/([\d,]+\.?\d*)/);
    if (!match) {
      setDisplayValue(value);
      return;
    }

    const numStr = match[1];
    const numericValue = parseFloat(numStr.replace(/,/g, ""));
    const prefix = value.slice(0, value.indexOf(numStr));
    const suffix = value.slice(value.indexOf(numStr) + numStr.length);
    const hasCommas = numStr.includes(",");
    const decimalMatch = numStr.split(".")[1];
    const decimals = decimalMatch ? decimalMatch.length : 0;

    let startTime = null;
    const duration = 1500;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeProgress = 1 - (1 - progress) * (1 - progress);
      const currentNum = easeProgress * numericValue;

      let formattedNum = currentNum.toFixed(decimals);
      if (hasCommas) {
        const parts = formattedNum.split(".");
        parts[0] = parseInt(parts[0], 10).toLocaleString();
        formattedNum = parts.join(".");
      }

      setDisplayValue(prefix + formattedNum + suffix);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };

    requestAnimationFrame(step);
  };

  return <span ref={nodeRef} className={className}>{displayValue}</span>;
}
