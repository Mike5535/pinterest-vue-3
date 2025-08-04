<script setup lang="ts">
import { useSortImages } from './hook';

const { mainPageRef, orderedIndexes, refArray } = useSortImages();
</script>

<template>
  <div ref="mainPageRef" class="main-page">
    <img
      v-for="(i, key) in orderedIndexes"
      :ref="
        (el) => {
          if (el) {
            refArray[i] = el as Element;
          }
        }
      "
      :key="key"
      class="main-page__image"
      :src="`images/${i + 1}.jpg`"
    />
  </div>
</template>
