export function ProductSchema({
  product
}: {
  product: {
    name: string;
    description: string;
    image: string;
    price: number;
    currency?: string;
    url: string;
  }
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.image,
    "description": product.description,
    "brand": {
      "@type": "Brand",
      "name": "One Folk Cafe"
    },
    "offers": {
      "@type": "Offer",
      "url": product.url,
      "priceCurrency": product.currency || "INR",
      "price": product.price,
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "One Folk Cafe"
      }
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
