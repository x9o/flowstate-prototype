export interface RecentTask {
  id: string;
  title: string;
  color: 'mint' | 'indigo' | 'peach' | 'sky' | 'lavender';
  lastUsed: number;
  usageCount: number;
  estimatedTime?: number; // in minutes
  category?: string;
  tags?: string[];
}