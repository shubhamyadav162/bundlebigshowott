const express = require('express');
const fetch = require('node-fetch');
const { SignJWT, jwtVerify, decodeJwt } = require('jose');
const router = express.Router();

// Load environment variables
require('dotenv').config({ path: 'lightspeed.env' });

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || process.env.BASE_URL || 'http://localhost:3000';
const JWT_SECRET = process.env.JWT_SECRET;

const COOKIE_NAME = 'session';
const COOKIE_OPTIONS = `Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60};`; // 1 hour

// 1. Redirects to Google OAuth consent page
router.get('/authorize', (req, res) => {
  const redirectUri = `${BASE_URL}/api/oauth/callback`;
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid profile email',
    access_type: 'offline',
    prompt: 'consent',
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
});

// 2. Handles Google callback, exchanges code, sets cookie, and redirects
router.get('/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send('Missing auth code');
  try {
    const redirectUri = `${BASE_URL}/api/oauth/callback`;
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });
    const tokenJson = await tokenRes.json();
    if (tokenJson.error) {
      return res.status(400).json(tokenJson);
    }
    const { id_token } = tokenJson;
    // Decode ID token to get user info
    const payload = decodeJwt(id_token);

    // Create a custom signed JWT
    const jwt = await new SignJWT({
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    })
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign(new TextEncoder().encode(JWT_SECRET));

    // Set HTTP-only cookie
    res.setHeader('Set-Cookie', `${COOKIE_NAME}=${jwt}; ${COOKIE_OPTIONS}`);
    return res.redirect('/');
  } catch (error) {
    console.error('OAuth callback error:', error);
    return res.status(500).send('Authentication error');
  }
});

// 3. Native: exchange code for custom JWT
router.post('/token', async (req, res) => {
  const { code, redirectUri } = req.body;
  if (!code || !redirectUri) {
    return res.status(400).json({ error: 'Missing code or redirectUri' });
  }
  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });
    const tokenJson = await tokenRes.json();
    if (tokenJson.error) {
      return res.status(400).json(tokenJson);
    }
    const { id_token } = tokenJson;
    const payload = decodeJwt(id_token);
    const jwt = await new SignJWT({
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    })
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign(new TextEncoder().encode(JWT_SECRET));

    return res.json({ token: jwt });
  } catch (error) {
    console.error('Token exchange error:', error);
    return res.status(500).json({ error: 'Token exchange failed' });
  }
});

// 4. Verify session via cookie (web)
router.get('/session', async (req, res) => {
  try {
    const cookieHeader = req.headers.cookie || '';
    const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
    if (!match) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    const token = match[1];
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    return res.json({ user: payload });
  } catch (error) {
    console.error('Session verification error:', error);
    return res.status(401).json({ error: 'Invalid session' });
  }
});

// 5. Logout clears the cookie
router.post('/logout', (req, res) => {
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; Path=/; HttpOnly; Max-Age=0`);
  return res.json({ success: true });
});

module.exports = router; 