import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ProductCard, { Product } from '../components/ProductCard';

// ── HOME PAGE COMPONENT ─────────────────────────────────────────────────────
// Main landing page showing:
// - Welcome banner/hero section
// - Featured products (top 6 products)
// - "Shop Now" button to browse all products
export default function HomePage() {
  // STATE VARIABLES
  const [products, setProducts] = useState<Product[]>([]);    // Featured products to display
  const [loading, setLoading] = useState(true);               // Show loading state while fetching

  // ── LOAD FEATURED PRODUCTS ON PAGE MOUNT ────────────────────────────────
  // Fetches products from API and shows first 6 as "Featured Products"
  useEffect(() => {
    api
      .get('/api/products')  // API Call: Get all products
      .then((res) => {
        // Transform API response from snake_case to camelCase (matching the Product interface)
        const transformed = res.data.map((p: Record<string, unknown>) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          stockStatus: p.stock_status,           // Convert snake_case to camelCase
          categoryId: p.category_id,
          imageUrls: p.image_urls,
          quantityAvailable: p.quantity_available,
          discount_percentage: p.discount_percentage,   // Include discount percentage
        }));
        // Only show first 6 products as "Featured"
        setProducts(transformed.slice(0, 6));
      })
      .catch(() => {}) // Silently fail if API error
      .finally(() => setLoading(false));  // Stop loading spinner
  }, []);

  return (
    <div>
      {/* HERO SECTION - Welcome banner with elegant gradient background */}
      <section
        style={{
          background: 'linear-gradient(135deg, var(--dark-secondary) 0%, var(--dark-tertiary) 100%)',
          borderBottom: '2px solid var(--gold)',
          color: 'var(--white)',
          padding: '80px 24px',
          textAlign: 'center',
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(212, 175, 55, 0.1) 0%, transparent 50%), linear-gradient(135deg, var(--dark-secondary) 0%, var(--dark-tertiary) 100%)',
        }}
      >
        <h1 style={{ 
          margin: '0 0 16px', 
          fontSize: 48, 
          fontWeight: 800, 
          letterSpacing: '-0.5px',
          color: 'var(--gold)',
          textShadow: '0 0 12px rgba(255, 107, 53, 0.4)',
        }}>
          Zenith Atelier
        </h1>
        <p style={{ 
          margin: '0 0 12px', 
          fontSize: 18, 
          opacity: 0.9,
          color: 'var(--white)',
          fontWeight: 300,
          letterSpacing: '0.3px',
        }}>
          Premium Fashion & Luxury Apparel
        </p>
        <p style={{
          margin: '0 0 32px',
          fontSize: 15,
          opacity: 0.8,
          color: 'var(--gray-400)',
        }}>
          Curated collections for the discerning individual
        </p>
        {/* "Shop Now" button that navigates to products page */}
        <Link
          to="/products"
          style={{
            background: 'var(--gold)',
            color: 'var(--dark)',
            padding: '14px 36px',
            borderRadius: 'var(--radius)',
            fontWeight: 700,
            fontSize: 15,
            textDecoration: 'none',
            display: 'inline-block',
            transition: 'all 0.2s ease',
            letterSpacing: '0.3px',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.background = 'var(--gold-light)';
            (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)';
            (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 10px 25px rgba(212, 175, 55, 0.25)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.background = 'var(--gold)';
            (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)';
            (e.currentTarget as HTMLAnchorElement).style.boxShadow = 'none';
          }}
        >
          Explore Collections
        </Link>
      </section>

      {/* FEATURED PRODUCTS SECTION */}
      <div className="page-container" style={{ padding: '48px 24px' }}>
        <h2 style={{ 
          marginBottom: 8,
          fontSize: 32,
          fontWeight: 700,
          color: 'var(--white)',
          letterSpacing: '-0.3px',
        }}>
          Featured Collections
        </h2>
        <p style={{ 
          color: 'var(--white)', 
          marginTop: 8,
          marginBottom: 32,
          fontSize: 15,
          letterSpacing: '0.2px',
        }}>
          Hand-picked selections from our latest arrivals
        </p>

        {/* Show loading message while fetching products */}
        {loading ? (
          <p style={{ fontSize: 16, color: 'var(--white)', textAlign: 'center' }}>Loading featured collections...</p>
        ) : products.length === 0 ? (
          /* Show message if no products available */
          <p style={{ fontSize: 15, color: 'var(--white)', textAlign: 'center' }}>No products available at the moment.</p>
        ) : (
          /* Display products in a grid layout */
          <div className="product-grid">
            {/* Each card is clickable and shows product details */}
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        {/* "View All Products" button - shown when not loading */}
        {!loading && (
          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <Link
              to="/products"
              style={{
                background: 'var(--gold)',
                color: 'var(--dark)',
                padding: '12px 32px',
                borderRadius: 'var(--radius)',
                fontWeight: 600,
                fontSize: 15,
                textDecoration: 'none',
                display: 'inline-block',
                transition: 'all 0.2s ease',
                letterSpacing: '0.3px',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = 'var(--gold-light)';
                (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)';
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 8px 20px rgba(212, 175, 55, 0.25)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = 'var(--gold)';
                (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = 'none';
              }}
            >
              View All Collections
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
