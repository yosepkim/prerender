const prerender = require('prerender');
const server = prerender({
    waitAfterLastRequest: 10000,
    chromeFlags: ['--no-sandbox', '--headless', '--disable-gpu', '--remote-debugging-port=9222', '--hide-scrollbars']
  });
server.start();
