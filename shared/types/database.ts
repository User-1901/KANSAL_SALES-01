export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: 'customer' | 'admin' | 'super_admin';
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: string;
  name: string;
};

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock_status: 'in_stock' | 'out_of_stock';
  category_id: string | null;
  image_urls: string[];
  quantity_available: number;
  why_shop_message: string | null;
  discount_percentage: number | null;
  discount_price: number | null;
  hsn_code: string | null;
  created_at: string;
  updated_at: string;
};

export type ProductImage = {
  id: string;
  product_id: string;
  storage_path: string;
  public_url: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
};

export type CartItem = {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  added_at: string;
};

export type Order = {
  id: string;
  user_id: string;
  total_amount: number;
  status: 'pending' | 'paid' | 'failed' | 'refunded' | 'shipped' | 'delivered';
  shipping_name: string;
  shipping_email: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code: string;
  payment_method: 'COD';
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  line_total?: number;
  created_at: string;
};

export type Rating = {
  id: string;
  product_id: string;
  user_id: string | null;
  guest_email: string | null;
  rating: number;
  review_text: string | null;
  created_at: string;
  updated_at: string;
};

export type SalesTracking = {
  id: string;
  product_id: string;
  quantity_sold: number;
  sale_date: string;
  created_at: string;
  updated_at: string;
};

export type InventoryMetrics = {
  id: string;
  product_id: string;
  total_sales_30days: number;
  average_daily_demand: number;
  predicted_demand_next_7days: number;
  recommended_stock_level: number;
  low_stock_threshold: number;
  is_low_stock: boolean;
  last_calculated_at: string;
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          role?: 'customer' | 'admin' | 'super_admin';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          role?: 'customer' | 'admin' | 'super_admin';
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: Category;
        Insert: {
          id?: string;
          name: string;
        };
        Update: {
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      products: {
        Row: Product;
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          price: number;
          stock_status?: 'in_stock' | 'out_of_stock';
          category_id?: string | null;
          image_urls?: string[];
          quantity_available?: number;
          why_shop_message?: string | null;
          discount_percentage?: number | null;
          discount_price?: number | null;
          hsn_code?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          stock_status?: 'in_stock' | 'out_of_stock';
          category_id?: string | null;
          image_urls?: string[];
          quantity_available?: number;
          why_shop_message?: string | null;
          discount_percentage?: number | null;
          discount_price?: number | null;
          hsn_code?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          }
        ];
      };
      product_images: {
        Row: ProductImage;
        Insert: {
          id?: string;
          product_id: string;
          storage_path: string;
          public_url: string;
          alt_text?: string | null;
          sort_order?: number;
          is_primary?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          storage_path?: string;
          public_url?: string;
          alt_text?: string | null;
          sort_order?: number;
          is_primary?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      cart_items: {
        Row: CartItem;
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          quantity: number;
          added_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          quantity?: number;
          added_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cart_items_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      orders: {
        Row: Order;
        Insert: {
          id?: string;
          user_id: string;
          total_amount: number;
          status?: 'pending' | 'paid' | 'failed' | 'refunded' | 'shipped' | 'delivered';
          shipping_name: string;
          shipping_email: string;
          shipping_phone: string;
          shipping_address: string;
          shipping_city: string;
          shipping_state: string;
          shipping_postal_code: string;
          payment_method: 'COD';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          total_amount?: number;
          status?: 'pending' | 'paid' | 'failed' | 'refunded' | 'shipped' | 'delivered';
          shipping_name?: string;
          shipping_email?: string;
          shipping_phone?: string;
          shipping_address?: string;
          shipping_city?: string;
          shipping_state?: string;
          shipping_postal_code?: string;
          payment_method?: 'COD';
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      order_items: {
        Row: OrderItem;
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          product_name: string;
          product_price: number;
          quantity: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          product_name?: string;
          product_price?: number;
          quantity?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      ratings: {
        Row: Rating;
        Insert: {
          id?: string;
          product_id: string;
          user_id?: string | null;
          guest_email?: string | null;
          rating: number;
          review_text?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          user_id?: string | null;
          guest_email?: string | null;
          rating?: number;
          review_text?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ratings_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ratings_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      sales_tracking: {
        Row: SalesTracking;
        Insert: {
          id?: string;
          product_id: string;
          quantity_sold?: number;
          sale_date: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          quantity_sold?: number;
          sale_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sales_tracking_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      inventory_metrics: {
        Row: InventoryMetrics;
        Insert: {
          id?: string;
          product_id: string;
          total_sales_30days?: number;
          average_daily_demand?: number;
          predicted_demand_next_7days?: number;
          recommended_stock_level?: number;
          low_stock_threshold?: number;
          is_low_stock?: boolean;
          last_calculated_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          total_sales_30days?: number;
          average_daily_demand?: number;
          predicted_demand_next_7days?: number;
          recommended_stock_level?: number;
          low_stock_threshold?: number;
          is_low_stock?: boolean;
          last_calculated_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "inventory_metrics_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: true;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: { user_id?: string };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
