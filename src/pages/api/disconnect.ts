// pages/api/disconnect.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { Composio } from "@composio/core";

const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY || "",
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { connectedAccountId } = req.body;

    if (!connectedAccountId || typeof connectedAccountId !== "string") {
      return res.status(400).json({ error: "Missing or invalid connectedAccountId" });
    }

    // Correct method to delete the connected account
    await composio.connectedAccounts.delete(connectedAccountId);

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error("Disconnect error:", err);
    return res.status(500).json({ error: "Failed to disconnect account" });
  }
}
