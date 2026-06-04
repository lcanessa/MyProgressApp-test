import { supabase } from './supabase';

// ── Mappers ──────────────────────────────────────────────

function rowToBlock(row) {
  return {
    id: row.id,
    name: row.name,
    ...(row.is_archived ? { isArchived: true, archivedAlias: row.archived_alias } : {}),
  };
}

function blockToRow(block, position, userId) {
  return {
    id: block.id,
    user_id: userId,
    name: block.name,
    position,
    is_archived: block.isArchived ?? false,
    archived_alias: block.archivedAlias ?? null,
  };
}

function rowToExercise(row) {
  return {
    id: row.id,
    name: row.name,
    muscle: row.muscle_group,
    ...(row.video_id ? { videoId: row.video_id } : {}),
    ...(row.catalog_id ? { catalogId: row.catalog_id } : {}),
  };
}

function exerciseToRow(ex, userId) {
  return {
    id: ex.id,
    user_id: userId,
    name: ex.name,
    muscle_group: ex.muscle,
    video_id: ex.videoId ?? null,
  };
}

function buildRoutinesFromRows(blockExRows, blockRows) {
  const routines = {};
  for (const b of blockRows) routines[b.id] = [];
  for (const row of blockExRows) {
    if (!routines[row.block_id]) routines[row.block_id] = [];
    routines[row.block_id].push({
      exId: row.user_exercise_id,
      name: row.custom_name,
      customName: row.custom_name,
      sets: row.sets,
      targetReps: row.target_reps,
    });
  }
  return routines;
}

function buildDiaryFromRows(rows) {
  const diary = {};
  for (const row of rows) {
    diary[row.date] = {
      routineId: row.block_id,
      sessions: row.sessions ?? {},
      completed: row.completed ?? {},
      locked: row.locked ?? false,
      ...(row.exercise_snapshot ? { exerciseSnapshot: row.exercise_snapshot } : {}),
    };
  }
  return diary;
}

// ── Default first-time data ───────────────────────────────

function makeDefaultBlocks() {
  return [
    { id: crypto.randomUUID(), name: 'Empuje (Pecho/Tríceps)' },
    { id: crypto.randomUUID(), name: 'Tracción (Espalda/Bíceps)' },
    { id: crypto.randomUUID(), name: 'Piernas y Hombros' },
  ];
}

// ── Catalog ──────────────────────────────────────────────

export async function searchCatalog(query) {
  const q = (query || '').trim();
  let req = supabase.from('exercise_catalog').select('id, name, muscle_group').order('muscle_group').order('name');
  if (q) req = req.ilike('name', `%${q}%`);
  const { data } = await req.limit(100);
  return (data ?? []).map((r) => ({ id: r.id, name: r.name, muscle: r.muscle_group }));
}

// ── Load ─────────────────────────────────────────────────

export async function loadUserData(userId) {
  const [blocksRes, libraryRes, diaryRes, userDataRes] = await Promise.all([
    supabase.from('blocks').select('*').eq('user_id', userId).order('position'),
    supabase.from('user_exercises').select('*').eq('user_id', userId),
    supabase.from('diary_days').select('*').eq('user_id', userId),
    supabase.from('user_data').select('history').eq('user_id', userId).maybeSingle(),
  ]);

  let blocks = (blocksRes.data ?? []).map(rowToBlock);
  const library = (libraryRes.data ?? []).map(rowToExercise);

  let routines = {};
  if (blocks.length > 0) {
    const blockIds = blocks.map((b) => b.id);
    const { data: blockExRows } = await supabase
      .from('block_exercises')
      .select('*')
      .in('block_id', blockIds)
      .order('position');
    routines = buildRoutinesFromRows(blockExRows ?? [], blocksRes.data ?? []);
  }

  // Primera vez: crear bloques por defecto
  if (blocks.length === 0) {
    blocks = makeDefaultBlocks();
    routines = Object.fromEntries(blocks.map((b) => [b.id, []]));
    await syncBlocks(userId, blocks);
  }

  const diary = buildDiaryFromRows(diaryRes.data ?? []);
  const history = userDataRes.data?.history ?? {};

  return { blocks, library, routines, diary, history };
}

// ── Sync ─────────────────────────────────────────────────

export async function syncBlocks(userId, blocks) {
  if (!userId) return;
  const rows = blocks.map((b, i) => blockToRow(b, i, userId));
  await supabase.from('blocks').upsert(rows, { onConflict: 'id' });

  // Eliminar bloques que ya no existen
  const currentIds = blocks.map((b) => b.id);
  await supabase.from('blocks').delete().eq('user_id', userId).not('id', 'in', `(${currentIds.join(',')})`);
}

export async function syncLibrary(userId, library) {
  if (!userId) return;
  if (library.length === 0) {
    await supabase.from('user_exercises').delete().eq('user_id', userId);
    return;
  }
  const rows = library.map((ex) => exerciseToRow(ex, userId));
  await supabase.from('user_exercises').upsert(rows, { onConflict: 'id' });
  const currentIds = library.map((ex) => ex.id);
  await supabase.from('user_exercises').delete().eq('user_id', userId).not('id', 'in', `(${currentIds.join(',')})`);
}

export async function syncRoutines(userId, routines, blocks) {
  if (!userId) return;
  const blockIds = blocks.map((b) => b.id);
  if (blockIds.length === 0) return;

  await supabase.from('block_exercises').delete().in('block_id', blockIds);

  const rows = [];
  for (const [blockId, exercises] of Object.entries(routines)) {
    exercises.forEach((ex, i) => {
      rows.push({
        block_id: blockId,
        user_exercise_id: ex.exId,
        position: i,
        sets: ex.sets,
        target_reps: ex.targetReps,
        custom_name: ex.customName || ex.name,
      });
    });
  }
  if (rows.length > 0) {
    await supabase.from('block_exercises').insert(rows);
  }
}

export async function syncDiaryDay(userId, dateStr, dayData) {
  if (!userId || !dateStr || !dayData) return;
  await supabase.from('diary_days').upsert(
    {
      user_id: userId,
      date: dateStr,
      block_id: dayData.routineId ?? null,
      locked: dayData.locked ?? false,
      exercise_snapshot: dayData.exerciseSnapshot ?? null,
      sessions: dayData.sessions ?? {},
      completed: dayData.completed ?? {},
    },
    { onConflict: 'user_id,date' }
  );
}

export async function syncHistory(userId, history) {
  if (!userId) return;
  await supabase.from('user_data').upsert({ user_id: userId, history }, { onConflict: 'user_id' });
}
