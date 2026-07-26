const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SportsOrganization",
      "@id": "https://www.irpintennis.com/#organization",
      name: "Irpin Tennis",
      url: "https://www.irpintennis.com",
      logo: "https://www.irpintennis.com/logo.png",
      description:
        "Тенісна спільнота Ірпеня, Бучі та передмістя: гравці, турніри, ліги, корти й тренери.",
      areaServed: ["Ірпінь", "Буча", "Передмістя"],
      sport: "Tennis",
    },
    {
      "@type": "WebSite",
      "@id": "https://www.irpintennis.com/#website",
      url: "https://www.irpintennis.com",
      name: "Irpin Tennis",
      inLanguage: "uk-UA",
      publisher: {
        "@id": "https://www.irpintennis.com/#organization",
      },
    },
  ],
};

export default function StructuredData() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
      }}
    />
  );
}
