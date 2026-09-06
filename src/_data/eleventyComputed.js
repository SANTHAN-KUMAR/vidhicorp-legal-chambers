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
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "VidhiCorp Legal Chambers — Practice Areas",
      itemListElement: data.practiceAreas.map((pa, i) => ({
        "@type": "Service",
        position: i + 1,
        name: pa.name,
        provider: { "@type": "LegalService", name: data.site.name },
        areaServed: "IN",
        description: pa.shortDesc,
      })),
    };
  },

  // Auto-generate a 2-level BreadcrumbList (Home > Page) for every page.
  // Pages needing a deeper trail (e.g. Home > Legal Insights > Article) set
  // `breadcrumbSchemaOverride` directly in their own front matter instead —
  // base.njk prefers that when present.
  breadcrumbSchema: (data) => {
    if (!data.title || data.page.url === "/") return null;
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
