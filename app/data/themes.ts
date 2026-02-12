export interface Theme {
    id: string;
    name: string;
    category: 'Solid' | 'Gradient' | 'Glass' | 'Abstract' | 'Artistic' | 'Seasonal';
    base: 'light' | 'dark';
    colors: {
        '--bg-primary': string;
        '--bg-secondary': string;
        '--bg-tertiary': string;
        '--text-primary': string;
        '--text-secondary': string;
        '--text-tertiary': string;
        '--accent-primary': string;
        '--accent-secondary': string;
        '--border-color': string;
        '--glass-bg'?: string;
        '--glass-border'?: string;
        '--glass-shadow'?: string;
    };
    styles?: Record<string, string>; // For additional CSS overrides (e.g. background-image)
}

export const THEMES: Theme[] = [
    // --- SOLID COLORS (LIGHT) ---
    {
        id: 'light-default',
        name: 'Light Default',
        category: 'Solid',
        base: 'light',
        colors: {
            '--bg-primary': '#ffffff',
            '--bg-secondary': '#f3f4f6',
            '--bg-tertiary': '#e5e7eb',
            '--text-primary': '#1f2937',
            '--text-secondary': '#4b5563',
            '--text-tertiary': '#9ca3af',
            '--accent-primary': '#3b82f6',
            '--accent-secondary': '#60a5fa',
            '--border-color': '#e5e7eb',
        }
    },
    {
        id: 'light-slate',
        name: 'Slate Light',
        category: 'Solid',
        base: 'light',
        colors: {
            '--bg-primary': '#f8fafc',
            '--bg-secondary': '#e2e8f0',
            '--bg-tertiary': '#cbd5e1',
            '--text-primary': '#0f172a',
            '--text-secondary': '#334155',
            '--text-tertiary': '#64748b',
            '--accent-primary': '#475569',
            '--accent-secondary': '#64748b',
            '--border-color': '#cbd5e1',
        }
    },
    {
        id: 'light-blue',
        name: 'Sky Blue',
        category: 'Solid',
        base: 'light',
        colors: {
            '--bg-primary': '#f0f9ff',
            '--bg-secondary': '#e0f2fe',
            '--bg-tertiary': '#bae6fd',
            '--text-primary': '#0c4a6e',
            '--text-secondary': '#0369a1',
            '--text-tertiary': '#0284c7',
            '--accent-primary': '#0ea5e9',
            '--accent-secondary': '#38bdf8',
            '--border-color': '#bae6fd',
        }
    },
    {
        id: 'light-green',
        name: 'Mint Fresh',
        category: 'Solid',
        base: 'light',
        colors: {
            '--bg-primary': '#f0fdf4',
            '--bg-secondary': '#dcfce7',
            '--bg-tertiary': '#bbf7d0',
            '--text-primary': '#14532d',
            '--text-secondary': '#166534',
            '--text-tertiary': '#15803d',
            '--accent-primary': '#22c55e',
            '--accent-secondary': '#4ade80',
            '--border-color': '#bbf7d0',
        }
    },
    {
        id: 'light-rose',
        name: 'Rose Petal',
        category: 'Solid',
        base: 'light',
        colors: {
            '--bg-primary': '#fff1f2',
            '--bg-secondary': '#ffe4e6',
            '--bg-tertiary': '#fecdd3',
            '--text-primary': '#881337',
            '--text-secondary': '#9f1239',
            '--text-tertiary': '#be123c',
            '--accent-primary': '#f43f5e',
            '--accent-secondary': '#fb7185',
            '--border-color': '#fecdd3',
        }
    },
    {
        id: 'light-amber',
        name: 'Warm Amber',
        category: 'Solid',
        base: 'light',
        colors: {
            '--bg-primary': '#fffbeb',
            '--bg-secondary': '#fef3c7',
            '--bg-tertiary': '#fde68a',
            '--text-primary': '#78350f',
            '--text-secondary': '#92400e',
            '--text-tertiary': '#b45309',
            '--accent-primary': '#f59e0b',
            '--accent-secondary': '#fbbf24',
            '--border-color': '#fde68a',
        }
    },
    {
        id: 'light-violet',
        name: 'Soft Violet',
        category: 'Solid',
        base: 'light',
        colors: {
            '--bg-primary': '#f5f3ff',
            '--bg-secondary': '#ede9fe',
            '--bg-tertiary': '#ddd6fe',
            '--text-primary': '#4c1d95',
            '--text-secondary': '#5b21b6',
            '--text-tertiary': '#6d28d9',
            '--accent-primary': '#8b5cf6',
            '--accent-secondary': '#a78bfa',
            '--border-color': '#ddd6fe',
        }
    },

    // --- SOLID COLORS (DARK) ---
    {
        id: 'dark-default',
        name: 'Dark Default',
        category: 'Solid',
        base: 'dark',
        colors: {
            '--bg-primary': '#111827',
            '--bg-secondary': '#1f2937',
            '--bg-tertiary': '#374151',
            '--text-primary': '#f9fafb',
            '--text-secondary': '#d1d5db',
            '--text-tertiary': '#9ca3af',
            '--accent-primary': '#60a5fa',
            '--accent-secondary': '#3b82f6',
            '--border-color': '#374151',
        }
    },
    {
        id: 'dark-zinc',
        name: 'Zinc Dark',
        category: 'Solid',
        base: 'dark',
        colors: {
            '--bg-primary': '#18181b',
            '--bg-secondary': '#27272a',
            '--bg-tertiary': '#3f3f46',
            '--text-primary': '#fafafa',
            '--text-secondary': '#e4e4e7',
            '--text-tertiary': '#a1a1aa',
            '--accent-primary': '#a1a1aa',
            '--accent-secondary': '#71717a',
            '--border-color': '#3f3f46',
        }
    },
    {
        id: 'dark-blue',
        name: 'Deep Ocean',
        category: 'Solid',
        base: 'dark',
        colors: {
            '--bg-primary': '#0f172a',
            '--bg-secondary': '#1e293b',
            '--bg-tertiary': '#334155',
            '--text-primary': '#f8fafc',
            '--text-secondary': '#cbd5e1',
            '--text-tertiary': '#94a3b8',
            '--accent-primary': '#38bdf8',
            '--accent-secondary': '#0ea5e9',
            '--border-color': '#334155',
        }
    },
    {
        id: 'dark-green',
        name: 'Forest Night',
        category: 'Solid',
        base: 'dark',
        colors: {
            '--bg-primary': '#052e16',
            '--bg-secondary': '#064e3b',
            '--bg-tertiary': '#065f46',
            '--text-primary': '#ecfdf5',
            '--text-secondary': '#d1fae5',
            '--text-tertiary': '#6ee7b7',
            '--accent-primary': '#34d399',
            '--accent-secondary': '#10b981',
            '--border-color': '#065f46',
        }
    },
    {
        id: 'dark-purple',
        name: 'Midnight Void',
        category: 'Solid',
        base: 'dark',
        colors: {
            '--bg-primary': '#2e1065',
            '--bg-secondary': '#4c1d95',
            '--bg-tertiary': '#5b21b6',
            '--text-primary': '#f5f3ff',
            '--text-secondary': '#ede9fe',
            '--text-tertiary': '#c4b5fd',
            '--accent-primary': '#a78bfa',
            '--accent-secondary': '#8b5cf6',
            '--border-color': '#5b21b6',
        }
    },
    {
        id: 'dark-red',
        name: 'Crimson Dark',
        category: 'Solid',
        base: 'dark',
        colors: {
            '--bg-primary': '#450a0a',
            '--bg-secondary': '#7f1d1d',
            '--bg-tertiary': '#991b1b',
            '--text-primary': '#fef2f2',
            '--text-secondary': '#fee2e2',
            '--text-tertiary': '#fca5a5',
            '--accent-primary': '#f87171',
            '--accent-secondary': '#ef4444',
            '--border-color': '#991b1b',
        }
    },
    {
        id: 'dark-orange',
        name: 'Burnt Orange',
        category: 'Solid',
        base: 'dark',
        colors: {
            '--bg-primary': '#431407',
            '--bg-secondary': '#7c2d12',
            '--bg-tertiary': '#9a3412',
            '--text-primary': '#fff7ed',
            '--text-secondary': '#ffedd5',
            '--text-tertiary': '#fdba74',
            '--accent-primary': '#fb923c',
            '--accent-secondary': '#f97316',
            '--border-color': '#9a3412',
        }
    },

    // --- GRADIENTS (Simulated with rich colors) ---
    {
        id: 'grad-sunset',
        name: 'Sunset Blvd',
        category: 'Gradient',
        base: 'dark',
        colors: {
            '--bg-primary': '#2a1b3d',
            '--bg-secondary': '#44318d',
            '--bg-tertiary': '#8265a7',
            '--text-primary': '#ffffff',
            '--text-secondary': '#e4d3f4',
            '--text-tertiary': '#a4b3b6',
            '--accent-primary': '#d83f87',
            '--accent-secondary': '#e98074',
            '--border-color': '#44318d',
        }
    },
    {
        id: 'grad-ocean',
        name: 'Ocean Depths',
        category: 'Gradient',
        base: 'dark',
        colors: {
            '--bg-primary': '#021024',
            '--bg-secondary': '#052659',
            '--bg-tertiary': '#5483b3',
            '--text-primary': '#c1e8ff',
            '--text-secondary': '#7da0ca',
            '--text-tertiary': '#5483b3',
            '--accent-primary': '#7da0ca',
            '--accent-secondary': '#c1e8ff',
            '--border-color': '#052659',
        }
    },
    {
        id: 'grad-forest',
        name: 'Mystic Forest',
        category: 'Gradient',
        base: 'dark',
        colors: {
            '--bg-primary': '#1a2f23',
            '--bg-secondary': '#244530',
            '--bg-tertiary': '#3a6b4b',
            '--text-primary': '#e0f2e9',
            '--text-secondary': '#a8d5ba',
            '--text-tertiary': '#5b8c6e',
            '--accent-primary': '#4ecca3',
            '--accent-secondary': '#2c8f6b',
            '--border-color': '#244530',
        }
    },
    {
        id: 'grad-berry',
        name: 'Berry Smoothie',
        category: 'Gradient',
        base: 'light',
        colors: {
            '--bg-primary': '#fff0f5',
            '--bg-secondary': '#ffe4e9',
            '--bg-tertiary': '#ffc0cb',
            '--text-primary': '#5c1b2f',
            '--text-secondary': '#8b2e4b',
            '--text-tertiary': '#b5506b',
            '--accent-primary': '#db7093',
            '--accent-secondary': '#ff69b4',
            '--border-color': '#ffc0cb',
        }
    },
     {
        id: 'grad-aurora',
        name: 'Aurora Borealis',
        category: 'Gradient',
        base: 'dark',
        colors: {
            '--bg-primary': '#0b1026',
            '--bg-secondary': '#1b2447',
            '--bg-tertiary': '#2c3a6b',
            '--text-primary': '#e6fff2',
            '--text-secondary': '#b3ffe0',
            '--text-tertiary': '#66ffcc',
            '--accent-primary': '#00ff9d',
            '--accent-secondary': '#00cc7a',
            '--border-color': '#1b2447',
        }
    },
    {
        id: 'grad-dusk',
        name: 'Dusk',
        category: 'Gradient',
        base: 'dark',
        colors: {
            '--bg-primary': '#232526',
            '--bg-secondary': '#414345',
            '--bg-tertiary': '#5a5c5e',
            '--text-primary': '#ffffff',
            '--text-secondary': '#dcdcdc',
            '--text-tertiary': '#ababab',
            '--accent-primary': '#ff6b6b',
            '--accent-secondary': '#ee5253',
            '--border-color': '#414345',
        }
    },

    // --- GLASSMORPHISM (Requires specific utility support but defining vars here) ---
    {
        id: 'glass-frost',
        name: 'Frosted Glass',
        category: 'Glass',
        base: 'light',
        colors: {
            '--bg-primary': '#fdfdfd',
            '--bg-secondary': 'rgba(255, 255, 255, 0.65)',
            '--bg-tertiary': 'rgba(255, 255, 255, 0.35)',
            '--text-primary': '#333333',
            '--text-secondary': '#555555',
            '--text-tertiary': '#777777',
            '--accent-primary': 'rgba(66, 153, 225, 0.8)',
            '--accent-secondary': 'rgba(99, 179, 237, 0.8)',
            '--border-color': 'rgba(255, 255, 255, 0.5)',
            '--glass-bg': 'rgba(255, 255, 255, 0.25)',
            '--glass-border': 'rgba(255, 255, 255, 0.3)',
            '--glass-shadow': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        }
    },
    {
        id: 'glass-obsidian',
        name: 'Obsidian Glass',
        category: 'Glass',
        base: 'dark',
        colors: {
            '--bg-primary': '#000000',
            '--bg-secondary': 'rgba(20, 20, 20, 0.7)',
            '--bg-tertiary': 'rgba(40, 40, 40, 0.5)',
            '--text-primary': '#ffffff',
            '--text-secondary': '#dddddd',
            '--text-tertiary': '#aaaaaa',
            '--accent-primary': 'rgba(255, 255, 255, 0.2)',
            '--accent-secondary': 'rgba(255, 255, 255, 0.1)',
            '--border-color': 'rgba(255, 255, 255, 0.1)',
            '--glass-bg': 'rgba(0, 0, 0, 0.5)',
            '--glass-border': 'rgba(255, 255, 255, 0.1)',
            '--glass-shadow': '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
        }
    },
    {
        id: 'glass-teal',
        name: 'Teal Glass',
        category: 'Glass',
        base: 'dark',
        colors: {
            '--bg-primary': '#134e4a',
            '--bg-secondary': 'rgba(20, 184, 166, 0.1)',
            '--bg-tertiary': 'rgba(45, 212, 191, 0.1)',
            '--text-primary': '#ccfbf1',
            '--text-secondary': '#99f6e4',
            '--text-tertiary': '#5eead4',
            '--accent-primary': '#2dd4bf',
            '--accent-secondary': '#14b8a6',
            '--border-color': 'rgba(45, 212, 191, 0.2)',
        }
    },

    // --- ABSTRACT ---
    {
        id: 'abs-neon',
        name: 'Cyber Neon',
        category: 'Abstract',
        base: 'dark',
        colors: {
            '--bg-primary': '#0b0b0b',
            '--bg-secondary': '#1a1a1a',
            '--bg-tertiary': '#2a2a2a',
            '--text-primary': '#00ff00',
            '--text-secondary': '#ff00ff',
            '--text-tertiary': '#00ffff',
            '--accent-primary': '#ffff00',
            '--accent-secondary': '#ff0000',
            '--border-color': '#333333',
        }
    },
    {
        id: 'abs-pastel',
        name: 'Pastel Dream',
        category: 'Abstract',
        base: 'light',
        colors: {
            '--bg-primary': '#fdf2f8',
            '--bg-secondary': '#f0fdf4',
            '--bg-tertiary': '#eff6ff',
            '--text-primary': '#4b5563',
            '--text-secondary': '#6b7280',
            '--text-tertiary': '#9ca3af',
            '--accent-primary': '#f472b6',
            '--accent-secondary': '#60a5fa',
            '--border-color': '#e5e7eb',
        }
    },
    {
        id: 'abs-monochrome',
        name: 'High Contrast',
        category: 'Abstract',
        base: 'light',
        colors: {
            '--bg-primary': '#ffffff',
            '--bg-secondary': '#000000',
            '--bg-tertiary': '#333333',
            '--text-primary': '#000000',
            '--text-secondary': '#ffffff',
            '--text-tertiary': '#cccccc',
            '--accent-primary': '#000000',
            '--accent-secondary': '#333333',
            '--border-color': '#000000',
        }
    },
    {
        id: 'abs-coffee',
        name: 'Coffee Shop',
        category: 'Abstract',
        base: 'light',
        colors: {
            '--bg-primary': '#f5ebe0',
            '--bg-secondary': '#e3d5ca',
            '--bg-tertiary': '#d5bdaf',
            '--text-primary': '#463f3a',
            '--text-secondary': '#8a817c',
            '--text-tertiary': '#bcb8b1',
            '--accent-primary': '#edc4b3',
            '--accent-secondary': '#e6beae',
            '--border-color': '#d5bdaf',
        }
    },

    // --- ARTISTIC ---
    {
        id: 'art-vangogh',
        name: 'Starry Night',
        category: 'Artistic',
        base: 'dark',
        colors: {
            '--bg-primary': '#1c2541',
            '--bg-secondary': '#3a506b',
            '--bg-tertiary': '#5bc0be',
            '--text-primary': '#ffffff',
            '--text-secondary': '#6fffe9',
            '--text-tertiary': '#5bc0be',
            '--accent-primary': '#f1c40f',
            '--accent-secondary': '#f39c12',
            '--border-color': '#3a506b',
        }
    },
    {
        id: 'art-monet',
        name: 'Water Lilies',
        category: 'Artistic',
        base: 'light',
        colors: {
            '--bg-primary': '#e8f7f5',
            '--bg-secondary': '#d1eae5',
            '--bg-tertiary': '#a6dbd4',
            '--text-primary': '#2c5d56',
            '--text-secondary': '#4a8b81',
            '--text-tertiary': '#7bc4b8',
            '--accent-primary': '#ffb7b2',
            '--accent-secondary': '#ff9e99',
            '--border-color': '#a6dbd4',
        }
    },
    {
        id: 'art-pop',
        name: 'Pop Art',
        category: 'Artistic',
        base: 'light',
        colors: {
            '--bg-primary': '#fff200',
            '--bg-secondary': '#ed1c24',
            '--bg-tertiary': '#00adef',
            '--text-primary': '#000000',
            '--text-secondary': '#231f20',
            '--text-tertiary': '#444444',
            '--accent-primary': '#ec008c',
            '--accent-secondary': '#8dc63f',
            '--border-color': '#000000',
        }
    },
    {
        id: 'art-retro',
        name: 'Retro 80s',
        category: 'Artistic',
        base: 'dark',
        colors: {
            '--bg-primary': '#2d1b2e',
            '--bg-secondary': '#b33951',
            '--bg-tertiary': '#91c7b1',
            '--text-primary': '#f1f7ed',
            '--text-secondary': '#e3e7af',
            '--text-tertiary': '#b33951',
            '--accent-primary': '#e3e7af',
            '--accent-secondary': '#a3333d',
            '--border-color': '#b33951',
        }
    },

    // --- SEASONAL / HOLIDAY ---
    {
        id: 'seas-xmas',
        name: 'Holiday Cheer',
        category: 'Seasonal',
        base: 'dark',
        colors: {
            '--bg-primary': '#165b33',
            '--bg-secondary': '#146b3a',
            '--bg-tertiary': '#f8b229',
            '--text-primary': '#ffffff',
            '--text-secondary': '#ea4630',
            '--text-tertiary': '#bb2528',
            '--accent-primary': '#bb2528',
            '--accent-secondary': '#ea4630',
            '--border-color': '#146b3a',
        }
    },
    {
        id: 'seas-halloween',
        name: 'Spooky Season',
        category: 'Seasonal',
        base: 'dark',
        colors: {
            '--bg-primary': '#1a1a1a',
            '--bg-secondary': '#2e2e2e',
            '--bg-tertiary': '#ff7518',
            '--text-primary': '#f2f2f2',
            '--text-secondary': '#cccccc',
            '--text-tertiary': '#888888',
            '--accent-primary': '#ff7518',
            '--accent-secondary': '#8a2be2',
            '--border-color': '#2e2e2e',
        }
    },
    {
        id: 'seas-valentines',
        name: 'Sweetheart',
        category: 'Seasonal',
        base: 'light',
        colors: {
            '--bg-primary': '#fff0f5',
            '--bg-secondary': '#ffc0cb',
            '--bg-tertiary': '#ff69b4',
            '--text-primary': '#800000',
            '--text-secondary': '#a52a2a',
            '--text-tertiary': '#cd5c5c',
            '--accent-primary': '#ff1493',
            '--accent-secondary': '#c71585',
            '--border-color': '#ffc0cb',
        }
    },
    {
        id: 'seas-spring',
        name: 'Spring Bloom',
        category: 'Seasonal',
        base: 'light',
        colors: {
            '--bg-primary': '#fdfcdc',
            '--bg-secondary': '#f0f4c3',
            '--bg-tertiary': '#c5e1a5',
            '--text-primary': '#33691e',
            '--text-secondary': '#558b2f',
            '--text-tertiary': '#7cb342',
            '--accent-primary': '#8bc34a',
            '--accent-secondary': '#aed581',
            '--border-color': '#c5e1a5',
        }
    },
    {
        id: 'seas-autumn',
        name: 'Autumn Leaves',
        category: 'Seasonal',
        base: 'light',
        colors: {
            '--bg-primary': '#fff3e0',
            '--bg-secondary': '#ffe0b2',
            '--bg-tertiary': '#ffcc80',
            '--text-primary': '#e65100',
            '--text-secondary': '#ef6c00',
            '--text-tertiary': '#f57c00',
            '--accent-primary': '#ff9800',
            '--accent-secondary': '#ffb74d',
            '--border-color': '#ffe0b2',
        }
    },

    // Additional Solid Colors to reach count
    {
        id: 'light-cyan',
        name: 'Cyan Light',
        category: 'Solid',
        base: 'light',
        colors: {
            '--bg-primary': '#ecfeff',
            '--bg-secondary': '#cffafe',
            '--bg-tertiary': '#a5f3fc',
            '--text-primary': '#164e63',
            '--text-secondary': '#0e7490',
            '--text-tertiary': '#0891b2',
            '--accent-primary': '#06b6d4',
            '--accent-secondary': '#22d3ee',
            '--border-color': '#a5f3fc',
        }
    },
    {
        id: 'light-indigo',
        name: 'Indigo Light',
        category: 'Solid',
        base: 'light',
        colors: {
            '--bg-primary': '#eef2ff',
            '--bg-secondary': '#e0e7ff',
            '--bg-tertiary': '#c7d2fe',
            '--text-primary': '#312e81',
            '--text-secondary': '#4338ca',
            '--text-tertiary': '#4f46e5',
            '--accent-primary': '#6366f1',
            '--accent-secondary': '#818cf8',
            '--border-color': '#c7d2fe',
        }
    },
    {
        id: 'light-fuchsia',
        name: 'Fuchsia Light',
        category: 'Solid',
        base: 'light',
        colors: {
            '--bg-primary': '#fdf4ff',
            '--bg-secondary': '#fae8ff',
            '--bg-tertiary': '#f0abfc',
            '--text-primary': '#701a75',
            '--text-secondary': '#86198f',
            '--text-tertiary': '#a21caf',
            '--accent-primary': '#c026d3',
            '--accent-secondary': '#d946ef',
            '--border-color': '#f0abfc',
        }
    },
    {
        id: 'dark-cyan',
        name: 'Cyan Dark',
        category: 'Solid',
        base: 'dark',
        colors: {
            '--bg-primary': '#083344',
            '--bg-secondary': '#164e63',
            '--bg-tertiary': '#155e75',
            '--text-primary': '#ecfeff',
            '--text-secondary': '#cffafe',
            '--text-tertiary': '#67e8f9',
            '--accent-primary': '#22d3ee',
            '--accent-secondary': '#06b6d4',
            '--border-color': '#155e75',
        }
    },
    {
        id: 'dark-indigo',
        name: 'Indigo Dark',
        category: 'Solid',
        base: 'dark',
        colors: {
            '--bg-primary': '#312e81',
            '--bg-secondary': '#3730a3',
            '--bg-tertiary': '#4338ca',
            '--text-primary': '#e0e7ff',
            '--text-secondary': '#c7d2fe',
            '--text-tertiary': '#a5b4fc',
            '--accent-primary': '#6366f1',
            '--accent-secondary': '#4f46e5',
            '--border-color': '#4338ca',
        }
    },
    {
        id: 'dark-fuchsia',
        name: 'Fuchsia Dark',
        category: 'Solid',
        base: 'dark',
        colors: {
            '--bg-primary': '#4a044e',
            '--bg-secondary': '#701a75',
            '--bg-tertiary': '#86198f',
            '--text-primary': '#fae8ff',
            '--text-secondary': '#f5d0fe',
            '--text-tertiary': '#e879f9',
            '--accent-primary': '#d946ef',
            '--accent-secondary': '#c026d3',
            '--border-color': '#86198f',
        }
    },
    {
        id: 'dark-gold',
        name: 'Luxury Gold',
        category: 'Solid',
        base: 'dark',
        colors: {
            '--bg-primary': '#28241d',
            '--bg-secondary': '#423b30',
            '--bg-tertiary': '#5c5243',
            '--text-primary': '#f9f1e1',
            '--text-secondary': '#e3d4b6',
            '--text-tertiary': '#d4af37',
            '--accent-primary': '#d4af37',
            '--accent-secondary': '#c5a028',
            '--border-color': '#5c5243',
        }
    },
    {
        id: 'light-gold',
        name: 'Royal Gold',
        category: 'Solid',
        base: 'light',
        colors: {
            '--bg-primary': '#fdfcf5',
            '--bg-secondary': '#f9f6e8',
            '--bg-tertiary': '#f2ebd4',
            '--text-primary': '#5c5243',
            '--text-secondary': '#8c7e66',
            '--text-tertiary': '#b59b58',
            '--accent-primary': '#d4af37',
            '--accent-secondary': '#e6c860',
            '--border-color': '#f2ebd4',
        }
    },
    {
        id: 'dark-silver',
        name: 'Sleek Silver',
        category: 'Solid',
        base: 'dark',
        colors: {
            '--bg-primary': '#2b2b2b',
            '--bg-secondary': '#3d3d3d',
            '--bg-tertiary': '#525252',
            '--text-primary': '#ffffff',
            '--text-secondary': '#e0e0e0',
            '--text-tertiary': '#bdbdbd',
            '--accent-primary': '#9e9e9e',
            '--accent-secondary': '#757575',
            '--border-color': '#525252',
        }
    },
    {
        id: 'light-silver',
        name: 'Sterling Silver',
        category: 'Solid',
        base: 'light',
        colors: {
            '--bg-primary': '#f5f5f5',
            '--bg-secondary': '#eeeeee',
            '--bg-tertiary': '#e0e0e0',
            '--text-primary': '#212121',
            '--text-secondary': '#424242',
            '--text-tertiary': '#616161',
            '--accent-primary': '#757575',
            '--accent-secondary': '#9e9e9e',
            '--border-color': '#e0e0e0',
        }
    },
    {
        id: 'dark-navy',
        name: 'Classic Navy',
        category: 'Solid',
        base: 'dark',
        colors: {
            '--bg-primary': '#0a192f',
            '--bg-secondary': '#112240',
            '--bg-tertiary': '#233554',
            '--text-primary': '#ccd6f6',
            '--text-secondary': '#8892b0',
            '--text-tertiary': '#606a86',
            '--accent-primary': '#64ffda',
            '--accent-secondary': '#52d1b1',
            '--border-color': '#233554',
        }
    },
    {
        id: 'light-cream',
        name: 'Soft Cream',
        category: 'Solid',
        base: 'light',
        colors: {
            '--bg-primary': '#fffdd0',
            '--bg-secondary': '#fbf7d5',
            '--bg-tertiary': '#f5f0cd',
            '--text-primary': '#5c5446',
            '--text-secondary': '#787063',
            '--text-tertiary': '#948c7e',
            '--accent-primary': '#dccbba',
            '--accent-secondary': '#cbb6a3',
            '--border-color': '#f5f0cd',
        }
    },
    {
        id: 'dark-plum',
        name: 'Royal Plum',
        category: 'Solid',
        base: 'dark',
        colors: {
            '--bg-primary': '#2d0f2b',
            '--bg-secondary': '#4a1a46',
            '--bg-tertiary': '#692663',
            '--text-primary': '#fceeff',
            '--text-secondary': '#e3bff2',
            '--text-tertiary': '#cd94e8',
            '--accent-primary': '#da70d6',
            '--accent-secondary': '#ba55d3',
            '--border-color': '#692663',
        }
    },
    {
        id: 'light-lavender',
        name: 'Lovely Lavender',
        category: 'Solid',
        base: 'light',
        colors: {
            '--bg-primary': '#fff0f5',
            '--bg-secondary': '#e6e6fa',
            '--bg-tertiary': '#d8bfd8',
            '--text-primary': '#4b0082',
            '--text-secondary': '#800080',
            '--text-tertiary': '#9370db',
            '--accent-primary': '#9370db',
            '--accent-secondary': '#ba55d3',
            '--border-color': '#d8bfd8',
        }
    },
    {
        id: 'dark-mocha',
        name: 'Dark Mocha',
        category: 'Solid',
        base: 'dark',
        colors: {
            '--bg-primary': '#3e2723',
            '--bg-secondary': '#4e342e',
            '--bg-tertiary': '#5d4037',
            '--text-primary': '#efebe9',
            '--text-secondary': '#d7ccc8',
            '--text-tertiary': '#bcaaa4',
            '--accent-primary': '#8d6e63',
            '--accent-secondary': '#a1887f',
            '--border-color': '#5d4037',
        }
    },
    {
        id: 'light-latte',
        name: 'Vanilla Latte',
        category: 'Solid',
        base: 'light',
        colors: {
            '--bg-primary': '#fff8e1',
            '--bg-secondary': '#ffecb3',
            '--bg-tertiary': '#ffe082',
            '--text-primary': '#3e2723',
            '--text-secondary': '#5d4037',
            '--text-tertiary': '#795548',
            '--accent-primary': '#ffca28',
            '--accent-secondary': '#ffd54f',
            '--border-color': '#ffe082',
        }
    },
];

export const THEME_CATEGORIES = ['Solid', 'Gradient', 'Glass', 'Abstract', 'Artistic', 'Seasonal'];
