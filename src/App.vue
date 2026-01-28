<template>
  <div :class="['app', { 'dark-mode': darkMode }]">
    <div class="container">
      <div class="header">
        <h1>Jeu d'Échecs - Mode Libre</h1>
        <button 
          class="theme-toggle"
          @click="darkMode = !darkMode"
          aria-label="Changer de thème"
        >
          <Moon v-if="!darkMode" :size="20" />
          <Sun v-else :size="20" />
        </button>
      </div>

      <div class="layout">
        <div class="board-section">
          <div class="board-wrapper">
            <div class="board">
              <button
                v-for="cell in flatCells"
                :key="`${cell.row}-${cell.col}`"
                :class="getSquareClasses(cell.row, cell.col, cell.piece)"
                @click="handleSquareClick(cell.row, cell.col)"
                :aria-label="cell.piece ? `${cell.piece.color} ${cell.piece.type} à (${cell.row},${cell.col})` : `Case vide (${cell.row},${cell.col})`"
              >
                <span v-if="cell.piece" class="piece">{{ cell.piece.symbol }}</span>
              </button>
            </div>
          </div>

          <div class="controls">
            <div class="status">
              <span class="label">Sélection :</span>
              <span v-if="selected" class="value">
                {{ selected.piece.color }} {{ selected.piece.type }} ({{ selected.row }},{{ selected.col }})
              </span>
              <span v-else class="value muted">aucune</span>
            </div>
            <button class="reset-btn" @click="handleReset">
              <RotateCcw :size="16" />
              Réinitialiser
            </button>
          </div>
        </div>

        <div class="history-section">
          <h2>Historique des coups</h2>
          <div v-if="history.length === 0" class="empty">
            Aucun déplacement pour le moment.
          </div>
          <ul v-else class="history-list">
            <li 
              v-for="(move, idx) in history" 
              :key="`${move.time}-${idx}`" 
              class="history-item"
            >
              <div class="move-main">
                <span class="move-piece">{{ move.pieceName }}</span>
                <span class="move-coords">
                  ({{ move.from[0] }},{{ move.from[1] }}) → ({{ move.to[0] }},{{ move.to[1] }})
                </span>
              </div>
              <div v-if="move.replacedName" class="move-sub">
                Remplacé : {{ move.replacedName }}
              </div>
              <div class="move-time">{{ move.time }}</div>
            </li>
          </ul>
        </div>
      </div>

      <p class="hint">
        Mode libre : sélectionnez une pièce puis cliquez sur une case pour la déplacer (aucune règle).
        Si une pièce occupe déjà la case, elle est remplacée.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Moon, Sun, RotateCcw } from 'lucide-vue-next';
import { chessService } from './services/ChessService';

const darkMode = ref(false);
const selected = ref(null);

const board = computed(() => chessService.getBoard());
const history = computed(() => chessService.getHistory());

const flatCells = computed(() => {
  const cells = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      cells.push({ row: r, col: c, piece: board.value[r][c] });
    }
  }
  return cells;
});

function handleSquareClick(row, col) {
  const piece = board.value[row][col];

  if (!selected.value) {
    if (piece) {
      selected.value = { row, col, piece };
    }
    return;
  }

  if (selected.value.row === row && selected.value.col === col) {
    selected.value = null;
    return;
  }

  chessService.movePiece(selected.value.row, selected.value.col, row, col);
  selected.value = null;
}

function handleReset() {
  chessService.reset();
  selected.value = null;
}

