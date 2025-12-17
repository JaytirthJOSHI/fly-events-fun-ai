const HCA_BASE_URL = 'https://auth.hackclub.com';
const CLIENT_ID = process.env.HACKCLUB_CLIENT_ID;
const CLIENT_SECRET = process.env.HACKCLUB_CLIENT_SECRET;
const REDIRECT_URI = process.env.HACKCLUB_REDIRECT_URI || 'http://localhost:5001/api/auth/callback';

export function getAuthUrl(state) {
  if (!CLIENT_ID) {
    throw new Error('HACKCLUB_CLIENT_ID not configured');
  }

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'openid profile email',
    state: state,
  });

  return `${HCA_BASE_URL}/oauth/authorize?${params.toString()}`;
}

export { HCA_BASE_URL, CLIENT_ID, CLIENT_SECRET, REDIRECT_URI };
