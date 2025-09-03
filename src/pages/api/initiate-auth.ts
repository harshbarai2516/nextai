import type { NextApiRequest, NextApiResponse } from 'next';
import { Composio } from '@composio/core';

const composio = new Composio({ apiKey: process.env.COMPOSIO_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userId, authConfigId } = req.body; // dynamic authConfigId from frontend

    if (!userId || !authConfigId) {
      return res.status(400).json({ error: 'Missing userId or authConfigId' });
    }

    const callbackUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`;
    const connRequest = await composio.connectedAccounts.initiate(userId, authConfigId, {
      callbackUrl,
    });

    res.status(200).json({ redirectUrl: connRequest.redirectUrl, requestId: connRequest.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to initiate authentication' });
  }
}