<template>
  <BasePopup
    :show="show"
    :show-actions="false"
    :overlay-class="overlayClass"
    @cancel="emit('close')">
    <template v-if="tutorial">
      <div class="modal-head">
        <div>
          <div class="modal-head-meta">
            <span class="category-chip" :class="`is-${normalizeText(tutorial.category).replace(/\s+/g, '-')}`">
              <span class="category-chip-dot" aria-hidden="true"></span>
              {{ tutorial.category }}
            </span>
            <strong class="level-chip">{{ tutorial.level || 'Alle Levels' }}</strong>
            <span
              v-for="badge in statusBadges"
              :key="`${tutorial.id}-${badge.kind}`"
              class="status-pill"
              :class="`is-${badge.kind}`">
              {{ badge.label }}
            </span>
          </div>
          <h3>{{ tutorial.title }}</h3>
          <p v-if="tutorial.source === 'custom'" class="section-note modal-head-note">Lokal gespeichert</p>
        </div>
      </div>

      <div class="modal-layout">
        <div class="modal-media">
          <iframe
            v-if="tutorial.videoUrl && isYouTubeEmbed(tutorial.videoUrl)"
            :src="tutorial.videoUrl"
            class="video-frame"
            frameborder="0"
            allowfullscreen
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin" />

          <video v-else-if="tutorial.videoUrl" class="video-frame" controls playsinline preload="metadata">
            <source :src="tutorial.videoUrl" />
          </video>

          <div v-else class="video-placeholder"><p>Video wird bald hinzugefügt</p></div>
        </div>

        <div class="modal-copy">
          <div
            v-if="tutorial.cues?.length || tutorial.steps?.length || tutorial.mistakes?.length"
            class="tutorial-coaching-grid">
            <section v-if="tutorial.cues?.length" class="coaching-card">
              <span class="coaching-kicker">Technik-Hinweise</span>
              <ul class="coaching-list">
                <li v-for="cue in tutorial.cues" :key="cue">{{ cue }}</li>
              </ul>
            </section>

            <section v-if="tutorial.steps?.length" class="coaching-card">
              <span class="coaching-kicker">Schritt für Schritt</span>
              <ol class="coaching-list coaching-list--ordered">
                <li v-for="step in tutorial.steps" :key="step">{{ step }}</li>
              </ol>
            </section>

            <section v-if="tutorial.mistakes?.length" class="coaching-card">
              <span class="coaching-kicker">Häufige Fehler</span>
              <ul class="coaching-list">
                <li v-for="mistake in tutorial.mistakes" :key="mistake">{{ mistake }}</li>
              </ul>
            </section>
          </div>

          <section v-if="relatedTutorials.length" class="related-section">
            <div class="related-head">
              <span class="coaching-kicker">Ähnliche Übungen</span>
              <span class="related-note">Direkt im Popup weiterspringen</span>
            </div>
            <div class="related-grid">
              <button
                v-for="relatedTutorial in relatedTutorials"
                :key="`related-${relatedTutorial.id}`"
                type="button"
                class="related-card"
                :class="tutorialCardLevelClass(relatedTutorial.level)"
                @click="emit('open', relatedTutorial)">
                <span class="related-top">
                  <span class="pill">{{ relatedTutorial.category }}</span>
                  <span v-if="relatedTutorial.level" class="pill subtle">{{ relatedTutorial.level }}</span>
                </span>
                <div v-if="getStatusBadges(relatedTutorial).length" class="tutorial-status-row">
                  <span
                    v-for="badge in getStatusBadges(relatedTutorial)"
                    :key="`related-${relatedTutorial.id}-${badge.kind}`"
                    class="status-pill"
                    :class="`is-${badge.kind}`">
                    {{ badge.label }}
                  </span>
                </div>
                <strong>{{ relatedTutorial.title }}</strong>
                <span>{{ relatedTutorial.description }}</span>
              </button>
            </div>
          </section>

          <p class="card-text modal-description">{{ tutorial.description }}</p>

          <div class="modal-meta-grid">
            <div class="info-box info-box--category">
              <span class="category-label">Kategorie</span>
              <div class="category-detail">
                <strong class="category-pill" :class="`is-${normalizeText(tutorial.category).replace(/\s+/g, '-')}`">
                  <span class="category-pill-dot" aria-hidden="true"></span>
                  {{ tutorial.category }}
                </strong>
                <span class="category-note">Bewegungsmuster und Fokus dieses Tutorials</span>
              </div>
            </div>
            <div class="info-box info-box--level">
              <div class="level-label-row">
                <span>Level</span>
                <strong class="level-chip">{{ tutorial.level || 'Nicht angegeben' }}</strong>
              </div>
              <div class="level-visual" :class="`is-${(tutorial.level || 'none').toLowerCase()}`">
                <span v-if="tutorial.level" class="level-caption">Technik und Anspruch auf einen Blick</span>
                <div v-if="tutorial.level" class="level-meter" :aria-label="`Level ${tutorial.level}`">
                  <span
                    v-for="bar in 3"
                    :key="bar"
                    class="level-meter-bar"
                    :class="{ 'is-active': bar <= getLevelBars(tutorial.level) }"></span>
                </div>
                <div v-if="tutorial.level" class="level-scale" aria-hidden="true">
                  <span>Easy</span>
                  <span>Solid</span>
                  <span>Elite</span>
                </div>
              </div>
            </div>
            <div class="info-box info-box--muscles">
              <span class="muscle-label">Muskelgruppen</span>
              <div class="muscle-detail">
                <div class="muscle-list">
                  <strong
                    v-for="group in getTutorialMuscleGroups(tutorial)"
                    :key="group"
                    class="muscle-pill">
                    <span class="muscle-pill-dot" aria-hidden="true"></span>
                    {{ group }}
                  </strong>
                </div>
                <span class="muscle-note">Diese Bereiche trainierst du mit dem Tutorial</span>
              </div>
            </div>
            <div class="info-box modal-meta-card--full">
              <span class="equipment-label">Equipment</span>
              <div class="equipment-detail">
                <div v-if="tutorial.equipment?.length" class="equipment-list">
                  <strong
                    v-for="item in tutorial.equipment"
                    :key="item"
                    class="equipment-pill">
                    <span class="equipment-pill-dot" aria-hidden="true"></span>
                    {{ item }}
                  </strong>
                </div>
                <strong v-else>Kein Equipment angegeben</strong>
                <span class="equipment-note">Das brauchst du für dieses Tutorial</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card-actions modal-actions">
        <FavoriteButton
          v-if="showFavorite"
          class="tutorial-modal-favorite"
          :active="!!favoriteActive"
          titleActive="Aus Favoriten entfernen"
          titleInactive="Zu Favoriten hinzufügen"
          @toggle="emit('toggle-favorite', tutorial)" />
        <div class="tutorial-modal-actions-right">
          <PopupActionButton
            class="tutorial-modal-btn"
            :disabled="!tutorial.videoUrl"
            @click="emit('open-video', tutorial)">
            Video öffnen
          </PopupActionButton>
          <PopupActionButton
            class="tutorial-modal-btn"
            variant="ghost"
            @click="emit('copy-link', tutorial)">
            Link kopieren
          </PopupActionButton>
          <PopupActionButton
            v-if="showDelete"
            class="tutorial-modal-btn"
            danger
            @click="emit('delete', tutorial)">
            Löschen
          </PopupActionButton>
        </div>
      </div>
    </template>
  </BasePopup>
