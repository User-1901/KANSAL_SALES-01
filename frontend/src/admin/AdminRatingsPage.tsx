import { useState, useEffect } from 'react';
import api from '../api/axios';
import ConfirmationDialog from '../components/ConfirmationDialog';

interface Rating {
  id: string;
  product_id: string;
  product_name: string;
  user_id: string | null;
  guest_email: string | null;
  rating: number;
  review_text: string | null;
  created_at: string;
}

export default function AdminRatingsPage() {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [searchProduct, setSearchProduct] = useState('');
  const [confirm, setConfirm] = useState<{ isOpen: boolean; message: string; onConfirm: () => void }>({
    isOpen: false,
    message: '',
    onConfirm: () => {},
  });

  async function fetchRatings() {
    try {
      const res = await api.get('/api/ratings/admin/all-ratings');
      setRatings(res.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRatings();
  }, []);

  function handleDeleteRating(rating: Rating) {
    setConfirm({
      isOpen: true,
      message: `Delete this ${rating.rating}⭐ rating from "${rating.product_name}"?`,
      onConfirm: async () => {
        setConfirm(c => ({ ...c, isOpen: false }));
        try {
          await api.delete(`/api/ratings/${rating.id}`);
          await fetchRatings();
        } catch {
          /* ignore */
        }
      },
    });
  }

  // Filter ratings
  const filteredRatings = ratings.filter(r => {
    const matchesFilter = filterRating === null || r.rating === filterRating;
    const matchesSearch = searchProduct === '' || r.product_name.toLowerCase().includes(searchProduct.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  function getStarDisplay(rating: number) {
    return '⭐'.repeat(rating);
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: 'var(--gold)', textShadow: '0 0 12px rgba(255, 107, 53, 0.4)' }}>Ratings & Reviews</h1>
        <p style={{ margin: '4px 0 0', color: 'var(--light-text)', fontSize: 14 }}>
          {ratings.length} total rating{ratings.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Filters */}
      <div
        style={{
          background: 'var(--dark-tertiary)',
          borderRadius: 12,
          border: '1px solid var(--dark-secondary)',
          padding: '20px 24px',
          marginBottom: 24,
          display: 'flex',
          gap: 16,
          alignItems: 'center',
        }}
      >
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--gold)', marginBottom: 6, textShadow: '0 0 8px rgba(255, 107, 53, 0.3)' }}>
            Search Product
          </label>
          <input
            type="text"
            placeholder="Search by product name..."
            value={searchProduct}
            onChange={e => setSearchProduct(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid var(--dark-secondary)',
              borderRadius: 6,
              fontSize: 13,
              outline: 'none',
              background: 'var(--dark-secondary)',
              color: 'var(--light-text)'
            }}
            onFocus={e => (e.target.style.borderColor = 'var(--gold)')}
            onBlur={e => (e.target.style.borderColor = 'var(--dark-secondary)')}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--gold)', marginBottom: 6, textShadow: '0 0 8px rgba(255, 107, 53, 0.3)' }}>
            Filter by Rating
          </label>
          <select
            value={filterRating === null ? '' : filterRating}
            onChange={e => setFilterRating(e.target.value === '' ? null : Number(e.target.value))}
            style={{
              padding: '8px 12px',
              border: '1px solid var(--dark-secondary)',
              borderRadius: 6,
              fontSize: 13,
              outline: 'none',
              cursor: 'pointer',
              background: 'var(--dark-secondary)',
              color: 'var(--light-text)'
            }}
            onFocus={e => (e.target.style.borderColor = 'var(--gold)')}
            onBlur={e => (e.target.style.borderColor = 'var(--dark-secondary)')}
          >
            <option value="">All Ratings</option>
            <option value="5">⭐⭐⭐⭐⭐ (5 Star)</option>
            <option value="4">⭐⭐⭐⭐ (4 Star)</option>
            <option value="3">⭐⭐⭐ (3 Star)</option>
            <option value="2">⭐⭐ (2 Star)</option>
            <option value="1">⭐ (1 Star)</option>
          </select>
        </div>
      </div>

      {/* Ratings List */}
      <div style={{ background: 'var(--dark-tertiary)', borderRadius: 12, border: '1px solid var(--dark-secondary)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>Loading ratings…</div>
        ) : filteredRatings.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--gray-400)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⭐</div>
            <p style={{ margin: 0, fontSize: 15 }}>
              {ratings.length === 0 ? 'No ratings yet.' : 'No ratings match your filters.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredRatings.map((rating, idx) => (
              <div
                key={rating.id}
                style={{
                  padding: '20px 24px',
                  borderBottom: idx !== filteredRatings.length - 1 ? '1px solid var(--dark-secondary)' : 'none',
                  background: rating.rating <= 2 ? 'rgba(255, 107, 107, 0.05)' : 'transparent',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    {/* Product name and rating */}
                    <div style={{ marginBottom: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--light-text)' }}>{rating.product_name}</span>
                      <span style={{ marginLeft: 12, fontSize: 16 }}>{getStarDisplay(rating.rating)}</span>
                    </div>

                    {/* Review text */}
                    {rating.review_text && (
                      <p
                        style={{
                          margin: '8px 0',
                          fontSize: 13,
                          color: 'var(--gray-400)',
                          fontStyle: 'italic',
                          borderLeft: '3px solid var(--gold)',
                          paddingLeft: 12,
                        }}
                      >
                        "{rating.review_text}"
                      </p>
                    )}

                    {/* User info and date */}
                    <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 8 }}>
                      <span>
                        By: {rating.user_id ? 'Registered User' : rating.guest_email || 'Guest'}
                      </span>
                      <span style={{ marginLeft: 16 }}>
                        {new Date(rating.created_at).toLocaleDateString()} {new Date(rating.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDeleteRating(rating)}
                    style={{
                      padding: '8px 16px',
                      background: 'rgba(255, 107, 107, 0.1)',
                      color: 'var(--error)',
                      border: '1px solid var(--error)',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(255, 107, 107, 0.15)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(255, 107, 107, 0.1)';
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmationDialog
        isOpen={confirm.isOpen}
        message={confirm.message}
        onConfirm={confirm.onConfirm}
        onCancel={() => setConfirm(c => ({ ...c, isOpen: false }))}
      />
    </div>
  );
}
