import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from './api';

function ShopPrintOrders() {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderFilter, setOrderFilter] = React.useState('all');
  const [orders, setOrders] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [user, setUser] = React.useState(null);
  const [expandedOrderId, setExpandedOrderId] = React.useState(null);

  React.useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  React.useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please login to view orders');
          return;
        }
        const storesResponse = await api.get('/stores/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (storesResponse.data.status === 'success' && storesResponse.data.data) {
          const storeId = storesResponse.data.data.id;
          const ordersResponse = await api.get(`/orders/shop/${storeId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (ordersResponse.data.status === 'success') {
            const newOrders = ordersResponse.data.orders || [];
            setOrders(newOrders);
          } else {
            setError(ordersResponse.data.message || 'Failed to fetch orders');
          }
        } else {
          setError('No stores found. Please register a store first.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.patch(`/orders/${orderId}/status`, 
        { status: newStatus },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (response.data.status === 'success') {
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId 
              ? { ...order, status: newStatus }
              : order
          )
        );
      }
    } catch (err) {
      // Optionally handle error
    }
  };

  const filteredOrders = orderFilter === 'all' 
    ? orders 
    : orders.filter(o => o.status.toLowerCase() === orderFilter);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePrint = (pdfUrl) => {
    window.open(pdfUrl, '_blank');
  };

  return (
    <div
      className="relative flex min-h-screen flex-col group/design-root overflow-x-hidden"
      style={{ fontFamily: '"Inter", "Work Sans", "Noto Sans", sans-serif' }}
    >
      {/* Animated Gradient Background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        background: 'linear-gradient(120deg, #f8fafc 0%, #e0e7ff 60%, rgba(252,234,187,0.18) 90%)',
        animation: 'gradient-move 20s ease-in-out infinite',
        backgroundSize: '200% 200%'
      }} />
      {/* Decorative SVG Blob */}
      <svg style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, opacity: 0.18, zIndex: 1 }} viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="200" cy="200" r="200" fill="url(#ordersBlob)" />
        <defs>
          <radialGradient id="ordersBlob" cx="0" cy="0" r="1" gradientTransform="translate(200 200) scale(200)" gradientUnits="userSpaceOnUse">
            <stop stopColor="#176fd3" />
            <stop offset="1" stopColor="#fbbf24" stopOpacity="0.2" />
          </radialGradient>
        </defs>
      </svg>
      <div className="layout-container flex h-full grow flex-col" style={{ position: 'relative', zIndex: 2 }}>
        <div className="px-4 sm:px-10 md:px-20 lg:px-40 flex flex-1 justify-center py-5">
        <div className="layout-content-container flex flex-col max-w-[1400px] flex-1">
            {/* Premium Card Container */}
            <div style={{
              background: 'rgba(255,255,255,0.95)',
              borderRadius: 24,
              boxShadow: '0 8px 32px 0 rgba(23,111,211,0.08)',
              padding: '32px',
              marginBottom: 32,
              border: '2px solid #e0e7ff',
              backdropFilter: 'blur(10px)',
              minWidth: 1200,
              width: '100%',
            }}>
          <div className="flex flex-wrap justify-between gap-3 p-4">
                <p className="text-[#0e141b] tracking-light text-[32px] font-bold leading-tight min-w-72" style={{ letterSpacing: '-0.01em' }}>
                  <span style={{
                    background: 'linear-gradient(90deg, #176fd3 0%, #fbbf24 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    textFillColor: 'transparent',
                  }}>Orders</span>
                </p>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Total Orders: {orders.length}</span>
            </div>
          </div>
              {/* Premium Filter Buttons */}
            <div className="flex items-center mb-4 gap-2">
              {['all', 'pending', 'processing', 'completed', 'cancelled'].map(option => (
                <button
                  key={option}
                    className="premium-filter-btn"
                    style={{
                      background: orderFilter === option
                        ? 'linear-gradient(90deg, #176fd3 0%, #fbbf24 100%)'
                        : 'rgba(255,255,255,0.7)',
                      color: orderFilter === option ? '#fff' : '#0e141b',
                      border: orderFilter === option ? '2px solid #176fd3' : '2px solid #e0e7ff',
                      fontWeight: 600,
                      borderRadius: 16,
                      padding: '10px 24px',
                      fontSize: 15,
                      boxShadow: orderFilter === option ? '0 2px 8px 0 rgba(23,111,211,0.10)' : 'none',
                      position: 'relative',
                      transition: 'all 0.2s',
                    }}
                  onClick={() => setOrderFilter(option)}
                  type="button"
                >
                    <span style={{ marginLeft: orderFilter === option ? 18 : 0 }}>{option.charAt(0).toUpperCase() + option.slice(1)}</span>
                </button>
              ))}
            </div>
              {/* Premium Table & States */}
              <div className="orders-table-area" style={{ position: 'relative', minHeight: 420, maxHeight: 420, height: 420, overflowY: 'auto', width: '100%' }}>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                    <div className="text-[#4e7097] text-sm flex flex-col items-center">
                      <svg width="48" height="48" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#176fd3" strokeWidth="4" opacity="0.2"/><path d="M12 2a10 10 0 0 1 10 10" stroke="#176fd3" strokeWidth="4" strokeLinecap="round"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/></path></svg>
                      Loading orders...
                    </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-8">
                    <div className="text-red-600 text-sm text-center px-4 flex flex-col items-center">
                      <svg width="40" height="40" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#f87171" strokeWidth="4" opacity="0.2"/><path d="M8 8l8 8M16 8l-8 8" stroke="#f87171" strokeWidth="2" strokeLinecap="round"/></svg>
                      {error}
                    </div>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                    <div className="text-[#4e7097] text-sm text-center px-4 flex flex-col items-center">
                      <svg width="40" height="40" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#176fd3" strokeWidth="4" opacity="0.2"/><path d="M8 12h8" stroke="#176fd3" strokeWidth="2" strokeLinecap="round"/></svg>
                  {orderFilter === 'all' ? 'No orders found.' : `No ${orderFilter} orders found.`}
                </div>
              </div>
            ) : (
                  <table className="flex-1 min-w-[1200px]" style={{ borderRadius: 16, overflow: 'hidden' }}>
                  <thead>
                      <tr style={{ background: 'rgba(248,250,252,0.95)' }}>
                        <th className="px-4 py-3 text-left text-[#0e141b] w-[120px] text-sm font-semibold leading-normal">Order #</th>
                        <th className="px-4 py-3 text-left text-[#0e141b] w-[180px] text-sm font-semibold leading-normal">Customer</th>
                        <th className="px-2 py-3 text-left text-[#0e141b] w-[120px] text-sm font-semibold leading-normal">Mobile</th>
                        <th className="px-2 py-3 text-left text-[#0e141b] w-[120px] text-sm font-semibold leading-normal">Date</th>
                        <th className="px-2 py-3 text-left text-[#0e141b] w-[120px] text-sm font-semibold leading-normal">Time</th>
                        <th className="px-4 py-3 text-left text-[#0e141b] w-[120px] text-sm font-semibold leading-normal">Type</th>
                        <th className="px-4 py-3 text-left text-[#0e141b] w-[120px] text-sm font-semibold leading-normal">Pages</th>
                        <th className="px-4 py-3 text-left text-[#0e141b] w-[120px] text-sm font-semibold leading-normal">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(order => (
                      <React.Fragment key={order.id}>
                          <tr
                            className="border-t border-t-[#e0e7ff] cursor-pointer hover:bg-[#f0f6ff] transition"
                            style={{ transition: 'background 0.2s', borderRadius: 12, height: 72, maxHeight: 72, overflow: 'hidden' }}
                            onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                          >
                          <td className="h-[72px] px-4 py-2 w-[120px] text-[#0e141b] text-sm font-normal leading-normal">
                            #{order.id.slice(-6)}
                          </td>
                          <td className="h-[72px] px-4 py-2 w-[180px] text-[#4e7097] text-sm font-normal leading-normal">
                            {order.user?.firstName} {order.user?.lastName}
                          </td>
                          <td className="h-[72px] px-2 py-2 w-[120px] text-[#4e7097] text-sm font-normal leading-normal">
                            {order.user?.mobile}
                          </td>
                          <td className="h-[72px] px-2 py-2 w-[120px] text-[#4e7097] text-sm font-normal leading-normal">
                            {formatDate(order.createdAt)}
                          </td>
                          <td className="h-[72px] px-2 py-2 w-[120px] text-[#4e7097] text-sm font-normal leading-normal">
                            {formatTime(order.createdAt)}
                          </td>
                          <td className="h-[72px] px-4 py-2 w-[120px] text-[#4e7097] text-sm font-normal leading-normal">
                            {order.colorMode === 'black_white' ? 'B&W' : 'Color'}
                          </td>
                          <td className="h-[72px] px-4 py-2 w-[120px] text-[#4e7097] text-sm font-normal leading-normal">
                            {order.pageRange}
                          </td>
                          <td className="h-[72px] px-4 py-2 w-[120px] text-sm font-normal leading-normal">
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '4px 12px',
                                borderRadius: 999,
                                fontSize: 13,
                                fontWeight: 600,
                                background: order.status.toLowerCase() === 'pending'
                                  ? 'linear-gradient(90deg, #fbbf24 0%, #fef9c3 100%)'
                                  : order.status.toLowerCase() === 'processing'
                                  ? 'linear-gradient(90deg, #176fd3 0%, #e0e7ff 100%)'
                                  : order.status.toLowerCase() === 'completed'
                                  ? 'linear-gradient(90deg, #22c55e 0%, #bbf7d0 100%)'
                                  : order.status.toLowerCase() === 'cancelled'
                                  ? 'linear-gradient(90deg, #ef4444 0%, #fee2e2 100%)'
                                  : 'linear-gradient(90deg, #cbd5e1 0%, #f1f5f9 100%)',
                                color: order.status.toLowerCase() === 'pending'
                                  ? '#b45309'
                                  : order.status.toLowerCase() === 'processing'
                                  ? '#176fd3'
                                  : order.status.toLowerCase() === 'completed'
                                  ? '#15803d'
                                  : order.status.toLowerCase() === 'cancelled'
                                  ? '#b91c1c'
                                  : '#334155',
                                boxShadow: '0 1px 4px 0 rgba(23,111,211,0.06)',
                                minWidth: 80,
                                justifyContent: 'center',
                              }}>
                                {order.status === 'pending' && <span style={{ marginRight: 6 }}>⏳</span>}
                                {order.status === 'processing' && <span style={{ marginRight: 6 }}>🔄</span>}
                                {order.status === 'completed' && <span style={{ marginRight: 6 }}>✅</span>}
                                {order.status === 'cancelled' && <span style={{ marginRight: 6 }}>❌</span>}
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                          </td>
                        </tr>
                          {/* Premium Expanded Order Details */}
                        {expandedOrderId === order.id && (
                            <div style={{
                              position: 'absolute',
                              top: 40,
                              left: '50%',
                              transform: 'translateX(-50%)',
                              zIndex: 10,
                              width: 600,
                              minWidth: 600,
                              maxWidth: '90vw',
                              height: 320,
                              minHeight: 320,
                              maxHeight: 320,
                              background: 'rgba(255,255,255,0.98)',
                              borderRadius: 20,
                              boxShadow: '0 8px 32px 0 rgba(23,111,211,0.18)',
                              padding: 32,
                              overflowY: 'auto',
                              border: '2px solid #e0e7ff',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'stretch',
                              justifyContent: 'flex-start',
                            }}>
                              {/* Close button */}
                              <button onClick={() => setExpandedOrderId(null)} style={{ position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', fontSize: 22, color: '#176fd3', cursor: 'pointer' }}>×</button>
                              <h2 className="text-[#0c1c17] text-[22px] font-bold leading-tight tracking-[-0.015em] mb-4" style={{ letterSpacing: '-0.01em' }}>
                                <span style={{
                                  background: 'linear-gradient(90deg, #176fd3 0%, #fbbf24 100%)',
                                  WebkitBackgroundClip: 'text',
                                  WebkitTextFillColor: 'transparent',
                                  backgroundClip: 'text',
                                  textFillColor: 'transparent',
                                }}>Order Details</span>
                              </h2>
                              <div className="grid grid-cols-2 gap-6 mb-6">
                                <div className="flex flex-col gap-1">
                                  <span className="text-[#176fd3] text-sm font-normal leading-normal">Order #</span>
                                  <span className="text-[#0c1c17] text-base font-semibold leading-normal">#{order.id.slice(-6)}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                  <span className="text-[#176fd3] text-sm font-normal leading-normal">Customer</span>
                                  <span className="text-[#0c1c17] text-base font-semibold leading-normal">{order.user?.firstName} {order.user?.lastName}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                  <span className="text-[#176fd3] text-sm font-normal leading-normal">Mobile</span>
                                  <span className="text-[#0c1c17] text-base font-semibold leading-normal">{order.user?.mobile}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                  <span className="text-[#176fd3] text-sm font-normal leading-normal">Date</span>
                                  <span className="text-[#0c1c17] text-base font-semibold leading-normal">{formatDate(order.createdAt)}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                  <span className="text-[#176fd3] text-sm font-normal leading-normal">Time</span>
                                  <span className="text-[#0c1c17] text-base font-semibold leading-normal">{formatTime(order.createdAt)}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                  <span className="text-[#176fd3] text-sm font-normal leading-normal">Type</span>
                                  <span className="text-[#0c1c17] text-base font-semibold leading-normal">{order.colorMode === 'black_white' ? 'B&W' : 'Color'}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                  <span className="text-[#176fd3] text-sm font-normal leading-normal">Pages</span>
                                  <span className="text-[#0c1c17] text-base font-semibold leading-normal">{order.pageRange}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                  <span className="text-[#176fd3] text-sm font-normal leading-normal">Status</span>
                                  <span className="text-[#0c1c17] text-base font-semibold leading-normal">{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                                </div>
                              </div>
                              <div className="flex gap-4" style={{ minHeight: 48 }}>
                                {order.pdfUrl && (
                                  <button
                                    className="premium-action-btn"
                                    style={{
                                      background: 'linear-gradient(90deg, #176fd3 0%, #e0e7ff 100%)',
                                      color: '#176fd3',
                                      fontWeight: 600,
                                      borderRadius: 999,
                                      padding: '10px 28px',
                                      fontSize: 15,
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 8,
                                      boxShadow: '0 1px 4px 0 rgba(23,111,211,0.06)',
                                      border: 'none',
                                      transition: 'background 0.2s',
                                    }}
                                    onClick={e => { e.stopPropagation(); handlePrint(order.pdfUrl); }}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#176fd3" style={{ width: 18, height: 18 }}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9v3m0 0v3m0-3h12m-6 0v6m0-6V3m0 6h6m-6 0H6" />
                                    </svg>
                                    Print
                                  </button>
                                )}
                                {order.status !== 'completed' && (
                                  <button
                                    className="premium-action-btn"
                                    style={{
                                      background: 'linear-gradient(90deg, #22c55e 0%, #bbf7d0 100%)',
                                      color: '#15803d',
                                      fontWeight: 600,
                                      borderRadius: 999,
                                      padding: '10px 28px',
                                      fontSize: 15,
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 8,
                                      boxShadow: '0 1px 4px 0 rgba(34,197,94,0.06)',
                                      border: 'none',
                                      transition: 'background 0.2s',
                                    }}
                                    onClick={e => { e.stopPropagation(); updateOrderStatus(order.id, 'completed'); }}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#15803d" style={{ width: 18, height: 18 }}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                    Mark as Printed
                                  </button>
                                )}
                                {!(order.pdfUrl || order.status !== 'completed') && <span>&nbsp;</span>}
                              </div>
                            </div>
                          )}
                          {/* Backdrop */}
                          {expandedOrderId && (
                            <div style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              background: 'rgba(16,30,50,0.12)',
                              zIndex: 9,
                            }} onClick={() => setExpandedOrderId(null)} />
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShopPrintOrders; 