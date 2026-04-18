import { useState, useEffect, FormEvent } from 'react';
import api from '../api/axios';
import ConfirmationDialog from '../components/ConfirmationDialog';

interface Category { id: string; name: string; }
interface Product { id: string; name: string; price: string; category_id: string | null; }

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ isOpen: boolean; message: string; onConfirm: () => void }>({
    isOpen: false, message: '', onConfirm: () => {},
  });

  async function fetchData() {
    try {
      const [catRes, prodRes] = await Promise.all([
        api.get('/api/categories'),
        api.get('/api/products')
      ]);
      setCategories(catRes.data);
      setProducts(prodRes.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, []);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    try { await api.post('/api/categories', { name: newName.trim() }); setNewName(''); await fetchData(); }
    catch { /* ignore */ }
    finally { setAdding(false); }
  }

  function startRename(cat: Category) {
    setRenamingId(cat.id);
    setRenameValue(cat.name);
  }

  function cancelRename() { setRenamingId(null); setRenameValue(''); }

  function submitRename(cat: Category) {
    const trimmed = renameValue.trim();
    if (!trimmed || trimmed === cat.name) { cancelRename(); return; }
    setConfirm({
      isOpen: true,
      message: `Rename "${cat.name}" to "${trimmed}"?`,
      onConfirm: async () => {
        setConfirm(c => ({ ...c, isOpen: false }));
        try { await api.put(`/api/categories/${cat.id}`, { name: trimmed }); await fetchData(); }
        catch { /* ignore */ }
        cancelRename();
      },
    });
  }

  function handleDelete(cat: Category) {
    setConfirm({
      isOpen: true,
      message: `Delete category "${cat.name}"? Products in this category will become uncategorised.`,
      onConfirm: async () => {
        setConfirm(c => ({ ...c, isOpen: false }));
        try { await api.delete(`/api/categories/${cat.id}`); await fetchData(); }
        catch { /* ignore */ }
      },
    });
  }

  function getProductsInCategory(categoryId: string): Product[] {
    return products.filter(p => p.category_id === categoryId);
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: 'var(--gold)', textShadow: '0 0 12px rgba(255, 107, 53, 0.4)' }}>Categories</h1>
          <p style={{ margin: '4px 0 0', color: 'var(--white)', fontSize: 14 }}>{categories.length} categor{categories.length !== 1 ? 'ies' : 'y'}</p>
        </div>
      </div>

      {/* Add category form - More prominent */}
      <div style={{ background: 'linear-gradient(135deg, var(--gold-dark) 0%, var(--gold) 100%)', borderRadius: 12, padding: '20px 24px', marginBottom: 28, boxShadow: '0 4px 12px rgba(255, 107, 53, 0.2)' }}>
        <h2 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 700, color: 'var(--white)' }}>✨ Add New Category</h2>
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: 10 }}>
          <input
            type="text"
            placeholder="Enter category name (e.g. Dairy, Grains, Snacks…)"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            required
            style={{
              flex: 1, padding: '10px 14px', border: 'none',
              borderRadius: 6, fontSize: 14, outline: 'none', color: 'var(--dark)',
              background: 'var(--white)'
            }}
            onFocus={e => (e.target.style.boxShadow = '0 0 0 2px var(--gold)')}
            onBlur={e => (e.target.style.boxShadow = 'none')}
          />
          <button type="submit" disabled={adding || !newName.trim()} style={{
            padding: '10px 24px', background: 'var(--dark)', color: 'var(--gold)', textShadow: '0 0 8px rgba(255, 107, 53, 0.3)',
            border: 'none', borderRadius: 6, fontWeight: 800, fontSize: 14,
            cursor: adding || !newName.trim() ? 'not-allowed' : 'pointer',
            opacity: adding || !newName.trim() ? 0.6 : 1,
            transition: 'all 0.2s',
          }} onMouseEnter={e => !adding && !newName.trim() ? null : (e.currentTarget.style.transform = 'scale(1.05)')} onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
            {adding ? 'Adding…' : '+ Add Category'}
          </button>
        </form>
      </div>

      {/* Categories list */}
      <div style={{ background: 'var(--dark-tertiary)', borderRadius: 12, border: '1px solid var(--dark-secondary)', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--white)' }}>Loading…</div>
        ) : categories.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--white)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏷️</div>
            <p style={{ margin: 0, fontSize: 15 }}>No categories yet. Add one above.</p>
          </div>
        ) : (
          <div>
            {categories.map(cat => {
              const catProducts = getProductsInCategory(cat.id);
              const isExpanded = expandedCategoryId === cat.id;
              return (
                <div key={cat.id} style={{ borderBottom: '1px solid var(--dark-secondary)' }}>
                  {/* Category row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', cursor: 'pointer', background: isExpanded ? 'var(--dark-secondary)' : 'var(--dark-tertiary)', transition: 'background 0.2s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }} onClick={() => setExpandedCategoryId(isExpanded ? null : cat.id)}>
                      <span style={{ fontSize: 16, color: 'var(--white)' }}>{isExpanded ? '▼' : '▶'}</span>
                      {renamingId === cat.id ? (
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <input
                            type="text"
                            value={renameValue}
                            onChange={e => setRenameValue(e.target.value)}
                            autoFocus
                            onClick={e => e.stopPropagation()}
                            onKeyDown={e => { if (e.key === 'Enter') submitRename(cat); if (e.key === 'Escape') cancelRename(); }}
                            style={{
                              padding: '6px 10px', border: '1.5px solid var(--gold)',
                              borderRadius: 6, fontSize: 14, outline: 'none', width: 200,
                            }}
                          />
                          <button onClick={(e) => { e.stopPropagation(); submitRename(cat); }} style={{
                            padding: '5px 12px', background: 'var(--gold-gradient)', color: 'var(--white)', boxShadow: 'var(--gold-glow)',
                            border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                          }}>Save</button>
                          <button onClick={(e) => { e.stopPropagation(); cancelRename(); }} style={{
                            padding: '5px 10px', background: 'var(--dark-secondary)', color: 'var(--white)',
                            border: '1px solid var(--dark-secondary)', borderRadius: 6, fontSize: 12, cursor: 'pointer',
                          }}>Cancel</button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--gold)', textShadow: '0 0 8px rgba(255, 107, 53, 0.3)' }}>🏷️ {cat.name}</span>
                          <span style={{ background: 'rgba(255, 107, 53, 0.1)', color: 'var(--gold)', padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>
                            {catProducts.length} product{catProducts.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                    </div>

                    {renamingId !== cat.id && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={(e) => { e.stopPropagation(); startRename(cat); }} style={{
                          padding: '5px 12px', background: 'var(--dark-secondary)', color: 'var(--white)',
                          border: '1px solid var(--dark-secondary)', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        }}>Rename</button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(cat); }} style={{
                          padding: '5px 12px', background: 'rgba(255, 107, 107, 0.1)', color: 'var(--error)',
                          border: '1px solid var(--error)', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        }}>Delete</button>
                      </div>
                    )}
                  </div>

                  {/* Products in category */}
                  {isExpanded && (
                    <div style={{ background: 'var(--dark-secondary)', padding: '12px 24px 12px 56px', borderTop: '1px solid var(--dark-secondary)' }}>
                      {catProducts.length === 0 ? (
                        <p style={{ margin: 0, color: 'var(--white)', fontSize: 13 }}>📦 No products in this category yet</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {catProducts.map(prod => (
                            <div key={prod.id} style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between',
                              padding: '8px 12px',
                              background: 'var(--dark-tertiary)',
                              borderRadius: 6,
                              border: '1px solid var(--dark-secondary)',
                              fontSize: 13
                            }}>
                              <div>
                                <span style={{ fontWeight: 500, color: 'var(--white)' }}>{prod.name}</span>
                                <span style={{ marginLeft: 12, color: 'var(--gold-light)' }}>₹{parseFloat(prod.price).toFixed(2)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
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
