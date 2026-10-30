import React, { useState } from 'react';
import { User, MapPin, Lock, Bell, ChevronRight, Edit3, Plus, Trash2, Check, X, ShieldCheck } from 'lucide-react';
import { useAuthStore, useUIStore } from '../store';
import type { Address } from '../types';

type Tab = 'profile' | 'addresses' | 'password' | 'notifications';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const { user, updateUser, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useAuthStore();
  const { addNotification } = useUIStore();

  // Personal Info Form
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  // Password Form
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });

  // Address Modal State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addrForm, setAddrForm] = useState<Omit<Address, 'id'>>({
    name: user?.name || '',
    phone: user?.phone || '',
    line1: '',
    line2: '',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411001',
    country: 'India',
    isDefault: false,
    type: 'home',
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ name: form.name, phone: form.phone });
    addNotification('success', 'Profile updated successfully!');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirm) {
      addNotification('error', 'New passwords do not match!');
      return;
    }
    if (passwords.newPass.length < 6) {
      addNotification('error', 'Password must be at least 6 characters!');
      return;
    }
    addNotification('success', 'Password updated successfully!');
    setPasswords({ current: '', newPass: '', confirm: '' });
  };

  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setAddrForm({
      name: user?.name || '',
      phone: user?.phone || '',
      line1: '',
      line2: '',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411001',
      country: 'India',
      isDefault: (user?.addresses?.length || 0) === 0,
      type: 'home',
    });
    setIsAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr: Address) => {
    setEditingAddressId(addr.id);
    setAddrForm({
      name: addr.name,
      phone: addr.phone,
      line1: addr.line1,
      line2: addr.line2 || '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      country: addr.country,
      isDefault: addr.isDefault,
      type: addr.type,
    });
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrForm.line1.trim() || !addrForm.city.trim() || !addrForm.pincode.trim()) {
      addNotification('error', 'Please fill in address line, city, and pincode.');
      return;
    }

    if (editingAddressId) {
      updateAddress(editingAddressId, addrForm);
      addNotification('success', 'Address updated successfully!');
    } else {
      addAddress(addrForm);
      addNotification('success', 'New address added to your address book!');
    }
    setIsAddressModalOpen(false);
  };

  const handleDeleteAddress = (id: string) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      deleteAddress(id);
      addNotification('info', 'Address removed.');
    }
  };

  const tabs = [
    { key: 'profile', label: 'Personal Info', icon: <User size={16} /> },
    { key: 'addresses', label: 'Saved Addresses', icon: <MapPin size={16} /> },
    { key: 'password', label: 'Security & Password', icon: <Lock size={16} /> },
    { key: 'notifications', label: 'Preferences', icon: <Bell size={16} /> },
  ];

  const addresses = user?.addresses || [];

  return (
    <div style={{ background: '#F8FAFF', minHeight: '100vh', paddingBottom: 64 }}>
      {/* Banner */}
      <div style={{ background: 'linear-gradient(135deg, #1565C0, #0D47A1)', color: 'white', padding: '36px 0 28px' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{
              width: 68, height: 68, borderRadius: '50%',
              background: 'linear-gradient(135deg, #FF6F00, #FFD700)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.75rem', fontWeight: 900, fontFamily: 'Outfit', color: 'white',
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
            }}>
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h1 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '1.75rem', marginBottom: 2 }}>{user?.name || 'Customer'}</h1>
                <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 50, fontSize: '0.75rem', fontWeight: 700 }}>
                  {user?.role === 'admin' ? '🛡️ Admin' : '⭐ Member'}
                </span>
              </div>
              <p style={{ opacity: 0.8, fontSize: '0.875rem' }}>{user?.email} · {user?.phone || 'No phone added'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 32 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 32 }}>
          {/* Sidebar */}
          <div style={{ background: 'white', borderRadius: 20, border: '1px solid #E2E8F8', overflow: 'hidden', height: 'fit-content', position: 'sticky', top: 88, boxShadow: '0 2px 12px rgba(27,31,59,0.03)' }}>
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as Tab)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  padding: '16px 20px', border: 'none', background: activeTab === tab.key ? '#EEF2FF' : 'transparent',
                  color: activeTab === tab.key ? '#1565C0' : '#3D4A6B',
                  fontFamily: 'Outfit', fontWeight: 700, fontSize: '0.9rem',
                  cursor: 'pointer', textAlign: 'left',
                  borderLeft: activeTab === tab.key ? '3.5px solid #1565C0' : '3.5px solid transparent',
                  transition: 'all 0.15s'
                }}
              >
                {tab.icon} {tab.label}
                <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: activeTab === tab.key ? 1 : 0.4 }} />
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ background: 'white', borderRadius: 24, padding: 36, border: '1px solid #E2E8F8', boxShadow: '0 2px 14px rgba(27,31,59,0.03)' }}>
            {/* 1. PERSONAL INFO */}
            {activeTab === 'profile' && (
              <form onSubmit={handleSaveProfile}>
                <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.4rem' }}>
                  <User size={22} color="#1565C0" /> Personal Profile
                </h2>
                <p style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: 28 }}>
                  Manage your personal details for seamless checkout and invoices.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      id="profile-name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="form-input"
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      id="profile-phone"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 28 }}>
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    value={form.email}
                    disabled
                    style={{ opacity: 0.65, cursor: 'not-allowed', background: '#F8FAFC' }}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#8896B3', marginTop: 6, display: 'block' }}>
                    🔒 Email is linked to your Sportika authentication and order history.
                  </span>
                </div>

                <button type="submit" className="btn btn-primary" id="save-profile" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Check size={16} /> Save Changes
                </button>
              </form>
            )}

            {/* 2. SAVED ADDRESSES */}
            {activeTab === 'addresses' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.4rem' }}>
                      <MapPin size={22} color="#1565C0" /> Saved Delivery Addresses
                    </h2>
                    <p style={{ color: '#64748B', fontSize: '0.85rem' }}>Select which address to use as your default delivery location.</p>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={handleOpenAddAddress} id="add-new-address-btn">
                    <Plus size={15} /> Add New Address
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '48px 20px', background: '#F8FAFC', borderRadius: 16, border: '1.5px dashed #CBD5E1' }}>
                    <MapPin size={40} color="#94A3B8" style={{ marginBottom: 12 }} />
                    <h4 style={{ fontFamily: 'Outfit', fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>No Addresses Saved Yet</h4>
                    <p style={{ color: '#64748B', fontSize: '0.875rem', marginBottom: 16 }}>Add your delivery address for instant 1-click checkout.</p>
                    <button className="btn btn-primary btn-sm" onClick={handleOpenAddAddress}>+ Add Address Now</button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        style={{
                          border: `1.5px solid ${addr.isDefault ? '#1565C0' : '#E2E8F8'}`,
                          borderRadius: 18, padding: 22, position: 'relative',
                          background: addr.isDefault ? '#F8FAFF' : 'white',
                          boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                          <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}>
                            {addr.name}
                          </span>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <span style={{ textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: '#E2E8F0', color: '#475569' }}>
                              {addr.type}
                            </span>
                            {addr.isDefault && (
                              <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: '#DCFCE7', color: '#16A34A' }}>
                                Default
                              </span>
                            )}
                          </div>
                        </div>

                        <div style={{ color: '#475569', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: 16 }}>
                          {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}<br />
                          {addr.city}, {addr.state} — <strong>{addr.pincode}</strong><br />
                          📞 {addr.phone}
                        </div>

                        <div style={{ display: 'flex', gap: 10, alignItems: 'center', borderTop: '1px solid #E2E8F8', paddingTop: 14 }}>
                          {!addr.isDefault && (
                            <button
                              className="btn btn-ghost btn-sm"
                              style={{ color: '#1565C0', fontWeight: 700, padding: '4px 8px' }}
                              onClick={() => {
                                setDefaultAddress(addr.id);
                                addNotification('success', 'Default address updated!');
                              }}
                            >
                              Set as Default
                            </button>
                          )}
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ padding: '4px 8px' }}
                            onClick={() => handleOpenEditAddress(addr)}
                          >
                            <Edit3 size={13} /> Edit
                          </button>
                          {addresses.length > 1 && (
                            <button
                              className="btn btn-ghost btn-sm"
                              style={{ color: '#DC2626', padding: '4px 8px' }}
                              onClick={() => handleDeleteAddress(addr.id)}
                            >
                              <Trash2 size={13} /> Delete
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. PASSWORD & SECURITY */}
            {activeTab === 'password' && (
              <form onSubmit={handleChangePassword}>
                <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.4rem' }}>
                  <Lock size={22} color="#1565C0" /> Password & Security
                </h2>
                <p style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: 28 }}>
                  Update your password to keep your Sportika member account secure.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 420 }}>
                  <div className="form-group">
                    <label className="form-label">Current Password</label>
                    <input
                      type="password"
                      className="form-input"
                      value={passwords.current}
                      onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
                      id="current-pass"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">New Password (min. 6 characters)</label>
                    <input
                      type="password"
                      className="form-input"
                      value={passwords.newPass}
                      onChange={(e) => setPasswords((p) => ({ ...p, newPass: e.target.value }))}
                      id="new-pass"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      className="form-input"
                      value={passwords.confirm}
                      onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
                      id="confirm-pass"
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" id="change-password-btn">
                    Update Password
                  </button>
                </div>
              </form>
            )}

            {/* 4. NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <div>
                <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.4rem' }}>
                  <Bell size={22} color="#1565C0" /> Notifications & Communications
                </h2>
                <p style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: 28 }}>
                  Choose which alerts and order updates you receive via Email & SMS.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[
                    { label: 'Order Dispatch & Tracking SMS', desc: 'Real-time BlueDart/Delhivery delivery updates on your mobile number', default: true },
                    { label: 'Exclusive Sportika Club Offers', desc: 'Get early access to flash sales and seasonal gear discounts', default: true },
                    { label: 'Wishlist Stock & Price Drops', desc: 'Instant alert when wishlisted sportswear items are discounted', default: true },
                    { label: 'Athletic Training & Performance Blog', desc: 'Weekly tips from champion coaches on training gear and nutrition', default: false },
                  ].map((pref) => (
                    <div key={pref.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', background: '#F8FAFC', borderRadius: 16, border: '1px solid #E2E8F8' }}>
                      <div>
                        <div style={{ fontFamily: 'Outfit', fontWeight: 700, color: '#0F172A', fontSize: '0.95rem' }}>{pref.label}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: 2 }}>{pref.desc}</div>
                      </div>
                      <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24, cursor: 'pointer' }}>
                        <input type="checkbox" defaultChecked={pref.default} style={{ opacity: 0, width: 0, height: 0 }} />
                        <span style={{
                          position: 'absolute', inset: 0, borderRadius: 24,
                          background: pref.default ? '#1565C0' : '#CBD5E1',
                          transition: '0.2s'
                        }}>
                          <span style={{
                            position: 'absolute', top: 2, left: pref.default ? 22 : 2,
                            width: 20, height: 20, borderRadius: '50%',
                            background: 'white', transition: '0.2s',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                          }} />
                        </span>
                      </label>
                    </div>
                  ))}
                </div>

                <button
                  className="btn btn-primary"
                  style={{ marginTop: 28 }}
                  onClick={() => addNotification('success', 'Preferences saved successfully!')}
                  id="save-notifications"
                >
                  Save Preferences
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── MODAL: ADD / EDIT ADDRESS ─── */}
      {isAddressModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddressModalOpen(false)}>
          <div className="modal-card" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.25rem' }}>
                {editingAddressId ? 'Edit Delivery Address' : 'Add New Delivery Address'}
              </h3>
              <button onClick={() => setIsAddressModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveAddress}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={addrForm.name}
                      onChange={(e) => setAddrForm((f) => ({ ...f, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <input
                      type="tel"
                      className="form-input"
                      value={addrForm.phone}
                      onChange={(e) => setAddrForm((f) => ({ ...f, phone: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Street Address / Flat / Floor *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={addrForm.line1}
                    onChange={(e) => setAddrForm((f) => ({ ...f, line1: e.target.value }))}
                    placeholder="e.g. 102, Gold Crest Heights"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Landmark / Area (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={addrForm.line2}
                    onChange={(e) => setAddrForm((f) => ({ ...f, line2: e.target.value }))}
                    placeholder="e.g. Near Stadium Road"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">City *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={addrForm.city}
                      onChange={(e) => setAddrForm((f) => ({ ...f, city: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={addrForm.state}
                      onChange={(e) => setAddrForm((f) => ({ ...f, state: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">PIN Code *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={addrForm.pincode}
                      onChange={(e) => setAddrForm((f) => ({ ...f, pincode: e.target.value }))}
                      maxLength={6}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.85rem' }}>
                      <input
                        type="radio"
                        name="addrType"
                        checked={addrForm.type === 'home'}
                        onChange={() => setAddrForm((f) => ({ ...f, type: 'home' }))}
                      /> Home
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.85rem' }}>
                      <input
                        type="radio"
                        name="addrType"
                        checked={addrForm.type === 'work'}
                        onChange={() => setAddrForm((f) => ({ ...f, type: 'work' }))}
                      /> Work / Office
                    </label>
                  </div>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.85rem' }}>
                    <input
                      type="checkbox"
                      checked={addrForm.isDefault}
                      onChange={(e) => setAddrForm((f) => ({ ...f, isDefault: e.target.checked }))}
                    /> Set as default address
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setIsAddressModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" id="save-address-btn">
                  {editingAddressId ? 'Save Address' : 'Add Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
