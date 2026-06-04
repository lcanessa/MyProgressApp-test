import { X, ExternalLink, Loader2 } from 'lucide-react';
import { getYoutubeEmbedUrl } from '../utils/exerciseVideo';

export default function ExerciseVideoModal({ app }) {
  const video = app.exerciseVideo;
  if (!video) return null;

  const hasEmbed = !!video.videoId;
  const isLoading = video.loading;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-auto animate-in fade-in duration-200">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={app.closeExerciseVideo}
      />
      <div
        className={`relative w-full max-w-md rounded-[2rem] overflow-hidden border shadow-2xl transition-colors animate-in zoom-in-95 duration-200 ${
          app.isDark ? 'bg-[#121212] border-white/10' : 'bg-white border-slate-200'
        }`}
      >
        <div className={`flex items-start justify-between gap-3 p-5 border-b ${app.isDark ? 'border-white/5' : 'border-slate-100'}`}>
          <div className="min-w-0">
            <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${app.isDark ? 'text-sky-400' : 'text-sky-600'}`}>
              Técnica · clip corto
            </p>
            <h3 className={`font-black text-lg leading-tight truncate ${app.isDark ? 'text-white' : 'text-slate-800'}`}>
              {video.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={app.closeExerciseVideo}
            className={`p-2 rounded-full shrink-0 transition-colors ${app.isDark ? 'bg-white/5 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-800'}`}
          >
            <X size={20} />
          </button>
        </div>

        {isLoading ? (
          <div className={`flex flex-col items-center justify-center gap-3 aspect-video ${app.isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
            <Loader2 size={28} className="animate-spin text-purple-500" />
            <p className={`text-xs font-medium ${app.isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Buscando video…
            </p>
          </div>
        ) : hasEmbed ? (
          <div className="relative w-full aspect-video bg-black">
            <iframe
              title={`Video: ${video.title}`}
              src={getYoutubeEmbedUrl(video.videoId)}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className={`p-8 text-center ${app.isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
            <p className={`text-sm font-medium mb-4 ${app.isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              No encontramos un clip corto. Probá en YouTube.
            </p>
            <a
              href={video.youtubeSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-black text-sm bg-red-600 text-white hover:bg-red-500 transition-colors"
            >
              <ExternalLink size={16} /> Buscar en YouTube
            </a>
          </div>
        )}

        <p className={`px-5 py-3 text-[10px] text-center ${app.isDark ? 'text-slate-600' : 'text-slate-400'}`}>
          {isLoading ? 'Según el nombre del ejercicio' : hasEmbed ? 'Máx. 1 min · YouTube' : 'Se abre en una pestaña nueva'}
        </p>
      </div>
    </div>
  );
}
