'use client';

import React, { useState } from 'react';
import { useTherapeutic } from '@/context/TherapeuticContext';
import { TherapeuticService, Pathway } from '@/types/domain';
import {
  Layers,
  Mic,
  PenTool,
  HeartHandshake,
  Sparkles,
  Play,
  CheckCircle2,
  Clock,
  Target,
  Search,
  Star,
  Rocket,
  Flame
} from 'lucide-react';

export const PathwayCatalog: React.FC = () => {
  const { pathways, selectPathway, activePathway, setActiveTab } = useTherapeutic();
  const [selectedService, setSelectedService] = useState<TherapeuticService | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPathways = pathways.filter((p) => {
    const matchesService = selectedService === 'all' || p.service === selectedService;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesService && matchesSearch;
  });

  const getServiceBadge = (service: TherapeuticService) => {
    switch (service) {
      case 'speech_therapy':
        return { label: 'Speech Therapy', icon: Mic, color: 'text-emerald-800 bg-emerald-100 border-emerald-200 shadow-xs' };
      case 'occupational_therapy':
        return { label: 'Occupational Therapy', icon: PenTool, color: 'text-sky-800 bg-sky-100 border-sky-200 shadow-xs' };
      case 'aba_special_needs':
        return { label: 'ABA / Special Needs', icon: HeartHandshake, color: 'text-purple-800 bg-purple-100 border-purple-200 shadow-xs' };
      case 'multidisciplinary':
        return { label: 'Multidisciplinary', icon: Sparkles, color: 'text-amber-800 bg-amber-100 border-amber-200 shadow-xs' };
    }
  };

  const handleLaunch = (pathwayId: string) => {
    selectPathway(pathwayId);
    setActiveTab('runner');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Search & Filter Header with Light Pastel Accent */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-pink-100/40 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 flex items-center space-x-2">
              <Sparkles className="w-6 h-6 text-pink-500 animate-spin" style={{ animationDuration: '8s' }} />
              <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-sky-600 bg-clip-text text-transparent">
                Therapeutic Pathways Catalog
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Explore fun clinical care pathways designed for Speech, Occupational Therapy, ABA, and Integrated Care.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pathways or target skills..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-pink-400 font-medium"
            />
          </div>
        </div>

        {/* Service Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedService('all')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition cursor-pointer transform hover:scale-105 ${
              selectedService === 'all'
                ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-md'
                : 'bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            All Services ({pathways.length})
          </button>
          {[
            { id: 'speech_therapy', label: 'Speech Therapy', icon: Mic, color: 'from-emerald-300 to-teal-400' },
            { id: 'occupational_therapy', label: 'Occupational Therapy', icon: PenTool, color: 'from-sky-300 to-blue-400' },
            { id: 'aba_special_needs', label: 'ABA / Special Needs', icon: HeartHandshake, color: 'from-purple-300 to-pink-400' },
            { id: 'multidisciplinary', label: 'Multidisciplinary', icon: Sparkles, color: 'from-amber-300 to-orange-400' }
          ].map((svc) => {
            const IconComp = svc.icon;
            const isSelected = selectedService === svc.id;
            return (
              <button
                key={svc.id}
                onClick={() => setSelectedService(svc.id as any)}
                className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl text-xs font-black transition cursor-pointer shrink-0 transform hover:scale-105 ${
                  isSelected
                    ? `bg-gradient-to-r ${svc.color} text-slate-900 shadow-md`
                    : 'bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                <IconComp className="w-4 h-4" />
                <span>{svc.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pathways Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPathways.map((pathway) => {
          const badge = getServiceBadge(pathway.service);
          const BadgeIcon = badge.icon;
          const isActive = activePathway?.pathway_id === pathway.pathway_id;

          const totalActivities = pathway.stages.reduce((a, s) => a + s.activities.length, 0);

          return (
            <div
              key={pathway.pathway_id}
              className={`bg-white border-2 rounded-3xl p-6 shadow-sm flex flex-col justify-between transition-all transform hover:scale-[1.01] ${
                isActive
                  ? 'border-pink-400 ring-2 ring-pink-200 shadow-md'
                  : 'border-slate-200 hover:border-purple-300'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-black border ${badge.color}`}>
                    <BadgeIcon className="w-3.5 h-3.5" />
                    <span>{badge.label}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">ID: {pathway.pathway_id}</span>
                </div>

                <div>
                  <h3 className="text-xl font-black text-slate-900">{pathway.title}</h3>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2 font-medium">{pathway.description}</p>
                </div>

                {/* Target User & Clinical Goal Card */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2.5">
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="text-slate-500 font-bold">Target Age Group:</span>
                    <span className="font-black text-pink-700 bg-pink-100 px-2 py-0.5 rounded border border-pink-200">
                      {pathway.target_user.age_range}
                    </span>
                  </div>
                  <div className="text-slate-500 flex items-start space-x-2">
                    <Target className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                    <span className="text-slate-800 font-medium line-clamp-2">{pathway.goal.clinical_goal_statement}</span>
                  </div>
                </div>

                {/* Stage List Preview */}
                <div className="space-y-2">
                  <span className="text-[11px] uppercase tracking-wider font-extrabold text-slate-500 flex items-center space-x-1">
                    <Star className="w-3 h-3 text-amber-500 fill-current" />
                    <span>Pathway Stages ({pathway.stages.length}):</span>
                  </span>
                  <div className="space-y-1.5">
                    {pathway.stages.map((stg) => (
                      <div key={stg.stage_id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-center text-slate-700 font-medium">
                        <span className="font-bold text-slate-900">Day {stg.day_number}: {stg.title}</span>
                        <span className="text-[10px] text-pink-700 font-mono font-bold bg-pink-100 px-2 py-0.5 rounded border border-pink-200">
                          {stg.activities.length} activity
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between mt-4">
                <span className="text-xs text-slate-500 flex items-center space-x-1 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{totalActivities} Activities Total</span>
                </span>

                <button
                  onClick={() => handleLaunch(pathway.pathway_id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-black text-xs transition transform hover:scale-105 shadow-md ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950'
                      : 'bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-pink-200'
                  }`}
                >
                  <Rocket className="w-4 h-4 fill-current" />
                  <span>{isActive ? 'Current Pathway' : 'Launch Pathway 🚀'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
