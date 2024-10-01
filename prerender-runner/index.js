import request from 'request';
import util from 'util';
import child_process from 'child_process';

const exec = util.promisify(child_process.exec);

function generateHashKey(stringInput) {
  const stringData = stringInput.replace(/\s/g, "");
  let hash = 0, i, chr;
  if (stringData.length === 0) return hash;
  for (i = 0; i < stringData.length; i++) {
    chr = stringData.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return hash;
}

function getLocation(href) {
  var match = href.match(/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)([\/]{0,1}[^?#]*)(\?[^#]*|)(#.*|)$/);
  return match && {
    href: href,
    protocol: match[1],
    host: match[2],
    hostname: match[3],
    port: match[4],
    pathname: match[5],
    search: match[6],
    hash: match[7]
  }
}

function updateHdb(id, content, url) {
  const hdUrl = `https://miami-edgecloud9.harperdbcloud.com/prerender/save`;
  const token = 'eWtpbTokSWxvdmVKZXN1czEyMyE=';
  const data = {
    id: id,
    content: content,
    url: url
  };

  request({
    url: hdUrl,
    method: 'POST',
    headers: { 'Authorization': `Basic ${token}`, 'Content-Type': 'application/json' },
    body: data,
    json: true
  }, function (error, response, body) {
    console.log(body);
  });
}

async function prerender(url) {
  const targetUrl = url.replace(/\/?$/, '/');
  const id = generateHashKey(targetUrl);
  const location = getLocation(targetUrl);

  const { stdout, stderr } = await exec(`curl http://localhost:3000/render?url=${targetUrl}`, { maxBuffer: 1024 * 5000 });
  const cleaned = stdout.replaceAll('href=\"/', `href="${location.protocol}//${location.host}/`);
  updateHdb(id, cleaned, targetUrl);

  return cleaned;
}

const args = process.argv;

prerender(args[2]);

//crawlAllUrls("https://www.brooksrunning.com/en_us/sitemap/");