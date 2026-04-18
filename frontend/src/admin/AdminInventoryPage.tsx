import { useEffect, useState } from 'react';
import api from '../api/axios';

interface DemandForecast {
  productId: string;
  productName: string;
  currentStock: number;
  totalSales30Days: number;
  averageDailyDemand: number;
  predictedDemand7Days: number;
  safetyStock: number;
  recommendedStock: number;
  isLowStock: boolean;
  lastUpdated: string;
}

interface SalesData {
  date: string;
  quantity: number;
}

type TabType = 'overview' | 'low-stock' | 'details' | 'history';

export default function AdminInventoryPage() {
  const [forecasts, setForecasts] = useState<DemandForecast[]>([]);
  const [lowStockAlerts, setLowStockAlerts] = useState<DemandForecast[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<DemandForecast | null>(null);
  const [salesHistory, setSalesHistory] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Fetch all forecasts
  useEffect(() => {
    loadForecasts();
  }, []);

  async function loadForecasts() {
    try {
      setLoading(true);
      const res = await api.get('/api/inventory/forecasts');
      const data = res.data.data || [];
      setForecasts(data);
      setError('');
    } catch (err) {
      setError('Failed to load inventory data. Make sure to run initialization.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function loadLowStockAlerts() {
    try {
      const res = await api.get('/api/inventory/low-stock-alerts');
      setLowStockAlerts(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadSalesHistory(productId: string) {
    try {
      const res = await api.get(`/api/inventory/sales-history/${productId}?days=30`);
      setSalesHistory(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleInitialize() {
    try {
      setLoading(true);
      await api.post('/api/inventory/init');
      await loadForecasts();
      setError('');
    } catch (err) {
      setError('Failed to initialize metrics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleViewDetails(forecast: DemandForecast) {
    setSelectedProduct(forecast);
    setActiveTab('details');
    loadSalesHistory(forecast.productId);
  }

  function handleViewHistory(forecast: DemandForecast) {
    setSelectedProduct(forecast);
    setActiveTab('history');
    loadSalesHistory(forecast.productId);
  }

  // Calculate percentage of recommended stock
  const getStockPercentage = (forecast: DemandForecast) => {
    if (forecast.recommendedStock === 0) return 100;
    return Math.round((forecast.currentStock / forecast.recommendedStock) * 100);
  };

  // Get status color and message
  const getStockStatus = (forecast: DemandForecast) => {
    const percentage = getStockPercentage(forecast);
    if (percentage <= 50) return { color: '#dc2626', label: 'Critical', emoji: '🔴' };
    if (percentage <= 75) return { color: '#f59e0b', label: 'Low', emoji: '🟠' };
    if (percentage <= 100) return { color: '#f59e0b', label: 'Optimal', emoji: '🟡' };
    return { color: '#FF6B35', label: 'Excess', emoji: '✨' };
  };

  return (
    <div style={{ padding: '32px 40px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ margin: '0 0 8px', fontSize: 32, fontWeight: 800, color: 'var(--gold)', textShadow: '0 0 12px rgba(255, 107, 53, 0.4)' }}>
          📦 Inventory Management
        </h1>
        <p style={{ margin: 0, color: 'var(--white)', fontSize: 15 }}>
          Smart demand forecasting and stock level recommendations
        </p>
      </div>

      {/* Error & Action Bar */}
      {error && (
        <div style={{
          padding: '16px 20px',
          background: 'rgba(255, 107, 107, 0.1)',
          border: '1px solid var(--error)',
          borderRadius: 8,
          marginBottom: 24,
          color: 'var(--error)',
          fontSize: 14,
        }}>
          {error}
          <button
            onClick={handleInitialize}
            style={{
              marginLeft: 12,
              padding: '6px 16px',
              background: 'var(--error)',
              color: 'var(--white)',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Initialize Metrics
          </button>
        </div>
      )}

      {/* Tabs */}
      {selectedProduct && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid #e2e8f0', marginBottom: 24 }}>
            {['overview', 'low-stock', 'details', 'history'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as TabType)}
                style={{
                  padding: '12px 16px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === tab ? '2px solid #2563eb' : 'none',
                  color: activeTab === tab ? 'var(--gold)' : 'var(--white)',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {tab === 'overview' && '📊 Overview'}
                {tab === 'low-stock' && '⚠️ Low Stock'}
                {tab === 'details' && '📈 Details'}
                {tab === 'history' && '📅 History'}
              </button>
            ))}
            <button
              onClick={() => { setSelectedProduct(null); setActiveTab('overview'); }}
              style={{
                marginLeft: 'auto',
                padding: '8px 14px',
                background: '#f1f5f9',
                color: 'var(--white)',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              ✕ Close
            </button>
          </div>
        </div>
      )}

      {/* Content based on selected tab */}
      {!selectedProduct && activeTab === 'overview' && (
        <>
          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 40 }}>
            <div style={{ background: 'var(--dark-tertiary)', borderRadius: 12, padding: 24, border: '1px solid var(--dark-secondary)' }}>
              <div style={{ fontSize: 14, color: 'var(--white)', marginBottom: 8, fontWeight: 600 }}>Total Products</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--gold)' }}>{forecasts.length}</div>
            </div>
            <div style={{ background: 'var(--dark-tertiary)', borderRadius: 12, padding: 24, border: '1px solid var(--dark-secondary)' }}>
              <div style={{ fontSize: 14, color: 'var(--white)', marginBottom: 8, fontWeight: 600 }}>Low Stock Alert</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--error)' }}>{lowStockAlerts.length}</div>
              <button
                onClick={() => { setActiveTab('low-stock'); loadLowStockAlerts(); }}
                style={{
                  marginTop: 12,
                  padding: '6px 12px',
                  background: 'rgba(255, 107, 107, 0.1)',
                  color: 'var(--error)',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                View Alerts
              </button>
            </div>
            <div style={{ background: 'var(--dark-tertiary)', borderRadius: 12, padding: 24, border: '1px solid var(--dark-secondary)' }}>
              <div style={{ fontSize: 14, color: 'var(--white)', marginBottom: 8, fontWeight: 600 }}>Avg Daily Demand</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--gold-light)' }}>
                {(forecasts.reduce((sum, f) => sum + f.averageDailyDemand, 0) / Math.max(forecasts.length, 1)).toFixed(1)}
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div style={{ background: 'var(--dark-tertiary)', borderRadius: 12, border: '1px solid var(--dark-secondary)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--dark-secondary)' }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--white)' }}>All Products</h2>
            </div>

            {loading ? (
              <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--white)' }}>Loading...</div>
            ) : forecasts.length === 0 ? (
              <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--white)' }}>
                No data yet. <button onClick={handleInitialize} style={{ color: 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Initialize metrics</button>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--dark-secondary)', background: 'var(--dark-secondary)' }}>
                      <th style={{ padding: '12px 24px', textAlign: 'left', fontWeight: 600, color: 'var(--white)' }}>Product</th>
                      <th style={{ padding: '12px 24px', textAlign: 'center', fontWeight: 600, color: 'var(--white)' }}>Current Stock</th>
                      <th style={{ padding: '12px 24px', textAlign: 'center', fontWeight: 600, color: 'var(--white)' }}>30-Day Sales</th>
                      <th style={{ padding: '12px 24px', textAlign: 'center', fontWeight: 600, color: 'var(--white)' }}>Avg Daily Demand</th>
                      <th style={{ padding: '12px 24px', textAlign: 'center', fontWeight: 600, color: 'var(--white)' }}>Recommended Stock</th>
                      <th style={{ padding: '12px 24px', textAlign: 'center', fontWeight: 600, color: 'var(--white)' }}>Status</th>
                      <th style={{ padding: '12px 24px', textAlign: 'center', fontWeight: 600, color: 'var(--white)' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forecasts.map(forecast => {
                      const status = getStockStatus(forecast);
                      const percentage = getStockPercentage(forecast);
                      return (
                        <tr key={forecast.productId} style={{ borderBottom: '1px solid var(--dark-secondary)', background: forecast.isLowStock ? 'rgba(255, 107, 107, 0.05)' : 'var(--dark-tertiary)' }}>
                          <td style={{ padding: '16px 24px', fontWeight: 500, color: 'var(--white)' }}>
                            {forecast.productName.substring(0, 40)}
                          </td>
                          <td style={{ padding: '16px 24px', textAlign: 'center', color: 'var(--white)' }}>{forecast.currentStock}</td>
                          <td style={{ padding: '16px 24px', textAlign: 'center', color: 'var(--white)' }}>{forecast.totalSales30Days}</td>
                          <td style={{ padding: '16px 24px', textAlign: 'center', color: 'var(--white)' }}>
                            {forecast.averageDailyDemand.toFixed(1)}
                          </td>
                          <td style={{ padding: '16px 24px', textAlign: 'center', color: 'var(--white)' }}>
                            {forecast.recommendedStock}
                          </td>
                          <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                            <div style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              padding: '4px 10px',
                              background: `${status.color}15`,
                              color: status.color,
                              borderRadius: 6,
                              fontSize: 12,
                              fontWeight: 600,
                            }}>
                              {status.emoji} {status.label} ({percentage}%)
                            </div>
                          </td>
                          <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                            <button
                              onClick={() => handleViewDetails(forecast)}
                              style={{
                                padding: '6px 12px',
                                background: 'var(--gold-gradient)',
                                color: 'var(--white)',
                                border: 'none',
                                borderRadius: 6,
                                cursor: 'pointer',
                                fontSize: 12,
                                fontWeight: 600,
                                boxShadow: 'var(--gold-glow)',
                              }}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Low Stock Alerts Tab */}
      {activeTab === 'low-stock' && !selectedProduct && (
        <div style={{ background: 'var(--dark-tertiary)', borderRadius: 12, border: '1px solid var(--dark-secondary)', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--dark-secondary)', background: 'rgba(255, 107, 107, 0.05)' }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--error)' }}>⚠️ Low Stock Alerts</h2>
          </div>

          {lowStockAlerts.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--gray-400)' }}>
              All products have optimal stock levels! 🎉
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--dark-secondary)', background: 'var(--dark-secondary)' }}>
                    <th style={{ padding: '12px 24px', textAlign: 'left', fontWeight: 600, color: 'var(--white)' }}>Product</th>
                    <th style={{ padding: '12px 24px', textAlign: 'center', fontWeight: 600, color: 'var(--white)' }}>Current Stock</th>
                    <th style={{ padding: '12px 24px', textAlign: 'center', fontWeight: 600, color: 'var(--white)' }}>Recommended</th>
                    <th style={{ padding: '12px 24px', textAlign: 'center', fontWeight: 600, color: 'var(--white)' }}>Shortage</th>
                    <th style={{ padding: '12px 24px', textAlign: 'center', fontWeight: 600, color: 'var(--white)' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockAlerts.map(alert => {
                    const shortage = alert.recommendedStock - alert.currentStock;
                    return (
                      <tr key={alert.productId} style={{ borderBottom: '1px solid var(--dark-secondary)' }}>
                        <td style={{ padding: '16px 24px', fontWeight: 500, color: 'var(--light-text)' }}>
                          {alert.productName.substring(0, 40)}
                        </td>
                        <td style={{ padding: '16px 24px', textAlign: 'center', color: 'var(--error)', fontWeight: 600 }}>
                          {alert.currentStock}
                        </td>
                        <td style={{ padding: '16px 24px', textAlign: 'center', color: 'var(--gray-400)' }}>
                          {alert.recommendedStock}
                        </td>
                        <td style={{ padding: '16px 24px', textAlign: 'center', color: 'var(--error)', fontWeight: 600 }}>
                          -{shortage}
                        </td>
                        <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                          <button
                            onClick={() => handleViewDetails(alert)}
                            style={{
                              padding: '6px 12px',
                              background: 'var(--gold-gradient)',
                              color: 'var(--white)',
                              border: 'none',
                              borderRadius: 6,
                              cursor: 'pointer',
                              fontSize: 12,
                              fontWeight: 600,
                              boxShadow: 'var(--gold-glow)',
                            }}
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Product Details Tab */}
      {selectedProduct && activeTab === 'details' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Forecast Card */}
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, color: 'var(--gold)' }}>
              {selectedProduct.productName}
            </h3>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: 'var(--gold-light)', fontWeight: 600, marginBottom: 4 }}>Current Stock</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#2563eb' }}>{selectedProduct.currentStock}</div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: 'var(--gold-light)', fontWeight: 600, marginBottom: 4 }}>30-Day Sales</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--gold-light)' }}>{selectedProduct.totalSales30Days} units</div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: 'var(--gold-light)', fontWeight: 600, marginBottom: 4 }}>Average Daily Demand</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--gold-light)' }}>
                {selectedProduct.averageDailyDemand.toFixed(2)} units/day
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: 'var(--gold-light)', fontWeight: 600, marginBottom: 4 }}>Predicted Demand (7 Days)</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--gold-light)' }}>
                {selectedProduct.predictedDemand7Days.toFixed(1)} units
              </div>
            </div>

            <div style={{ marginBottom: 16 }} />

            <div style={{ background: 'rgba(255, 107, 53, 0.1)', borderRadius: 8, padding: 16, border: '1px solid var(--gold)' }}>
              <div style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 600, marginBottom: 4 }}>Recommended Stock Level</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--gold-light)' }}>
                {selectedProduct.recommendedStock} units
              </div>
              <div style={{ fontSize: 12, color: 'var(--light-text)', marginTop: 8 }}>
                = Predicted Demand (7d) + Safety Stock (3d buffer)
              </div>
            </div>
          </div>

          {/* Stock Status Card */}
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, color: 'var(--gold)' }}>Stock Status</h3>

            <div style={{
              padding: 24,
              background: selectedProduct.isLowStock ? '#fef2f2' : 'rgba(212, 175, 55, 0.1)',
              borderRadius: 8,
              border: `1px solid ${selectedProduct.isLowStock ? '#fecaca' : 'var(--gold)'}`,
              marginBottom: 20,
            }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                {selectedProduct.isLowStock ? '🔴 LOW STOCK ALERT' : '✨ OPTIMAL STOCK'}
              </div>
              <div style={{
                fontSize: 12,
                color: selectedProduct.isLowStock ? '#7f1d1d' : 'var(--gold)',
                lineHeight: 1.6,
              }}>
                {selectedProduct.isLowStock
                  ? `Current stock (${selectedProduct.currentStock}) is below recommended level (${selectedProduct.recommendedStock}). Shortage: ${selectedProduct.recommendedStock - selectedProduct.currentStock} units.`
                  : `Current stock (${selectedProduct.currentStock}) meets recommended level (${selectedProduct.recommendedStock}). All good!`
                }
              </div>
            </div>

            {/* Stock Gauge */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: 'var(--gold-light)', fontWeight: 600, marginBottom: 8 }}>Stock Level</div>
              <div style={{
                height: 24,
                background: '#e2e8f0',
                borderRadius: 12,
                overflow: 'hidden',
                position: 'relative',
              }}>
                <div style={{
                  width: `${Math.min(getStockPercentage(selectedProduct), 100)}%`,
                  height: '100%',
                  background: getStockPercentage(selectedProduct) <= 50 ? '#dc2626' : getStockPercentage(selectedProduct) <= 75 ? '#f59e0b' : 'var(--gold)',
                  transition: 'width 0.3s ease',
                }} />
              </div>
              <div style={{ fontSize: 12, color: 'var(--light-text)', marginTop: 6 }}>
                {getStockPercentage(selectedProduct)}% of recommended level
              </div>
            </div>

            {/* Times to Reorder */}
            <div style={{
              background: '#eff6ff',
              borderRadius: 8,
              padding: 16,
              border: '1px solid #bfdbfe',
            }}>
              <div style={{ fontSize: 12, color: '#1e40af', fontWeight: 600, marginBottom: 12 }}>📅 Reorder Plan</div>
              <div style={{ fontSize: 12, color: '#1e40af', lineHeight: 1.8 }}>
                <div>
                  <strong>Days until stockout:</strong> {selectedProduct.averageDailyDemand > 0 ? Math.ceil(selectedProduct.currentStock / selectedProduct.averageDailyDemand) : '∞'} days
                </div>
                <div>
                  <strong>Order quantity:</strong> {Math.max(selectedProduct.recommendedStock - selectedProduct.currentStock, 0)} units
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sales History Tab */}
      {selectedProduct && activeTab === 'history' && (
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
            Sales History: {selectedProduct.productName}
          </h3>

          {salesHistory.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
              No sales data available
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#334155' }}>Date</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: '#334155' }}>Quantity Sold</th>
                  </tr>
                </thead>
                <tbody>
                  {[...salesHistory].reverse().map((sale, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '12px 16px', color: '#475569' }}>{sale.date}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: '#2563eb' }}>
                        {sale.quantity} units
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
