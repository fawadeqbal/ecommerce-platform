'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { cn } from '@ecommerce/ui';
import { useSetCart } from '@/hooks/use-cart';
import { cartApi, storefrontApi } from '@/lib/api-client';
import { haptic, toast } from '@/lib/toast';

/** "Add to cart" on a product card. Products with options open the product page instead. */
export function QuickAdd({
  slug,
  hasOptions,
  inStock,
  name,
  imageUrl,
}: {
  slug: string;
  hasOptions: boolean;
  inStock: boolean;
  /** For the confirmation toast. */
  name?: string;
  imageUrl?: string | null;
}) {
  const router = useRouter();
  const setCart = useSetCart();
  const add = useMutation({
    mutationFn: async () => {
      const product = await storefrontApi.product(slug);
      const variant =
        product.variants.find((v) => v.isDefault && v.available > 0) ??
        product.variants.find((v) => v.available > 0);
      if (!variant) throw new Error('Out of stock');
      return cartApi.add({ variantId: variant.id, quantity: 1 });
    },
    onSuccess: (cart) => {
      setCart(cart);
      haptic();
      toast.success('Added to cart', {
        description: name,
        image: imageUrl,
        action: { label: 'View cart', href: '/cart' },
      });
    },
    onError: (e) => toast.error(e.message),
  });
  const label = !inStock
    ? 'Out of stock'
    : hasOptions
      ? 'Choose options'
      : add.isPending
        ? 'Adding…'
        : add.isSuccess
          ? 'Added ✓'
          : add.isError
            ? 'Try again'
            : 'Add to cart';
  return (
    <button
      type="button"
      disabled={!inStock || add.isPending}
      onClick={() => (hasOptions ? router.push(`/products/${slug}`) : add.mutate())}
      className={cn(
        'h-10 rounded-[14px] text-sm font-bold transition-colors disabled:cursor-not-allowed',
        add.isSuccess
          ? 'bg-brand-600 text-white'
          : 'bg-brand-100 text-brand-700 hover:bg-brand-600 hover:text-white disabled:bg-gray-100 disabled:text-gray-500',
      )}
    >
      {label}
    </button>
  );
}
