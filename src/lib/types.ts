export type Category = {
  id: string; name: string; slug: string; image_url: string | null; sort_order: number;
};
export type Spec = { label: string; value: string };
export type Product = {
  id: string; name: string; slug: string; brand: string; description: string;
  price: number; compare_at_price: number | null; category_id: string | null;
  images: string[]; specs: Spec[]; in_stock: boolean; is_featured: boolean;
  is_active: boolean; created_at: string;
};
