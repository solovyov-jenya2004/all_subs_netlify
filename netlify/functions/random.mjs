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

export default async function handler(event, context) {
  try {
    const lines = await fetchConfigLines();
    const headers = [];
    const proxies = [];
    for (const line of lines) {
      if (line.startsWith('#')) headers.push(line);
      else if (line.length > 0) proxies.push(line);
    }

    if (proxies.length === 0) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        body: headers.join('\n') + '\n'
      };
    }

    const params = event.queryStringParameters || {};
    let n = parseInt(params.n, 10);
    if (isNaN(n) || n < 1) n = 100;
    n = Math.min(n, proxies.length);

    const shuffled = shuffle([...proxies]);
    const selected = shuffled.slice(0, n);
    const responseLines = [...headers, '', ...selected];
    const body = responseLines.join('\n');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Disposition': 'inline; filename="random_sub.txt"',
        'profile-title': 'all_subs (random)',
        'announce': 'Random subscription from the pool',
        'profile-web-page-url': 'https://github.com/solovyov-jenya2004/all_subs',
        'support-url': 'https://github.com/solovyov-jenya2004/all_subs/issues',
        'profile-update-interval': '1',
        'subscription-userinfo': 'upload=0; download=0; total=0'
      },
      body
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      body: '# Server error\n'
    };
  }
}
