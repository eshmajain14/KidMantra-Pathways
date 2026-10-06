'use client';

import React from 'react';
import { TherapeuticProvider, useTherapeutic } from '@/context/TherapeuticContext';
import { Header } from '@/components/Header';
import { AccessibilityBar } from '@/components/AccessibilityBar';
import { PathwayRunnerUI } from '@/components/PathwayRunnerUI';
import { PathwayCatalog } from '@/components/PathwayCatalog';
import { ActivityRegistryUI } from '@/components/ActivityRegistryUI';
import { ProgressAnalyticsUI } from '@/components/ProgressAnalyticsUI';
import { ArchitectureDiagram } from '@/components/ArchitectureDiagram';

function MainContent() {
  const { activeTab } = useTherapeutic();

  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50/40 via-purple-50/30 to-sky-50/40 text-slate-800 pb-16 px-4 md:px-8 pt-6">
      {activeTab === 'runner' && <PathwayRunnerUI />}
      {activeTab === 'catalog' && <PathwayCatalog />}
      {activeTab === 'registry' && <ActivityRegistryUI />}
      {activeTab === 'analytics' && <ProgressAnalyticsUI />}
      {activeTab === 'architecture' && <ArchitectureDiagram />}
    </main>
  );
}

export default function Home() {
  return (
    <TherapeuticProvider>
      <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-pink-300 selection:text-slate-900">
        <AccessibilityBar />
        <Header />
        <MainContent />
      </div>
    </TherapeuticProvider>
  );
}
