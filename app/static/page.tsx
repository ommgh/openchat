"use client";

import dynamic from "next/dynamic";

const App = dynamic(() => import("@/dynamic/app"), { ssr: false });

export default function Home() {
  return <App />;
}
