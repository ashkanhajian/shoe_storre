import { useEffect } from "react";

const STYLE_ID = "skeleton-shimmer-style";
const ANIM_NAME = "skeleton_shimmer_anim";

export default function Skeleton({ w = "100%", h = 12, r = 8, style = {} }) {
  useEffect(() => {
    if (document.getElementById(STYLE_ID)) return;

    const styleTag = document.createElement("style");
    styleTag.id = STYLE_ID;
    styleTag.textContent = `
      @keyframes ${ANIM_NAME} {
        100% { transform: translateX(100%); }
      }
    `;
    document.head.appendChild(styleTag);
  }, []);

  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: r,
        background: "#e9ecef",
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: "translateX(-100%)",
          background:
            "linear-gradient(90deg, rgba(233,236,239,0) 0%, rgba(255,255,255,0.6) 50%, rgba(233,236,239,0) 100%)",
          animation: `${ANIM_NAME} 1.2s infinite`,
        }}
      />
    </div>
  );
}
