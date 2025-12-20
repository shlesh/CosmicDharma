// components/DashboardPage.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import BasicInfo from '../astrology/BasicInfo';
import PlanetTable from '../astrology/PlanetTable';
import HouseAnalysis from '../astrology/HouseAnalysis';
import DashaChart from '../astrology/DashaChart';
import CoreElements from '../astrology/CoreElements';

interface DashboardPageProps {
  profileData: any;
  onNewChart: () => void;
}

const tabConfig = [
  { id: 'overview', label: 'Overview', icon: '🌟' },
  { id: 'planets', label: 'Planets', icon: '🪐' },
  { id: 'houses', label: 'Houses', icon: '🏠' },
  { id: 'dasha', label: 'Dasha', icon: '⏰' },
  { id: 'charts', label: 'Divisional Charts', icon: '📊' },
  { id: 'yogas', label: 'Yogas', icon: '🕉️' },
  { id: 'predictions', label: 'Predictions', icon: '🔮' },
];

export function DashboardPage({ profileData, onNewChart }: DashboardPageProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  const handleShare = async () => {
    if (navigator.share && /Mobile|Android|iPhone|iPad/.test(navigator.userAgent)) {
      try {
        await navigator.share({
          title: 'My Vedic Birth Chart',
          text: 'Check out my Vedic astrology birth chart analysis!',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share failed');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Chart URL copied to clipboard!');
    }
  };

  const handleDownload = () => {
    const data = {
      ...profileData,
      generated_at: new Date().toISOString(),
      generated_by: 'Cosmic Dharma',
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `birth-chart-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="grid lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <BasicInfo birth={profileData.birthInfo} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <CoreElements elements={profileData.coreElements} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2"
            >
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Quick Insights</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 p-4 rounded-lg border border-orange-100 dark:border-orange-800/50">
                    <div className="text-orange-600 dark:text-orange-400 font-semibold mb-1">Ascendant</div>
                    <div className="text-lg font-bold text-gray-800 dark:text-gray-100">
                      {profileData.birthInfo?.ascendant_sign || 'N/A'}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-4 rounded-lg border border-blue-100 dark:border-blue-800/50">
                    <div className="text-blue-600 dark:text-blue-400 font-semibold mb-1">Moon Sign</div>
                    <div className="text-lg font-bold text-gray-800 dark:text-gray-100">
                      {profileData.planetaryPositions?.find((p: any) => p.name === 'Moon')?.sign || 'N/A'}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-4 rounded-lg border border-purple-100 dark:border-purple-800/50">
                    <div className="text-purple-600 dark:text-purple-400 font-semibold mb-1">Current Dasha</div>
                    <div className="text-lg font-bold text-gray-800 dark:text-gray-100">
                      {profileData.vimshottariDasha?.[0]?.lord || 'N/A'}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        );

      case 'planets':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <PlanetTable planets={profileData.planetaryPositions} />
          </motion.div>
        );

      case 'houses':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <HouseAnalysis houses={profileData.houses} />
          </motion.div>
        );

      case 'dasha':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <DashaChart dasha={profileData.vimshottariDasha} />
          </motion.div>
        );

      case 'predictions':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-6">
              <div className="space-y-6">
                {/* 1. Planetary Interpretations (New Rich Content) */}
                {profileData.analysis?.planetaryInterpretations && (
                  <div className="border border-purple-200 dark:border-purple-900 bg-purple-50/50 dark:bg-purple-900/10 rounded-lg p-6">
                    <h4 className="font-bold text-lg mb-4 text-purple-900 dark:text-purple-100">Planetary Interpretations</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      {Object.entries(profileData.analysis.planetaryInterpretations).map(([key, text]) => {
                        // key is like "SunInAries", meaningful text is in value
                        const planetName = key.replace(/In.+/, '');
                        return (
                          <div key={key} className="bg-white dark:bg-gray-800 p-4 rounded shadow-sm">
                            <span className="block font-bold text-purple-700 dark:text-purple-300 mb-1">{planetName}</span>
                            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{String(text)}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. General Analysis */}
                {profileData.analysis && Object.entries(profileData.analysis).map(([section, content]) => {
                  if (section === 'planetaryInterpretations' || section === 'divisionalCharts') return null; // Handled separately

                  return (
                    <div key={section} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <h4 className="font-semibold mb-3 capitalize text-gray-900 dark:text-gray-100">{section.replace(/([A-Z])/g, ' $1')}</h4>
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        {content && typeof content === 'object' ? (
                          Object.entries(content).map(([key, value]) => (
                            <div key={key} className="mb-3">
                              <div className="font-medium capitalize text-gray-800 dark:text-gray-200">{key.replace(/([A-Z])/g, ' $1')}:</div>
                              <div className="text-gray-700 dark:text-gray-300">{String(value)}</div>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-700 dark:text-gray-300">{String(content)}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card >
          </motion.div >
        );

      case 'charts':
        // Prefer rich analysis from backend if available, else fallback to raw data
        const richCharts = profileData.analysis?.divisionalCharts;
        const rawCharts = profileData.divisionalCharts || {};

        // Merge keys from both
        const allChartKeys = Array.from(new Set([...Object.keys(richCharts || {}), ...Object.keys(rawCharts)]));
        allChartKeys.sort((a, b) => {
          // Sort D1, D2, D3... numerically
          const numA = parseInt(a.replace('D', '')) || 0;
          const numB = parseInt(b.replace('D', '')) || 0;
          return numA - numB;
        });

        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Divisional Charts (Vargas)</h3>
              <p className="mb-6 text-gray-600 dark:text-gray-400">Detailed breakdown of planetary positions in all 16 major divisional charts (Shodasavarga) + others.</p>

              <div className="space-y-8">
                {allChartKeys.map((chart) => {
                  const richData = richCharts?.[chart];
                  const rawData = rawCharts[chart];

                  if (!richData && !rawData) return null;

                  return (
                    <div key={chart} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800">
                      <div className="bg-gray-50 dark:bg-gray-900/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h4 className="font-bold text-gray-800 dark:text-gray-200 text-lg">{chart}</h4>
                        {richData?.interpretation && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 italic max-w-md text-right hidden md:inline-block">
                            {richData.interpretation}
                          </span>
                        )}
                      </div>

                      <div className="p-4">
                        {/* Interpretation / Special Note */}
                        {richData?.interpretation && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 md:hidden italic">{richData.interpretation}</p>
                        )}

                        {/* Placements Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {/* Use rich data if available (contains sign names), mostly. Or map raw data. */}
                          {richData?.placements ? (
                            Object.entries(richData.placements).map(([planet, sign]) => (
                              <div key={planet} className="flex justify-between items-center bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 p-2 rounded">
                                <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">{planet}</span>
                                <span className="text-sm text-purple-600 dark:text-purple-400 font-semibold">{String(sign)}</span>
                              </div>
                            ))
                          ) : rawData ? (
                            Object.entries(rawData).map(([planet, signVal]) => (
                              <div key={planet} className="flex justify-between items-center bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 p-2 rounded">
                                <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">{planet}</span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">Sign {String(signVal)}</span>
                              </div>
                            ))
                          ) : null}
                        </div>

                        {/* Vargottama or Special Analysis */}
                        {richData?.special_note && (
                          <div className="mt-3 text-sm font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded inline-block">
                            💡 {richData.special_note}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Your Vedic Birth Chart
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {profileData.birthInfo?.date} at {profileData.birthInfo?.time}
                {profileData.birthInfo?.location && ` in ${profileData.birthInfo.location}`}
              </p>
            </div>

            <div className="flex gap-3 mt-4 lg:mt-0">
              <Button
                onClick={handleShare}
                variant="secondary"
                className="flex items-center gap-2"
              >
                📤 Share
              </Button>

              <Button
                onClick={handleDownload}
                variant="secondary"
                className="flex items-center gap-2"
              >
                💾 Download
              </Button>

              <Button
                onClick={onNewChart}
                className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white flex items-center gap-2"
              >
                ✨ New Chart
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        < motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-2 overflow-x-auto">
            <div className="flex gap-1 min-w-max">
              {tabConfig.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-white'
                    }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div >

        {/* Tab Content */}
        < AnimatePresence mode="wait" >
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence >
      </div >
    </div >
  );
}
