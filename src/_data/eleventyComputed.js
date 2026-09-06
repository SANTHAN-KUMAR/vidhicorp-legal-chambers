function pickRelated(collection, currentUrl, max) {
  if (!collection) return [];
  return collection.filter((item) => item.url !== currentUrl).slice(0, max);
}

module.exports = {
  sectionLabel: (data) => {
    if (data.page.filePathStem.startsWith("/legal-insights/")) return "Legal Insights";
    if (data.page.filePathStem.startsWith("/legal-updates/")) return "Legal Updates";
    return undefined;
  },
  sectionUrl: (data) => {
    if (data.page.filePathStem.startsWith("/legal-insights/")) return "/legal-insights/";
    if (data.page.filePathStem.startsWith("/legal-updates/")) return "/legal-updates/";
    return undefined;
  },
  relatedItems: (data) => {
    if (data.page.filePathStem.startsWith("/legal-insights/") && data.page.filePathStem !== "/legal-insights/legal-insights") {
      return pickRelated(data.collections.legalInsights, data.page.url, 2);
    }
    if (data.page.filePathStem.startsWith("/legal-updates/") && data.page.filePathStem !== "/legal-updates/legal-updates") {
      return pickRelated(data.collections.legalUpdates, data.page.url, 2);
    }
    return [];
  },

  // Practice Areas page: an ItemList of all Service entries, built from the
  // practiceAreas data file so it always matches what's actually on the page.
  schema: (data) => {
    if (data.pageSchema) return data.pageSchema;

    // Legal Updates are short, timely notes on judgments, legislation and
    // regulatory developments — NewsArticle is the genuinely applicable type.
    if (
      data.page.filePathStem.startsWith("/legal-updates/") &&
      data.page.filePathStem !== "/legal-updates/legal-updates"
    ) {
      return {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        headline: data.title,
        description: data.description,
        image: data.image,
        datePublished: data.date,
        dateModified: data.date,
        articleSection: data.tag,
        inLanguage: "en-IN",
        isAccessibleForFree: true,
        mainEntityOfPage: { "@type": "WebPage", "@id": `${data.site.domain}${data.page.url}` },
        author: {
          "@type": "Person",
          name: data.author || data.team.founder.name,
          jobTitle: data.team.founder.title,
          url: `${data.site.domain}/team/`,
        },
        publisher: {
          "@type": "Organization",
          name: data.site.name,
          url: `${data.site.domain}/`,
          logo: { "@type": "ImageObject", url: `${data.site.domain}/images/logo-lockup.png` },
        },
      };
    }

    if (data.page.url === "/team/") {
      return [
        {
          "@context": "https://schema.org",
          "@type": "Person",
          name: data.team.founder.name,
          jobTitle: data.team.founder.title,
          image: `${data.site.domain}${data.team.founder.portrait}`,
          url: `${data.site.domain}/team/`,
          worksFor: { "@type": "LegalService", name: data.site.name, url: `${data.site.domain}/` },
          alumniOf: data.team.founder.education.map((e) => ({ "@type": "CollegeOrUniversity", name: e })),
          award: data.team.founder.awards,
          sameAs: [data.team.founder.linkedin],
        },
        {
          "@context": "https://schema.org",
          "@type": "Person",
          name: data.team.coFounder.name,
          jobTitle: data.team.coFounder.title,
          image: `${data.site.domain}${data.team.coFounder.portrait}`,
          url: `${data.site.domain}/team/`,
          worksFor: { "@type": "LegalService", name: data.site.name, url: `${data.site.domain}/` },
        },
      ];
    }

    if (data.page.url !== "/practice-areas/") return null;
    return [
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "VidhiCorp Legal Chambers — Practice Areas",
        numberOfItems: data.practiceAreas.length,
        itemListElement: data.practiceAreas.map((pa, i) => ({
          "@type": "Service",
          position: i + 1,
          name: pa.name,
          url: `${data.site.domain}/practice-areas/#${pa.id}`,
          provider: { "@id": `${data.site.domain}/#organization` },
          areaServed: "IN",
          description: pa.shortDesc,
        })),
      },
      // Sectors are a distinct axis from practice areas — declaring them
      // separately lets search and AI systems answer "whom do they advise?"
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "VidhiCorp Legal Chambers — Sectors Served",
        numberOfItems: data.sectors.length,
        itemListElement: data.sectors.map((sec, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: sec.name,
          url: `${data.site.domain}/practice-areas/#${sec.id}`,
          description: sec.desc,
        })),
      },
    ];
  },

  // Auto-generate a 2-level BreadcrumbList (Home > Page) for every page.
  // Pages needing a deeper trail (e.g. Home > Legal Insights > Article) set
  // `breadcrumbSchemaOverride` directly in their own front matter instead —
  // base.njk prefers that when present.
  breadcrumbSchema: (data) => {
    if (!data.title || data.page.url === "/") return null;

    // Articles sitting inside a section get a 3-level trail that matches the
    // visible breadcrumb: Home > Section > Article.
    if (data.sectionLabel && data.sectionUrl && data.page.url !== data.sectionUrl) {
      return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${data.site.domain}/` },
          { "@type": "ListItem", position: 2, name: data.sectionLabel, item: `${data.site.domain}${data.sectionUrl}` },
          { "@type": "ListItem", position: 3, name: data.title, item: `${data.site.domain}${data.page.url}` },
        ],
      };
    }

    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${data.site.domain}/` },
        { "@type": "ListItem", position: 2, name: data.title, item: `${data.site.domain}${data.page.url}` },
      ],
    };
  },
};
