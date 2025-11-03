import { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import * as SimpleIcons from 'react-icons/si';
import { useTheme } from '@/contexts/ThemeContext';
import { useLists } from '@/contexts/ListsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const Lists = () => {
  const { theme } = useTheme();
  const { whitelist, blocklist, addToWhitelist, addToBlocklist, removeFromWhitelist, removeFromBlocklist } = useLists();

  const [isWhitelistDialogOpen, setIsWhitelistDialogOpen] = useState(false);
  const [isBlocklistDialogOpen, setIsBlocklistDialogOpen] = useState(false);

  // Form state
  const [newItemName, setNewItemName] = useState('');
  const [newItemType, setNewItemType] = useState<'app' | 'website'>('app');
  const [newItemPattern, setNewItemPattern] = useState('');

  const handleAddToWhitelist = () => {
    if (newItemName && newItemPattern) {
      addToWhitelist({
        name: newItemName,
        type: newItemType,
        pattern: newItemPattern,
      });
      // Reset form
      setNewItemName('');
      setNewItemPattern('');
      setNewItemType('app');
      setIsWhitelistDialogOpen(false);
    }
  };

  const handleAddToBlocklist = () => {
    if (newItemName && newItemPattern) {
      addToBlocklist({
        name: newItemName,
        type: newItemType,
        pattern: newItemPattern,
      });
      // Reset form
      setNewItemName('');
      setNewItemPattern('');
      setNewItemType('app');
      setIsBlocklistDialogOpen(false);
    }
  };

  const getIcon = (iconName?: string) => {
    if (!iconName) return null;
    const IconComponent = (SimpleIcons as any)[iconName];
    if (!IconComponent) return null;
    return <IconComponent className="w-5 h-5" />;
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
                <Dialog open={isWhitelistDialogOpen} onOpenChange={setIsWhitelistDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      className="rounded-xl bg-mint hover:bg-mint/90"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add to Whitelist
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add to Whitelist</DialogTitle>
                      <DialogDescription>
                        Add an app or website that should always be allowed
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Name</label>
                        <Input
                          placeholder="e.g., Notion"
                          value={newItemName}
                          onChange={(e) => setNewItemName(e.target.value)}
                          className="rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Type</label>
                        <Select
                          value={newItemType}
                          onValueChange={(value: 'app' | 'website') => setNewItemType(value)}
                        >
                          <SelectTrigger className="rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="app">App</SelectItem>
                            <SelectItem value="website">Website</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Pattern</label>
                        <Input
                          placeholder="e.g., notion (matches window title, app name, or URL)"
                          value={newItemPattern}
                          onChange={(e) => setNewItemPattern(e.target.value)}
                          className="rounded-xl"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Use | to separate multiple patterns (e.g., "notion|notes")
                        </p>
                      </div>
                      <Button
                        onClick={handleAddToWhitelist}
                        className="w-full rounded-xl bg-mint hover:bg-mint/90"
                      >
                        Add to Whitelist
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
                              {item.type === 'app' ? 'Application' : 'Website'} • Pattern: {item.pattern}
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
                <Dialog open={isBlocklistDialogOpen} onOpenChange={setIsBlocklistDialogOpen}>
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
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add to Blocklist</DialogTitle>
                      <DialogDescription>
                        Add an app or website that should always be blocked
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Name</label>
                        <Input
                          placeholder="e.g., Instagram"
                          value={newItemName}
                          onChange={(e) => setNewItemName(e.target.value)}
                          className="rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Type</label>
                        <Select
                          value={newItemType}
                          onValueChange={(value: 'app' | 'website') => setNewItemType(value)}
                        >
                          <SelectTrigger className="rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="app">App</SelectItem>
                            <SelectItem value="website">Website</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Pattern</label>
                        <Input
                          placeholder="e.g., instagram (matches window title, app name, or URL)"
                          value={newItemPattern}
                          onChange={(e) => setNewItemPattern(e.target.value)}
                          className="rounded-xl"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Use | to separate multiple patterns (e.g., "instagram|insta")
                        </p>
                      </div>
                      <Button
                        onClick={handleAddToBlocklist}
                        className="w-full rounded-xl bg-red-500 hover:bg-red-600 text-white"
                      >
                        Add to Blocklist
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
                              {item.type === 'app' ? 'Application' : 'Website'} • Pattern: {item.pattern}
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
