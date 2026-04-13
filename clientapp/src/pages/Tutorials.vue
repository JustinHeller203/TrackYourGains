<template>
  <div class="tutorials">
    <h2 class="page-title">Tutorial</h2>
    <div
      v-if="isPhonePreviewTutorialDemo && previewTouch.visible"
      class="preview-touch"
      :style="{ left: `${previewTouch.x}px`, top: `${previewTouch.y}px` }">
      <span class="preview-touch__dot"></span>
    </div>

    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">Tutorial Hub</p>
        <h1>Schneller finden, klarer starten, besser auf dem Handy.</h1>

        <UiSearch
          v-model="searchQuery"
          placeholder="Nach Übung, Kategorie oder Beschreibung suchen…"
          ariaLabel="Tutorial suchen"
          :center="false"
          maxWidth="100%" />

        <div class="hero-actions">
          <button type="button" class="btn primary" @click="scrollToResults">Tutorials ansehen</button>
          <button type="button" class="btn" :class="{ active: showFilters }" @click="showFilters = !showFilters">
            {{ showFilters ? 'Filter ausblenden' : 'Filter einblenden' }}
          </button>
          <button type="button" class="btn" :class="{ active: showUpload }" @click="toggleUpload">
            Eigenes Tutorial
          </button>
        </div>

        <div class="tutorial-level-legend" aria-label="Erklärung der Schwierigkeitsfarben">
          <span class="tutorial-level-legend__item">
            <span class="tutorial-level-legend__swatch is-beginner" aria-hidden="true"></span>
            Anfängerfreundlich
          </span>
          <span class="tutorial-level-legend__item">
            <span class="tutorial-level-legend__swatch is-medium" aria-hidden="true"></span>
            Mittelschwer
          </span>
          <span class="tutorial-level-legend__item">
            <span class="tutorial-level-legend__swatch is-hard" aria-hidden="true"></span>
            Schwer
          </span>
        </div>
      </div>

      <section v-if="showFilters" class="controls controls--hero">
        <div class="controls-top">
          <div class="controls-inline">
            <label class="label" for="tutorial-sort">Sortierung</label>
            <select id="tutorial-sort" v-model="sortMode" class="select">
              <option value="az">A–Z</option>
              <option value="category">Kategorie</option>
              <option value="fav">Favoriten zuerst</option>
              <option v-if="hasRecentViewedTutorials" value="recent">Zuletzt angesehen</option>
            </select>
          </div>
        </div>

        <div class="category-row category-row--chips">
          <button type="button" class="chip" :class="{ active: selectedCategory === 'Alle' }" @click="selectedCategory = 'Alle'">
            Alle
          </button>
          <button
            v-for="c in categories"
            :key="c"
            type="button"
            class="chip"
            :class="{ active: selectedCategory === c }"
            @click="selectedCategory = c">
            {{ c }}
          </button>
        </div>

        <div class="category-select-wrap">
          <label class="label" for="tutorial-category-mobile">Kategorie</label>
          <select id="tutorial-category-mobile" v-model="selectedCategory" class="select">
            <option value="Alle">Alle</option>
            <option v-for="c in categories" :key="`mobile-${c}`" :value="c">{{ c }}</option>
          </select>
        </div>
      </section>

      <div class="hero-side" :class="{ 'hero-side--suppressed': hideQuickstartOnSmallScreens }">
        <div class="starter">
          <p class="eyebrow">Schnellstart</p>
          <h2>{{ featuredSectionTitle }}</h2>
          <p class="starter-note">{{ featuredSectionNote }}</p>
          <div class="starter-list">
            <div
              v-for="tutorial in featuredTutorials"
              :key="tutorial.id"
              class="tutorial-card-shell tutorial-card-shell--starter">
              <div v-if="recentViewedMap[tutorial.id]" class="tutorial-card-top-badge">
                <span class="tutorial-card-top-label">Zuletzt angesehen</span>
              </div>
              <button
                type="button"
                class="starter-card"
                :class="tutorialCardLevelClass(tutorial.level)"
                @click="openTutorial(tutorial)">
                <span class="starter-top">
                  <span class="pill">{{ tutorial.category }}</span>
                </span>
                <div v-if="nonRecentTutorialStatusBadges(tutorial).length" class="tutorial-status-row">
                  <span
                    v-for="badge in nonRecentTutorialStatusBadges(tutorial)"
                    :key="`starter-${tutorial.id}-${badge.kind}`"
                    class="status-pill"
                    :class="`is-${badge.kind}`">
                    {{ badge.label }}
                  </span>
                </div>
                <strong>{{ tutorial.title }}</strong>
                <span>{{ tutorial.description }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section v-if="showUpload" class="upload-panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">Lokale Sammlung</p>
          <h2>Eigenes Tutorial hinzufügen</h2>
        </div>
        <p class="section-note">Wird nur auf diesem Gerät gespeichert.</p>
      </div>

      <div class="upload-grid">
        <div class="field"><label>Titel</label><input v-model="uploadTitle" class="input" placeholder="z. B. Lat Pulldown" /></div>
        <div class="field">
          <label>Kategorie</label>
          <select v-model="uploadCategory" class="input">
            <option value="Oberkörper">Oberkörper</option>
            <option value="Unterkörper">Unterkörper</option>
            <option value="Ganzkörper">Ganzkörper</option>
            <option value="Core">Core</option>
            <option value="Sonstiges">Sonstiges</option>
          </select>
        </div>
        <div class="field">
          <label>Level</label>
          <select v-model="uploadLevel" class="input">
            <option value="">—</option>
            <option value="Anfänger">Anfänger</option>
            <option value="Fortgeschritten">Fortgeschritten</option>
            <option value="Pro">Pro</option>
          </select>
        </div>
        <div class="field wide"><label>Beschreibung</label><input v-model="uploadDesc" class="input" placeholder="Kurz erklären, worauf man achten soll…" /></div>
        <div class="field wide"><label>Equipment</label><input v-model="uploadEquipmentRaw" class="input" placeholder="z. B. Bank, Kurzhanteln" /></div>
        <div class="field wide actions">
          <input id="tutorial-video-file" ref="uploadFileEl" type="file" accept="video/*" class="upload-file-input" @change="onPickVideo" />
          <label for="tutorial-video-file" class="btn">Video auswählen</label>
          <span v-if="uploadFile" class="file-name">{{ uploadFile.name }}</span>
          <button type="button" class="btn primary" :disabled="!canUpload" @click="createUploadedTutorial">Hinzufügen</button>
          <button type="button" class="btn" @click="cancelUpload">Abbrechen</button>
        </div>
        <p v-if="uploadError" class="upload-error">{{ uploadError }}</p>
      </div>
    </section>

    <section v-if="favoriteTutorials.length" class="favorites-panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">Deine Favoriten</p>
        </div>
        <p class="section-note">{{ favoriteTutorials.length }} gespeicherte Tutorials</p>
      </div>

      <div class="starter-list favorites-list" :class="{ 'favorites-list--scroll': favoriteTutorials.length > 4 }">
        <div
          v-for="tutorial in favoriteTutorials"
          :key="`favorite-${tutorial.id}`"
          class="tutorial-card-shell tutorial-card-shell--starter">
          <div v-if="recentViewedMap[tutorial.id]" class="tutorial-card-top-badge">
            <span class="tutorial-card-top-label">Zuletzt angesehen</span>
          </div>
          <button
            type="button"
            class="starter-card"
            :class="tutorialCardLevelClass(tutorial.level)"
            @click="openTutorial(tutorial)">
            <span class="starter-top">
              <span class="pill">{{ tutorial.category }}</span>
            </span>
            <div v-if="nonRecentTutorialStatusBadges(tutorial).length" class="tutorial-status-row">
              <span
                v-for="badge in nonRecentTutorialStatusBadges(tutorial)"
                :key="`favorite-${tutorial.id}-${badge.kind}`"
                class="status-pill"
                :class="`is-${badge.kind}`">
                {{ badge.label }}
              </span>
            </div>
            <strong>{{ tutorial.title }}</strong>
            <span>{{ tutorial.description }}</span>
          </button>
        </div>
      </div>
    </section>

    <section ref="resultsRef" class="results">
      <div class="section-head">
        <div>
          <p class="eyebrow">{{ resultsEyebrow }}</p>
          <h2>{{ resultsHeadline }}</h2>
        </div>
        <p class="section-note">{{ resultsSectionNote }}</p>
      </div>

      <div v-if="filteredTutorials.length === 0" class="empty-state">
        <h3>Keine Treffer gefunden</h3>
        <p>Probiere eine andere Kategorie oder setze die Filter zurück.</p>
        <button type="button" class="btn" @click="resetFilters">Filter zurücksetzen</button>
      </div>

      <div v-else>
        <div class="tutorials-grid" :class="{ 'tutorials-grid--scroll': filteredTutorials.length > 6 }">
          <div
            v-for="tutorial in visibleTutorials"
            :key="tutorial.id"
            class="tutorial-card-shell">
            <div v-if="recentViewedMap[tutorial.id]" class="tutorial-card-top-badge">
              <span class="tutorial-card-top-label">Zuletzt angesehen</span>
            </div>
            <article
              class="tutorial-card"
              :class="tutorialCardLevelClass(tutorial.level)"
              role="button"
              tabindex="0"
              @click="openTutorial(tutorial)"
              @keydown.enter.prevent="openTutorial(tutorial)"
              @keydown.space.prevent="openTutorial(tutorial)">
            <div class="card-media">
              <iframe
                v-if="tutorial.videoUrl && isYouTubeEmbed(tutorial.videoUrl)"
                :src="tutorial.videoUrl"
                class="video-frame"
                frameborder="0"
                allowfullscreen
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerpolicy="strict-origin-when-cross-origin"
                @click.stop />

              <video v-else-if="tutorial.videoUrl" class="video-frame" controls playsinline preload="metadata" @click.stop>
                <source :src="tutorial.videoUrl" />
              </video>

              <div v-else class="video-placeholder"><p>Video folgt</p></div>

              <div class="media-top">
                <span class="pill media-pill" :class="`is-${normalizeText(tutorial.category).replace(/\s+/g, '-')}`">{{ tutorial.category }}</span>
                <span class="badge">{{ tutorial.videoUrl ? 'Video' : 'Bald' }}</span>
              </div>
            </div>

            <div class="card-body">
              <div class="card-head">
                <div>
                  <h3>{{ tutorial.title }}</h3>
                  <p class="card-text">{{ tutorial.description }}</p>
                </div>
                <FavoriteButton
                  :active="isFavorite(tutorial.id)"
                  titleActive="Aus Favoriten entfernen"
                  titleInactive="Zu Favoriten hinzufügen"
                  @toggle="toggleFavorite(tutorial.id)" />
              </div>

              <div class="card-actions">
                <button type="button" class="btn primary" @click.stop="openTutorial(tutorial)">Ansehen</button>
                <button type="button" class="btn" :disabled="!tutorial.videoUrl" @click.stop="openOnYouTube(tutorial)">Öffnen</button>
                <button type="button" class="btn" @click.stop="copyLink(tutorial)">Link</button>
                <button v-if="tutorial.source === 'custom'" type="button" class="btn danger" @click.stop="deleteTutorial(tutorial)">Löschen</button>
              </div>
            </div>
            </article>
          </div>
        </div>

        <div v-if="canLoadMore || canCollapseTutorials" class="results-more">
          <button type="button" class="btn" @click="loadMoreTutorials">Mehr Tutorials laden</button>
          <button v-if="canCollapseTutorials" type="button" class="btn" @click="collapseTutorials">Weniger anzeigen</button>
        </div>
      </div>

      <TutorialDetailsPopup
        :show="!!activeTutorial"
        :tutorial="activeTutorial"
        :related-tutorials="similarTutorials"
        :status-badges="activeTutorial ? tutorialStatusBadges(activeTutorial) : []"
        :status-badge-resolver="tutorialStatusBadges"
        :favorite-active="activeTutorial ? isFavorite(activeTutorial.id) : false"
        :show-favorite="!!activeTutorial"
        :show-delete="activeTutorial?.source === 'custom'"
        :overlay-class="tutorialPopupOverlayClass"
        @close="closeTutorial"
        @open="openTutorial"
        @toggle-favorite="toggleFavorite($event.id)"
        @open-video="openOnYouTube"
        @copy-link="copyLink"
        @delete="deleteTutorial" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import UiSearch from '@/components/ui/kits/UiSearch.vue'
import FavoriteButton from '@/components/ui/buttons/FavoriteButton.vue'
import PopupActionButton from '@/components/ui/buttons/popup/PopupActionButton.vue'
import TutorialDetailsPopup from '@/components/ui/popups/tutorial/TutorialDetailsPopup.vue'
import { useTrainingPlansStore } from '@/store/trainingPlansStore'
import { useAuthStore } from '@/store/authStore'
import { beginGlobalLoading, endGlobalLoading } from '@/lib/api'
import { getProfile, updateProfile } from '@/services/profile'
import { getSimilarTutorials, mergeTutorialsWithExerciseLibrary, normalizeTutorialText } from '@/services/tutorialEntries'
import type { TutorialEntry, TutorialStatusBadge } from '@/types/tutorials'
import type { TrainingPlan as TrainingPlanDto } from '@/types/trainingPlan'

type StoredVideo = { id: string; blob: Blob; type: string; createdAt: number }

const route = useRoute()
const auth = useAuthStore()
const trainingPlansStore = useTrainingPlansStore()
const INITIAL_VISIBLE_TUTORIALS = 8
const LOAD_MORE_STEP = 6
const tutorials = ref<TutorialEntry[]>([])
const searchQuery = ref('')
const selectedCategory = ref<string>('Alle')
const sortMode = ref<'az' | 'category' | 'fav' | 'recent'>('az')
const showUpload = ref(false)
const showFilters = ref(false)
const visibleCount = ref(INITIAL_VISIBLE_TUTORIALS)
const activeTutorial = ref<TutorialEntry | null>(null)
const previewTutorialFullscreen = ref(false)
const resultsRef = ref<HTMLElement | null>(null)
const tutorialPopupOverlayClass = computed<Record<string, boolean>>(() => ({
  'tutorial-popup': true,
  'tutorial-popup--preview-fullscreen': previewTutorialFullscreen.value,
}))

const uploadTitle = ref('')
const uploadDesc = ref('')
const uploadCategory = ref<'Oberkörper' | 'Unterkörper' | 'Ganzkörper' | 'Core' | 'Sonstiges'>('Oberkörper')
const uploadLevel = ref<'' | 'Anfänger' | 'Fortgeschritten' | 'Pro'>('')
const uploadEquipmentRaw = ref('')
const uploadFileEl = ref<HTMLInputElement | null>(null)
const uploadFile = ref<File | null>(null)
const uploadError = ref('')

const previewTutorialTimers: number[] = []
const previewTouch = ref({ visible: false, x: 0, y: 0 })
const LS_CUSTOM = 'tutorials:custom-v1'
const LS_FAVS = 'tutorials:favorites'
const LS_RECENT = 'tutorials:last-viewed-v1'
const favoriteIds = ref<number[]>([])
const recentViewedMap = ref<Record<number, string>>({})
const objectUrls = new Set<string>()
const tutorialPrefsLoaded = ref(false)
let tutorialPrefsSaveTimer: number | null = null

const isPhonePreviewTutorialDemo = computed(() => route.query.preview === 'phone' && route.query.demo === 'tutorial')
const canUpload = computed(() => !!uploadFile.value && uploadTitle.value.trim().length >= 2)
function normalizeText(value: string) {
  return normalizeTutorialText(value)
}
function daysSinceIso(iso: string | null | undefined) {
  const ts = Date.parse(String(iso ?? ''))
  if (!Number.isFinite(ts)) return Number.POSITIVE_INFINITY
  return (Date.now() - ts) / 86400000
}
function isPlanTutorialMatch(tutorial: TutorialEntry, needle: string) {
  const normalizedNeedle = normalizeText(needle)
  if (!normalizedNeedle || normalizedNeedle.length < 3) return false
  const haystack = [
    tutorial.title,
    tutorial.description,
    tutorial.category,
    ...(tutorial.matchTerms ?? []),
  ].map(normalizeText)
  return haystack.some(entry =>
    entry.includes(normalizedNeedle)
    || normalizedNeedle.includes(entry)
    || entry.split(' ').some(part => part.length >= 4 && normalizedNeedle.includes(part))
  )
}
const sortedPlans = computed(() =>
  [...trainingPlansStore.items].sort((a: TrainingPlanDto, b: TrainingPlanDto) => {
    const favDelta = Number(b.isFavorite) - Number(a.isFavorite)
    if (favDelta !== 0) return favDelta
    return String(b.updatedUtc ?? '').localeCompare(String(a.updatedUtc ?? ''))
  })
)
const recentPlans = computed(() => sortedPlans.value.filter((plan: TrainingPlanDto) => daysSinceIso(plan.updatedUtc) <= 21))
const inactivePlans = computed(() => sortedPlans.value.filter((plan: TrainingPlanDto) => daysSinceIso(plan.updatedUtc) > 21))
const planMatchedTutorials = computed(() => {
  const scored = new Map<number, { tutorial: TutorialEntry; score: number }>()
  const candidates = sortedPlans.value.slice(0, 6)

  for (const [planIndex, plan] of candidates.entries()) {
    const planWeight = daysSinceIso(plan.updatedUtc) <= 21 ? 12 - planIndex : 6 - Math.min(planIndex, 3)
    const rawTerms = [
      plan.name,
      ...(plan.days ?? []).flatMap(day => day.exercises.map(ex => ex.name)),
    ]
    const terms = rawTerms
      .map(normalizeText)
      .filter(term => term.length >= 3)

    for (const tutorial of tutorials.value) {
      let score = 0
      for (const term of terms) {
        if (isPlanTutorialMatch(tutorial, term)) score += planWeight
      }
      if (score <= 0) continue
      const current = scored.get(tutorial.id)
      if (!current || score > current.score) scored.set(tutorial.id, { tutorial, score })
    }
  }

  return [...scored.values()]
    .sort((a, b) => b.score - a.score || a.tutorial.title.localeCompare(b.tutorial.title, 'de'))
    .map(entry => entry.tutorial)
})
const planMatchedTutorialIds = computed(() => new Set(planMatchedTutorials.value.map(tutorial => tutorial.id)))
const popularTutorialIds = computed(() => {
  const ranked = tutorials.value
    .filter(tutorial => (tutorial.communityScore ?? 0) > 0)
    .sort((a, b) => (b.communityScore ?? 0) - (a.communityScore ?? 0) || a.title.localeCompare(b.title, 'de'))
    .slice(0, 6)
  return new Set(ranked.map(tutorial => tutorial.id))
})
const featuredSectionTitle = computed(() => {
  if (planMatchedTutorials.value.length) return 'Passend zu deinen Plänen'
  return 'Gute erste Tutorials'
})
const featuredSectionNote = computed(() => {
  if (recentPlans.value.length) {
    const names = recentPlans.value.slice(0, 2).map(plan => plan.name).join(' und ')
    return `Basierend auf deinen zuletzt aktiven Plänen wie ${names}.`
  }
  if (inactivePlans.value.length) {
    const names = inactivePlans.value.slice(0, 2).map(plan => plan.name).join(' und ')
    return `Motivations-Boost aus älteren Plänen wie ${names}, damit du leichter wieder einsteigen kannst.`
  }
  return 'Ein ruhiger Einstieg mit soliden Basics für Oberkörper, Unterkörper und Ganzkörper.'
})
const hideQuickstartOnSmallScreens = computed(() =>
  showFilters.value || showUpload.value || searchQuery.value.trim().length > 0
)
const featuredTutorials = computed(() => {
  if (planMatchedTutorials.value.length) return planMatchedTutorials.value.slice(0, 4)
  const preferred = tutorials.value.filter(t => t.level === 'Anfänger' || t.category === 'Ganzkörper')
  return (preferred.length >= 4 ? preferred : tutorials.value).slice(0, 4)
})
const favoriteTutorials = computed(() =>
  tutorials.value
    .filter(t => isFavorite(t.id))
    .sort((a, b) => a.title.localeCompare(b.title, 'de'))
)
const similarTutorials = computed(() => getSimilarTutorials(tutorials.value, activeTutorial.value, 3))
const resultsHeadline = computed(() => {
  if (searchQuery.value.trim()) return `Suchergebnisse für "${searchQuery.value.trim()}"`
  if (selectedCategory.value !== 'Alle') return `${selectedCategory.value} entdecken`
  return 'Alle Tutorials'
})
const resultsEyebrow = computed(() => {
  if (!searchQuery.value.trim() && selectedCategory.value === 'Alle' && sortMode.value === 'az') return 'Beliebt in der Community'
  return 'Sammlung'
})
const resultsSectionNote = computed(() => {
  const countText = `${filteredTutorials.value.length} von ${tutorials.value.length} Tutorials sichtbar`
  return countText
})
const hasRecentViewedTutorials = computed(() => Object.keys(recentViewedMap.value).length > 0)
const categories = computed(() => Array.from(new Set(tutorials.value.map(t => t.category))).sort((a, b) => a.localeCompare(b, 'de')))
const filteredTutorials = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  let list = tutorials.value.slice()
  if (q) list = list.filter(t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q))
  if (selectedCategory.value !== 'Alle') list = list.filter(t => t.category === selectedCategory.value)
  if (sortMode.value === 'az') list.sort((a, b) => Number(popularTutorialIds.value.has(b.id)) - Number(popularTutorialIds.value.has(a.id)) || a.title.localeCompare(b.title, 'de'))
  else if (sortMode.value === 'category') list.sort((a, b) => (a.category + a.title).localeCompare(b.category + b.title, 'de'))
  else if (sortMode.value === 'recent') list.sort((a, b) => String(recentViewedMap.value[b.id] ?? '').localeCompare(String(recentViewedMap.value[a.id] ?? '')) || a.title.localeCompare(b.title, 'de'))
  else list.sort((a, b) => Number(isFavorite(b.id)) - Number(isFavorite(a.id)) || a.title.localeCompare(b.title, 'de'))
  return list
})
const visibleTutorials = computed(() => filteredTutorials.value.slice(0, visibleCount.value))
const canLoadMore = computed(() => visibleTutorials.value.length < filteredTutorials.value.length)
const canCollapseTutorials = computed(() => filteredTutorials.value.length > INITIAL_VISIBLE_TUTORIALS && visibleCount.value > INITIAL_VISIBLE_TUTORIALS)

