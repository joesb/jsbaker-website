import 'dotenv/config';
const environment = process.env.ELEVENTY_ENV;
const PROD_ENV = 'production';
const prodUrl = 'https://www.jsbaker.co.uk';
const previewUrl = process.env.CF_PAGES_URL;
const devUrl = 'http://localhost:8080';
const baseUrl = getBaseUrl();
const isProd = environment === PROD_ENV;

export default {
  environment,
  isProd,
  baseUrl,
  prodUrl,
  base: {
      site: baseUrl,
  },
};

function getBaseUrl() {
  let url = devUrl;
  switch (environment) {
    case 'production':
      url = prodUrl;
      break;
    case 'preview':
      url = previewUrl;
      break;
  }
  return url;
}