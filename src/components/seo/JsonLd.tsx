/** Données structurées schema.org (JSON-LD). `<` échappé pour qu'aucun contenu ne puisse fermer la balise. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
