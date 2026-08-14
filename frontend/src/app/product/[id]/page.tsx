import { Metadata } from 'next';
import ProductDetailClient from './ProductDetailClient';
import { fetchProducts } from '@/lib/api';
import { ProductSchema } from '@/components/seo/ProductSchema';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  let title = "Product Not Found | One Folk Cafe";
  let description = "This product could not be found.";
  let imageUrl = "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=800&auto=format&fit=crop";

  try {
    const products = await fetchProducts();
    const product = products?.find((p: any) => String(p.id) === id);
    if (product) {
      title = `${product.name} | One Folk Cafe`;
      description = product.description || `Enjoy our freshly prepared ${product.name}, a 100% pure veg delicacy crafted by One Folk Cafe.`;
      
      if (product.imageUrl) {
        if (product.imageUrl.startsWith('http')) {
          imageUrl = product.imageUrl;
        } else {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
          imageUrl = baseUrl.replace(/\/api$/, '') + product.imageUrl;
        }
      }
    }
  } catch (error) {
    console.error("Failed to fetch product for metadata", error);
  }

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
  let product = null;

  try {
    const products = await fetchProducts();
    product = products?.find((p: any) => String(p.id) === id);
  } catch (error) {
    // Ignore, let client handle it
  }

  let imageUrl = "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=800&auto=format&fit=crop";
  if (product?.imageUrl) {
    if (product.imageUrl.startsWith('http')) {
      imageUrl = product.imageUrl;
    } else {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
      imageUrl = baseUrl.replace(/\/api$/, '') + product.imageUrl;
    }
  }

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
