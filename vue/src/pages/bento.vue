<script setup>
  import interact from 'interactjs'
  import { onMounted, ref } from 'vue'

  const GRID_SIZE = 120 // px per grid cell

  const cards = ref([])
  const showGrid = ref(false)

  function addCard () {
    cards.value.push({
      id: Date.now(),
      x: 0,
      y: 0,
    })
  }

  function initDrag () {
    interact('.draggable-card').unset()

    interact('.draggable-card').draggable({
      modifiers: [
        interact.modifiers.snap({
          targets: [
            interact.snappers.grid({ x: GRID_SIZE, y: GRID_SIZE }),
          ],
          range: Infinity,
          // Snap relative to card center
          relativePoints: [{ x: 0.5, y: 0.5 }],
        }),
        interact.modifiers.restrictRect({
          restriction: 'parent',
          endOnly: true,
        }),
      ],
      listeners: {
        start () {
          showGrid.value = true
        },
        move (event) {
          const target = event.target
          const id = Number(target.dataset.id)
          const card = cards.value.find(c => c.id === id)

          card.x += event.dx
          card.y += event.dy
        },
        end () {
          showGrid.value = false
        },
      },
    })
  }

  onMounted(initDrag)
</script>

<template>
  <v-container fluid>
    <v-btn
      class="mb-4"
      color="primary"
      @click="addCard"
    >
      Add Card
    </v-btn>

    <div
      class="grid-board show-grid"
    >
      <!--:class="{ 'show-grid': showGrid }"-->
      <div
        v-for="card in cards"
        :key="card.id"
        class="draggable-card"
        :data-id="card.id"
        :style="{
          transform: `translate(${card.x}px, ${card.y}px)`
        }"
      >
        <v-card
          elevation="4"
          :height="110"
          :width="110"
        >
          <v-card-title>Card</v-card-title>
          <v-card-text>#{{ card.id }}</v-card-text>
        </v-card>
      </div>
    </div>
  </v-container>
</template>

<style scoped>
.grid-board {
  position: relative;
  width: 100%;
  height: 600px;
  overflow: hidden;
}

.draggable-card {
  position: absolute;
  touch-action: none;
  cursor: grab;
}

.draggable-card:active {
  cursor: grabbing;
}
</style>
