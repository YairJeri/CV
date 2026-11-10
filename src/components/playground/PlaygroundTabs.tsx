import { useState } from 'preact/hooks';
import SortingLab from './SortingLab';
import GraphLab from './GraphLab';
import PhysicsLab from './PhysicsLab';
import AutomataLab from './AutomataLab';
import { playgroundTranslations, type PlaygroundLang } from './translations';

type LabTab = 'sorting' | 'graph' | 'physics' | 'automata';

interface PlaygroundTabsProps {
  lang?: string;
}

export default function PlaygroundTabs({ lang = 'en' }: PlaygroundTabsProps) {
  const currentLang: PlaygroundLang = lang === 'es' ? 'es' : 'en';
  const t = playgroundTranslations[currentLang];
  const [activeTab, setActiveTab] = useState<LabTab>('sorting');

  const tabs: { id: LabTab; number: string; label: string }[] = [
    { id: 'sorting', number: t.tabs.sorting.number, label: t.tabs.sorting.label },
    { id: 'graph', number: t.tabs.graph.number, label: t.tabs.graph.label },
    { id: 'physics', number: t.tabs.physics.number, label: t.tabs.physics.label },
    { id: 'automata', number: t.tabs.automata.number, label: t.tabs.automata.label },
  ];

  return (
    <div class="w-full flex flex-col gap-6">
      {/* Laboratory Navigation Header */}
      <div class="flex items-center justify-between flex-wrap gap-4 p-3 bg-surface/80 backdrop-blur rounded-2xl border border-white/10">
        <div class="flex items-center gap-2 overflow-x-auto py-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                class={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
                    : 'bg-black/40 text-zinc-400 hover:text-white hover:bg-white/5 border border-white/5'
                }`}
              >
                <span class={isActive ? 'text-black/70 font-bold' : 'text-cyan-400'}>
                  {tab.number}
                </span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Laboratory View */}
      <div class="w-full">
        {activeTab === 'sorting' && <SortingLab lang={currentLang} />}
        {activeTab === 'graph' && <GraphLab lang={currentLang} />}
        {activeTab === 'physics' && <PhysicsLab lang={currentLang} />}
        {activeTab === 'automata' && <AutomataLab lang={currentLang} />}
      </div>
    </div>
  );
}
