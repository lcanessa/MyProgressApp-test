import { EXERCISE_VIDEO_IDS } from '../constants/exerciseVideos';

const PIPED_INSTANCES = [
  'https://pipedapi.adminforge.de',
  'https://pipedapi.kavin.rocks',
];

function normalize(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function parseYoutubeId(urlOrId) {
  if (!urlOrId) return null;
  if (/^[a-zA-Z0-9_-]{11}$/.test(urlOrId)) return urlOrId;
  const match = String(urlOrId).match(/(?:v=|\/shorts\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match?.[1] || null;
}

/** Coincide con catálogo precargado por nombre parecido. */
export function findVideoIdForName(name, library = []) {
  const n = normalize(name);
  if (!n) return null;

  let best = null;
  let bestScore = 0;

  for (const ex of library) {
    const catalogId = ex.videoId || EXERCISE_VIDEO_IDS[ex.id];
    if (!catalogId) continue;

    const ln = normalize(ex.name);
    if (ln === n) return catalogId;

    if (n.length >= 4 && (ln.includes(n) || n.includes(ln))) {
      const score = Math.min(n.length, ln.length);
      if (score > bestScore) {
        bestScore = score;
        best = catalogId;
      }
    }
  }

  return best;
}

export async function searchYoutubeVideoId(query) {
  const q = (query || '').trim();
  if (!q) return null;

  for (const base of PIPED_INSTANCES) {
    try {
      const res = await fetch(
        `${base}/search?q=${encodeURIComponent(q)}&filter=videos`,
        { signal: AbortSignal.timeout(9000) }
      );
      if (!res.ok) continue;

      const data = await res.json();
      const items = data.items || [];
      const pick =
        items.find((i) => {
          const d = Number(i.duration);
          return d > 0 && d <= 90;
        }) || items[0];

      const id = parseYoutubeId(pick?.url);
      if (id) return id;
    } catch {
      /* siguiente instancia */
    }
  }

  return null;
}

/** Busca video en catálogo y, si hace falta, en YouTube por nombre. */
export async function resolveVideoIdForExercise(name, library = []) {
  const fromCatalog = findVideoIdForName(name, library);
  if (fromCatalog) return fromCatalog;

  return searchYoutubeVideoId(`${name} ejercicio técnica corto`);
}

export function attachVideoToLibraryEntry(exerciseId, name, library, setLibrary) {
  resolveVideoIdForExercise(name, library).then((videoId) => {
    if (!videoId) return;
    setLibrary((prev) =>
      prev.map((ex) => (ex.id === exerciseId ? { ...ex, videoId } : ex))
    );
  });
}

export function resolveExerciseVideo(library, exercise) {
  if (!exercise) return null;

  const title = exercise.customName || exercise.name || 'Ejercicio';
  const libEx =
    library?.find((l) => l.id === exercise.exId) ||
    library?.find((l) => l.name === exercise.customName || l.name === exercise.name);

  const videoId =
    exercise.videoId ||
    libEx?.videoId ||
    (exercise.exId && EXERCISE_VIDEO_IDS[exercise.exId]) ||
    (libEx?.id && EXERCISE_VIDEO_IDS[libEx.id]) ||
    findVideoIdForName(title, library) ||
    null;

  return {
    title,
    videoId,
    loading: false,
    searchQuery: `${title} ejercicio técnica corto`,
    youtubeSearchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${title} ejercicio técnica corto`)}`,
  };
}

export async function resolveExerciseVideoAsync(library, exercise) {
  const base = resolveExerciseVideo(library, exercise);
  if (!base) return null;
  if (base.videoId) return base;

  const videoId = await searchYoutubeVideoId(base.searchQuery);
  return { ...base, videoId, loading: false };
}

export function getYoutubeEmbedUrl(videoId, maxSeconds = 60) {
  return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1&start=0&end=${maxSeconds}`;
}
