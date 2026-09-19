import { Metadata } from 'next';
import ProductDetailClient from './ProductDetailClient';
import { fetchProducts } from '@/lib/api';
import { STATIC_PRODUCTS } from '@/data/products';
import { ProductSchema } from '@/components/seo/ProductSchema';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const staticMatch = STATIC_PRODUCTS.find((p: any) => String(p.id) === id);
  let product: any = staticMatch;

  try {
    const products = await fetchProducts();
    const found = products?.find((p: any) => String(p.id) === id);
    if (found) product = { ...staticMatch, ...found };
  } catch (error) {
    // Ignore
  }

  const title = product ? `${product.name} | One Folk Cafe` : "Product Not Found | One Folk Cafe";
  const description = product?.description || "This product could not be found.";
  const imageUrl = product?.image || product?.imageUrl || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800&auto=format&fit=crop";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 600,
          alt: title,
        },
      ],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const staticMatch = STATIC_PRODUCTS.find((p: any) => String(p.id) === id);
  let product: any = staticMatch;

  try {
    const products = await fetchProducts();
    const found = products?.find((p: any) => String(p.id) === id);
    if (found) product = { ...staticMatch, ...found };
  } catch (error) {
    // Ignore, let client handle it
  }

  const imageUrl = product?.image || product?.imageUrl || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800&auto=format&fit=crop";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://onefolkcafe.in';

  return (
    <>
      {product && (
        <ProductSchema
          product={{
            name: product.name,
            description: product.description || `Enjoy our freshly prepared ${product.name}.`,
            image: imageUrl,
            price: product.price,
            url: `${siteUrl}/product/${product.id}`
          }}
        />
      )}
      <ProductDetailClient params={params} />
    </>
  );
}
