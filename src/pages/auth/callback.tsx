// pages/auth/callback.tsx
"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Callback() {
  const router = useRouter();
  const [status, setStatus] = useState("Checking authentication...");
  const [connectedAccountId, setConnectedAccountId] = useState<string | null>(null);
  const [appName, setAppName] = useState<string | null>(null);

  useEffect(() => {
    if (!router.isReady) return;

    const { status, connectedAccountId, appName } = router.query;

    if (status === "success") {
      setStatus("Authentication successful!");
      setConnectedAccountId(typeof connectedAccountId === "string" ? connectedAccountId : null);
      setAppName(typeof appName === "string" ? appName : null);
    } else {
      setStatus("Authentication failed.");
    }
  }, [router.isReady, router.query]);

  const handleDisconnect = async () => {
    if (!connectedAccountId) return;

    try {
      const res = await fetch("/api/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectedAccountId }),
      });

      if (res.ok) {
        setStatus("Disconnected successfully!");
        router.push("/");
      } else {
        const data = await res.json();
        setStatus(`Failed to disconnect: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      setStatus("Failed to disconnect due to network error.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>{status}</h1>
      {connectedAccountId && (
        <div style={{ marginTop: "10px" }}>
          <p>
            Connected <strong>{appName}</strong> (ID: {connectedAccountId})
          </p>
          <button
            onClick={handleDisconnect}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              background: "red",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Disconnect & Go Home
          </button>
        </div>
      )}
    </div>
  );
}
