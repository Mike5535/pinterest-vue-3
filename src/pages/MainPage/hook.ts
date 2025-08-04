import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { IndexesCombinationArray } from './types';

const COUNT_IMAGES = 13;

export const useSortImages = () => {
  const loadedImages = ref<{ [key: number]: boolean }>(
    new Array(COUNT_IMAGES).fill(false).reduce((res, val, i) => {
      res[i] = val;
      return res;
    }, {})
  );

  const isAllImagesLoaded = computed(() =>
    (Object.values(loadedImages.value) as Array<(typeof loadedImages)[keyof typeof loadedImages]>).every(
      (val) => val === true
    )
  );

  const mainPageRef = ref<HTMLDivElement>();
  const refArray = ref<Array<Element>>([]);
  const orderedIndexes = ref<Array<number>>(new Array(13).fill(0).map((_, i) => i));

  const fillOrderedIndexes = (sortedIndexesCombinationArray: IndexesCombinationArray) => {
    let localSortedIndexesCombinationArray: IndexesCombinationArray = JSON.parse(
      JSON.stringify(sortedIndexesCombinationArray)
    );
    orderedIndexes.value = [];

    while (orderedIndexes.value.length < COUNT_IMAGES) {
      orderedIndexes.value.push(...localSortedIndexesCombinationArray[0].indexes);

      localSortedIndexesCombinationArray = localSortedIndexesCombinationArray
        .filter(({ indexes }) => !indexes.some((index) => orderedIndexes.value.includes(index)))
        .sort((prev, next) => {
          return next.fullWidth - prev.fullWidth;
        });
    }
  };

  const onResize = () => {
    if (!mainPageRef.value) return;

    const refSizesArray = refArray.value.reduce(
      (refSizesArray, element, i) => {
        if (element) {
          refSizesArray.push({
            size: element.getBoundingClientRect().width,
            id: i
          });
        }

        return refSizesArray;
      },
      [] as Array<{ size: number; id: number }>
    );

    const indexesCombinationArray: IndexesCombinationArray = [];

    let binaryString;
    let indexes;
    for (let i = 0; i < 2 ** COUNT_IMAGES - 1; i++) {
      binaryString = i.toString(2);

      binaryString = '0'.repeat(13 - binaryString.length) + binaryString;
      indexes = [...binaryString.matchAll(/1/g)].map((match) => match.index);

      indexesCombinationArray.push({
        fullWidth: indexes.reduce((res, index) => {
          res += refSizesArray.find(({ id }) => id === index)?.size || 0;

          return res;
        }, 0),
        indexes
      });
    }

    const sortedArray = indexesCombinationArray
      .filter(
        ({ fullWidth, indexes }) =>
          fullWidth < (mainPageRef.value as HTMLDivElement).getBoundingClientRect().width && indexes.length
      )
      .sort((prev, next) => {
        return next.fullWidth - prev.fullWidth;
      });

    fillOrderedIndexes(sortedArray);
  };

  onMounted(() => {
    window.addEventListener('resize', onResize);

    refArray.value.forEach((val, i) => {
      val.addEventListener(
        'load',
        () => {
          loadedImages.value[i] = true;
        },
        true
      );
    });
  });

  onUnmounted(() => {
    window.removeEventListener('resize', onResize);
  });

  watch(isAllImagesLoaded, () => {
    if (isAllImagesLoaded.value) {
      onResize();
    }
  });

  return {
    mainPageRef,
    orderedIndexes,
    refArray
  };
};
