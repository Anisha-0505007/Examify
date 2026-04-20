export const mathSymbols = [
  { label: 'Basic', symbols: ['+', '-', '×', '÷', '=', '±', '√', '∞', '%'] },
  { label: 'Greek', symbols: ['π', 'θ', 'λ', 'μ', 'Ω', 'Σ', 'Δ', 'α', 'β', 'γ', 'δε', 'ζ', 'η', 'ι', 'κ', 'ο', 'ρ', 'σ', 'τ', 'υ', 'φ', 'χ', 'ψ', 'ω'] },
  { label: 'Relations', symbols: ['<', '>', '≤', '≥', '≈', '≠', '∝', '→', '⇒', '⇔'] },
  { label: 'Scripts', symbols: ['²', '³', '⁴', 'ⁿ', '₁', '₂', '₃', 'ₓ', '⁻¹'] },
  { label: 'Calculus', symbols: ['∫', '∂', '∇', '∆', 'lim', '∑', '∏'] }
]

export function hasSymbolArtifacts(value = '') {
  return /\[\s*\]|\?\?|\u25a1|\ufffd|□/.test(value)
}

export function insertAtCursor(value, insertText, selectionStart, selectionEnd) {
  const start = selectionStart ?? value.length
  const end = selectionEnd ?? value.length
  return `${value.slice(0, start)}${insertText}${value.slice(end)}`
}
