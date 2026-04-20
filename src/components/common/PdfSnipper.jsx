import { useEffect, useRef, useState } from 'react'

function PdfSnipper({ pageImage, onCapture, onClose }) {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.src = pageImage
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
    }
  }, [pageImage])

  function getMousePos(e) {
    const rect = canvasRef.current.getBoundingClientRect()
    const scaleX = canvasRef.current.width / rect.width
    const scaleY = canvasRef.current.height / rect.height
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    }
  }

  function handleMouseDown(e) {
    const pos = getMousePos(e)
    setIsDrawing(true)
    setStartPos(pos)
    setCurrentPos(pos)
  }

  function handleMouseMove(e) {
    if (!isDrawing) return
    setCurrentPos(getMousePos(e))
  }

  function handleMouseUp() {
    if (!isDrawing) return
    setIsDrawing(false)

    const x = Math.min(startPos.x, currentPos.x)
    const y = Math.min(startPos.y, currentPos.y)
    const width = Math.abs(currentPos.x - startPos.x)
    const height = Math.abs(currentPos.y - startPos.y)

    if (width < 10 || height < 10) return

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    const sourceImg = new Image()
    sourceImg.src = pageImage
    sourceImg.onload = () => {
      ctx.drawImage(sourceImg, x, y, width, height, 0, 0, width, height)
      onCapture(canvas.toDataURL('image/jpeg', 0.9))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-5 backdrop-blur-sm">
      <div className="relative flex flex-col gap-4 overflow-hidden rounded-xl bg-white p-6 shadow-2xl max-h-[95vh] w-full max-w-5xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Capture Question/Diagram</h2>
            <p className="text-sm text-[var(--muted)]">Drag over the PDF content to select exactly how the question or diagram should look.</p>
          </div>
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
        
        <div className="relative overflow-auto border-2 border-dashed border-[var(--border)] rounded-lg cursor-crosshair">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="block"
          />
          {isDrawing && (
            <div
              className="absolute border-2 border-[var(--accent)] bg-[var(--accent-soft)]/30 pointer-events-none"
              style={{
                left: Math.min(startPos.x, currentPos.x) / (canvasRef.current?.width / canvasRef.current?.getBoundingClientRect().width || 1),
                top: Math.min(startPos.y, currentPos.y) / (canvasRef.current?.height / canvasRef.current?.getBoundingClientRect().height || 1),
                width: Math.abs(currentPos.x - startPos.x) / (canvasRef.current?.width / canvasRef.current?.getBoundingClientRect().width || 1),
                height: Math.abs(currentPos.y - startPos.y) / (canvasRef.current?.height / canvasRef.current?.getBoundingClientRect().height || 1),
              }}
            />
          )}
        </div>
        
        <div className="text-center text-sm font-bold text-[var(--accent-strong)]">
          Release the mouse to capture the selection.
        </div>
      </div>
    </div>
  )
}

export default PdfSnipper
