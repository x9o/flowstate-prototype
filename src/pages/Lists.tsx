import { useState } from 'react';
import { Plus, Trash2, X, ArrowLeft, Search, Check, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as SimpleIcons from 'react-icons/si';
import { useTheme } from '@/contexts/ThemeContext';
import { useLists } from '@/contexts/ListsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { WHITELIST_OPTIONS, BLOCKLIST_OPTIONS, CATEGORY_COLORS, type AppOption } from '@/data/prepopulatedLists';

const Lists = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { whitelist, blocklist, addToWhitelist, addToBlocklist, removeFromWhitelist, removeFromBlocklist } = useLists();

  const [isWhitelistDialogOpen, setIsWhitelistDialogOpen] = useState(false);
  const [isBlocklistDialogOpen, setIsBlocklistDialogOpen] = useState(false);

  // Form state - separate for each dialog
  const [whitelistItem, setWhitelistItem] = useState({ name: '', pattern: '' });
  const [blocklistItem, setBlocklistItem] = useState({ name: '', pattern: '' });

  // Search and selection state
  const [whitelistSearch, setWhitelistSearch] = useState('');
  const [blocklistSearch, setBlocklistSearch] = useState('');
  const [selectedWhitelistItems, setSelectedWhitelistItems] = useState<Set<string>>(new Set());
  const [selectedBlocklistItems, setSelectedBlocklistItems] = useState<Set<string>>(new Set());

  
  // Handle adding multiple pre-populated items
  const handleAddSelectedWhitelistItems = () => {
    selectedWhitelistItems.forEach(itemId => {
      const item = WHITELIST_OPTIONS.find(opt => opt.id === itemId);
      if (item) {
        addToWhitelist({
          name: item.name,
          pattern: item.pattern,
          icon: item.icon,
        });
      }
    });
    setSelectedWhitelistItems(new Set());
    setIsWhitelistDialogOpen(false);
  };

  const handleAddSelectedBlocklistItems = () => {
    selectedBlocklistItems.forEach(itemId => {
      const item = BLOCKLIST_OPTIONS.find(opt => opt.id === itemId);
      if (item) {
        addToBlocklist({
          name: item.name,
          pattern: item.pattern,
          icon: item.icon,
        });
      }
    });
    setSelectedBlocklistItems(new Set());
    setIsBlocklistDialogOpen(false);
  };

  // Handle single item selection
  const handleWhitelistItemToggle = (itemId: string) => {
    const newSelected = new Set(selectedWhitelistItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedWhitelistItems(newSelected);
  };

  const handleBlocklistItemToggle = (itemId: string) => {
    const newSelected = new Set(selectedBlocklistItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedBlocklistItems(newSelected);
  };

  // Handle custom keyword addition
  const handleAddCustomWhitelist = () => {
    if (whitelistItem.name.trim()) {
      const keyword = whitelistItem.name.trim();
      const icon = findIconForName(keyword);
      addToWhitelist({
        name: keyword,
        pattern: keyword.toLowerCase(),
        icon: icon,
      });
      setWhitelistItem({ name: '', pattern: '' });
    }
  };

  const handleAddCustomBlocklist = () => {
    if (blocklistItem.name.trim()) {
      const keyword = blocklistItem.name.trim();
      const icon = findIconForName(keyword);
      addToBlocklist({
        name: keyword,
        pattern: keyword.toLowerCase(),
        icon: icon,
      });
      setBlocklistItem({ name: '', pattern: '' });
    }
  };

  // Filter options based on search
  const filteredWhitelistOptions = WHITELIST_OPTIONS.filter(item =>
    item.name.toLowerCase().includes(whitelistSearch.toLowerCase()) ||
    item.category.toLowerCase().includes(whitelistSearch.toLowerCase()) ||
    item.description.toLowerCase().includes(whitelistSearch.toLowerCase())
  );

  const filteredBlocklistOptions = BLOCKLIST_OPTIONS.filter(item =>
    item.name.toLowerCase().includes(blocklistSearch.toLowerCase()) ||
    item.category.toLowerCase().includes(blocklistSearch.toLowerCase()) ||
    item.description.toLowerCase().includes(blocklistSearch.toLowerCase())
  );

  const getIcon = (iconName?: string) => {
    if (!iconName) return null;
    const IconComponent = (SimpleIcons as any)[iconName];
    if (!IconComponent) return null;
    return <IconComponent className="w-5 h-5" />;
  };

  // Function to find an icon for a given app/website name
  const findIconForName = (name: string) => {
    const lowerName = name.toLowerCase().replace(/[^a-z0-9]/g, '');

    // Common icon mappings
    const iconMap: { [key: string]: string } = {
      'chrome': 'SiGooglechrome',
      'firefox': 'SiFirefox',
      'safari': 'SiSafari',
      'edge': 'SiMicrosoftedge',
      'code': 'SiVisualstudiocode',
      'vscode': 'SiVisualstudiocode',
      'notion': 'SiNotion',
      'slack': 'SiSlack',
      'discord': 'SiDiscord',
      'telegram': 'SiTelegram',
      'whatsapp': 'SiWhatsapp',
      'spotify': 'SiSpotify',
      'youtube': 'SiYoutube',
      'instagram': 'SiInstagram',
      'facebook': 'SiFacebook',
      'twitter': 'SiTwitter',
      'x': 'SiX',
      'tiktok': 'SiTiktok',
      'linkedin': 'SiLinkedin',
      'github': 'SiGithub',
      'gitlab': 'SiGitlab',
      'figma': 'SiFigma',
      'sketch': 'SiSketch',
      'photoshop': 'SiAdobephotoshop',
      'illustrator': 'SiAdobeillustrator',
      'zoom': 'SiZoom',
      'teams': 'SiMicrosoftteams',
      'outlook': 'SiMicrosoftoutlook',
      'excel': 'SiMicrosoftexcel',
      'word': 'SiMicrosoftword',
      'powerpoint': 'SiMicrosoftpowerpoint',
      'jira': 'SiJira',
      'trello': 'SiTrello',
      'asana': 'SiAsana',
      'netflix': 'SiNetflix',
      'twitch': 'SiTwitch',
      'steam': 'SiSteam',
      'epic': 'SiEpicgames',
      'roblox': 'SiRoblox',
      'minecraft': 'SiMinecraft',
      'calm': 'SiCalm',
      'headspace': 'SiHeadspace',
      'reddit': 'SiReddit',
      'stackoverflow': 'SiStackoverflow',
      'medium': 'SiMedium',
    };

    // First try exact match
    if (iconMap[lowerName]) {
      return iconMap[lowerName];
    }

    // Try partial matches
    for (const [key, icon] of Object.entries(iconMap)) {
      if (lowerName.includes(key) || key.includes(lowerName)) {
        return icon;
      }
    }

    // Try to find icon in SimpleIcons directly
    const iconName = 'Si' + name.charAt(0).toUpperCase() + name.slice(1).replace(/[^a-zA-Z0-9]/g, '');
    if ((SimpleIcons as any)[iconName]) {
      return iconName;
    }

    return null; // No icon found
  };

  // Component for app list items
  const AppListItem = ({ item, isSelected, onToggle }: {
    item: AppOption;
    isSelected: boolean;
    onToggle: () => void;
  }) => {
    const IconComponent = (SimpleIcons as any)[item.icon];

    return (
      <button
        onClick={onToggle}
        className={`w-full p-3 rounded-xl border-2 transition-all text-left ${
          isSelected
            ? 'border-mint bg-mint/5'
            : theme === 'dark'
              ? 'border-border hover:border-mint/50 hover:bg-muted/30'
              : 'border-gray-200 hover:border-mint/50 hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            CATEGORY_COLORS[item.category] || 'text-gray-500 bg-gray-500/10'
          }`}>
            {IconComponent ? (
              <IconComponent className="w-5 h-5" />
            ) : (
              <div className="w-5 h-5 bg-current rounded" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-foreground truncate">{item.name}</h4>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                CATEGORY_COLORS[item.category] || 'text-gray-500 bg-gray-500/10'
              }`}>
                {item.category}
              </span>
            </div>
            <p className="text-sm text-muted-foreground truncate">{item.description}</p>
          </div>
          <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
            isSelected
              ? 'border-mint bg-mint text-white'
              : theme === 'dark'
                ? 'border-border bg-muted'
                : 'border-gray-300 bg-white'
          }`}>
            {isSelected && <Check className="w-4 h-4" />}
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className={`h-16 border-b flex items-center justify-between px-6 ${
          theme === 'dark' ? 'bg-card border-border' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'text-purple-200 hover:text-white hover:bg-purple-900'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold">Lists Management</h1>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Whitelist Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold">Whitelist</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Apps and websites that are always allowed (bypass AI checking)
                  </p>
                </div>
                <Dialog
                  open={isWhitelistDialogOpen}
                  onOpenChange={(open) => {
                    setIsWhitelistDialogOpen(open);
                    if (!open) {
                      setWhitelistSearch('');
                      setSelectedWhitelistItems(new Set());
                      setWhitelistItem({ name: '', pattern: '' });
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      className="rounded-xl bg-mint hover:bg-mint/90"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add to Whitelist
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                    <DialogHeader>
                      <DialogTitle>Add to Whitelist</DialogTitle>
                      <DialogDescription>
                        Select apps and websites that should always be allowed
                      </DialogDescription>
                    </DialogHeader>

                    {/* Search Bar */}
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search apps or categories..."
                        value={whitelistSearch}
                        onChange={(e) => setWhitelistSearch(e.target.value)}
                        className="pl-10 rounded-xl"
                      />
                    </div>

                    {/* App List */}
                    <div className="flex-1 overflow-y-auto space-y-2 mb-4 min-h-0">
                      {filteredWhitelistOptions.map((item) => (
                        <AppListItem
                          key={item.id}
                          item={item}
                          isSelected={selectedWhitelistItems.has(item.id)}
                          onToggle={() => handleWhitelistItemToggle(item.id)}
                        />
                      ))}
                    </div>

                    {/* Custom Input */}
                    <div className="border-t pt-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add custom app or keyword..."
                          value={whitelistItem.name}
                          onChange={(e) => setWhitelistItem({ ...whitelistItem, name: e.target.value })}
                          className="rounded-xl flex-1"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleAddCustomWhitelist();
                            }
                          }}
                        />
                        <Button
                          onClick={handleAddCustomWhitelist}
                          disabled={!whitelistItem.name.trim()}
                          className="rounded-xl bg-mint hover:bg-mint/90"
                        >
                          <PlusCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-4 pt-4 border-t">
                      <Button
                        onClick={handleAddSelectedWhitelistItems}
                        disabled={selectedWhitelistItems.size === 0}
                        className="flex-1 rounded-xl bg-mint hover:bg-mint/90"
                      >
                        Add {selectedWhitelistItems.size} Selected
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsWhitelistDialogOpen(false);
                          setSelectedWhitelistItems(new Set());
                          setWhitelistItem({ name: '', pattern: '' });
                        }}
                        className="rounded-xl"
                      >
                        Cancel
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className={`rounded-2xl border ${
                theme === 'dark' ? 'bg-card border-border' : 'bg-white border-gray-200'
              }`}>
                <div className="divide-y divide-border">
                  {whitelist.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      No whitelist entries yet. Add apps or websites that should always be allowed.
                    </div>
                  ) : (
                    whitelist.map((item) => (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between p-4 hover:bg-accent/50 transition-colors ${
                          theme === 'dark' ? '' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-mint/10 flex items-center justify-center text-mint">
                            {getIcon(item.icon) || <Plus className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Pattern: {item.pattern}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removeFromWhitelist(item.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Blocklist Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold">Blocklist</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Apps and websites that are always blocked (never allowed)
                  </p>
                </div>
                <Dialog
                  open={isBlocklistDialogOpen}
                  onOpenChange={(open) => {
                    setIsBlocklistDialogOpen(open);
                    if (!open) {
                      setBlocklistSearch('');
                      setSelectedBlocklistItems(new Set());
                      setBlocklistItem({ name: '', pattern: '' });
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-xl border-red-500 text-red-500 hover:bg-red-500/10"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add to Blocklist
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                    <DialogHeader>
                      <DialogTitle>Add to Blocklist</DialogTitle>
                      <DialogDescription>
                        Select apps and websites that should always be blocked
                      </DialogDescription>
                    </DialogHeader>

                    {/* Search Bar */}
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search apps or categories..."
                        value={blocklistSearch}
                        onChange={(e) => setBlocklistSearch(e.target.value)}
                        className="pl-10 rounded-xl"
                      />
                    </div>

                    {/* App List */}
                    <div className="flex-1 overflow-y-auto space-y-2 mb-4 min-h-0">
                      {filteredBlocklistOptions.map((item) => (
                        <AppListItem
                          key={item.id}
                          item={item}
                          isSelected={selectedBlocklistItems.has(item.id)}
                          onToggle={() => handleBlocklistItemToggle(item.id)}
                        />
                      ))}
                    </div>

                    {/* Custom Input */}
                    <div className="border-t pt-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add custom app or keyword..."
                          value={blocklistItem.name}
                          onChange={(e) => setBlocklistItem({ ...blocklistItem, name: e.target.value })}
                          className="rounded-xl flex-1"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleAddCustomBlocklist();
                            }
                          }}
                        />
                        <Button
                          onClick={handleAddCustomBlocklist}
                          disabled={!blocklistItem.name.trim()}
                          className="rounded-xl bg-red-500 hover:bg-red-600 text-white"
                        >
                          <PlusCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-4 pt-4 border-t">
                      <Button
                        onClick={handleAddSelectedBlocklistItems}
                        disabled={selectedBlocklistItems.size === 0}
                        className="flex-1 rounded-xl bg-red-500 hover:bg-red-600 text-white"
                      >
                        Block {selectedBlocklistItems.size} Selected
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsBlocklistDialogOpen(false);
                          setSelectedBlocklistItems(new Set());
                          setBlocklistItem({ name: '', pattern: '' });
                        }}
                        className="rounded-xl"
                      >
                        Cancel
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className={`rounded-2xl border ${
                theme === 'dark' ? 'bg-card border-border' : 'bg-white border-gray-200'
              }`}>
                <div className="divide-y divide-border">
                  {blocklist.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      No blocklist entries yet. Add apps or websites that should always be blocked.
                    </div>
                  ) : (
                    blocklist.map((item) => (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between p-4 hover:bg-accent/50 transition-colors ${
                          theme === 'dark' ? '' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                            {getIcon(item.icon) || <X className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Pattern: {item.pattern}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removeFromBlocklist(item.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Lists;
