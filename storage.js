const STORAGE_KEY = "arrow_escape_save_v1";

function getDefaultSave() {
  return {
    currentLevel: 0,
    score: 0,
    unlockedLevel: 0,
    bestScore: 0
  };
}

function loadProgress() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return getDefaultSave();

    return {
      ...getDefaultSave(),
      ...JSON.parse(saved)
    };
  } catch (error) {
    console.warn("No se pudo leer el progreso guardado:", error);
    return getDefaultSave();
  }
}

function saveProgress(data) {
  const previous = loadProgress();

  const progress = {
    currentLevel: data.currentLevel ?? previous.currentLevel,
    score: data.score ?? previous.score,
    unlockedLevel: Math.max(previous.unlockedLevel, data.unlockedLevel ?? 0),
    bestScore: Math.max(previous.bestScore, data.bestScore ?? 0)
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  return progress;
}

function clearProgress() {
  localStorage.removeItem(STORAGE_KEY);
}
