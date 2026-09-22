// components/DashboardPage.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import BasicInfo from '../astrology/BasicInfo';
import PlanetTable from '../astrology/PlanetTable';
import HouseAnalysis from '../astrology/HouseAnalysis';
import DashaChart from '../astrology/DashaChart';
import CoreElements from '../astrology/CoreElements';
import PanchangaPanel from '../astrology/PanchangaPanel';
import YugaPanel from '../astrology/YugaPanel';

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
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
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
            <BasicInfo birth={profileData.birthInfo} />
            <CoreElements elements={profileData.coreElements} />
            <YugaPanel yuga={profileData.yuga || profileData.birthInfo?.yuga} lineage={profileData.lineage} />
            <PanchangaPanel panchanga={profileData.panchanga} />
            <Card className="p-6 lg:col-span-2">
              <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Quick Insights</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 p-4 rounded-lg">
                  <div className="text-orange-600 dark:text-orange-400 font-semibold mb-1">Ascendant</div>
                  <div className="text-lg font-bold">{profileData.birthInfo?.ascendant_sign || 'N/A'}</div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-4 rounded-lg">
                  <div className="text-blue-600 dark:text-blue-400 font-semibold mb-1">Moon Sign</div>
                  <div className="text-lg font-bold">{profileData.planetaryPositions?.find((p: any) => p.name === 'Moon')?.sign || 'N/A'}</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-4 rounded-lg">
                  <div className="text-purple-600 dark:text-purple-400 font-semibold mb-1">Current Dasha</div>
                  <div className="text-lg font-bold">{profileData.vimshottariDasha?.[0]?.lord || 'N/A'}</div>
                </div>
              </div>
            </Card>
          </div>
        );
      case 'planets':
        return <PlanetTable planets={profileData.planetaryPositions} />;
      case 'houses':
        return <HouseAnalysis houses={profileData.houses} />;
      case 'dasha':
        return <DashaChart dasha={profileData.vimshottariDasha} />;
      case 'yogas':
        return (
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Yogas</h3>
            {profileData.yogas && Object.keys(profileData.yogas).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(profileData.yogas).map(([name, detail]) => (
                  <div key={name} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="font-semibold">{name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{typeof detail === 'string' ? detail : JSON.stringify(detail)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">No named yogas were returned for this chart.</p>
            )}
          </Card>
        );
      case 'predictions':
        return (
          <Card className="p-6">
            {profileData.analysis && Object.entries(profileData.analysis).map(([section, content]) => (
              <div key={section} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
                <h4 className="font-semibold mb-3 capitalize">{section.replace(/([A-Z])/g, ' $1')}</h4>
                <div className="text-sm text-gray-700 dark:text-gray-300">{typeof content === 'string' ? content : JSON.stringify(content)}</div>
              </div>
            ))}
          </Card>
        );
      case 'charts': {
        const rawCharts = profileData.divisionalCharts || {};
        return (
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Divisional Charts (Vargas)</h3>
            <div className="space-y-6">
              {Object.keys(rawCharts).sort().map((chart) => (
                <div key={chart} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                  <h4 className="font-bold mb-2">{chart}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(rawCharts[chart] || {}).map(([planet, signVal]) => (
                      <div key={planet} className="flex justify-between text-sm">
                        <span>{planet}</span><span>{String(signVal)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Your Vedic Birth Chart</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {profileData.birthInfo?.date} at {profileData.birthInfo?.time}
              {profileData.birthInfo?.location && ` in ${profileData.birthInfo.location}`}
            </p>
          </div>
          <div className="flex gap-3 mt-4 lg:mt-0">
            <Button onClick={handleShare} variant="secondary">Share</Button>
            <Button onClick={handleDownload} variant="secondary">Download</Button>
            <Button onClick={onNewChart} className="bg-gradient-to-r from-orange-500 to-pink-500 text-white">New Chart</Button>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-2 overflow-x-auto mb-8">
          <div className="flex gap-1 min-w-max">
            {tabConfig.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${activeTab === tab.id ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white' : 'text-gray-600 dark:text-gray-300'}`}
              >
                <span>{tab.icon}</span>{tab.label}
              </button>
            ))}
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
