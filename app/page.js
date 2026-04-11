// importing the component like this disables SSR which was 
// causing a hydration error

"use client"

import dynamic from "next/dynamic";

const Solitaire = dynamic(() => import("../components/Solitaire"), {
  ssr: false,
});

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">

       <Solitaire />
       
    </div>
  );
}
