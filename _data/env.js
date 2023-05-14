const environment = process.env.ELEVENTY_ENV;
const PROD_ENV = 'production';
const prodUrl = 'https://www.jsbaker.co.uk';
const devUrl = 'http://localhost:8080';
const baseUrl = environment === PROD_ENV ? prodUrl : devUrl;
const isProd = environment === PROD_ENV;

module.exports = {
  environment,
  isProd,
  base: {
      site: baseUrl,
  },
};