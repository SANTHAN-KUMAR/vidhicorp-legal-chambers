const site = require("./site.json");
const team = require("./team.json");
const offices = require("./offices.json");

module.exports = () => {
  const hq = offices.find((o) => o.isHeadOffice) || offices[0];
  const sameAs = [site.social.linkedin, site.social.facebook, site.social.instagram, site.social.twitter].filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": ["LegalService", "Attorney", "Organization"],
    "@id": `${site.domain}/#organization`,
    name: site.name,
    description:
      "End-to-end legal, compliance, HR and POSH solutions. Strategic legal partner for businesses across corporate, commercial, employment, compliance and dispute resolution matters.",
    image: `${site.domain}/images/og-image.jpg`,
    logo: `${site.domain}/images/logo-crest.png`,
    url: `${site.domain}/`,
    areaServed: ["IN"],
    address: {
      "@type": "PostalAddress",
      streetAddress: hq.addressLines.slice(0, 2).join(", "),
      addressLocality: hq.city,
      addressRegion: hq.region,
      postalCode: hq.postalCode,
      addressCountry: hq.country,
    },
    geo: hq.geo ? { "@type": "GeoCoordinates", latitude: hq.geo.latitude, longitude: hq.geo.longitude } : undefined,
    hasMap: `https://www.google.com/maps?q=${encodeURIComponent(hq.mapQuery)}`,
    telephone: site.phones.map((p) => p.href.replace(/^\+?/, "+")),
    email: site.primaryEmail,
    priceRange: "$$",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "09:30",
      closes: "18:30",
    },
    founder: {
      "@type": "Person",
      name: team.founder.name,
      jobTitle: team.founder.title,
      alumniOf: team.founder.education.map((e) => ({ "@type": "CollegeOrUniversity", name: e })),
      award: team.founder.awards,
      sameAs: [team.founder.linkedin],
    },
    knowsAbout: [
      "Corporate Law", "Mergers & Acquisitions", "Dispute Resolution", "Arbitration",
      "Employment Law", "POSH Compliance", "Regulatory Compliance", "Intellectual Property Rights",
      "Cross-Border Transactions", "Real Estate & Property Law", "Family Law", "Startup Compliance",
      "Contract Drafting", "Corporate Law in India",
    ],
    sameAs,
  };
};
