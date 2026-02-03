<!--src/pages/Tutorial.vue-->
<template>
    <div class="tutorials" :class="{ 'dark-mode': darkMode }">
        <h2 class="page-title">🎥 Übungstutorials</h2>
        <div class="search-and-filter">
            <UiSearch v-model="searchQuery"
                      placeholder="Tutorial suchen…"
                      ariaLabel="Tutorial suchen"
                      :center="true"
                      maxWidth="520px" />
        </div>

        <div class="tutorial-toolbar">
            <div class="toolbar-row">
                <button type="button"
                        class="tool-chip"
                        :class="{ active: favoritesOnly }"
                        @click="favoritesOnly = !favoritesOnly">
                    ⭐ Favoriten
                </button>

                <button type="button"
                        class="tool-chip"
                        :class="{ active: onlyWithVideo }"
                        @click="onlyWithVideo = !onlyWithVideo">
                    🎬 Nur mit Video
                </button>

                <button type="button"
                        class="tool-chip"
                        :class="{ active: showUpload }"
                        @click="toggleUpload()">
                    ⬆️ Upload
                </button>

                <select v-model="sortMode" class="tool-select" aria-label="Sortierung">
                    <option value="az">A–Z</option>
                    <option value="category">Kategorie</option>
                    <option value="fav">Favoriten zuerst</option>
                </select>
            </div>

            <div class="toolbar-row chips">
                <button type="button"
                        class="cat-chip"
                        :class="{ active: selectedCategory === 'Alle' }"
                        @click="selectedCategory = 'Alle'">
                    Alle
                </button>

                <button v-for="c in categories"
                        :key="c"
                        type="button"
                        class="cat-chip"
                        :class="{ active: selectedCategory === c }"
                        @click="selectedCategory = c">
                    {{ c }}
                </button>
            </div>
        </div>

        <!-- Upload Panel -->
        <div v-if="showUpload" class="upload-panel">
            <div class="upload-grid">
                <div class="upload-col">
                    <label class="upload-label">Titel</label>
                    <input v-model="uploadTitle" class="upload-input" placeholder="z.B. Lat Pulldown" />
                </div>

                <div class="upload-col">
                    <label class="upload-label">Kategorie</label>
                    <select v-model="uploadCategory" class="upload-input" aria-label="Kategorie">
                        <option value="Oberkörper">Oberkörper</option>
                        <option value="Unterkörper">Unterkörper</option>
                        <option value="Ganzkörper">Ganzkörper</option>
                        <option value="Core">Core</option>
                        <option value="Sonstiges">Sonstiges</option>
                    </select>
                </div>

                <div class="upload-col">
                    <label class="upload-label">Level</label>
                    <select v-model="uploadLevel" class="upload-input" aria-label="Level">
                        <option value="">—</option>
                        <option value="Anfänger">Anfänger</option>
                        <option value="Fortgeschritten">Fortgeschritten</option>
                        <option value="Pro">Pro</option>
                    </select>
                </div>

                <div class="upload-col upload-wide">
                    <label class="upload-label">Beschreibung</label>
                    <input v-model="uploadDesc" class="upload-input" placeholder="Kurz erklären, worauf man achten soll…" />
                </div>

                <div class="upload-col upload-wide">
                    <label class="upload-label">Equipment (kommagetrennt)</label>
                    <input v-model="uploadEquipmentRaw" class="upload-input" placeholder="z.B. Bank, Kurzhanteln" />
                </div>

                <div class="upload-col upload-wide upload-actions">
                    <input id="tutorial-video-file"
                           ref="uploadFileEl"
                           type="file"
                           accept="video/*"
                           class="upload-file-input"
                           @change="onPickVideo" />

                    <label for="tutorial-video-file" class="action-btn file-btn">
                        📁 Video auswählen
                    </label>

                    <span v-if="uploadFile" class="file-name">
                        {{ uploadFile.name }}
                    </span>

                    <button type="button"
                            class="action-btn"
                            :disabled="!canUpload"
                            @click="createUploadedTutorial()">
                        ✅ Hinzufügen
                    </button>

                    <button type="button"
                            class="action-btn"
                            @click="cancelUpload()">
                        ✕ Abbrechen
                    </button>
                </div>

                <p v-if="uploadError" class="upload-error">{{ uploadError }}</p>
            </div>
        </div>


        <div v-if="loading" class="loading-indicator">
            <p>Tutorials werden geladen...</p>
        </div>
        <div v-else class="tutorials-content">
            <div v-if="filteredTutorials.length === 0" class="no-tutorials">
                <p>Keine Tutorials gefunden.</p>
            </div>
            <div v-else class="tutorials-grid">
                <div v-for="tutorial in filteredTutorials"
                     :key="tutorial.id"
                     class="tutorial-card"
                     @click="openTutorial(tutorial)">

                    <div class="card-head">
                        <h3 class="card-title">{{ tutorial.title }}</h3>

                        <FavoriteButton :active="isFavorite(tutorial.id)"
                                        titleActive="Aus Favoriten entfernen"
                                        titleInactive="Zu Favoriten hinzufügen"
                                        @toggle.stop="toggleFavorite(tutorial.id)" />
                    </div>

                    <iframe v-if="tutorial.videoUrl && isYouTubeEmbed(tutorial.videoUrl)"
                            :src="tutorial.videoUrl"
                            class="video-frame"
                            frameborder="0"
                            allowfullscreen
                            loading="lazy"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerpolicy="strict-origin-when-cross-origin" />

                    <video v-else-if="tutorial.videoUrl"
                           class="video-frame"
                           controls
                           playsinline
                           preload="metadata">
                        <source :src="tutorial.videoUrl" />
                    </video>

                    <div v-else class="video-placeholder">
                        <p>Video wird bald hinzugefügt</p>
                    </div>

                    <p class="card-info">{{ tutorial.description }}</p>

                    <div class="meta-row">
                        <span class="pill">{{ tutorial.category }}</span>
                        <span v-if="tutorial.level" class="pill subtle">🏷️ {{ tutorial.level }}</span>
                        <span v-if="tutorial.equipment?.length" class="pill subtle">🏋️ {{ tutorial.equipment.join(', ') }}</span>
                    </div>

                    <div class="card-actions">
                        <button type="button"
                                class="action-btn"
                                :disabled="!tutorial.videoUrl"
                                @click.stop="openOnYouTube(tutorial)">
                            ▶️ Öffnen
                        </button>

                        <button type="button"
                                class="action-btn"
                                @click.stop="copyLink(tutorial)">
                            🔗 Kopieren
                        </button>

                        <button v-if="tutorial.source === 'custom'"
                                type="button"
                                class="action-btn danger"
                                @click.stop="deleteTutorial(tutorial)">
                            🗑️ Löschen
                        </button>
                    </div>

                </div>
            </div>

            <!-- Modal -->
            <div v-if="activeTutorial" class="tut-modal" @click="closeTutorial">
                <div class="tut-modal-card" @click.stop>
                    <div class="tut-modal-head">
                        <div class="tut-modal-title">
                            <h3>{{ activeTutorial.title }}</h3>
                            <p class="tut-modal-sub">{{ activeTutorial.category }} <span v-if="activeTutorial.level">• {{ activeTutorial.level }}</span></p>
                        </div>

                        <button type="button" class="tut-modal-close" @click="closeTutorial" aria-label="Schließen">✕</button>
                    </div>

                    <iframe v-if="activeTutorial.videoUrl && isYouTubeEmbed(activeTutorial.videoUrl)"
                            :src="activeTutorial.videoUrl"
                            class="video-frame"
                            frameborder="0"
                            allowfullscreen
                            loading="lazy"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerpolicy="strict-origin-when-cross-origin" />

                    <video v-else-if="activeTutorial.videoUrl"
                           class="video-frame"
                           controls
                           playsinline
                           preload="metadata">
                        <source :src="activeTutorial.videoUrl" />
                    </video>

                    <div v-else class="video-placeholder">
                        <p>Video wird bald hinzugefügt</p>
                    </div>

                    <p class="tut-modal-desc">{{ activeTutorial.description }}</p>

                    <div class="tut-modal-meta" v-if="activeTutorial.equipment?.length">
                        <strong>Equipment:</strong> {{ activeTutorial.equipment.join(', ') }}
                    </div>

                    <div class="tut-modal-actions">
                        <button type="button"
                                class="action-btn"
                                :disabled="!activeTutorial.videoUrl"
                                @click="openOnYouTube(activeTutorial)">
                            ▶️ Auf YouTube öffnen
                        </button>

                        <button type="button" class="action-btn" @click="copyLink(activeTutorial)">
                            🔗 Link kopieren
                        </button>

                        <button v-if="activeTutorial.source === 'custom'"
                                type="button"
                                class="action-btn danger"
                                @click="deleteTutorial(activeTutorial)">
                            🗑️ Löschen
                        </button>

                        <FavoriteButton :active="isFavorite(activeTutorial.id)"
                                        titleActive="Aus Favoriten entfernen"
                                        titleInactive="Zu Favoriten hinzufügen"
                                        @toggle="toggleFavorite(activeTutorial.id)" />
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
    import UiSearch from '@/components/ui/kits/UiSearch.vue'
    import FavoriteButton from '@/components/ui/buttons/FavoriteButton.vue'

    const searchQuery = ref('');
    const loading = ref(true);
    const darkMode = ref(false);

    // --- Upload (ohne Backend) ---
    const showUpload = ref(false)

    const uploadTitle = ref('')
    const uploadDesc = ref('')
    const uploadCategory = ref<'Oberkörper' | 'Unterkörper' | 'Ganzkörper' | 'Core' | 'Sonstiges'>('Oberkörper')
    const uploadLevel = ref<'' | 'Anfänger' | 'Fortgeschritten' | 'Pro'>('')
    const uploadEquipmentRaw = ref('')
    const uploadFileEl = ref<HTMLInputElement | null>(null)
    const uploadFile = ref<File | null>(null)
    const uploadError = ref('')

    const LS_CUSTOM = 'tutorials:custom-v1'

    // ObjectURLs sauber verwalten (sonst Memory Leak)
    const objectUrls = new Set<string>()

    const canUpload = computed(() => {
        return !!uploadFile.value && uploadTitle.value.trim().length >= 2
    })

    function toggleUpload() {
        showUpload.value = !showUpload.value
        uploadError.value = ''
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

        // harte Meinung: limit rein, sonst sprengt der User sein Gerät
        const MAX_MB = 200
        const mb = f.size / (1024 * 1024)
        if (mb > MAX_MB) {
            uploadError.value = `Video ist zu groß (${mb.toFixed(1)} MB). Max ${MAX_MB} MB.`
            uploadFile.value = null
            if (uploadFileEl.value) uploadFileEl.value.value = ''
        }
    }

    function isYouTubeEmbed(url: string) {
        return url.includes('youtube.com/embed/')
    }

    onMounted(async () => {

        loadFavorites();

        await new Promise(resolve => setTimeout(resolve, 1000));

        // erst Built-ins setzen...
        tutorials.value = [
            {
                id: 1,
                title: 'Bankdrücken',
                description: 'Lerne die korrekte Technik für Bankdrücken.',
                videoUrl: 'https://www.youtube.com/embed/vthMCtgVtFw',
                category: 'Oberkörper',
                level: 'Anfänger',
                equipment: ['Bank', 'Langhantel'],
                source: 'builtin'
            },
            {
                id: 2,
                title: 'Kniebeugen',
                description: 'Meistere die Kniebeuge für starke Beine.',
                videoUrl: 'https://www.youtube.com/embed/ultWZbUMPL8',
                category: 'Unterkörper',
                source: 'builtin'
            },
            {
                id: 3,
                title: 'Kreuzheben',
                description: 'Perfektioniere deine Kreuzhebe-Technik.',
                videoUrl: 'https://www.youtube.com/embed/VL5Ab0T07e4',
                category: 'Ganzkörper',
                source: 'builtin'
            },
            {
                id: 4,
                title: 'Schulterdrücken',
                description: 'Stärke deine Schultern mit dieser Übung.',
                videoUrl: 'https://www.youtube.com/embed/2H6FQKVjWrE',
                category: 'Oberkörper',
                source: 'builtin'
            },
            {
                id: 5,
                title: 'Klimmzüge',
                description: 'Bau deinen Rücken mit Klimmzügen auf.',
                videoUrl: 'https://www.youtube.com/embed/eGo4IYlbE5g',
                category: 'Oberkörper',
                source: 'builtin'
            },
            {
                id: 6,
                title: 'Ausfallschritte',
                description: 'Form deine Beine und deinen Po mit Ausfallschritten.',
                videoUrl: 'https://www.youtube.com/embed/QOVaHwm-Q6U',
                category: 'Unterkörper',
                source: 'builtin'
            },
            {
                id: 7,
                title: 'Plank',
                description: 'Stärke deine Core-Muskulatur mit dem Plank.',
                videoUrl: 'https://www.youtube.com/embed/pSHjTRCQxIw',
                category: 'Ganzkörper',
                source: 'builtin'
            },
            {
                id: 8,
                title: 'Bizepscurls',
                description: 'Trainiere deine Arme mit Curls.',
                videoUrl: 'https://www.youtube.com/embed/ykJmrZ5v0Oo',
                category: 'Oberkörper',
                source: 'builtin'
            },
            {
                id: 9,
                title: 'Beinpresse',
                description: 'Kräftige deine Beine an der Beinpresse.',
                videoUrl: null,
                category: 'Unterkörper',
                source: 'builtin'
            },
            {
                id: 10,
                title: 'Burpees',
                description: 'Ganzkörper-Killerübung für Ausdauer und Kraft.',
                videoUrl: 'https://www.youtube.com/embed/dZgVxmf6jkA',
                category: 'Ganzkörper',
                source: 'builtin'
            }
        ];

        // ...dann Custom oben drauf
        await hydrateCustomTutorials();

        loading.value = false;
    });


    interface Tutorial {
        id: number;
        title: string;
        description: string;
        videoUrl: string | null;
        category: string;

        level?: 'Anfänger' | 'Fortgeschritten' | 'Pro';
        equipment?: string[];

        // NEW: Quelle + Referenz für IndexedDB
        source?: 'builtin' | 'custom';
        videoRef?: string | null;
    }

    const tutorials = ref<Tutorial[]>([]);

    // IndexedDB: speichert Video-Blobs lokal
    type StoredVideo = { id: string; blob: Blob; type: string; createdAt: number }

    function openDb(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const req = indexedDB.open('tyg-tutorials-db', 1)
            req.onupgradeneeded = () => {
                const db = req.result
                if (!db.objectStoreNames.contains('videos')) {
                    db.createObjectStore('videos', { keyPath: 'id' })
                }
            }
            req.onsuccess = () => resolve(req.result)
            req.onerror = () => reject(req.error)
        })
    }

    async function idbPutVideo(id: string, file: File) {
        const db = await openDb()
        await new Promise<void>((resolve, reject) => {
            const tx = db.transaction('videos', 'readwrite')
            const store = tx.objectStore('videos')
            const payload: StoredVideo = { id, blob: file, type: file.type || 'video/mp4', createdAt: Date.now() }
            store.put(payload)
            tx.oncomplete = () => resolve()
            tx.onerror = () => reject(tx.error)
        })
    }

    async function idbGetVideo(id: string): Promise<StoredVideo | null> {
        const db = await openDb()
        return await new Promise((resolve, reject) => {
            const tx = db.transaction('videos', 'readonly')
            const store = tx.objectStore('videos')
            const req = store.get(id)
            req.onsuccess = () => resolve((req.result as StoredVideo) ?? null)
            req.onerror = () => reject(req.error)
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
        } catch {
            return []
        }
    }

    async function hydrateCustomTutorials() {
        const custom = loadCustomTutorials()

        for (const item of custom) {
            // clone + url wiederherstellen
            let videoUrl: string | null = null

            if (item.videoRef) {
                const stored = await idbGetVideo(item.videoRef)
                if (stored?.blob) {
                    const url = URL.createObjectURL(stored.blob)
                    objectUrls.add(url)
                    videoUrl = url
                }
            }

            tutorials.value.unshift({
                id: item.id,
                title: item.title,
                description: item.description,
                category: item.category,
                level: item.level,
                equipment: item.equipment,
                videoUrl,
                source: 'custom',
                videoRef: item.videoRef ?? null
            })
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
            // 1) Blob in IndexedDB
            await idbPutVideo(videoRef, file)

            // 2) ObjectURL für sofortige Anzeige
            const url = URL.createObjectURL(file)
            objectUrls.add(url)

            const equipment = uploadEquipmentRaw.value
                .split(',')
                .map(s => s.trim())
                .filter(Boolean)

            const t: Tutorial = {
                id,
                title,
                description: uploadDesc.value.trim() || 'User Upload',
                videoUrl: url,
                category: uploadCategory.value,
                level: uploadLevel.value || undefined,
                equipment: equipment.length ? equipment : undefined,
                source: 'custom',
                videoRef
            }

            tutorials.value.unshift(t)

            // 3) Metadaten persistieren (ohne Blob!)
            const current = loadCustomTutorials()
            current.unshift({
                id: t.id,
                title: t.title,
                description: t.description,
                category: t.category,
                level: t.level,
                equipment: t.equipment,
                videoRef
            })
            persistCustomTutorials(current)

            cancelUpload()
        } catch (err) {
            uploadError.value = 'Upload speichern hat nicht geklappt (IndexedDB).'
            console.error(err)
        }
    }

    async function idbDeleteVideo(id: string) {
        const db = await openDb()
        await new Promise<void>((resolve, reject) => {
            const tx = db.transaction('videos', 'readwrite')
            const store = tx.objectStore('videos')
            store.delete(id)
            tx.oncomplete = () => resolve()
            tx.onerror = () => reject(tx.error)
        })
    }

    function isCustomTutorial(t: Tutorial) {
        return t.source === 'custom'
    }

    function removeFromFavorites(id: number) {
        if (!isFavorite(id)) return
        favoriteIds.value = favoriteIds.value.filter(x => x !== id)
        persistFavorites()
    }

    async function deleteTutorial(t: Tutorial) {
        if (!isCustomTutorial(t)) return

        const ok = confirm(`Tutorial "${t.title}" wirklich löschen?`)
        if (!ok) return

        // 1) UI entfernen
        tutorials.value = tutorials.value.filter(x => x.id !== t.id)
        removeFromFavorites(t.id)

        // 2) Modal schließen falls offen
        if (activeTutorial.value?.id === t.id) activeTutorial.value = null

        // 3) localStorage Metadaten entfernen
        const current = loadCustomTutorials()
        const next = current.filter(x => x.id !== t.id)
        persistCustomTutorials(next)

        // 4) Blob aus IndexedDB löschen
        if (t.videoRef) {
            try { await idbDeleteVideo(t.videoRef) } catch (e) { console.error(e) }
        }

        // 5) ObjectURL freigeben (wenn es ein blob: ist)
        if (t.videoUrl && t.videoUrl.startsWith('blob:')) {
            try { URL.revokeObjectURL(t.videoUrl) } catch { }
            objectUrls.delete(t.videoUrl)
        }
    }

    const selectedCategory = ref<string>('Alle');
    const onlyWithVideo = ref(false);
    const favoritesOnly = ref(false);
    const sortMode = ref<'az' | 'category' | 'fav'>('az');

    const LS_FAVS = 'tutorials:favorites';
    const favoriteIds = ref<number[]>([]);

    const activeTutorial = ref<Tutorial | null>(null);

    function openTutorial(t: Tutorial) {
        activeTutorial.value = t;
    }
    function closeTutorial() {
        activeTutorial.value = null;
    }

    function loadFavorites() {
        try {
            const raw = localStorage.getItem(LS_FAVS);
            const parsed = raw ? JSON.parse(raw) : [];
            favoriteIds.value = Array.isArray(parsed) ? parsed.filter(n => typeof n === 'number') : [];
        } catch {
            favoriteIds.value = [];
        }
    }
    function persistFavorites() {
        localStorage.setItem(LS_FAVS, JSON.stringify(favoriteIds.value));
    }
    function isFavorite(id: number) {
        return favoriteIds.value.includes(id);
    }
    function toggleFavorite(id: number) {
        if (isFavorite(id)) {
            favoriteIds.value = favoriteIds.value.filter(x => x !== id);
        } else {
            favoriteIds.value = [...favoriteIds.value, id];
        }
        persistFavorites();
    }

    function toYouTubeWatchUrl(embedUrl: string) {
        const m = embedUrl.match(/youtube\.com\/embed\/([^?]+)/)
        const id = m?.[1]
        return id ? `https://www.youtube.com/watch?v=${id}` : embedUrl
    }

    function openOnYouTube(t: Tutorial) {
        if (!t.videoUrl) return

        // YouTube: embed -> watch
        if (isYouTubeEmbed(t.videoUrl)) {
            window.open(toYouTubeWatchUrl(t.videoUrl), '_blank', 'noopener,noreferrer')
            return
        }

        // Upload/Blob: einfach in neuem Tab öffnen
        window.open(t.videoUrl, '_blank', 'noopener,noreferrer')
    }

    async function copyLink(t: Tutorial) {
        const link =
            !t.videoUrl
                ? `${location.origin}${location.pathname}#tutorial-${t.id}`
                : isYouTubeEmbed(t.videoUrl)
                    ? toYouTubeWatchUrl(t.videoUrl)
                    : t.videoUrl

        try {
            await navigator.clipboard.writeText(link)
        } catch {
            const el = document.createElement('textarea')
            el.value = link
            document.body.appendChild(el)
            el.select()
            document.execCommand('copy')
            document.body.removeChild(el)
        }
    }

    const categories = computed(() => {
        const set = new Set<string>();
        tutorials.value.forEach(t => set.add(t.category));
        return Array.from(set).sort((a, b) => a.localeCompare(b, 'de'));
    });

    const filteredTutorials = computed(() => {
        const q = searchQuery.value.trim().toLowerCase();

        let list = tutorials.value.slice();

        if (q) {
            list = list.filter(t =>
                t.title.toLowerCase().includes(q)
                || t.description.toLowerCase().includes(q)
                || t.category.toLowerCase().includes(q)
            );
        }

        if (selectedCategory.value !== 'Alle') {
            list = list.filter(t => t.category === selectedCategory.value);
        }

        if (onlyWithVideo.value) {
            list = list.filter(t => !!t.videoUrl);
        }

        if (favoritesOnly.value) {
            list = list.filter(t => isFavorite(t.id));
        }

        if (sortMode.value === 'az') {
            list.sort((a, b) => a.title.localeCompare(b.title, 'de'));
        } else if (sortMode.value === 'category') {
            list.sort((a, b) => (a.category + a.title).localeCompare(b.category + b.title, 'de'));
        } else if (sortMode.value === 'fav') {
            list.sort((a, b) => Number(isFavorite(b.id)) - Number(isFavorite(a.id)) || a.title.localeCompare(b.title, 'de'));
        }

        return list;
    });

    onBeforeUnmount(() => {
        // ObjectURLs sauber wegballern
        for (const url of objectUrls) URL.revokeObjectURL(url)

        objectUrls.clear()

        document.body.classList.remove('tyg-page-tutorials')
        document.documentElement.classList.remove('tyg-page-tutorials')

    })


</script>

<style scoped>
    .tutorials {
        padding: clamp(1.4rem, 3vw, 2.4rem);
        min-height: 100vh;
        font-family: 'Inter', sans-serif;
        color: var(--text-primary);
        overflow-x: hidden;
        max-width: 100%;
        background: transparent; /* kein eigener Kasten-Gradient mehr */
    }

    html.dark-mode .tutorials {
        background: transparent;
    }

    .page-title {
        font-size: 2.25rem;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 1rem;
        letter-spacing: -0.025em;
        text-align: center;
    }

    .search-and-filter {
        display: flex;
        justify-content: center;
        margin-bottom: 1.5rem;
    }

    .tutorial-toolbar {
        max-width: 900px;
        margin: 0 auto 1.25rem;
        display: grid;
        gap: 0.75rem;

    }

    .toolbar-row {
        display: flex;
        gap: 0.6rem;
        flex-wrap: wrap;
        justify-content: center;

    }

        .toolbar-row.chips {
            justify-content: center;
        }

    .tool-chip,
    .cat-chip,
    .action-btn {
        border: 1px solid rgba(148, 163, 184, 0.35);
        background: color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
        color: var(--text-primary);
        border-radius: 999px;
        padding: 0.55rem 0.8rem;
        font-weight: 800;
        cursor: pointer;
        transition: transform 140ms ease, border-color 180ms ease, box-shadow 180ms ease;
    }

        .tool-chip.active,
        .cat-chip.active {
            border-color: rgba(129, 140, 248, 0.75);
            box-shadow: 0 10px 22px rgba(15, 23, 42, 0.18);
        }

    .tool-select {
        border: 1px solid rgba(148, 163, 184, 0.35);
        background: color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
        color: var(--text-primary);
        border-radius: 999px;
        padding: 0.55rem 0.9rem;
        font-weight: 800;
        cursor: pointer;
    }

    .card-head {
        display: flex;
        align-items: start;
        justify-content: space-between;
        gap: 0.75rem;
    }

  
    .meta-row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-top: 0.75rem;
    }

    .pill {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.35rem 0.6rem;
        border-radius: 999px;
        font-weight: 900;
        font-size: 0.9rem;
        border: 1px solid rgba(148, 163, 184, 0.35);
        color: var(--text-primary);
    }

        .pill.subtle {
            opacity: 0.9;
        }

    .card-actions {
        display: flex;
        gap: 0.6rem;
        margin-top: 0.9rem;
    }

    .action-btn {
        border-radius: 14px;
        padding: 0.55rem 0.75rem;
        font-weight: 900;
    }

        .action-btn:disabled {
            opacity: 0.55;
            cursor: not-allowed;
        }

    .tut-modal {
        position: fixed;
        inset: 0;
        z-index: 999;
        background: rgba(0, 0, 0, 0.55);
        display: grid;
        place-items: center;
        padding: 1rem;
    }

    .tut-modal-card {
        width: min(880px, 100%);
        background: color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
        border: 1px solid rgba(148, 163, 184, 0.35);
        border-radius: 18px;
        box-shadow: 0 30px 90px rgba(0, 0, 0, 0.55);
        padding: 1rem;
    }

    .tut-modal-head {
        display: flex;
        align-items: start;
        justify-content: space-between;
        gap: 1rem;
        margin-bottom: 0.75rem;
    }

    .tut-modal-title h3 {
        margin: 0;
        font-size: 1.35rem;
    }

    .tut-modal-sub {
        margin: 0.25rem 0 0;
        color: var(--text-secondary);
        font-weight: 700;

    }

    .tut-modal-close {
        border: none;
        background: transparent;
        color: var(--text-primary);
        font-size: 1.1rem;
        cursor: pointer;
        padding: 0.35rem 0.55rem;
        border-radius: 12px;
    }

    .tut-modal-desc {
        margin-top: 0.9rem;
        color: var(--text-secondary);
        font-weight: 700;
    }

    .tut-modal-meta {
        margin-top: 0.6rem;
        color: var(--text-primary);
        font-weight: 800;
    }

    .tut-modal-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.6rem;
        margin-top: 0.9rem;
    }

    @media (max-width: 520px) {
        .card-actions {
            flex-wrap: wrap;
        }

        .action-btn {
            width: 100%;
            text-align: center;
        }
    }

    @media (max-width: 600px) {
        .page-title {
            font-size: 1.75rem;
        }
    }

    @media (max-width: 600px) {
        .tutorials {
            padding: 1rem;
        }
    }


    .tutorial-card {
        position: relative;
        z-index: 1;
        background: radial-gradient( circle at top left, color-mix(in srgb, var(--accent-primary) 10%, transparent), transparent 56% ), radial-gradient( circle at bottom right, color-mix(in srgb, var(--accent-secondary) 8%, transparent), transparent 60% ), color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
        padding: 1.3rem 1.4rem 1.2rem;
        border-radius: 18px;
        border: 1px solid rgba(148, 163, 184, 0.35);
        transition: background 180ms ease-out, border-color 180ms ease-out, box-shadow 200ms ease-out, transform 160ms ease-out;
        max-width: 100%;
        overflow: hidden;
    }

        /* leichter Glow wie bei den anderen Premium-Cards */
        .tutorial-card::before {
            content: '';
            position: absolute;
            inset: 0;
            background: radial-gradient(circle at top left, rgba(129, 140, 248, 0.18), transparent 60%);
            opacity: 0;
            pointer-events: none;
            transition: opacity 160ms ease-out;
        }

        .tutorial-card:hover {
            transform: translateY(-2px);
            border-color: rgba(129, 140, 248, 0.7);
        }

            .tutorial-card:hover::before {
                opacity: 1;
            }

    html.dark-mode .tutorial-card {
        background: radial-gradient( circle at top left, color-mix(in srgb, #6366f1 16%, transparent), transparent 55% ), radial-gradient( circle at bottom right, color-mix(in srgb, #22c55e 11%, transparent), transparent 62% ), #020617;
        border-color: rgba(148, 163, 184, 0.5);
    }

    .card-title,
    .card-info {
        overflow-wrap: anywhere;
        word-break: break-word;
    }

    .card-title {
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: 1rem;
        color: var(--text-primary);
    }

        .card-title.dark-mode {
            color: #f0f6fc;
        }

    .video-frame {
        display: block;
        width: 100% !important; /* überschreibt evtl. Inline-Werte */
        max-width: 100%;
        aspect-ratio: 16 / 9; /* responsive Höhe */
        height: auto; /* mit aspect-ratio */
        border-radius: 8px;
        box-sizing: border-box;
    }

    .video-placeholder {
        background: var(--bg-secondary);
        height: 150px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        color: var(--text-secondary);
        font-size: 1rem;
    }

        .video-placeholder.dark-mode {
            background: #161b22;
            color: #c9d1d9;
        }

    .card-info {
        color: var(--text-secondary);
        margin-top: 1rem;
        font-size: 1rem;
    }

        .card-info.dark-mode {
            color: #c9d1d9;
        }

    .card-category {
        color: var(--accent-primary);
        font-weight: bold;
        margin-top: 0.5rem;
    }

    .loading-indicator, .no-tutorials {
        text-align: center;
        padding: 2rem;
        color: var(--text-secondary);
    }

        .loading-indicator.dark-mode, .no-tutorials.dark-mode {
            color: #c9d1d9;
        }


    .upload-panel {
        max-width: 900px;
        margin: 0 auto 1.25rem;
        border: 1px solid rgba(148, 163, 184, 0.35);
        background: color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
        border-radius: 18px;
        padding: 1rem;
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.18);
    }

    .upload-grid {
        display: grid;
        gap: 0.8rem;
    }

    .upload-col {
        display: grid;
        gap: 0.35rem;
    }

    .upload-wide {
        grid-column: 1 / -1;
    }

    .upload-label {
        font-weight: 900;
        color: var(--text-primary);
        font-size: 0.95rem;
    }

    .upload-input {
        width: 100%;
        border: 1px solid rgba(148, 163, 184, 0.35);
        background: color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
        color: var(--text-primary);
        border-radius: 14px;
        padding: 0.65rem 0.8rem;
        font-weight: 800;
        outline: none;
    }

        .upload-input:focus {
            border-color: rgba(129, 140, 248, 0.75);
            box-shadow: 0 0 0 4px rgba(129, 140, 248, 0.16);
        }

    .upload-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.6rem;
        align-items: center;
        /* wichtig: verhindert, dass lange Flex-Children das Layout sprengen */
        min-width: 0;
    }

        .upload-actions > * {
            min-width: 0; /* damit ellipsis wirklich greifen kann */
        }

    .upload-file {
        flex: 1 1 260px;
        max-width: 100%;
    }

    .upload-error {
        margin: 0.25rem 0 0;
        color: #ef4444;
        font-weight: 900;
    }

    @media (min-width: 700px) {
        .upload-grid {
            grid-template-columns: 1fr 1fr 1fr;
        }

        .upload-wide {
            grid-column: 1 / -1;
        }
    }

    .action-btn.danger {
        border-color: rgba(239, 68, 68, 0.55);
    }

        .action-btn.danger:hover {
            box-shadow: 0 10px 22px rgba(239, 68, 68, 0.18);
        }

    /* File Upload: natives input verstecken, Label als Button stylen */
    .upload-file-input {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0 0 0 0);
        white-space: nowrap;
        border: 0;
    }

    .file-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.45rem;
        user-select: none;
        text-decoration: none;
        white-space: nowrap;
    }

        .file-btn:active {
            transform: translateY(1px);
        }

    .file-name {
        flex: 1 1 100%;
        width: 100%;
        min-width: 0;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-weight: 900;
        color: var(--text-secondary);
        padding: 0.55rem 0.75rem;
        border-radius: 14px;
        border: 1px dashed rgba(148, 163, 184, 0.35);
        background: color-mix(in srgb, var(--bg-card) 88%, #020617 12%);
    }

    @media (max-width: 520px) {
        .upload-actions .action-btn,
        .upload-actions .file-btn {
            width: 100%;
            text-align: center;
        }
    }

    /* killt das “rechteckige Panel” hinter den Cards */
    .tutorials .tutorials-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 1.25rem;
        max-width: 100%;
        overflow-x: clip;
    }

</style>
