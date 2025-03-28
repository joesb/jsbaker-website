import { DateTime } from "luxon";
import CleanCSS from "clean-css";
import postCSS from "postcss";
import autoprefixer from "autoprefixer";
import UglifyJS from "uglify-js";
import pluginRss from "@11ty/eleventy-plugin-rss";
import eleventyNavigationPlugin from "@11ty/eleventy-navigation";
import Image from "@11ty/eleventy-img";
import { eleventyImageOnRequestDuringServePlugin } from "@11ty/eleventy-img";
import { EleventyHtmlBasePlugin } from "@11ty/eleventy";
import markdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";
import markdownItAttrs from "markdown-it-attrs";
import markdownItSmall from "markdown-it-small";
import markdownIt11tyImage from "markdown-it-eleventy-img";
import { inspect } from "util";
import timeToRead  from "eleventy-plugin-time-to-read";
import embedEverything from "eleventy-plugin-embed-everything";
import env from "./src/_data/env.js";
import { minify } from "html-minifier-terser";

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default async function(eleventyConfig) {

  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(eleventyNavigationPlugin);
  eleventyConfig.addPlugin(timeToRead, {
    speed: '850 characters per minute',
    style: "short"
  });
  eleventyConfig.addPlugin(embedEverything);
  eleventyConfig.addFilter("debug", (content) => `<pre>${inspect(content)}</pre>`);
  eleventyConfig.addPlugin(eleventyImageOnRequestDuringServePlugin);
  console.log(env.baseUrl);
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin, {
		// The base URL: defaults to Path Prefix
		// baseHref: eleventyConfig.pathPrefix,

		// But you could use a full URL here too:
		baseHref: env.baseUrl,

		// Comma separated list of output file extensions to apply
		// our transform to. Use `false` to opt-out of the transform.
		extensions: "html",
	});

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

  // Return responsive images
  eleventyConfig.addShortcode("image", async function(src, alt, cls, pictureCls = "", sizes = "(min-width: 30em) 50vw, 100vw", widths = [300, 600, 1000, 1980]) {
		if(alt === undefined) {
			// You bet we throw an error on missing alt (alt="" works okay)
			throw new Error(`Missing \`alt\` on responsiveimage from: ${src}`);
		}

		let metadata = await Image(src, {
			widths: widths,
			formats: ['webp', 'jpeg'],
      urlPath: "/static/img/",
      outputDir: "./static/img/"
		});

		let lowsrc = metadata.jpeg[0];
		let highsrc = metadata.jpeg[metadata.jpeg.length - 1];

		return `<picture class="${pictureCls}">
			${Object.values(metadata).map(imageFormat => {
				return `  <source type="${imageFormat[0].sourceType}" srcset="${imageFormat.map(entry => entry.srcset).join(", ")}" sizes="${sizes}">`;
			}).join("\n")}
				<img
					src="${lowsrc.url}"
					width="${highsrc.width}"
					height="${highsrc.height}"
          class="${cls}"
					alt="${alt}"
					loading="lazy"
					decoding="async">
			</picture>`;
	});

    // // Collection of items promotoed
    // eleventyConfig.addCollection('promotedContent', (collection) => {
    //   var items = collection.getAll().filter(item => item.data.promoted == true);
    //   return sortByOrder(items);
    // });

  eleventyConfig.addShortcode("link_internal", async function(url) {
    var collections = this.ctx.environments.collections;
    var page = collections.all.filter(item => item.url == url);
    if (!page.length) {
      throw new Error(`Cannot find page with URL ${url}`);
    }
    var thePage = page[0];
    var theEmbed = `<div class="faux-block-link-parent link--internal">
      <div class="link--internal__content">
        <h2>${thePage.data.title}</h2>`;
    if (thePage.data.description) {
      theEmbed += `<div class="summary">${thePage.data.description}</div>`;
    }
    theEmbed += `
      </div>`;
    if (thePage.data.image) {
      var image = thePage.data.image;
      var picture = await getPictureMarkup(image.path, image.alt, image.class, "link--internal__image__picture", "(min-width: 30em) 50vw, 100vw", [100, 200]);
      theEmbed += `
      <div class="link--internal__image">
        ${picture}
      </div>
      `;
    }
    theEmbed += `<a href="${thePage.url}" class="faux-block-link">
        <span class="hide-text" aria-hidden="true">${thePage.data.title}</span>
      </a>
    </div>`;

    return theEmbed
  });

  eleventyConfig.addAsyncShortcode("imageData", async function(src) {
    var picture = await getPictureData(src, [800]);
    return picture.jpeg[0].outputPath;
  });

  // Minify CSS
  eleventyConfig.addFilter('cssmin', function (code) {
    let css = new CleanCSS({}).minify(code).styles;
    return postCSS([ autoprefixer ]).process(css).css;
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

  // Minify HTML
  eleventyConfig.addTransform("htmlmin", function (content) {
		if ((this.page.outputPath || "").endsWith(".html")) {
			let minified = minify(content, {
				useShortDoctype: true,
				removeComments: true,
				collapseWhitespace: true,
			});

			return minified;
		}

		// If not an HTML output, return content as-is
		return content;
	});

  // Check a string starts with a character.
  eleventyConfig.addFilter('starts_with', function(str, prefix, not = false) {
    return str.startsWith(prefix) !== not;
  });

  eleventyConfig.addFilter('fromJson', JSON.parse);
  eleventyConfig.addFilter('toJson', JSON.stringify);

   // Encode a URL string
   eleventyConfig.addFilter('encodeUri', (text) => {
    return encodeURI(text);
  });

  eleventyConfig.addFilter("hasTag", (tags, tag, not = true) => {
    return (tags || []).includes(tag) === not;
  });

  eleventyConfig.addFilter("readableDate", (dateObj, format, zone) => {
		// Formatting tokens for Luxon: https://moment.github.io/luxon/#/formatting?id=table-of-tokens
		return DateTime.fromJSDate(dateObj, { zone: zone || "utc" }).toFormat(format || "dd LLLL yyyy");
	});

	eleventyConfig.addFilter('htmlDateString', (dateObj) => {
		// dateObj input: https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
		return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat('yyyy-LL-dd');
	});

	// Return all the tags used in a collection
	eleventyConfig.addFilter("getAllTags", collection => {
		let tagSet = new Set();
		for(let item of collection) {
			(item.data.tags || []).forEach(tag => tagSet.add(tag));
		}
		 let tsArray = Array.from(tagSet);
     return tsArray.sort();
	});

	eleventyConfig.addFilter("filterTagList", function filterTagList(tags) {
		return (tags || []).filter(tag => ['all', 'nav', 'rss', '#reading', '#writing', '#thinking', 'Reading', 'Thinking', 'promotedContent', 'footerNav', 'footerSecondaryNav', 'mainNav', 'allContent', 'reading', 'writing', 'thinking'].indexOf(tag) === -1);
	});


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

  // Sort writing, reading, thinking pieces by 'order' field
  eleventyConfig.addCollection('allContent', (collection) => {
    var contentTags = ['#writing', '#reading', '#thinking'];
    var nav = collection.getAll().filter(function (item) {
      const itemTags = item.data.tags;
      if (Array.isArray(itemTags)) {
        return itemTags.some(v => contentTags.includes(v));
      }
      else {
        return;
      }
    });
    return sortByDate(nav).reverse();
  });

  // Collection of items promotoed
  eleventyConfig.addCollection('promotedContent', (collection) => {
    var items = collection.getAll().filter(item => item.data.promoted == true);
    return sortByOrder(items);
  });

  // Sort writing pieces by 'order' field
  eleventyConfig.addCollection('writing', (collection) => {
    var nav = collection.getFilteredByTag('#writing');
    return sortByDate(nav).reverse();
  });

  // Sort reading pieces by 'order' field
  eleventyConfig.addCollection('reading', (collection) => {
    var nav = collection.getFilteredByTag('#reading');
    return sortByDate(nav).reverse();
  });

  // Sort thinking pieces by 'order' field
  eleventyConfig.addCollection('thinking', (collection) => {
    var nav = collection.getFilteredByTag('#thinking');
    return sortByDate(nav).reverse();
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

  eleventyConfig.addFilter('sort_by_date', function (collection) {
    return sortByDate(collection);
  });

  function sortByTitle(collection) {
    return collection.sort((a, b) => {
      if (a.data.title < b.data.title) return -1;
      else if (a.data.title > b.data.title) return 1;
      else return 0;
    });
  }

  async function getPictureMarkup(src, alt, cls, pictureCls = "", sizes = "(min-width: 30em) 50vw, 100vw", widths = [300, 600, 1000, 1980]) {
		if(alt === undefined) {
			// You bet we throw an error on missing alt (alt="" works okay)
			throw new Error(`Missing \`alt\` on responsiveimage from: ${src}`);
		}

		let metadata = await Image(src, {
			widths: widths,
			formats: ['webp', 'jpeg'],
      urlPath: "/static/img/",
      outputDir: "./static/img/"
		});

		let lowsrc = metadata.jpeg[0];
		let highsrc = metadata.jpeg[metadata.jpeg.length - 1];

		return `<picture class="${pictureCls}">
			${Object.values(metadata).map(imageFormat => {
				return `  <source type="${imageFormat[0].sourceType}" srcset="${imageFormat.map(entry => entry.srcset).join(", ")}" sizes="${sizes}">`;
			}).join("\n")}
				<img
					src="${lowsrc.url}"
					width="${highsrc.width}"
					height="${highsrc.height}"
          class="${cls}"
					alt="${alt}"
					loading="lazy"
					decoding="async">
			</picture>`;
	};

  async function getPictureData(src, widths = [300, 600, 1000, 1980]) {
    let metadata = await Image(src, {
			widths: widths,
			formats: ['jpeg'],
      urlPath: "/static/img/",
      outputDir: "./static/img/"
		});
    return metadata;
  };

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
  }).use(markdownItAttrs).use(markdownItSmall).use(markdownIt11tyImage);
  eleventyConfig.setLibrary("md", markdownLibrary);

  eleventyConfig.addFilter("markdown", (content) => {
    return markdownLibrary.render(content);
  });

  eleventyConfig.addPassthroughCopy('static/');
  // eleventyConfig.addPassthroughCopy('CNAME');
  eleventyConfig.addWatchTarget('./src/sass/');
};

export const config = {
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
    includes: '../src/_includes',
    layouts: '../src/_includes/layouts',
    data: '../src/_data',
    output: '_site',
  },
};
