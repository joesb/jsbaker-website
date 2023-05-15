const CleanCSS = require('clean-css');
const UglifyJS = require('uglify-es');
const htmlmin = require('html-minifier');
const pluginRss = require('@11ty/eleventy-plugin-rss');
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");

module.exports = function (eleventyConfig) {

  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(eleventyNavigationPlugin);

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

  // Check a string starts with a character.
  eleventyConfig.addFilter('starts_with', function(str, prefix, not = false) {
    return str.startsWith(str, prefix) !== not;
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

  eleventyConfig.addFilter('fromJson', JSON.parse);
  eleventyConfig.addFilter('toJson', JSON.stringify);


  function sortByOrder(collection) {
    return collection.sort((a, b) => {
      if (a.data.order < b.data.order) return -1;
      else if (a.data.order > b.data.order) return 1;
      else return 0;
    });
  }

  function sortByDate(collection) {
    return collection.sort((a, b) => {
      if (a.data.date < b.data.date) return -1;
      else if (a.data.date > b.data.date) return 1;
      else return 0;
    });
  }

  function sortByTitle(collection) {
    return collection.sort((a, b) => {
      if (a.data.title < b.data.title) return -1;
      else if (a.data.title > b.data.title) return 1;
      else return 0;
    });
  }

  // Sort footer menu items by 'order' field
  eleventyConfig.addCollection('footerNav', (collection) => {
    var nav = collection.getFilteredByTag('#footer');
    return sortByOrder(nav);
  });

  // Sort footer secondary menu items by 'order' field
  eleventyConfig.addCollection('footerSecondaryNav', (collection) => {
    var nav = collection.getFilteredByTag('#footersecondary');
    return sortByOrder(nav);
  });

  // Sort main menu items by 'order' field
  eleventyConfig.addCollection('mainNav', (collection) => {
    var nav = collection.getFilteredByTag('#nav');
    return sortByOrder(nav);
  });

  // Sort Soul Song pieces by 'order' field
  eleventyConfig.addCollection('writing', (collection) => {
    var nav = collection.getFilteredByTag('#writing');
    return sortByOrder(nav);
  });

  function sortByOrder(collection) {
    return collection.sort((a, b) => {
      if (a.data.order < b.data.order) return -1;
      else if (a.data.order > b.data.order) return 1;
      else return 0;
    });
  }

  function sortByDate(collection) {
    return collection.sort((a, b) => {
      if (a.data.date < b.data.date) return -1;
      else if (a.data.date > b.data.date) return 1;
      else return 0;
    });
  }

  function sortByTitle(collection) {
    return collection.sort((a, b) => {
      if (a.data.title < b.data.title) return -1;
      else if (a.data.title > b.data.title) return 1;
      else return 0;
    });
  }

  // Customize Markdown library and settings:
  let markdownLibrary = markdownIt({
    html: true,
    breaks: true,
    linkify: true
  }).use(markdownItAnchor, {
    permalink: markdownItAnchor.permalink.ariaHidden({
      placement: "after",
      class: "direct-link visually-hidden",
      symbol: "#",
      level: [1,2,3,4],
    }),
    slugify: eleventyConfig.getFilter("slug")
  });
  eleventyConfig.setLibrary("md", markdownLibrary);

  eleventyConfig.addFilter("markdown", (content) => {
    return markdownLibrary.render(content);
  });

  eleventyConfig.addPassthroughCopy('static/');

  return {
    templateFormats: ['md', 'njk', 'html', 'liquid'],

    // If your site lives in a different subdirectory, change this.
    // Leading or trailing slashes are all normalized away, so don’t worry about it.
    // If you don’t have a subdirectory, use "" or "/" (they do the same thing)
    // This is only used for URLs (it does not affect your file structure)
    pathPrefix: '/',

    markdownTemplateEngine: 'liquid',
    htmlTemplateEngine: 'njk',
    dataTemplateEngine: 'njk',
    passthroughFileCopy: true,
    dir: {
      input: 'pages',
      includes: '../_includes',
      data: '../_data',
      output: '_site',
    },
  };
};