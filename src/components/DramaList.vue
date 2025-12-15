<script setup>
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";

const props = defineProps({
  dramas: {
    type: Array,
    required: true,
    default: () => [],
  },
  itemsPerPage: {
    type: Number,
    default: 12,
  },
});

const router = useRouter();
const currentPage = ref(1);

watch(
  () => props.dramas,
  () => {
    currentPage.value = 1;
  }
);

const totalPages = computed(() =>
  Math.ceil(props.dramas.length / props.itemsPerPage)
);

const paginatedDramas = computed(() => {
  const start = (currentPage.value - 1) * props.itemsPerPage;
  const end = start + props.itemsPerPage;
  return props.dramas.slice(start, end);
});

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const goToStream = (drama) => {
  if (drama.bookId) {
    router.push({
      path: "/stream",
      query: {
        bookId: drama.bookId,
        episode: 1,
        chapterCount: drama.chapterCount,
      },
    });
  } else {
    console.error("No bookId found for drama", drama);
  }
};
</script>

<template>
  <div>
    <div class="row row-cols-2 row-cols-md-4 row-cols-lg-5 g-4">
      <div
        class="col"
        v-for="drama in paginatedDramas"
        :key="drama.bookId || drama.id"
      >
        <div class="card h-100 shadow-sm" @click="goToStream(drama)">
          <img
            :src="
              drama.coverWap || drama.thumb_url || 'https://placehold.co/150'
            "
            class="card-img-top"
            :alt="drama.bookName"
            style="height: 300px; object-fit: cover"
          />
          <div class="card-body">
            <h6 class="card-title text-truncate" :title="drama.bookName">
              {{ drama.bookName }}
            </h6>
            <p class="card-text small text-muted" v-if="drama.author">
              {{ drama.author }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <nav v-if="totalPages > 1" aria-label="Page navigation" class="mt-4">
      <ul class="pagination justify-content-center">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <button
            class="page-link"
            @click="changePage(currentPage - 1)"
            aria-label="Previous"
          >
            <span aria-hidden="true">&laquo;</span>
          </button>
        </li>
        <li class="page-item disabled">
          <span class="page-link"
            >Page {{ currentPage }} of {{ totalPages }}</span
          >
        </li>
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <button
            class="page-link"
            @click="changePage(currentPage + 1)"
            aria-label="Next"
          >
            <span aria-hidden="true">&raquo;</span>
          </button>
        </li>
      </ul>
    </nav>
  </div>
</template>

<style scoped>
.card {
  cursor: pointer;
  transition: transform 0.2s;
}
.card:hover {
  transform: scale(1.05);
}
</style>
