// components/DashboardPage.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { BasicInfo } from './BasicInfo';
import { PlanetTable } from './PlanetTable';
import { HouseAnalysis } from './HouseAnalysis';
import { DashaChart } from './DashaChart';
import { CoreElements } from './CoreElements';

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
              <BasicInfo data={profileData} />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <CoreElements data={profileData.coreElements} />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2"
            >
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4 text-gray-800">Quick Insights</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
                    <div className="text-orange-600 font-semibold mb-1">Ascendant</div>
                    <div className="text-lg font-bold text-gray-800">
                      {profileData.birthInfo?.ascendant_sign || 'N/A'}
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                    <div className="text-blue-600 font-semibold mb-1">Moon Sign</div>
                    <div className="text-lg font-bold text-gray-800">
                      {profileData.planetaryPositions?.find(p => p.name === 'Moon')?.sign || 'N/A'}
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                    <div className="text-purple-600 font-semibold mb-1">Current Dasha</div>
                    <div className="text-lg font-bold text-gray-800">
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
        
      case 'charts':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Divisional Charts</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(profileData.divisionalCharts || {}).map(([chart, data]) => (
                  <div key={chart} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">{chart}</h4>
                    <div className="text-sm text-gray-600">
                      {typeof data === 'object' ? Object.keys(data).length : 0} planets
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        );
        
      case 'yogas':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Yoga Combinations</h3>
              <div className="space-y-4">
                {profileData.yogas && Object.entries(profileData.yogas).map(([category, yogas]) => (
                  <div key={category} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold mb-2 capitalize">{category}</h4>
                    <div className="grid gap-2">
                      {Array.isArray(yogas) ? yogas.map((yoga, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded">
                          <div className="font-medium">{yoga.name}</div>
                          <div className="text-sm text-gray-600">{yoga.description}</div>
                        </div>
                      )) : (
                        <div className="text-gray-500">No yogas found in this category</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        );
        
      case 'predictions':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Predictions & Analysis</h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex">
                  <div className="text-yellow-600 mr-3">⚠️</div>
                  <div>
                    <h4 className="text-yellow-800 font-medium">Disclaimer</h4>
                    <p className="text-yellow-700 text-sm mt-1">
                      These are general interpretations based on traditional Vedic astrology. 
                      For personalized guidance, consult a qualified astrologer.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                {profileData.analysis && Object.entries(profileData.analysis).map(([section, content]) => (
                  <div key={section} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold mb-3 capitalize">{section.replace(/([A-Z])/g, ' $1')}</h4>
                    <div className="prose prose-sm max-w-none">
                      {typeof content === 'object' ? (
                        Object.entries(content).map(([key, value]) => (
                          <div key={key} className="mb-3">
                            <div className="font-medium">{key}:</div>
                            <div className="text-gray-700">{String(value)}</div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-700">{String(content)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between bg-white rounded-xl shadow-sm p-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Your Vedic Birth Chart
              </h1>
              <p className="text-gray-600">
                {profileData.birthInfo?.date} at {profileData.birthInfo?.time} 
                {profileData.birthInfo?.location && ` in ${profileData.birthInfo.location}`}
              </p>
            </div>
            
            <div className="flex gap-3 mt-4 lg:mt-0">
              <Button
                onClick={handleShare}
                variant="outline"
                className="flex items-center gap-2"
              >
                📤 Share
              </Button>
              
              <Button
                onClick={handleDownload}
                variant="outline"
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-white rounded-xl shadow-sm p-2 overflow-x-auto">
            <div className="flex gap-1 min-w-max">
              {tabConfig.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
