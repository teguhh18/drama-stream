<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { searchDramas } from "../lib/api/dramabox";
import DramaList from "./DramaList.vue";

const route = useRoute();
const query = ref("");
const dramas = ref([]);
const loading = ref(false);
const error = ref(null);

const performSearch = async (q) => {
  if (!q) return;
  loading.value = true;
  error.value = null;
  try {
    const res = await searchDramas(q);
    // Handle response which is a direct array
    const rawData = Array.isArray(res) ? res : res.data || [];

    // Map 'cover' to 'coverWap' for DramaList compatibility
    dramas.value = rawData.map((item) => ({
      ...item,
      coverWap: item.coverWap || item.cover,
    }));
  } catch (e) {
    error.value = "Failed to search dramas.";
    console.error(e);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  query.value = route.query.q;
  performSearch(query.value);
});

watch(
  () => route.query.q,
  (newQuery) => {
    query.value = newQuery;
    performSearch(newQuery);
  }
);
</script>

<template>
  <div>
    <h2 class="mb-4">Search Results for "{{ query }}"</h2>

    <div v-if="loading" class="text-center">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-else-if="dramas.length === 0" class="alert alert-info">
      No dramas found.
    </div>

    <DramaList v-else :dramas="dramas" />
  </div>
</template>
