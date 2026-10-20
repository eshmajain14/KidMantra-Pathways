'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  BookOpen,
  Menu,
  Clock,
  ArrowRight,
  X,
  ChevronRight,
  LogOut,
  User,
  Check,
  Calendar,
  Compass,
  BarChart3,
  Activity as ActivityIcon,
  Sun,
  Moon,
  Copy,
  Link2,
  Hash,
  Sparkles,
  Layers,
  Sliders,
  CheckCircle2,
  Mic,
  PenTool,
  HeartHandshake
} from 'lucide-react';
import { activities as mantraActivities, getCurrentService, setServiceContext, preserveQueryParams, normalizeService } from '@/mantra';
import { useDashboardTheme } from '@/context/DashboardThemeContext';
import MantraLogo from '@/components/common/MantraLogo';

// KidMantra Service Categories & Domains
export const KIDMANTRA_SERVICES = [
  { id: 'all', label: 'All Services', icon: Sparkles },
  { id: 'speech', label: 'Speech Therapy', icon: Mic },
  { id: 'ot', label: 'Occupational Therapy', icon: PenTool },
  { id: 'aba', label: 'ABA / Special Needs', icon: HeartHandshake }
];

export const SPEECH_CONDITIONS = [
  { id: 'all', label: 'All Speech Focus' },
  { id: 'foundational', label: 'Foundational' },
  { id: 'early_language', label: 'Early Language' },
  { id: 'articulation', label: 'Articulation' },
  { id: 'vocal_resonance', label: 'Vocal Resonance' },
  { id: 'breath_support', label: 'Breath Support' },
  { id: 'phonology', label: 'Phonology' }
];

export const OT_CONDITIONS = [
  { id: 'all', label: 'All OT Focus' },
  { id: 'foundational', label: 'Foundational' },
  { id: 'fine_motor', label: 'Fine Motor Precision' },
  { id: 'handwriting_prep', label: 'Handwriting Prep' },
  { id: 'tactile_integration', label: 'Tactile Integration' },
  { id: 'sensory_motor', label: 'Sensory Motor' }
];

export const ABA_CONDITIONS = [
  { id: 'all', label: 'All ABA Focus' },
  { id: 'foundational', label: 'Foundational' },
  { id: 'social_communication', label: 'Social Communication' },
  { id: 'emotion_mastery', label: 'Emotion Mastery' },
  { id: 'prompt_hierarchy', label: 'Prompt Hierarchy' },
  { id: 'discrete_trial', label: 'Discrete Trial' }
];

interface DeveloperLessonsPageProps {
  onNavigate: (route: string) => void;
}

