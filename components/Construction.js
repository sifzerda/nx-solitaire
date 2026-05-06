// components/UnderConstructionBanner.js

export default function UnderConstructionBanner() {
  return (
    <div className="w-full bg-[#111] px-4 py-3 flex items-center justify-center gap-3">
      
      <div className="flex-1 max-w-[150px] h-[14px] rounded-[4px] bg-[repeating-linear-gradient(45deg,#facc15_0_10px,#000_10px_20px)]" />

      <div className="text-[clamp(1rem,3vw,2.5rem)] font-black tracking-[0.12em] text-yellow-400 whitespace-nowrap [text-shadow:2px_2px_0_#000]">
        UNDER CONSTRUCTION
      </div>

      <div className="flex-1 max-w-[150px] h-[14px] rounded-[4px] bg-[repeating-linear-gradient(45deg,#facc15_0_10px,#000_10px_20px)]" />

    </div>
  );
}