function Timer({ value }) {
  return (
    <div className="rounded-lg bg-[#111827] px-4 py-3 text-center text-white">
      <p className="text-xs font-bold uppercase text-gray-300">Time left</p>
      <p className="font-mono text-2xl font-black">{value}</p>
    </div>
  )
}

export default Timer
