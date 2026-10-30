import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Zap, Sparkles, Award, Heart, Leaf, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import SportikaLogo from '../components/SportikaLogo';

export default function AboutPage() {
  const technologies = [
    {
      icon: <Zap size={28} color="#FF6B35" />,
      title: 'AeroDry™ Moisture Tech',
      desc: 'Advanced micro-porous filament weave that pulls sweat away from the skin and evaporates it 3x faster than standard athletic polyester.',
      badge: 'Patented Weave',
    },
    {
      icon: <Sparkles size={28} color="#3B82F6" />,
      title: 'ProFlex 4-Way Stretch',
      desc: 'Seamless elastane-blend threading that offers maximum 360-degree freedom of motion without bagging or losing tension over repeated wash cycles.',
      badge: 'Unrestricted Motion',
    },
    {
      icon: <Shield size={28} color="#10B981" />,
      title: 'SilverShield™ Anti-Odor',
      desc: 'Embedded silver-ion microstructure prevents 99.8% of odor-causing bacterial growth, keeping you fresh during the toughest high-intensity workouts.',
      badge: 'Permanent Anti-Bacterial',
    },
    {
      icon: <Award size={28} color="#8B5CF6" />,
      title: 'Ergonomic Body-Mapping',
      desc: 'Engineered compression zones tailored to human anatomy, providing targeted muscle stability, reduced fatigue, and rapid post-training recovery.',
      badge: 'Physio-Approved',
    },
  ];

  const milestones = [
    { year: '2021', title: 'The Ignition', desc: 'Sportika was born in Pune with a single goal: build international-grade athletic apparel tailored to Indian climates and physiques.' },
    { year: '2022', title: 'AeroDry™ Innovation', desc: 'Launched our proprietary AeroDry™ fabric after 14 months of textile testing with elite marathoners and gym athletes.' },
    { year: '2023', title: 'Pan-India Reach', desc: 'Crossed 25,000 active runners and athletes across 180+ cities, establishing our dedicated manufacturing facility in Maharashtra.' },
    { year: '2024+', title: 'The Next Frontier', desc: 'Expanding into full technical performance layers, professional sports kits, and carbon-neutral sustainable activewear.' },
  ];

  return (
    <div style={{ background: '#F8FAFF', minHeight: '90vh' }}>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #0A0F1D 0%, #152238 60%, #1E3A8A 100%)',
        color: 'white',
        padding: '90px 0 80px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Glow decorative blobs */}
        <div style={{
          position: 'absolute', top: '-20%', right: '-10%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-20%', left: '-10%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,107,53,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: 960, textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.15)',
            padding: '8px 20px', borderRadius: 50, marginBottom: 24,
          }}>
            <SportikaLogo size={22} showText={false} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#93C5FD' }}>
              The Sportika Story
            </span>
          </div>

          <h1 style={{
            fontFamily: 'Outfit', fontWeight: 900,
            fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
            lineHeight: 1.15, marginBottom: 24,
            letterSpacing: '-0.02em',
          }}>
            Engineered For Champions.<br />
            <span style={{
              background: 'linear-gradient(90deg, #60A5FA, #FF8C5A)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Crafted For Every Athlete.
            </span>
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: '#CBD5E1',
            maxWidth: 760, margin: '0 auto 36px', lineHeight: 1.7,
          }}>
            We believe premium sportswear shouldn’t be a luxury. Sportika merges advanced material science,
            ergonomic athletic tailoring, and sleek aesthetics to empower your journey to the podium.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            <Link to="/products" className="btn btn-primary btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              Explore Collection <ArrowRight size={18} />
            </Link>
            <Link to="/size-guide" className="btn btn-outline btn-lg" style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}>
              View Size Guide
            </Link>
          </div>
        </div>
      </section>

      {/* Metrics Row */}
      <section style={{
        marginTop: -30,
        position: 'relative',
        zIndex: 2,
      }}>
        <div className="container" style={{ maxWidth: 1100 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 20,
          }}>
            {[
              { val: '50,000+', label: 'Athletes Geared Up', sub: 'Across 180+ Indian cities' },
              { val: '99.4%', label: 'Positive Customer Rating', sub: 'Based on 12k+ reviews' },
              { val: '48 Hrs', label: 'Fast Dispatch Guarantee', sub: 'Direct from our Pune warehouse' },
              { val: '100%', label: 'Precision Indian Craft', sub: 'Tested for tropical durability' },
            ].map((stat, i) => (
              <div key={i} style={{
                background: 'white', borderRadius: 20, padding: '24px 28px',
                border: '1px solid #E2E8F8',
                boxShadow: '0 8px 30px rgba(15,23,42,0.06)',
                textAlign: 'center',
              }}>
                <div style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '2rem', color: '#1565C0', marginBottom: 4 }}>
                  {stat.val}
                </div>
                <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '0.95rem', color: '#0F172A', marginBottom: 2 }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                  {stat.sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Purpose */}
      <section style={{ padding: '80px 0 60px' }}>
        <div className="container" style={{ maxWidth: 1000 }}>
          <div style={{
            background: 'white', borderRadius: 28, padding: '48px',
            border: '1px solid #E2E8F8', boxShadow: '0 4px 24px rgba(27,31,59,0.03)',
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 40, alignItems: 'center',
          }}>
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: '#EFF6FF', color: '#2563EB', padding: '6px 14px',
                borderRadius: 50, fontSize: '0.8rem', fontWeight: 800, marginBottom: 16,
              }}>
                <Heart size={14} /> OUR CORE PURPOSE
              </div>
              <h2 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '2.1rem', color: '#0F172A', marginBottom: 18, lineHeight: 1.25 }}>
                No Compromise on Fabric, No Inflated Brand Markups.
              </h2>
              <p style={{ color: '#475569', lineHeight: 1.8, marginBottom: 16, fontSize: '1rem' }}>
                For too long, athletic gear in India was divided into two extremes: overpriced international labels costing thousands for basic synthetic tees, or low-cost alternatives that tore after three washes.
              </p>
              <p style={{ color: '#475569', lineHeight: 1.8, marginBottom: 24, fontSize: '1rem' }}>
                Sportika was born to bridge that gap. We control the supply chain directly — from yarn spinning and knitting to flatlock stitching and automated quality control — delivering genuine Olympic-caliber activewear directly to your doorstep.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  '100% hypoallergenic, breathable microfiber blends',
                  'Chafe-free flatlock reinforced seams for 0 irritation',
                  'Eco-friendly low-water dyeing technology',
                  'Engineered for intense gym, running, and cricket sessions',
                ].map((point, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#1E293B', fontSize: '0.92rem', fontWeight: 500 }}>
                    <CheckCircle2 size={18} color="#16A34A" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #0F172A, #1E293B)',
              borderRadius: 24, padding: 36, color: 'white', position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: -30, right: -30,
                width: 140, height: 140, borderRadius: '50%',
                background: 'rgba(59,130,246,0.15)',
              }} />
              <h3 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.4rem', marginBottom: 14 }}>
                The Sportika Athlete Promise
              </h3>
              <p style={{ color: '#94A3B8', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: 24 }}>
                "Every stitch we produce carries the commitment to support you when you push past your 5th kilometer, your final heavy rep, and every personal record along the way."
              </p>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2563EB, #FF6B35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 900, fontSize: '1.1rem',
                }}>
                  S
                </div>
                <div>
                  <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '0.95rem' }}>Sportika Design Lab</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Pune, Maharashtra</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Proprietary Technology Showcase */}
      <section style={{ padding: '40px 0 80px' }}>
        <div className="container" style={{ maxWidth: 1080 }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: '#F0FDF4', color: '#16A34A', padding: '6px 14px',
              borderRadius: 50, fontSize: '0.8rem', fontWeight: 800, marginBottom: 12,
            }}>
              <Sparkles size={14} /> FABRIC INNOVATION
            </div>
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '2.3rem', color: '#0F172A', marginBottom: 12 }}>
              The Science Behind Sportika Gear
            </h2>
            <p style={{ color: '#64748B', maxWidth: 600, margin: '0 auto', fontSize: '1rem' }}>
              We collaborate with premier textile labs to craft proprietary fabrics that adapt dynamically to your body's temperature and sweat rate.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 24,
          }}>
            {technologies.map((tech, i) => (
              <div key={i} style={{
                background: 'white', borderRadius: 24, padding: 32,
                border: '1px solid #E2E8F8', boxShadow: '0 2px 14px rgba(27,31,59,0.02)',
                display: 'flex', flexDirection: 'column',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 18,
                    background: '#F8FAFC', border: '1px solid #E2E8F0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {tech.icon}
                  </div>
                  <span style={{
                    background: '#EFF6FF', color: '#2563EB',
                    borderRadius: 50, padding: '4px 10px',
                    fontSize: '0.72rem', fontWeight: 700, fontFamily: 'Outfit',
                  }}>
                    {tech.badge}
                  </span>
                </div>
                <h3 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.25rem', color: '#0F172A', marginBottom: 10 }}>
                  {tech.title}
                </h3>
                <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.6, flex: 1 }}>
                  {tech.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Milestones Timeline */}
      <section style={{ background: '#FFFFFF', padding: '80px 0', borderTop: '1px solid #E2E8F8', borderBottom: '1px solid #E2E8F8' }}>
        <div className="container" style={{ maxWidth: 900 }}>
          <div style={{ textAlign: 'center', marginBottom: 50 }}>
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '2.1rem', color: '#0F172A', marginBottom: 8 }}>
              Our Journey So Far
            </h2>
            <p style={{ color: '#64748B' }}>From a sketch in a Pune workshop to athletes nationwide.</p>
          </div>

          <div style={{ position: 'relative' }}>
            {/* Timeline line */}
            <div style={{
              position: 'absolute', left: 24, top: 0, bottom: 0,
              width: 3, background: 'linear-gradient(to bottom, #2563EB, #93C5FD)',
              borderRadius: 3,
            }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 36, paddingLeft: 60 }}>
              {milestones.map((m, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  {/* Dot */}
                  <div style={{
                    position: 'absolute', left: -44, top: 4,
                    width: 18, height: 18, borderRadius: '50%',
                    background: '#2563EB', border: '4px solid #DBEAFE',
                    boxShadow: '0 0 0 2px white',
                  }} />
                  <div style={{ display: 'inline-block', background: '#F1F5F9', padding: '2px 10px', borderRadius: 6, fontSize: '0.8rem', fontWeight: 800, color: '#1E293B', marginBottom: 4, fontFamily: 'Outfit' }}>
                    {m.year}
                  </div>
                  <h3 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.2rem', color: '#0F172A', marginBottom: 6 }}>
                    {m.title}
                  </h3>
                  <p style={{ color: '#64748B', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
                    {m.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sustainable Commitment */}
      <section style={{ padding: '80px 0' }}>
        <div className="container" style={{ maxWidth: 1000 }}>
          <div style={{
            background: 'linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)',
            borderRadius: 28, padding: '48px', border: '1px solid #A7F3D0',
            display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap',
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: 24,
              background: '#10B981', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(16,185,129,0.3)', flexShrink: 0,
            }}>
              <Leaf size={36} />
            </div>
            <div style={{ flex: 1, minWidth: 280 }}>
              <h3 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '1.5rem', color: '#065F46', marginBottom: 8 }}>
                Committed to Sustainable Athletics
              </h3>
              <p style={{ color: '#047857', fontSize: '0.95rem', lineHeight: 1.7, margin: 0 }}>
                We believe athletic greatness should never come at nature's expense. All Sportika cardboard mailer boxes are 100% recycled biodegradable material, and by 2026, 75% of our polyester fibers will be derived from post-consumer recycled ocean plastics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <section style={{
        background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
        color: 'white', padding: '64px 0', textAlign: 'center',
      }}>
        <div className="container" style={{ maxWidth: 800 }}>
          <h2 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '2.2rem', marginBottom: 16 }}>
            Ready To Elevate Your Performance?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.1rem', marginBottom: 32 }}>
            Join 50,000+ athletes nationwide. Free shipping on all orders over ₹999 with 7-day hassle-free returns.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            <Link to="/products" className="btn btn-secondary btn-lg" style={{ background: '#FF6B35', color: 'white', border: 'none', fontWeight: 800 }}>
              Shop Latest Drops
            </Link>
            <Link to="/contact" className="btn btn-outline btn-lg" style={{ borderColor: 'rgba(255,255,255,0.4)', color: 'white' }}>
              Contact Team Sportika
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
