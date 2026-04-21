import { useEffect, useRef } from 'react'
import renderMathInElement from 'katex/dist/contrib/auto-render.mjs'

function repairMangledText(text) {
  return String(text)
    .replace(/â–¡\s*â–¡/g, 'Ï€')
    .replace(/\?\s*\?/g, 'Â±')
    .replace(/sin\s*[â–¡?]/gi, 'sin Î¸')
    .replace(/cos\s*[â–¡?]/gi, 'cos Î¸')
    .replace(/tan\s*[â–¡?]/gi, 'tan Î¸')
    .replace(/([0-9t])\s*[â–¡?]\s*([0-9t])/g, '$1 + $2') // expanded to match 220t + 0.64
    .replace(/Î»\s*[â–¡?]/g, 'Î» =')
    .replace(/[â–¡?]\s*is\s*:/g, 'Î¸ is :')
    .replace(/phase\s*[â–¡?]/gi, 'phase Ï†')
    .replace(/frequency\s*[â–¡?]/gi, 'frequency f')
    .replace(/velocity\s*[â–¡?]/gi, 'velocity v')
    .replace(/([0-9])m\s*[â–¡?]\s*[â–¡?]/gi, '$1m/s')
    .replace(/([0-9])s\s*[â–¡?]\s*[â–¡?]/gi, '$1sâ»Â¹')
}

function MathText({ text = '', className = '', isHeader = false }) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (containerRef.current) {
      // 1. Repair mangled symbols from PDF extraction
      let processedText = repairMangledText(text)

      // 2. Auto-wrap common unicode math symbols in math blocks
      processedText = processedText.replace(
        /([Ï€Î¸Î»Î¼Î©Î£Î”Î±Î²Î³Î´ÎµÎ¶Î·Î¹ÎºÎ»Î¿ÏÏƒÏ„Ï…Ï†Ï‡ÏˆÏ‰âˆšÂ°â†’âˆÂ²Â³â»Â¹])/g, 
        (match) => `$${match}$`
      )
      
      containerRef.current.textContent = processedText
      renderMathInElement(containerRef.current, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false },
          { left: '\\(', right: '\\)', display: false },
          { left: '\\[', right: '\\]', display: true },
        ],
        throwOnError: false,
      })
    }
  }, [text])

  const Component = isHeader ? 'h1' : 'span'

  return <Component ref={containerRef} className={className} />
}

export default MathText
