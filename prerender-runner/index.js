const request = require('request');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

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

function updateHdb(id, content) {
  const hdUrl = `https://chicago-edgecloud9.harperdbcloud.com/prerender/save`;
  const token = 'eWtpbTokSWxvdmVKZXN1czEyMyE=';
  const data = {
    id: id,
    content: content
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

async function prerender(id, targetUrl) {
  const { stdout, stderr } = await exec(`curl http://localhost:3000/render?url=${targetUrl}`);

  updateHdb(id, stdout);

  return stdout;
}

const targetUrls = [
  "https://www.kohls.com/product/prd-3671767/mens-under-armour-sportstyle-tee.jsp",
  "https://www.kohls.com/product/prd-6471433/mens-under-armour-foundation-short-sleeve-tee.jsp",
  "https://www.kohls.com/product/prd-6458833/mens-under-armour-10-ua-zone-basketball-shorts.jsp",
  "https://www.brooksrunning.com/en_us",
  "https://www.brooksrunning.com/en_us/mens/apparel/shorts/",
  "https://www.brooksrunning.com/en_us/mens/apparel/bottoms/sherpa-7%22-2-in-1-short/211333.html",
  "https://www.edgecloud9.com"
];

for (const url of targetUrls) {
  const id = generateHashKey(url);
  const content = prerender(id, url);
}
