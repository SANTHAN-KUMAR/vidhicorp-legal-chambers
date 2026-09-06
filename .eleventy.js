module.exports = function (eleventyConfig) {
  // Static passthrough — keep existing asset paths unchanged
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/videos");
  eleventyConfig.addPassthroughCopy("src/favicon.ico");
  eleventyConfig.addPassthroughCopy("src/site.webmanifest");
  eleventyConfig.addPassthroughCopy("src/robots.txt");
  eleventyConfig.addPassthroughCopy("src/llms-full.txt");
  eleventyConfig.addPassthroughCopy("src/_redirects");
  eleventyConfig.addPassthroughCopy("src/.htaccess");
  eleventyConfig.addPassthroughCopy("src/admin");
  eleventyConfig.addPassthroughCopy({ "src/CNAME_TEMPLATE.txt": "CNAME_TEMPLATE.txt" });

  eleventyConfig.addFilter("dateDisplay", (isoDate) => {
    if (!isoDate) return "";
    const d = new Date(isoDate + "T00:00:00");
    return d.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
  });

  eleventyConfig.addFilter("rssDate", (isoDate) => {
    if (!isoDate) return "";
    const d = new Date(isoDate + "T00:00:00+05:30");
    return d.toUTCString().replace("GMT", "+0000");
  });

  eleventyConfig.addFilter("monthYear", (isoDate) => {
    if (!isoDate) return "";
    const d = new Date(isoDate + "T00:00:00");
    return d.toLocaleDateString("en-IN", { year: "numeric", month: "short" });
  });

  eleventyConfig.addCollection("legalInsights", (api) =>
    api.getFilteredByGlob("src/legal-insights/*.md").sort(
      (a, b) => new Date(b.data.date) - new Date(a.data.date)
    )
  );

  eleventyConfig.addCollection("legalUpdates", (api) =>
    api.getFilteredByGlob("src/legal-updates/*.md").sort(
      (a, b) => new Date(b.data.date) - new Date(a.data.date)
    )
  );

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};
