import { useEffect, useRef } from 'react'
import renderMathInElement from 'katex/dist/contrib/auto-render.mjs'

function repairMangledText(text) {
  return String(text)
    .replace(/□\s*□/g, 'π')
    .replace(/\?\s*\?/g, '±')
    .replace(/sin\s*[□\?]/gi, 'sin θ')
    .replace(/cos\s*[□\?]/gi, 'cos θ')
    .replace(/tan\s*[□\?]/gi, 'tan θ')
    .replace(/([0-9t])\s*[□\?]\s*([0-9t])/g, '$1 + $2') // expanded to match 220t + 0.64
    .replace(/λ\s*[□\?]/g, 'λ =')
    .replace(/[□\?]\s*is\s*:/g, 'θ is :')
    .replace(/phase\s*[□\?]/gi, 'phase φ')
    .replace(/frequency\s*[□\?]/gi, 'frequency f')
    .replace(/velocity\s*[□\?]/gi, 'velocity v')
    .replace(/([0-9])m\s*[□\?]\s*[□\?]/gi, '$1m/s')
    .replace(/([0-9])s\s*[□\?]\s*[□\?]/gi, '$1s⁻¹')
}

function MathText({ text = '', className = '', isHeader = false }) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (containerRef.current) {
      // 1. Repair mangled symbols from PDF extraction
      let processedText = repairMangledText(text)

      // 2. Auto-wrap common unicode math symbols in math blocks
      processedText = processedText.replace(
        /([πθλμΩΣΔαβγδεζηικλορστυφχψω√°→∝²³⁻¹])/g, 
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
