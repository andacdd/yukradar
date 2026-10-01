import { ImageResponse } from "next/og";

const SIZES = ["192", "512"] as const;

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return SIZES.map((size) => ({ size }));
}

export async function GET(_request: Request, { params }: RouteContext<"/pwa-icon/[size]">) {
  const { size } = await params;
  const px = size === "512" ? 512 : 192;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1d4ed8",
        }}
      >
        <div
          style={{
            width: px * 0.62,
            height: px * 0.62,
            borderRadius: px * 0.14,
            background: "#fbbf24",
            color: "#172554",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: px * 0.42,
            fontWeight: 800,
          }}
        >
          Y
        </div>
      </div>
    ),
    { width: px, height: px },
  );
}
