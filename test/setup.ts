const filterMsg = (args: unknown[]) => {
  const msg = args.map(String).join(' ')
  return msg.includes('<Suspense>') || 
         msg.includes('GOOGLE_API_KEY') || 
         msg.includes('GROQ_API_KEY') ||
         msg.includes('Ollama mode') ||
         msg.includes('Groq mode')
}

const originalWarn = console.warn
console.warn = (...args) => {
  if (filterMsg(args)) return
  originalWarn(...args)
}

const originalLog = console.log
console.log = (...args) => {
  if (filterMsg(args)) return
  originalLog(...args)
}

const originalInfo = console.info
console.info = (...args) => {
  if (filterMsg(args)) return
  originalInfo(...args)
}
