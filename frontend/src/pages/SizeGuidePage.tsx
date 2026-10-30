import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Ruler, HelpCircle, CheckCircle, ArrowRight, Sparkles, User, ShoppingBag } from 'lucide-react';

type Unit = 'in' | 'cm';

interface SizeRow {
  size: string;
  [key: string]: string | number;
}

interface CategoryGuide {
  id: string;
  name: string;
  targetGender: string;
  columns: { key: string; label: string }[];
  data: {
    in: SizeRow[];
    cm: SizeRow[];
  };
  tips: string[];
}

export default function SizeGuidePage() {
  const [unit, setUnit] = useState<Unit>('in');
  const [activeCategory, setActiveCategory] = useState<string>('men-tops');

  const categories: CategoryGuide[] = [
    {
      id: 'men-tops',
      name: "Men's T-Shirts & Tops",
      targetGender: 'Men',
      columns: [
        { key: 'size', label: 'Size' },
        { key: 'chest', label: 'Chest' },
        { key: 'length', label: 'Body Length' },
        { key: 'shoulder', label: 'Shoulder' },
        { key: 'sleeve', label: 'Sleeve Length' },
      ],
      data: {
        in: [
          { size: 'S', chest: '36 - 38', length: '27.5', shoulder: '16.5', sleeve: '8.0' },
          { size: 'M', chest: '39 - 41', length: '28.5', shoulder: '17.5', sleeve: '8.5' },
          { size: 'L', chest: '42 - 44', length: '29.5', shoulder: '18.5', sleeve: '9.0' },
          { size: 'XL', chest: '45 - 47', length: '30.5', shoulder: '19.5', sleeve: '9.5' },
          { size: 'XXL', chest: '48 - 50', length: '31.5', shoulder: '20.5', sleeve: '10.0' },
        ],
        cm: [
          { size: 'S', chest: '91 - 96', length: '70', shoulder: '42', sleeve: '20' },
          { size: 'M', chest: '99 - 104', length: '72', shoulder: '44', sleeve: '22' },
          { size: 'L', chest: '107 - 112', length: '75', shoulder: '47', sleeve: '23' },
          { size: 'XL', chest: '114 - 119', length: '77', shoulder: '50', sleeve: '24' },
          { size: 'XXL', chest: '122 - 127', length: '80', shoulder: '52', sleeve: '25' },
        ],
      },
      tips: [
        'Chest: Measure around the fullest part of your chest, keeping tape horizontal under arms.',
        'Length: Measured from high shoulder point down to the bottom hem.',
        'Choose 1 size larger if you prefer an oversized boxy aesthetic.',
      ],
    },
    {
      id: 'men-bottoms',
      name: "Men's Shorts & Track Pants",
      targetGender: 'Men',
      columns: [
        { key: 'size', label: 'Size' },
        { key: 'waist', label: 'Waist' },
        { key: 'hip', label: 'Seat / Hip' },
        { key: 'inseamShorts', label: 'Shorts Inseam' },
        { key: 'inseamPants', label: 'Pants Inseam' },
      ],
      data: {
        in: [
          { size: 'S', waist: '28 - 30', hip: '36 - 38', inseamShorts: '7.0', inseamPants: '29.5' },
          { size: 'M', waist: '31 - 33', hip: '39 - 41', inseamShorts: '7.5', inseamPants: '30.0' },
          { size: 'L', waist: '34 - 36', hip: '42 - 44', inseamShorts: '7.5', inseamPants: '30.5' },
          { size: 'XL', waist: '37 - 39', hip: '45 - 47', inseamShorts: '8.0', inseamPants: '31.0' },
          { size: 'XXL', waist: '40 - 42', hip: '48 - 50', inseamShorts: '8.0', inseamPants: '31.5' },
        ],
        cm: [
          { size: 'S', waist: '71 - 76', hip: '91 - 96', inseamShorts: '18', inseamPants: '75' },
          { size: 'M', waist: '79 - 84', hip: '99 - 104', inseamShorts: '19', inseamPants: '76' },
          { size: 'L', waist: '86 - 91', hip: '107 - 112', inseamShorts: '19', inseamPants: '77' },
          { size: 'XL', waist: '94 - 99', hip: '114 - 119', inseamShorts: '20', inseamPants: '79' },
          { size: 'XXL', waist: '102 - 107', hip: '122 - 127', inseamShorts: '20', inseamPants: '80' },
        ],
      },
      tips: [
        'Waist: Measure around your natural waistline where your athletic waistband rests.',
        'Inseam: Measure from top of inner thigh down along the inside seam of leg.',
        'All Sportika shorts and track pants include an internal braided drawstring for a customized lock-in fit.',
      ],
    },
    {
      id: 'women-tops',
      name: "Women's Tops & Sports Bras",
      targetGender: 'Women',
      columns: [
        { key: 'size', label: 'Size' },
        { key: 'bust', label: 'Bust' },
        { key: 'underbust', label: 'Underbust (Bra Band)' },
        { key: 'cupEquivalent', label: 'Cup Size' },
        { key: 'length', label: 'Top Length' },
      ],
      data: {
        in: [
          { size: 'XS', bust: '30 - 32', underbust: '26 - 28', cupEquivalent: '30A - 32A', length: '23.0' },
          { size: 'S', bust: '33 - 35', underbust: '29 - 31', cupEquivalent: '32B - 34A', length: '24.0' },
          { size: 'M', bust: '36 - 38', underbust: '32 - 34', cupEquivalent: '34B - 36B', length: '25.0' },
          { size: 'L', bust: '39 - 41', underbust: '35 - 37', cupEquivalent: '36C - 38B', length: '26.0' },
          { size: 'XL', bust: '42 - 44', underbust: '38 - 40', cupEquivalent: '38C - 40C', length: '27.0' },
        ],
        cm: [
          { size: 'XS', bust: '76 - 81', underbust: '66 - 71', cupEquivalent: '70A - 70B', length: '58' },
          { size: 'S', bust: '84 - 89', underbust: '74 - 79', cupEquivalent: '75A - 75B', length: '61' },
          { size: 'M', bust: '91 - 96', underbust: '81 - 86', cupEquivalent: '80B - 80C', length: '63' },
          { size: 'L', bust: '99 - 104', underbust: '89 - 94', cupEquivalent: '85C - 85D', length: '66' },
          { size: 'XL', bust: '107 - 112', underbust: '96 - 102', cupEquivalent: '90C - 90D', length: '68' },
        ],
      },
      tips: [
        'Underbust: Measure directly under the breasts where the bra band sits firmly.',
        'Bust: Measure over the fullest portion of your bust with a relaxed tape.',
        'High impact activities like sprinting benefit from a compression fit.',
      ],
    },
    {
      id: 'women-leggings',
      name: "Women's Leggings & Tights",
      targetGender: 'Women',
      columns: [
        { key: 'size', label: 'Size' },
        { key: 'waist', label: 'Waist' },
        { key: 'hip', label: 'Hips' },
        { key: 'inseam78', label: '7/8 Inseam' },
        { key: 'inseamFull', label: 'Full Length Inseam' },
      ],
      data: {
        in: [
          { size: 'XS', waist: '24 - 26', hip: '33 - 35', inseam78: '24.0', inseamFull: '27.0' },
          { size: 'S', waist: '27 - 29', hip: '36 - 38', inseam78: '24.5', inseamFull: '27.5' },
          { size: 'M', waist: '30 - 32', hip: '39 - 41', inseam78: '25.0', inseamFull: '28.0' },
          { size: 'L', waist: '33 - 35', hip: '42 - 44', inseam78: '25.5', inseamFull: '28.5' },
          { size: 'XL', waist: '36 - 38', hip: '45 - 47', inseam78: '26.0', inseamFull: '29.0' },
        ],
        cm: [
          { size: 'XS', waist: '61 - 66', hip: '84 - 89', inseam78: '61', inseamFull: '68' },
          { size: 'S', waist: '68 - 74', hip: '91 - 96', inseam78: '62', inseamFull: '70' },
          { size: 'M', waist: '76 - 81', hip: '99 - 104', inseam78: '63', inseamFull: '71' },
          { size: 'L', waist: '84 - 89', hip: '107 - 112', inseam78: '65', inseamFull: '72' },
          { size: 'XL', waist: '91 - 96', hip: '114 - 119', inseam78: '66', inseamFull: '74' },
        ],
      },
      tips: [
        'Squat-Proof Guarantee: All Sportika tights use 280 GSM interlock knit preventing transparency.',
        'High waistband sits comfortably above the hip bones for seamless abdominal support.',
      ],
    },
    {
      id: 'footwear',
      name: 'Footwear & Athletic Socks',
      targetGender: 'Unisex',
      columns: [
        { key: 'size', label: 'UK / India Size' },
        { key: 'usSize', label: 'US Size' },
        { key: 'euSize', label: 'EU Size' },
        { key: 'footLength', label: 'Foot Length' },
      ],
      data: {
        in: [
          { size: 'UK 6', usSize: '7.0', euSize: '40', footLength: '9.6 - 9.8' },
          { size: 'UK 7', usSize: '8.0', euSize: '41', footLength: '10.0 - 10.2' },
          { size: 'UK 8', usSize: '9.0', euSize: '42', footLength: '10.4 - 10.6' },
          { size: 'UK 9', usSize: '10.0', euSize: '43', footLength: '10.8 - 11.0' },
          { size: 'UK 10', usSize: '11.0', euSize: '44', footLength: '11.2 - 11.4' },
          { size: 'UK 11', usSize: '12.0', euSize: '45', footLength: '11.6 - 11.8' },
        ],
        cm: [
          { size: 'UK 6', usSize: '7.0', euSize: '40', footLength: '24.5 - 25.0' },
          { size: 'UK 7', usSize: '8.0', euSize: '41', footLength: '25.5 - 26.0' },
          { size: 'UK 8', usSize: '9.0', euSize: '42', footLength: '26.5 - 27.0' },
          { size: 'UK 9', usSize: '10.0', euSize: '43', footLength: '27.5 - 28.0' },
          { size: 'UK 10', usSize: '11.0', euSize: '44', footLength: '28.5 - 29.0' },
          { size: 'UK 11', usSize: '12.0', euSize: '45', footLength: '29.5 - 30.0' },
        ],
      },
      tips: [
        'Stand on a blank sheet of paper and mark from the tip of your longest toe to your heel.',
        'Indian footwear sizing adheres identically to UK sizing conventions.',
      ],
    },
  ];

  const currentCategory = categories.find((c) => c.id === activeCategory) || categories[0];

  return (
    <div style={{ background: '#F8FAFF', minHeight: '90vh', paddingBottom: 80 }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0A0F1D 0%, #1565C0 100%)',
        color: 'white',
        padding: '60px 0 48px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div className="container" style={{ maxWidth: 1000, position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Ruler size={26} color="#60A5FA" />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#93C5FD' }}>
                Sportika Precision Fit
              </span>
              <h1 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 'clamp(2rem, 4vw, 2.8rem)', margin: 0 }}>
                Official Size & Fit Guide
              </h1>
            </div>
          </div>
          <p style={{ color: '#CBD5E1', fontSize: '1.05rem', maxWidth: 650, margin: '12px 0 0', lineHeight: 1.6 }}>
            Sportswear should fit like armor — precise, liberating, and supportive. Use our verified measurement tables to ensure your gear fits right the first time.
          </p>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 1000, marginTop: 32 }}>
        {/* Controls Bar: Category Selector & Unit Switcher */}
        <div style={{
          background: 'white', borderRadius: 20, padding: '16px 20px',
          border: '1px solid #E2E8F8', boxShadow: '0 2px 12px rgba(27,31,59,0.03)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 16, marginBottom: 28,
        }}>
          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                style={{
                  background: activeCategory === c.id ? '#1565C0' : '#F1F5F9',
                  color: activeCategory === c.id ? 'white' : '#475569',
                  border: 'none', borderRadius: 12,
                  padding: '10px 18px', fontSize: '0.875rem',
                  fontWeight: 700, fontFamily: 'Outfit',
                  cursor: 'pointer', transition: 'all 0.2s ease',
                }}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Unit Toggle Button */}
          <div style={{
            display: 'flex', alignItems: 'center',
            background: '#F1F5F9', borderRadius: 12, padding: 4,
            border: '1px solid #E2E8F0',
          }}>
            <button
              onClick={() => setUnit('in')}
              style={{
                background: unit === 'in' ? 'white' : 'transparent',
                color: unit === 'in' ? '#0F172A' : '#64748B',
                border: 'none', borderRadius: 8,
                padding: '6px 14px', fontSize: '0.8rem',
                fontWeight: 800, cursor: 'pointer',
                boxShadow: unit === 'in' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              Inches (in)
            </button>
            <button
              onClick={() => setUnit('cm')}
              style={{
                background: unit === 'cm' ? 'white' : 'transparent',
                color: unit === 'cm' ? '#0F172A' : '#64748B',
                border: 'none', borderRadius: 8,
                padding: '6px 14px', fontSize: '0.8rem',
                fontWeight: 800, cursor: 'pointer',
                boxShadow: unit === 'cm' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              Centimeters (cm)
            </button>
          </div>
        </div>

        {/* Size Table Card */}
        <div style={{
          background: 'white', borderRadius: 24, padding: '32px',
          border: '1px solid #E2E8F8', boxShadow: '0 4px 20px rgba(27,31,59,0.03)',
          marginBottom: 32, overflowX: 'auto',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '1.4rem', color: '#0F172A', margin: 0 }}>
                {currentCategory.name} Measurement Chart
              </h2>
              <span style={{ fontSize: '0.82rem', color: '#64748B' }}>
                All values displayed in <strong>{unit === 'in' ? 'Inches' : 'Centimeters'}</strong>
              </span>
            </div>
            <Link
              to={`/products?category=${currentCategory.targetGender.toLowerCase()}`}
              className="btn btn-sm btn-outline"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.8rem' }}
            >
              <ShoppingBag size={14} /> Shop {currentCategory.targetGender}
            </Link>
          </div>

          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 6px', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                {currentCategory.columns.map((col, idx) => (
                  <th
                    key={col.key}
                    style={{
                      padding: '14px 18px',
                      fontFamily: 'Outfit',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      color: '#475569',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      borderTopLeftRadius: idx === 0 ? 12 : 0,
                      borderBottomLeftRadius: idx === 0 ? 12 : 0,
                      borderTopRightRadius: idx === currentCategory.columns.length - 1 ? 12 : 0,
                      borderBottomRightRadius: idx === currentCategory.columns.length - 1 ? 12 : 0,
                    }}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentCategory.data[unit].map((row, i) => (
                <tr
                  key={i}
                  style={{
                    background: i % 2 === 0 ? '#FFFFFF' : '#FAFCFF',
                    borderBottom: '1px solid #EDF2F7',
                    transition: 'background 0.15s ease',
                  }}
                >
                  {currentCategory.columns.map((col, idx) => (
                    <td
                      key={col.key}
                      style={{
                        padding: '16px 18px',
                        fontSize: '0.92rem',
                        color: idx === 0 ? '#1565C0' : '#1E293B',
                        fontWeight: idx === 0 ? 900 : 500,
                        fontFamily: idx === 0 ? 'Outfit' : 'Inter',
                        borderTop: '1px solid #F1F5F9',
                        borderBottom: '1px solid #F1F5F9',
                        borderLeft: idx === 0 ? '1px solid #F1F5F9' : 'none',
                        borderRight: idx === currentCategory.columns.length - 1 ? '1px solid #F1F5F9' : 'none',
                        borderTopLeftRadius: idx === 0 ? 10 : 0,
                        borderBottomLeftRadius: idx === 0 ? 10 : 0,
                        borderTopRightRadius: idx === currentCategory.columns.length - 1 ? 10 : 0,
                        borderBottomRightRadius: idx === currentCategory.columns.length - 1 ? 10 : 0,
                      }}
                    >
                      {row[col.key] || '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Category-specific measuring notes */}
          <div style={{ marginTop: 24, padding: 18, background: '#F8FAFC', borderRadius: 14, border: '1px solid #E2E8F0' }}>
            <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '0.85rem', color: '#334155', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={15} color="#2563EB" /> SIZING TIPS FOR THIS CATEGORY
            </div>
            <ul style={{ margin: 0, paddingLeft: 20, color: '#64748B', fontSize: '0.875rem', lineHeight: 1.7 }}>
              {currentCategory.tips.map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Fit Silhouette Profiles */}
        <div style={{ marginBottom: 36 }}>
          <h2 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '1.6rem', color: '#0F172A', marginBottom: 18 }}>
            Understanding Sportika Fit Silhouettes
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
          }}>
            {[
              {
                title: 'Compression / Second-Skin',
                desc: 'Tightest fit that hugs the muscle fibers to optimize blood flow, reduce vibrations, and accelerate lactic acid clearance.',
                bestFor: 'High-intensity sprinting, heavy lifting, base-layer compression.',
                tag: 'Snug Fit',
                color: '#EF4444',
                bg: '#FEF2F2',
              },
              {
                title: 'Athletic / Tapered Fit',
                desc: 'Tailored closely through the shoulders and chest with a gentle taper at the waist. Zero unnecessary excess fabric flapping.',
                bestFor: 'Distance running, CrossFit, gym training, track.',
                tag: 'Standard Sportika',
                color: '#2563EB',
                bg: '#EFF6FF',
              },
              {
                title: 'Relaxed / Easy Fit',
                desc: 'Cut loose for maximal air circulation and relaxed drape over the torso. Provides total freedom of movement.',
                bestFor: 'Pre-game warmups, post-workout cooldowns, daily athleisure.',
                tag: 'Loose Fit',
                color: '#10B981',
                bg: '#ECFDF5',
              },
            ].map((profile, i) => (
              <div key={i} style={{
                background: 'white', borderRadius: 20, padding: 26,
                border: '1px solid #E2E8F8', boxShadow: '0 2px 10px rgba(27,31,59,0.02)',
              }}>
                <span style={{
                  background: profile.bg, color: profile.color,
                  padding: '4px 10px', borderRadius: 50,
                  fontSize: '0.75rem', fontWeight: 800, fontFamily: 'Outfit',
                }}>
                  {profile.tag}
                </span>
                <h3 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.15rem', color: '#0F172A', margin: '14px 0 8px' }}>
                  {profile.title}
                </h3>
                <p style={{ color: '#64748B', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: 14 }}>
                  {profile.desc}
                </p>
                <div style={{ fontSize: '0.8rem', color: '#334155', borderTop: '1px solid #F1F5F9', paddingTop: 12 }}>
                  <strong>Ideal for:</strong> {profile.bestFor}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How to Measure Step-by-Step */}
        <div style={{
          background: 'white', borderRadius: 24, padding: 36,
          border: '1px solid #E2E8F8', boxShadow: '0 2px 12px rgba(27,31,59,0.03)',
          marginBottom: 36,
        }}>
          <h2 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '1.5rem', color: '#0F172A', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <HelpCircle size={22} color="#1565C0" /> How to Measure Yourself Accurately
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            {[
              {
                step: '01',
                name: 'Chest / Bust',
                instr: 'Wrap the tape measure around the widest part of your chest or bust, keeping the measuring tape parallel to the floor under your armpits.',
              },
              {
                step: '02',
                name: 'Natural Waist',
                instr: 'Locate the narrowest indentation of your torso (typically 1-2 inches above the belly button) and wrap the tape gently without pulling tight.',
              },
              {
                step: '03',
                name: 'Hips & Seat',
                instr: 'Stand with both feet planted together. Wrap the measuring tape around the fullest curve of your hips and glutes.',
              },
              {
                step: '04',
                name: 'Inseam Length',
                instr: 'Take a pair of pants or shorts that fit you perfectly. Measure along the inside leg seam from the crotch point down to the bottom ankle hem.',
              },
            ].map((m, idx) => (
              <div key={idx} style={{ background: '#F8FAFC', borderRadius: 16, padding: 20, border: '1px solid #E2E8F0' }}>
                <div style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '1.4rem', color: '#2563EB', marginBottom: 6 }}>
                  {m.step}
                </div>
                <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1rem', color: '#0F172A', marginBottom: 6 }}>
                  {m.name}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.6 }}>
                  {m.instr}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Between Sizes Callout */}
        <div style={{
          background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
          borderRadius: 20, padding: 28, border: '1px solid #BFDBFE',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 20,
        }}>
          <div>
            <h3 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.25rem', color: '#1E40AF', marginBottom: 6 }}>
              Between Two Sizes?
            </h3>
            <p style={{ color: '#1E3A8A', fontSize: '0.92rem', margin: 0, maxWidth: 600, lineHeight: 1.6 }}>
              If your chest and waist point toward different sizes, we recommend ordering based on your <strong>chest measurement</strong> for tops and <strong>hip measurement</strong> for bottoms. Plus, remember our <strong>7-Day Free Size Exchange</strong> policy has you covered!
            </p>
          </div>
          <Link to="/contact" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
            Ask A Sizing Specialist
          </Link>
        </div>
      </div>
    </div>
  );
}
