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
    <div className="relative flex min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden" style={{ fontFamily: '"Work Sans", "Noto Sans", sans-serif' }}>
      <div className="px-40 flex flex-1 justify-center py-5">
        <div className="layout-content-container flex flex-col max-w-[1400px] flex-1">
          <div className="flex flex-wrap justify-between gap-3 p-4">
            <p className="text-[#0e141b] tracking-light text-[32px] font-bold leading-tight min-w-72">Orders</p>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Total Orders: {orders.length}</span>
            </div>
          </div>
          <div className="px-4 py-3 @container">
            <div className="flex items-center mb-4 gap-2">
              {['all', 'pending', 'processing', 'completed', 'cancelled'].map(option => (
                <button
                  key={option}
                  className={`px-5 py-2 rounded-xl text-sm font-medium border border-[#d0dbe7] transition-colors duration-150 ${orderFilter === option ? 'bg-[#176fd3] text-white' : 'bg-white text-[#0e141b]'}`}
                  onClick={() => setOrderFilter(option)}
                  type="button"
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </button>
              ))}
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-[#4e7097] text-sm">Loading orders...</div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-red-600 text-sm text-center px-4">{error}</div>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-[#4e7097] text-sm text-center px-4">
                  {orderFilter === 'all' ? 'No orders found.' : `No ${orderFilter} orders found.`}
                </div>
              </div>
            ) : (
              <div className="flex overflow-x-auto rounded-xl border border-[#d0dbe7] bg-slate-50">
                <table className="flex-1 min-w-[1200px]">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-4 py-3 text-left text-[#0e141b] w-[120px] text-sm font-medium leading-normal">Order #</th>
                      <th className="px-4 py-3 text-left text-[#0e141b] w-[180px] text-sm font-medium leading-normal">Customer</th>
                      <th className="px-2 py-3 text-left text-[#0e141b] w-[120px] text-sm font-medium leading-normal">Mobile</th>
                      <th className="px-2 py-3 text-left text-[#0e141b] w-[120px] text-sm font-medium leading-normal">Date</th>
                      <th className="px-2 py-3 text-left text-[#0e141b] w-[120px] text-sm font-medium leading-normal">Time</th>
                      <th className="px-4 py-3 text-left text-[#0e141b] w-[120px] text-sm font-medium leading-normal">Type</th>
                      <th className="px-4 py-3 text-left text-[#0e141b] w-[120px] text-sm font-medium leading-normal">Pages</th>
                      <th className="px-4 py-3 text-left text-[#0e141b] w-[120px] text-sm font-medium leading-normal">Status</th>
                      <th className="px-4 py-3 text-left text-[#0e141b] w-[200px] text-sm font-medium leading-normal">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(order => (
                      <React.Fragment key={order.id}>
                        <tr className="border-t border-t-[#d0dbe7] cursor-pointer hover:bg-blue-50 transition" onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}>
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
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>{order.status}</span>
                          </td>
                          <td className="h-[72px] px-4 py-2 w-[200px] text-sm font-normal leading-normal flex items-center gap-2">
                            {order.pdfUrl && (
                              <a 
                                href={order.pdfUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs hover:bg-blue-200"
                                onClick={e => e.stopPropagation()}
                              >
                                View PDF
                              </a>
                            )}
                            {order.status === 'pending' && (
                              <>
                                <button 
                                  onClick={e => { e.stopPropagation(); updateOrderStatus(order.id, 'processing'); }}
                                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs hover:bg-blue-200"
                                >
                                  Start
                                </button>
                                <button 
                                  onClick={e => { e.stopPropagation(); updateOrderStatus(order.id, 'cancelled'); }}
                                  className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs hover:bg-red-200"
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                            {order.status === 'processing' && (
                              <button 
                                onClick={e => { e.stopPropagation(); updateOrderStatus(order.id, 'completed'); }}
                                className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs hover:bg-green-200"
                              >
                                Complete
                              </button>
                            )}
                          </td>
                        </tr>
                        {expandedOrderId === order.id && (
                          <tr>
                            <td colSpan={9} className="bg-white border-t border-b border-[#d0dbe7] p-0">
                              <h2 className="text-[#0c1c17] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Order Details</h2>
                              <div className="p-4 grid grid-cols-2">
                                <div className="flex flex-col gap-1 border-t border-solid border-t-[#cde9df] py-4 pr-2">
                                  <p className="text-[#176fd3] text-sm font-normal leading-normal">Order #</p>
                                  <p className="text-[#0c1c17] text-sm font-normal leading-normal">#{order.id.slice(-6)}</p>
                                </div>
                                <div className="flex flex-col gap-1 border-t border-solid border-t-[#cde9df] py-4 pl-2">
                                  <p className="text-[#176fd3] text-sm font-normal leading-normal">Customer</p>
                                  <p className="text-[#0c1c17] text-sm font-normal leading-normal">{order.user?.firstName} {order.user?.lastName}</p>
                                </div>
                                <div className="flex flex-col gap-1 border-t border-solid border-t-[#cde9df] py-4 pr-2">
                                  <p className="text-[#176fd3] text-sm font-normal leading-normal">Mobile</p>
                                  <p className="text-[#0c1c17] text-sm font-normal leading-normal">{order.user?.mobile}</p>
                                </div>
                                <div className="flex flex-col gap-1 border-t border-solid border-t-[#cde9df] py-4 pl-2">
                                  <p className="text-[#176fd3] text-sm font-normal leading-normal">Date</p>
                                  <p className="text-[#0c1c17] text-sm font-normal leading-normal">{formatDate(order.createdAt)}</p>
                                </div>
                                <div className="flex flex-col gap-1 border-t border-solid border-t-[#cde9df] py-4 pr-2">
                                  <p className="text-[#176fd3] text-sm font-normal leading-normal">Time</p>
                                  <p className="text-[#0c1c17] text-sm font-normal leading-normal">{formatTime(order.createdAt)}</p>
                                </div>
                                <div className="flex flex-col gap-1 border-t border-solid border-t-[#cde9df] py-4 pl-2">
                                  <p className="text-[#176fd3] text-sm font-normal leading-normal">Type</p>
                                  <p className="text-[#0c1c17] text-sm font-normal leading-normal">{order.colorMode === 'black_white' ? 'B&W' : 'Color'}</p>
                                </div>
                                <div className="flex flex-col gap-1 border-t border-solid border-t-[#cde9df] py-4 pr-2">
                                  <p className="text-[#176fd3] text-sm font-normal leading-normal">Pages</p>
                                  <p className="text-[#0c1c17] text-sm font-normal leading-normal">{order.pageRange}</p>
                                </div>
                                <div className="flex flex-col gap-1 border-t border-solid border-t-[#cde9df] py-4 pl-2">
                                  <p className="text-[#176fd3] text-sm font-normal leading-normal">Status</p>
                                  <p className="text-[#0c1c17] text-sm font-normal leading-normal">{order.status}</p>
                                </div>
                              </div>
                              <div className="flex gap-4 px-4 pb-4">
                                {order.pdfUrl && (
                                  <button
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-xs hover:bg-blue-200 font-bold"
                                    onClick={e => { e.stopPropagation(); handlePrint(order.pdfUrl); }}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9v3m0 0v3m0-3h12m-6 0v6m0-6V3m0 6h6m-6 0H6" />
                                    </svg>
                                    Print
                                  </button>
                                )}
                                {order.pdfUrl && (
                                  <a
                                    href={order.pdfUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 rounded-full text-xs hover:bg-gray-200 font-bold"
                                    onClick={e => e.stopPropagation()}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-8m0 8l-4-4m4 4l4-4" />
                                    </svg>
                                    Download
                                  </a>
                                )}
                                {order.status !== 'completed' && (
                                  <button
                                    className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-xs hover:bg-green-200 font-bold"
                                    onClick={e => { e.stopPropagation(); updateOrderStatus(order.id, 'completed'); }}
                                  >
                                    Mark as Printed
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShopPrintOrders; 