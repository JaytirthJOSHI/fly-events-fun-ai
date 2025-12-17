import { Issuer } from 'openid-client';

const HCA_DISCOVERY_URL = 'https://auth.hackclub.com/.well-known/openid-configuration';
const CLIENT_ID = process.env.HACKCLUB_CLIENT_ID;
const CLIENT_SECRET = process.env.HACKCLUB_CLIENT_SECRET;
const REDIRECT_URI = process.env.HACKCLUB_REDIRECT_URI || 'http://localhost:3000/auth/callback';

let client = null;

export async function getHcaClient() {
  if (client) return client;

  try {
    const issuer = await Issuer.discover(HCA_DISCOVERY_URL);
    client = new issuer.Client({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uris: [REDIRECT_URI],
      response_types: ['code'],
    });
    return client;
  } catch (error) {
    console.error('Failed to initialize HCA client:', error);
    throw error;
  }
}

export function getAuthUrl(state) {
  if (!CLIENT_ID) {
    throw new Error('HACKCLUB_CLIENT_ID not configured');
  }

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'openid profile email',
    state: state || 'default',
  });

  return `https://auth.hackclub.com/oauth/authorize?${params.toString()}`;
}
