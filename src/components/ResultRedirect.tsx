"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { readResultCache } from "@/lib/result-cache";

export default function ResultRedirect() {
  const router = useRouter();

  useEffect(() => {
    const encoded = readResultCache();
    if (encoded) {
      router.replace(`/results?a=${encoded}`);
    }
  }, [router]);

  return null;
}
