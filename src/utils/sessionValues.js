/** Limpia peso/reps guardados (importación o formatos viejos). */
export function normalizeSessionFieldValue(raw, field) {
  if (raw == null) return '';
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return field === 'r' ? String(Math.round(raw)) : String(raw);
  }
  if (typeof raw === 'object') {
    const nested = raw.value ?? raw.weight ?? raw.w ?? raw.reps ?? raw.r;
    if (nested != null) return normalizeSessionFieldValue(nested, field);
    return '';
  }

  const s = String(raw).trim();
  if (!s) return '';

  if (/^kg$/i.test(s) || /^reps?$/i.test(s)) return '';

  if (field === 'w') {
    const m = s.match(/^(\d+(?:[.,]\d*)?)$/);
    return m ? m[1].replace(',', '.') : '';
  }

  if (field === 'r') {
    const m = s.match(/^(\d+)/);
    return m ? m[1] : '';
  }

  return s;
}

/** Muestra el peso con coma decimal (es-AR). */
export function formatWeightDisplay(stored) {
  if (stored == null || stored === '') return '';
  return String(stored).trim().replace('.', ',');
}

/** Acepta coma o punto mientras se escribe; guarda con punto. */
export function parseWeightInput(raw) {
  if (raw == null) return '';
  const s = String(raw).trim();
  if (!s) return '';
  const m = s.match(/^(\d*(?:[.,]\d*)?)$/);
  if (!m) return normalizeSessionFieldValue(raw, 'w');
  return m[1].replace(',', '.');
}

export function parseWeightNumber(raw) {
  if (raw == null || raw === '') return NaN;
  return parseFloat(String(raw).trim().replace(',', '.'));
}

export function sanitizeDiarySessions(diary) {
  if (!diary || typeof diary !== 'object') return diary;

  const next = {};
  for (const [dateStr, day] of Object.entries(diary)) {
    if (!day || typeof day !== 'object') {
      next[dateStr] = day;
      continue;
    }
    const sessions = {};
    for (const [key, val] of Object.entries(day.sessions || {})) {
      if (key.endsWith('-w')) {
        sessions[key] = normalizeSessionFieldValue(val, 'w');
      } else if (key.endsWith('-r')) {
        sessions[key] = normalizeSessionFieldValue(val, 'r');
      } else {
        sessions[key] = val;
      }
    }
    next[dateStr] = { ...day, sessions };
  }
  return next;
}

export function sanitizeHistory(history) {
  if (!history || typeof history !== 'object') return history;

  const next = {};
  for (const [name, entry] of Object.entries(history)) {
    if (!entry || typeof entry !== 'object') {
      next[name] = entry;
      continue;
    }
    const cleaned = { ...entry };
    for (const key of Object.keys(cleaned)) {
      if (key.endsWith('w')) cleaned[key] = normalizeSessionFieldValue(cleaned[key], 'w');
      if (key.endsWith('r')) cleaned[key] = normalizeSessionFieldValue(cleaned[key], 'r');
    }
    next[name] = cleaned;
  }
  return next;
}
