import https from 'https';

const CONFIG_URL = 'https://raw.githubusercontent.com/solovyov-jenya2004/all_subs/main/final_sorted';

async function fetchConfigLines() {
  const data = await new Promise((resolve, reject) => {
    https.get(CONFIG_URL, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(body));
    }).on('error', reject);
  });
  return data.split('\n').map(l => l.trim());
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default async function handler(req) {
  try {
    const lines = await fetchConfigLines();
    const headers = [];
    const proxies = [];
    for (const line of lines) {
      if (line.startsWith('#')) headers.push(line);
      else if (line.length > 0) proxies.push(line);
    }

    if (proxies.length === 0) {
      return new Response(headers.join('\n') + '\n', {
        status: 200,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }

    const url = new URL(req.url);
    let n = parseInt(url.searchParams.get('n'), 10);
    if (isNaN(n) || n < 1) n = 100;
    n = Math.min(n, proxies.length);

    const shuffled = shuffle([...proxies]);
    const selected = shuffled.slice(0, n);
    const responseLines = [...headers, '', ...selected];
    const body = responseLines.join('\n');

    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Subscription-Userinfo': 'upload=0; download=0; total=0',
        'Content-Disposition': "inline; filename=\"all_subs\"; filename*=UTF-8''%F0%9F%9A%80%20all_subs",
        'profile-title': "inline; \"all_subs\"; UTF-8''%F0%9F%9A%80%20all_subs",
        'announce': "UTF-8''%E2%9A%A1%20%D0%98%D1%81%D0%BF%D0%BE%D0%BB%D1%8C%D0%B7%D1%83%D0%B9%D1%82%D0%B5%20%D0%BA%D0%BE%D0%BD%D1%84%D0%B8%D0%B3%D1%83%D1%80%D0%B0%D1%86%D0%B8%D0%B8%20%D1%82%D0%BE%D0%BB%D1%8C%D0%BA%D0%BE%20%D0%B2%20%D1%83%D1%81%D0%BB%D0%BE%D0%B2%D0%B8%D1%8F%D1%85%20%C2%AB%D0%B1%D0%B5%D0%BB%D1%8B%D1%85%20%D1%81%D0%BF%D0%B8%D1%81%D0%BA%D0%BE%D0%B2%C2%BB",
        'profile-web-page-url': 'https://github.com/solovyov-jenya2004/all_subs',
        'support-url': 'https://github.com/solovyov-jenya2004/all_subs/issues',
        'profile-update-interval': '1'     
      }
    });
  } catch (err) {
    console.error(err);
    return new Response('# Server error\n', {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}
