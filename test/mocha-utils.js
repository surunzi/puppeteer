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

const product = process.env.PRODUCT || 'Chromium';

const isHeadless = (process.env.HEADLESS || 'true').trim().toLowerCase() === 'true';
const isFirefox = product === 'firefox';
const isChrome = product === 'Chromium';

const state = {};

// purposefully global
if (process.argv.some(part => part.includes('mocha'))) {

  global.itFailsFirefox = (...args) => {
    if (isFirefox)
      return xit(...args);
    else
      return it(...args);
  };

  global.describeFailsFirefox = (...args) => {
    if (isFirefox)
      return xdescribe(...args);
    else
      return describe(...args);
  };

  global.describeChromeOnly = (...args) => {
    if (isChrome)
      return describe(...args);
  };

  before(async() => {
    const defaultBrowserOptions = {
      handleSIGINT: false,
      executablePath: process.env.BINARY,
      slowMo: false,
      headless: isHeadless,
      dumpio: !!process.env.DUMPIO,
    };

    state.puppeteer = puppeteer;
    state.browser = await puppeteer.launch(defaultBrowserOptions);
    state.server = await setupServer();
    state.isFirefox = isFirefox;
    state.isChrome = isChrome;
    state.isHeadless = isHeadless;
  });

  beforeEach(async() => {
    state.server.reset();
    state.context = await state.browser.createIncognitoBrowserContext();
    state.page = await state.context.newPage();
  });

  afterEach(async() => {
    /* some tests deliberately clear out the pre-built context that we create
     * and if they do that we don't have a context to close
     * so this is wrapped in a try - and if it errors we don't need
     * to do anything
     */
    try {
      await state.context.close();
      state.context = null;
      state.page = null;
    } catch (e) {
      // do nothing - see larger comment above
    }
  });

  after(async() => {
    await state.browser.close();
    state.browser = null;
    await state.server.stop();
  });
}
