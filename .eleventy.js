module.exports = function (eleventyConfig) {
  // Static passthrough — keep existing asset paths unchanged
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/videos");
  eleventyConfig.addPassthroughCopy("src/favicon.ico");
  eleventyConfig.addPassthroughCopy("src/site.webmanifest");
  eleventyConfig.addPassthroughCopy("src/robots.txt");
  eleventyConfig.addPassthroughCopy("src/_redirects");
  eleventyConfig.addPassthroughCopy("src/.htaccess");
  eleventyConfig.addPassthroughCopy("src/admin");
  eleventyConfig.addPassthroughCopy({ "src/CNAME_TEMPLATE.txt": "CNAME_TEMPLATE.txt" });

  // YAML parses an unquoted `date: 2026-09-01` into a Date object, while a
  // quoted one stays a string. Normalise both to a Date before formatting —
  // concatenating "T00:00:00" onto a Date produced "Invalid Date" everywhere.
  const toDate = (value) => {
    if (!value) return null;
    if (value instanceof Date) return isNaN(value) ? null : value;
    if (typeof value === "string") {
      const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? value + "T00:00:00" : value);
      return isNaN(d) ? null : d;
    }
    const d = new Date(value);
    return isNaN(d) ? null : d;
  };

  eleventyConfig.addFilter("dateDisplay", (value) => {
    const d = toDate(value);
    return d ? d.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Kolkata" }) : "";
  });

  eleventyConfig.addFilter("rssDate", (value) => {
    const d = toDate(value);
    return d ? d.toUTCString() : "";
  });

  eleventyConfig.addFilter("monthYear", (value) => {
    const d = toDate(value);
    return d ? d.toLocaleDateString("en-IN", { year: "numeric", month: "short", timeZone: "Asia/Kolkata" }) : "";
  });

  eleventyConfig.addFilter("isoDate", (value) => {
    const d = toDate(value);
    return d ? d.toISOString().slice(0, 10) : "";
  });

  // Re-request remote images at the size they are actually displayed.
  // Cover images are authored (and entered in the CMS) at article size; a
  // 16:10 card or a filtered background hero does not need those pixels.
  eleventyConfig.addFilter("imgSize", (url, width, quality) => {
    if (!url || typeof url !== "string") return url;
    if (!/^https?:\/\/images\.unsplash\.com\//.test(url)) return url;
    try {
      const u = new URL(url);
      u.searchParams.set("w", String(width));
      u.searchParams.set("q", String(quality || 60));
      u.searchParams.set("auto", "format");
      u.searchParams.set("fit", "crop");
      return u.toString();
    } catch (e) {
      return url;
    }
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
