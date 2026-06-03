export default async function handler(req) {
  const GITHUB_URL = 'https://raw.githubusercontent.com/solovyov-jenya2004/all_subs/main/final_sorted';
  try {
    const response = await fetch(GITHUB_URL);
    if (!response.ok) {
      return new Response(`GitHub error: ${response.status}`, {
        status: 502,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }
    const body = await response.text();
    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Subscription-Userinfo': 'upload=0; download=0; total=0',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Disposition': "inline; filename=\"all_subs\"; filename*=UTF-8''%F0%9F%9A%80%20all_subs"
      }
    });
  } catch (error) {
    return new Response(`Worker error: ${error.message}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}
