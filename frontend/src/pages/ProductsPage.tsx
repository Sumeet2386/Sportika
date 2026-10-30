import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search, SlidersHorizontal, ChevronRight, X, LayoutGrid, Grid3X3,
  Check, ArrowUpDown, Filter, Sparkles
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { SIZES, SUBCATEGORIES } from '../data/mockData';
import { useProductStore } from '../store';
import type { SortOption } from '../types';

const COLORS = [
  { name: 'Blue', hex: '#1565C0' },
  { name: 'Orange', hex: '#FF6B35' },
  { name: 'Black', hex: '#212121' },
  { name: 'White', hex: '#F5F5F5' },
  { name: 'Green', hex: '#2E7D32' },
  { name: 'Red', hex: '#C62828' },
  { name: 'Purple', hex: '#6A1B9A' },
  { name: 'Grey', hex: '#607D8B' },
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [gridCols, setGridCols] = useState<'3' | '4'>('3');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [sort, setSort] = useState<SortOption>((searchParams.get('sort') as SortOption) || 'featured');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [onlySale, setOnlySale] = useState(searchParams.get('filter') === 'sale');

  const category = searchParams.get('category') || '';
  const sub = searchParams.get('sub') || '';
  const filter = searchParams.get('filter') || '';

  const allProducts = useProductStore((state) => state.products);

  // Filter + Sort products
  const products = useMemo(() => {
    let result = [...allProducts];

    // Category filter
    if (category) result = result.filter((p) => p.category === category);
    if (sub) result = result.filter((p) => p.subcategory === sub);
    if (filter === 'new') result = result.filter((p) => p.newArrival);
    if (filter === 'sale' || onlySale) result = result.filter((p) => p.discount > 0);
    if (filter === 'bestselling') result = result.filter((p) => p.bestseller);

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.includes(q))
      );
    }

    // Sizes
    if (selectedSizes.length) {
      result = result.filter((p) =>
        selectedSizes.some((s) => p.sizes.find((ps) => ps.size === s && ps.stock > 0))
      );
    }

    // Colors
    if (selectedColors.length) {
      result = result.filter((p) =>
        selectedColors.some((c) => p.colors.some((pc) => pc.name.toLowerCase().includes(c.toLowerCase())))
      );
    }

    // Price
    result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // In Stock
    if (onlyInStock) result = result.filter((p) => p.stock > 0);

    // Sort
    switch (sort) {
      case 'newest': result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
      case 'price-asc': result.sort((a, b) => a.price - b.price); break;
      case 'price-desc': result.sort((a, b) => b.price - a.price); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      case 'bestselling': result.sort((a, b) => b.sold - a.sold); break;
      default: result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return result;
  }, [category, sub, filter, search, selectedSizes, selectedColors, priceRange, onlyInStock, onlySale, sort]);

  const toggleSize = (size: string) =>
    setSelectedSizes((prev) => prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]);

  const toggleColor = (color: string) =>
    setSelectedColors((prev) => prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]);

  const clearFilters = () => {
    setSearch('');
    setSelectedSizes([]);
    setSelectedColors([]);
    setPriceRange([0, 5000]);
    setOnlyInStock(false);
    setOnlySale(false);
    setSort('featured');
    setSearchParams({});
  };

  const hasFilters = Boolean(search || selectedSizes.length || selectedColors.length || onlyInStock || onlySale || sub || priceRange[1] < 5000);

  const pageTitle = category === 'men'
    ? "Men's Performance Wear"
    : category === 'women'
    ? "Women's Activewear"
    : filter === 'sale'
    ? 'Special Offers & Clearance'
    : filter === 'new'
    ? 'Fresh New Drops'
    : 'All Sportswear & Gear';

  const categoryLabel = category === 'men' ? 'Men' : category === 'women' ? 'Women' : 'Catalog';

  return (
    <div style={{ background: '#F8F9FD', minHeight: '100vh' }}>
      {/* ─── Hero / Page Header ─── */}
      <section className="products-page-header">
        <div className="container">
          {/* Breadcrumbs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: 'rgba(255,255,255,0.65)', marginBottom: 12 }}>
            <Link to="/" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Home</Link>
            <ChevronRight size={13} style={{ opacity: 0.5 }} />
            <Link to="/products" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Products</Link>
            {category && (
              <>
                <ChevronRight size={13} style={{ opacity: 0.5 }} />
                <span style={{ color: '#FF6B35', fontWeight: 600 }}>{categoryLabel}</span>
              </>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(255,107,53,0.2)', border: '1px solid rgba(255,107,53,0.35)',
                color: '#FF6B35', padding: '4px 10px', borderRadius: 20,
                fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8
              }}>
                <Sparkles size={11} /> High Performance Athleisure
              </div>
              <h1 style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 900, fontSize: 'clamp(2rem, 4vw, 3rem)',
                color: 'white', textTransform: 'uppercase', letterSpacing: '-0.01em', margin: 0
              }}>
                {pageTitle}
              </h1>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12,
              padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8
            }}>
              <span style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.25rem', color: 'white' }}>
                {products.length}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Products Available
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Main Content Area ─── */}
      <div className="container" style={{ paddingTop: 32, paddingBottom: 72 }}>

        {/* ─── Top Control Toolbar ─── */}
        <div style={{
          background: 'white', borderRadius: 14, border: '1px solid #E8ECF4',
          padding: '12px 18px', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 20,
          boxShadow: '0 2px 10px rgba(27,31,59,0.02)'
        }}>
          {/* Search bar inside page */}
          <div style={{ position: 'relative', width: 320, maxWidth: '100%' }}>
            <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#8B93B8' }} />
            <input
              type="text"
              placeholder="Search in this collection..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%', height: 38, padding: '0 32px 0 38px',
                borderRadius: 50, border: '1.5px solid #E2E8F4',
                fontSize: '0.84rem', fontFamily: 'Outfit', outline: 'none',
                background: '#F8FAFD', color: '#1B1F3B'
              }}
              onFocus={e => { e.currentTarget.style.borderColor = '#1B1F3B'; e.currentTarget.style.background = 'white'; }}
              onBlur={e => { e.currentTarget.style.borderColor = '#E2E8F4'; e.currentTarget.style.background = '#F8FAFD'; }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#8B93B8', display: 'flex' }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Right controls: filter toggle, grid toggle, sort dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(v => !v)}
              className="btn btn-ghost btn-sm visible-mobile"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <SlidersHorizontal size={15} /> Filters
            </button>

            {/* Desktop Grid Switcher (3 vs 4) */}
            <div className="hidden-mobile" style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#F1F4FA', padding: 3, borderRadius: 8 }}>
              <button
                onClick={() => setGridCols('3')}
                title="3 Columns"
                style={{
                  background: gridCols === '3' ? 'white' : 'transparent',
                  border: 'none', borderRadius: 6, padding: '5px 8px', cursor: 'pointer',
                  color: gridCols === '3' ? '#1B1F3B' : '#8B93B8',
                  boxShadow: gridCols === '3' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  display: 'flex', alignItems: 'center'
                }}
              >
                <Grid3X3 size={16} />
              </button>
              <button
                onClick={() => setGridCols('4')}
                title="4 Columns"
                style={{
                  background: gridCols === '4' ? 'white' : 'transparent',
                  border: 'none', borderRadius: 6, padding: '5px 8px', cursor: 'pointer',
                  color: gridCols === '4' ? '#1B1F3B' : '#8B93B8',
                  boxShadow: gridCols === '4' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  display: 'flex', alignItems: 'center'
                }}
              >
                <LayoutGrid size={16} />
              </button>
            </div>

            {/* Sort Select */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="hidden-mobile" style={{ fontSize: '0.8rem', color: '#8B93B8', fontWeight: 600 }}>Sort by:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                style={{
                  height: 38, padding: '0 32px 0 12px', borderRadius: 8,
                  border: '1.5px solid #E2E8F4', background: 'white',
                  fontFamily: 'Outfit', fontWeight: 600, fontSize: '0.84rem',
                  color: '#1B1F3B', cursor: 'pointer', outline: 'none'
                }}
              >
                <option value="featured">Featured / Best Match</option>
                <option value="newest">Newest Arrivals</option>
                <option value="bestselling">Most Popular</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Customer Rating</option>
              </select>
            </div>
          </div>
        </div>

        {/* ─── Active Filter Chips ─── */}
        {hasFilters && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#8B93B8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Active Filters:
            </span>
            {search && (
              <span className="tag active" onClick={() => setSearch('')}>
                Search: "{search}" <X size={12} style={{ marginLeft: 4 }} />
              </span>
            )}
            {sub && (
              <span className="tag active" onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.delete('sub');
                setSearchParams(params);
              }}>
                Type: {sub} <X size={12} style={{ marginLeft: 4 }} />
              </span>
            )}
            {selectedSizes.map((s) => (
              <span key={s} className="tag active" onClick={() => toggleSize(s)}>
                Size: {s} <X size={12} style={{ marginLeft: 4 }} />
              </span>
            ))}
            {selectedColors.map((c) => (
              <span key={c} className="tag active" onClick={() => toggleColor(c)}>
                Color: {c} <X size={12} style={{ marginLeft: 4 }} />
              </span>
            ))}
            {onlyInStock && (
              <span className="tag active" onClick={() => setOnlyInStock(false)}>
                In Stock <X size={12} style={{ marginLeft: 4 }} />
              </span>
            )}
            {onlySale && (
              <span className="tag active" onClick={() => setOnlySale(false)}>
                On Sale <X size={12} style={{ marginLeft: 4 }} />
              </span>
            )}
            {priceRange[1] < 5000 && (
              <span className="tag active" onClick={() => setPriceRange([0, 5000])}>
                Max ₹{priceRange[1].toLocaleString()} <X size={12} style={{ marginLeft: 4 }} />
              </span>
            )}
            <button
              onClick={clearFilters}
              style={{
                background: 'none', border: 'none', color: '#EF4444',
                fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', padding: '4px 8px'
              }}
            >
              Reset All
            </button>
          </div>
        )}

        {/* ─── Two-Column Layout: Sidebar + Grid ─── */}
        <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>

          {/* ══════════════════════════════════════
              LEFT FILTERS SIDEBAR
          ══════════════════════════════════════ */}
          <aside className={`filters-sidebar ${showFilters ? 'visible-mobile' : 'hidden-mobile'}`}>
            <div className="filter-card">

              {/* Sidebar Header */}
              <div className="filter-header">
                <div className="filter-header-title">
                  <Filter size={16} color="#FF6B35" /> Filters
                </div>
                {hasFilters && (
                  <button onClick={clearFilters} className="filter-clear-btn">
                    Clear All
                  </button>
                )}
              </div>

              {/* Section 1: Category */}
              <div className="filter-section">
                <div className="filter-title">Gender & Target</div>
                <div className="filter-pill-list">
                  {[
                    { label: 'All Sportswear', value: '' },
                    { label: "Men's Collection", value: 'men' },
                    { label: "Women's Collection", value: 'women' },
                  ].map((opt) => (
                    <div
                      key={opt.value}
                      className={`filter-pill-item ${category === opt.value ? 'active' : ''}`}
                      onClick={() => {
                        const params = new URLSearchParams(searchParams);
                        if (opt.value) params.set('category', opt.value);
                        else params.delete('category');
                        setSearchParams(params);
                      }}
                    >
                      <span>{opt.label}</span>
                      {category === opt.value && <Check size={14} color="white" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 2: Apparel Type */}
              <div className="filter-section">
                <div className="filter-title">Apparel Type</div>
                <div className="filter-sub-grid">
                  {SUBCATEGORIES.map((sc) => {
                    const isActive = sub === sc.id;
                    return (
                      <div
                        key={sc.id}
                        className={`filter-sub-item ${isActive ? 'active' : ''}`}
                        onClick={() => {
                          const params = new URLSearchParams(searchParams);
                          if (isActive) params.delete('sub');
                          else params.set('sub', sc.id);
                          setSearchParams(params);
                        }}
                      >
                        <span style={{ fontSize: '0.9rem' }}>{sc.icon}</span>
                        <span>{sc.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 3: Sizes */}
              <div className="filter-section">
                <div className="filter-title">Size</div>
                <div className="size-grid">
                  {SIZES.map((s) => {
                    const isSelected = selectedSizes.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        className={`size-chip ${isSelected ? 'active' : ''}`}
                        onClick={() => toggleSize(s)}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 4: Colors */}
              <div className="filter-section">
                <div className="filter-title">Color Palette</div>
                <div className="color-swatch-grid">
                  {COLORS.map((c) => {
                    const isSelected = selectedColors.includes(c.name);
                    return (
                      <div
                        key={c.name}
                        className={`color-swatch ${isSelected ? 'active' : ''}`}
                        style={{ backgroundColor: c.hex }}
                        title={`${c.name}${isSelected ? ' (Selected)' : ''}`}
                        onClick={() => toggleColor(c.name)}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Section 5: Price Range */}
              <div className="filter-section">
                <div className="filter-title">
                  <span>Price Range</span>
                  <span style={{ fontSize: '0.75rem', color: '#FF6B35', fontWeight: 800 }}>
                    ₹{priceRange[1].toLocaleString()}
                  </span>
                </div>
                <div className="price-slider-wrap">
                  <input
                    type="range"
                    min={500}
                    max={5000}
                    step={100}
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                    className="price-slider"
                  />
                </div>
                <div className="price-slider-labels">
                  <span className="price-tag-pill">₹0</span>
                  <span className="price-tag-pill">Max ₹{priceRange[1].toLocaleString()}</span>
                </div>
              </div>

              {/* Section 6: In-Stock & Offers */}
              <div className="filter-section">
                <div className="filter-title">Availability & Offers</div>
                <div
                  className={`custom-check-item ${onlyInStock ? 'active' : ''}`}
                  onClick={() => setOnlyInStock(!onlyInStock)}
                >
                  <div className="custom-check-box">
                    {onlyInStock && <Check size={12} strokeWidth={3} />}
                  </div>
                  <span>In Stock Only</span>
                </div>
                <div
                  className={`custom-check-item ${onlySale ? 'active' : ''}`}
                  onClick={() => setOnlySale(!onlySale)}
                >
                  <div className="custom-check-box">
                    {onlySale && <Check size={12} strokeWidth={3} />}
                  </div>
                  <span>On Sale / Special Discount</span>
                </div>
              </div>

            </div>
          </aside>

          {/* ══════════════════════════════════════
              RIGHT PRODUCTS GRID
          ══════════════════════════════════════ */}
          <main style={{ flex: 1, minWidth: 0 }}>
            {products.length === 0 ? (
              <div style={{
                background: 'white', borderRadius: 16, padding: '64px 24px',
                textAlign: 'center', border: '1px solid #E8ECF4',
                boxShadow: '0 4px 20px rgba(27,31,59,0.03)'
              }}>
                <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>🏃💨</div>
                <h3 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.25rem', color: '#1B1F3B', marginBottom: 8 }}>
                  No Products Match Your Filter
                </h3>
                <p style={{ color: '#8B93B8', fontSize: '0.9rem', maxWidth: 400, margin: '0 auto 24px' }}>
                  We couldn't find any athletic gear matching your current selection. Try resetting filters to explore all items.
                </p>
                <button
                  className="btn btn-primary"
                  onClick={clearFilters}
                  style={{ borderRadius: 50, padding: '12px 28px' }}
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className={`products-grid ${gridCols === '4' ? 'grid-4' : 'grid-3'}`}>
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>

        </div>
      </div>
    </div>
  );
}
