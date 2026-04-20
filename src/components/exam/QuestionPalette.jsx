import { useMemo } from 'react'

function QuestionPalette({ questions, answers, markedForReview, currentIndex, onJump }) {
  const sections = useMemo(() => {
    const grouped = {}
    questions.forEach((q, index) => {
      const sectionName = q.sectionName || 'General'
      if (!grouped[sectionName]) grouped[sectionName] = { name: sectionName, subject: q.sectionSubject, items: [] }
      grouped[sectionName].items.push({ ...q, originalIndex: index })
    })
    return Object.values(grouped)
  }, [questions])

  return (
    <aside className="glass-main !p-6 flex flex-col h-full bg-[#0f172a]/40">
      <div>
        <h2 className="text-xl font-black text-white">Question Palette</h2>
        <p className="text-xs font-bold text-white/40 uppercase tracking-widest mt-1">Simulation Overview</p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar my-6 pr-2">
        <div className="grid gap-8">
          {sections.map((section) => (
            <div className="grid gap-4" key={section.name}>
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#00f5ca]">{section.name}</span>
                <span className="text-[10px] font-bold text-white/30 uppercase">{section.subject}</span>
              </div>
              <div className="grid grid-cols-5 gap-2.5">
                {section.items.map((item) => {
                  const answered = answers[item.id] !== undefined && String(answers[item.id]).trim() !== ''
                  const marked = markedForReview.includes(item.id)
                  const isCurrent = item.originalIndex === currentIndex
                  
                  return (
                    <button
                      className={`aspect-square rounded-xl border text-xs font-black transition-all duration-300 transform active:scale-90 ${
                        isCurrent
                          ? 'bg-[#00f5ca] text-[#0f172a] border-transparent shadow-[0_0_20px_rgba(0,245,202,0.4)] scale-110 z-10'
                          : marked
                            ? 'bg-amber-500/20 text-amber-500 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                            : answered
                              ? 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/40 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                              : 'bg-white/5 text-white/30 border-white/5 hover:bg-white/10 hover:border-white/20'
                      }`}
                      key={item.id}
                      onClick={() => onJump(item.originalIndex)}
                    >
                      {item.originalIndex + 1}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 border-t border-white/5 pt-6">
        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/40">
           <div className="size-2 rounded-full bg-[#10b981]" /> Answered
        </div>
        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/40">
           <div className="size-2 rounded-full bg-amber-500" /> For Review
        </div>
        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/40">
           <div className="size-2 rounded-full bg-[#00f5ca]" /> Current Question
        </div>

      </div>
    </aside>
  )
}

export default QuestionPalette

