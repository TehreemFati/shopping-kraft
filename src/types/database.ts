export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "customer" | "admin" | "staff";
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type PaymentMethod = "cod" | "bank_transfer" | "jazzcash" | "easypaisa";
export type CouponType = "percentage" | "fixed";
export type SaleCampaignType = "flash" | "seasonal" | "clearance" | "custom";

type DefaultSchema = {
  Tables: Record<string, never>;
  Views: Record<string, never>;
  Functions: Record<string, never>;
  Enums: Record<string, never>;
  CompositeTypes: Record<string, never>;
};

type Table<
  Row extends Record<string, unknown>,
  Insert extends Record<string, unknown> = Row,
  Update extends Record<string, unknown> = Partial<Insert>,
> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      profiles: Table<
        {
          id: string;
          role: UserRole;
          full_name: string | null;
          phone: string | null;
          created_at: string;
          deleted_at: string | null;
        },
        {
          id: string;
          role?: UserRole;
          full_name?: string | null;
          phone?: string | null;
          created_at?: string;
          deleted_at?: string | null;
        }
      >;
      categories: Table<
        {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          parent_id: string | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          deleted_at: string | null;
        },
        {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          image_url?: string | null;
          parent_id?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          deleted_at?: string | null;
        }
      >;
      products: Table<
        {
          id: string;
          category_id: string;
          name: string;
          slug: string;
          description: string | null;
          price: number;
          sale_price: number | null;
          sku: string | null;
          is_active: boolean;
          is_featured: boolean;
          created_at: string;
          deleted_at: string | null;
        },
        {
          id?: string;
          category_id: string;
          name: string;
          slug: string;
          description?: string | null;
          price: number;
          sale_price?: number | null;
          sku?: string | null;
          is_active?: boolean;
          is_featured?: boolean;
          created_at?: string;
          deleted_at?: string | null;
        }
      >;
      product_images: Table<
        {
          id: string;
          product_id: string;
          url: string;
          alt_text: string | null;
          sort_order: number;
          is_primary: boolean;
          created_at: string;
        },
        {
          id?: string;
          product_id: string;
          url: string;
          alt_text?: string | null;
          sort_order?: number;
          is_primary?: boolean;
          created_at?: string;
        }
      >;
      product_variants: Table<
        {
          id: string;
          product_id: string;
          name: string;
          sku: string | null;
          price: number | null;
          sale_price: number | null;
          stock: number;
          attributes: Json;
          created_at: string;
          deleted_at: string | null;
        },
        {
          id?: string;
          product_id: string;
          name: string;
          sku?: string | null;
          price?: number | null;
          sale_price?: number | null;
          stock?: number;
          attributes?: Json;
          created_at?: string;
          deleted_at?: string | null;
        }
      >;
      reviews: Table<
        {
          id: string;
          product_id: string;
          user_id: string;
          rating: number;
          comment: string | null;
          is_approved: boolean;
          created_at: string;
          deleted_at: string | null;
        },
        {
          id?: string;
          product_id: string;
          user_id: string;
          rating: number;
          comment?: string | null;
          is_approved?: boolean;
          created_at?: string;
          deleted_at?: string | null;
        }
      >;
      inventory: Table<
        {
          id: string;
          product_id: string | null;
          variant_id: string | null;
          quantity: number;
          reserved_quantity: number;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          product_id?: string | null;
          variant_id?: string | null;
          quantity?: number;
          reserved_quantity?: number;
          created_at?: string;
          updated_at?: string;
        }
      >;
      inventory_movements: Table<
        {
          id: string;
          inventory_id: string;
          change_qty: number;
          reason: string;
          reference_type: string | null;
          reference_id: string | null;
          created_by: string | null;
          created_at: string;
        },
        {
          id?: string;
          inventory_id: string;
          change_qty: number;
          reason: string;
          reference_type?: string | null;
          reference_id?: string | null;
          created_by?: string | null;
          created_at?: string;
        }
      >;
      addresses: Table<
        {
          id: string;
          user_id: string;
          label: string | null;
          line1: string;
          line2: string | null;
          city: string;
          province: string;
          postal_code: string | null;
          country: string;
          is_default: boolean;
          created_at: string;
          deleted_at: string | null;
        },
        {
          id?: string;
          user_id: string;
          label?: string | null;
          line1: string;
          line2?: string | null;
          city: string;
          province: string;
          postal_code?: string | null;
          country?: string;
          is_default?: boolean;
          created_at?: string;
          deleted_at?: string | null;
        }
      >;
      carts: Table<
        {
          id: string;
          user_id: string | null;
          session_id: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          user_id?: string | null;
          session_id?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      cart_items: Table<
        {
          id: string;
          cart_id: string;
          product_id: string;
          variant_id: string | null;
          quantity: number;
          unit_price: number;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          cart_id: string;
          product_id: string;
          variant_id?: string | null;
          quantity?: number;
          unit_price: number;
          created_at?: string;
          updated_at?: string;
        }
      >;
      orders: Table<
        {
          id: string;
          order_number: string;
          user_id: string | null;
          status: OrderStatus;
          subtotal: number;
          discount: number;
          shipping: number;
          total: number;
          payment_status: PaymentStatus;
          payment_method: PaymentMethod;
          shipping_address: Json;
          coupon_id: string | null;
          notes: string | null;
          tracking_number: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          order_number?: string;
          user_id?: string | null;
          status?: OrderStatus;
          subtotal?: number;
          discount?: number;
          shipping?: number;
          total?: number;
          payment_status?: PaymentStatus;
          payment_method?: PaymentMethod;
          shipping_address: Json;
          coupon_id?: string | null;
          notes?: string | null;
          tracking_number?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      staff_permissions: Table<
        {
          user_id: string;
          permissions: string[];
          is_active: boolean;
          invited_by: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          user_id: string;
          permissions?: string[];
          is_active?: boolean;
          invited_by?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      admin_audit_logs: Table<
        {
          id: string;
          actor_id: string | null;
          action: string;
          resource_type: string | null;
          resource_id: string | null;
          meta: Json;
          created_at: string;
        },
        {
          id?: string;
          actor_id?: string | null;
          action: string;
          resource_type?: string | null;
          resource_id?: string | null;
          meta?: Json;
          created_at?: string;
        }
      >;
      order_items: Table<
        {
          id: string;
          order_id: string;
          product_id: string | null;
          variant_id: string | null;
          product_name: string;
          sku: string | null;
          unit_price: number;
          quantity: number;
          total_price: number;
          created_at: string;
        },
        {
          id?: string;
          order_id: string;
          product_id?: string | null;
          variant_id?: string | null;
          product_name: string;
          sku?: string | null;
          unit_price: number;
          quantity: number;
          total_price: number;
          created_at?: string;
        }
      >;
      payments: Table<
        {
          id: string;
          order_id: string;
          provider: PaymentMethod;
          amount: number;
          status: PaymentStatus;
          transaction_id: string | null;
          metadata: Json;
          created_at: string;
        },
        {
          id?: string;
          order_id: string;
          provider: PaymentMethod;
          amount: number;
          status?: PaymentStatus;
          transaction_id?: string | null;
          metadata?: Json;
          created_at?: string;
        }
      >;
      coupons: Table<
        {
          id: string;
          code: string;
          type: CouponType;
          value: number;
          min_order: number | null;
          max_uses: number | null;
          used_count: number;
          expires_at: string | null;
          is_active: boolean;
          created_at: string;
          deleted_at: string | null;
        },
        {
          id?: string;
          code: string;
          type: CouponType;
          value: number;
          min_order?: number | null;
          max_uses?: number | null;
          used_count?: number;
          expires_at?: string | null;
          is_active?: boolean;
          created_at?: string;
          deleted_at?: string | null;
        }
      >;
      coupon_usage: Table<
        {
          id: string;
          coupon_id: string;
          user_id: string | null;
          order_id: string | null;
          used_at: string;
        },
        {
          id?: string;
          coupon_id: string;
          user_id?: string | null;
          order_id?: string | null;
          used_at?: string;
        }
      >;
      wishlists: Table<{
        id: string;
        user_id: string;
        product_id: string;
        created_at: string;
      }>;
      banners: Table<
        {
          id: string;
          title: string;
          subtitle: string | null;
          image_url: string;
          link_url: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          deleted_at: string | null;
        },
        {
          id?: string;
          title: string;
          subtitle?: string | null;
          image_url: string;
          link_url?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          deleted_at?: string | null;
        }
      >;
      sale_campaigns: Table<
        {
          id: string;
          name: string;
          slug: string;
          sale_type: SaleCampaignType;
          description: string | null;
          starts_at: string | null;
          ends_at: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        },
        {
          id?: string;
          name: string;
          slug: string;
          sale_type?: SaleCampaignType;
          description?: string | null;
          starts_at?: string | null;
          ends_at?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        }
      >;
      sale_campaign_products: Table<
        {
          campaign_id: string;
          product_id: string;
          campaign_sale_price: number | null;
        },
        {
          campaign_id: string;
          product_id: string;
          campaign_sale_price?: number | null;
        }
      >;
      settings: Table<
        {
          key: string;
          value: Json;
          updated_at: string;
        },
        {
          key: string;
          value: Json;
          updated_at?: string;
        }
      >;
    };
    Views: DefaultSchema["Views"];
    Functions: DefaultSchema["Functions"];
    Enums: {
      user_role: UserRole;
      order_status: OrderStatus;
      payment_status: PaymentStatus;
      payment_method: PaymentMethod;
      coupon_type: CouponType;
      sale_campaign_type: SaleCampaignType;
    };
    CompositeTypes: DefaultSchema["CompositeTypes"];
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type ProductImage = Database["public"]["Tables"]["product_images"]["Row"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];
export type CartItem = Database["public"]["Tables"]["cart_items"]["Row"];
export type Coupon = Database["public"]["Tables"]["coupons"]["Row"];
export type Address = Database["public"]["Tables"]["addresses"]["Row"];
export type Inventory = Database["public"]["Tables"]["inventory"]["Row"];

export type ProductWithImages = Product & {
  product_images: ProductImage[];
  categories: Category | null;
  inventory: Inventory[] | null;
};

export type CartItemWithProduct = CartItem & {
  products: Product & {
    product_images: ProductImage[];
    inventory?: Inventory[] | null;
  };
};

export type OrderWithItems = Order & {
  order_items: OrderItem[];
};

export type AdminOrder = Order & {
  order_items: OrderItem[];
  profiles: { full_name: string | null; phone: string | null } | null;
  payments?: Database["public"]["Tables"]["payments"]["Row"][];
};

export type AdminCustomer = Profile & {
  orders: { count: number }[];
};

export type StaffMember = Profile & {
  email?: string | null;
  staff_permissions: {
    permissions: string[];
    is_active: boolean;
    invited_by: string | null;
    created_at: string;
  } | null;
};

export type InventoryWithProduct = Inventory & {
  products: { name: string; sku: string | null } | null;
  product_variants: { name: string; sku: string | null } | null;
};

export type Review = Database["public"]["Tables"]["reviews"]["Row"];
export type Banner = Database["public"]["Tables"]["banners"]["Row"];
export type ProductVariant = Database["public"]["Tables"]["product_variants"]["Row"];
export type Payment = Database["public"]["Tables"]["payments"]["Row"];
export type SaleCampaign = Database["public"]["Tables"]["sale_campaigns"]["Row"];
export type SaleCampaignProduct =
  Database["public"]["Tables"]["sale_campaign_products"]["Row"];

export type SaleCampaignWithProducts = SaleCampaign & {
  sale_campaign_products: (SaleCampaignProduct & {
    products: ProductWithImages | null;
  })[];
};

export type LowStockItem = Inventory & {
  products: { name: string; sku: string | null } | null;
};

export type AdminProduct = Product & {
  categories: { name: string } | null;
  product_images: ProductImage[];
  inventory: Inventory[] | null;
};
