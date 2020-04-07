const {TestServer} = require('../utils/testserver/index');
const path = require('path');
const puppeteer = require('../');

const setupServer = async() => {
  const assetsPath = path.join(__dirname, 'assets');
  const cachedPath = path.join(__dirname, 'assets', 'cached');

  const port = 8907;
  const server = await TestServer.create(assetsPath, port);
  server.enableHTTPCache(cachedPath);
  server.PORT = port;
  server.PREFIX = `http://localhost:${port}`;
  server.CROSS_PROCESS_PREFIX = `http://127.0.0.1:${port}`;
  server.EMPTY_PAGE = `http://localhost:${port}/empty.html`;
  // const httpsPort = port + 1;
  // httpsServer = await TestServer.createHTTPS(assetsPath, httpsPort);
  // httpsServer.enableHTTPCache(cachedPath);
  // httpsServer.PORT = httpsPort;
  // httpsServer.PREFIX = `https://localhost:${httpsPort}`;
  // httpsServer.CROSS_PROCESS_PREFIX = `https://127.0.0.1:${httpsPort}`;
  // httpsServer.EMPTY_PAGE = `https://localhost:${httpsPort}/empty.html`;

  return server;
};

exports.getTestState = () => state;

const state = {};

// purposefully global
if (process.argv.some(part => part.includes('mocha'))) {

  global.itFailsFirefox = (...args) => {
    if (process.env.PRODUCT === 'firefox')
      return xit(...args);
    else
      return it(...args);
  };

  before(async() => {
    state.browser = await puppeteer.launch();
    state.server = await setupServer();
  });

  beforeEach(async() => {
    state.server.reset();
    state.context = await state.browser.createIncognitoBrowserContext();
    state.page = await state.context.newPage();
  });

  after(async() => {
    await state.browser.close();
    await state.server.stop();
  });
}
