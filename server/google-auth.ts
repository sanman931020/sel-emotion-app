/** Google OAuth 授權碼兌換（手機導向登入用） */

export function isGoogleRedirectConfigured() {
  const clientId = (process.env.GOOGLE_CLIENT_ID || '').trim();
  const secret = (process.env.GOOGLE_CLIENT_SECRET || '').trim();
  return !!(clientId && secret && clientId !== 'your_google_client_id.apps.googleusercontent.com');
}

export async function exchangeGoogleAuthCode(code: string, redirectUri: string) {
  const clientId = (process.env.GOOGLE_CLIENT_ID || '').trim();
  const clientSecret = (process.env.GOOGLE_CLIENT_SECRET || '').trim();
  if (!clientId || !clientSecret) {
    return { ok: false as const, reason: 'google_oauth_server_not_configured' as const };
  }
  if (!code || !redirectUri) {
    return { ok: false as const, reason: 'invalid_request' as const };
  }

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  const tokenData = (await tokenRes.json()) as {
    access_token?: string;
    error?: string;
    error_description?: string;
  };

  if (!tokenRes.ok || !tokenData.access_token) {
    return {
      ok: false as const,
      reason: 'token_exchange_failed' as const,
      error: tokenData.error_description || tokenData.error || `HTTP ${tokenRes.status}`,
    };
  }

  const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  if (!userRes.ok) {
    return { ok: false as const, reason: 'userinfo_failed' as const };
  }

  const info = (await userRes.json()) as {
    sub?: string;
    email?: string;
    name?: string;
  };

  if (!info.sub || !info.email) {
    return { ok: false as const, reason: 'userinfo_incomplete' as const };
  }

  return {
    ok: true as const,
    user: {
      uid: info.sub,
      email: info.email,
      displayName: info.name || info.email,
    },
  };
}
