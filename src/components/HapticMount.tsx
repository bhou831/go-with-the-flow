"use client";

import { useEffect } from "react";
import { mountHaptic } from "@/lib/haptic";

export default function HapticMount() {
  useEffect(() => {
    mountHaptic();
  }, []);
  return null;
}
