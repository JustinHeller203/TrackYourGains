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
        <h1>Weniger Chaos, klarer Einstieg, besser auf dem Handy.</h1>
        <p class="hero-text">
          Starte mit empfohlenen Basics. Filter und Uploads bleiben verfügbar, stehen aber nicht mehr sofort im Weg.
        </p>

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
      </div>

      <div class="hero-side">
        <div class="starter">
          <p class="eyebrow">Schnellstart</p>
          <h2>{{ featuredSectionTitle }}</h2>
          <p class="starter-note">{{ featuredSectionNote }}</p>
          <div class="starter-list">
            <button
              v-for="tutorial in featuredTutorials"
              :key="tutorial.id"
              type="button"
              class="starter-card"
              @click="openTutorial(tutorial)">
              <span class="starter-top">
                <span class="pill">{{ tutorial.category }}</span>
                <span v-if="tutorial.level" class="pill subtle">{{ tutorial.level }}</span>
              </span>
              <strong>{{ tutorial.title }}</strong>
              <span>{{ tutorial.description }}</span>
            </button>
          </div>
        </div>
      </div>
    </section>

    <section v-if="showFilters" class="controls">
      <div class="controls-top">
        <div class="group">
          <label class="label">Schnellfilter</label>
          <div class="chips">
            <button type="button" class="chip" :class="{ active: favoritesOnly }" @click="favoritesOnly = !favoritesOnly">
              Favoriten
            </button>
            <button type="button" class="chip" :class="{ active: onlyWithVideo }" @click="onlyWithVideo = !onlyWithVideo">
              Nur mit Video
            </button>
          </div>
        </div>

        <div class="group">
          <label class="label" for="tutorial-sort">Sortierung</label>
          <select id="tutorial-sort" v-model="sortMode" class="select">
            <option value="az">A–Z</option>
            <option value="category">Kategorie</option>
            <option value="fav">Favoriten zuerst</option>
          </select>
        </div>
      </div>

      <div class="category-row">
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

    <section ref="resultsRef" class="results">
      <div class="section-head">
        <div>
          <p class="eyebrow">Sammlung</p>
          <h2>{{ resultsHeadline }}</h2>
        </div>
        <p class="section-note">{{ filteredTutorials.length }} von {{ tutorials.length }} Tutorials sichtbar</p>
      </div>

      <div v-if="loading" class="empty-state"><p>Tutorials werden geladen…</p></div>

      <div v-else-if="filteredTutorials.length === 0" class="empty-state">
        <h3>Keine Treffer gefunden</h3>
        <p>Probiere eine andere Kategorie oder setze die Filter zurück.</p>
        <button type="button" class="btn" @click="resetFilters">Filter zurücksetzen</button>
      </div>

      <div v-else>
        <div class="tutorials-grid">
          <article
            v-for="tutorial in visibleTutorials"
            :key="tutorial.id"
            class="tutorial-card"
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
                <span class="pill">{{ tutorial.category }}</span>
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
                  @toggle.stop="toggleFavorite(tutorial.id)" />
              </div>

              <div class="meta-row">
                <span v-if="tutorial.level" class="pill subtle">{{ tutorial.level }}</span>
                <span v-for="item in tutorial.equipment?.slice(0, 2) ?? []" :key="item" class="pill subtle">{{ item }}</span>
                <span v-if="(tutorial.equipment?.length ?? 0) > 2" class="pill subtle">+{{ (tutorial.equipment?.length ?? 0) - 2 }}</span>
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

        <div v-if="canLoadMore" class="results-more">
          <button type="button" class="btn" @click="loadMoreTutorials">Mehr Tutorials laden</button>
        </div>
      </div>

      <div v-if="activeTutorial" class="tut-modal" @click="closeTutorial" role="dialog" aria-modal="true">
        <div class="tut-modal-card" :class="{ 'tut-modal-card--preview-fullscreen': previewTutorialFullscreen }" @click.stop>
          <div class="modal-head">
            <div>
              <p class="eyebrow">{{ activeTutorial.category }}</p>
              <h3>{{ activeTutorial.title }}</h3>
              <p class="section-note">
                {{ activeTutorial.level || 'Alle Levels' }}
                <span v-if="activeTutorial.source === 'custom'">• Lokal gespeichert</span>
              </p>
            </div>
            <button type="button" class="icon-btn" @click="closeTutorial" aria-label="Schließen">X</button>
          </div>

          <div class="modal-layout">
            <div>
              <iframe
                v-if="activeTutorial.videoUrl && isYouTubeEmbed(activeTutorial.videoUrl)"
                :src="activeTutorial.videoUrl"
                class="video-frame"
                frameborder="0"
                allowfullscreen
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerpolicy="strict-origin-when-cross-origin" />

              <video v-else-if="activeTutorial.videoUrl" class="video-frame" controls playsinline preload="metadata">
                <source :src="activeTutorial.videoUrl" />
              </video>

              <div v-else class="video-placeholder"><p>Video wird bald hinzugefügt</p></div>
            </div>

            <aside class="modal-side">
              <p class="card-text">{{ activeTutorial.description }}</p>
              <div class="info-box"><span>Kategorie</span><strong>{{ activeTutorial.category }}</strong></div>
              <div class="info-box"><span>Level</span><strong>{{ activeTutorial.level || 'Nicht angegeben' }}</strong></div>
              <div class="info-box">
                <span>Equipment</span>
                <strong>{{ activeTutorial.equipment?.length ? activeTutorial.equipment.join(', ') : 'Kein Equipment angegeben' }}</strong>
              </div>
            </aside>
          </div>

          <div class="card-actions modal-actions">
            <button type="button" class="btn primary" :disabled="!activeTutorial.videoUrl" @click="openOnYouTube(activeTutorial)">Video öffnen</button>
            <button type="button" class="btn" @click="copyLink(activeTutorial)">Link kopieren</button>
            <button v-if="activeTutorial.source === 'custom'" type="button" class="btn danger" @click="deleteTutorial(activeTutorial)">Löschen</button>
            <FavoriteButton
              :active="isFavorite(activeTutorial.id)"
              titleActive="Aus Favoriten entfernen"
              titleInactive="Zu Favoriten hinzufügen"
              @toggle="toggleFavorite(activeTutorial.id)" />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import UiSearch from '@/components/ui/kits/UiSearch.vue'
