// Vercel serverless entry: boots the compiled Nest app once and reuses it.
// Static files (public/) are served by Vercel's CDN, so only views are set up here.
const { join } = require('path');
const { existsSync } = require('fs');
const { NestFactory } = require('@nestjs/core');
// Required explicitly so Vercel bundles modules Nest/Express only load dynamically.
require('@nestjs/platform-express');
const hbs = require('hbs');
const { AppModule } = require('../dist/app.module');

let cachedHandler;

async function getHandler() {
  if (!cachedHandler) {
    const app = await NestFactory.create(AppModule, { logger: ['error', 'warn'] });
    const viewsDir = join(__dirname, '..', 'views');
    if (!existsSync(join(viewsDir, 'index.hbs'))) {
      console.error(`Views not found in the deployed function: ${viewsDir}`);
    }
    app.setBaseViewsDir(viewsDir);
    app.engine('hbs', hbs.__express);
    app.setViewEngine('hbs');
    await app.init();
    cachedHandler = app.getHttpAdapter().getInstance();
  }
  return cachedHandler;
}

module.exports = async (req, res) => {
  const handler = await getHandler();
  return handler(req, res);
};
