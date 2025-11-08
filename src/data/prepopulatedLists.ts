export interface AppOption {
  id: string;
  name: string;
  icon: string;
  category: string;
  description: string;
  pattern: string;
}

// Whitelist - Productive apps and websites
export const WHITELIST_OPTIONS: AppOption[] = [
  // Development Tools
  {
    id: 'vscode',
    name: 'Visual Studio Code',
    icon: 'SiVisualstudiocode',
    category: 'Development',
    description: 'Code editor for development',
    pattern: 'vscode|visual studio code'
  },
  {
    id: 'jetbrains',
    name: 'JetBrains IDEs',
    icon: 'SiJetbrains',
    category: 'Development',
    description: 'Professional development IDEs',
    pattern: 'intellij|webstorm|pycharm|phpstorm|rubymine|goland|rider'
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: 'SiGithub',
    category: 'Development',
    description: 'Code repository and collaboration',
    pattern: 'github|gitlab'
  },
  {
    id: 'stackoverflow',
    name: 'Stack Overflow',
    icon: 'SiStackoverflow',
    category: 'Development',
    description: 'Programming Q&A and help',
    pattern: 'stackoverflow|devdocs'
  },
  {
    id: 'docker',
    name: 'Docker',
    icon: 'SiDocker',
    category: 'Development',
    description: 'Containerization platform',
    pattern: 'docker'
  },
  {
    id: 'postman',
    name: 'Postman',
    icon: 'SiPostman',
    category: 'Development',
    description: 'API testing and development',
    pattern: 'postman'
  },
  {
    id: 'figma',
    name: 'Figma',
    icon: 'SiFigma',
    category: 'Design',
    description: 'Design and prototyping tool',
    pattern: 'figma|sketch'
  },
  {
    id: 'notion',
    name: 'Notion',
    icon: 'SiNotion',
    category: 'Productivity',
    description: 'Note-taking and project management',
    pattern: 'notion|obsidian|roam'
  },
  {
    id: 'trello',
    name: 'Trello',
    icon: 'SiTrello',
    category: 'Productivity',
    description: 'Project management and task tracking',
    pattern: 'trello|asana|jira|linear|clickup'
  },
  {
    id: 'miro',
    name: 'Miro',
    icon: 'SiMiro',
    category: 'Productivity',
    description: 'Online collaborative whiteboard',
    pattern: 'miro|miro.com'
  },
  {
    id: 'evernote',
    name: 'Evernote',
    icon: 'SiEvernote',
    category: 'Productivity',
    description: 'Note-taking and organization',
    pattern: 'evernote'
  },
  {
    id: 'docs',
    name: 'Google Docs',
    icon: 'SiGoogledocs',
    category: 'Productivity',
    description: 'Document creation and editing',
    pattern: 'docs.google.com|google docs'
  },
  {
    id: 'sheets',
    name: 'Google Sheets',
    icon: 'SiGooglesheets',
    category: 'Productivity',
    description: 'Spreadsheet creation and editing',
    pattern: 'sheets.google.com|google sheets'
  },
  {
    id: 'msoffice',
    name: 'Microsoft Office',
    icon: 'SiMicrosoftoffice',
    category: 'Productivity',
    description: 'Productivity suite (Word, Excel, PowerPoint)',
    pattern: 'word|excel|powerpoint'
  },
  {
    id: 'slack',
    name: 'Slack',
    icon: 'SiSlack',
    category: 'Communication',
    description: 'Team communication and collaboration',
    pattern: 'slack|teams'
  },
  {
    id: 'discord',
    name: 'Discord',
    icon: 'SiDiscord',
    category: 'Communication',
    description: 'Community and team communication',
    pattern: 'discord|discord.com'
  },
  {
    id: 'zoom',
    name: 'Zoom',
    icon: 'SiZoom',
    category: 'Communication',
    description: 'Video conferencing and meetings',
    pattern: 'zoom|zoom.us'
  },
  {
    id: 'outlook',
    name: 'Microsoft Outlook',
    icon: 'SiMicrosoftoutlook',
    category: 'Communication',
    description: 'Email and calendar management',
    pattern: 'outlook|mail.google.com|gmail'
  },
  {
    id: 'chrome',
    name: 'Chrome',
    icon: 'SiGooglechrome',
    category: 'Browser',
    description: 'Web browser for research and work',
    pattern: 'chrome|firefox|safari|edge'
  },
  {
    id: 'terminal',
    name: 'Terminal',
    icon: 'SiWindowsterminal',
    category: 'Development',
    description: 'Command line interface',
    pattern: 'terminal|powershell|bash|zsh|iterm'
  },
  {
    id: 'file',
    name: 'File Explorer',
    icon: 'SiFilezilla',
    category: 'System',
    description: 'File management and organization',
    pattern: 'explorer|finder|file manager'
  },
  {
    id: 'photoshop',
    name: 'Adobe Photoshop',
    icon: 'SiAdobephotoshop',
    category: 'Design',
    description: 'Image editing and design',
    pattern: 'photoshop|adobe photoshop'
  },
  {
    id: 'wikipedia',
    name: 'Wikipedia',
    icon: 'SiWikipedia',
    category: 'Research',
    description: 'Online encyclopedia and research',
    pattern: 'wikipedia|wiki'
  },
  {
    id: 'research',
    name: 'Academic Research',
    icon: 'SiGooglescholar',
    category: 'Research',
    description: 'Academic and scholarly research',
    pattern: 'scholar|jstor|arxiv|researchgate'
  },
  {
    id: 'mdn',
    name: 'MDN Web Docs',
    icon: 'SiMdnwebdocs',
    category: 'Development',
    description: 'Web development documentation',
    pattern: 'developer.mozilla.org'
  },
];

