'use client';

import { useState } from 'react';
import { motion } from 'motion/react';

interface FilterPillProps {
  activeTab?: 'curated' | 'community';
  onTabChange?: (tab: 'curated' | 'community') => void;
}

export function FilterPill({ activeTab: controlledTab, onTabChange }: FilterPillProps = {}) {
  const [internalTab, setInternalTab] = useState<'curated' | 'community'>('curated');
  const activeTab = controlledTab ?? internalTab;
  const tabs = ['curated', 'community'] as const;

  const handleTabClick = (tab: 'curated' | 'community') => {
    setInternalTab(tab);
    onTabChange?.(tab);
  };

  return (
    /* Rendered at top of feed only (non-sticky, scrolls naturally with the feed) */
    <div className="w-full px-4 pt-1 pb-2 flex justify-center">
      <div
        className="glass relative inline-flex w-full max-w-[320px] rounded-full p-1 border border-[var(--border)] shadow-sm overflow-hidden"
        style={{ borderRadius: '9999px' }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => handleTabClick(tab)}
              style={{ borderRadius: '9999px' }}
              className={`relative flex-1 py-2 px-3 text-xs font-bold uppercase tracking-wider transition-colors rounded-full z-10 cursor-pointer select-none text-center ${
                isActive
                  ? 'text-[var(--accent)] font-bold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)] font-semibold'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeFilterPillTab"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  className="absolute inset-0 rounded-full bg-[var(--accent-tint)] border border-[var(--accent-line)] shadow-xs -z-10"
                  style={{ borderRadius: '9999px' }}
                />
              )}
              {tab === 'curated' ? 'Curated' : 'Community'}
            </button>
          );
        })}
      </div>
    </div>
  );
}
