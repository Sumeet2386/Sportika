import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package, ChevronDown, ChevronUp, MapPin, CreditCard,
  RefreshCw, Eye, Printer, X, CheckCircle2, Clock, Truck, ShoppingBag
} from 'lucide-react';
import { useOrderStore, useCartStore, useUIStore } from '../store';
import type { Order, OrderStatus } from '../types';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending Verification', color: '#D97706', bg: '#FEF3C7' },
  confirmed: { label: 'Order Confirmed', color: '#2563EB', bg: '#EFF6FF' },
  processing: { label: 'Packing Items', color: '#7C3AED', bg: '#F5F3FF' },
  shipped: { label: 'Dispatched & Shipped', color: '#0284C7', bg: '#E0F2FE' },
  out_for_delivery: { label: 'Out for Delivery', color: '#059669', bg: '#ECFDF5' },
  delivered: { label: 'Delivered', color: '#16A34A', bg: '#DCFCE7' },
  cancelled: { label: 'Cancelled', color: '#DC2626', bg: '#FEE2E2' },
  return_requested: { label: 'Return Requested', color: '#EA580C', bg: '#FFEDD5' },
  returned: { label: 'Returned', color: '#4B5563', bg: '#F3F4F6' },
  refunded: { label: 'Refunded', color: '#0D9488', bg: '#CCFBF1' },
};

