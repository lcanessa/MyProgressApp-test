export default function AppBackground({ isDark }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div
        className={`absolute -top-[10%] -left-[10%] w-[70vw] h-[70vw] max-w-[500px] max-h-[500px] rounded-full blur-[100px] ${isDark ? 'bg-purple-600/25' : 'bg-purple-300/40'}`}
      />
      <div
        className={`absolute bottom-[10%] -right-[10%] w-[60vw] h-[60vw] max-w-[400px] max-h-[400px] rounded-full blur-[80px] ${isDark ? 'bg-indigo-600/10' : 'bg-indigo-300/30'}`}
      />
    </div>
  );
}
