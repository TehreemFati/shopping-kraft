import { ProductCard } from "@/components/storefront/ProductCard";
import { SearchForm } from "@/components/storefront/SearchForm";
import { searchProducts } from "@/lib/queries/storefront";

export const metadata = { title: "Search" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const products = query ? await searchProducts(query) : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Search Products</h1>
      <SearchForm defaultValue={query} />

      {query && (
        <div className="mt-8">
          <p className="mb-4 text-muted-foreground">
            {products.length} result{products.length !== 1 ? "s" : ""} for &quot;{query}&quot;
          </p>
          {products.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p>No products found.</p>
          )}
        </div>
      )}
    </div>
  );
}
