import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';

// ── PRODUCT DATA STRUCTURE ──────────────────────────────────────────────────
// Represents a single product that can be displayed and added to cart
export interface Product {
  id: string;                           // Unique product identifier
  name: string;                         // Product name (e.g., "Amul Milk")
  description?: string;                 // Detailed product description
  price: string;                        // Price as string (e.g., "45.50")
  stockStatus: 'in_stock' | 'out_of_stock';  // Current availability status
  categoryId?: string | null;           // Which category this product belongs to
  imageUrls?: string[];                 // Array of product images (URLs)
  quantityAvailable?: number;           // How many units in stock
  discount_percentage?: number;         // Discount percentage (if any)
}

interface Props {
  product: Product;
}

// ── PRODUCT CARD COMPONENT ──────────────────────────────────────────────────
// Reusable card showing a single product with image, name, price, stock status
// Clicking on product navigates to detail page (/products/:id)
// Clicking "Add to Cart" immediately adds one item and reveals quantity controls

export default function ProductCard({ product }: Props) {
  // ── ROUTING & AUTHENTICATION CONTEXT ────────────────────────────────────
  const navigate = useNavigate();                         // Router navigation
  const { user, cartCount, setCartCount } = useAuth();   // Current user & cart info

  // ── QUANTITY SELECTOR STATE ─────────────────────────────────────────────
  // Hidden until the first item is added
  const [showQuantitySelector, setShowQuantitySelector] = useState(false);  // Show/hide counter
  const [selectedQuantity, setSelectedQuantity] = useState(1);  // How many to add (1-max available)

  function increaseQuantity() {
    void setProductQuantity(selectedQuantity + 1);
  }

  function decreaseQuantity() {
    void setProductQuantity(selectedQuantity - 1);
  }

  // ── ADD TO CART HANDLER ─────────────────────────────────────────────────
  // Persists the complete quantity so plus/minus changes do not need confirmation.
  async function setProductQuantity(nextQuantity: number) {
    if (nextQuantity < 1 || nextQuantity > (product.quantityAvailable || 1)) return;

    if (user) {
      try {
        await api.post('/api/cart/items', { productId: product.id, quantity: nextQuantity });
      } catch {
        return;
      }
    } else {
      const raw = sessionStorage.getItem('guestCart');
      const cart: Array<{ productId: string; name: string; price: string; quantity: number }> =
        raw ? JSON.parse(raw) : [];
      const existing = cart.find((i) => i.productId === product.id);
      if (existing) {
        existing.quantity = nextQuantity;
      } else {
        cart.push({ productId: product.id, name: product.name, price: product.price, quantity: nextQuantity });
      }
      sessionStorage.setItem('guestCart', JSON.stringify(cart));
    }

    setSelectedQuantity(nextQuantity);
    setShowQuantitySelector(true);
    setCartCount(cartCount + (nextQuantity - (showQuantitySelector ? selectedQuantity : 0)));
  }

  function handleAddToCart() {
    void setProductQuantity(1);
  }

  // Add the first item immediately; quantity controls appear afterward.
  const inStock = product.stockStatus === 'in_stock';

  // ── RENDER PRODUCT CARD ─────────────────────────────────────────────────
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Product image — click to go to detail page */}
      <div 
        onClick={() => navigate(`/products/${product.id}`)}
        style={{ cursor: 'pointer' }}
      >
        {product.imageUrls && product.imageUrls.length > 0 && (
          <img
            src={product.imageUrls[0]}
            alt={product.name}
            style={{ width: '100%', height: 160, objectFit: 'cover' }}
          />
        )}
      </div>

      {/* Product info section */}
      <div style={{ padding: '12px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        
        {/* Product name — click to go to detail page */}
        <div 
          onClick={() => navigate(`/products/${product.id}`)}
          style={{ fontWeight: 600, fontSize: 15, cursor: 'pointer', color: 'var(--white)' }}
        >
          {product.name}
        </div>

        {/* Product price — formatted with currency symbol and 2 decimals */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ color: 'var(--green-dark)', fontWeight: 700, fontSize: 16 }}>
            ₹{product.discount_percentage && product.discount_percentage > 0
              ? (parseFloat(product.price) - (parseFloat(product.price) * product.discount_percentage / 100)).toFixed(2)
              : parseFloat(product.price).toFixed(2)}
          </div>
          {product.discount_percentage && product.discount_percentage > 0 && (
            <>
              <span style={{ textDecoration: 'line-through', color: 'var(--white)', fontSize: 13 }}>
                ₹{parseFloat(product.price).toFixed(2)}
              </span>
              <span style={{ background: 'var(--gold-gradient)', color: '#fff', padding: '2px 8px', borderRadius: 3, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', boxShadow: 'var(--gold-glow)' }}>
                -{product.discount_percentage}%
              </span>
            </>
          )}
        </div>

        {/* Stock status badge — green="In Stock" / red="Out of Stock" */}
        <span className={`badge ${inStock ? 'badge-green' : 'badge-red'}`}>
          {inStock ? 'Available today' : 'Currently unavailable'}
        </span>

        {/* ── CART ACTION BUTTONS ── */}
        
        {!showQuantitySelector ? (
          // ── INITIAL STATE: "Add to Cart" button ──
          <button
            className="btn btn-primary"
            style={{ marginTop: 'auto', paddingTop: 8, paddingBottom: 8 }}
            onClick={handleAddToCart}
            disabled={!inStock}  // Disable button if product is out of stock
          >
            Add to Basket
          </button>
        ) : (
          // ── QUANTITY SELECTOR STATE: Live quantity controls ──
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
            
            {/* Quantity selector UI */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                padding: '8px',
                background: '#f1f5f9',
                borderRadius: 6,
              }}
            >
              {/* Minus button */}
              <button
                onClick={decreaseQuantity}
                disabled={selectedQuantity <= 1}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 4,
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                  fontSize: 18,
                  fontWeight: 700,
                  color: '#334155',
                  cursor: selectedQuantity <= 1 ? 'not-allowed' : 'pointer',
                  opacity: selectedQuantity <= 1 ? 0.5 : 1,
                }}
              >
                −
              </button>

              {/* Current quantity display */}
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  minWidth: 30,
                  textAlign: 'center',
                  color: 'var(--white)',
                }}
              >
                {selectedQuantity}
              </span>

              {/* Plus button */}
              <button
                onClick={increaseQuantity}
                disabled={selectedQuantity >= (product.quantityAvailable || 1)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 4,
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                  fontSize: 18,
                  fontWeight: 700,
                  color: '#334155',
                  cursor: selectedQuantity >= (product.quantityAvailable || 1) ? 'not-allowed' : 'pointer',
                  opacity: selectedQuantity >= (product.quantityAvailable || 1) ? 0.5 : 1,
                }}
              >
                +
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