</template>

<script setup lang="ts">
import FavoriteButton from '@/components/ui/buttons/FavoriteButton.vue'
import PopupActionButton from '@/components/ui/buttons/popup/PopupActionButton.vue'
import BasePopup from '@/components/ui/popups/BasePopup.vue'
import { isYouTubeEmbed } from '@/services/tutorialCatalog'
import { getTutorialMuscleGroups, normalizeTutorialText } from '@/services/tutorialEntries'
import type { TutorialEntry, TutorialStatusBadge } from '@/types/tutorials'

const props = defineProps<{
  show: boolean
  tutorial: TutorialEntry | null
  relatedTutorials: TutorialEntry[]
  statusBadges: TutorialStatusBadge[]
  statusBadgeResolver?: (tutorial: TutorialEntry) => TutorialStatusBadge[]
  favoriteActive?: boolean
  showFavorite?: boolean
  showDelete?: boolean
  overlayClass?: string | Record<string, boolean>
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'open', tutorial: TutorialEntry): void
  (e: 'toggle-favorite', tutorial: TutorialEntry): void
  (e: 'open-video', tutorial: TutorialEntry): void
  (e: 'copy-link', tutorial: TutorialEntry): void
  (e: 'delete', tutorial: TutorialEntry): void
}>()

function normalizeText(value: string) {
  return normalizeTutorialText(value)
}

