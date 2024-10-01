import request from 'request';
import util from 'util';
import child_process from 'child_process';
import Crawler from "crawler";

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

function isSameHost(originHost, url) {
  const location = getLocation(originHost);
  const rootDomain = location ? location.hostname.split('.').reverse().splice(0,2).reverse().join('.') : '';
  if ((location && url.startsWith('http') && url.includes(rootDomain)) || url.startsWith('/')) {
    return true;
  }
  return false;
}

let obselete = [];

let c = new Crawler();

function crawlAllUrls(url) {
  console.log(`Crawling ${url}`);
  c.queue({
      uri: url,
      callback: function (err, res, done) {
          if (err) throw err;
          let $ = res.$;
          try {
              let urls = $("a");
              Object.keys(urls).forEach((item) => {
                  if (urls[item].type === 'tag') {
                      let href = urls[item].attribs.href;
                      if (href && !obselete.includes(href) && isSameHost(url, href)) {
                          href = href.trim();
                          obselete.push(href);

                          let targetUrl = href.split('?')[0];
                          if (targetUrl.startsWith('/')) {
                            targetUrl = `${url}${targetUrl}`
                          }
        
                          prerender(targetUrl);

                          setTimeout(function() {
                              crawlAllUrls(targetUrl);
                          }, 10000)

                      }
                  }
              });
          } catch (e) {
              console.error(`Encountered an error crawling ${url}. Aborting crawl.`);
              done()

          }
          done();
      }
  })
}

crawlAllUrls("https://www.brooksrunning.com/en_us/sitemap/");