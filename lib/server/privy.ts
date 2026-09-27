import "server-only";

import { PrivyClient } from "@privy-io/node";

let client: PrivyClient | null = null;

function getClient() {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const appSecret = process.env.PRIVY_APP_SECRET;
  if (!appId || !appSecret) return null;
  client ??= new PrivyClient({ appId, appSecret });
  return client;
}

export async function authenticatePrivyRequest(request: Request) {
  const authorization = request.headers.get("authorization");
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  const privy = getClient();
  if (!token || !privy) return null;
  try {
    const claims = await privy.utils().auth().verifyAccessToken(token);
    return { userId: claims.user_id };
  } catch {
    return null;
  }
}
