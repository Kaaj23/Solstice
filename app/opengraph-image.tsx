import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "SOLSTICE — Scents Defined by Light";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "radial-gradient(ellipse at 78% 28%, #322c22 0%, #121216 38%, #050505 75%)",
          color: "#f5f0e7",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          padding: 80,
        }}
      >
        <div style={{ display: "flex", fontSize: 20, letterSpacing: 9, color: "#d4af37", marginBottom: 30 }}>
          THE FRAGRANCE HOUSE
        </div>
        <div style={{ display: "flex", fontSize: 112, letterSpacing: 16, fontFamily: "serif", fontWeight: 400 }}>
          SOLSTICE
        </div>
        <div style={{ display: "flex", width: 170, height: 1, background: "#d4af37", marginTop: 30, marginBottom: 30 }} />
        <div style={{ display: "flex", fontSize: 30, letterSpacing: 5, color: "#d7d1c7" }}>
          SCENTS DEFINED BY LIGHT
        </div>
      </div>
    ),
    size
  );
}
