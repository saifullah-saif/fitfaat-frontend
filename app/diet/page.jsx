"use client";
import dynamic from "next/dynamic";

// Dynamically load the DietTracker as a client component
const DietTracker = dynamic(() => import("@/components/diet-tracker"), {
  ssr: false, // This ensures client-side rendering only
});

export default function DietPage() {
  return (
    <div>
      <DietTracker />
    </div>
  );
}

