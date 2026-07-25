import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt =
  "Irpin Tennis — тенісна спільнота Ірпеня, Бучі та Києва";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const logoData = await readFile(
    join(process.cwd(), "public", "logo.png"),
    "base64",
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "72px 86px",
          color: "#fff8ee",
          background:
            "linear-gradient(135deg, #123f2d 0%, #123f2d 66%, #bb5a3c 66%, #bb5a3c 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            maxWidth: 720,
          }}
        >
          <div
            style={{
              color: "#d7f34c",
              fontSize: 26,
              fontWeight: 800,
              letterSpacing: 8,
              textTransform: "uppercase",
            }}
          >
            Irpin · Bucha · Kyiv
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 82,
              fontWeight: 900,
              lineHeight: 0.95,
              textTransform: "uppercase",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>IRPIN</span>
            <span>TENNIS</span>
          </div>
          <div
            style={{
              marginTop: 30,
              fontSize: 30,
              color: "rgba(255,248,238,0.8)",
            }}
          >
            Гравці · Турніри · Ліги · Корти · Тренери
          </div>
        </div>
        <div
          style={{
            width: 280,
            height: 280,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 999,
            background: "#fff8ee",
            boxShadow: "0 24px 60px rgba(0,0,0,0.24)",
          }}
        >
          <img
            src={`data:image/png;base64,${logoData}`}
            width={250}
            height={250}
            alt=""
          />
        </div>
      </div>
    ),
    size,
  );
}