function getSquareClasses(r, c, piece) {
  const isDark = (r + c) % 2 === 1;
  const isSelected = selected.value && selected.value.row === r && selected.value.col === c;
  
  return {
    square: true,
    dark: isDark,
    light: !isDark,
    selected: isSelected,
    targetable: selected.value && !isSelected,
    occupied: !!piece
  };
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.app {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  padding: 20px;
  transition: background 0.3s ease;
}

.app.dark-mode {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
  flex-wrap: wrap;
}

h1 {
  color: white;
  font-size: clamp(24px, 5vw, 42px);
  font-weight: 800;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
}

.theme-toggle {
  background: rgba(255,255,255,0.2);
  border: 2px solid rgba(255,255,255,0.3);
  color: white;
  padding: 10px;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.theme-toggle:hover {
  background: rgba(255,255,255,0.3);
  transform: scale(1.05);
}

.layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 20px;
}

@media (max-width: 900px) {
  .layout {
    grid-template-columns: 1fr;
  }
}

.board-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.board-wrapper {
  background: white;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.dark-mode .board-wrapper {
  background: #2d3748;
}

.board {
  width: 100%;
  max-width: 560px;
  margin: 0 auto;
  aspect-ratio: 1;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(8, 1fr);
  border: 4px solid #2d3748;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 8px 16px rgba(0,0,0,0.15);
}

.dark-mode .board {
  border-color: #4a5568;
}

.square {
  border: none;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: clamp(24px, 5vw, 48px);
  position: relative;
}

.square:hover {
  filter: brightness(1.1);
}

.square.light {
  background: #f0d9b5;
}

.square.dark {
  background: #b58863;
}

.dark-mode .square.light {
  background: #eae9d2;
}

.dark-mode .square.dark {
  background: #4b7399;
}

.square.selected {
  outline: 4px solid #3b82f6;
  outline-offset: -4px;
  z-index: 10;
}

.square.targetable:hover {
  transform: scale(1.05);
  z-index: 5;
}

.square.targetable.occupied:hover {
  outline: 3px solid #ef4444;
  outline-offset: -3px;
}

.piece {
  user-select: none;
  filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.3));
  line-height: 1;
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  background: rgba(255,255,255,0.95);
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.dark-mode .controls {
  background: rgba(45,55,72,0.95);
}

.status {
  display: flex;
  gap: 8px;
  align-items: baseline;
  flex-wrap: wrap;
  font-size: 14px;
}

.label {
  font-weight: 700;
  color: #374151;
}

.dark-mode .label {
  color: #e5e7eb;
}

.value {
  color: #111827;
  font-family: 'Courier New', monospace;
}

.dark-mode .value {
  color: #f3f4f6;
}

.value.muted {
  color: #9ca3af;
}

.reset-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #3b82f6;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;
}

.reset-btn:hover {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59,130,246,0.4);
}

.history-section {
  background: rgba(255,255,255,0.95);
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  max-height: 600px;
  overflow-y: auto;
}

.dark-mode .history-section {
  background: rgba(45,55,72,0.95);
}

.history-section h2 {
  font-size: 20px;
  font-weight: 800;
  margin-bottom: 16px;
  color: #1f2937;
}

.dark-mode .history-section h2 {
  color: #f3f4f6;
}

.empty {
  color: #9ca3af;
  font-size: 14px;
  padding: 12px;
  text-align: center;
}

.history-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0;
  margin: 0;
}

.history-item {
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
  transition: all 0.2s ease;
}

.dark-mode .history-item {
  background: #1f2937;
}

.history-item:hover {
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.move-main {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 4px;
}

.move-piece {
  font-weight: 700;
  color: #1f2937;
  font-size: 13px;
}

.dark-mode .move-piece {
  color: #f3f4f6;
}

.move-coords {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #4b5563;
}

.dark-mode .move-coords {
  color: #9ca3af;
}

.move-sub {
  font-size: 11px;
  color: #ef4444;
  margin-bottom: 4px;
}

.move-time {
  font-size: 11px;
  color: #9ca3af;
  font-family: 'Courier New', monospace;
}

.hint {
  text-align: center;
  color: rgba(255,255,255,0.9);
  font-size: 14px;
  line-height: 1.6;
  background: rgba(0,0,0,0.2);
  padding: 12px 20px;
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.history-section::-webkit-scrollbar {
  width: 8px;
}

.history-section::-webkit-scrollbar-track {
  background: rgba(0,0,0,0.1);
  border-radius: 4px;
}

.history-section::-webkit-scrollbar-thumb {
  background: #3b82f6;
  border-radius: 4px;
}

.history-section::-webkit-scrollbar-thumb:hover {
  background: #2563eb;
}
</style>