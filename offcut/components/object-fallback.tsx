import { useId } from "react";
export function ObjectFallback({
  kind = "stool",
  finish = "natural",
}: {
  kind?: "stool" | "table" | "chair" | "offcuts";
  finish?: string;
}) {
  const id = useId().replaceAll(":", "");
  const colors: Record<string, [string, string]> = {
    natural: ["#d6ac70", "#946033"],
    cherry: ["#934833", "#542b27"],
    ink: ["#4b5364", "#282d3c"],
  };
  const [light, dark] = colors[finish] ?? colors.natural;
  return (
    <svg
      viewBox="0 0 500 450"
      className={`object-fallback object-${kind}`}
      role="img"
      aria-label={`${finish} ${kind}, illustrative design`}
    >
      <defs>
        <linearGradient id={`${id}-wood`}>
          <stop stopColor={light} />
          <stop offset=".5" stopColor={dark} />
          <stop offset=".78" stopColor={light} />
          <stop offset="1" stopColor={dark} />
        </linearGradient>
        <linearGradient id={`${id}-top`} x2="0" y2="1">
          <stop stopColor={light} />
          <stop offset="1" stopColor={dark} />
        </linearGradient>
        <pattern
          id={`${id}-grain`}
          width="19"
          height="120"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M3-20Q28 20 8 65T9 150M12-20Q-3 20 15 65T16 150"
            fill="none"
            stroke={dark}
            strokeWidth=".65"
            opacity=".24"
          />
        </pattern>
        <filter id={`${id}-shadow`}>
          <feGaussianBlur stdDeviation="9" />
        </filter>
      </defs>
      <ellipse
        cx="251"
        cy="382"
        rx="137"
        ry="16"
        fill="#34271d"
        opacity=".15"
        filter={`url(#${id}-shadow)`}
      />
      {kind === "offcuts" ? (
        <g>
          <rect
            x="137"
            y="63"
            width="96"
            height="315"
            rx="24"
            fill={`url(#${id}-wood)`}
            transform="rotate(-12 185 220)"
          />
          <rect
            x="269"
            y="112"
            width="93"
            height="275"
            rx="22"
            fill={dark}
            transform="rotate(14 310 250)"
          />
          <rect
            x="106"
            y="213"
            width="286"
            height="67"
            rx="30"
            fill={light}
            transform="rotate(-18 250 245)"
          />
          <rect
            x="106"
            y="213"
            width="286"
            height="67"
            rx="30"
            fill={`url(#${id}-grain)`}
            transform="rotate(-18 250 245)"
          />
        </g>
      ) : kind === "stool" ? (
        <g>
          <path
            d="M183 185 141 353Q138 374 160 379L176 377 233 199ZM283 193l40 167q7 20 27 15l10-9-35-187Z"
            fill={`url(#${id}-wood)`}
          />
          <path
            d="m221 205-9 172q0 22 26 21l12-4 21-184Z"
            fill={`url(#${id}-wood)`}
          />
          <path
            d="M104 153q9-61 144-65t151 62v28q-5 62-147 67-146-2-148-59Z"
            fill={`url(#${id}-wood)`}
          />
          <ellipse cx="251" cy="152" rx="147" ry="65" fill={light} />
          <ellipse
            cx="251"
            cy="152"
            rx="147"
            ry="65"
            fill={`url(#${id}-grain)`}
          />
          <ellipse
            cx="251"
            cy="152"
            rx="117"
            ry="46"
            fill="none"
            stroke={dark}
            opacity=".18"
          />
          <ellipse
            cx="251"
            cy="152"
            rx="75"
            ry="30"
            fill="none"
            stroke={dark}
            opacity=".22"
          />
        </g>
      ) : kind === "table" ? (
        <g>
          <path
            d="m187 142 105-9 40 216q-38 46-125 14Z"
            fill={`url(#${id}-wood)`}
          />
          <path d="m316 143-84 17-32 198q45 34 91-8Z" fill={dark} />
          <path
            d="M99 131q7-50 151-49t155 48v24q-3 49-153 50-150-1-153-51Z"
            fill={`url(#${id}-wood)`}
          />
          <ellipse cx="252" cy="131" rx="153" ry="49" fill={light} />
          <ellipse
            cx="252"
            cy="131"
            rx="153"
            ry="49"
            fill={`url(#${id}-grain)`}
          />
        </g>
      ) : (
        <g>
          <path
            d="M199 218 130 353q44 32 75 27l47-139Z"
            fill={`url(#${id}-wood)`}
          />
          <path d="m291 197 66 151q-19 36-58 32l-64-143Z" fill={dark} />
          <path
            d="m182 58 109-15q39-2 41 40l11 107q-4 50-83 71l-96-21q-44-16-22-47l63-43Z"
            fill={`url(#${id}-wood)`}
          />
          <path
            d="m181 58 16 106q-4 20-46 30-18 8-11 23l90 24q87-25 93-54L311 77q-1-27-23-27Z"
            fill={light}
          />
          <path
            d="m181 58 16 106q-4 20-46 30-18 8-11 23l90 24q87-25 93-54L311 77q-1-27-23-27Z"
            fill={`url(#${id}-grain)`}
          />
        </g>
      )}
    </svg>
  );
}
