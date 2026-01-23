<template>
  <aside class="panel">
    <h2 class="panelTitle">Move History</h2>

    <div v-if="history.length === 0" class="empty">
      Aucun déplacement pour le moment.
    </div>

    <ul v-else class="list">
      <li v-for="(m, idx) in history" :key="m.at + '_' + idx" class="item">
        <div class="line">
          {{ m.pieceName }} {{ formatMove(m.from, m.to) }}
        </div>
        <div v-if="m.replacedName" class="sub">
          remplacé : {{ m.replacedName }}
        </div>
      </li>
    </ul>
  </aside>
</template>

<script setup>
import { computed } from "vue";
import { chessService } from "../services/ChessService";

const history = computed(() => chessService.getHistory());

function formatMove(from, to) {
  return `(${from[0]},${from[1]}) → (${to[0]},${to[1]})`;
}
</script>

<style scoped>
.panel {
  width: min(92vw, 520px);
  min-height: 300px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 14px 14px;
  background: #ffffff;
  box-shadow: 0 10px 24px rgba(0,0,0,0.06);
}


.panelTitle {
  margin: 2px 0 10px;
  font-size: 18px;
  font-weight: 800;
}

.empty {
  color: #6b7280;
  font-size: 14px;
  padding: 8px 2px;
}

.list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.item {
  border-top: 1px dashed #e5e7eb;
  padding-top: 10px;
}

.line {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 13px;
  color: #111827;
}

.sub {
  margin-top: 4px;
  font-size: 12px;
  color: #6b7280;
}
</style>
