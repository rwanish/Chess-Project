<template>
  <div class="boardWrap">
    <div class="board">
      <button
        v-for="cell in flatCells"
        :key="cell.key"
        class="square"
        :class="squareClasses(cell.row, cell.col, cell.piece)"
        @click="onSquareClick(cell.row, cell.col)"
        :title="titleFor(cell.row, cell.col, cell.piece)"
      >
        <span class="piece" v-if="cell.piece">{{ cell.piece.symbol }}</span>
      </button>
    </div>

    <div class="controls">
      <div class="status">
        <span class="label">Sélection :</span>
        <span v-if="selected" class="value">
          {{ selected.piece.color }} {{ selected.piece.type }} ({{ selected.row }},{{ selected.col }})
        </span>
        <span v-else class="value muted">aucune</span>
      </div>

      <button class="reset" @click="reset">Réinitialiser</button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { chessService } from "../services/ChessService";

const selected = ref(null);

const board = computed(() => chessService.getBoard());

const flatCells = computed(() => {
  const out = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      out.push({
        key: `${r}-${c}`,
        row: r,
        col: c,
        piece: board.value[r][c],
      });
    }
  }
  return out;
});

function onSquareClick(row, col) {
  const piece = board.value[row][col];

  // 1) Si aucune sélection : on sélectionne uniquement si une pièce existe
  if (!selected.value) {
    if (piece) selected.value = { row, col, piece };
    return;
  }

  // 2) Si une sélection existe : déplacer vers la case cliquée
  const from = selected.value;
  chessService.movePiece(from.row, from.col, row, col);

  // Reset sélection après déplacement
  selected.value = null;
}

function reset() {
  chessService.reset();
  selected.value = null;
}

function squareClasses(r, c, piece) {
  const isDark = (r + c) % 2 === 1;

  const isSelected =
    selected.value && selected.value.row === r && selected.value.col === c;

  const isTargetable = !!selected.value && !isSelected;

  return {
    dark: isDark,
    light: !isDark,
    selected: isSelected,
    targetable: isTargetable,
    occupied: !!piece,
  };
}

function titleFor(r, c, piece) {
  const coord = `(${r},${c})`;
  if (!piece) return `Case ${coord}`;
  return `${piece.color} ${piece.type} ${coord}`;
}
</script>

<style scoped>
.boardWrap {
  width: min(92vw, 520px);  /* ✅ s’adapte à l’écran */
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.board {
  width: 100%;
  aspect-ratio: 1 / 1;      /* ✅ carré */
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  border: 4px solid #2b2b2b;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 10px 24px rgba(0,0,0,0.12);
}

.square {
  border: 0;
  display: grid;
  place-items: center;
  cursor: pointer;
  user-select: none;
  transition: transform 0.05s ease, filter 0.12s ease;

  /* ✅ la taille de la pièce suit la taille d’une case */
  font-size: clamp(18px, 4.5vw, 36px);
  line-height: 1;
}

.square:hover {
  filter: brightness(1.05);
}

.light { background: #f3f2df; }
.dark  { background: #6f8f4e; }

.piece {
  transform: translateY(-1px);
  text-shadow: 0 1px 0 rgba(0,0,0,0.15);
}

.selected {
  outline: 3px solid rgba(37, 99, 235, 0.9);
  outline-offset: -3px;
}

.targetable:hover {
  transform: scale(1.02);
}

.controls {
  width: 100%;              /* ✅ suit boardWrap */
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;          /* ✅ évite le débordement */
}

.status {
  font-size: 14px;
  display: flex;
  gap: 8px;
  align-items: baseline;
  flex-wrap: wrap;
}

.label { color: #374151; font-weight: 700; }
.value { color: #111827; }
.muted { color: #6b7280; }

.reset {
  border: 1px solid #d1d5db;
  background: white;
  padding: 8px 12px;
  border-radius: 10px;
  cursor: pointer;
  white-space: nowrap;
}

.reset:hover {
  background: #f9fafb;
}
</style>