function toggleUpload() {
  showUpload.value = !showUpload.value
  uploadError.value = ''
}
function loadMoreTutorials() { visibleCount.value += LOAD_MORE_STEP }
function collapseTutorials() { visibleCount.value = INITIAL_VISIBLE_TUTORIALS }
function resetFilters() {
  searchQuery.value = ''
  selectedCategory.value = 'Alle'
  sortMode.value = 'az'
  visibleCount.value = INITIAL_VISIBLE_TUTORIALS
}
function scrollToResults() {
  const target = resultsRef.value
  if (!target) return
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const top = target.getBoundingClientRect().top + window.scrollY - 24
  window.scrollTo({ top, behavior: prefersReduced ? 'auto' : 'smooth' })
}
function formatLastViewedLabel(iso: string) {
  return 'Zuletzt angesehen'
}
function tutorialStatusBadges(tutorial: TutorialEntry): TutorialStatusBadge[] {
  const badges: TutorialStatusBadge[] = []
  const lastViewed = recentViewedMap.value[tutorial.id]
  if (lastViewed) badges.push({ kind: 'recent', label: formatLastViewedLabel(lastViewed) })
  if (planMatchedTutorialIds.value.has(tutorial.id)) badges.push({ kind: 'plan', label: 'Für deinen Plan empfohlen' })
  return badges
}
function nonRecentTutorialStatusBadges(tutorial: TutorialEntry) {
  return tutorialStatusBadges(tutorial).filter((badge) => badge.kind !== 'recent')
}
function normalizeFavoriteIds(raw: unknown) {
  if (!Array.isArray(raw)) return []
  return raw
    .map((value) => Number(value))
    .filter((value, index, list) => Number.isInteger(value) && value > 0 && list.indexOf(value) === index)
}
function normalizeRecentViewed(raw: unknown): Record<number, string> {
  if (!raw || typeof raw !== 'object') return {}
  const entries = Object.entries(raw as Record<string, unknown>)
    .map(([key, value]) => [Number(key), String(value ?? '')] as const)
    .filter(([id, iso]) => Number.isInteger(id) && id > 0 && !!iso && Number.isFinite(Date.parse(iso)))
    .sort((a, b) => Date.parse(b[1]) - Date.parse(a[1]))
    .slice(0, 60)

  return Object.fromEntries(entries) as Record<number, string>
}
function readLocalRecentViews() {
  try {
    const raw = localStorage.getItem(LS_RECENT)
    return normalizeRecentViewed(raw ? JSON.parse(raw) : {})
  } catch {
    return {}
  }
}
function readLocalFavoriteIds() {
  try {
    const raw = localStorage.getItem(LS_FAVS)
    return normalizeFavoriteIds(raw ? JSON.parse(raw) : [])
  } catch {
    return []
  }
}
function persistRecentViews() {
  localStorage.setItem(LS_RECENT, JSON.stringify(recentViewedMap.value))
}
function persistFavorites() {
  localStorage.setItem(LS_FAVS, JSON.stringify(favoriteIds.value))
}
function applyTutorialPreferences(nextFavoriteIds: number[], nextRecentViewed: Record<number, string>, persistLocal = true) {
  favoriteIds.value = normalizeFavoriteIds(nextFavoriteIds)
  recentViewedMap.value = normalizeRecentViewed(nextRecentViewed)
  if (persistLocal) {
    persistFavorites()
    persistRecentViews()
  }
}
async function saveTutorialPreferencesToBackend() {
  if (!auth.user || !tutorialPrefsLoaded.value) return
  await updateProfile({
    tutorialFavoriteIds: favoriteIds.value.slice(),
    tutorialRecentViewed: Object.fromEntries(Object.entries(recentViewedMap.value).map(([id, iso]) => [String(id), iso])),
  })
}
function scheduleTutorialPreferencesSave() {
  persistFavorites()
  persistRecentViews()
  if (!auth.user || !tutorialPrefsLoaded.value) return
  if (tutorialPrefsSaveTimer !== null) window.clearTimeout(tutorialPrefsSaveTimer)
  tutorialPrefsSaveTimer = window.setTimeout(async () => {
    tutorialPrefsSaveTimer = null
    try {
      await saveTutorialPreferencesToBackend()
    } catch (error) {
      console.error('Tutorial preferences could not be saved to backend.', error)
    }
  }, 220)
}
async function loadTutorialPreferences() {
  if (!auth.user) {
    applyTutorialPreferences(readLocalFavoriteIds(), readLocalRecentViews(), true)
    tutorialPrefsLoaded.value = true
    return
  }

  try {
    const profile = await getProfile()
    const remoteFavoriteIds = normalizeFavoriteIds(profile.tutorialFavoriteIds)
    const remoteRecentViewed = normalizeRecentViewed(profile.tutorialRecentViewed)
    const localFavoriteIds = readLocalFavoriteIds()
    const localRecentViewed = readLocalRecentViews()
    const shouldImportLocal = remoteFavoriteIds.length === 0
      && Object.keys(remoteRecentViewed).length === 0
      && (localFavoriteIds.length > 0 || Object.keys(localRecentViewed).length > 0)

    const nextFavoriteIds = shouldImportLocal ? localFavoriteIds : remoteFavoriteIds
    const nextRecentViewed = shouldImportLocal ? localRecentViewed : remoteRecentViewed

    applyTutorialPreferences(nextFavoriteIds, nextRecentViewed, true)
    tutorialPrefsLoaded.value = true

    if (shouldImportLocal) {
      try {
        await saveTutorialPreferencesToBackend()
      } catch (error) {
        console.error('Local tutorial preferences could not be imported to backend.', error)
      }
    }
  } catch (error) {
    console.error('Tutorial preferences could not be loaded from backend.', error)
    applyTutorialPreferences(readLocalFavoriteIds(), readLocalRecentViews(), true)
    tutorialPrefsLoaded.value = true
  }
}
function markTutorialViewed(id: number) {
  recentViewedMap.value = { ...recentViewedMap.value, [id]: new Date().toISOString() }
  scheduleTutorialPreferencesSave()
}
function openTutorial(t: TutorialEntry) {
  activeTutorial.value = t
  markTutorialViewed(t.id)
}
function closeTutorial() {
  activeTutorial.value = null
  previewTutorialFullscreen.value = false
}
function tutorialCardLevelClass(level?: TutorialEntry['level']) {
  if (level === 'Anfänger') return 'tutorial-card--level-beginner'
  if (level === 'Fortgeschritten') return 'tutorial-card--level-medium'
  if (level === 'Pro') return 'tutorial-card--level-hard'
  return ''
}
function movePreviewTouch(selector: string, xFactor = 0.5, yFactor = 0.5) {
  const target = document.querySelector<HTMLElement>(selector)
  if (!target) return
  const rect = target.getBoundingClientRect()
  previewTouch.value = { visible: true, x: rect.left + rect.width * xFactor, y: rect.top + rect.height * yFactor }
}
function queuePreviewTutorialStep(delay: number, task: () => void) { previewTutorialTimers.push(window.setTimeout(task, delay)) }
function clearPreviewTutorialTimers() {
  previewTutorialTimers.forEach(id => window.clearTimeout(id))
  previewTutorialTimers.length = 0
}
function scrollPreviewToElement(selector: string, delay: number, offset = 20) {
  queuePreviewTutorialStep(delay, () => {
    const target = document.querySelector<HTMLElement>(selector)
    if (!target) return
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const top = target.getBoundingClientRect().top + window.scrollY - offset
    window.scrollTo({ top, behavior: prefersReduced ? 'auto' : 'smooth' })
  })
}
function cancelUpload() {
  showUpload.value = false
  uploadError.value = ''
  uploadTitle.value = ''
  uploadDesc.value = ''
  uploadCategory.value = 'Oberkörper'
  uploadLevel.value = ''
  uploadEquipmentRaw.value = ''
  uploadFile.value = null
  if (uploadFileEl.value) uploadFileEl.value.value = ''
}
function onPickVideo(e: Event) {
  uploadError.value = ''
  const input = e.target as HTMLInputElement
  const f = input.files?.[0] ?? null
  uploadFile.value = f
  if (!f) return
  const mb = f.size / (1024 * 1024)
  if (mb > 200) {
    uploadError.value = `Video ist zu groß (${mb.toFixed(1)} MB). Max 200 MB.`
    uploadFile.value = null
    if (uploadFileEl.value) uploadFileEl.value.value = ''
  }
}
function isYouTubeEmbed(url: string) { return url.includes('youtube.com/embed/') }
function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('tyg-tutorials-db', 1)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains('videos')) db.createObjectStore('videos', { keyPath: 'id' })
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}
async function idbPutVideo(id: string, file: File) {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction('videos', 'readwrite')
    tx.objectStore('videos').put({ id, blob: file, type: file.type || 'video/mp4', createdAt: Date.now() } as StoredVideo)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}