import FavoriteButton from '@/components/ui/buttons/FavoriteButton.vue'
import { useTrainingPlansStore } from '@/store/trainingPlansStore'
import type { TrainingPlan as TrainingPlanDto } from '@/types/trainingPlan'

interface Tutorial {
  id: number
  title: string
  description: string
  videoUrl: string | null
  category: string
  level?: 'Anfänger' | 'Fortgeschritten' | 'Pro'
  equipment?: string[]
  matchTerms?: string[]
  source?: 'builtin' | 'custom'
  videoRef?: string | null
}

type StoredVideo = { id: string; blob: Blob; type: string; createdAt: number }

const route = useRoute()
const trainingPlansStore = useTrainingPlansStore()
const loading = ref(true)
const tutorials = ref<Tutorial[]>([])
const searchQuery = ref('')
const selectedCategory = ref<string>('Alle')
const onlyWithVideo = ref(false)
const favoritesOnly = ref(false)
const sortMode = ref<'az' | 'category' | 'fav'>('az')
const showUpload = ref(false)
const showFilters = ref(false)
const visibleCount = ref(8)
const activeTutorial = ref<Tutorial | null>(null)
const previewTutorialFullscreen = ref(false)
const resultsRef = ref<HTMLElement | null>(null)

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
const favoriteIds = ref<number[]>([])
const objectUrls = new Set<string>()

