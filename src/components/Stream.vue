<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getStreamLink, getDramaDetail } from "../lib/api/dramabox";

const route = useRoute();
const router = useRouter();
const bookId = ref("");
const currentEpisode = ref(1);
const streamUrl = ref("");
const loading = ref(false);
const error = ref(null);
const videoPlayer = ref(null);

const episodes = ref([]);

const loadStream = async () => {
  if (!bookId.value) return;

  loading.value = true;
  error.value = null;
  streamUrl.value = "";

  try {
    // Fetch episodes if not loaded
    if (episodes.value.length === 0) {
      const detailRes = await getDramaDetail(bookId.value);
      if (
        detailRes &&
        detailRes.data &&
        detailRes.data.video_data &&
        detailRes.data.video_data.video_list
      ) {
        episodes.value = detailRes.data.video_data.video_list.sort(
          (a, b) => a.vid_index - b.vid_index
        );
      } else {
        error.value = "Failed to load episodes.";
        loading.value = false;
        return;
      }
    }

    const currentEpData = episodes.value.find(
      (e) => e.vid_index === currentEpisode.value
    );

    if (currentEpData) {
      const streamRes = await getStreamLink(currentEpData.vid);
      if (streamRes && streamRes.data && streamRes.data.main_url) {
        streamUrl.value = streamRes.data.main_url;
      } else {
        error.value = "Stream not available.";
      }
    } else {
      error.value = "Episode not found.";
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

onMounted(async () => {
  bookId.value = route.query.bookId;
  currentEpisode.value = parseInt(route.query.episode) || 1;
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

        <div
          class="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mb-3"
        >
          <div class="d-flex align-items-center gap-3">
            <button
              class="btn btn-outline-dark"
              @click="changeEpisode(currentEpisode - 1)"
              :disabled="currentEpisode <= 1"
            >
              <i class="bi bi-chevron-left"></i> Prev
            </button>
            <h5 class="m-0 text-center">
              Now Playing Eps {{ currentEpisode }}
            </h5>
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
        </div>
      </div>
    </div>
  </div>
</template>