function OrderCard({
  order,
  onOpenInvoice,
  onCancel,
  onBuyAgain,
}: {
  order: Order;
  onOpenInvoice: (order: Order) => void;
  onCancel: (orderId: string) => void;
  onBuyAgain: (order: Order) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;

  return (
    <div style={{ background: 'white', borderRadius: 20, border: '1px solid #E2E8F8', overflow: 'hidden', marginBottom: 18, boxShadow: '0 2px 10px rgba(27,31,59,0.02)' }}>
      {/* Header */}
      <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.1rem', color: '#0F172A' }}>
              Order #{order.orderNumber}
            </span>
            <span style={{ padding: '4px 12px', borderRadius: 50, fontFamily: 'Outfit', fontWeight: 700, fontSize: '0.75rem', background: status.bg, color: status.color }}>
              {status.label}
            </span>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Order Total</div>
            <div style={{ fontFamily: 'Outfit', fontWeight: 900, color: '#1565C0', fontSize: '1.25rem' }}>
              ₹{order.total.toLocaleString('en-IN')}
            </div>
          </div>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="icon-btn"
            style={{ border: '1px solid #E2E8F8' }}
            title={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* Items Preview */}
      <div style={{ padding: '0 24px 18px', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {order.items.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#F8FAFC', borderRadius: 12, padding: '8px 12px', border: '1px solid #F1F5F9' }}>
            <img src={item.image} alt={item.name} style={{ width: 42, height: 42, borderRadius: 8, objectFit: 'cover' }} />
            <div>
              <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.85rem' }}>{item.name}</div>
              <div style={{ color: '#64748B', fontSize: '0.75rem' }}>
                Qty: {item.quantity} · Size: {item.size} {item.color ? `· ${item.color}` : ''}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div style={{ borderTop: '1px solid #E2E8F8', background: '#FAFAFD' }}>
          {/* Tracking Stepper */}
          {order.tracking && order.tracking.length > 0 && (
            <div style={{ padding: '24px 28px', borderBottom: '1px solid #E2E8F8' }}>
              <h4 style={{ fontFamily: 'Outfit', fontWeight: 800, marginBottom: 18, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Truck size={18} color="#1565C0" /> Live Tracking Timeline
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {order.tracking.map((track, i) => (
                  <div key={i} style={{ display: 'flex', gap: 16 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{
                        width: 14, height: 14, borderRadius: '50%',
                        background: i === 0 ? '#16A34A' : '#1565C0',
                        boxShadow: i === 0 ? '0 0 0 4px rgba(22,163,74,0.2)' : 'none',
                        flexShrink: 0, marginTop: 4
                      }} />
                      {i < order.tracking!.length - 1 && (
                        <div style={{ width: 2, flex: 1, background: '#CBD5E1', minHeight: 28 }} />
                      )}
                    </div>
                    <div style={{ paddingBottom: 18 }}>
                      <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '0.9rem', color: '#0F172A' }}>
                        {track.status}
                      </div>
                      <div style={{ fontSize: '0.825rem', color: '#475569', marginTop: 2 }}>{track.description}</div>
                      {track.location && (
                        <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: 2 }}>📍 {track.location}</div>
                      )}
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: 3 }}>
                        {new Date(track.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Delivery & Payment details */}
          <div style={{ padding: '24px 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div>
              <h4 style={{ fontFamily: 'Outfit', fontWeight: 800, marginBottom: 8, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                <MapPin size={16} color="#1565C0" /> Delivery Address
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.6 }}>
                <strong>{order.address.name}</strong><br />
                {order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ''}<br />
                {order.address.city}, {order.address.state} — {order.address.pincode}<br />
                📞 {order.address.phone}
              </p>
            </div>
            <div>
              <h4 style={{ fontFamily: 'Outfit', fontWeight: 800, marginBottom: 8, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                <CreditCard size={16} color="#1565C0" /> Payment & Billing
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.6 }}>
                Method: <strong style={{ textTransform: 'uppercase' }}>{order.payment.method}</strong><br />
                Status: <span style={{ fontWeight: 700, color: order.payment.status === 'paid' ? '#16A34A' : '#D97706' }}>
                  {order.payment.status.toUpperCase()}
                </span><br />
                Amount Paid: <strong>₹{order.total.toLocaleString('en-IN')}</strong><br />
                GST Included (5%): ₹{order.tax.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* Actions Bar */}
          <div style={{ padding: '16px 28px 24px', display: 'flex', gap: 12, borderTop: '1px solid #E2E8F8', flexWrap: 'wrap' }}>
            <button
              className="btn btn-outline btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              onClick={() => onOpenInvoice(order)}
            >
              <Eye size={14} /> View Invoice
            </button>
            <button
              className="btn btn-ghost btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              onClick={() => onBuyAgain(order)}
            >
              <ShoppingBag size={14} /> Buy Again
            </button>
            {['pending', 'confirmed'].includes(order.status) && (
              <button
                className="btn btn-ghost btn-sm"
                style={{ color: '#DC2626', display: 'flex', alignItems: 'center', gap: 6 }}
                onClick={() => onCancel(order.id)}
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  const [filter, setFilter] = useState<'all' | 'active' | 'delivered' | 'cancelled'>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Order | null>(null);

  const { orders, cancelOrder } = useOrderStore();
  const { addItem, openCart } = useCartStore();
  const { addNotification } = useUIStore();
  const navigate = useNavigate();

  const filteredOrders = orders.filter((o) => {
    if (filter === 'active') return ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery'].includes(o.status);
    if (filter === 'delivered') return o.status === 'delivered';
    if (filter === 'cancelled') return ['cancelled', 'returned', 'refunded'].includes(o.status);
    return true;
  });

  const handleCancelOrder = (orderId: string) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      cancelOrder(orderId, 'Cancelled at customer request');
      addNotification('info', 'Your order has been cancelled.');
    }
  };

  const handleBuyAgain = (order: Order) => {
    order.items.forEach((item) => {
      addItem(item.product, item.size, item.color, item.quantity);
    });
    openCart();
    addNotification('success', 'Order items re-added to your cart! 🛍️');
  };

  return (
    <div style={{ background: '#F8FAFF', minHeight: '100vh', paddingBottom: 64 }}>
      {/* Page Header */}
      <div style={{ background: 'linear-gradient(135deg, #1565C0, #0D47A1)', color: 'white', padding: '36px 0 28px' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontFamily: 'Outfit', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.75rem' }}>
                <Package size={28} /> My Orders
              </h1>
              <p style={{ opacity: 0.8, fontSize: '0.875rem', marginTop: 4 }}>
                Track live shipments, download invoices, and view order receipts
              </p>
            </div>
            <Link to="/products" className="btn btn-secondary btn-sm">
              Explore More Gear
            </Link>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 32 }}>
        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          {[
            { value: 'all', label: 'All Orders' },
            { value: 'active', label: 'Active Shipments' },
            { value: 'delivered', label: 'Delivered' },
            { value: 'cancelled', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.value}
              className={`tag ${filter === tab.value ? 'active' : ''}`}
              onClick={() => setFilter(tab.value as any)}
              style={{ fontWeight: 700 }}
            >
              {tab.label}
              <span style={{ marginLeft: 6, opacity: 0.7, fontSize: '0.75rem' }}>
                ({tab.value === 'all' ? orders.length : orders.filter((o) => {
                  if (tab.value === 'active') return ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery'].includes(o.status);
                  if (tab.value === 'delivered') return o.status === 'delivered';
                  return ['cancelled', 'returned', 'refunded'].includes(o.status);
                }).length})
              </span>
            </button>
          ))}
        </div>

        {filteredOrders.length === 0 ? (
          <div className="empty-state" style={{ background: 'white', borderRadius: 24, padding: 56, border: '1px solid #E2E8F8' }}>
            <Package size={60} color="#94A3B8" style={{ marginBottom: 16 }} />
            <div className="empty-state-title" style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.4rem' }}>
              No Orders Found in this Category
            </div>
            <p style={{ marginBottom: 24, color: '#64748B', maxWidth: 400 }}>
              Gear up with Sportika premium athletic wear to unleash your potential!
            </p>
            <Link to="/products" className="btn btn-primary btn-lg">Browse Products</Link>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onOpenInvoice={(o) => setSelectedInvoice(o)}
              onCancel={handleCancelOrder}
              onBuyAgain={handleBuyAgain}
            />
          ))
        )}
      </div>

      {/* ─── MODAL: INVOICE ─── */}
      {selectedInvoice && (
        <div className="modal-overlay" onClick={() => setSelectedInvoice(null)}>
          <div className="modal-card" style={{ maxWidth: 680 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.25rem' }}>
                  Tax Invoice #{selectedInvoice.orderNumber}
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                  Placed on {new Date(selectedInvoice.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-outline btn-sm" onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Printer size={14} /> Print / Save
                </button>
                <button onClick={() => setSelectedInvoice(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="modal-body">
              {/* Addresses */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, paddingBottom: 20, borderBottom: '1px solid #E2E8F8', marginBottom: 20 }}>
                <div>
                  <div style={{ fontFamily: 'Outfit', fontWeight: 900, color: '#1565C0', fontSize: '1.1rem' }}>SPORTIKA GLOBAL</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: 1.6, marginTop: 4 }}>
                    Plot 42, Sportika Logistics Park<br />
                    Pune, Maharashtra 411001, India<br />
                    GSTIN: 27ABCDE1234F1Z5<br />
                    support@sportika.in
                  </div>
                </div>
                <div>
                  <div style={{ fontFamily: 'Outfit', fontWeight: 700, color: '#0F172A', fontSize: '0.9rem' }}>Delivery To:</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: 1.6, marginTop: 4 }}>
                    <strong style={{ color: '#0F172A' }}>{selectedInvoice.address.name}</strong><br />
                    {selectedInvoice.address.line1}{selectedInvoice.address.line2 ? `, ${selectedInvoice.address.line2}` : ''}<br />
                    {selectedInvoice.address.city}, {selectedInvoice.address.state} — {selectedInvoice.address.pincode}<br />
                    Phone: {selectedInvoice.address.phone}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <table className="data-table" style={{ marginBottom: 20 }}>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Size & Color</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.items.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{item.name}</td>
                      <td>{item.size} / {item.color}</td>
                      <td>{item.quantity}</td>
                      <td>₹{item.price.toLocaleString('en-IN')}</td>
                      <td style={{ fontWeight: 700 }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Summary */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ width: 260, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: '#64748B' }}>Subtotal:</span>
                    <span>₹{selectedInvoice.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: '#64748B' }}>Shipping:</span>
                    <span>{selectedInvoice.shipping === 0 ? 'FREE' : `₹${selectedInvoice.shipping}`}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: '#64748B' }}>GST (5%):</span>
                    <span>₹{selectedInvoice.tax.toLocaleString('en-IN')}</span>
                  </div>
                  {selectedInvoice.discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#16A34A' }}>
                      <span>Coupon Discount:</span>
                      <span>-₹{selectedInvoice.discount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Outfit', fontWeight: 900, fontSize: '1.2rem', color: '#1565C0', borderTop: '1.5px solid #E2E8F8', paddingTop: 8, marginTop: 4 }}>
                    <span>Amount Paid:</span>
                    <span>₹{selectedInvoice.total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                Payment Method: <strong style={{ textTransform: 'uppercase' }}>{selectedInvoice.payment.method}</strong>
              </span>
              <button className="btn btn-primary btn-sm" onClick={() => setSelectedInvoice(null)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