async function idbGetVideo(id: string): Promise<StoredVideo | null> {
  const db = await openDb()
  return await new Promise((resolve, reject) => {
    const req = db.transaction('videos', 'readonly').objectStore('videos').get(id)
    req.onsuccess = () => resolve((req.result as StoredVideo) ?? null)
    req.onerror = () => reject(req.error)
  })
}
async function idbDeleteVideo(id: string) {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction('videos', 'readwrite')
    tx.objectStore('videos').delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}
function persistCustomTutorials(list: Array<Omit<TutorialEntry, 'videoUrl'> & { videoRef?: string | null }>) {
  localStorage.setItem(LS_CUSTOM, JSON.stringify(list))
}
function loadCustomTutorials(): Array<Omit<TutorialEntry, 'videoUrl'> & { videoRef?: string | null }> {
  try {
    const raw = localStorage.getItem(LS_CUSTOM)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch { return [] }
}
async function hydrateCustomTutorials() {
  for (const item of loadCustomTutorials()) {
    let videoUrl: string | null = null
    if (item.videoRef) {
      const stored = await idbGetVideo(item.videoRef)
      if (stored?.blob) {
        const url = URL.createObjectURL(stored.blob)
        objectUrls.add(url)
        videoUrl = url
      }
    }
    tutorials.value.unshift({ ...item, videoUrl, source: 'custom', videoRef: item.videoRef ?? null })
  }
}
async function createUploadedTutorial() {
  uploadError.value = ''
  const file = uploadFile.value
  const title = uploadTitle.value.trim()
  if (!file || title.length < 2) return
  const id = Date.now()
  const videoRef = `vid_${id}`
  try {
    await idbPutVideo(videoRef, file)
    const url = URL.createObjectURL(file)
    objectUrls.add(url)
    const equipment = uploadEquipmentRaw.value.split(',').map(s => s.trim()).filter(Boolean)
    const t: TutorialEntry = { id, title, description: uploadDesc.value.trim() || 'User Upload', videoUrl: url, category: uploadCategory.value, level: uploadLevel.value || undefined, equipment: equipment.length ? equipment : undefined, source: 'custom', videoRef }
    tutorials.value.unshift(t)
    const current = loadCustomTutorials()
    current.unshift({ id: t.id, title: t.title, description: t.description, category: t.category, level: t.level, equipment: t.equipment, videoRef })
    persistCustomTutorials(current)
    cancelUpload()
  } catch (err) {
    uploadError.value = 'Upload speichern hat nicht geklappt (IndexedDB).'
    console.error(err)
  }
}
function isCustomTutorial(t: TutorialEntry) { return t.source === 'custom' }
function isFavorite(id: number) { return favoriteIds.value.includes(id) }
function toggleFavorite(id: number) {
  favoriteIds.value = isFavorite(id) ? favoriteIds.value.filter(x => x !== id) : [...favoriteIds.value, id]
  scheduleTutorialPreferencesSave()
}
async function deleteTutorial(t: TutorialEntry) {
  if (!isCustomTutorial(t)) return
  if (!confirm(`Tutorial "${t.title}" wirklich löschen?`)) return
  tutorials.value = tutorials.value.filter(x => x.id !== t.id)
  favoriteIds.value = favoriteIds.value.filter(x => x !== t.id)
  const nextRecentViewed = { ...recentViewedMap.value }
  delete nextRecentViewed[t.id]
  recentViewedMap.value = nextRecentViewed
  scheduleTutorialPreferencesSave()
  if (activeTutorial.value?.id === t.id) activeTutorial.value = null
  persistCustomTutorials(loadCustomTutorials().filter(x => x.id !== t.id))
  if (t.videoRef) { try { await idbDeleteVideo(t.videoRef) } catch (e) { console.error(e) } }
  if (t.videoUrl?.startsWith('blob:')) {
    try { URL.revokeObjectURL(t.videoUrl) } catch {}
    objectUrls.delete(t.videoUrl)
  }
}
function toYouTubeWatchUrl(embedUrl: string) {
  const m = embedUrl.match(/youtube\.com\/embed\/([^?]+)/)
  return m?.[1] ? `https://www.youtube.com/watch?v=${m[1]}` : embedUrl
}
function openOnYouTube(t: TutorialEntry) {
  if (!t.videoUrl) return
  window.open(isYouTubeEmbed(t.videoUrl) ? toYouTubeWatchUrl(t.videoUrl) : t.videoUrl, '_blank', 'noopener,noreferrer')
}
async function copyLink(t: TutorialEntry) {
  const link = !t.videoUrl ? `${location.origin}${location.pathname}#tutorial-${t.id}` : isYouTubeEmbed(t.videoUrl) ? toYouTubeWatchUrl(t.videoUrl) : t.videoUrl
  try { await navigator.clipboard.writeText(link) } catch {
    const el = document.createElement('textarea')
    el.value = link
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
  }
}
function notifyPreviewTutorialCompleted() {
  if (!isPhonePreviewTutorialDemo.value || typeof window === 'undefined') return
  window.parent?.postMessage?.({ type: 'landing-phone-demo-complete', demo: 'tutorial', run: Number(route.query?.run ?? 0) }, window.location.origin)
}
function startPreviewTutorialDemo() {
  if (!isPhonePreviewTutorialDemo.value) return
  clearPreviewTutorialTimers()
  previewTutorialFullscreen.value = false
  const firstWithVideo = tutorials.value.find(t => !!t.videoUrl) ?? tutorials.value[0] ?? null
  if (!firstWithVideo) return
  scrollPreviewToElement('.results', 520, 24)
  queuePreviewTutorialStep(1600, () => movePreviewTouch('.tutorial-card', 0.5, 0.34))
  queuePreviewTutorialStep(2300, () => openTutorial(firstWithVideo))
  queuePreviewTutorialStep(3250, () => movePreviewTouch('.popup-overlay.tutorial-popup .video-frame', 0.5, 0.34))
  queuePreviewTutorialStep(4300, () => movePreviewTouch('.popup-overlay.tutorial-popup .video-frame', 0.5, 0.34))
  queuePreviewTutorialStep(4700, () => { previewTutorialFullscreen.value = true })
  queuePreviewTutorialStep(6400, notifyPreviewTutorialCompleted)
}

watch([searchQuery, selectedCategory, sortMode], () => { visibleCount.value = INITIAL_VISIBLE_TUTORIALS })
watch(hasRecentViewedTutorials, (hasRecent) => {
  if (!hasRecent && sortMode.value === 'recent') sortMode.value = 'az'
})

onMounted(async () => {
  beginGlobalLoading()
  try {
    await loadTutorialPreferences()
    try { await trainingPlansStore.loadList() } catch {}
    await new Promise(resolve => setTimeout(resolve, 1000))
    tutorials.value = mergeTutorialsWithExerciseLibrary([
    { id: 1, title: 'Bankdrücken', description: 'Lerne die korrekte Technik für Bankdrücken.', videoUrl: 'https://www.youtube.com/embed/Br8FJCuR4a4', category: 'Oberkörper', level: 'Anfänger', equipment: ['Bank', 'Langhantel'], matchTerms: ['bankdrücken', 'bench press', 'chest press', 'brust'], cues: ['Schulterblätter hinten und unten fixieren.', 'Füße fest in den Boden drücken.', 'Stange kontrolliert zur unteren Brust führen.'], steps: ['Sauber auf der Bank einrichten und Griffbreite wählen.', 'Stange ausheben und über der Brust stabilisieren.', 'Langsam ablassen, kurz kontrollieren, kraftvoll hochdrücken.'], mistakes: ['Ellbogen zu weit abspreizen.', 'Po oder Füße verlieren den Kontakt.', 'Stange unkontrolliert auf die Brust fallen lassen.'], source: 'builtin', communityScore: 98 },
    { id: 2, title: 'Kniebeugen', description: 'Meistere die Kniebeuge für starke Beine.', videoUrl: 'https://www.youtube.com/embed/GBsAXMvZGwc', category: 'Unterkörper', level: 'Fortgeschritten', matchTerms: ['kniebeuge', 'squat', 'back squat', 'front squat'], cues: ['Rumpf vor jeder Wiederholung fest anspannen.', 'Knie folgen der Fußspitze.', 'Druck gleichmäßig über den ganzen Fuß halten.'], steps: ['Stand stabil wählen und tief einatmen.', 'Hüfte und Knie gleichzeitig beugen.', 'Kontrolliert in die Tiefe gehen und aus dem Mittelfuß aufstehen.'], mistakes: ['Fersen heben ab.', 'Knie kippen nach innen.', 'Oberkörper kollabiert nach vorn.'], source: 'builtin', communityScore: 97 },
    { id: 3, title: 'Kreuzheben', description: 'Perfektioniere deine Kreuzhebe-Technik.', videoUrl: 'https://www.youtube.com/embed/eUhawFmUXZ0', category: 'Ganzkörper', level: 'Pro', matchTerms: ['kreuzheben', 'deadlift', 'romanian deadlift', 'rdl'], cues: ['Lat aktiv halten und die Stange nah am Körper führen.', 'Rücken neutral, Brust stolz.', 'Druck aus Beinen und Hüfte kombinieren.'], steps: ['Stange über dem Mittelfuß platzieren und Griff setzen.', 'Spannung aufbauen, Hüfte fixieren, Luft holen.', 'Stange eng am Körper hochziehen und kontrolliert absetzen.'], mistakes: ['Runder Rücken beim Abheben.', 'Stange wandert nach vorn weg.', 'Zu frühes Hochschießen der Hüfte.'], source: 'builtin', communityScore: 96 },
    { id: 4, title: 'Schulterdrücken', description: 'Stärke deine Schultern mit dieser Übung.', videoUrl: 'https://www.youtube.com/embed/bdMZfPOGWqw', category: 'Oberkörper', level: 'Fortgeschritten', matchTerms: ['schulterdrücken', 'shoulder press', 'overhead press', 'military press'], cues: ['Rippen unten halten und nicht ins Hohlkreuz fallen.', 'Unterarme unter der Stange oder den Hanteln stapeln.', 'Am oberen Punkt aktiv nach oben arbeiten.'], steps: ['Stand oder Sitz stabil aufbauen.', 'Gewicht auf Schulterhöhe kontrollieren.', 'Über Kopf drücken und sauber in die Startposition zurückführen.'], mistakes: ['Zu starkes Überstrecken im Rücken.', 'Gewicht nach vorn statt über dem Körper führen.', 'Halbe Wiederholungen ohne sauberen Lockout.'], source: 'builtin', communityScore: 84 },
    { id: 5, title: 'Klimmzüge', description: 'Bau deinen Rücken mit Klimmzügen auf.', videoUrl: 'https://www.youtube.com/embed/mWU2888TDLo', category: 'Oberkörper', level: 'Fortgeschritten', matchTerms: ['klimmzug', 'pull up', 'chin up', 'lat'], cues: ['Aus den Schultern aktiv in die Stange ziehen.', 'Rumpf fest und Beine ruhig halten.', 'Brust zur Stange statt Kinn nach vorn schieben.'], steps: ['Aktiv an die Stange hängen und Spannung aufbauen.', 'Schulterblätter nach unten ziehen und hochziehen.', 'Kontrolliert komplett ablassen.'], mistakes: ['Mit Schwung arbeiten.', 'Nur halbe Range of Motion nutzen.', 'Nacken nach vorn strecken.'], source: 'builtin', communityScore: 93 },
    { id: 6, title: 'Ausfallschritte', description: 'Form deine Beine und deinen Po mit Ausfallschritten.', videoUrl: 'https://www.youtube.com/embed/YDaLrvY4UlU', category: 'Unterkörper', level: 'Anfänger', matchTerms: ['ausfallschritt', 'lunge', 'split squat', 'bulgarian split squat'], cues: ['Oberkörper aufrecht halten.', 'Vorderes Knie bleibt über dem Fuß.', 'Mit beiden Beinen aktiv arbeiten.'], steps: ['Stabil hinstellen und einen kontrollierten Schritt setzen.', 'Hinteres Knie Richtung Boden senken.', 'Über das vordere Bein zurückdrücken.'], mistakes: ['Zu kleiner oder zu großer Schritt.', 'Knie kippt nach innen.', 'Gewicht nur auf die Zehen verlagern.'], source: 'builtin', communityScore: 79 },
    { id: 7, title: 'Plank', description: 'Stärke deine Core-Muskulatur mit dem Plank.', videoUrl: 'https://www.youtube.com/embed/iqh1AgblK3w', category: 'Ganzkörper', level: 'Anfänger', matchTerms: ['plank', 'core', 'hollow', 'stütz'], cues: ['Po und Bauch gleichzeitig fest anspannen.', 'Schultern aktiv weg vom Boden drücken.', 'Körper bleibt in einer Linie.'], steps: ['Unterarme unter den Schultern platzieren.', 'Beine strecken und Spannung aufbauen.', 'Position ruhig und stabil halten.'], mistakes: ['Hohlkreuz oder zu hoher Po.', 'Schultern sacken ein.', 'Atmung komplett anhalten.'], source: 'builtin', communityScore: 88 },
    { id: 8, title: 'Bizepscurls', description: 'Trainiere deine Arme mit Curls.', videoUrl: 'https://www.youtube.com/embed/UBE9a2xTEl4', category: 'Oberkörper', level: 'Anfänger', matchTerms: ['bizepscurl', 'curl', 'biceps curl', 'hammer curl'], cues: ['Ellbogen nah am Körper halten.', 'Nur im Ellbogen bewegen.', 'Gewicht kontrolliert absenken.'], steps: ['Stabil stehen und Hanteln ruhig halten.', 'Gewicht ohne Schwung hochcurlen.', 'Langsam in die Streckung zurückführen.'], mistakes: ['Mit dem Oberkörper schwingen.', 'Ellbogen wandern nach vorn.', 'Negativphase fällt zu schnell.'], source: 'builtin', communityScore: 76 },
    { id: 9, title: 'Beinpresse', description: 'Kräftige deine Beine an der Beinpresse.', videoUrl: 'https://www.youtube.com/embed/ai5g8OFbnZI', category: 'Unterkörper', level: 'Anfänger', matchTerms: ['beinpresse', 'leg press'], cues: ['Lendenwirbelsäule bleibt an der Lehne.', 'Knie folgen der Fußlinie.', 'Nicht hart in die Streckung schnappen.'], steps: ['Füße stabil auf die Platte setzen.', 'Schlitten kontrolliert ablassen.', 'Über den ganzen Fuß wieder hochdrücken.'], mistakes: ['Zu tiefe Position mit rundem Becken.', 'Knie nach innen fallen lassen.', 'Gelenke am oberen Punkt überstrecken.'], source: 'builtin' },
    { id: 10, title: 'Burpees', description: 'Ganzkörper-Killerübung für Ausdauer und Kraft.', videoUrl: 'https://www.youtube.com/embed/VkY1YpAjlwg', category: 'Ganzkörper', level: 'Fortgeschritten', matchTerms: ['burpee', 'conditioning', 'hiit'], cues: ['Rhythmus kontrollieren statt hektisch werden.', 'Rumpf auch in der Sprungphase stabil halten.', 'Sauber landen und direkt neu aufbauen.'], steps: ['In die Hocke gehen und Hände zum Boden bringen.', 'Beine zurückspringen und Körper stabilisieren.', 'Wieder vorsetzen, aufstehen und explosiv abspringen.'], mistakes: ['Rücken rund im Übergang zum Boden.', 'Unsaubere Landung auf den Fußballen.', 'Tempo geht vor Technik.'], source: 'builtin' },
    { id: 11, title: 'Rudern am Kabel', description: 'Saubere Zugbewegung für Rücken und Haltung.', videoUrl: 'https://www.youtube.com/embed/VsW98LIzHKA', category: 'Oberkörper', level: 'Anfänger', equipment: ['Kabelzug'], matchTerms: ['rudern', 'seated row', 'cable row', 'row'], cues: ['Brust hoch und Schultern weg von den Ohren.', 'Zieh die Hände zum unteren Brustkorb.', 'Lass das Gewicht kontrolliert zurücklaufen.'], steps: ['Sitz und Griff einstellen.', 'Rumpf aufrecht stabilisieren.', 'Zur Körpermitte ziehen und langsam strecken.'], mistakes: ['Mit Schwung nach hinten reißen.', 'Runder Rücken.', 'Nur aus den Armen ziehen.'], source: 'builtin', communityScore: 81 },
    { id: 12, title: 'Latziehen', description: 'Breiter Rückenaufbau mit stabiler Schulterposition.', videoUrl: 'https://www.youtube.com/embed/VqD9sPjRV9U', category: 'Oberkörper', level: 'Anfänger', equipment: ['Kabelzug'], matchTerms: ['latziehen', 'lat pulldown', 'pulldown'], cues: ['Brust stolz halten und leicht nach hinten lehnen.', 'Ellbogen Richtung Hüfte ziehen.', 'Schultern nicht hochziehen lassen.'], steps: ['Griff setzen und fest unter der Stange sitzen.', 'Stange kontrolliert zur oberen Brust ziehen.', 'Langsam wieder nach oben führen.'], mistakes: ['Stange hinter den Kopf ziehen.', 'Mit Schwung aus dem Oberkörper arbeiten.', 'Oben komplett die Spannung verlieren.'], source: 'builtin', communityScore: 89 },
    { id: 13, title: 'Hip Thrust', description: 'Fokus auf Gesäß und Hüftstreckung mit sauberem Setup.', videoUrl: 'https://www.youtube.com/embed/MsoX1M8_GSs', category: 'Unterkörper', level: 'Fortgeschritten', equipment: ['Bank', 'Langhantel'], matchTerms: ['hip thrust', 'glute bridge', 'glutes'], cues: ['Kinn leicht Richtung Brust halten.', 'Oben Gesäß aktiv anspannen.', 'Schienbein am Top etwa senkrecht.'], steps: ['Rücken an der Bank positionieren und Füße setzen.', 'Gewicht kontrolliert aus der Hüfte anheben.', 'Oben kurz halten und langsam absenken.'], mistakes: ['Zu stark ins Hohlkreuz drücken.', 'Füße stehen zu weit vorn oder hinten.', 'Nur Schwung statt Hüftstreckung nutzen.'], source: 'builtin', communityScore: 86 },
    { id: 14, title: 'Rumänisches Kreuzheben', description: 'Hintere Kette gezielt mit kontrollierter Exzentrik trainieren.', videoUrl: 'https://www.youtube.com/embed/lIUsXvrQXcE', category: 'Unterkörper', level: 'Fortgeschritten', equipment: ['Langhantel'], matchTerms: ['rumänisches kreuzheben', 'romanian deadlift', 'rdl'], cues: ['Hüfte weit nach hinten schieben.', 'Stange eng an den Beinen führen.', 'Leichte Kniebeugung konstant halten.'], steps: ['Stand aufbauen und Spannung im Rücken setzen.', 'Aus der Hüfte nach hinten klappen.', 'Mit Gesäß und Beinbeuger wieder aufrichten.'], mistakes: ['Zu tief gehen und Rücken verlieren.', 'Stange vom Körper wegführen.', 'Beine zu stark beugen wie bei einer Kniebeuge.'], source: 'builtin', communityScore: 85 },
    { id: 15, title: 'Face Pulls', description: 'Schultergesundheit und obere Rückenarbeit verbessern.', videoUrl: 'https://www.youtube.com/embed/RRXyfDlLHwo', category: 'Oberkörper', level: 'Anfänger', equipment: ['Kabelzug'], matchTerms: ['face pull', 'rear delt', 'hintere schulter'], cues: ['Zieh zum Gesicht, Ellbogen hoch.', 'Schultern unten und außenrotiert arbeiten.', 'Am Ende kurz Spannung halten.'], steps: ['Seil auf Gesichtshöhe einstellen.', 'Mit Spannung zurücktreten.', 'Zum Gesicht ziehen und kontrolliert strecken.'], mistakes: ['Zu tief zur Brust ziehen.', 'Schultern hochziehen.', 'Nur aus dem Bizeps arbeiten.'], source: 'builtin' },
    { id: 16, title: 'Dips', description: 'Druckstarke Oberkörperübung für Brust, Schulter und Trizeps.', videoUrl: 'https://www.youtube.com/embed/AloHKkWtUiE', category: 'Oberkörper', level: 'Fortgeschritten', matchTerms: ['dip', 'dips', 'trizeps dips'], cues: ['Schultern stabil halten und nicht einsacken.', 'Brust offen, Rumpf fest.', 'Nur so tief gehen, wie du Kontrolle hast.'], steps: ['In die Stützposition hochdrücken.', 'Ellbogen beugen und kontrolliert ablassen.', 'Kraftvoll zurück in den Stütz drücken.'], mistakes: ['Zu tief in die Schulter fallen.', 'Mit Schwung kippen.', 'Ellbogen unkontrolliert nach außen.'], source: 'builtin' },
    { id: 17, title: 'Trizeps Pushdown', description: 'Isolationsübung für saubere Trizeps-Arbeit am Kabel.', videoUrl: 'https://www.youtube.com/embed/EsIddhEdo1M', category: 'Oberkörper', level: 'Anfänger', equipment: ['Kabelzug'], matchTerms: ['pushdown', 'trizeps', 'triceps pushdown'], cues: ['Ellbogen eng am Körper halten.', 'Nur im Ellbogen arbeiten.', 'Unten komplett durchdrücken und kontrollieren.'], steps: ['Stabil vor dem Kabelzug positionieren.', 'Griff aus der Startposition nach unten drücken.', 'Langsam in die Ausgangsposition zurückführen.'], mistakes: ['Mit dem Oberkörper nachhelfen.', 'Ellbogen wandern nach vorn.', 'Oben komplett Spannung verlieren.'], source: 'builtin' },
    { id: 18, title: 'Seitheben', description: 'Seitliche Schulter kontrolliert ohne Schwung trainieren.', videoUrl: 'https://www.youtube.com/embed/bTYps6PsRZw', category: 'Oberkörper', level: 'Anfänger', equipment: ['Kurzhanteln'], matchTerms: ['seitheben', 'lateral raise', 'schulter'], cues: ['Leicht vor dem Körper arbeiten.', 'Ellbogen führen die Bewegung an.', 'Oben nicht mit Schwung reißen.'], steps: ['Stabil stehen und Hanteln seitlich halten.', 'Kontrolliert bis etwa Schulterhöhe anheben.', 'Langsam wieder absenken.'], mistakes: ['Schwung aus Hüfte oder Rücken.', 'Hanteln zu hoch ziehen.', 'Schultern zu den Ohren hochziehen.'], source: 'builtin' },
    { id: 19, title: 'Wadenheben', description: 'Waden sauber über den vollen Bewegungsradius trainieren.', videoUrl: 'https://www.youtube.com/embed/hYnpAmykqDA', category: 'Unterkörper', level: 'Anfänger', matchTerms: ['wadenheben', 'calf raise', 'calves'], cues: ['Bewusst auf die Zehen drücken.', 'Oben kurz Spannung halten.', 'Unten volle Dehnung nutzen.'], steps: ['Füße stabil platzieren.', 'Fersen maximal anheben.', 'Kontrolliert wieder tief ablassen.'], mistakes: ['Nur kurze Mini-Bewegungen.', 'Mit Schwung wippen.', 'Körpergewicht ungleichmäßig verlagern.'], source: 'builtin' },
    { id: 20, title: 'Leg Curl', description: 'Hamstrings isoliert und kontrolliert stärken.', videoUrl: 'https://www.youtube.com/embed/Uu-wvoXbYTE', category: 'Unterkörper', level: 'Anfänger', equipment: ['Maschine'], matchTerms: ['leg curl', 'beinbeuger', 'hamstring curl'], cues: ['Becken ruhig auf dem Polster halten.', 'Bewegung voll aus den Beinbeugern steuern.', 'Negativphase langsam bremsen.'], steps: ['Maschine auf deine Länge einstellen.', 'Rollen sauber anlegen.', 'Fersen kontrolliert heranziehen und wieder strecken.'], mistakes: ['Po hebt vom Polster ab.', 'Zu schnelles Zurücklassen.', 'Gewicht zu schwer für saubere Kontrolle.'], source: 'builtin' },
    { id: 21, title: 'Leg Extension', description: 'Quadrizeps gezielt mit sauberer Endposition trainieren.', videoUrl: 'https://www.youtube.com/embed/0Yed-nbKN7U', category: 'Unterkörper', level: 'Anfänger', equipment: ['Maschine'], matchTerms: ['leg extension', 'beinstrecker', 'quadrizeps'], cues: ['Sitzposition so einstellen, dass das Knie sauber rotiert.', 'Spannung oben kurz halten.', 'Kontrolliert in die Beugung zurückkehren.'], steps: ['Maschine korrekt einstellen.', 'Unterschenkel nach vorn strecken.', 'Langsam in die Startposition zurückführen.'], mistakes: ['Zu schweres Gewicht mit Schwung.', 'Nur halbe Range nutzen.', 'Im Sitz nach hinten ausweichen.'], source: 'builtin' },
    { id: 22, title: 'Chest Fly', description: 'Brust isoliert mit Spannung über den gesamten Bewegungsradius belasten.', videoUrl: null, category: 'Oberkörper', level: 'Anfänger', matchTerms: ['fly', 'chest fly', 'pec deck'], cues: ['Leichte Beugung im Ellbogen beibehalten.', 'Brust aktiv zusammenführen.', 'Gewicht nicht auf die Schulter schieben.'], steps: ['Stabil aufbauen und Arme leicht gebeugt öffnen.', 'Bogenförmig vor der Brust zusammenführen.', 'Kontrolliert wieder öffnen.'], mistakes: ['Zu gestreckte Arme.', 'Zu tief in die Schulter ziehen.', 'Mit Schwung zusammenschlagen.'], source: 'builtin' },
    { id: 23, title: 'Mountain Climbers', description: 'Core und Kondition als knackiger Finisher.', videoUrl: null, category: 'Ganzkörper', level: 'Fortgeschritten', matchTerms: ['mountain climber', 'conditioning', 'core cardio'], cues: ['Hände fest in den Boden drücken.', 'Becken stabil halten.', 'Tempo nur so hoch wie die Kontrolle sauber bleibt.'], steps: ['In eine stabile hohe Plank gehen.', 'Ein Knie Richtung Brust ziehen.', 'Beine dynamisch wechseln ohne die Linie zu verlieren.'], mistakes: ['Po zu hoch oder zu tief.', 'Hüfte rotiert stark mit.', 'Nur hektisches Zappeln statt sauberer Steps.'], source: 'builtin' },
    { id: 24, title: 'Russian Twists', description: 'Rotationsarbeit für den Rumpf mit sauberer Kontrolle.', videoUrl: null, category: 'Core', level: 'Anfänger', matchTerms: ['russian twist', 'rotation', 'obliques'], cues: ['Rotation aus dem Rumpf statt nur aus den Armen.', 'Brust offen halten.', 'Tempo kontrollieren.'], steps: ['Leicht zurücklehnen und Spannung aufbauen.', 'Von Seite zu Seite rotieren.', 'Mitte jedes Mal kurz kontrollieren.'], mistakes: ['Runder Rücken.', 'Nur Hände schwingen hin und her.', 'Zu viel Schwung statt Kontrolle.'], source: 'builtin' },
    { id: 25, title: 'Bird Dog', description: 'Stabilitätsübung für Core und Rücken mit niedrigem Einstieg.', videoUrl: null, category: 'Core', level: 'Anfänger', matchTerms: ['bird dog', 'stabilität', 'lower back'], cues: ['Becken komplett ruhig halten.', 'Lang in Arm und Bein strecken.', 'Bauch aktiv angespannt lassen.'], steps: ['Im Vierfüßlerstand stabil einrichten.', 'Gegengleichen Arm und Bein strecken.', 'Kurz halten und kontrolliert wechseln.'], mistakes: ['Becken kippt zur Seite.', 'Zu hoch statt lang strecken.', 'Spannung im Rumpf verlieren.'], source: 'builtin' },
    { id: 26, title: 'Glute Bridge', description: 'Einfacher Einstieg für Gesäßaktivierung und Hüftstabilität.', videoUrl: 'https://www.youtube.com/embed/MsoX1M8_GSs', category: 'Unterkörper', level: 'Anfänger', matchTerms: ['glute bridge', 'bridge', 'hip bridge'], cues: ['Fersen aktiv in den Boden drücken.', 'Oben Gesäß fest anspannen.', 'Rippen unten halten.'], steps: ['Rückenlage einnehmen und Füße aufstellen.', 'Hüfte nach oben drücken.', 'Kurz halten und kontrolliert absenken.'], mistakes: ['Nur ins Hohlkreuz schieben.', 'Füße zu weit weg stellen.', 'Oben ohne Spannung sofort ablassen.'], source: 'builtin' },
    { id: 27, title: 'Goblet Squat', description: 'Sehr guter Squat-Einstieg mit sauberer Rumpfspannung.', videoUrl: 'https://www.youtube.com/embed/8VrXHfHH5PM', category: 'Unterkörper', level: 'Anfänger', equipment: ['Kurzhantel'], matchTerms: ['goblet squat', 'squat', 'front squat'], cues: ['Gewicht eng vor dem Körper halten.', 'Brust hoch und Ellbogen unter dem Gewicht.', 'Knie aktiv nach außen führen.'], steps: ['Hantel vor der Brust aufnehmen.', 'Kontrolliert in die Kniebeuge gehen.', 'Über den ganzen Fuß wieder aufstehen.'], mistakes: ['Hantel zu weit weg vom Körper.', 'Rücken rundet unten ein.', 'Knie kollabieren nach innen.'], source: 'builtin', communityScore: 83 },
    { id: 28, title: 'Incline Dumbbell Press', description: 'Obere Brust und Schulterlinie kontrolliert aufbauen.', videoUrl: 'https://www.youtube.com/embed/0WPRqCYF4pA', category: 'Oberkörper', level: 'Fortgeschritten', equipment: ['Bank', 'Kurzhanteln'], matchTerms: ['incline press', 'schrägbank', 'dumbbell press'], cues: ['Schultern stabil in die Bank ziehen.', 'Hanteln kontrolliert leicht bogenförmig bewegen.', 'Handgelenke über den Ellbogen halten.'], steps: ['Bank schräg einstellen und Hanteln sauber aufnehmen.', 'Aus stabiler Schulterposition nach oben drücken.', 'Langsam bis zur Dehnung absenken.'], mistakes: ['Schultern wandern nach vorn.', 'Hanteln stoßen oben unkontrolliert zusammen.', 'Zu steiler Winkel macht es zur Schulterübung.'], source: 'builtin', communityScore: 80 },
  ])
    await hydrateCustomTutorials()
    startPreviewTutorialDemo()
  } finally {
    endGlobalLoading()
  }
})

onBeforeUnmount(() => {
  if (tutorialPrefsSaveTimer !== null) {
    window.clearTimeout(tutorialPrefsSaveTimer)
    tutorialPrefsSaveTimer = null
  }
  clearPreviewTutorialTimers()
  for (const url of objectUrls) URL.revokeObjectURL(url)
  objectUrls.clear()
  document.body.classList.remove('tyg-page-tutorials')
  document.documentElement.classList.remove('tyg-page-tutorials')
})
watch(() => auth.user?.email ?? null, async (next, prev) => {
  if (next === prev) return
  if (tutorialPrefsSaveTimer !== null) {
    window.clearTimeout(tutorialPrefsSaveTimer)
    tutorialPrefsSaveTimer = null
  }
  tutorialPrefsLoaded.value = false
  await loadTutorialPreferences()
})
</script>

<style scoped>
.tutorials{padding:clamp(.9rem,3vw,2.4rem);min-height:100vh;color:var(--text-primary);overflow-x:clip}
.page-title{font-size:2.25rem;font-weight:700;margin:0 0 1rem;text-align:center;color:var(--text-primary);letter-spacing:-.025em}
.controls,.upload-panel{border:1px solid rgba(148,163,184,.2);background:color-mix(in srgb,var(--bg-card) 92%,#081120 8%);box-shadow:0 24px 60px rgba(2,6,23,.16);backdrop-filter:blur(14px)}
.hero,.results,.favorites-panel{position:relative;width:100%;box-sizing:border-box;padding:1.75rem 1.9rem;border-radius:18px;background:radial-gradient(circle at top left,color-mix(in srgb,var(--accent-primary) 9%,transparent),transparent 55%),radial-gradient(circle at bottom right,color-mix(in srgb,var(--accent-secondary) 7%,transparent),transparent 60%),color-mix(in srgb,var(--bg-card) 94%,#020617 6%);border:1px solid rgba(148,163,184,.26);box-shadow:0 18px 40px rgba(15,23,42,.22);transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease}
.hero{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(320px,.95fr);gap:1.4rem;margin-bottom:2rem}
.favorites-panel{margin:0 0 1rem}
.results{margin-top:1.75rem}
.hero-copy{padding:0;color:#f8fafc}
.hero-copy h1{margin:0 0 1.35rem;max-width:13ch;font-size:clamp(2rem,5vw,4rem);line-height:.98;letter-spacing:-.05em}
.hero-text,.section-note,.card-text,.starter-card span:last-child{color:var(--text-secondary);line-height:1.6}
.hero-text{margin:1rem 0 1.2rem;color:rgba(226,232,240,.84)}
.eyebrow{margin:0 0 .45rem;text-transform:uppercase;letter-spacing:.14em;font-size:.74rem;font-weight:800;color:rgba(226,232,240,.72)}
.hero-actions,.chips,.category-row,.actions,.modal-actions{display:flex;flex-wrap:wrap;gap:.7rem}
.hero-actions{margin-top:1rem}
.tutorial-level-legend{display:flex;flex-wrap:wrap;align-items:center;gap:.8rem 1rem;margin-top:1rem;color:rgba(226,232,240,.88);font-size:.84rem;font-weight:700;line-height:1.35}
.tutorial-level-legend__item{display:inline-flex;align-items:center;gap:.45rem;min-height:1.1rem}
.tutorial-level-legend__swatch{width:.9rem;height:.9rem;border-radius:999px;flex:0 0 auto;box-shadow:0 0 0 1px rgba(255,255,255,.08) inset}
.tutorial-level-legend__swatch.is-beginner{background:linear-gradient(135deg,rgba(34,197,94,.96),rgba(74,222,128,.88))}
.tutorial-level-legend__swatch.is-medium{background:linear-gradient(135deg,rgba(234,179,8,.96),rgba(250,204,21,.9))}
.tutorial-level-legend__swatch.is-hard{background:linear-gradient(135deg,rgba(239,68,68,.96),rgba(248,113,113,.9))}
.btn,.chip,.select{border:1px solid rgba(148,163,184,.22);border-radius:999px;min-height:2.8rem;padding:.72rem 1rem;font-weight:800;transition:transform .14s ease,box-shadow .16s ease,border-color .16s ease,background .16s ease}
.btn,.chip{cursor:pointer;background:rgba(255,255,255,.05);color:inherit}
.btn:hover,.chip:hover{transform:translateY(-1px);box-shadow:0 14px 28px rgba(2,6,23,.16)}
.btn.primary{background:rgba(148,163,184,.18);border-color:rgba(148,163,184,.38);color:var(--text-primary);box-shadow:0 0 0 1px rgba(255,255,255,.03) inset}
.btn.primary:hover{background:rgba(148,163,184,.24);border-color:rgba(148,163,184,.52);box-shadow:0 14px 30px rgba(0,0,0,.22),0 0 18px rgba(148,163,184,.12)}
.btn.active,.chip.active{background:rgba(56,189,248,.12);border-color:rgba(56,189,248,.48)}
.btn.danger{background:rgba(239,68,68,.1);border-color:rgba(239,68,68,.24);color:#b91c1c}
.btn:disabled{opacity:.45;cursor:not-allowed;transform:none;box-shadow:none}
.card-actions{display:flex;flex-wrap:wrap;gap:.5rem;justify-content:center;align-items:center;align-self:center;width:100%;margin-top:auto}
.card-actions .btn{flex:0 0 4.85rem;width:4.85rem;min-width:4.85rem;max-width:4.85rem;height:2.1rem;min-height:2.1rem;padding:.35rem .55rem;display:inline-flex;align-items:center;justify-content:center;text-align:center;font-size:.84rem;line-height:1;white-space:nowrap}
.card-actions .btn.danger{flex:1 1 100%;width:100%;min-width:0;max-width:none}
.hero-side,.starter,.controls,.upload-panel{padding:1rem;border-radius:26px}
.hero-side{display:grid;gap:1rem;padding:0;align-self:start}.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:.75rem}
.starter{padding:0;border-radius:0;background:transparent;box-shadow:none;border:0}
.stat,.starter-card,.info-box{border-radius:22px;border:1px solid rgba(148,163,184,.35);background:radial-gradient(circle at top left,color-mix(in srgb,var(--accent-primary) 10%,transparent),transparent 56%),radial-gradient(circle at bottom right,color-mix(in srgb,var(--accent-secondary) 8%,transparent),transparent 60%),color-mix(in srgb,var(--bg-card) 94%,#020617 6%);box-shadow:0 18px 40px rgba(15,23,42,.22);padding:1rem}
.stat{display:grid;gap:.2rem}.stat span,.label,.info-box span{font-size:.82rem;color:var(--text-secondary);font-weight:700}.stat strong{font-size:1.8rem;line-height:1}
.section-head{display:flex;justify-content:space-between;align-items:end;gap:1rem;margin-bottom:1rem}.section-head h2,.starter h2{margin:0;font-size:clamp(1.08rem,2vw,1.55rem);line-height:1.05}
.starter-note{margin:.45rem 0 0;color:var(--text-secondary);line-height:1.55}
.starter-list{display:grid;grid-template-columns:1fr;gap:.75rem;margin-top:.75rem}
.favorites-list .starter-card{min-height:9.75rem;align-content:start}
.favorites-list--scroll{max-height:calc((4 * 9.75rem) + (3 * .75rem));overflow-y:auto;overflow-x:hidden;padding:.2rem .45rem .45rem .1rem;margin:-.2rem -.45rem -.45rem -.1rem;scrollbar-gutter:stable}
.favorites-list--scroll::-webkit-scrollbar{width:.5rem}
.favorites-list--scroll::-webkit-scrollbar-thumb{border-radius:999px;background:rgba(148,163,184,.28)}
.starter-card{text-align:left;cursor:pointer;display:grid;gap:.5rem}.starter-card strong{font-size:1rem}.starter-top,.meta-row,.tutorial-status-row{display:flex;gap:.45rem;flex-wrap:wrap}
.pill,.badge{display:inline-flex;align-items:center;justify-content:center;align-self:flex-start;flex:0 0 auto;min-height:2rem;padding:.35rem .7rem;border-radius:999px;font-size:.78rem;font-weight:800;line-height:1;white-space:nowrap}
.pill{background:rgba(56,189,248,.12);border:1px solid rgba(56,189,248,.2)}.pill.subtle{background:rgba(148,163,184,.08);border:1px solid rgba(148,163,184,.16)}
.pill-muscle{background:rgba(244,114,182,.12);border-color:rgba(244,114,182,.24)}
.badge{background:rgba(15,23,42,.72);color:#f8fafc}
.media-pill{color:#f8fafc;background:rgba(2,6,23,.78);border:1px solid rgba(255,255,255,.18);box-shadow:0 10px 24px rgba(2,6,23,.34);backdrop-filter:blur(10px);text-shadow:0 1px 1px rgba(2,6,23,.35)}
.media-pill.is-oberkorper{background:linear-gradient(135deg,rgba(14,116,144,.92),rgba(56,189,248,.88));border-color:rgba(186,230,253,.55)}
.media-pill.is-unterkorper{background:linear-gradient(135deg,rgba(21,128,61,.94),rgba(34,197,94,.88));border-color:rgba(187,247,208,.5)}
.media-pill.is-ganzkorper{background:linear-gradient(135deg,rgba(67,56,202,.94),rgba(129,140,248,.9));border-color:rgba(199,210,254,.52)}
.media-pill.is-core{background:linear-gradient(135deg,rgba(180,83,9,.94),rgba(245,158,11,.9));border-color:rgba(253,230,138,.52)}
.media-pill.is-sonstiges{background:linear-gradient(135deg,rgba(190,24,93,.94),rgba(244,114,182,.88));border-color:rgba(251,207,232,.5)}
.status-pill{display:inline-flex;align-items:center;justify-content:center;align-self:flex-start;flex:0 0 auto;min-height:2rem;padding:.35rem .7rem;border-radius:999px;font-size:.75rem;font-weight:800;letter-spacing:.01em;border:1px solid rgba(148,163,184,.18);background:rgba(255,255,255,.05);color:var(--text-primary);line-height:1;white-space:nowrap}
.status-pill.is-recent{background:linear-gradient(135deg,color-mix(in srgb,var(--accent-primary) 18%, var(--bg-card) 82%),color-mix(in srgb,var(--accent-secondary) 14%, var(--bg-card) 86%));border-color:color-mix(in srgb,var(--accent-primary) 32%,rgba(148,163,184,.18));color:color-mix(in srgb,var(--text-primary) 88%, white 12%)}
.status-pill.is-plan{background:color-mix(in srgb,#0f172a 76%,#22c55e 24%);border-color:color-mix(in srgb,#22c55e 38%,rgba(148,163,184,.18));color:#dcfce7}
.controls{display:grid;gap:1rem;margin:1.75rem 0 1rem}.controls-top{display:grid;grid-template-columns:1.4fr 220px;gap:1rem}.group{display:grid;gap:.75rem;padding:1rem;border-radius:22px;border:1px solid rgba(148,163,184,.35);background:radial-gradient(circle at top left,color-mix(in srgb,var(--accent-primary) 10%,transparent),transparent 56%),radial-gradient(circle at bottom right,color-mix(in srgb,var(--accent-secondary) 8%,transparent),transparent 60%),color-mix(in srgb,var(--bg-card) 94%,#020617 6%);box-shadow:0 18px 40px rgba(15,23,42,.22)}.category-row{overflow-x:auto;overflow-y:visible;padding:.2rem 0 .45rem;flex-wrap:nowrap}.select{width:100%;background:rgba(255,255,255,.04);color:var(--text-primary)}
.controls--hero{grid-column:1/-1;margin:.15rem 0 0;padding:1rem 0;border:0;border-top:1px solid rgba(148,163,184,.18);border-bottom:1px solid rgba(148,163,184,.18);background:transparent;box-shadow:none;border-radius:0}
.controls--hero .controls-top{grid-template-columns:minmax(220px,320px)}
.controls-inline{display:grid;gap:.5rem;max-width:320px}
.category-select-wrap{display:none;gap:.45rem;max-width:320px}
.upload-panel{margin-bottom:1rem}.upload-grid{display:grid;gap:.8rem}.field{display:grid;gap:.38rem}.field label{font-size:.9rem;font-weight:800}.wide{grid-column:1/-1}
.input{width:100%;min-height:2.95rem;border-radius:16px;border:1px solid rgba(148,163,184,.22);background:rgba(255,255,255,.04);color:var(--text-primary);padding:.8rem .95rem;outline:none}.input:focus{border-color:rgba(56,189,248,.44);box-shadow:0 0 0 4px rgba(56,189,248,.12)}
.upload-file-input{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}.file-name{flex:1 1 100%;min-width:0;padding:.8rem .95rem;border-radius:16px;border:1px dashed rgba(148,163,184,.24);color:var(--text-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.upload-error{margin:0;color:#ef4444;font-weight:800}
.empty-state{display:grid;place-items:center;gap:.6rem;padding:2rem 1rem;text-align:center}.empty-state h3,.empty-state p{margin:0}
.tutorials-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1rem}
.tutorials-grid--scroll{max-height:calc((3 * 31rem) + (2 * 1rem));overflow-y:auto;overflow-x:hidden;padding:.2rem .45rem .55rem .1rem;margin:-.2rem -.45rem -.55rem -.1rem;scrollbar-gutter:stable}
.tutorials-grid--scroll::-webkit-scrollbar{width:.55rem}
.tutorials-grid--scroll::-webkit-scrollbar-thumb{border-radius:999px;background:rgba(148,163,184,.28)}
.tutorial-card-shell{position:relative;display:flex;flex-direction:column;align-content:start;height:100%;padding-top:1.1rem}
.tutorial-card-shell--starter .starter-card{height:100%}
.tutorial-card-top-badge{position:absolute;top:0;left:1rem;z-index:2;display:flex;justify-content:flex-start;pointer-events:none}
.tutorial-card-top-label{font-size:.74rem;font-weight:800;letter-spacing:.04em;color:#ffffff;line-height:1}
.tutorial-card{flex:1 1 auto;height:100%;overflow:hidden;border-radius:18px;display:grid;grid-template-rows:auto 1fr;cursor:pointer;background:radial-gradient(circle at top left,color-mix(in srgb,var(--accent-primary) 10%,transparent),transparent 56%),radial-gradient(circle at bottom right,color-mix(in srgb,var(--accent-secondary) 8%,transparent),transparent 60%),color-mix(in srgb,var(--bg-card) 94%,#020617 6%);border:1px solid rgba(148,163,184,.35);box-shadow:0 18px 40px rgba(15,23,42,.22);transition:background .18s ease-out,border-color .18s ease-out,box-shadow .2s ease-out,transform .16s ease-out}.tutorial-card:hover{transform:translateY(-2px);box-shadow:0 22px 48px rgba(15,23,42,.32);border-color:rgba(129,140,248,.7)}
.tutorial-card--level-beginner,.starter-card--level-beginner,.related-card--level-beginner{border-color:rgba(34,197,94,.68)}
.tutorial-card--level-medium,.starter-card--level-medium,.related-card--level-medium{border-color:rgba(234,179,8,.72)}
.tutorial-card--level-hard,.starter-card--level-hard,.related-card--level-hard{border-color:rgba(239,68,68,.72)}
.card-media{position:relative;background:linear-gradient(135deg,rgba(8,18,32,.9),rgba(20,36,66,.86))}.media-top{position:absolute;inset:0;display:flex;justify-content:space-between;align-items:start;padding:.8rem;pointer-events:none}
.video-frame{display:block;width:100%;max-width:100%;aspect-ratio:16/9;border:0;border-radius:20px;background:#020617}.video-placeholder{aspect-ratio:16/9;min-height:0;display:grid;place-items:center;border-radius:20px;background:linear-gradient(135deg,rgba(15,23,42,.9),rgba(30,41,59,.84));color:rgba(226,232,240,.76);text-align:center;padding:1rem}
.card-body{display:flex;flex-direction:column;gap:.85rem;padding:1rem;height:100%}
.card-head{display:flex;justify-content:space-between;align-items:start;gap:.8rem}
.card-head > div{flex:1;min-width:0}
.card-head h3{margin:0;font-size:1.08rem;line-height:1.2;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:2.6rem}
.card-text{margin:.45rem 0 0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:3.1rem}
.results-more{display:flex;justify-content:center;gap:1rem;margin-top:1rem}
.modal-head{display:flex;justify-content:space-between;gap:1rem;margin-bottom:1rem}.modal-head h3{margin:.3rem 0 0;font-size:clamp(1.3rem,2vw,2rem)}
.modal-head-meta{display:flex;align-items:center;flex-wrap:wrap;gap:.55rem}
.category-chip,.category-pill{display:inline-flex;align-items:center;gap:.45rem;align-self:flex-start;flex:0 0 auto;min-height:2rem;padding:.38rem .78rem;border-radius:999px;font-size:.82rem;font-weight:800;letter-spacing:.02em;background:rgba(255,255,255,.05);color:var(--text-primary);border:1px solid rgba(148,163,184,.2);line-height:1;white-space:nowrap}
.category-chip-dot,.category-pill-dot{width:.5rem;height:.5rem;border-radius:999px;background:currentColor;box-shadow:0 0 0 4px color-mix(in srgb,currentColor 16%,transparent)}
.category-chip.is-oberkorper,.category-pill.is-oberkorper{color:#38bdf8;border-color:color-mix(in srgb,#38bdf8 34%,rgba(148,163,184,.18))}
.category-chip.is-unterkorper,.category-pill.is-unterkorper{color:#22c55e;border-color:color-mix(in srgb,#22c55e 34%,rgba(148,163,184,.18))}
.category-chip.is-ganzkorper,.category-pill.is-ganzkorper{color:#818cf8;border-color:color-mix(in srgb,#818cf8 36%,rgba(148,163,184,.18))}
.category-chip.is-core,.category-pill.is-core{color:#f59e0b;border-color:color-mix(in srgb,#f59e0b 34%,rgba(148,163,184,.18))}
.category-chip.is-sonstiges,.category-pill.is-sonstiges{color:#f472b6;border-color:color-mix(in srgb,#f472b6 34%,rgba(148,163,184,.18))}
.modal-head-note{margin:.45rem 0 0}
.icon-btn{width:2.8rem;height:2.8rem;border:1px solid rgba(148,163,184,.2);border-radius:999px;background:rgba(255,255,255,.04);color:var(--text-primary);cursor:pointer;font-size:1.1rem}
.modal-layout{display:grid;gap:1rem}
.modal-media{width:100%}
.modal-copy{display:grid;gap:1rem}
.tutorial-coaching-grid{display:grid;grid-template-columns:1fr;gap:.8rem}
.coaching-card{display:grid;gap:.55rem;padding:1rem;border-radius:18px;background:rgba(255,255,255,.03);border:1px solid rgba(148,163,184,.16)}
.coaching-kicker{font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;font-weight:800;color:var(--text-secondary)}
.coaching-list{margin:0;padding-left:1rem;display:grid;gap:.45rem;color:var(--text-primary);line-height:1.45}
.coaching-list--ordered{padding-left:1.15rem}
.related-section{display:grid;gap:.7rem}
.related-head{display:flex;align-items:center;justify-content:space-between;gap:.8rem;flex-wrap:wrap}
.related-note{font-size:.74rem;line-height:1.35;color:var(--text-secondary)}
.related-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.8rem}
.related-card{display:grid;gap:.5rem;text-align:left;padding:1rem;border-radius:18px;border:1px solid rgba(148,163,184,.18);background:rgba(255,255,255,.03);color:var(--text-primary);cursor:pointer;transition:transform .14s ease,box-shadow .18s ease,border-color .18s ease,background .18s ease}
.related-card strong{font-size:.98rem;line-height:1.25}
.related-card span:last-child{color:var(--text-secondary);line-height:1.45}
.related-top{display:flex;gap:.45rem;flex-wrap:wrap}
@media (hover:hover){.related-card:hover{transform:translateY(-2px);border-color:rgba(129,140,248,.45);box-shadow:0 16px 30px rgba(15,23,42,.16);background:rgba(255,255,255,.05)}}
.modal-description{margin:0;display:block;min-height:0}
.modal-meta-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.8rem}
.modal-meta-card--full{grid-column:1/-1}
.info-box--category{gap:.55rem}
.category-label{display:block;margin-bottom:.7rem}
.category-detail{display:grid;gap:.9rem}
.category-note{font-size:.74rem;line-height:1.35;color:var(--text-secondary)}
.equipment-label{display:block;margin-bottom:.7rem}
.equipment-detail{display:grid;gap:.45rem}
.equipment-list{display:flex;flex-wrap:wrap;gap:.5rem}
.equipment-pill{display:inline-flex;align-items:center;gap:.45rem;align-self:flex-start;flex:0 0 auto;min-height:2rem;padding:.38rem .78rem;border-radius:999px;font-size:.82rem;font-weight:800;letter-spacing:.02em;background:rgba(255,255,255,.05);color:var(--text-primary);border:1px solid rgba(148,163,184,.2);line-height:1;white-space:nowrap}
.equipment-pill-dot{width:.5rem;height:.5rem;border-radius:999px;background:var(--accent-secondary);box-shadow:0 0 0 4px color-mix(in srgb,var(--accent-secondary) 16%,transparent)}
.equipment-note{font-size:.74rem;line-height:1.35;color:var(--text-secondary)}
.info-box--level{gap:.55rem}
.info-box--muscles{gap:.55rem}
.muscle-label{display:block;margin-bottom:.7rem}
.muscle-detail{display:grid;gap:.45rem}
.muscle-list{display:flex;flex-wrap:wrap;gap:.5rem}
.muscle-pill{display:inline-flex;align-items:center;gap:.45rem;align-self:flex-start;flex:0 0 auto;min-height:2rem;padding:.38rem .78rem;border-radius:999px;font-size:.82rem;font-weight:800;letter-spacing:.02em;background:rgba(255,255,255,.05);color:var(--text-primary);border:1px solid rgba(148,163,184,.2);line-height:1;white-space:nowrap}
.muscle-pill-dot{width:.5rem;height:.5rem;border-radius:999px;background:#f472b6;box-shadow:0 0 0 4px color-mix(in srgb,#f472b6 16%,transparent)}
.muscle-note{font-size:.74rem;line-height:1.35;color:var(--text-secondary)}
.level-label-row{display:flex;align-items:center;justify-content:space-between;gap:.75rem}
.level-visual{display:grid;gap:.9rem;padding:.9rem;border-radius:18px;background:
transparent;
border:0;
box-shadow:none;
padding:0}
.level-visual.is-anfänger{background:
transparent}
.level-visual.is-fortgeschritten{background:
transparent}
.level-visual.is-pro{background:
transparent}
.level-chip{display:inline-flex;align-items:center;justify-content:center;justify-self:start;align-self:flex-start;flex:0 0 auto;min-height:2rem;padding:.38rem .78rem;border-radius:999px;font-size:.86rem;letter-spacing:.02em;background:rgba(255,255,255,.04);border:0;box-shadow:none;line-height:1;white-space:nowrap}
.level-caption{display:block;margin-top:.2rem;font-size:.74rem;line-height:1.35;color:var(--text-secondary);letter-spacing:.02em}
.level-meter{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.5rem;width:100%}
.level-meter-bar{position:relative;height:.92rem;border-radius:999px;background:rgba(148,163,184,.12);border:1px solid rgba(148,163,184,.16);overflow:hidden;transform:skewX(-18deg)}
.level-meter-bar::before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(255,255,255,.08),transparent 55%)}
.level-meter-bar.is-active{border-color:transparent;box-shadow:0 12px 24px rgba(15,23,42,.18)}
.level-visual.is-anfänger .level-meter-bar.is-active{background:linear-gradient(90deg,#22c55e,#86efac)}
.level-visual.is-fortgeschritten .level-meter-bar.is-active{background:linear-gradient(90deg,#38bdf8,#818cf8)}
.level-visual.is-pro .level-meter-bar.is-active{background:linear-gradient(90deg,#f472b6,#a855f7)}
.level-scale{display:flex;justify-content:space-between;gap:.5rem;font-size:.68rem;letter-spacing:.12em;text-transform:uppercase;color:var(--text-secondary)}
.info-box strong{line-height:1.5}
.modal-actions{position:sticky;bottom:-1rem;z-index:2;margin:1rem -1rem -1rem;padding:.9rem 1rem 1rem;justify-content:space-between;align-items:center;gap:.9rem;background:color-mix(in srgb,var(--bg-card) 92%,#081120 8%);box-shadow:none;border-top:1px solid rgba(148,163,184,.14)}
.tutorial-modal-actions-right{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:.5rem;flex:1}
.tutorial-modal-favorite{flex:0 0 auto}
.tutorials :deep(.popup-overlay.tutorial-popup){background:rgba(2,6,23,.66);backdrop-filter:blur(8px);padding:1rem}
.tutorials :deep(.popup-overlay.tutorial-popup .popup){width:min(1100px,100%);padding:1rem;border-radius:28px;border:1px solid rgba(148,163,184,.2);background:color-mix(in srgb,var(--bg-card) 92%,#081120 8%);box-shadow:0 24px 60px rgba(2,6,23,.16);backdrop-filter:blur(14px)}
.tutorials :deep(.popup-overlay.tutorial-popup .popup-body){padding:0;overflow:auto;background:transparent}
.tutorials :deep(.popup-overlay.tutorial-popup .popup-x){top:1rem;right:1rem}
.tutorials :deep(.popup-overlay.tutorial-popup--preview-fullscreen .popup){width:min(96vw,1160px)}
.tutorials :deep(.popup-overlay.tutorial-popup--preview-fullscreen .video-frame){min-height:52vh}
.tutorial-modal-btn{flex:0 1 auto!important;width:auto!important;min-width:10.5rem;max-width:none!important;min-height:2.8rem;white-space:normal;font-size:.92rem!important;line-height:1.2}
.preview-touch{position:fixed;z-index:1200;width:1.15rem;height:1.15rem;margin-left:-.575rem;margin-top:-.575rem;pointer-events:none}.preview-touch__dot{position:absolute;inset:0;border-radius:999px;background:rgba(255,255,255,.96);border:2px solid rgba(29,78,216,.92);box-shadow:0 0 0 0 rgba(59,130,246,.3);animation:previewTouchPulse 1.2s ease-out infinite}
html.dark-mode .tutorial-card,html.dark-mode .starter-card,html.dark-mode .info-box,html.dark-mode .group{background:radial-gradient(circle at top left,color-mix(in srgb,#6366f1 16%,transparent),transparent 55%),radial-gradient(circle at bottom right,color-mix(in srgb,#22c55e 11%,transparent),transparent 62%),#020617;border-color:rgba(148,163,184,.5);box-shadow:0 22px 55px rgba(0,0,0,.7)}
html.dark-mode .tutorial-card-top-label{color:#ffffff}
html.dark-mode .tutorial-card--level-beginner,html.dark-mode .starter-card--level-beginner,html.dark-mode .related-card--level-beginner{border-color:rgba(74,222,128,.74)}
html.dark-mode .tutorial-card--level-medium,html.dark-mode .starter-card--level-medium,html.dark-mode .related-card--level-medium{border-color:rgba(250,204,21,.8)}
html.dark-mode .tutorial-card--level-hard,html.dark-mode .starter-card--level-hard,html.dark-mode .related-card--level-hard{border-color:rgba(248,113,113,.8)}
html.dark-mode .hero,html.dark-mode .results,html.dark-mode .favorites-panel{background:radial-gradient(circle at top left,color-mix(in srgb,#6366f1 14%,transparent),transparent 55%),radial-gradient(circle at bottom right,color-mix(in srgb,#22c55e 10%,transparent),transparent 60%),#020617;border-color:rgba(148,163,184,.45);box-shadow:0 22px 55px rgba(0,0,0,.7)}
html.dark-mode .tutorial-level-legend{color:rgba(226,232,240,.9)}
.tutorials :deep(html.dark-mode .popup-overlay.tutorial-popup .popup){background:radial-gradient(circle at top left,color-mix(in srgb,#6366f1 14%,transparent),transparent 55%),radial-gradient(circle at bottom right,color-mix(in srgb,#22c55e 10%,transparent),transparent 60%),#020617;border-color:rgba(148,163,184,.45);box-shadow:0 22px 55px rgba(0,0,0,.7)}
html.dark-mode .modal-actions{background:radial-gradient(circle at top left,color-mix(in srgb,#6366f1 14%,transparent),transparent 55%),radial-gradient(circle at bottom right,color-mix(in srgb,#22c55e 10%,transparent),transparent 60%),#020617;border-top:1px solid rgba(148,163,184,.16)}
html.dark-mode .tutorials :deep(.popup-overlay.tutorial-popup .popup-body){background:transparent}
html.dark-mode .level-visual{border:0;box-shadow:none}
html.dark-mode .level-chip{background:rgba(255,255,255,.05);border:0}
html.dark-mode .level-meter-bar{background:rgba(148,163,184,.12);border-color:rgba(148,163,184,.18)}
@keyframes previewTouchPulse{0%{transform:scale(.88);box-shadow:0 0 0 0 rgba(59,130,246,.34)}70%{transform:scale(1);box-shadow:0 0 0 .7rem rgba(59,130,246,0)}100%{transform:scale(.9);box-shadow:0 0 0 0 rgba(59,130,246,0)}}
@media (hover:hover){.hero:hover,.results:hover,.favorites-panel:hover{transform:translateY(-3px) scale(1.01);box-shadow:0 22px 50px rgba(15,23,42,.32);border-color:rgba(129,140,248,.55)}}
@media (min-width:1025px){.hero-side{position:sticky;top:1rem}.starter{max-height:min(72vh,calc(100vh - 6rem));overflow-y:auto;padding:.2rem .45rem .45rem .1rem;margin:-.2rem -.45rem -.45rem -.1rem;scrollbar-gutter:stable}.starter::-webkit-scrollbar{width:.5rem}.starter::-webkit-scrollbar-thumb{border-radius:999px;background:rgba(148,163,184,.28)}}
@media (min-width:760px){.upload-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media (max-width:1024px){.hero,.controls-top,.tutorial-coaching-grid,.related-grid{grid-template-columns:1fr}.stats,.starter-list{grid-template-columns:1fr}}
@media (max-width:1024px){.hero-side--suppressed{display:none}}
@media (min-width:541px) and (max-width:720px){.card-actions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.55rem;align-items:stretch}.card-actions .btn{width:100%!important;min-width:0;max-width:none!important;height:2.45rem;min-height:2.45rem;padding:.42rem .55rem;font-size:.84rem;line-height:1.15}.card-actions .btn:nth-child(1){order:1}.card-actions .btn:nth-child(2){order:2}.card-actions .btn:nth-child(3){order:3}.card-actions .btn.danger{grid-column:1/-1;order:4}}
@media (max-width:720px){.tutorials{padding:.8rem;padding-top:1.35rem}.page-title{font-size:1.9rem}.hero,.controls,.upload-panel,.results,.favorites-panel{padding:.9rem;border-radius:18px}.hero-copy,.hero-side,.starter{padding:0}.hero-copy h1{max-width:none;font-size:2.15rem;margin:0 0 1.1rem}.hero-actions,.actions{display:grid;grid-template-columns:1fr}.tutorial-level-legend{gap:.55rem .85rem;font-size:.78rem}.tutorial-level-legend__swatch{width:.82rem;height:.82rem}.btn,.select{width:100%}.pill,.badge,.status-pill,.category-chip,.category-pill,.equipment-pill,.muscle-pill,.level-chip{min-height:1.8rem;padding:.28rem .62rem;font-size:.72rem}.tutorial-card-shell{padding-top:.95rem}.tutorial-card-top-badge{left:.85rem}.tutorial-card-top-label{font-size:.68rem}.card-actions{display:flex;flex-wrap:wrap;justify-content:center;gap:.45rem}.card-actions .btn{width:4.55rem!important;min-width:4.55rem;max-width:4.55rem;height:2rem;min-height:2rem;padding:.3rem .45rem;font-size:.8rem}.card-actions .btn.danger{width:100%!important;min-width:0;max-width:none}.tutorials-grid{grid-template-columns:1fr}.tutorial-card{border-radius:20px}.card-body{gap:.72rem;padding:.9rem}.card-head{gap:.65rem}.card-head h3{font-size:1rem;min-height:2.35rem}.card-text{margin:.35rem 0 0;min-height:2.8rem;font-size:.92rem;line-height:1.5}.tutorials :deep(.popup-overlay.tutorial-popup){padding:.5rem;align-items:end}.tutorials :deep(.popup-overlay.tutorial-popup .popup){width:100%;max-height:calc(100vh - 1rem);border-radius:24px 24px 18px 18px}.modal-meta-grid{grid-template-columns:1fr}.modal-actions{display:grid;grid-template-columns:1fr;align-items:stretch}.tutorial-modal-actions-right{display:grid;grid-template-columns:1fr}.tutorial-modal-btn{width:100%!important;min-width:0}.video-placeholder{min-height:180px}}
@media (max-width:720px){.section-head{align-items:flex-start}.section-head > div{min-width:0;flex:1 1 auto}.section-head h2{line-height:1.08}.section-head .section-note{flex:0 0 auto;max-width:15rem;text-align:right;margin:0;padding-top:.15rem}}
@media (max-width:535px){.section-head{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:start;column-gap:.75rem;row-gap:.2rem}.section-head .section-note{max-width:11.5rem;font-size:.86rem;line-height:1.35}}
@media (max-width:665px){.category-row--chips{display:none}.category-select-wrap{display:grid}}
@media (max-width:480px){.tutorial-level-legend{display:grid;grid-template-columns:1fr;gap:.42rem;margin-top:.9rem;font-size:.74rem}.tutorial-level-legend__item{gap:.38rem}.tutorial-level-legend__swatch{width:.78rem;height:.78rem}.pill,.badge,.status-pill,.category-chip,.category-pill,.equipment-pill,.muscle-pill,.level-chip{min-height:1.65rem;padding:.24rem .56rem;font-size:.68rem}.tutorial-card-top-label{font-size:.64rem}.card-actions .btn{width:4.2rem!important;min-width:4.2rem;max-width:4.2rem;font-size:.76rem}.card-body{padding:.82rem}.media-top{padding:.7rem}}
@media (max-width:480px){.section-head{display:flex;flex-wrap:nowrap;align-items:flex-start;justify-content:space-between;gap:.6rem}.section-head > div{min-width:0;flex:1 1 auto}.section-head .section-note{max-width:9.5rem;font-size:.8rem;line-height:1.3;text-align:right}}
@media (max-width:400px){.favorites-panel .section-head .section-note{display:none}}
@media (max-width:380px){.results .section-head .section-note{display:none}}
@media (max-width:360px){.page-title{font-size:1.75rem}}
</style>

