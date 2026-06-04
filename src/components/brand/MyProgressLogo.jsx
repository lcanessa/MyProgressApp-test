export default function MyProgressLogo({ isDark }) {
  return (
    <div className="flex items-center justify-center cursor-default gap-1.5 mt-1">
      <img
        src="/header-logo.png"
        alt="MyProgress"
        width={36}
        height={36}
        className="w-9 h-9 rounded-xl object-cover drop-shadow-md"
        decoding="async"
      />
      <h1 className="text-[1.35rem] font-black italic tracking-tight">
        <span className="text-purple-500">My</span>
        <span className={isDark ? 'text-slate-100' : 'text-slate-800'}>Progress</span>
      </h1>
    </div>
  );
}
