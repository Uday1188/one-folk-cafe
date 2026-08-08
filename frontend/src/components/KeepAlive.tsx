"use client";

import { useEffect } from "react";

export default function KeepAlive() {
  useEffect(() => {
    const ping = async () => {
      try {
        const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api').replace(/\/api$/, '');
        await fetch(`${apiBase}/api/keep-alive`);
      } catch (_) {
        // ignore – we just want to keep the backend awake
      }
    };
    // First ping immediately
    ping();
    // Then every 10 minutes (600 000 ms)
    const interval = setInterval(ping, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return null; // renders nothing — runs only the side-effect
}
