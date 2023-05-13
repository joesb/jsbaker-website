const CleanCSS = require('clean-css');
const UglifyJS = require('uglify-es');
const htmlmin = require('html-minifier');
// const pluginRss = require('@11ty/eleventy-plugin-rss');

module.exports = function (eleventyConfig) {

  // Return active path attributes
  eleventyConfig.addShortcode('activepath', function (itemUrl, currentUrl) {
    if (itemUrl == '/' && itemUrl !== currentUrl) {
      return '';
    }
    if (currentUrl && currentUrl.includes(itemUrl)) {
      return ' data-current="current item" class="current"';
    }
    return '';
  });

  // Minify CSS
  eleventyConfig.addFilter('cssmin', function (code) {
    return new CleanCSS({}).minify(code).styles;
  });

  // Minify JS
  eleventyConfig.addFilter('jsmin', function (code) {
    let minified = UglifyJS.minify(code);
    if (minified.error) {
      console.log('UglifyJS error: ', minified.error);
      return code;
    }
    return minified.code;
  });

  // Minify HTML output
  eleventyConfig.addTransform('htmlmin', function (content, outputPath) {
    if (outputPath && outputPath.indexOf('.html') > -1) {
        let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
        });
        return minified;
    }
    return content;
  });
};