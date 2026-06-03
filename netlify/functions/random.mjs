const CONFIG_URL = 'https://raw.githubusercontent.com/solovyov-jenya2004/all_subs/main/final_sorted';
const TIMEOUT_MS = 10000; // 10 секунд

async function fetchConfigLines(signal) {
  const response = await fetch(CONFIG_URL, { signal });
  if (!response.ok) {
    throw new Error(`GitHub error: ${response.status}`);
  }
  const text = await response.text();
  return text.split('\n').map(l => l.trim());
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default async function handler(req) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const lines = await fetchConfigLines(controller.signal);
    clearTimeout(timeoutId);

    const headers = [];
    const proxies = [];
    for (const line of lines) {
      if (line.startsWith('#')) headers.push(line);
      else if (line.length > 0) proxies.push(line);
    }

    // Если прокси пусты — возвращаем только заголовки
    if (proxies.length === 0) {
      return new Response(headers.join('\n') + '\n', {
        status: 200,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }

    const url = new URL(req.url);
    let n = parseInt(url.searchParams.get('n'), 10);
    if (isNaN(n) || n < 1) {
      n = 100;
    } else if (n > proxies.length) {
      n = proxies.length; // не пытаемся выбрать больше, чем есть
    }

    const shuffled = shuffle([...proxies]);
    const selected = shuffled.slice(0, n);
    const responseLines = [...headers, '', ...selected];
    const body = responseLines.join('\n');

    return new Response(body, {
      status: 200,
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
      }
    });
  } catch (err) {
    clearTimeout(timeoutId);
    console.error(err);
    const message = err.name === 'AbortError' ? '# Timeout fetching data\n' : '# Server error\n';
    return new Response(message, {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}
