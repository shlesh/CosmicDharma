// components/DashboardPage.tsx - COMPREHENSIVE IMPROVEMENT
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, Moon, Sun, Compass, Calendar, 
  TrendingUp, Info, Download, Share2,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { PlanetTable } from './PlanetTable';
import { DashaChart } from './DashaChart';
import { HouseAnalysis } from './HouseAnalysis';

interface DashboardPageProps {
  profileData: any;
  loading?: boolean;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ profileData, loading = false }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['planets']));

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: <Compass className="w-4 h-4" /> },
    { id: 'planets', name: 'Planets', icon: <Star className="w-4 h-4" /> },
    { id: 'houses', name: 'Houses', icon: <Sun className="w-4 h-4" /> },
    { id: 'dashas', name: 'Dashas', icon: <Calendar className="w-4 h-4" /> },
    { id: 'analysis', name: 'Analysis', icon: <TrendingUp className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Your Vedic Birth Chart</h1>
          <p className="text-gray-300">
            Born on {profileData?.birthInfo?.date} at {profileData?.birthInfo?.time} in {profileData?.birthInfo?.location}
          </p>
          
          <div className="flex justify-center space-x-4 mt-4">
            <Button variant="outline" size="small" className="flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export PDF</span>
            </Button>
            <Button variant="outline" size="small" className="flex items-center space-x-2">
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </Button>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-full p-1 flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.icon}
                <span className="font-medium">{tab.name}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'overview' && (
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Basic Info */}
                <Card className="lg:col-span-1 p-6 bg-white/10 backdrop-blur-lg border border-white/20">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                    <Info className="w-5 h-5" />
                    <span>Birth Details</span>
                  </h3>
                  <div className="space-y-3 text-gray-300">
                    <div className="flex justify-between">
                      <span>Ascendant:</span>
                      <span className="text-white font-medium">{profileData?.coreElements?.ascendant || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Moon Sign:</span>
                      <span className="text-white font-medium">{profileData?.nakshatra?.nakshatra || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Nakshatra:</span>
                      <span className="text-white font-medium">{profileData?.nakshatra?.nakshatra || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Current Dasha:</span>
                      <span className="text-white font-medium">{profileData?.vimshottariDasha?.[0]?.lord || 'N/A'}</span>
                    </div>
                  </div>
                </Card>

                {/* Elemental Balance */}
                <Card className="lg:col-span-2 p-6 bg-white/10 backdrop-blur-lg border border-white/20">
                  <h3 className="text-xl font-semibold text-white mb-4">Elemental Balance</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(profileData?.coreElements?.elements || {}).map(([element, percentage]) => (
                      <div key={element} className="text-center">
                        <div className="relative w-16 h-16 mx-auto mb-2">
                          <svg className="w-16 h-16 transform -rotate-90">
                            <circle
                              cx="32"
                              cy="32"
                              r="28"
                              stroke="rgba(255,255,255,0.2)"
                              strokeWidth="4"
                              fill="transparent"
                            />
                            <circle
                              cx="32"
                              cy="32"
                              r="28"
                              stroke={
                                element === 'Fire' ? '#f59e0b' :
                                element === 'Earth' ? '#84cc16' :
                                element === 'Air' ? '#06b6d4' :
                                element === 'Water' ? '#3b82f6' : '#8b5cf6'
                              }
                              strokeWidth="4"
                              fill="transparent"
                              strokeDasharray={`${2 * Math.PI * 28}`}
                              strokeDashoffset={`${2 * Math.PI * 28 * (1 - (percentage as number) / 100)}`}
                              className="transition-all duration-1000 ease-out"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">{percentage}%</span>
                          </div>
                        </div>
                        <p className="text-gray-300 text-sm font-medium">{element}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'planets' && <PlanetTable planets={profileData?.planetaryPositions || []} />}
            {activeTab === 'houses' && <HouseAnalysis houses={profileData?.houses || {}} />}
            {activeTab === 'dashas' && <DashaChart dashas={profileData?.vimshottariDasha || []} />}
            
            {activeTab === 'analysis' && (
              <div className="space-y-6">
                {/* Collapsible Sections */}
                {[
                  { key: 'yogas', title: 'Planetary Yogas', data: profileData?.yogas },
                  { key: 'strengths', title: 'Planetary Strengths', data: profileData?.shadbala },
                  { key: 'aspects', title: 'Vedic Aspects', data: profileData?.vedicAspects },
                ].map((section) => (
                  <Card key={section.key} className="bg-white/10 backdrop-blur-lg border border-white/20">
                    <button
                      onClick={() => toggleSection(section.key)}
                      className="w-full p-6 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
                    >
                      <h3 className="text-xl font-semibold text-white">{section.title}</h3>
                      {expandedSections.has(section.key) ? (
                        <ChevronUp className="w-5 h-5 text-gray-300" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-300" />
                      )}
                    </button>
                    
                    <AnimatePresence>
                      {expandedSections.has(section.key) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-6">
                            <pre className="text-gray-300 text-sm bg-black/20 rounded p-4 overflow-auto">
                              {JSON.stringify(section.data, null, 2)}
                            </pre>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