// Blocklist - Distracting apps and websites
export const BLOCKLIST_OPTIONS: AppOption[] = [
  // Social Media
  {
    id: 'instagram',
    name: 'Instagram',
    icon: 'SiInstagram',
    category: 'Social Media',
    description: 'Photo and video sharing platform',
    pattern: 'instagram|insta'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: 'SiFacebook',
    category: 'Social Media',
    description: 'Social networking platform',
    pattern: 'facebook|fb.com'
  },
  {
    id: 'twitter',
    name: 'Twitter/X',
    icon: 'SiTwitter',
    category: 'Social Media',
    description: 'Microblogging and social platform',
    pattern: 'twitter|x.com'
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: 'SiTiktok',
    category: 'Social Media',
    description: 'Short video entertainment platform',
    pattern: 'tiktok|musical.ly'
  },
  {
    id: 'linkedin-social',
    name: 'LinkedIn (Social)',
    icon: 'SiLinkedin',
    category: 'Social Media',
    description: 'Professional social networking feed',
    pattern: 'linkedin.com/feed|linkedin.com/news'
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    icon: 'SiPinterest',
    category: 'Social Media',
    description: 'Visual discovery and bookmarking',
    pattern: 'pinterest|pinterest.com'
  },
  {
    id: 'snapchat',
    name: 'Snapchat',
    icon: 'SiSnapchat',
    category: 'Social Media',
    description: 'Multimedia messaging app',
    pattern: 'snapchat|snap.com'
  },
  {
    id: 'tumblr',
    name: 'Tumblr',
    icon: 'SiTumblr',
    category: 'Social Media',
    description: 'Microblogging and social networking',
    pattern: 'tumblr|tumblr.com'
  },
  // Entertainment
  {
    id: 'youtube',
    name: 'YouTube',
    icon: 'SiYoutube',
    category: 'Entertainment',
    description: 'Video streaming and entertainment',
    pattern: 'youtube|youtu.be'
  },
  {
    id: 'reddit',
    name: 'Reddit',
    icon: 'SiReddit',
    category: 'Entertainment',
    description: 'Social news and entertainment',
    pattern: 'reddit|reddit.com'
  },
  {
    id: 'netflix',
    name: 'Netflix',
    icon: 'SiNetflix',
    category: 'Entertainment',
    description: 'Streaming video entertainment',
    pattern: 'netflix|netflix.com'
  },
  {
    id: 'hulu',
    name: 'Hulu',
    icon: 'SiHulu',
    category: 'Entertainment',
    description: 'Streaming video service',
    pattern: 'hulu|hulu.com'
  },
  {
    id: 'disneyplus',
    name: 'Disney+',
    icon: 'SiDisneyplus',
    category: 'Entertainment',
    description: 'Streaming service from Disney',
    pattern: 'disneyplus|disney\\+'
  },
  {
    id: 'primevideo',
    name: 'Amazon Prime Video',
    icon: 'SiAmazonprime',
    category: 'Entertainment',
    description: 'Streaming video service from Amazon',
    pattern: 'primevideo|amazon.com/video'
  },
  {
    id: 'twitch',
    name: 'Twitch',
    icon: 'SiTwitch',
    category: 'Entertainment',
    description: 'Live streaming gaming platform',
    pattern: 'twitch|twitch.tv'
  },
  {
    id: 'spotify',
    name: 'Spotify',
    icon: 'SiSpotify',
    category: 'Entertainment',
    description: 'Music streaming service',
    pattern: 'spotify|spotify.com'
  },
  {
    id: '9gag',
    name: '9GAG',
    icon: 'Si9gag',
    category: 'Entertainment',
    description: 'Online platform for humorous content',
    pattern: '9gag|9gag.com'
  },
  {
    id: 'buzzfeed',
    name: 'BuzzFeed',
    icon: 'SiBuzzfeed',
    category: 'Entertainment',
    description: 'Internet media and entertainment company',
    pattern: 'buzzfeed|buzzfeed.com'
  },
  // Gaming
  {
    id: 'steam',
    name: 'Steam',
    icon: 'SiSteam',
    category: 'Gaming',
    description: 'Gaming platform and store',
    pattern: 'steam|steamcommunity.com'
  },
  {
    id: 'epic',
    name: 'Epic Games',
    icon: 'SiEpicgames',
    category: 'Gaming',
    description: 'Gaming platform and launcher',
    pattern: 'epicgames|epicgames.com'
  },
  {
    id: 'roblox',
    name: 'Roblox',
    icon: 'SiRoblox',
    category: 'Gaming',
    description: 'Online gaming platform',
    pattern: 'roblox|roblox.com'
  },
  {
    id: 'minecraft',
    name: 'Minecraft',
    icon: 'SiMinecraft',
    category: 'Gaming',
    description: 'Sandbox video game',
    pattern: 'minecraft|mojang'
  },
  {
    id: 'gog',
    name: 'GOG.com',
    icon: 'SiGogdotcom',
    category: 'Gaming',
    description: 'Digital distribution platform for games',
    pattern: 'gog.com'
  },
  {
    id: 'battlenet',
    name: 'Battle.net',
    icon: 'SiBattledotnet',
    category: 'Gaming',
    description: 'Online gaming service by Blizzard',
    pattern: 'battle.net'
  },
  // Messaging
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: 'SiWhatsapp',
    category: 'Messaging',
    description: 'Cross-platform messaging service',
    pattern: 'whatsapp|web.whatsapp.com'
  },
  {
    id: 'messenger',
    name: 'Facebook Messenger',
    icon: 'SiMessenger',
    category: 'Messaging',
    description: 'Messaging app by Facebook',
    pattern: 'messenger.com'
  },
  {
    id: 'telegram-social',
    name: 'Telegram (Social)',
    icon: 'SiTelegram',
    category: 'Messaging',
    description: 'Social messaging and groups',
    pattern: 'telegram'
  }
];

// Category colors for styling
export const CATEGORY_COLORS = {
  'Development': 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  'Design': 'text-purple-500 bg-purple-500/10 border-purple-500/20',
  'Productivity': 'text-green-500 bg-green-500/10 border-green-500/20',
  'Communication': 'text-sky-500 bg-sky-500/10 border-sky-500/20',
  'Browser': 'text-orange-500 bg-orange-500/10 border-orange-500/20',
  'System': 'text-gray-500 bg-gray-500/10 border-gray-500/20',
  'Research': 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
  'Social Media': 'text-pink-500 bg-pink-500/10 border-pink-500/20',
  'Entertainment': 'text-red-500 bg-red-500/10 border-red-500/20',
  'Gaming': 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  'Messaging': 'text-teal-500 bg-teal-500/10 border-teal-500/20',
} as const;