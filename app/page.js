
import Solitaire from "../components/Solitaire";

{/* ----------------------------------------------- */ }

const stripeStyle = {
  flex: 1,
  maxWidth: "150px",
  height: "14px",
  borderRadius: "4px",
  background:
    "repeating-linear-gradient(45deg, #facc15 0 10px, #000 10px 20px, #fff 20px 30px)",
};



export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-50 font-sans dark:bg-black">
      <div
        style={{
          width: "100%",
          background: "#111",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
        }}
      >
        <div style={stripeStyle} />

        <div
          style={{
            fontSize: "clamp(1rem, 3vw, 2.5rem)",
            fontWeight: 900,
            letterSpacing: "0.12em",
            color: "#facc15",
            textShadow: "2px 2px 0 #000",
            whiteSpace: "nowrap",
          }}
        >
          UNDER CONSTRUCTION
        </div>

        <div style={stripeStyle} />
      </div>

      {/* ----------------------------------------------- */}




      <div className="flex w-full flex-1 items-center justify-center">
        <Solitaire />
      </div>
    </div>
  );
}