const isPhonePreviewTutorialDemo = computed(() => route.query.preview === 'phone' && route.query.demo === 'tutorial')
const canUpload = computed(() => !!uploadFile.value && uploadTitle.value.trim().length >= 2)
function normalizeText(value: string) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}
function daysSinceIso(iso: string | null | undefined) {
  const ts = Date.parse(String(iso ?? ''))
  if (!Number.isFinite(ts)) return Number.POSITIVE_INFINITY
  return (Date.now() - ts) / 86400000
}
function isPlanTutorialMatch(tutorial: Tutorial, needle: string) {
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
  const scored = new Map<number, { tutorial: Tutorial; score: number }>()
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
const featuredTutorials = computed(() => {
  if (planMatchedTutorials.value.length) return planMatchedTutorials.value.slice(0, 4)
  const preferred = tutorials.value.filter(t => t.level === 'Anfänger' || t.category === 'Ganzkörper')
  return (preferred.length >= 4 ? preferred : tutorials.value).slice(0, 4)
})
const resultsHeadline = computed(() => {
  if (searchQuery.value.trim()) return `Suchergebnisse für "${searchQuery.value.trim()}"`
  if (selectedCategory.value !== 'Alle') return `${selectedCategory.value} entdecken`
  if (favoritesOnly.value) return 'Deine Favoriten'
  return 'Alle Tutorials'
})
const categories = computed(() => Array.from(new Set(tutorials.value.map(t => t.category))).sort((a, b) => a.localeCompare(b, 'de')))
const filteredTutorials = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  let list = tutorials.value.slice()
  if (q) list = list.filter(t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q))
  if (selectedCategory.value !== 'Alle') list = list.filter(t => t.category === selectedCategory.value)
  if (onlyWithVideo.value) list = list.filter(t => !!t.videoUrl)
  if (favoritesOnly.value) list = list.filter(t => isFavorite(t.id))
  if (sortMode.value === 'az') list.sort((a, b) => a.title.localeCompare(b.title, 'de'))
  else if (sortMode.value === 'category') list.sort((a, b) => (a.category + a.title).localeCompare(b.category + b.title, 'de'))
  else list.sort((a, b) => Number(isFavorite(b.id)) - Number(isFavorite(a.id)) || a.title.localeCompare(b.title, 'de'))
  return list
})
const visibleTutorials = computed(() => filteredTutorials.value.slice(0, visibleCount.value))
const canLoadMore = computed(() => visibleTutorials.value.length < filteredTutorials.value.length)

