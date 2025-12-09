<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  getStreamLink,
  getTrendingDramas,
  getLatestDramas,
} from "../lib/api/dramabox";
import { processDramas } from "../lib/utils";

const route = useRoute();
const router = useRouter();
const bookId = ref("");
const currentEpisode = ref(1);
const streamUrl = ref("");
const loading = ref(false);
const error = ref(null);
const videoPlayer = ref(null);

const episodes = ref([]);
const qualities = ref([]);
const selectedQuality = ref(null);

const mergeEpisodes = (newEpisodes) => {
  if (episodes.value.length === 0) {
    episodes.value = newEpisodes;
    return;
  }
  const existingMap = new Map(episodes.value.map((e) => [e.chapterIndex, e]));
  newEpisodes.forEach((e) => existingMap.set(e.chapterIndex, e));
  episodes.value = Array.from(existingMap.values()).sort(
    (a, b) => a.chapterIndex - b.chapterIndex
  );
};

const selectBestQuality = (cdnData) => {
  if (!cdnData || !cdnData.videoPathList) return null;

  const sortedQualities = cdnData.videoPathList.sort(
    (a, b) => b.quality - a.quality
  );
  qualities.value = sortedQualities;

  let target = null;
  if (selectedQuality.value) {
    target = sortedQualities.find(
      (q) => q.quality === selectedQuality.value.quality
    );
  }

  if (!target) {
    target =
      sortedQualities.find((q) => q.isDefault === 1) || sortedQualities[0];
  }

  return target;
};

const loadStream = async () => {
  if (!bookId.value) return;

  loading.value = true;
  error.value = null;
  streamUrl.value = "";

  try {
    const res = await getStreamLink(bookId.value, currentEpisode.value);
    if (Array.isArray(res)) {
      mergeEpisodes(res);

      const epIndex = currentEpisode.value - 1;
      const currentEpData = episodes.value.find(
        (e) => e.chapterIndex === epIndex
      );

      if (currentEpData && currentEpData.cdnList) {
        const defaultCdn =
          currentEpData.cdnList.find((c) => c.isDefault === 1) ||
          currentEpData.cdnList[0];

        const targetQuality = selectBestQuality(defaultCdn);

        if (targetQuality) {
          selectedQuality.value = targetQuality;
          streamUrl.value = targetQuality.videoPath;
        } else {
          error.value = "No video source found.";
        }
      } else {
        error.value = "Episode data not available.";
      }
    } else {
      error.value = "Invalid response format.";
    }
  } catch (e) {
    error.value = "Failed to load stream.";
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const changeEpisode = (ep) => {
  if (ep < 1) return;
  currentEpisode.value = ep;
  router.push({ query: { ...route.query, episode: ep } });
};

const setQuality = (q) => {
  if (videoPlayer.value) {
    const currentTime = videoPlayer.value.currentTime;
    const isPaused = videoPlayer.value.paused;

    selectedQuality.value = q;
    streamUrl.value = q.videoPath;

    // Restore time after DOM update
    setTimeout(() => {
      if (videoPlayer.value) {
        videoPlayer.value.currentTime = currentTime;
        if (!isPaused) videoPlayer.value.play();
      }
    }, 100);
  } else {
    selectedQuality.value = q;
    streamUrl.value = q.videoPath;
  }
};

onMounted(async () => {
  bookId.value = route.query.bookId;
  currentEpisode.value = parseInt(route.query.episode) || 1;

  const count = parseInt(route.query.chapterCount);
  if (count && !isNaN(count)) {
    episodes.value = Array.from({ length: count }, (_, i) => ({
      chapterIndex: i,
      chapterName: `EP ${i + 1}`,
      isPlaceholder: true,
    }));
  } else {
    // Try to find chapter count from other sources if not provided
    try {
      const [trending, latest] = await Promise.all([
        getTrendingDramas(),
        getLatestDramas(),
      ]);

      const allDramas = [
        ...(Array.isArray(trending) ? trending : trending.data || []),
        ...(Array.isArray(latest) ? latest : latest.data || []),
      ];

      const flatDramas = processDramas(allDramas);

      const found = flatDramas.find((d) => d.bookId === bookId.value);
      if (found && found.chapterCount) {
        episodes.value = Array.from({ length: found.chapterCount }, (_, i) => ({
          chapterIndex: i,
          chapterName: `EP ${i + 1}`,
          isPlaceholder: true,
        }));
      }
    } catch (e) {
      console.warn("Could not fetch drama details for chapter count", e);
    }
  }

  loadStream();
});

watch(
  () => route.query.episode,
  (newEp) => {
    currentEpisode.value = parseInt(newEp) || 1;
    loadStream();
  }
);
</script>

<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-lg-10">
        <div class="ratio ratio-16x9 bg-black mb-3">
          <video
            v-if="streamUrl"
            controls
            controlsList="nodownload"
            @contextmenu.prevent
            autoplay
            :src="streamUrl"
            ref="videoPlayer"
          ></video>
          <div
            v-else
            class="d-flex align-items-center justify-content-center text-white"
          >
            <div v-if="loading" class="spinner-border text-light" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <div v-else-if="error" class="text-danger">{{ error }}</div>
            <div v-else>Select an episode to play</div>
          </div>
        </div>

        <div class="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mb-3">
          <div class="d-flex align-items-center gap-3">
            <button
              class="btn btn-outline-dark"
              @click="changeEpisode(currentEpisode - 1)"
              :disabled="currentEpisode <= 1"
            >
              <i class="bi bi-chevron-left"></i> Prev
            </button>
            <h5 class="m-0 text-center">Now Playing Eps {{ currentEpisode }}</h5>
            <button
              class="btn btn-outline-dark"
              @click="changeEpisode(currentEpisode + 1)"
              :disabled="
                episodes.length > 0 && currentEpisode >= episodes.length
              "
            >
              Next <i class="bi bi-chevron-right"></i>
            </button>
          </div>

          <div v-if="qualities.length > 0" class="btn-group">
            <button
              v-for="q in qualities"
              :key="q.quality"
              class="btn btn-sm"
              :class="
                selectedQuality && selectedQuality.quality === q.quality
                  ? 'btn-primary'
                  : 'btn-outline-primary'
              "
              @click="setQuality(q)"
            >
              {{ q.quality }}p
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
