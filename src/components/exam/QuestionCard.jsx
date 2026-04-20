import QuestionDiagram from '../common/QuestionDiagram.jsx'
import MathText from '../common/MathText.jsx'

function QuestionCard({ question, index, selected, onSelect }) {
  return (
    <section className="flex flex-col gap-8 h-full">
      <div>
        <div className="flex items-center gap-3 mb-4">
           <span className="bg-[#00f5ca] text-[#0f172a] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(0,245,202,0.3)]">
             Question {index + 1}
           </span>
           <span className="text-white/30 text-[10px] font-black uppercase tracking-[0.1em] border-l border-white/10 pl-3">
             {question.sectionName || 'General'} • {question.marks ?? 1} Marks
           </span>
        </div>
        <MathText 
           isHeader 
           className="text-3xl font-black leading-[1.3] text-white tracking-tight" 
           text={question.text} 
        />
        {question.topic && (
          <p className="mt-4 text-xs font-bold text-white/50 uppercase tracking-widest">{question.topic}</p>
        )}
      </div>

      {question.diagramUrl && (
        <div className="p-2 bg-white/5 rounded-3xl border border-white/5 backdrop-blur-md">
           <QuestionDiagram className="rounded-2xl w-full" alt={`Diagram for question ${index + 1}`} src={question.diagramUrl} />
        </div>
      )}

      <div className="grid gap-4 mt-auto">
        {(question.options || []).map((option, optionIndex) => (
          <button
            className={`group relative flex items-center gap-5 rounded-2xl border-2 p-5 text-left font-black transition-all duration-300 ${
              selected === optionIndex
                ? 'border-[#00f5ca] bg-[#00f5ca]/5 text-white shadow-[0_0_30px_rgba(0,245,202,0.1)]'
                : 'border-white/5 bg-white/5 text-white/60 hover:border-white/20 hover:bg-white/10 hover:text-white'
            }`}
            key={`${question.id}-${optionIndex}`}
            onClick={() => onSelect(question.id, optionIndex)}
          >
            <div className={`flex size-10 flex-shrink-0 items-center justify-center rounded-xl text-sm font-black transition-all duration-300 ${
               selected === optionIndex 
                ? 'bg-[#00f5ca] text-[#0f172a]' 
                : 'bg-white/5 group-hover:bg-white/10'
            }`}>
              {String.fromCharCode(65 + optionIndex)}
            </div>
            <MathText className="text-lg" text={option} />
            
            {selected === optionIndex && (
              <div className="absolute right-6 size-2 rounded-full bg-[#00f5ca] animate-pulse shadow-[0_0_10px_#00f5ca]" />
            )}
          </button>
        ))}
      </div>
    </section>
  )
}

export default QuestionCard