function toggleUpload() {
  showUpload.value = !showUpload.value
  uploadError.value = ''
  if (showUpload.value) showFilters.value = true
}
function loadMoreTutorials() { visibleCount.value += 6 }
function resetFilters() {
  searchQuery.value = ''
  selectedCategory.value = 'Alle'
  onlyWithVideo.value = false
  favoritesOnly.value = false
  sortMode.value = 'az'
  visibleCount.value = 8
}
function scrollToResults() {
  const target = resultsRef.value
  if (!target) return
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const top = target.getBoundingClientRect().top + window.scrollY - 24
  window.scrollTo({ top, behavior: prefersReduced ? 'auto' : 'smooth' })
}
function openTutorial(t: Tutorial) { activeTutorial.value = t }
function closeTutorial() {
  activeTutorial.value = null
  previewTutorialFullscreen.value = false
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
function persistCustomTutorials(list: Array<Omit<Tutorial, 'videoUrl'> & { videoRef?: string | null }>) {
  localStorage.setItem(LS_CUSTOM, JSON.stringify(list))
}
function loadCustomTutorials(): Array<Omit<Tutorial, 'videoUrl'> & { videoRef?: string | null }> {
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
    const t: Tutorial = { id, title, description: uploadDesc.value.trim() || 'User Upload', videoUrl: url, category: uploadCategory.value, level: uploadLevel.value || undefined, equipment: equipment.length ? equipment : undefined, source: 'custom', videoRef }
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
function isCustomTutorial(t: Tutorial) { return t.source === 'custom' }
function loadFavorites() {
  try {
    const raw = localStorage.getItem(LS_FAVS)
    const parsed = raw ? JSON.parse(raw) : []
    favoriteIds.value = Array.isArray(parsed) ? parsed.filter(n => typeof n === 'number') : []
  } catch { favoriteIds.value = [] }
}
function persistFavorites() { localStorage.setItem(LS_FAVS, JSON.stringify(favoriteIds.value)) }
function isFavorite(id: number) { return favoriteIds.value.includes(id) }
function toggleFavorite(id: number) {
  favoriteIds.value = isFavorite(id) ? favoriteIds.value.filter(x => x !== id) : [...favoriteIds.value, id]
  persistFavorites()
}
async function deleteTutorial(t: Tutorial) {
  if (!isCustomTutorial(t)) return
  if (!confirm(`Tutorial "${t.title}" wirklich löschen?`)) return
  tutorials.value = tutorials.value.filter(x => x.id !== t.id)
  favoriteIds.value = favoriteIds.value.filter(x => x !== t.id)
  persistFavorites()
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
function openOnYouTube(t: Tutorial) {
  if (!t.videoUrl) return
  window.open(isYouTubeEmbed(t.videoUrl) ? toYouTubeWatchUrl(t.videoUrl) : t.videoUrl, '_blank', 'noopener,noreferrer')
}
async function copyLink(t: Tutorial) {
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
  queuePreviewTutorialStep(3250, () => movePreviewTouch('.tut-modal .video-frame', 0.5, 0.34))
  queuePreviewTutorialStep(4300, () => movePreviewTouch('.tut-modal .video-frame', 0.5, 0.34))
  queuePreviewTutorialStep(4700, () => { previewTutorialFullscreen.value = true })
  queuePreviewTutorialStep(6400, notifyPreviewTutorialCompleted)
}

watch([searchQuery, selectedCategory, onlyWithVideo, favoritesOnly, sortMode], () => { visibleCount.value = 8 })

onMounted(async () => {
  loadFavorites()
  try { await trainingPlansStore.loadList() } catch {}
  await new Promise(resolve => setTimeout(resolve, 1000))
  tutorials.value = [
    { id: 1, title: 'Bankdrücken', description: 'Lerne die korrekte Technik für Bankdrücken.', videoUrl: 'https://www.youtube.com/embed/Br8FJCuR4a4', category: 'Oberkörper', level: 'Anfänger', equipment: ['Bank', 'Langhantel'], matchTerms: ['bankdrücken', 'bench press', 'chest press', 'brust'], source: 'builtin' },
    { id: 2, title: 'Kniebeugen', description: 'Meistere die Kniebeuge für starke Beine.', videoUrl: 'https://www.youtube.com/embed/GBsAXMvZGwc', category: 'Unterkörper', matchTerms: ['kniebeuge', 'squat', 'back squat', 'front squat'], source: 'builtin' },
    { id: 3, title: 'Kreuzheben', description: 'Perfektioniere deine Kreuzhebe-Technik.', videoUrl: 'https://www.youtube.com/embed/eUhawFmUXZ0', category: 'Ganzkörper', matchTerms: ['kreuzheben', 'deadlift', 'romanian deadlift', 'rdl'], source: 'builtin' },
    { id: 4, title: 'Schulterdrücken', description: 'Stärke deine Schultern mit dieser Übung.', videoUrl: 'https://www.youtube.com/embed/bdMZfPOGWqw', category: 'Oberkörper', matchTerms: ['schulterdrücken', 'shoulder press', 'overhead press', 'military press'], source: 'builtin' },
    { id: 5, title: 'Klimmzüge', description: 'Bau deinen Rücken mit Klimmzügen auf.', videoUrl: 'https://www.youtube.com/embed/mWU2888TDLo', category: 'Oberkörper', matchTerms: ['klimmzug', 'pull up', 'chin up', 'lat'], source: 'builtin' },
    { id: 6, title: 'Ausfallschritte', description: 'Form deine Beine und deinen Po mit Ausfallschritten.', videoUrl: 'https://www.youtube.com/embed/YDaLrvY4UlU', category: 'Unterkörper', matchTerms: ['ausfallschritt', 'lunge', 'split squat', 'bulgarian split squat'], source: 'builtin' },
    { id: 7, title: 'Plank', description: 'Stärke deine Core-Muskulatur mit dem Plank.', videoUrl: 'https://www.youtube.com/embed/iqh1AgblK3w', category: 'Ganzkörper', matchTerms: ['plank', 'core', 'hollow', 'stütz'], source: 'builtin' },
    { id: 8, title: 'Bizepscurls', description: 'Trainiere deine Arme mit Curls.', videoUrl: 'https://www.youtube.com/embed/UBE9a2xTEl4', category: 'Oberkörper', matchTerms: ['bizepscurl', 'curl', 'biceps curl', 'hammer curl'], source: 'builtin' },
    { id: 9, title: 'Beinpresse', description: 'Kräftige deine Beine an der Beinpresse.', videoUrl: 'https://www.youtube.com/embed/ai5g8OFbnZI', category: 'Unterkörper', matchTerms: ['beinpresse', 'leg press'], source: 'builtin' },
    { id: 10, title: 'Burpees', description: 'Ganzkörper-Killerübung für Ausdauer und Kraft.', videoUrl: 'https://www.youtube.com/embed/VkY1YpAjlwg', category: 'Ganzkörper', matchTerms: ['burpee', 'conditioning', 'hiit'], source: 'builtin' },
    { id: 11, title: 'Rudern am Kabel', description: 'Saubere Zugbewegung für Rücken und Haltung.', videoUrl: 'https://www.youtube.com/embed/VsW98LIzHKA', category: 'Oberkörper', equipment: ['Kabelzug'], matchTerms: ['rudern', 'seated row', 'cable row', 'row'], source: 'builtin' },
    { id: 12, title: 'Latziehen', description: 'Breiter Rückenaufbau mit stabiler Schulterposition.', videoUrl: 'https://www.youtube.com/embed/VqD9sPjRV9U', category: 'Oberkörper', equipment: ['Kabelzug'], matchTerms: ['latziehen', 'lat pulldown', 'pulldown'], source: 'builtin' },
    { id: 13, title: 'Hip Thrust', description: 'Fokus auf Gesäß und Hüftstreckung mit sauberem Setup.', videoUrl: 'https://www.youtube.com/embed/MsoX1M8_GSs', category: 'Unterkörper', equipment: ['Bank', 'Langhantel'], matchTerms: ['hip thrust', 'glute bridge', 'glutes'], source: 'builtin' },
    { id: 14, title: 'Rumänisches Kreuzheben', description: 'Hintere Kette gezielt mit kontrollierter Exzentrik trainieren.', videoUrl: 'https://www.youtube.com/embed/lIUsXvrQXcE', category: 'Unterkörper', equipment: ['Langhantel'], matchTerms: ['rumänisches kreuzheben', 'romanian deadlift', 'rdl'], source: 'builtin' },
    { id: 15, title: 'Face Pulls', description: 'Schultergesundheit und obere Rückenarbeit verbessern.', videoUrl: 'https://www.youtube.com/embed/RRXyfDlLHwo', category: 'Oberkörper', equipment: ['Kabelzug'], matchTerms: ['face pull', 'rear delt', 'hintere schulter'], source: 'builtin' },
    { id: 16, title: 'Dips', description: 'Druckstarke Oberkörperübung für Brust, Schulter und Trizeps.', videoUrl: 'https://www.youtube.com/embed/AloHKkWtUiE', category: 'Oberkörper', matchTerms: ['dip', 'dips', 'trizeps dips'], source: 'builtin' },
    { id: 17, title: 'Trizeps Pushdown', description: 'Isolationsübung für saubere Trizeps-Arbeit am Kabel.', videoUrl: 'https://www.youtube.com/embed/EsIddhEdo1M', category: 'Oberkörper', equipment: ['Kabelzug'], matchTerms: ['pushdown', 'trizeps', 'triceps pushdown'], source: 'builtin' },
    { id: 18, title: 'Seitheben', description: 'Seitliche Schulter kontrolliert ohne Schwung trainieren.', videoUrl: 'https://www.youtube.com/embed/bTYps6PsRZw', category: 'Oberkörper', equipment: ['Kurzhanteln'], matchTerms: ['seitheben', 'lateral raise', 'schulter'], source: 'builtin' },
    { id: 19, title: 'Wadenheben', description: 'Waden sauber über den vollen Bewegungsradius trainieren.', videoUrl: 'https://www.youtube.com/embed/hYnpAmykqDA', category: 'Unterkörper', matchTerms: ['wadenheben', 'calf raise', 'calves'], source: 'builtin' },
    { id: 20, title: 'Leg Curl', description: 'Hamstrings isoliert und kontrolliert stärken.', videoUrl: 'https://www.youtube.com/embed/Uu-wvoXbYTE', category: 'Unterkörper', equipment: ['Maschine'], matchTerms: ['leg curl', 'beinbeuger', 'hamstring curl'], source: 'builtin' },
    { id: 21, title: 'Leg Extension', description: 'Quadrizeps gezielt mit sauberer Endposition trainieren.', videoUrl: 'https://www.youtube.com/embed/0Yed-nbKN7U', category: 'Unterkörper', equipment: ['Maschine'], matchTerms: ['leg extension', 'beinstrecker', 'quadrizeps'], source: 'builtin' },
    { id: 22, title: 'Chest Fly', description: 'Brust isoliert mit Spannung über den gesamten Bewegungsradius belasten.', videoUrl: null, category: 'Oberkörper', matchTerms: ['fly', 'chest fly', 'pec deck'], source: 'builtin' },
    { id: 23, title: 'Mountain Climbers', description: 'Core und Kondition als knackiger Finisher.', videoUrl: null, category: 'Ganzkörper', matchTerms: ['mountain climber', 'conditioning', 'core cardio'], source: 'builtin' },
    { id: 24, title: 'Russian Twists', description: 'Rotationsarbeit für den Rumpf mit sauberer Kontrolle.', videoUrl: null, category: 'Core', matchTerms: ['russian twist', 'rotation', 'obliques'], source: 'builtin' },
    { id: 25, title: 'Bird Dog', description: 'Stabilitätsübung für Core und Rücken mit niedrigem Einstieg.', videoUrl: null, category: 'Core', level: 'Anfänger', matchTerms: ['bird dog', 'stabilität', 'lower back'], source: 'builtin' },
    { id: 26, title: 'Glute Bridge', description: 'Einfacher Einstieg für Gesäßaktivierung und Hüftstabilität.', videoUrl: 'https://www.youtube.com/embed/MsoX1M8_GSs', category: 'Unterkörper', level: 'Anfänger', matchTerms: ['glute bridge', 'bridge', 'hip bridge'], source: 'builtin' },
    { id: 27, title: 'Goblet Squat', description: 'Sehr guter Squat-Einstieg mit sauberer Rumpfspannung.', videoUrl: 'https://www.youtube.com/embed/8VrXHfHH5PM', category: 'Unterkörper', level: 'Anfänger', equipment: ['Kurzhantel'], matchTerms: ['goblet squat', 'squat', 'front squat'], source: 'builtin' },
    { id: 28, title: 'Incline Dumbbell Press', description: 'Obere Brust und Schulterlinie kontrolliert aufbauen.', videoUrl: 'https://www.youtube.com/embed/0WPRqCYF4pA', category: 'Oberkörper', equipment: ['Bank', 'Kurzhanteln'], matchTerms: ['incline press', 'schrägbank', 'dumbbell press'], source: 'builtin' },
  ]
  await hydrateCustomTutorials()
  loading.value = false
  startPreviewTutorialDemo()
})

onBeforeUnmount(() => {
  clearPreviewTutorialTimers()
  for (const url of objectUrls) URL.revokeObjectURL(url)
  objectUrls.clear()
  document.body.classList.remove('tyg-page-tutorials')
  document.documentElement.classList.remove('tyg-page-tutorials')
})
</script>

<style scoped>
.tutorials{padding:clamp(.9rem,3vw,2.4rem);min-height:100vh;color:var(--text-primary);overflow-x:clip}
.page-title{font-size:2.25rem;font-weight:700;margin:0 0 1rem;text-align:center;color:var(--text-primary);letter-spacing:-.025em}
.controls,.upload-panel,.tut-modal-card{border:1px solid rgba(148,163,184,.2);background:color-mix(in srgb,var(--bg-card) 92%,#081120 8%);box-shadow:0 24px 60px rgba(2,6,23,.16);backdrop-filter:blur(14px)}
.hero,.results{position:relative;width:100%;box-sizing:border-box;padding:1.75rem 1.9rem;border-radius:18px;background:radial-gradient(circle at top left,color-mix(in srgb,var(--accent-primary) 9%,transparent),transparent 55%),radial-gradient(circle at bottom right,color-mix(in srgb,var(--accent-secondary) 7%,transparent),transparent 60%),color-mix(in srgb,var(--bg-card) 94%,#020617 6%);border:1px solid rgba(148,163,184,.26);box-shadow:0 18px 40px rgba(15,23,42,.22);transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease}
.hero{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(320px,.95fr);gap:1.4rem;margin-bottom:2rem}
.hero-copy{padding:0;color:#f8fafc}
.hero-copy h1{margin:0;max-width:13ch;font-size:clamp(2rem,5vw,4rem);line-height:.98;letter-spacing:-.05em}
.hero-text,.section-note,.card-text,.starter-card span:last-child{color:var(--text-secondary);line-height:1.6}
.hero-text{margin:1rem 0 1.2rem;color:rgba(226,232,240,.84)}
.eyebrow{margin:0 0 .45rem;text-transform:uppercase;letter-spacing:.14em;font-size:.74rem;font-weight:800;color:rgba(226,232,240,.72)}
.hero-actions,.chips,.category-row,.actions,.modal-actions{display:flex;flex-wrap:wrap;gap:.7rem}
.hero-actions{margin-top:1rem}
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
.hero-side{display:grid;gap:1rem;padding:0}.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:.75rem}
.starter{padding:0;border-radius:0;background:transparent;box-shadow:none;border:0}
.stat,.starter-card,.info-box{border-radius:22px;border:1px solid rgba(148,163,184,.35);background:radial-gradient(circle at top left,color-mix(in srgb,var(--accent-primary) 10%,transparent),transparent 56%),radial-gradient(circle at bottom right,color-mix(in srgb,var(--accent-secondary) 8%,transparent),transparent 60%),color-mix(in srgb,var(--bg-card) 94%,#020617 6%);box-shadow:0 18px 40px rgba(15,23,42,.22);padding:1rem}
.stat{display:grid;gap:.2rem}.stat span,.label,.info-box span{font-size:.82rem;color:var(--text-secondary);font-weight:700}.stat strong{font-size:1.8rem;line-height:1}
.section-head{display:flex;justify-content:space-between;align-items:end;gap:1rem;margin-bottom:1rem}.section-head h2,.starter h2{margin:0;font-size:clamp(1.08rem,2vw,1.55rem);line-height:1.05}
.starter-note{margin:.45rem 0 0;color:var(--text-secondary);line-height:1.55}
.starter-list{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.75rem;margin-top:.75rem}
.starter-card{text-align:left;cursor:pointer;display:grid;gap:.5rem}.starter-card strong{font-size:1rem}.starter-top,.meta-row{display:flex;gap:.45rem;flex-wrap:wrap}
.pill,.badge{display:inline-flex;align-items:center;justify-content:center;padding:.35rem .7rem;border-radius:999px;font-size:.78rem;font-weight:800}
.pill{background:rgba(56,189,248,.12);border:1px solid rgba(56,189,248,.2)}.pill.subtle{background:rgba(148,163,184,.08);border:1px solid rgba(148,163,184,.16)}
.badge{background:rgba(15,23,42,.72);color:#f8fafc}
.controls{display:grid;gap:1rem;margin:1.75rem 0 1rem}.controls-top{display:grid;grid-template-columns:1.4fr 220px;gap:1rem}.group{display:grid;gap:.5rem}.category-row{overflow:auto;padding-bottom:.1rem;flex-wrap:nowrap}.select{width:100%;background:rgba(255,255,255,.04);color:var(--text-primary)}
.upload-panel{margin-bottom:1rem}.upload-grid{display:grid;gap:.8rem}.field{display:grid;gap:.38rem}.field label{font-size:.9rem;font-weight:800}.wide{grid-column:1/-1}
.input{width:100%;min-height:2.95rem;border-radius:16px;border:1px solid rgba(148,163,184,.22);background:rgba(255,255,255,.04);color:var(--text-primary);padding:.8rem .95rem;outline:none}.input:focus{border-color:rgba(56,189,248,.44);box-shadow:0 0 0 4px rgba(56,189,248,.12)}
.upload-file-input{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}.file-name{flex:1 1 100%;min-width:0;padding:.8rem .95rem;border-radius:16px;border:1px dashed rgba(148,163,184,.24);color:var(--text-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.upload-error{margin:0;color:#ef4444;font-weight:800}
.empty-state{display:grid;place-items:center;gap:.6rem;padding:2rem 1rem;text-align:center}.empty-state h3,.empty-state p{margin:0}
.tutorials-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1rem}
.tutorial-card{height:100%;overflow:hidden;border-radius:18px;display:grid;grid-template-rows:auto 1fr;cursor:pointer;background:radial-gradient(circle at top left,color-mix(in srgb,var(--accent-primary) 10%,transparent),transparent 56%),radial-gradient(circle at bottom right,color-mix(in srgb,var(--accent-secondary) 8%,transparent),transparent 60%),color-mix(in srgb,var(--bg-card) 94%,#020617 6%);border:1px solid rgba(148,163,184,.35);box-shadow:0 18px 40px rgba(15,23,42,.22);transition:background .18s ease-out,border-color .18s ease-out,box-shadow .2s ease-out,transform .16s ease-out}.tutorial-card:hover{transform:translateY(-2px);box-shadow:0 22px 48px rgba(15,23,42,.32);border-color:rgba(129,140,248,.7)}
.card-media{position:relative;background:linear-gradient(135deg,rgba(8,18,32,.9),rgba(20,36,66,.86))}.media-top{position:absolute;inset:0;display:flex;justify-content:space-between;align-items:start;padding:.8rem;pointer-events:none}
.video-frame{display:block;width:100%;max-width:100%;aspect-ratio:16/9;border:0;border-radius:20px;background:#020617}.video-placeholder{aspect-ratio:16/9;min-height:0;display:grid;place-items:center;border-radius:20px;background:linear-gradient(135deg,rgba(15,23,42,.9),rgba(30,41,59,.84));color:rgba(226,232,240,.76);text-align:center;padding:1rem}
.card-body{display:flex;flex-direction:column;gap:.85rem;padding:1rem;height:100%}
.card-head{display:flex;justify-content:space-between;align-items:start;gap:.8rem}
.card-head > div{flex:1;min-width:0}
.card-head h3{margin:0;font-size:1.08rem;line-height:1.2;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:2.6rem}
.card-text{margin:.45rem 0 0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:3.1rem}
.results-more{display:flex;justify-content:center;margin-top:1rem}
.tut-modal{position:fixed;inset:0;z-index:999;background:rgba(2,6,23,.66);backdrop-filter:blur(8px);display:grid;place-items:center;padding:1rem}
.tut-modal-card{width:min(1100px,100%);padding:1rem;border-radius:28px}.modal-head{display:flex;justify-content:space-between;gap:1rem;margin-bottom:1rem}.modal-head h3{margin:0;font-size:clamp(1.3rem,2vw,2rem)}
.icon-btn{width:2.8rem;height:2.8rem;border:1px solid rgba(148,163,184,.2);border-radius:999px;background:rgba(255,255,255,.04);color:var(--text-primary);cursor:pointer;font-size:1.1rem}
.modal-layout{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(260px,.75fr);gap:1rem}.modal-side{display:grid;gap:.8rem}.info-box strong{line-height:1.5}.modal-actions{margin-top:1rem}
.tut-modal-card--preview-fullscreen{width:min(96vw,1160px)}.tut-modal-card--preview-fullscreen .video-frame{min-height:52vh}
.preview-touch{position:fixed;z-index:1200;width:1.15rem;height:1.15rem;margin-left:-.575rem;margin-top:-.575rem;pointer-events:none}.preview-touch__dot{position:absolute;inset:0;border-radius:999px;background:rgba(255,255,255,.96);border:2px solid rgba(29,78,216,.92);box-shadow:0 0 0 0 rgba(59,130,246,.3);animation:previewTouchPulse 1.2s ease-out infinite}
html.dark-mode .tutorial-card,html.dark-mode .starter-card,html.dark-mode .info-box{background:radial-gradient(circle at top left,color-mix(in srgb,#6366f1 16%,transparent),transparent 55%),radial-gradient(circle at bottom right,color-mix(in srgb,#22c55e 11%,transparent),transparent 62%),#020617;border-color:rgba(148,163,184,.5);box-shadow:0 22px 55px rgba(0,0,0,.7)}
html.dark-mode .hero,html.dark-mode .results{background:radial-gradient(circle at top left,color-mix(in srgb,#6366f1 14%,transparent),transparent 55%),radial-gradient(circle at bottom right,color-mix(in srgb,#22c55e 10%,transparent),transparent 60%),#020617;border-color:rgba(148,163,184,.45);box-shadow:0 22px 55px rgba(0,0,0,.7)}
@keyframes previewTouchPulse{0%{transform:scale(.88);box-shadow:0 0 0 0 rgba(59,130,246,.34)}70%{transform:scale(1);box-shadow:0 0 0 .7rem rgba(59,130,246,0)}100%{transform:scale(.9);box-shadow:0 0 0 0 rgba(59,130,246,0)}}
@media (hover:hover){.hero:hover,.results:hover{transform:translateY(-3px) scale(1.01);box-shadow:0 22px 50px rgba(15,23,42,.32);border-color:rgba(129,140,248,.55)}}
@media (min-width:760px){.upload-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media (max-width:1024px){.hero,.controls-top,.modal-layout{grid-template-columns:1fr}.stats,.starter-list{grid-template-columns:1fr}}
@media (max-width:720px){.tutorials{padding:.8rem;padding-top:1.35rem}.page-title{font-size:1.9rem}.hero,.controls,.upload-panel,.results,.tut-modal-card{padding:.9rem;border-radius:18px}.hero-copy,.hero-side,.starter{padding:0}.hero-copy h1{max-width:none;font-size:2.15rem}.hero-actions,.actions,.modal-actions{display:grid;grid-template-columns:1fr}.btn,.select{width:100%}.card-actions{display:flex;flex-wrap:wrap;justify-content:center}.card-actions .btn{width:4.85rem!important;min-width:4.85rem;max-width:4.85rem}.card-actions .btn.danger{width:100%!important;min-width:0;max-width:none}.tutorials-grid{grid-template-columns:1fr}.tutorial-card{border-radius:20px}.tut-modal{padding:.5rem;align-items:end}.tut-modal-card{width:100%;max-height:calc(100vh - 1rem);overflow:auto;border-radius:24px 24px 18px 18px}.video-placeholder{min-height:180px}}
@media (max-width:360px){.page-title{font-size:1.75rem}}
</style>