export default function DeveloperLessonsPage({ onNavigate }: DeveloperLessonsPageProps) {
  const { theme, toggleTheme, isDark } = useDashboardTheme();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [selectedService, setSelectedService] = useState('all');
  const [selectedProblem, setSelectedProblem] = useState('all');
  const [selectedDay, setSelectedDay] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('lessons');



  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search || '');
    let serviceInUrl = searchParams.get('service') || searchParams.get('source') || searchParams.get('domain');

    if (serviceInUrl) {
      setSelectedService(normalizeService(serviceInUrl));
    } else {
      setSelectedService('all');
    }

    const handleServiceChange = (e: any) => {
      if (e.detail && e.detail.service) {
        setSelectedService(normalizeService(e.detail.service));
      }
    };

    window.addEventListener('mantra_service_changed', handleServiceChange);
    return () => {
      window.removeEventListener('mantra_service_changed', handleServiceChange);
    };
  }, []);

  const handleServiceSelect = (svc: string) => {
    setSelectedService(svc);
    setSelectedProblem('all');
    setSelectedDay('all');
    if (svc !== 'all') {
      setServiceContext(svc);
    }
  };

  const normSelected = normalizeService(selectedService);
  const isSpeechActive = normSelected === 'speech';
  const isOtActive = normSelected === 'ot';
  const isAbaActive = normSelected === 'aba';

  let currentConditions = SPEECH_CONDITIONS;
  let sidebarHeading = 'Speech Therapy Focus';

  if (isOtActive) {
    currentConditions = OT_CONDITIONS;
    sidebarHeading = 'Occupational Therapy Focus';
  } else if (isAbaActive) {
    currentConditions = ABA_CONDITIONS;
    sidebarHeading = 'ABA & Behavior Focus';
  } else {
    currentConditions = [
      { id: 'all', label: 'All Pediatric Clinical Domains' },
      { id: 'foundational', label: 'Foundational' },
      { id: 'early_language', label: 'Early Language (Speech)' },
      { id: 'articulation', label: 'Speech Articulation' },
      { id: 'vocal_resonance', label: 'Vocal Resonance' },
      { id: 'fine_motor', label: 'Fine Motor Precision (OT)' },
      { id: 'social_communication', label: 'Emotion Recognition (ABA)' }
    ];
    sidebarHeading = 'Pediatric Therapy Focus';
  }

  const copyToClipboard = async (text: string, key: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(String(text));
      }
      setCopiedKey(key);
      setTimeout(() => {
        setCopiedKey((prev) => (prev === key ? null : prev));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const getPathwaySlug = (act: any) => {
    const rawRoute = (act.route || `/task/${act.lessonId || ''}`).trim();
    return `client_tasks/${rawRoute.replace(/^\/+/, '')}`;
  };

  const getProductionUrl = (act: any) => {
    const slug = getPathwaySlug(act);
    return `https://web.mantracare.com/app/content/${slug}`;
  };

  const launchPathway = (act: any) => {
    if (!act) return;
    const targetRoute = act.route || `/task/${act.lessonId}`;
    onNavigate(targetRoute);
  };

  const filteredActivities = (mantraActivities || []).filter((act) => {
    if (!act) return false;
    const actServices = Array.isArray(act.services) ? act.services : [act.services];

    const matchesService =
      selectedService === 'all' ||
      normSelected === 'all' ||
      actServices.includes('*') ||
      actServices.some((s) => normalizeService(s) === normSelected) ||
      (act.service && normalizeService(act.service) === normSelected);

    const isFoundational =
      act.problem === 'foundational' ||
      (act.problems && act.problems.includes('foundational'));

    const matchesProblem =
      selectedProblem === 'all' ||
      (selectedProblem === 'foundational' && isFoundational) ||
      (act.problems && act.problems.includes(selectedProblem)) ||
      (act.problem && act.problem === selectedProblem);

    const matchesDay =
      selectedDay === 'all' ||
      (act.day !== undefined && Number(act.day) === Number(selectedDay));

    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      act.title?.toLowerCase().includes(query) ||
      act.lessonId?.toLowerCase().includes(query) ||
      act.route?.toLowerCase().includes(query) ||
      act.description?.toLowerCase().includes(query) ||
      act.targetSkill?.toLowerCase().includes(query);

    return matchesService && matchesProblem && matchesDay && matchesSearch;
  });

  const colors = isDark
    ? {
        bg: '#0F172A',
        surface: '#1E293B',
        surfaceElevated: '#334155',
        border: '#334155',
        borderSubtle: '#1E293B',
        textPrimary: '#F8FAFC',
        textSecondary: '#CBD5E1',
        textMuted: '#94A3B8',
        headerBg: '#1E293B',
        sidebarBg: '#1E293B',
        footerBg: '#0F172A',
        activeTabBg: '#242E3E',
        activeTabText: '#93C5FD',
        hoverBg: '#1E2634'
      }
    : {
        bg: '#F8FAFC',
        surface: '#FFFFFF',
        surfaceElevated: '#F8FAFC',
        border: '#E2E8F0',
        borderSubtle: '#F1F5F9',
        textPrimary: '#0F172A',
        textSecondary: '#475569',
        textMuted: '#64748B',
        headerBg: '#FFFFFF',
        sidebarBg: '#FFFFFF',
        footerBg: '#FAFAFC',
        activeTabBg: '#EFF6FF',
        activeTabText: '#1D4ED8',
        hoverBg: '#F8FAFC'
      };

  return (
    <div
      className={`dashboard-shell ${isDark ? 'dashboard-theme-dark' : 'dashboard-theme-light'}`}
      style={{
        minHeight: '100vh',
        background: colors.bg,
        color: colors.textPrimary,
        fontFamily: 'Inter, -apple-system, sans-serif',
        transition: 'background-color 0.15s ease, color 0.15s ease'
      }}
    >
      {/* TOP NAVBAR HEADER */}
      <header
        style={{
          background: colors.headerBg,
          borderBottom: `1px solid ${colors.border}`,
          padding: '12px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.03)',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}
      >
        {/* Left Section: Menu + Logo + Subtitle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button
            onClick={() => setIsSidebarOpen(true)}
            title="Open Menu"
            style={{
              background: isDark ? '#1F2937' : '#F1F5F9',
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              cursor: 'pointer',
              padding: '6px 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: colors.textPrimary
            }}
          >
            <Menu size={20} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MantraLogo height={36} isDark={isDark} />
          </div>
        </div>

        {/* Right Section: Service Domain Badges + Theme Switch */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} className="hidden md:flex">
            <span
              style={{
                fontSize: '0.75rem',
                padding: '4px 10px',
                borderRadius: '8px',
                background: '#ECFDF5',
                color: '#065F46',
                fontWeight: 700,
                border: '1px solid #A7F3D0'
              }}
            >
              Speech
            </span>
            <span
              style={{
                fontSize: '0.75rem',
                padding: '4px 10px',
                borderRadius: '8px',
                background: '#F0F9FF',
                color: '#075985',
                fontWeight: 700,
                border: '1px solid #BAE6FD'
              }}
            >
              OT
            </span>
            <span
              style={{
                fontSize: '0.75rem',
                padding: '4px 10px',
                borderRadius: '8px',
                background: '#FAF5FF',
                color: '#6B21A8',
                fontWeight: 700,
                border: '1px solid #E9D5FF'
              }}
            >
              ABA
            </span>
          </div>

          <button
            onClick={toggleTheme}
            style={{
              background: isDark ? '#1F2937' : '#F1F5F9',
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              padding: '6px 10px',
              cursor: 'pointer',
              color: colors.textPrimary,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.80rem',
              fontWeight: 600
            }}
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
            <span>{isDark ? 'Light' : 'Dark'}</span>
          </button>
        </div>
      </header>

      {/* SIDEBAR NAVIGATION DRAWER */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            key="sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onClick={() => setIsSidebarOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 200,
              display: 'flex'
            }}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '300px',
                maxWidth: '85vw',
                background: colors.sidebarBg,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '4px 0 24px rgba(0,0,0,0.2)',
                borderRight: `1px solid ${colors.border}`
              }}
            >
              {/* Drawer Top Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderBottom: `1px solid ${colors.border}`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MantraLogo height={32} isDark={isDark} />
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: colors.textMuted
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Navigation Links */}
              <div style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  onClick={() => {
                    setActiveTab('lessons');
                    setIsSidebarOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: 'none',
                    background: activeTab === 'lessons' ? (isDark ? '#1E3A8A' : '#EFF6FF') : 'transparent',
                    color: activeTab === 'lessons' ? (isDark ? '#93C5FD' : '#1D4ED8') : colors.textPrimary,
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <BookOpen size={18} color="#006FF5" />
                  <span>Therapy Pathways Catalog</span>
                </button>
              </div>

              {/* Drawer Footer */}
              <div
                style={{
                  padding: '16px 20px',
                  borderTop: `1px solid ${colors.border}`,
                  background: colors.footerBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: '#EFF6FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#006FF5'
                    }}
                  >
                    <User size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.80rem', fontWeight: 700, color: colors.textPrimary }}>Clinical Admin</div>
                    <div style={{ fontSize: '0.70rem', color: colors.textMuted }}>kidmantra@mantra.care</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN DASHBOARD CONTENT */}
      <main
        style={{
          width: '100%',
          maxWidth: '100%',
          padding: '20px 28px 40px 28px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* CATALOG TOP HEADER: Service Navigation Tabs */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px'
            }}
          >
            <div>
              <h1 style={{ margin: '0 0 4px 0', fontSize: '1.45rem', fontWeight: 900, color: colors.textPrimary }}>
                KidMantra Pathways
              </h1>
              <p style={{ margin: 0, fontSize: '0.84rem', color: colors.textSecondary }}>
                Evidence-based Speech, Occupational Therapy, and ABA activities for pediatric development.
              </p>
            </div>

            {/* Service Filter Pills */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: colors.surface,
                padding: '5px',
                borderRadius: '14px',
                border: `1px solid ${colors.border}`,
                boxShadow: isDark ? 'none' : '0 2px 6px rgba(0,0,0,0.02)'
              }}
            >
              {KIDMANTRA_SERVICES.map((svc) => {
                const isSelected = selectedService === svc.id;
                const IconComponent = svc.icon;
                return (
                  <button
                    key={svc.id}
                    onClick={() => handleServiceSelect(svc.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 14px',
                      borderRadius: '10px',
                      border: 'none',
                      background: isSelected ? '#006FF5' : 'transparent',
                      color: isSelected ? '#FFFFFF' : colors.textSecondary,
                      fontWeight: isSelected ? 800 : 600,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <IconComponent size={14} />
                    <span>{svc.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* FULL-WIDTH ACTIVITY CATALOG: Search + Day Selector + Activity Card Grid */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Search Input Bar */}
              <div style={{ position: 'relative', width: '100%' }}>
                <Search
                  size={18}
                  color={colors.textMuted}
                  style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search KidMantra activities by title, domain, or target skill..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 46px',
                    borderRadius: '14px',
                    border: `1px solid ${colors.border}`,
                    fontSize: '0.9rem',
                    outline: 'none',
                    background: colors.surface,
                    color: colors.textPrimary,
                    boxShadow: isDark ? 'none' : '0 2px 6px rgba(0,0,0,0.02)',
                    boxSizing: 'border-box'
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    style={{
                      position: 'absolute',
                      right: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: colors.textMuted
                    }}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* DAY SELECTOR DROPDOWN */}
              <div
                style={{
                  background: colors.surface,
                  borderRadius: '14px',
                  border: `1px solid ${colors.border}`,
                  padding: '10px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                  boxShadow: isDark ? 'none' : '0 2px 6px rgba(0,0,0,0.02)'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: colors.textPrimary
                  }}
                >
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      background: isDark ? '#1E293B' : '#EFF6FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Calendar size={16} color="#006FF5" />
                  </div>
                  <span>Pathway Schedule Stage:</span>
                  {selectedDay !== 'all' && (
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '999px',
                        background: isDark ? '#1E293B' : '#EFF6FF',
                        color: '#006FF5',
                        fontWeight: 800,
                        fontSize: '0.75rem'
                      }}
                    >
                      Day {selectedDay}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  {['all', '1', '2', '3'].map((d) => (
                    <button
                      key={d}
                      onClick={() => setSelectedDay(d)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: selectedDay === d ? '#006FF5' : colors.border,
                        background: selectedDay === d ? '#006FF5' : 'transparent',
                        color: selectedDay === d ? '#FFFFFF' : colors.textSecondary,
                        fontSize: '0.78rem',
                        fontWeight: selectedDay === d ? 800 : 600,
                        cursor: 'pointer'
                      }}
                    >
                      {d === 'all' ? 'All Days' : `Day ${d}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* ACTIVITY CARD GRID */}
              {filteredActivities.length === 0 ? (
                <div
                  style={{
                    background: colors.surface,
                    borderRadius: '20px',
                    border: `1px solid ${colors.border}`,
                    padding: '60px 20px',
                    textAlign: 'center',
                    color: colors.textSecondary
                  }}
                >
                  <BookOpen size={48} color={colors.textMuted} style={{ margin: '0 auto 16px auto', display: 'block' }} />
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', fontWeight: 800, color: colors.textPrimary }}>
                    No KidMantra Activities Found
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.88rem' }}>
                    {searchQuery
                      ? `No activities matching "${searchQuery}".`
                      : 'No activities found matching the selected domain or filter.'}
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '18px'
                  }}
                >
                  {filteredActivities.map((act) => {
                    return (
                      <div
                        key={act.lessonId || act.route}
                        style={{
                          background: colors.surface,
                          borderRadius: '18px',
                          border: `1px solid ${colors.border}`,
                          padding: '20px 22px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          boxShadow: isDark ? 'none' : '0 2px 10px rgba(0,0,0,0.02)',
                          transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                        }}
                      >
                        <div>
                          {/* Badges Bar */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              marginBottom: '14px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {act.day && (
                                <span
                                  style={{
                                    padding: '4px 8px',
                                    borderRadius: '999px',
                                    background: isDark ? '#1F2937' : '#F1F5F9',
                                    color: colors.textSecondary,
                                    fontSize: '0.74rem',
                                    fontWeight: 700
                                  }}
                                >
                                  Day {act.day}
                                </span>
                              )}
                            </div>
                            <span
                              style={{
                                fontSize: '0.76rem',
                                color: colors.textMuted,
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <Clock size={13} /> {act.estimatedDuration || '3 min'}
                            </span>
                          </div>

                          {/* Activity Title */}
                          <h3
                            style={{
                              margin: '0 0 8px 0',
                              fontSize: '1.05rem',
                              fontWeight: 800,
                              color: colors.textPrimary,
                              lineHeight: 1.3
                            }}
                          >
                            {act.title}
                          </h3>

                          {/* Activity Description */}
                          {act.description && (
                            <p
                              style={{
                                margin: '0 0 14px 0',
                                fontSize: '0.82rem',
                                color: colors.textSecondary,
                                lineHeight: 1.45
                              }}
                            >
                              {act.description}
                            </p>
                          )}
                          {/* Fast Developer Copy Action Bar */}
                          <div
                            style={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: '6px',
                              marginTop: '8px',
                              paddingTop: '10px',
                              borderTop: isDark ? '1px dashed rgba(255,255,255,0.08)' : '1px dashed #E2E8F0'
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                const cardKey = act.lessonId || act.activityId || act.route;
                                copyToClipboard(getProductionUrl(act), `url_${cardKey}`);
                              }}
                              title={getProductionUrl(act)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '4px 8px',
                                borderRadius: '7px',
                                border: '1px solid',
                                borderColor:
                                  copiedKey === `url_${act.lessonId || act.activityId || act.route}`
                                    ? '#10B981'
                                    : isDark
                                    ? 'rgba(255,255,255,0.12)'
                                    : '#E2E8F0',
                                background:
                                  copiedKey === `url_${act.lessonId || act.activityId || act.route}`
                                    ? isDark
                                      ? '#064E3B'
                                      : '#ECFDF5'
                                    : isDark
                                    ? '#1E293B'
                                    : '#F8FAFC',
                                color:
                                  copiedKey === `url_${act.lessonId || act.activityId || act.route}`
                                    ? isDark
                                      ? '#6EE7B7'
                                      : '#059669'
                                    : colors.textSecondary,
                                fontSize: '0.70rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              {copiedKey === `url_${act.lessonId || act.activityId || act.route}` ? (
                                <>
                                  <Check size={11} color="#059669" />
                                  <span>Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Link2 size={11} color="#006FF5" />
                                  <span>Copy URL</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                const cardKey = act.lessonId || act.activityId || act.route;
                                copyToClipboard(getPathwaySlug(act), `slug_${cardKey}`);
                              }}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '4px 8px',
                                borderRadius: '7px',
                                border: '1px solid',
                                borderColor:
                                  copiedKey === `slug_${act.lessonId || act.activityId || act.route}`
                                    ? '#10B981'
                                    : isDark
                                    ? 'rgba(255,255,255,0.12)'
                                    : '#E2E8F0',
                                background:
                                  copiedKey === `slug_${act.lessonId || act.activityId || act.route}`
                                    ? isDark
                                      ? '#064E3B'
                                      : '#ECFDF5'
                                    : isDark
                                    ? '#1E293B'
                                    : '#F8FAFC',
                                color:
                                  copiedKey === `slug_${act.lessonId || act.activityId || act.route}`
                                    ? isDark
                                      ? '#6EE7B7'
                                      : '#059669'
                                    : colors.textSecondary,
                                fontSize: '0.70rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              {copiedKey === `slug_${act.lessonId || act.activityId || act.route}` ? (
                                <>
                                  <Check size={11} color="#059669" />
                                  <span>Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy size={11} color="#8B5CF6" />
                                  <span>Copy Slug</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Card Bottom Action Bar */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginTop: '16px',
                            paddingTop: '16px',
                            borderTop: `1px solid ${colors.border}`
                          }}
                        >
                          <span
                            style={{
                              fontSize: '0.74rem',
                              color: colors.textMuted,
                              fontWeight: 700,
                              textTransform: 'uppercase'
                            }}
                          >
                            {Array.isArray(act.services) ? act.services.join(', ') : act.services || 'pediatric'}
                          </span>

                          <button
                            onClick={() => launchPathway(act)}
                            style={{
                              padding: '8px 18px',
                              borderRadius: '10px',
                              border: 'none',
                              background: '#006FF5',
                              color: '#FFFFFF',
                              fontWeight: 800,
                              fontSize: '0.82rem',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              boxShadow: '0 2px 8px rgba(0, 111, 245, 0.25)'
                            }}
                          >
                            <span>Preview Activity</span>
                            <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
        </div>
      </main>
    </div>
  );
}
