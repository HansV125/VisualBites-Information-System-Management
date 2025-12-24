import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';
import { getProducts } from '@/lib/api';
import { ProductCard } from '@/components/product-card';

export default async function Home() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductCard />
    </HydrationBoundary>
  );
}
