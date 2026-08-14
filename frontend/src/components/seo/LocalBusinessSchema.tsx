export function LocalBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CafeOrCoffeeShop",
    "name": "One Folk Cafe",
    "url": "https://onefolkcafe.in",
    "logo": "https://onefolkcafe.in/icon.png",
    "image": "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1000&auto=format&fit=crop",
    "description": "Visit One Folk Cafe in Nashik for freshly brewed coffee, pizzas, burgers, sandwiches, desserts and refreshing beverages.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Nashik",
      "addressRegion": "Maharashtra",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "20.02296",
      "longitude": "73.83385"
    },
    "hasMap": "https://maps.app.goo.gl/Lmo6tdHUpUYa79427",
    "telephone": "+910000000000",
    "priceRange": "₹₹",
    "servesCuisine": ["Cafe", "Coffee", "Vegetarian", "Pizza", "Desserts"],
    "menu": "https://onefolkcafe.in/menu",
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday"
        ],
        "opens": "10:00",
        "closes": "23:00"
      }
    ],
    "sameAs": [
      "https://maps.app.goo.gl/Lmo6tdHUpUYa79427"
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
