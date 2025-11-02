import { useState } from "react";
import { ArrowLeft, Plus, X, Shield, Ban, CheckCircle } from "lucide-react";
import { useTheme } from '@/contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface FilterRule {
  id: string;
  title: string;
  type: 'whitelist' | 'blacklist';
}

const Settings = ({ onBack }: { onBack: () => void }) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [filterRules, setFilterRules] = useState<FilterRule[]>([
    { id: '1', title: 'Visual Studio Code', type: 'whitelist' },
    { id: '2', title: 'Terminal', type: 'whitelist' },
    { id: '3', title: 'YouTube', type: 'blacklist' },
  ]);
  const [newRuleTitle, setNewRuleTitle] = useState("");
  const [newRuleType, setNewRuleType] = useState<'whitelist' | 'blacklist'>('whitelist');

  const handleAddRule = () => {
    if (!newRuleTitle.trim()) return;

    const newRule: FilterRule = {
      id: Date.now().toString(),
      title: newRuleTitle.trim(),
      type: newRuleType,
    };

    setFilterRules([...filterRules, newRule]);
    setNewRuleTitle("");
  };

  const handleRemoveRule = (id: string) => {
    setFilterRules(filterRules.filter(rule => rule.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddRule();
    }
  };

  const whitelistedRules = filterRules.filter(rule => rule.type === 'whitelist');
  const blacklistedRules = filterRules.filter(rule => rule.type === 'blacklist');

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-border">
        <div className="w-full max-w-[1440px] mx-auto px-2 sm:px-4 lg:px-6 h-12 sm:h-14 lg:h-16 flex items-center justify-between">
          {/* Left: Back Button and Title */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate('/')}
              className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-colors ${
                theme === 'dark'
                  ? 'text-purple-200 hover:text-white hover:bg-purple-900'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <div className="flex items-center gap-2">
              <img
                src={theme === 'dark' ? "./flowstate_transparent_dark_resized.png" : "./flowstate_transparent_light_resized.png"}
                alt="FlowState"
                className="w-6 h-6 sm:w-8 sm:h-8 transition-all duration-300"
              />
              <h1 className="text-base sm:text-lg font-semibold">Settings</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-[1440px] mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
        <div className="max-w-4xl mx-auto">
          {/* Page Description */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">App Filtering</h2>
            <p className={`text-sm sm:text-base ${
              theme === 'dark' ? 'text-muted-foreground' : 'text-gray-600'
            }`}>
              Configure which applications should always be allowed or blocked during focus sessions.
              Window titles containing these keywords will be filtered accordingly.
            </p>
          </div>

          {/* Add New Rule Section */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-soft p-4 sm:p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Add New Rule</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                value={newRuleTitle}
                onChange={(e) => setNewRuleTitle(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter window title (e.g., YouTube, Visual Studio Code)"
                className="flex-1 h-10 sm:h-12 rounded-xl"
              />
              <div className="flex gap-2">
                <Button
                  variant={newRuleType === 'whitelist' ? 'default' : 'outline'}
                  onClick={() => setNewRuleType('whitelist')}
                  className={`rounded-xl px-4 ${
                    newRuleType === 'whitelist'
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : ''
                  }`}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Allow
                </Button>
                <Button
                  variant={newRuleType === 'blacklist' ? 'default' : 'outline'}
                  onClick={() => setNewRuleType('blacklist')}
                  className={`rounded-xl px-4 ${
                    newRuleType === 'blacklist'
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : ''
                  }`}
                >
                  <Ban className="w-4 h-4 mr-2" />
                  Block
                </Button>
                <Button
                  onClick={handleAddRule}
                  className="rounded-xl px-4 bg-primary hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Whitelisted Apps */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-soft p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-green-500" />
                <h3 className="text-lg font-semibold">Always Allowed</h3>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  {whitelistedRules.length}
                </span>
              </div>

              {whitelistedRules.length === 0 ? (
                <p className={`text-sm text-center py-8 ${
                  theme === 'dark' ? 'text-muted-foreground' : 'text-gray-500'
                }`}>
                  No whitelisted apps yet. Add apps above to always allow them.
                </p>
              ) : (
                <div className="space-y-2">
                  {whitelistedRules.map((rule) => (
                    <div
                      key={rule.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-muted/50 border-border'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="font-medium">{rule.title}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveRule(rule.id)}
                        className={`p-1 rounded transition-colors ${
                          theme === 'dark'
                            ? 'hover:bg-red-900/20 text-red-400'
                            : 'hover:bg-red-50 text-red-500'
                        }`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Blacklisted Apps */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-soft p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Ban className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-semibold">Always Blocked</h3>
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                  {blacklistedRules.length}
                </span>
              </div>

              {blacklistedRules.length === 0 ? (
                <p className={`text-sm text-center py-8 ${
                  theme === 'dark' ? 'text-muted-foreground' : 'text-gray-500'
                }`}>
                  No blacklisted apps yet. Add distracting apps above to always block them.
                </p>
              ) : (
                <div className="space-y-2">
                  {blacklistedRules.map((rule) => (
                    <div
                      key={rule.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-muted/50 border-border'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Ban className="w-4 h-4 text-red-500" />
                        <span className="font-medium">{rule.title}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveRule(rule.id)}
                        className={`p-1 rounded transition-colors ${
                          theme === 'dark'
                            ? 'hover:bg-red-900/20 text-red-400'
                            : 'hover:bg-red-50 text-red-500'
                        }`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Info Section */}
          <div className={`mt-6 p-4 rounded-xl ${
            theme === 'dark'
              ? 'bg-muted/30 border border-border'
              : 'bg-blue-50 border border-blue-200'
          }`}>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs">i</span>
              </div>
              <div className="text-sm">
                <p className={`font-medium mb-1 ${
                  theme === 'dark' ? 'text-foreground' : 'text-blue-900'
                }`}>
                  How it works:
                </p>
                <ul className={`space-y-1 ${
                  theme === 'dark' ? 'text-muted-foreground' : 'text-blue-800'
                }`}>
                  <li>• Window titles containing these keywords will be filtered</li>
                  <li>• Whitelisted apps will never be blocked, regardless of AI verdict</li>
                  <li>• Blacklisted apps will always be blocked, regardless of AI verdict</li>
                  <li>• Rules are session-based and reset when the app restarts</li>
                  <li>• Matching is case-insensitive and works with partial titles</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;