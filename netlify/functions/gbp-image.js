// Netlify Serverless Function: serves photos uploaded from the dashboard so
// Google Business Profile can fetch them by public URL (GBP localPosts
// require media.sourceUrl to be a public https link — data: URLs are rejected).
// Public path: /gbp-media/<key>.jpg  (see redirect in netlify.toml)
import { getStore, connectLambda } from '@netlify/blobs';

export async function handler(event) {
  try {
    connectLambda(event);
    const key = String((event.queryStringParameters || {}).key || '').replace(/[^a-zA-Z0-9._-]/g, '');
    if (!key) {
      return { statusCode: 400, body: 'Missing key' };
    }

    const store = getStore('gbp-media');
    const data = await store.get(key, { type: 'arrayBuffer' });
    if (!data) {
      return { statusCode: 404, body: 'Not found' };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': key.endsWith('.png') ? 'image/png' : 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable'
      },
      body: Buffer.from(data).toString('base64'),
      isBase64Encoded: true
    };
  } catch (err) {
    console.error('gbp-image error:', err);
    return { statusCode: 500, body: 'Error loading image' };
  }
}