function getLevelBars(level?: TutorialEntry['level']) {
  if (level === 'Anfänger') return 1
  if (level === 'Fortgeschritten') return 2
  if (level === 'Pro') return 3
  return 0
}

function tutorialCardLevelClass(level?: TutorialEntry['level']) {
  if (level === 'Anfänger') return 'related-card--level-beginner'
  if (level === 'Fortgeschritten') return 'related-card--level-medium'
  if (level === 'Pro') return 'related-card--level-hard'
  return ''
}

function getStatusBadges(tutorial: TutorialEntry) {
  return props.statusBadgeResolver?.(tutorial) ?? []
}
</script>

<style scoped>
.section-note,.card-text{color:var(--text-secondary);line-height:1.6}
.card-actions,.modal-actions{display:flex;flex-wrap:wrap;gap:.7rem}
.card-actions{display:flex;flex-wrap:wrap;gap:.5rem;justify-content:center;align-items:center;align-self:center;width:100%;margin-top:auto}
.modal-head{display:flex;justify-content:space-between;gap:1rem;margin-bottom:1rem}
.modal-head h3{margin:.3rem 0 0;font-size:clamp(1.3rem,2vw,2rem)}
.modal-head-meta{display:flex;align-items:center;flex-wrap:wrap;gap:.55rem}
.category-chip,.category-pill,.equipment-pill,.muscle-pill,.pill,.status-pill,.level-chip{display:inline-flex;align-items:center;justify-content:center;align-self:flex-start;flex:0 0 auto;white-space:nowrap}
.category-chip,.category-pill{gap:.45rem;min-height:2rem;padding:.38rem .78rem;border-radius:999px;font-size:.82rem;font-weight:800;letter-spacing:.02em;background:rgba(255,255,255,.05);color:var(--text-primary);border:1px solid rgba(148,163,184,.2);line-height:1}
.category-chip-dot,.category-pill-dot,.equipment-pill-dot,.muscle-pill-dot{width:.5rem;height:.5rem;border-radius:999px}
.category-chip-dot,.category-pill-dot{background:currentColor;box-shadow:0 0 0 4px color-mix(in srgb,currentColor 16%,transparent)}
.category-chip.is-oberkorper,.category-pill.is-oberkorper{color:#38bdf8;border-color:color-mix(in srgb,#38bdf8 34%,rgba(148,163,184,.18))}
.category-chip.is-unterkorper,.category-pill.is-unterkorper{color:#22c55e;border-color:color-mix(in srgb,#22c55e 34%,rgba(148,163,184,.18))}
.category-chip.is-ganzkorper,.category-pill.is-ganzkorper{color:#818cf8;border-color:color-mix(in srgb,#818cf8 36%,rgba(148,163,184,.18))}
.category-chip.is-core,.category-pill.is-core{color:#f59e0b;border-color:color-mix(in srgb,#f59e0b 34%,rgba(148,163,184,.18))}
.category-chip.is-sonstiges,.category-pill.is-sonstiges{color:#f472b6;border-color:color-mix(in srgb,#f472b6 34%,rgba(148,163,184,.18))}
.modal-head-note{margin:.45rem 0 0}
.modal-layout{display:grid;gap:1rem}
.modal-media{width:100%}
.video-frame{display:block;width:100%;max-width:100%;aspect-ratio:16/9;border:0;border-radius:20px;background:#020617}
.video-placeholder{aspect-ratio:16/9;min-height:0;display:grid;place-items:center;border-radius:20px;background:linear-gradient(135deg,rgba(15,23,42,.9),rgba(30,41,59,.84));color:rgba(226,232,240,.76);text-align:center;padding:1rem}
.modal-copy{display:grid;gap:1rem}
.tutorial-coaching-grid{display:grid;grid-template-columns:1fr;gap:.8rem}
.coaching-card,.info-box{display:grid;gap:.55rem;padding:1rem;border-radius:18px;background:rgba(255,255,255,.03);border:1px solid rgba(148,163,184,.16)}
.coaching-kicker{font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;font-weight:800;color:var(--text-secondary)}
.coaching-list{margin:0;padding-left:1rem;display:grid;gap:.45rem;color:var(--text-primary);line-height:1.45}
.coaching-list--ordered{padding-left:1.15rem}
.related-section{display:grid;gap:.7rem}
.related-head{display:flex;align-items:center;justify-content:space-between;gap:.8rem;flex-wrap:wrap}
.related-note,.category-note,.equipment-note,.muscle-note,.level-caption{font-size:.74rem;line-height:1.35;color:var(--text-secondary)}
.related-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.8rem}
.related-card{display:grid;gap:.5rem;text-align:left;padding:1rem;border-radius:18px;border:1px solid rgba(148,163,184,.18);background:rgba(255,255,255,.03);color:var(--text-primary);cursor:pointer;transition:transform .14s ease,box-shadow .18s ease,border-color .18s ease,background .18s ease}
.related-card strong{font-size:.98rem;line-height:1.25}
.related-card span:last-child{color:var(--text-secondary);line-height:1.45}
.related-card--level-beginner{border-color:rgba(34,197,94,.68)}
.related-card--level-medium{border-color:rgba(234,179,8,.72)}
.related-card--level-hard{border-color:rgba(239,68,68,.72)}
.related-top{display:flex;gap:.45rem;flex-wrap:wrap}
@media (hover:hover){.related-card:hover{transform:translateY(-2px);border-color:rgba(129,140,248,.45);box-shadow:0 16px 30px rgba(15,23,42,.16);background:rgba(255,255,255,.05)}}
.modal-description{margin:0;display:block;min-height:0}
.modal-meta-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.8rem}
.modal-meta-card--full{grid-column:1/-1}
.category-detail,.equipment-detail,.muscle-detail{display:grid;gap:.45rem}
.category-label,.equipment-label,.muscle-label{display:block;margin-bottom:.7rem}
.equipment-list,.muscle-list{display:flex;flex-wrap:wrap;gap:.5rem}
.equipment-pill,.muscle-pill{gap:.45rem;min-height:2rem;padding:.38rem .78rem;border-radius:999px;font-size:.82rem;font-weight:800;letter-spacing:.02em;background:rgba(255,255,255,.05);color:var(--text-primary);border:1px solid rgba(148,163,184,.2);line-height:1}
.equipment-pill-dot{background:var(--accent-secondary);box-shadow:0 0 0 4px color-mix(in srgb,var(--accent-secondary) 16%,transparent)}
.muscle-pill-dot{background:#f472b6;box-shadow:0 0 0 4px color-mix(in srgb,#f472b6 16%,transparent)}
.level-label-row{display:flex;align-items:center;justify-content:space-between;gap:.75rem}
.level-visual{display:grid;gap:.9rem;padding:0;border:0;box-shadow:none;background:transparent}
.level-meter{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.5rem;width:100%}
.level-meter-bar{height:.75rem;border-radius:999px;background:rgba(148,163,184,.16);border:1px solid rgba(148,163,184,.18)}
.level-meter-bar.is-active{background:linear-gradient(135deg,rgba(56,189,248,.85),rgba(129,140,248,.82));border-color:rgba(129,140,248,.54)}
.level-scale{display:flex;justify-content:space-between;gap:.6rem;font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;color:var(--text-secondary)}
.pill{min-height:2rem;padding:.35rem .7rem;border-radius:999px;font-size:.78rem;font-weight:800;line-height:1;background:rgba(56,189,248,.12);border:1px solid rgba(56,189,248,.2)}
.pill.subtle{background:rgba(148,163,184,.08);border:1px solid rgba(148,163,184,.16)}
.status-pill{min-height:2rem;padding:.35rem .7rem;border-radius:999px;font-size:.75rem;font-weight:800;letter-spacing:.01em;border:1px solid rgba(148,163,184,.18);background:rgba(255,255,255,.05);color:var(--text-primary);line-height:1}
.status-pill.is-recent{background:linear-gradient(135deg,color-mix(in srgb,var(--accent-primary) 18%, var(--bg-card) 82%),color-mix(in srgb,var(--accent-secondary) 14%, var(--bg-card) 86%));border-color:color-mix(in srgb,var(--accent-primary) 32%,rgba(148,163,184,.18));color:color-mix(in srgb,var(--text-primary) 88%, white 12%)}
.status-pill.is-plan{background:color-mix(in srgb,#0f172a 76%,#22c55e 24%);border-color:color-mix(in srgb,#22c55e 38%,rgba(148,163,184,.18));color:#dcfce7}
.level-chip{min-height:2rem;padding:.38rem .78rem;border-radius:999px;font-size:.86rem;letter-spacing:.02em;background:rgba(255,255,255,.04);border:0;box-shadow:none;line-height:1}
.tutorial-modal-actions-right{display:flex;flex-wrap:wrap;gap:.7rem}
@media (max-width: 900px){
  .related-grid,.modal-meta-grid{grid-template-columns:1fr}
}
</style>


