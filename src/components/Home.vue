<script setup>
import { ref, onMounted } from "vue";
import { getLatestDramas, getTrendingDramas } from "../lib/api/dramabox";
import { processDramas } from "../lib/utils";
import DramaList from "./DramaList.vue";

const trendingDramas = ref([]);
const latestDramas = ref([]);
const loadingTrending = ref(true);
const loadingLatest = ref(true);
const trendingError = ref(null);
const latestError = ref(null);

onMounted(async () => {
  try {
    const trendingRes = await getTrendingDramas();
    // Handle if response is wrapped in { data: ... } or is the array directly
    const rawTrending = trendingRes.data || trendingRes;
    trendingDramas.value = processDramas(rawTrending);
  } catch (e) {
    trendingError.value = "Failed to load trending dramas.";
    console.error(e);
  } finally {
    loadingTrending.value = false;
  }

  try {
    const latestRes = await getLatestDramas();
    const rawLatest = latestRes.data || latestRes;
    latestDramas.value = processDramas(rawLatest);
  } catch (e) {
    latestError.value = "Failed to load latest dramas.";
    console.error(e);
  } finally {
    loadingLatest.value = false;
  }
});
</script>

<template>
  <div>
    <div class="mb-5">
      <h2 class="mb-3">
        <i class="bi bi-fire text-danger"></i> Trending Drama
      </h2>
      <div v-if="loadingTrending" class="text-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      <div v-else-if="trendingError" class="alert alert-danger">
        {{ trendingError }}
      </div>
      <DramaList v-else :dramas="trendingDramas" />
    </div>

    <div class="mb-5">
      <h2 class="mb-3">
        <i class="bi bi-clock-history text-primary"></i> Latest Drama
      </h2>
      <div v-if="loadingLatest" class="text-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      <div v-else-if="latestError" class="alert alert-danger">
        {{ latestError }}
      </div>
      <DramaList v-else :dramas="latestDramas" />
    </div>
  </div>
</template>
