<!--pages/Profile.vue-->

<template>
    <section class="profile">
        <!-- Header -->
        <header ref="profileHeaderEl" class="profile-header">

            <div class="avatar-wrap" :class="{ 'is-guided': avatarGuideActive }">
                <div class="avatar ring clickable"
                     ref="avatarEl"
                     @click="onAvatarClick"
                     @dblclick.prevent="onAvatarDblClick"
                     title="Profilbild ändern"
                     @pointerdown="onAvatarPointerDown"
                     @pointerup="onAvatarPointerUp"
                     @pointermove="onAvatarPointerMove"
                     @pointercancel="cancelAvatarPress"
                     @mousedown.right.prevent="openAvatarMenuAt($event as any)"
                     @contextmenu.prevent
                     @dragover.prevent
                     @drop.prevent="onAvatarDrop">
                    <img v-if="avatarUrl" :src="avatarUrl" alt="Profilbild" draggable="false" @dragstart.prevent />
                    <span v-else-if="initials">{{ initials }}</span>
                    <i v-else class="fas fa-user"></i>

                    <!-- Kontextmenü -->
                    <HoldMenu v-if="showAvatarMenu"
                              ref="avatarMenuEl"
                              class="profile-holdmenu"
                              :trigger="avatarEl"
                              :menuStyle="avatarMenuStyle">
                        <button type="button"
                                @click="openAvatarFull"
                                title="Profilbild in groß anzeigen"
                                aria-label="Profilbild in groß anzeigen">
                            Bild öffnen
                        </button>
                        <button type="button"
                                :disabled="!avatarUrl || !canClipboardImages"
                                @click="copyAvatar"
                                :title="!canClipboardImages ? 'Dein Browser unterstützt Bild-Kopieren nicht' : 'Bild in Zwischenablage kopieren'">
                            Bild kopieren
                        </button>
                        <button type="button"
                                @click="uploadNewAvatar"
                                title="Neues Profilbild hochladen"
                                aria-label="Neues Profilbild hochladen">
                            Neues Bild hochladen…
                        </button>
                        <button v-if="avatarUrl"
                                type="button"
                                class="danger"
                                @click="openDeleteAvatarPopup"
                                title="Profilbild entfernen"
                                aria-label="Profilbild entfernen">
                            Bild entfernen
                        </button>
                    </HoldMenu>

                </div>

                <button class="avatar-plus"
                        @click.stop="pickAvatar"
                        :title="avatarUrl ? 'Profilbild ändern' : 'Profilbild hinzufügen'"
                        :aria-label="avatarUrl ? 'Profilbild ändern' : 'Profilbild hinzufügen'"></button>
            </div>
            <input ref="avatarInput"
                   type="file"
                   accept="image/*"
                   class="hidden-file-input"
                   @change="onAvatarSelected" />

            <div class="meta">
                <h1 class="title">Profil</h1>
                <p class="muted">
                    Username
                    <strong :title="username || 'Kein Username gesetzt'">
                        {{ username || 'Kein Username gesetzt' }}
                    </strong>
                </p>
                <div class="actions">
                    <button class="btn neutral" @click="openUsernamePopup">
                        <i class="fas fa-user"></i>
                        {{ hasUsername ? 'Username ändern' : 'Username hinzufügen' }}
                    </button>
                    <button class="btn neutral" @click="openEmailPopup">
                        <i class="fas fa-envelope"></i>
                        E-Mail ändern
                    </button>
                    <button class="btn neutral" @click="openPasswordPopup">
                        <i class="fas fa-key"></i>
                        Passwort ändern
                    </button>
                    <button class="btn danger-outline" @click="openDeletePopup">
                        <i class="fas fa-user-slash"></i>
                        Profil löschen
                    </button>
                </div>
            </div>
        </header>
        <section class="card profile-check-card">
            <div class="profile-check-head">
                <h3 class="card-title profile-check-title"><i class="fas fa-user-check"></i> Profil-Check</h3>
                <span class="profile-check-percent">{{ profileCompletion }}%</span>
            </div>

            <p class="profile-check-sub">
                {{ completedProfileSteps }} von {{ profileSteps.length }} Punkten erledigt. {{ profileCheckHint }}
            </p>

            <div class="profile-check-progress-bar">
                <div class="profile-check-progress-fill" :style="{ width: profileCompletion + '%' }"></div>
            </div>

            <div class="profile-check-steps">
                <button v-for="step in profileSteps"
                        :key="step.key"
                        type="button"
                        class="profile-check-step"
                        :class="{ done: step.done }"
                        @click="jumpToProfileStep(step.key)">
                    <span class="profile-check-step-icon" aria-hidden="true">
                        {{ step.done ? '✓' : step.icon }}
                    </span>
                    <div class="profile-check-step-copy">
                        <strong>{{ step.label }}</strong>
                        <span>{{ step.hint }}</span>
                    </div>
                </button>
            </div>
        </section>
        <!-- INSERT direkt unter dem Profil-Check-<section class="card"> -->
        <section ref="weeklyGoalCardEl" class="card weekly-goal-card">
            <div class="weekly-goal-head">
                <div>
                    <span class="weekly-goal-eyebrow">Dein Fokus diese Woche</span>
                    <h3 class="card-title weekly-goal-title">
                        <i class="fas fa-bullseye"></i> Wochenziel
                    </h3>
                </div>
                <div class="weekly-goal-chip" :class="`is-${weeklyGoalTone}`">
                    {{ weeklyStatusText }}
                </div>
            </div>

            <div class="weekly-goal-inner">
                <div class="weekly-goal-visual"
                     role="img"
                     :aria-label="`Wochenziel: ${weeklyWorkouts}/${targetWorkoutsPerWeek} Workouts`">
                    <svg class="donut" viewBox="0 0 36 36" aria-hidden="true">
                        <defs>
                            <linearGradient id="weekly-goal-donut-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stop-color="#93c5fd"></stop>
                                <stop offset="55%" stop-color="#3b82f6"></stop>
                                <stop offset="100%" stop-color="#1d4ed8"></stop>
                            </linearGradient>
                        </defs>
                        <circle class="donut-bg" cx="18" cy="18" r="16"></circle>
                        <circle class="donut-fg" cx="18" cy="18" r="16"
                                :stroke-dasharray="donutDasharray"
                                stroke-linecap="round"></circle>
                        <text x="50%" y="50%" text-anchor="middle"
                              dominant-baseline="central"
                              class="donut-label">
                            {{ donutPercent }}%
                        </text>
                    </svg>
                </div>

                <div class="weekly-goal-side">
                    <div class="weekly-goal-stats">
                        <div class="weekly-goal-stat-card">
                            <span class="weekly-goal-stat-label">Aktuell</span>
                            <strong class="weekly-goal-stat-value">{{ weeklyWorkouts }}</strong>
                        </div>
                        <div class="weekly-goal-stat-card">
                            <span class="weekly-goal-stat-label">Ziel</span>
                            <strong class="weekly-goal-stat-value">{{ targetWorkoutsPerWeek }}</strong>
                        </div>
                    </div>

                    <div class="weekly-goal-copy">
                        <div class="weekly-goal-line">
                            {{ weeklyWorkouts }} von {{ targetWorkoutsPerWeek }} Workouts geschafft
                        </div>
                        <div class="weekly-goal-progress-rail">
                            <div class="weekly-goal-progress-fill" :style="{ width: `${donutPercent}%` }"></div>
                        </div>

                        <p class="weekly-goal-sub" v-if="targetWorkoutsPerWeek">
                            Noch {{ weeklyRemaining }} Workout<span v-if="weeklyRemaining !== 1">s</span> bis zum Ziel
                        </p>
                        <p class="weekly-goal-sub" v-else>
                        Kein Ziel gesetzt – stell dir unten eins ein.
                        </p>
                    </div>
                </div>
            </div>

            <div class="weekly-goal-footer">
                <span class="weekly-goal-auto-hint">
                    Ziel wird automatisch aus deinen letzten Wochen berechnet.
                </span>
            </div>
        </section>


        <!-- Quick Stats (aus Activity berechnet / gespeichert) -->
        <section class="grid three quick-stats">
            <div class="card stat">
                <div class="stat-icon"><i class="fas fa-fire"></i></div>
                <div>
                    <div class="stat-value">{{ weeklyWorkouts }}</div>
                    <div class="stat-label">Workouts (7 Tage)</div>
                </div>
            </div>

            <div class="card stat">
                <div class="stat-icon"><i class="fas fa-stopwatch"></i></div>
                <div>
                    <div class="stat-value">{{ favoriteTimers }}</div>
                    <div class="stat-label">Favorisierte Timer</div>
                </div>
            </div>

            <div class="card stat">
                <div class="stat-icon"><i class="fas fa-chart-line"></i></div>
                <div>
                    <div class="stat-value">{{ streakDays }}</div>
                    <div class="stat-label">Streak (Tage)</div>
                </div>
            </div>
        </section>

        <!-- Activity + Achievements -->
        <section class="grid two">
            <div class="card card--soft-center">
                <h3 class="card-title"><i class="fas fa-heartbeat"></i> Aktivität</h3>

                <div class="sparkline-wrap">
                    <svg class="sparkline" viewBox="0 0 100 32" preserveAspectRatio="none">
                        <polyline :points="sparkPoints" fill="none" stroke="currentColor" stroke-width="2" />
                    </svg>
                    <div class="spark-legend">
                        Letzte {{ activity.length }} Tage · Ø {{ avgActivity }} Workouts/Tag
                    </div>
                </div>
            </div>

            <div ref="aboutCardEl" class="card">
                <h3 class="card-title"><i class="fas fa-trophy"></i> Achievements</h3>
                <div class="badges">
                    <span v-for="b in computedBadges" :key="b.id" class="badge" :title="b.desc">
                        <i :class="b.icon"></i> {{ b.label }}
                    </span>
                    <span v-if="!computedBadges.length" class="badge muted">Noch keine – leg los! 🚀</span>
                </div>
            </div>
        </section>

        <!-- About + Ziele -->
        <section class="grid two">
            <div ref="goalsCardEl" class="card">
                <h3 class="card-title"><i class="fas fa-user-circle"></i> Über dich</h3>
                <ul class="list">
                    <li class="about-name-row">
                        <span class="key">Name</span>
                        <span class="val name-val" :class="{ 'is-editing': editingName }">
                            <template v-if="editingName">
                                <input class="input name-input" v-model.trim="displayName" @keyup.enter="saveDisplayName" />
                                <EditInput title="Name speichern" ariaLabel="Name speichern" @click="saveDisplayName">
                                    Speichern
                                </EditInput>
                            </template>
                            <template v-else>
                                <span class="name-text"
                                      @dblclick.prevent="editingName = true"
                                      title="Doppelklick: Name bearbeiten">{{ displayName || '—' }}</span>

                                <!-- REPLACE im Name-Button-Inhalt -->
                                <button type="button"
                                        class="name-edit-btn"
                                        title="Name bearbeiten"
                                        aria-label="Name bearbeiten"
                                        @click="editingName = true">
                                    <i class="fas fa-pencil-alt" aria-hidden="true"></i>
                                    <span class="name-edit-label">Bearbeiten</span>
                                </button>

                            </template>

                        </span>
                    </li>

                    <li>
                        <span class="key">E-Mail</span>
                        <span class="val email-text"
                              @dblclick.prevent="openEmailPopup"
                              :title="fullEmail || 'Doppelklick: E-Mail ändern'">
                            {{ shortEmail }}
                        </span>
                    </li>
                    <li><span class="key">Mitglied seit</span><span class="val">{{ memberSinceDisplay }}</span></li>
                    <li><span class="key">Status</span><span class="val badge">Aktiv</span></li>
                </ul>
            </div>

            <div class="card">
                <h3 class="card-title"><i class="fas fa-bullseye"></i> Ziele</h3>
                <!-- REPLACE innerhalb der Ziele-Card (.goals + goal-controls) -->
                <Draggable v-model="goalOrder"
                           item-key="key"
                           handle=".goal-handle"
                           ghost-class="goal-ghost"
                           drag-class="goal-drag"
                           animation="160"
                           aria-label="Ziele per Drag and Drop sortieren">
                    <template #item="{ element: key, index: idx }">
                        <div class="goal" :data-key="key">
                            <div class="goal-top">
                                <span class="goal-handle" title="Ziehen zum Sortieren" aria-label="Ziehen zum Sortieren" tabindex="0">≡</span>
                                <span class="goal-name">{{ goalLabels[key as GoalKey] }}</span>
                                <span class="goal-value">{{ progress[key as GoalKey] }}%</span>
                            </div>
                            <div class="bar">
                                <div :style="{ width: progress[key as GoalKey] + '%' }"></div>
                            </div>
                        </div>
                    </template>
                </Draggable>
                <div class="goal-controls">
                    <EditInput @click="resetProgress" title="Ziele Reset" ariaLabel="Ziele Reset">Reset</EditInput>
                </div>

            </div>
        </section>

        <!-- Motto (inline editierbar, localStorage) -->
        <section ref="mottoCardEl" class="card motto-card">
            <h3 class="card-title"><i class="fas fa-quote-left"></i> Motto</h3>

        <div class="motto-row">
            <input v-if="editingMotto"
                   v-model.trim="motto"
                   class="input motto-input"
                   placeholder="Dein Motto…"
                   @keyup.enter="saveMotto" />
            <p v-else class="motto" lang="de">
                {{ mottoView || 'Kein Motto gesetzt' }}
            </p>

            <div class="motto-actions">
                <EditInput class="motto-random-btn"
                           :ghost="true"
                           title="Zufälliges Motto"
                           ariaLabel="Zufälliges Motto"
                           @click="applyRandomMotto">
                    <span class="motto-random-label">Random</span>
                    <span class="motto-random-emoji" aria-hidden="true">🎲</span>
                </EditInput>

                <EditInput v-show="editingMotto || motto"
                           :ghost="!editingMotto"
                           @click="toggleMotto"
                           :title="editingMotto ? 'Motto speichern' : 'Motto bearbeiten'"
                           :ariaLabel="editingMotto ? 'Motto speichern' : 'Motto bearbeiten'">
                    {{ editingMotto ? 'Speichern' : 'Bearbeiten' }}
                    </EditInput>

                    <EditInput v-show="!editingMotto && !motto"
                               :ghost="true"
                               title="Motto hinzufügen"
                               ariaLabel="Motto hinzufügen"
                               @click="startAddMotto">
                        <span class="motto-add-label">Motto hinzufügen</span>
                    </EditInput>

                    <EditInput v-show="!editingMotto && motto"
                               :ghost="true"
                               title="Motto löschen"
                               ariaLabel="Motto löschen"
                               @click="clearMotto">
                        Löschen
                    </EditInput>
                </div>
            </div>
        </section>

        <div class="profile-footer-actions">
            <button class="btn logout-footer-btn" @click="logout">
                <i class="fas fa-sign-out-alt"></i>
                Logout
            </button>
        </div>

        <!-- === Popups === -->
        <UsernameChangePopup :show="showUsernamePopup"
                             :currentUsername="username"
                             @cancel="closeUsernamePopup"
                             @save="handleUsernameChange" />

        <EmailChangePopup :show="showEmailPopup"
                          @cancel="closeEmailPopup"
                          @save="handleEmailChange" />

        <PasswordChangePopup :show="showPasswordPopup"
                             @cancel="closePasswordPopup"
                             @save="handlePasswordChange" />


        <DeleteAccountPopup :show="showDeletePopup"
                            :confirmPhrase="deleteConfirmPhrase"
                            @cancel="closeDeletePopup"
                            @confirm="handleAccountDelete" />
        <ValidationPopup :show="showValidation"
                         :errors="validationErrors"
                         title="Größe der Datei"
                         @close="showValidation = false" />

        <SavePopup :show="showSavePopup"
                   :src="pendingAvatar"
                   title="Profilbild speichern?"
                   hint="Das wird als neues Profilbild gespeichert."
                   @cancel="onCancelSaveAvatar"
                   @confirm="onConfirmSaveAvatar" />

        <DeleteConfirmPopup :show="showDeleteAvatarPopup"
                            @cancel="closeDeleteAvatarPopup"
                            @confirm="onConfirmDeleteAvatar" />

        <div v-if="showAvatarViewer"
             class="image-viewer-overlay"
             role="dialog"
             aria-modal="true"
             tabindex="0"
             @click.self="closeAvatarViewer"
             @keydown.esc="closeAvatarViewer"
             @keydown="onViewerKeydown"
             @wheel.prevent="onViewerWheel">
            <div class="image-viewer-stage"
                 @pointerdown="onViewerPointerDown"
                 @pointermove="onViewerPointerMove"
                 @pointerup="onViewerPointerUp"
                 @pointercancel="onViewerPointerUp"
                 @dblclick="onViewerDblClick">
                <img :src="avatarUrl || ''"
                     alt="Profilbild groß"
                     class="image-viewer-img"
                     :style="{ transform: `translate(${viewerTx}px, ${viewerTy}px) scale(${viewerScale})` }" />
            </div>
            <div class="viewer-controls">
                <button class="vc-btn"
                        @click="viewerScale = clampScale(viewerScale * 1.1)"
                        aria-label="Zoom in"
                        :title="isMobile ? 'Zoom in' : 'Zoom in (+)'">
                    +
                </button>

                <button class="vc-btn"
                        @click="viewerScale = clampScale(viewerScale / 1.1)"
                        aria-label="Zoom out"
                        :title="isMobile ? 'Zoom out' : 'Zoom out (− / Strg+− / ⌘+−)'">
                    −
                </button>

                <button class="vc-btn"
                        @click="resetViewerTransform()"
                        aria-label="Zurücksetzen"
                        :title="isMobile ? 'Zurücksetzen' : 'Position/Zoom zurücksetzen (Strg+Z / ⌘+Z)'">
                    ⟲
                </button>

                <button v-if="!isMobile"
                        class="vc-btn"
                        @click="toggleShortcuts"
                        :aria-label="helpAria"
                        :title="helpTitle">
                    ?
                </button>
            </div>

            <button class="image-viewer-close"
                    @click="onCloseClick"
                    :aria-label="closeLabel"
                    :title="closeTitle">
                ×
            </button>

            <!-- REPLACE in Profile.vue (ShortcardPopup-Tag) -->
            <ShortcardPopup :show="showShortcuts && !isMobile"
                            :showActions="false"
                            overlayClass="shortcuts-overlay"
                            @cancel="showShortcuts = false">
                <div class="sc-head">
                    <span>Bild-Shortcuts</span>
                    <button class="sc-x"
                            type="button"
                            :title="scCloseTitle"
                            :aria-label="scCloseTitle"
                            @click="showShortcuts = false">
                        ×
                    </button>
                </div>

                <ul class="sc-list">
                    <li><kbd>+</kbd> – Zoom in</li>
                    <li><kbd>−</kbd> / <kbd>Strg</kbd>+<kbd>−</kbd> / <kbd>⌘</kbd>+<kbd>−</kbd> – Zoom out</li>
                    <li><kbd>Strg</kbd>+<kbd>Z</kbd> / <kbd>⌘</kbd>+<kbd>Z</kbd> – Reset (Position &amp; Zoom)</li>
                    <li>
                        <kbd>←</kbd> <kbd>→</kbd> <kbd>↑</kbd> <kbd>↓</kbd> – Pan
                        (mit <kbd>Alt</kbd> fein, <kbd>Shift</kbd> schnell)
                    </li>
                    <li>
                        <kbd>Doppelklick</kbd> – Zoom in (mit <kbd>Shift</kbd> = Zoom out)
                    </li>
                    <li><kbd>Mausrad/Trackpad</kbd> – Zoom zum Cursor</li>
                    <li><kbd>Leertaste</kbd> – sanft nach unten bewegen</li>
                    <li><kbd>H</kbd> / <kbd>?</kbd> – Shortcuts ein/aus</li>
                    <li><kbd>Esc</kbd> – Viewer schließen</li>
                </ul>
            </ShortcardPopup>
        </div>

        <!-- Toasts -->
        <Toast v-if="toast"
               :toast="toast"
               :dismissible="true"
               :autoDismiss="true"
               :position="toastPosition"
               @dismiss="onToastDismiss" />
    </section>
</template>


<script setup lang="ts">
    import { computed, ref, watch, onMounted, nextTick } from 'vue'
    import { useRouter } from 'vue-router'
    import { useAuthStore } from '@/store/authStore'
    import { useTrainingPlansStore } from '@/store/trainingPlansStore'
    import { useProgressStore } from '@/store/progressStore'
    import UsernameChangePopup from '@/components/ui/popups/profile/UsernameChangePopup.vue'
    import PasswordChangePopup from '@/components/ui/popups/profile/PasswordChangePopup.vue'
    import EmailChangePopup from '@/components/ui/popups/profile/EmailChangePopup.vue'
    import Toast from '@/components/ui/Toast.vue'
    import DeleteAccountPopup from '@/components/ui/popups/profile/DeleteAccountPopup.vue'
    import type { Toast as ToastModel } from '@/types/toast'
    import ValidationPopup from '@/components/ui/popups/ValidationPopup.vue'
    import SavePopup from '@/components/ui/popups/SavePopup.vue'
    import DeleteConfirmPopup from '@/components/ui/popups/DeleteConfirmPopup.vue'
    import EditInput from '@/components/ui/buttons/EditInput.vue'
    import Draggable from 'vuedraggable'
    import HoldMenu from '@/components/ui/menu/HoldMenu.vue'
    import ShortcardPopup from '@/components/ui/popups/ShortcardPopup.vue'
    import { useAutoGoals, type AutoGoalResult, type TrainingEntry } from '@/composables/useAutoGoals'
    import { getProfile, updateProfile, type UpdateProfileDto } from '@/services/profile'
    import { getRandomMotto } from '@/services/mottos'
    import { computeBadges } from '@/utils/achievements'
    import {
        LS_ALL_KEYS,
        wipeLocalStorage,

        LS_AUTH_EMAIL,
        LS_PROFILE_ACTIVITY,
        LS_PROFILE_AVATAR,
        LS_PROFILE_DISPLAY_NAME,
        LS_PROFILE_EARNED_BADGES,
        LS_PROFILE_FAV_TIMERS,
        LS_PROFILE_GOAL_ORDER,
        LS_PROFILE_MEMBER_SINCE,
        LS_PROFILE_MOTTO,
        LS_PROFILE_PROGRESS,
    } from '@/constants/storageKeys'

    function loadJSON<T>(key: string, fallback: T): T {
        try {
            const raw = localStorage.getItem(key)
            return raw ? JSON.parse(raw) as T : fallback
        } catch { return fallback }
    }

    function saveJSON(key: string, val: unknown) {
        localStorage.setItem(key, JSON.stringify(val))
    }

    async function loadProfileFromBackend() {
        try {
            const data = await getProfile()
            username.value = data.username ?? ''
            if (auth.user) auth.user.username = username.value
            displayName.value = data.displayName ?? ''
            motto.value = data.motto ?? DEFAULT_MOTTO
            avatarUrl.value = data.avatarDataUrl ?? null
            favoriteTimers.value = Number.isFinite(data.favoriteTimers) ? data.favoriteTimers : 2
            activity.value = Array.isArray(data.activity) && data.activity.length
                ? data.activity
                : [...DEFAULT_ACTIVITY]
            progress.value = {
                muscle: data.progress?.muscle ?? DEFAULT_PROGRESS.muscle,
                weight: data.progress?.weight ?? DEFAULT_PROGRESS.weight,
                nutrition: data.progress?.nutrition ?? DEFAULT_PROGRESS.nutrition
            }
            autoGoalPrevious.value = {
                muscle: progress.value.muscle,
                weightTracking: progress.value.weight,
                nutrition: progress.value.nutrition
            }
            goalOrder.value = (data.goalOrder?.length ? data.goalOrder : DEFAULT_GOAL_ORDER) as GoalKey[]
            earnedBadges.value = Array.isArray(data.earnedBadges) ? data.earnedBadges : []
            const since = data.memberSinceUtc ? String(data.memberSinceUtc).slice(0, 10) : ''
            memberSince.value = since || new Date().toISOString().slice(0, 10)
        } finally {
            profileLoaded.value = true
        }
    }

    function loadLocalProfile() {
        username.value = auth.user?.username ?? ''
        displayName.value = localStorage.getItem(LS_PROFILE_DISPLAY_NAME) ?? ''
        motto.value = localStorage.getItem(LS_KEYS.motto) ?? DEFAULT_MOTTO
        avatarUrl.value = localStorage.getItem(AVATAR_KEY)
        favoriteTimers.value = Number(localStorage.getItem(LS_KEYS.favorites) ?? 2)
        activity.value = loadJSON(LS_KEYS.activity, [1, 0, 2, 1, 3, 2, 2, 1, 0, 2])
        progress.value = loadJSON(LS_KEYS.progress, { ...DEFAULT_PROGRESS })
        goalOrder.value = loadJSON<GoalKey[]>(LS_PROFILE_GOAL_ORDER, [...DEFAULT_GOAL_ORDER])
        earnedBadges.value = loadJSON(LS_KEYS.earnedBadges, [])
        const savedMember = localStorage.getItem(LS_KEYS.memberSince)
        memberSince.value = savedMember ?? new Date().toISOString().slice(0, 10)
        if (!savedMember) localStorage.setItem(LS_KEYS.memberSince, memberSince.value)
        autoGoalsReady.value = true
        profileLoaded.value = true
    }

    // --- Stores / Router ---
    const auth = useAuthStore()
    const trainingPlansStore = useTrainingPlansStore()
    const progressStore = useProgressStore()
    const router = useRouter()
    const profileLoaded = ref(false)
    const pendingProfilePatch = ref<UpdateProfileDto>({})
    let saveProfileTimer: number | null = null
    const showDeleteAvatarPopup = ref(false)
    const showValidation = ref(false)
    const validationErrors = ref<string[]>([])
    const suppressNextClick = ref(false)
    const viewerScale = ref(1);
    const viewerTx = ref(0);
    const viewerTy = ref(0);
    const viewerPanning = ref(false);
    let viewerLast = { x: 0, y: 0 };
    const avatarMenuStyle = computed<Record<string, string>>(() => ({
        width: '220px',
        maxWidth: '220px',
    }))

    function queueProfileSave(patch: UpdateProfileDto) {
        if (!auth.user || !profileLoaded.value) return
        pendingProfilePatch.value = { ...pendingProfilePatch.value, ...patch }
        if (saveProfileTimer) window.clearTimeout(saveProfileTimer)
        saveProfileTimer = window.setTimeout(async () => {
            const payload = { ...pendingProfilePatch.value }
            pendingProfilePatch.value = {}
            try {
                await updateProfile(payload)
            } catch {
                addToast('Profil konnte nicht gespeichert werden.', 'delete')
            }
        }, 500)
    }

    function resetViewerTransform() {
        viewerScale.value = 1;
        viewerTx.value = 0;
        viewerTy.value = 0;
    }

    // INSERT Goal-Metadaten
    type GoalKey = 'muscle' | 'weight' | 'nutrition';
    const DEFAULT_ACTIVITY = Array.from({ length: 21 }, () => 0)
    const DEFAULT_PROGRESS = { muscle: 40, weight: 60, nutrition: 55 }
    const DEFAULT_GOAL_ORDER: GoalKey[] = ['muscle', 'weight', 'nutrition']
    const DEFAULT_MOTTO = 'No excuses. Just results.'
    const goalLabels: Record<GoalKey, string> = {
        muscle: 'Muskeln aufbauen',
        weight: 'Gewicht tracken',
        nutrition: 'Ernährung loggen'
    };

    const goalOrder = ref<GoalKey[]>([...DEFAULT_GOAL_ORDER])

    // INSERT Move-Funktion
    function moveGoal(index: number, dir: -1 | 1) {
        const arr = goalOrder.value.slice();
        const j = index + dir;
        if (j < 0 || j >= arr.length) return;
        const [item] = arr.splice(index, 1);
        arr.splice(j, 0, item);
        goalOrder.value = arr;
    }
    function startAddMotto() {
        editingMotto.value = true;
        nextTick(() => {
            const el = document.querySelector<HTMLInputElement>('.motto-input');
            el?.focus();
        });
    }
    function clampScale(v: number) { return Math.min(5, Math.max(0.25, v)); }

    function onAvatarClick(_e: MouseEvent) {
        if (showAvatarMenu.value || suppressNextClick.value) {
            suppressNextClick.value = false
            return
        }
        if (singleClickTimer) { clearTimeout(singleClickTimer); singleClickTimer = null }
        singleClickTimer = window.setTimeout(() => {
            singleClickTimer = null
            if (avatarUrl.value) {
                openAvatarViewer()
            } else {
                pickAvatar()
            }
        }, SINGLE_CLICK_DELAY_MS)
    }

    const canClipboardImages = computed(() => {
        return typeof navigator !== 'undefined'
            && 'clipboard' in navigator
            && typeof (window as any).ClipboardItem === 'function';
    });
    const showShortcuts = ref(false);
    function toggleShortcuts() { showShortcuts.value = !showShortcuts.value; }

    function dataUrlToBlob(dataUrl: string): Blob {
        // data:[<mime>][;base64],<data>
        const [header, data] = dataUrl.split(',');
        const isBase64 = /;base64$/i.test(header);
        const mimeMatch = header.match(/^data:([^;]+)/i);
        const mime = mimeMatch ? mimeMatch[1] : 'image/png';
        const bytes = isBase64 ? atob(data) : decodeURIComponent(data);
        const len = bytes.length;
        const arr = new Uint8Array(len);
        for (let i = 0; i < len; i++) arr[i] = bytes.charCodeAt(i);
        return new Blob([arr], { type: mime || 'image/png' });
    }

    async function urlToBlob(url: string): Promise<Blob> {
        if (url.startsWith('data:')) return dataUrlToBlob(url);
        const res = await fetch(url, { mode: 'cors' });
        if (!res.ok) throw new Error('Fetch failed');
        const blob = await res.blob();
        // Fallback-MIME wenn leer
        return blob.type ? blob : new Blob([await blob.arrayBuffer()], { type: 'image/png' });
    }
    function clearMotto() {
        const prev = motto.value || ''
        if (!prev) return
        motto.value = ''
        if (auth.user) {
            queueProfileSave({ motto: '' })
        } else {
            localStorage.setItem(LS_PROFILE_MOTTO, '')
        }
        showUndo('Motto gelöscht', () => {
            motto.value = prev
            if (auth.user) {
                queueProfileSave({ motto: prev })
            } else {
                localStorage.setItem(LS_PROFILE_MOTTO, prev)
            }
        }, 5000)
    }
    function onViewerKeydown(e: KeyboardEvent) {
        // Seite nicht scrollen lassen, wenn der Viewer aktiv ist
        const preventKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', 'Home', 'End', ' '];
        if (
            preventKeys.includes(e.key) ||
            ((e.ctrlKey || e.metaKey) && e.key.toLowerCase?.() === 'z')
        ) {
            e.preventDefault();
            e.stopPropagation();
        }

        // Hilfe-Toggle
        if (e.key === '?' || e.key.toLowerCase?.() === 'h') {
            e.preventDefault();
            showShortcuts.value = !showShortcuts.value;
            return;
        }

        // Schrittweite: Alt = fein, Shift = schnell
        const base = 20;
        const step = e.shiftKey ? base * 3 : e.altKey ? Math.max(5, Math.round(base / 4)) : base;

        // Zoom
        if (e.key === '+') {
            viewerScale.value = clampScale(viewerScale.value * 1.1);
            return;
        }
        if (e.key === '-' || (e.key === '_' && (e.ctrlKey || e.metaKey))) {
            viewerScale.value = clampScale(viewerScale.value / 1.1);
            return;
        }
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase?.() === 'z') {
            resetViewerTransform();
            return;
        }

        // Pan / Reset-Varianten
        switch (e.key) {
            case 'ArrowLeft': viewerTx.value -= step; break;
            case 'ArrowRight': viewerTx.value += step; break;
            case 'ArrowUp': viewerTy.value -= step; break;
            case 'ArrowDown': viewerTy.value += step; break;
            case 'PageUp': viewerTy.value -= step * 3; break;
            case 'PageDown': viewerTy.value += step * 3; break;
            case 'Home': viewerTx.value = 0; viewerTy.value = 0; break; // nur Pan reset
            case 'End': viewerScale.value = 1; break;                   // nur Zoom reset
            case ' ': viewerTy.value += step; break;
        }
    }

    const isMobile = ref(false);

    onMounted(() => {
        const mq = window.matchMedia?.('(max-width: 360px)');
        const update = () => { isMobile.value = !!mq?.matches; };
        update();
        mq?.addEventListener?.('change', update);
        window.addEventListener('resize', update, { passive: true });
    });

    const helpTitle = computed(() =>
        isMobile.value ? 'Shortcuts anzeigen/ausblenden' : 'Shortcuts anzeigen/ausblenden (H / ?)'
    );
    const helpAria = helpTitle;

    const closeLabel = computed(() =>
        showShortcuts.value
            ? (isMobile.value ? 'Alles schließen' : 'Alles schließen (Shortcuts)')
            : (isMobile.value ? 'Profilbild schließen' : 'Profilbild schließen (Shortcuts)')
    );
    const closeTitle = closeLabel;
    // REPLACE: Ziel automatisch auf Basis der Historie
    const targetWorkoutsPerWeek = computed(() => {
        // bis zu 21 Tage (3 Wochen) heranziehen
        const days = Math.min(21, activity.value.length);
        if (!days) return 3; // Default, wenn noch keine Daten

        const sum = sumLastDays(activity.value, days);

        // reale Wochenanzahl aus den verfügbaren Tagen
        const weeks = Math.max(1, Math.round(days / 7));
        const perWeek = sum / weeks;

        // auf ganze Zahl runden und vernünftig clampen
        let t = Math.round(perWeek || 3);
        t = Math.max(3, Math.min(10, t)); // nie <3 und nie >10
        return t;
    });

    // INSERT computeds
    const donutPercent = computed(() => {
        const tgt = Math.max(0, targetWorkoutsPerWeek.value || 0);
        if (!tgt) return 0;
        return Math.min(100, Math.round((weeklyWorkouts.value / tgt) * 100));
    });

    const donutDasharray = computed(() => {
        // Kreisumfang (r=16) ≈ 2πr = ~100.53 → wir nehmen 100 als Norm
        const filled = (donutPercent.value / 100) * 100;
        const rest = 100 - filled;
        return `${filled} ${rest}`;
    });

    const weeklyRemaining = computed(() =>
        Math.max(0, targetWorkoutsPerWeek.value - weeklyWorkouts.value)
    );

    const weeklyStatusText = computed(() => {
        if (targetWorkoutsPerWeek.value === 0) return 'Kein Ziel gesetzt';
        const p = donutPercent.value;
        if (p === 0) return 'Noch nicht gestartet';
        if (p < 40) return 'Langsam reinkommen';
        if (p < 80) return 'Du bist gut dabei';
        if (p < 100) return 'Fast geschafft';
        return 'Ziel erreicht 🎉';
    });

    const weeklyGoalTone = computed(() => {
        const p = donutPercent.value;
        if (p >= 100) return 'success';
        if (p >= 80) return 'accent';
        if (p >= 40) return 'steady';
        return 'muted';
    });

    const scCloseTitle = computed(() =>
        isMobile.value ? 'Shortcuts schließen' : 'Shortcuts schließen (Shortcuts)'
    );
    function onViewerDblClick(e: MouseEvent) {
        const factor = e.shiftKey ? 0.5 : 2; // Shift = raus
        const prev = viewerScale.value;
        const next = clampScale(prev * factor);

        const rect = (e.currentTarget as HTMLElement)?.getBoundingClientRect?.();
        if (rect) {
            const cx = e.clientX - rect.left - rect.width / 2;
            const cy = e.clientY - rect.top - rect.height / 2;
            // Mouse-zentriertes Zoomen
            viewerTx.value = cx - (cx - viewerTx.value) * (next / prev);
            viewerTy.value = cy - (cy - viewerTy.value) * (next / prev);
        }
        viewerScale.value = next;
    }
    function softHyphenate(str: string): string {
        // Füge Soft-Hyphens in SEHR langen, untrennbaren Wortblöcken ein
        // trennt alle 10 Zeichen, aber nur innerhalb von Sequenzen ohne Leer-/Bindestriche
        return str.replace(/([^\s-]{10})(?=[^\s-])/g, '$1\u00AD');
    }
    const mottoView = computed(() => softHyphenate(motto.value || ''));
    // --- LocalStorage Keys ---
    const LS_KEYS = {
        activity: LS_PROFILE_ACTIVITY,
        progress: LS_PROFILE_PROGRESS,
        favorites: LS_PROFILE_FAV_TIMERS,
        motto: LS_PROFILE_MOTTO,
        memberSince: LS_PROFILE_MEMBER_SINCE,
        email: LS_AUTH_EMAIL,
        avatar: LS_PROFILE_AVATAR,
        earnedBadges: LS_PROFILE_EARNED_BADGES
    } as const
    const { calculateGoals } = useAutoGoals()

    const AVATAR_KEY = LS_KEYS.avatar
    function openDeleteAvatarPopup() {
        closeAvatarMenu()
        showDeleteAvatarPopup.value = true
    }
    type UndoEntry = { id: number; label: string; rollback: () => void; timer: number | null }
    const undoEntry = ref<UndoEntry | null>(null)

    function showUndo(label: string, rollback: () => void, ms = 5000) {
        // Ein einziger Toast mit eingebauter Action
        addToast(label, 'delete', ms, {
            label: 'Rückgängig',
            handler: () => {
                // Rollback ausführen – kein weiterer Toast
                rollback()
            }
        })
    }

    function performUndo() {
        if (!undoEntry.value) return
        const entry = undoEntry.value
        undoEntry.value = null
        if (entry.timer) clearTimeout(entry.timer)
        entry.rollback()
        addToast('Rückgängig gemacht', 'add')
    }

    function cancelUndoWindow() {
        if (undoEntry.value?.timer) clearTimeout(undoEntry.value.timer)
        undoEntry.value = null
    }

    function softDeleteAvatar() {
        const prev = avatarUrl.value
        if (!prev) return
        // sofort löschen
        avatarUrl.value = null
        if (auth.user) {
            queueProfileSave({ avatarDataUrl: '' })
        } else {
            localStorage.removeItem(AVATAR_KEY)
        }
        showUndo('Profilbild entfernt', () => {
            avatarUrl.value = prev
            if (auth.user) {
                queueProfileSave({ avatarDataUrl: prev })
            } else {
                localStorage.setItem(AVATAR_KEY, prev)
            }
        }, 5000)
    }

    async function onAvatarDrop(e: DragEvent) {
        try {
            const file = e.dataTransfer?.files?.[0];
            if (!file) {
                // Support: Bild-URL aus Drag (z. B. aus Browser), dann versuchen zu laden
                const uri = e.dataTransfer?.getData('text/uri-list') || e.dataTransfer?.getData('text/plain');
                if (uri) {
                    const res = await fetch(uri);
                    const blob = await res.blob();
                    const reader = new FileReader();
                    reader.onload = async () => {
                        pendingAvatar.value = reader.result as string;
                        showSavePopup.value = true;
                    };
                    reader.readAsDataURL(blob);
                }
                return;
            }

            const maxBytes = 2 * 1024 * 1024; // wie dein Limit
            if (file.size > maxBytes) {
                validationErrors.value = [
                    `Deine Datei hat ${(file.size / (1024 * 1024)).toFixed(2)} MB.`,
                    'Maximal erlaubt: 2.00 MB.',
                    'Komprimiere das Bild oder wähle eine kleinere Datei.',
                ];
                showValidation.value = true;
                return;
            }

            const reader = new FileReader();
            reader.onload = () => {
                pendingAvatar.value = reader.result as string;
                showSavePopup.value = true;
            };
            reader.onerror = () => addToast('Konnte Bild nicht lesen.', 'delete');
            reader.readAsDataURL(file);
        } catch {
            addToast('Drop fehlgeschlagen.', 'delete');
        }
    }
    let singleClickTimer: number | null = null
    const SINGLE_CLICK_DELAY_MS = 220

    function onAvatarDblClick(_e: MouseEvent) {
        // Doppelklick → Single-Click abbrechen und Picker öffnen
        if (singleClickTimer) { clearTimeout(singleClickTimer); singleClickTimer = null }
        if (showAvatarMenu.value) { closeAvatarMenu() }
        pickAvatar()
    }

    const profileHeaderEl = ref<HTMLElement | null>(null)
    const aboutCardEl = ref<HTMLElement | null>(null)
    const goalsCardEl = ref<HTMLElement | null>(null)
    const mottoCardEl = ref<HTMLElement | null>(null)
    const weeklyGoalCardEl = ref<HTMLElement | null>(null)
    const avatarGuideActive = ref(false)
    const avatarUrl = ref<string | null>(null)
    let avatarGuideTimer: ReturnType<typeof setTimeout> | null = null

    const username = ref<string>('');
    const displayName = ref<string>('');
    const profileSteps = computed(() => {
        const hasGoals = progress.value.muscle + progress.value.weight + progress.value.nutrition > 0
        return [
            { key: 'name', label: 'Name setzen', hint: 'Gib deinem Profil eine klare Identität.', done: !!displayName.value.trim(), icon: 'A' },
            { key: 'avatar', label: 'Profilbild hinzufügen', hint: 'Ein Bild macht dein Profil sofort vollständiger.', done: !!avatarUrl.value, icon: '◉' },
            { key: 'motto', label: 'Motto speichern', hint: 'Ein Motto gibt deinem Profil Charakter.', done: !!motto.value.trim(), icon: '“' },
            { key: 'workout', label: 'Erstes Workout tracken', hint: 'Mindestens ein Workout bringt echtes Leben ins Profil.', done: weeklyWorkouts.value > 0, icon: '1' },
            { key: 'goals', label: 'Ziele aktivieren', hint: 'Starte bei Muskel, Gewicht oder Ernährung.', done: hasGoals, icon: 'Z' },
        ] as const
    })
    const completedProfileSteps = computed(() => profileSteps.value.filter(step => step.done).length)
    const profileCompletion = computed(() => {
        return Math.round((completedProfileSteps.value / profileSteps.value.length) * 100)
    });
    const profileCheckHint = computed(() => {
        const nextStep = profileSteps.value.find(step => !step.done)
        if (!nextStep) return 'Alles erledigt. Dein Profil ist komplett.'
        return `Nächster Schritt: ${nextStep.label}`
    })
    function scrollToProfileTarget(el: HTMLElement | null) {
        if (!el) return
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }

    function startAvatarGuide() {
        avatarGuideActive.value = true
        if (avatarGuideTimer) clearTimeout(avatarGuideTimer)
        avatarGuideTimer = setTimeout(() => {
            avatarGuideActive.value = false
            avatarGuideTimer = null
        }, 5000)
    }

    async function jumpToProfileStep(stepKey: string) {
        if (stepKey === 'avatar') {
            if (!avatarUrl.value) startAvatarGuide()
            scrollToProfileTarget(profileHeaderEl.value)
            return
        }

        if (stepKey === 'name') {
            scrollToProfileTarget(aboutCardEl.value)
            if (!displayName.value.trim()) {
                editingName.value = true
                await nextTick()
                document.querySelector<HTMLInputElement>('.name-input')?.focus()
            }
            return
        }

        if (stepKey === 'motto') {
            scrollToProfileTarget(mottoCardEl.value)
            if (!motto.value.trim()) {
                editingMotto.value = true
                await nextTick()
                document.querySelector<HTMLInputElement>('.motto-input')?.focus()
            }
            return
        }

        if (stepKey === 'goals') {
            scrollToProfileTarget(goalsCardEl.value)
            return
        }

        if (stepKey === 'workout') {
            void router.push('/training')
            return
        }

        scrollToProfileTarget(weeklyGoalCardEl.value)
    }

    watch(displayName, v => {
        if (!auth.user) localStorage.setItem(LS_PROFILE_DISPLAY_NAME, v)
    });
    watch(avatarUrl, v => {
        if (v) {
            avatarGuideActive.value = false
            if (avatarGuideTimer) {
                clearTimeout(avatarGuideTimer)
                avatarGuideTimer = null
            }
        }
    })

    function onViewerWheel(e: WheelEvent) {
        const delta = -e.deltaY; // up = zoom in
        const factor = Math.exp(delta * 0.0015);
        const prev = viewerScale.value;
        const next = clampScale(prev * factor);

        // Zoom zur Mausposition (einfacher Ansatz)
        const rect = (e.currentTarget as HTMLElement)?.getBoundingClientRect?.();
        if (rect) {
            const cx = e.clientX - rect.left - rect.width / 2;
            const cy = e.clientY - rect.top - rect.height / 2;
            viewerTx.value = cx - (cx - viewerTx.value) * (next / prev);
            viewerTy.value = cy - (cy - viewerTy.value) * (next / prev);
        }
        viewerScale.value = next;
    }

    const editingName = ref(false);
    const hasUsername = computed(() => !!username.value.trim())

    async function saveUsername(nextUsername: string) {
        const trimmedUsername = nextUsername.trim()
        const prevUsername = auth.user?.username ?? ''
        if (!trimmedUsername) {
            addToast('Username darf nicht leer sein.', 'delete')
            return
        }
        try {
            const data = await updateProfile({ username: trimmedUsername })
            username.value = data.username ?? trimmedUsername
            if (auth.user) auth.user.username = username.value
            addToast('Username gespeichert', 'save')
        } catch (e: any) {
            username.value = prevUsername
            addToast(e?.response?.data?.message || 'Username konnte nicht gespeichert werden.', 'delete')
            throw e
        }
    }

    function saveDisplayName() {
        if (auth.user) {
            queueProfileSave({ displayName: displayName.value || '' })
        } else {
            localStorage.setItem(LS_PROFILE_DISPLAY_NAME, displayName.value || '');
        }
        editingName.value = false;
        addToast('Name gespeichert', 'save');
    }
    function closeDeleteAvatarPopup() {
        showDeleteAvatarPopup.value = false
    }
    function onConfirmDeleteAvatar() {
        clearAvatar()               // zeigt bereits Toast
        showDeleteAvatarPopup.value = false
    }
    const avatarInput = ref<HTMLInputElement | null>(null)

    function pickAvatar() {
        avatarInput.value?.click()
    }
    import vAutoFlip from '@/directives/autoFlip'

    const avatarEl = ref<HTMLElement | null>(null)
    const avatarMenuEl = ref<HTMLElement | null>(null)
    const showAvatarMenu = ref(false)
    function uploadNewAvatar() {
        closeAvatarMenu()
        // kurz warten, damit der Click vom Menü nicht mit dem Picker kollidiert
        requestAnimationFrame(() => pickAvatar())
    }
    let avatarPressTimer: number | null = null
    const isAvatarHolding = ref(false)
    let avatarHoldStart = 0
    let avatarPressPos: { x: number; y: number } | null = null
    const showAvatarViewer = ref(false)

    function onViewerPointerDown(e: PointerEvent) {
        (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
        viewerPanning.value = true;
        viewerLast = { x: e.clientX, y: e.clientY };
        document.body.style.cursor = 'grabbing';
    }
    function onViewerPointerMove(e: PointerEvent) {
        if (!viewerPanning.value) return;
        const dx = e.clientX - viewerLast.x;
        const dy = e.clientY - viewerLast.y;
        viewerTx.value += dx;
        viewerTy.value += dy;
        viewerLast = { x: e.clientX, y: e.clientY };
    }
    function onCloseClick() {
        if (showShortcuts.value) showShortcuts.value = false; // Shortcuts zu
        closeAvatarViewer();                                   // Viewer zu
    }

    function onViewerPointerUp(_e: PointerEvent) {
        viewerPanning.value = false;
        document.body.style.cursor = '';
    }
    function openAvatarViewer() {
        closeAvatarMenu();
        if (!avatarUrl.value) { pickAvatar(); return; }
        resetViewerTransform();
        prevFocusEl = document.activeElement;
        showAvatarViewer.value = true;
        nextTick(() => {
            (document.querySelector('.image-viewer-overlay') as HTMLElement | null)?.focus?.();
        });
    }

    function closeAvatarViewer() {
        showAvatarViewer.value = false;
        // Fokus an vorheriges Element zurück
        (prevFocusEl as HTMLElement | null)?.focus?.();
        prevFocusEl = null;
    }
    function openAvatarMenuAt(_ev?: PointerEvent | MouseEvent) {
        showAvatarMenu.value = true
        suppressNextClick.value = true

        nextTick(() => {
            ; (avatarMenuEl.value as any)?.__autoFlip?.update?.()
        })
    }

    function closeAvatarMenu() { showAvatarMenu.value = false }

    function onAvatarPointerDown(ev: PointerEvent) {
        if (showAvatarMenu.value) return
        isAvatarHolding.value = true
        avatarHoldStart = Date.now()
        avatarPressPos = { x: ev.clientX, y: ev.clientY } // Startpunkt merken
            ; (ev.currentTarget as HTMLElement).setPointerCapture?.(ev.pointerId)
        clearAvatarHold()
        avatarPressTimer = window.setTimeout(() => openAvatarMenuAt(ev), 550) as unknown as number
    }
    function onAvatarPointerMove(ev: PointerEvent) {
        if (!isAvatarHolding.value || !avatarPressPos) return
        const dx = ev.clientX - avatarPressPos.x
        const dy = ev.clientY - avatarPressPos.y
        if ((dx * dx + dy * dy) > 36) { // >6px Bewegung → Long-Press abbrechen
            cancelAvatarPress()
        }
    }
    function onAvatarPointerUp(_ev: PointerEvent) { cancelAvatarPress() }
    function cancelAvatarPress() {
        clearAvatarHold()
        isAvatarHolding.value = false
        avatarPressPos = null
    }
    function clearAvatarHold() {
        if (avatarPressTimer) { clearTimeout(avatarPressTimer); avatarPressTimer = null }
    }

    async function copyAvatar() {
        try {
            if (!avatarUrl.value) return;

            // 1) Blob erzeugen (data: → direkt; http(s): via fetch; blob: → via fetch)
            const blob = await urlToBlob(avatarUrl.value);
            const mime = blob.type || 'image/png';

            // 2) Wenn Clipboard-Image nicht unterstützt → sauberer Download-Fallback
            if (!canClipboardImages.value) {
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = 'avatar.png';
                document.body.appendChild(a);
                a.click();
                URL.revokeObjectURL(a.href);
                a.remove();
                addToast('Bild gespeichert (Kopieren nicht unterstützt)', 'save');
                closeAvatarMenu();
                return;
            }

            // 3) Primär: Als Bild + (optional) HTML & Plain-Text schreiben
            //    Manche Browser mögen mehrere Typen, manche nur einen → Erst Multi, dann degrade.
            const htmlUrl = URL.createObjectURL(blob);
            const multiItem: any = new (window as any).ClipboardItem({
                [mime]: blob,
                'text/html': new Blob([`<img src="${htmlUrl}" alt="avatar">`], { type: 'text/html' }),
                'text/plain': new Blob(['avatar.png'], { type: 'text/plain' }),
            });

            try {
                await (navigator.clipboard as any).write([multiItem]);
            } catch {
                // Degrade: Nur Image
                const imgOnly: any = new (window as any).ClipboardItem({ [mime]: blob });
                await (navigator.clipboard as any).write([imgOnly]);
            } finally {
                URL.revokeObjectURL(htmlUrl);
            }

            addToast('Bild in Zwischenablage ✅', 'save');
            closeAvatarMenu();
        } catch (err) {
            // Häufige Ursachen: fehlende User-Geste, unsichere Origin, CORS, iOS/Safari
            addToast('Konnte Bild nicht kopieren.', 'delete');
            console.error('copyAvatar error:', err);
        }
    }

    function openAvatarFull() {
        if (!avatarUrl.value) return
        openAvatarViewer()
    }

    function removeAvatar() {
        clearAvatar()
        closeAvatarMenu()
    }
    let prevFocusEl: Element | null = null;

    // Click-Away: außerhalb schließen
    // Click-Away + Esc: außerhalb schließen
    function getAvatarMenuNode(): HTMLElement | null {
        const r: any = avatarMenuEl.value
        const el = r?.$el ?? r
        return el instanceof HTMLElement ? el : null
    }

    function onOutsidePointer(e: PointerEvent) {
        const m = getAvatarMenuNode()
        const a = avatarEl.value
        const t = e.target as Node

        if (m && m.contains(t)) return
        if (a && a.contains(t)) return

        closeAvatarMenu()
    }

    function onAvatarMenuKeydown(e: KeyboardEvent) {
        if (e.key !== 'Escape') return
        e.preventDefault()
        e.stopPropagation()
        closeAvatarMenu()
    }

    watch(showAvatarMenu, (open) => {
        if (open) {
            window.addEventListener('pointerdown', onOutsidePointer, true)
            window.addEventListener('keydown', onAvatarMenuKeydown, true)
        } else {
            window.removeEventListener('pointerdown', onOutsidePointer, true)
            window.removeEventListener('keydown', onAvatarMenuKeydown, true)
        }
    })


    function onAvatarSelected(e: Event) {
        const input = e.target as HTMLInputElement
        const file = input.files?.[0]
        if (!file) return

        const maxBytes = 2 * 1024 * 1024 // 2MB Limit
        if (file.size > maxBytes) {
            validationErrors.value = [
                `Deine Datei hat ${(file.size / (1024 * 1024)).toFixed(2)} MB.`,
                'Maximal erlaubt: 2.00 MB.',
                'Komprimiere das Bild oder wähle eine kleinere Datei.'
            ]
            showValidation.value = true
            input.value = ''
            return
        }

        const reader = new FileReader()
        reader.onload = () => {
            const dataUrl = reader.result as string
            pendingAvatar.value = dataUrl
            showSavePopup.value = true
            input.value = ''
        }
        reader.onerror = () => addToast('Konnte Bild nicht lesen.', 'delete')
        reader.readAsDataURL(file)
    }
    const showSavePopup = ref(false)
    const pendingAvatar = ref<string | null>(null)

    function onCancelSaveAvatar() {
        pendingAvatar.value = null
        showSavePopup.value = false
        addToast('Abgebrochen', 'default')
    }

    async function onConfirmSaveAvatar() {
        try {
            if (pendingAvatar.value) {
                const normalized = await normalizeAvatar(pendingAvatar.value, 512);
                avatarUrl.value = normalized;
                if (auth.user) {
                    queueProfileSave({ avatarDataUrl: normalized })
                } else {
                    localStorage.setItem(AVATAR_KEY, normalized);
                }
                addToast('Profilbild gespeichert ✅', 'save');
            }
        } catch {
            addToast('Bild konnte nicht verarbeitet werden.', 'delete');
        } finally {
            pendingAvatar.value = null;
            showSavePopup.value = false;
        }
    }
    function loadImage(src: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

    async function normalizeAvatar(dataUrl: string, target = 512): Promise<string> {
        const img = await loadImage(dataUrl);

        // Quadratischer Crop (zentriert)
        const size = Math.min(img.naturalWidth, img.naturalHeight);
        const sx = (img.naturalWidth - size) / 2;
        const sy = (img.naturalHeight - size) / 2;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        canvas.width = target;
        canvas.height = target;

        // Draw
        ctx.clearRect(0, 0, target, target);
        ctx.drawImage(img, sx, sy, size, size, 0, 0, target, target);

        return canvas.toDataURL('image/png', 0.92);
    }
    function clearAvatar() {
        avatarUrl.value = null
        if (auth.user) {
            queueProfileSave({ avatarDataUrl: '' })
        } else {
            localStorage.removeItem(AVATAR_KEY)
        }
        addToast('Profilbild entfernt', 'delete')
    }
    // --- State init (mit Fallbacks) ---
    const activity = ref<number[]>([...DEFAULT_ACTIVITY])

    const isGuid = (v: string) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v)

    const ACTIVITY_DAYS = 21

    const loadActivityFromBackend = async () => {
        if (!auth.user) return

        try {
            await trainingPlansStore.loadList()
        } catch {
            return
        }

        const planIds = trainingPlansStore.items
            .map((p: { id: string }) => p.id)
            .filter((id: string) => isGuid(id))

        if (!planIds.length) {
            activity.value = Array(ACTIVITY_DAYS).fill(0)
            return
        }

        await Promise.all(planIds.map((id: string) => progressStore.load(id, true)))

        const counts = new Map<string, number>()
        planIds.forEach((id: string) => {
            const items = progressStore.byPlan?.[id]?.items ?? []
            items.forEach(it => {
                const day = String(it.date ?? '').slice(0, 10)
                if (!day) return
                counts.set(day, (counts.get(day) ?? 0) + 1)
            })
        })

        const today = new Date()
        const DAY_MS = 86400000
        const days: number[] = []
        for (let i = ACTIVITY_DAYS - 1; i >= 0; i--) {
            const d = new Date(today.getTime() - i * DAY_MS)
            const key = d.toISOString().slice(0, 10)
            days.push(counts.get(key) ?? 0)
        }

        activity.value = days
        autoGoalsReady.value = true
    }

    onMounted(async () => {
        if (auth.user) {
            await loadProfileFromBackend()
            await loadActivityFromBackend()
        } else {
            loadLocalProfile()
        }
    })

    const earnedBadges = ref<string[]>([])

    type Progress = Record<GoalKey, number>
    const progress = ref<Progress>({ ...DEFAULT_PROGRESS })

    // Profile.vue – INSERT: AutoGoals-Status + Watch
    const autoGoalPrevious = ref<AutoGoalResult>({
        muscle: progress.value.muscle,
        weightTracking: progress.value.weight,
        nutrition: progress.value.nutrition
    })
    const autoGoalsReady = ref(false)

    // jedes Mal, wenn sich deine Aktivität ändert → AutoGoals neu berechnen
    watch(
        () => activity.value.slice(),
        (days) => {
            if (!autoGoalsReady.value) return
            if (auth.user) return
            const trainings = buildTrainingsFromActivity(days)

            const result = calculateGoals({
                trainings,
                weights: [],        // TODO: später mit echten Weight-Logs füllen
                nutrition: [],      // TODO: später mit echten Ernährungs-Logs füllen
                weeklyGoal: targetWorkoutsPerWeek.value,
                previous: autoGoalPrevious.value
            })

            autoGoalPrevious.value = result
            progress.value.muscle = result.muscle
            progress.value.weight = result.weightTracking
            progress.value.nutrition = result.nutrition
        },
        { immediate: true }
    )

    const favoriteTimers = ref<number>(2)
    const motto = ref<string>(DEFAULT_MOTTO)
    const memberSince = ref<string>('')
    const memberSinceDisplay = computed(() => {
        if (!memberSince.value) return '—'
        const d = new Date(memberSince.value)
        return Number.isNaN(d.getTime()) ? memberSince.value : d.toLocaleDateString('de-DE')
    })
    // --- Derivates aus Activity ---
    const weeklyWorkouts = computed(() => sumLastDays(activity.value, 7))
    const streakDays = computed(() => calcStreak(activity.value))
    const todayCount = computed(() => activity.value.at(-1) ?? 0)
    const avgActivity = computed(() => (sumLastDays(activity.value, activity.value.length) / Math.max(activity.value.length, 1)).toFixed(1))

    // Sparkline Points
    const sparkPoints = computed(() => {
        const len = activity.value.length;
        if (len === 0) return '';
        const max = Math.max(...activity.value, 1);
        if (len === 1) {
            const y = 32 - (activity.value[0] / max) * 32;
            return `0,${y}`;
        }
        const stepX = 100 / (len - 1);
        return activity.value.map((v, i) => `${i * stepX},${32 - (v / max) * 32}`).join(' ');
    });

    const computedBadges = computed(() => computeBadges(activity.value))

    // --- UI: Motto Edit ---
    const editingMotto = ref(false)
    function toggleMotto() {
        if (editingMotto.value) saveMotto()
        editingMotto.value = !editingMotto.value
    }
    function saveMotto() {
        if (auth.user) {
            queueProfileSave({ motto: motto.value || '' })
        } else {
            localStorage.setItem(LS_KEYS.motto, motto.value || '')
        }
        addToast('Motto gespeichert', 'save')
    }
    async function applyRandomMotto() {
        try {
            const { text } = await getRandomMotto()
            motto.value = text || DEFAULT_MOTTO
            if (auth.user) {
                queueProfileSave({ motto: motto.value })
            } else {
                localStorage.setItem(LS_KEYS.motto, motto.value || '')
            }
            addToast('Motto gesetzt', 'save')
        } catch {
            addToast('Konnte kein Motto laden.', 'delete')
        }
    }
    const toastPosition = ref<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>('bottom-right');

    function onToastDismiss() {
        // Child hat entschieden zu schließen (auch nach Pause/Resume korrekt)
        toast.value = null
        if (timeoutHandle) { clearTimeout(timeoutHandle); timeoutHandle = null }
    }

    // --- Goal Controls (ohne Backend) ---
    function nudgeProgress(key: 'muscle' | 'weight' | 'nutrition', by = 5) {
        progress.value[key] = Math.min(100, Math.max(0, progress.value[key] + by))
    }
    async function resetProgress() {
        const reset = { muscle: 40, weight: 60, nutrition: 55 }
        progress.value = { ...reset }
        if (auth.user && profileLoaded.value) {
            try {
                await updateProfile({ progress: reset })
            } catch {
                addToast('Reset konnte nicht gespeichert werden.', 'delete')
            }
        }
    }

    // --- E-Mail / Passwort / Delete (Frontend-only) ---
    const showUsernamePopup = ref(false)
    const showEmailPopup = ref(false)
    const emailForm = ref({ newEmail: '', password: '' })
    const emailError = ref('')

    function openUsernamePopup() { showUsernamePopup.value = true }
    function closeUsernamePopup() { showUsernamePopup.value = false }

    async function handleUsernameChange({ username: nextUsername }: { username: string }) {
        try {
            await saveUsername(nextUsername)
            closeUsernamePopup()
        } catch {
            // Toast wird bereits in saveUsername gezeigt.
        }
    }

    function openEmailPopup() { showEmailPopup.value = true }
    function closeEmailPopup() { showEmailPopup.value = false }

    async function handleEmailChange({ newEmail, password }: { newEmail: string; password: string }) {
        try {
            await auth.changeEmail(newEmail, password)
            addToast('E-Mail aktualisiert ✅', 'save')
            closeEmailPopup()
        } catch (e: any) {
            emailError.value = e?.response?.data?.message || 'E-Mail ändern fehlgeschlagen.'
        }
    }

    async function handleAccountDelete({ password }: { password: string }) {
        try {
            // Server löschen
            await auth.deleteAccount(password)

            // lokale Daten wipen (wie bisher)
            wipeLocalStorage(LS_ALL_KEYS)

            addToast('Konto gelöscht. Bye 👋', 'delete')
            router.push({ name: 'home' })
        } catch (e: any) {
            deleteError.value = e?.response?.data?.message || 'Löschen fehlgeschlagen.'
        }
    }
    async function submitEmail() {
        emailError.value = ''
        const { newEmail, password } = emailForm.value
        const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)
        if (!valid) { emailError.value = 'Bitte eine gültige E-Mail eingeben.'; return }
        if (!password) { emailError.value = 'Passwort erforderlich (nur Bestätigung, kein Server-Check).'; return }

        // Update lokaler Auth-Store + localStorage (kein Backend)
        if (auth.user) auth.user.email = newEmail
        localStorage.setItem(LS_KEYS.email, newEmail)
        addToast('E-Mail lokal aktualisiert', 'save')
        closeEmailPopup()
    }

    const showPasswordPopup = ref(false)
    const pwdForm = ref({ current: '', next: '', repeat: '' })
    const pwdError = ref('')

    function openPasswordPopup() {
        showPasswordPopup.value = true
    }
    function closePasswordPopup() {
        showPasswordPopup.value = false
    }

    async function handlePasswordChange({ current, next }: { current: string; next: string; repeat: string }) {
        try {
            await auth.changePassword(current, next)
            addToast('Passwort erfolgreich geändert ✅', 'save')
            closePasswordPopup()
        } catch (e: any) {
            const msg =
                e?.response?.data?.errors?.join?.('\n') ||    // Identity-Fehlerliste
                e?.response?.data?.message ||                // sonstige Meldung
                'Fehler beim Ändern.'
            addToast(msg, 'delete')
        }
    }

    async function submitPassword() {
        pwdError.value = '';
        const { current, next, repeat } = pwdForm.value;

        if (!current || !next || !repeat) {
            pwdError.value = 'Bitte alle Felder ausfüllen.';
            return;
        }
        if (next.length < 8) {
            pwdError.value = 'Neues Passwort muss mindestens 8 Zeichen haben.';
            return;
        }
        if (next !== repeat) {
            pwdError.value = 'Passwörter stimmen nicht überein.';
            return;
        }

        try {
            await auth.changePassword(current, next);
            addToast('Passwort erfolgreich geändert ✅', 'save');
            closePasswordPopup();
        } catch (e: any) {
            pwdError.value = e?.response?.data?.message || 'Fehler beim Ändern.';
        }
    }


    const showDeletePopup = ref(false)
    const deleteConfirmPhrase = 'KONTO LÖSCHEN'
    const deleteConfirmInput = ref('')
    const deleteError = ref('')

    function openDeletePopup() {
        deleteConfirmInput.value = ''
        deleteError.value = ''
        showDeletePopup.value = true
    }
    function closeDeletePopup() { showDeletePopup.value = false }

    async function confirmDelete() {
        if (deleteConfirmInput.value !== deleteConfirmPhrase) {
            deleteError.value = `Bitte exakt „${deleteConfirmPhrase}“ eingeben.`
            return
        }
        // lokale Daten löschen
        wipeLocalStorage(LS_ALL_KEYS)
        addToast('Lokale Profildaten gelöscht', 'delete')
        await auth.signOut()
        router.push({ name: 'home' })
    }

    // --- Logout ---
    async function logout() {
        await auth.signOut()
        router.push({ name: 'home' })
    }

    const fullEmail = computed(() => auth.user?.email || localStorage.getItem(LS_KEYS.email) || '');

    const shortEmail = computed(() => {
        const email = fullEmail.value;
        if (!email) return '—';

        const atIndex = email.indexOf('@');
        if (atIndex === -1) {
            // Fallback, wenn es keine echte Mail ist → wie vorher
            return email.length <= 3 ? email : email.slice(0, 3) + '…';
        }

        const local = email.slice(0, atIndex);
        const rest = email.slice(atIndex + 1);

        const lastDot = rest.lastIndexOf('.');
        if (lastDot === -1) {
            // keine TLD gefunden → nur local kürzen + Rest lassen
            const shortLocal = local.length <= 3 ? local : local.slice(0, 3) + '…';
            return `${shortLocal}@${rest}`;
        }

        const domainName = rest.slice(0, lastDot);   // zwischen @ und letztem Punkt
        const tld = rest.slice(lastDot);             // inkl. Punkt, z.B. ".com"

        const shortLocal = local.length <= 3 ? local : local.slice(0, 3) + '…';
        const shortDomain = domainName.length <= 3 ? domainName : domainName.slice(0, 3) + '…';

        return `${shortLocal}@${shortDomain}${tld}`;
    });
    // --- Identity / Initials ---

    // --- Identity / Initials ---
    const initials = computed(() => {
        const email = auth.user?.email || localStorage.getItem(LS_KEYS.email) || ''
        const name = email.split('@')[0] || ''
        if (!name) return ''
        const parts = name.replace(/[._-]+/g, ' ').split(' ')
        const chars = parts.slice(0, 2).map(p => p.charAt(0).toUpperCase())
        return chars.join('') || name.charAt(0).toUpperCase()
    })

    // --- Persist watch ---
    watch(activity, v => {
        if (!profileLoaded.value) return
        if (auth.user) queueProfileSave({ activity: v })
        else saveJSON(LS_KEYS.activity, v)
    }, { deep: true })

    watch(progress, v => {
        if (!profileLoaded.value) return
        if (auth.user) queueProfileSave({ progress: v })
        else saveJSON(LS_KEYS.progress, v)
    }, { deep: true })

    watch(goalOrder, v => {
        if (!profileLoaded.value) return
        if (auth.user) queueProfileSave({ goalOrder: v })
        else saveJSON(LS_PROFILE_GOAL_ORDER, v)
    }, { deep: true })

    watch(favoriteTimers, v => {
        if (!profileLoaded.value) return
        if (auth.user) queueProfileSave({ favoriteTimers: v })
        else localStorage.setItem(LS_KEYS.favorites, String(v))
    })

    watch(earnedBadges, v => {
        if (!profileLoaded.value) return
        if (auth.user) queueProfileSave({ earnedBadges: v })
        else saveJSON(LS_KEYS.earnedBadges, v)
    }, { deep: true })


    // --- Toasts ---
    const toast = ref<ToastModel | null>(null)
    let toastId = 0
    let timeoutHandle: ReturnType<typeof setTimeout> | null = null // bleibt für Abwärtskompatibilität ungenutzt

    function addToast(
        message: string,
        kind: 'add' | 'delete' | 'save' | 'default' = 'default',
        durationMs = 2800,
        action?: { label: string; handler: () => void }
    ) {
        if (timeoutHandle) { clearTimeout(timeoutHandle); timeoutHandle = null }
        const emojis = { add: '✅', delete: '🗑️', save: '💾', default: '📋' } as const
        const classes = { add: 'toast-add', delete: 'toast-delete', save: 'toast-save', default: 'toast-default' } as const
        toast.value = {
            id: toastId++,
            message,
            emoji: emojis[kind],
            type: classes[kind],
            exiting: false,
            durationMs,
            action // <-- Button + Handler für Toast.vue
        } as any
    }

    // --- Helpers ---
    function sumLastDays(arr: number[], days: number) {
        const slice = arr.slice(-days)
        return slice.reduce((a, b) => a + b, 0)
    }
    function calcStreak(arr: number[]) {
        let s = 0
        for (let i = arr.length - 1; i >= 0; i--) {
            if ((arr[i] ?? 0) > 0) s++
            else break
        }
        return s
    }
    function buildTrainingsFromActivity(days: number[]): TrainingEntry[] {
        const result: TrainingEntry[] = []
        const today = Date.now()
        const DAY_MS = 86400000

        // days[-1] = heute, days[-2] = gestern usw.
        for (let i = 0; i < days.length; i++) {
            const count = days[days.length - 1 - i] ?? 0
            if (!count) continue

            const iso = new Date(today - i * DAY_MS).toISOString()
            for (let j = 0; j < count; j++) {
                result.push({ date: iso, type: 'mixed' })
            }
        }

        return result
    }
</script>

<style scoped>
    .profile {
        max-width: 1100px;
        margin: 60px auto 2rem;
        padding: 0 1rem;
    }

    /* Header */
    .profile-header {
        display: flex;
        align-items: center;
        gap: 1.25rem;
        margin-bottom: 2rem;
    }

    .meta {
        flex: 1 1 auto;
        min-width: 0;
    }

    .avatar.ring {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: var(--bg-card);
        border: 2px solid var(--border-color);
        display: grid;
        place-items: center;
        font-weight: 800;
        font-size: 1.35rem;
        color: var(--accent-primary);
        box-shadow: 0 4px 12px rgba(0,0,0,.15);
        overflow: hidden; /* Bild bleibt im Kreis */
    }

    .achievement-icon-img {
        width: 40px;
        height: 40px;
        object-fit: contain;
        display: block;
        border-radius: 10px;
        box-shadow: 0 3px 8px rgba(15, 23, 42, 0.55);
    }

    .title {
        font-size: 1.7rem;
        margin: 0 0 .2rem;
        background: linear-gradient(90deg, #60a5fa, #34d399, #f59e0b);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
    }

    .muted {
        color: var(--text-secondary)
    }

    .actions {
        margin-top: .7rem;
        display: flex;
        flex-wrap: wrap;
        gap: .5rem;
    }

    /* Buttons */
    .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: .55rem;
        border: 0;
        padding: .55rem .9rem;
        border-radius: 10px;
        cursor: pointer;
        font-weight: 600;
        transition: transform .08s ease, box-shadow .2s;
    }

        .btn:hover {
            transform: translateY(-1px)
        }

        .btn.neutral {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            color: var(--text-primary);
            box-shadow: 0 4px 12px rgba(0,0,0,.08);
        }

        .btn.danger-outline {
            background: transparent;
            border: 1px solid rgba(220,38,38,.6);
            color: rgba(220,38,38,.9);
        }

        .btn i {
            flex: 0 0 auto;
        }


    /* Grids */
    /* Grids */
    .grid {
        display: grid;
        gap: 1rem;
        margin: 1rem 0;
    }

        .grid.two {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .grid.three {
            grid-template-columns: repeat(3, minmax(0, 1fr));
        }

            /* Quick-Stats:
       - nutzen auto-fit + minmax → bleiben 3 nebeneinander,
         bis die Cards real nicht mehr hinpassen
       - danach automatisch 2 oder 1 Spalte */
            .grid.three.quick-stats {
                grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
                gap: 1rem;
            }

    /* Unter ~720px alles einspaltig + Header umbrechen */
    @media (max-width: 720px) {
        .grid.two,
        .grid.three {
            grid-template-columns: 1fr;
        }

        .profile-header {
            flex-direction: column;
            align-items: flex-start;
        }

        .meta {
            width: 100%;
        }

        /* Wenn Quick-Stats untereinander stehen → mehr vertical spacing */
        .grid.three.quick-stats {
            row-gap: 1.2rem;
        }
    }

    /* Unter ~720px alles einspaltig + Header umbrechen */
    @media (max-width: 720px) {
        .grid.two,
        .grid.three {
            grid-template-columns: 1fr;
        }

        .profile-header {
            flex-direction: column;
            align-items: flex-start;
        }
    }

    @media (max-width: 640px) {
        .actions {
            display: grid;
            grid-template-columns: 1fr;
            gap: .65rem;
        }

        .actions .btn {
            width: 100%;
            justify-content: flex-start;
            min-height: 50px;
            padding: .85rem .95rem;
            border-radius: 14px;
            position: relative;
            box-shadow: 0 12px 24px rgba(15, 23, 42, 0.10);
        }

        .actions .btn::after {
            content: '›';
            margin-left: auto;
            font-size: 1.05rem;
            line-height: 1;
            opacity: .7;
        }

        .actions .btn i {
            width: 1.1rem;
            text-align: center;
        }

        .profile-check-head {
            flex-direction: column;
            align-items: flex-start;
        }

        .profile-check-percent {
            font-size: 1.05rem;
        }
    }

    @media (max-width: 420px) {
        .profile {
            padding: 0 .8rem;
        }

        .actions .btn {
            font-size: .96rem;
        }
    }

    .profile-footer-actions {
        margin: 1.15rem 0 0;
        padding-top: .95rem;
        border-top: 1px solid color-mix(in srgb, var(--border-color) 70%, transparent);
        display: flex;
        justify-content: flex-end;
    }

    .logout-footer-btn {
        justify-content: center;
        gap: .65rem;
        padding: .8rem 1rem;
        border-radius: 14px;
        background: linear-gradient(135deg, color-mix(in srgb, #0f172a 82%, var(--bg-secondary) 18%), color-mix(in srgb, #334155 76%, var(--bg-secondary) 24%));
        border: 1px solid color-mix(in srgb, #64748b 62%, transparent);
        color: #f8fafc;
        box-shadow: 0 10px 24px rgba(15, 23, 42, 0.18);
        text-align: center;
    }

    .logout-footer-btn i {
        font-size: 1rem;
    }

    @media (max-width: 640px) {
        .profile-footer-actions {
            margin-top: .95rem;
            padding-top: .8rem;
        }

        .logout-footer-btn {
            width: 100%;
            min-height: 48px;
            justify-content: center;
        }
    }

    .card {
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        align-items: stretch; /* Inhalte nutzen volle Breite */
        padding: 1.4rem 1.5rem;
        border-radius: 18px;
        text-align: left; /* Standard: sauber links für Text / Listen */
        background: radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 9%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 7%, transparent), transparent 60%), color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
        border: 1px solid rgba(148, 163, 184, 0.26);
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.22);
        transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease, background 0.22s ease;
    }

    .card--soft-center {
        align-items: center; /* Inhalt in der Card horizontal zur Mitte ziehen */
        text-align: center; /* Texte in diesen Cards mittiger, aber nur da */
    }

    .profile-check-card {
        gap: .9rem;
        text-align: left;
    }

    .profile-check-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: .75rem;
    }

    .profile-check-title {
        margin: 0;
    }

    .profile-check-percent {
        white-space: nowrap;
        font-size: 1rem;
        font-weight: 700;
        color: var(--text-primary);
    }

    .profile-check-sub {
        margin: 0;
        color: var(--text-secondary);
        line-height: 1.5;
    }

    .profile-check-progress-bar {
        width: 100%;
        height: 10px;
        border-radius: 999px;
        overflow: hidden;
        background: color-mix(in srgb, var(--bg-secondary) 92%, transparent);
        border: 1px solid color-mix(in srgb, var(--border-color) 80%, transparent);
        box-shadow: inset 0 1px 2px rgba(15, 23, 42, .12);
    }

    .profile-check-progress-fill {
        height: 100%;
        min-width: 10px;
        border-radius: inherit;
        background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
    }

    .profile-check-steps {
        display: grid;
        grid-template-columns: 1fr;
        gap: .55rem;
    }

    .profile-check-step {
        appearance: none;
        width: 100%;
        display: flex;
        align-items: center;
        gap: .65rem;
        padding: .72rem .8rem;
        border-radius: 14px;
        background: color-mix(in srgb, var(--bg-secondary) 88%, transparent);
        border: 1px solid color-mix(in srgb, var(--border-color) 78%, transparent);
        text-align: left;
        cursor: pointer;
        transition: border-color .2s ease, transform .2s ease, background .2s ease;
    }

    .profile-check-step:hover {
        transform: translateY(-1px);
        border-color: color-mix(in srgb, var(--accent-primary) 26%, var(--border-color) 74%);
    }

    .profile-check-step:focus-visible {
        outline: none;
        border-color: color-mix(in srgb, var(--accent-primary) 40%, var(--border-color) 60%);
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-primary) 16%, transparent);
    }

    .profile-check-step.done {
        border-color: color-mix(in srgb, #22c55e 22%, var(--border-color) 78%);
    }

    .profile-check-step-icon {
        width: 28px;
        height: 28px;
        flex: 0 0 28px;
        display: grid;
        place-items: center;
        border-radius: 999px;
        font-size: .82rem;
        font-weight: 800;
        color: var(--text-secondary);
        background: color-mix(in srgb, var(--bg-card) 86%, transparent);
        border: 1px solid color-mix(in srgb, var(--border-color) 72%, transparent);
    }

    .profile-check-step.done .profile-check-step-icon {
        color: #166534;
        background: color-mix(in srgb, #22c55e 18%, white 82%);
        border-color: rgba(34, 197, 94, 0.22);
    }

    .profile-check-step-copy {
        display: grid;
        gap: .14rem;
        min-width: 0;
    }

    .profile-check-step-copy strong {
        color: var(--text-primary);
        font-size: .93rem;
        line-height: 1.25;
    }

    .profile-check-step-copy span {
        color: var(--text-secondary);
        font-size: .83rem;
        line-height: 1.4;
    }

    html.dark-mode .card {
        background: radial-gradient(circle at top left, color-mix(in srgb, #6366f1 14%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, #22c55e 10%, transparent), transparent 60%), #020617;
        border-color: rgba(148, 163, 184, 0.45);
        box-shadow: 0 22px 55px rgba(0, 0, 0, 0.7);
    }

    html.dark-mode .achievement-popup {
        background: radial-gradient( circle at top left, color-mix(in srgb, #6366f1 14%, transparent), transparent 55% ), radial-gradient( circle at bottom right, color-mix(in srgb, #22c55e 10%, transparent), transparent 60% ), #020617;
        border-color: rgba(148, 163, 184, 0.45);
        box-shadow: 0 22px 55px rgba(0, 0, 0, 0.7);
    }


    @media (hover: hover) {
        .card:hover {
            transform: translateY(-3px) scale(1.01);
            box-shadow: 0 22px 50px rgba(15, 23, 42, 0.32);
            border-color: rgba(129, 140, 248, 0.55);
        }
    }


    .card-title {
        margin: 0 0 .6rem;
        font-size: 1.05rem;
        display: flex;
        align-items: center;
        gap: .5rem;
    }

    .image-viewer-stage {
        max-width: 90vw;
        max-height: 90vh;
        overflow: hidden;
        display: grid;
        place-items: center;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,.5);
        cursor: grab;
        background: rgba(0,0,0,.2);
    }

    .image-viewer-img {
        will-change: transform;
        user-select: none;
        pointer-events: none;
        transform-origin: center center;
    }
    /* Stats */

    .card.stat {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start; /* nicht mehr space-between */
        gap: .8rem; /* Abstand zwischen Icon und Text */
        padding: 0.9rem 1.2rem;
        border-radius: 16px;
    }

        .card.stat > .stat-icon {
            flex-shrink: 0;
        }

        .card.stat > div:last-child {
            display: flex;
            flex-direction: column;
            align-items: flex-start; /* Text linksbündig */
            gap: .15rem;
        }


    .stat-icon {
        width: 40px;
        height: 40px;
        display: grid;
        place-items: center;
        border-radius: 999px;
        background: radial-gradient(circle at 20% 0%, color-mix(in srgb, var(--accent-primary) 35%, transparent), transparent 55%), color-mix(in srgb, #020617 90%, var(--bg-card) 10%);
        color: var(--accent-primary);
        border: 1px solid rgba(148, 163, 184, 0.6);
        box-shadow: 0 6px 16px rgba(15, 23, 42, 0.45);
    }

    .stat-value {
        font-size: 1.45rem;
        font-weight: 800;
        line-height: 1;
    }

    .stat-label {
        color: var(--text-secondary);
        font-size: .9rem;
        white-space: nowrap;
    }

    /* auch für Profil-Check und Wochenziel */
    .goal {
        width: 100%;
        margin-bottom: 1.1rem; /* Abstand zwischen den einzelnen Ziel-Items */
    }


    .goal-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: .5rem;
        margin-bottom: .4rem;
        font-size: .95rem;
    }

    .goal-value {
        font-weight: 700;
        white-space: nowrap;
    }

    .bar {
        width: 100%;
        height: 10px;
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: 999px;
        overflow: hidden;
    }


        .bar > div {
            height: 100%;
            background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
        }

    .goal-controls {
        margin-top: .7rem;
        display: flex;
        flex-wrap: wrap;
        gap: .4rem
    }

    /* Sparkline */
    .sparkline-wrap {
        text-align: center
    }

    .sparkline {
        width: 100%;
        height: 60px;
        color: var(--accent-primary)
    }

    .spark-legend {
        margin-top: .3rem;
        font-size: .85rem;
        color: var(--text-secondary)
    }

    .weekly-goal-card {
        width: 100%;
        max-width: none;
        margin-inline: 0;
        overflow: hidden;
        gap: 1.2rem;
    }

    .weekly-goal-head {
        display: flex;
        justify-content: space-between;
        cursor: default;
        align-items: flex-start;
        gap: 1rem;
        margin-bottom: 0;
    }

    .weekly-goal-eyebrow {
        display: inline-flex;
        margin-bottom: .4rem;
        padding: .28rem .65rem;
        border-radius: 999px;
        font-size: .74rem;
        font-weight: 700;
        letter-spacing: .05em;
        text-transform: uppercase;
        color: color-mix(in srgb, var(--text-secondary) 92%, white 8%);
        background: color-mix(in srgb, var(--bg-secondary) 82%, transparent);
        border: 1px solid color-mix(in srgb, var(--border-color) 78%, transparent);
    }

    .weekly-goal-title {
        margin: 0;
    }

    .weekly-goal-chip {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 40px;
        padding: .55rem .95rem;
        border-radius: 14px;
        font-size: .8rem;
        font-weight: 800;
        letter-spacing: .02em;
        line-height: 1;
        white-space: nowrap;
        border: 1px solid rgba(148, 163, 184, 0.18);
        box-shadow: inset 0 1px 0 rgba(255,255,255,.05), 0 10px 24px rgba(15, 23, 42, 0.10);
        backdrop-filter: blur(8px);
    }

    .weekly-goal-chip.is-muted {
        background: linear-gradient(135deg, color-mix(in srgb, var(--bg-secondary) 92%, white 8%), color-mix(in srgb, var(--bg-card) 90%, transparent));
        color: var(--text-secondary);
        border-color: color-mix(in srgb, var(--border-color) 72%, transparent);
    }

    .weekly-goal-chip.is-steady {
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.16), rgba(245, 158, 11, 0.08));
        color: #b45309;
        border-color: rgba(245, 158, 11, 0.22);
    }

    .weekly-goal-chip.is-accent {
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.16), rgba(37, 99, 235, 0.08));
        color: #1d4ed8;
        border-color: rgba(59, 130, 246, 0.22);
    }

    .weekly-goal-chip.is-success {
        background: linear-gradient(135deg, rgba(34, 197, 94, 0.18), rgba(21, 128, 61, 0.10));
        color: #166534;
        border-color: rgba(34, 197, 94, 0.24);
    }

    html.dark-mode .weekly-goal-chip {
        border-color: rgba(148, 163, 184, 0.22);
        box-shadow: inset 0 1px 0 rgba(255,255,255,.03), 0 14px 28px rgba(0, 0, 0, 0.28);
    }

    html.dark-mode .weekly-goal-chip.is-muted {
        color: #cbd5e1;
    }

    html.dark-mode .weekly-goal-chip.is-steady {
        color: #fbbf24;
    }

    html.dark-mode .weekly-goal-chip.is-accent {
        color: #93c5fd;
    }

    html.dark-mode .weekly-goal-chip.is-success {
        color: #86efac;
    }

    .weekly-goal-inner {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr);
        align-items: center;
        gap: 1.2rem 1.4rem;
        width: 100%;
        margin: 0;
        padding-top: 1.1rem;
        border-top: 1px solid color-mix(in srgb, var(--border-color) 62%, transparent);
    }

    .weekly-goal-side {
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: .65rem;
        text-align: left;
        min-width: 0;
    }

    .weekly-goal-copy {
        width: 100%;
        display: grid;
        gap: .75rem;
    }

    .weekly-goal-stats {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: .65rem;
        width: 100%;
    }

    .weekly-goal-stat-card {
        display: grid;
        gap: .2rem;
        padding: .75rem .85rem;
        border-radius: 14px;
        background: color-mix(in srgb, var(--bg-secondary) 82%, transparent);
        border: 1px solid color-mix(in srgb, var(--border-color) 78%, transparent);
        box-shadow: inset 0 1px 0 rgba(255,255,255,.03);
    }

    .weekly-goal-card:hover .weekly-goal-stat-card {
        border-color: color-mix(in srgb, var(--accent-primary) 22%, var(--border-color) 78%);
    }

    .weekly-goal-stat-label {
        font-size: .75rem;
        font-weight: 700;
        letter-spacing: .04em;
        text-transform: uppercase;
        color: var(--text-secondary);
    }

    .weekly-goal-stat-value {
        font-size: 1.4rem;
        line-height: 1;
        color: var(--text-primary);
    }

    .motto-add-label {
        display: inline-block;
    }

    /* Unter 500px: Text ausblenden, stattdessen nur ein Plus anzeigen */
    @media (max-width: 500px) {
        .motto-add-label {
            font-size: 0; /* Text unsichtbar machen */
        }

            .motto-add-label::before {
                content: "+"; /* sichtbares Plus */
                font-size: 1.05rem; /* normale Größe */
                font-weight: 700;
                line-height: 1;
            }
    }

    .weekly-goal-line {
        font-size: 1rem;
        font-weight: 700;
        color: var(--text-primary);
    }

    .weekly-goal-progress-rail {
        width: 100%;
        height: 10px;
        border-radius: 999px;
        overflow: hidden;
        background: color-mix(in srgb, var(--bg-secondary) 92%, transparent);
        border: 1px solid color-mix(in srgb, var(--border-color) 80%, transparent);
        box-shadow: inset 0 1px 2px rgba(15, 23, 42, .12);
    }

    .weekly-goal-progress-fill {
        height: 100%;
        min-width: 10px;
        border-radius: inherit;
        background: linear-gradient(90deg, #93c5fd, #3b82f6 55%, #1d4ed8);
        box-shadow: 0 0 18px rgba(59, 130, 246, 0.2);
    }

    .weekly-goal-sub {
        margin: 0;
        color: var(--text-secondary);
        line-height: 1.45;
    }


    /* ADD: kleine Info unter dem Wochenziel */
    .weekly-goal-footer {
        margin-top: 0;
        padding-top: .9rem;
        font-size: .8rem;
        color: var(--text-secondary);
        border-top: 1px solid color-mix(in srgb, var(--border-color) 65%, transparent);
    }

    .weekly-goal-auto-hint {
        opacity: .9;
    }

    @media (max-width: 600px) {
        .weekly-goal-head {
            flex-direction: column;
            align-items: flex-start;
        }

        .weekly-goal-inner {
            grid-template-columns: 1fr;
            align-items: center;
        }

        .weekly-goal-side {
            align-items: center;
            text-align: center;
        }

        .weekly-goal-stats {
            width: 100%;
        }

        .weekly-goal-controls {
            justify-content: flex-start;
        }
    }

    /* Donut-Styles */
    .weekly-goal-visual {
        position: relative;
        display: grid;
        place-items: center;
        width: 152px;
        height: 152px;
        border-radius: 24px;
        background:
            radial-gradient(circle at 30% 25%, color-mix(in srgb, var(--accent-primary) 16%, transparent), transparent 58%),
            radial-gradient(circle at 75% 80%, color-mix(in srgb, var(--accent-secondary) 14%, transparent), transparent 62%),
            color-mix(in srgb, var(--bg-secondary) 78%, transparent);
        border: 1px solid color-mix(in srgb, var(--border-color) 74%, transparent);
        box-shadow: inset 0 1px 0 rgba(255,255,255,.04), 0 16px 34px rgba(15, 23, 42, .10);
    }

        .weekly-goal-visual::after {
            content: '';
            position: absolute;
            inset: 20px;
            border-radius: 50%;
            background: linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 96%, white 4%), color-mix(in srgb, var(--bg-card) 90%, #020617 10%));
            border: 1px solid color-mix(in srgb, var(--border-color) 65%, transparent);
            box-shadow: inset 0 1px 0 rgba(255,255,255,.06);
        }

    .donut {
        position: relative;
        z-index: 1;
        width: 128px;
        height: 128px;
        filter: drop-shadow(0 8px 18px rgba(15, 23, 42, .12));
    }

    .donut-bg {
        fill: none;
        stroke: color-mix(in srgb, var(--border-color) 58%, var(--bg-secondary) 42%);
        stroke-width: 3.2;
    }

    .donut-fg {
        fill: none;
        stroke: url(#weekly-goal-donut-gradient);
        stroke-width: 4.2;
        transform: rotate(-90deg);
        transform-origin: 50% 50%;
        filter: drop-shadow(0 0 10px rgba(59, 130, 246, 0.2));
    }

    .donut-label {
        font-weight: 900;
        font-size: .72rem;
        letter-spacing: -.02em;
        fill: color-mix(in srgb, var(--text-primary) 90%, #1e3a8a 10%);
        paint-order: stroke;
        stroke: color-mix(in srgb, var(--bg-card) 88%, transparent);
        stroke-width: .6px;
    }


    .donut-legend {
        font-size: .9rem;
        color: var(--text-secondary);
    }

    .weekly-goal-controls {
        justify-content: flex-end;
        margin-top: .7rem;
    }

    @media (max-width: 720px) {
        .weekly-goal-body {
            align-items: flex-start;
        }

        .weekly-goal-controls {
            justify-content: flex-start;
        }
    }


    .donut-legend {
        font-size: .9rem;
        color: var(--text-secondary);
    }

    .input {
        width: 100%;
        padding: .6rem .7rem;
        border-radius: 10px;
        border: 1px solid var(--border-color);
        background: var(--bg-secondary);
        color: var(--text-primary);
    }

    .form-error {
        color: rgba(220,38,38,.95);
        font-size: .9rem
    }

    .hint {
        margin-top: .4rem;
        font-size: .85rem;
        color: var(--text-secondary)
    }

    .image-viewer-overlay {
        position: fixed;
        inset: 0;
        display: grid;
        place-items: center;
        background: rgba(0,0,0,.75);
        z-index: 2000
    }

    .name-text,
    .email-text {
        cursor: pointer;
    }

    .image-viewer-img {
        max-width: 90vw;
        max-height: 90vh;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,.5)
    }

    .image-viewer-close {
        position: fixed;
        top: 12px;
        right: 12px;
        width: 36px;
        height: 36px;
        border: 0;
        border-radius: 999px;
        background: rgba(0,0,0,.6);
        color: #fff;
        font-size: 20px;
        line-height: 36px;
        cursor: pointer
    }

    .goal-top {
        align-items: center;
        gap: .5rem;
    }

    .goal-name {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .goal-handle {
        cursor: grab;
        user-select: none;
        font-weight: 800;
        line-height: 1;
        padding: 0 .4rem;
        opacity: .8;
    }

        .goal-handle:active {
            cursor: grabbing;
            opacity: 1;
        }

    .goal-ghost {
        opacity: .6;
        transform: scale(.995);
    }

    .goal-drag {
        filter: drop-shadow(0 4px 10px rgba(0,0,0,.15));
    }

    .viewer-controls {
        position: fixed;
        right: 14px;
        bottom: 14px;
        display: grid;
        gap: 8px;
        z-index: 2100; /* über Stage, unter Close-Button passt auch */
    }

    /* Viewer-Control Buttons – angepasst an dein Card/Stat-Design */
    .vc-btn {
        min-width: 38px;
        height: 38px;
        padding: 0 .65rem;
        border-radius: 12px;
        border: 1px solid rgba(148, 163, 184, 0.35);
        font-weight: 700;
        font-size: 1.05rem;
        background: radial-gradient( circle at top left, color-mix(in srgb, var(--accent-primary) 20%, transparent), transparent 55% ), color-mix(in srgb, var(--bg-card) 92%, #020617 8%);
        color: var(--text-primary);
        box-shadow: 0 10px 26px rgba(0,0,0,.25);
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: transform .12s ease, box-shadow .18s ease, filter .2s ease;
    }

        .vc-btn:hover {
            transform: translateY(-2px);
            filter: brightness(1.08);
            box-shadow: 0 14px 36px rgba(0,0,0,.38);
        }

        .vc-btn:active {
            transform: translateY(0);
            filter: brightness(0.94);
            box-shadow: 0 8px 20px rgba(0,0,0,.22);
        }

    /* Darkmode: matcht deine Cards + Stats */
    html.dark-mode .vc-btn {
        background: radial-gradient( circle at top left, color-mix(in srgb, #6366f1 22%, transparent), transparent 55% ), #0f172a;
        border-color: rgba(148,163,184,.45);
        box-shadow: 0 12px 32px rgba(0,0,0,.55);
        color: #f1f5f9;
    }


    .avatar-plus {
        position: absolute;
        right: 2px; /* sitzt sauber am Avatar-Rand */
        bottom: 2px;
        width: 30px; /* unsichtbare Klickfläche */
        height: 30px;
        border: none;
        background: transparent;
        cursor: pointer;
        z-index: 5;
        outline: none;
        transition: transform .08s ease;
        -webkit-tap-highlight-color: transparent;
    }

        .avatar-plus:focus-visible {
            outline: 2px solid rgba(96,165,250,.45);
            border-radius: 6px;
        }

        .avatar-plus::before,
        .avatar-plus::after {
            content: "";
            position: absolute;
            left: 50%;
            top: 50%;
            width: 14px; /* proportioniert zum Avatar */
            height: 3px; /* dicker = ruhiger Look */
            background: #60a5fa; /* klares Blau */
            transform: translate(-50%, -50%);
            border-radius: 3px; /* runde Enden */
            filter: drop-shadow(0 0 1px #fff) /* feine weiße Kontur */
            drop-shadow(0 1px 2px rgba(0,0,0,.35)); /* dezenter Schatten */
            will-change: transform;
        }

        .avatar-plus::after {
            transform: translate(-50%, -50%) rotate(90deg);
        }

        .avatar-plus:hover {
            transform: scale(1.06);
        }

    .avatar-wrap {
        position: relative;
        display: inline-block;
    }

    .avatar-wrap.is-guided::after {
        content: '';
        position: absolute;
        inset: -8px;
        border-radius: 50%;
        border: 2px dashed color-mix(in srgb, var(--accent-primary) 72%, white 28%);
        opacity: .95;
        pointer-events: none;
        animation: avatar-guide-orbit 2.2s linear infinite;
    }

    .avatar-wrap.is-guided::before {
        content: '';
        position: absolute;
        inset: -4px;
        border-radius: 50%;
        background: radial-gradient(circle, color-mix(in srgb, var(--accent-primary) 18%, transparent) 0%, transparent 70%);
        opacity: .8;
        pointer-events: none;
    }

    html.dark-mode .avatar-wrap.is-guided::after {
        border-color: color-mix(in srgb, #93c5fd 72%, transparent 28%);
    }

    @keyframes avatar-guide-orbit {
        from {
            transform: rotate(0deg) scale(1);
        }

        50% {
            transform: rotate(180deg) scale(1.03);
        }

        to {
            transform: rotate(360deg) scale(1);
        }
    }

    .avatar {
        -webkit-touch-callout: none;
        user-select: none;
    }

        .avatar img {
            -webkit-user-drag: none;
            user-drag: none;
            -webkit-touch-callout: none;
            user-select: none;
            pointer-events: none; /* Bild selbst fängt keine Klicks/Long-Press ab */
        }


    .avatar-plus:hover {
        transform: translateY(-1px);
    }
    /* Motto */
    .motto-row {
        display: flex;
        gap: .6rem;
        align-items: center;
        flex-wrap: nowrap;
    }

    .motto {
        flex: 1;
        font-style: italic;
        color: var(--text-secondary);
        font-size: 1rem;
        margin: 0;
        hyphens: auto;
        -webkit-hyphens: auto;
        overflow-wrap: anywhere;
        word-break: normal;
        min-width: 0; /* Fix gegen Card-Stretching */
    }

    .motto-input {
        flex: 1;
        min-width: 0; /* verhindert Breitenänderung */
        max-width: 100%; /* bleibt innerhalb der Card */
        box-sizing: border-box;
    }

    .avatar img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
        display: block;
    }

    .avatar.clickable {
        cursor: pointer;
        position: relative;
    }

        .avatar.clickable::after {
            content: ' ';
            position: absolute;
            inset: 0;
            border-radius: 50%;
            transition: background .15s ease;
        }

        .avatar.clickable:hover::after {
            background: rgba(0,0,0,.06);
        }

    .shortcuts-overlay {
        position: fixed;
        inset: 0;
        display: grid;
        place-items: center;
        z-index: 2200;
        background: rgba(0,0,0,.25);
    }

    .sc-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: .5rem;
        font-weight: 700;
    }

    .motto-card .motto-row {
        margin-top: .25rem;
        gap: .6rem;
    }

    .motto-card .motto {
        flex: 1;
        margin: 0;
        font-style: italic;
        color: var(--text-secondary);
    }

    .sc-x {
        border: 0;
        background: transparent;
        color: var(--text-primary);
        width: 28px;
        height: 28px;
        border-radius: 8px;
        cursor: pointer;
    }

    .sc-list {
        margin: 0;
        padding-left: 1.1rem;
        display: grid;
        gap: .35rem;
    }

        .sc-list kbd {
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
            font-size: .85em;
            padding: .08rem .35rem;
            border: 1px solid var(--border-color);
            border-bottom-width: 2px;
            border-radius: 6px;
            background: var(--bg-secondary);
        }

    .hidden-file-input {
        position: absolute;
        width: 0;
        height: 0;
        opacity: 0;
        pointer-events: none;
    }

    .list {
        padding: 0;
        margin: .25rem 0 0;
        list-style: none;
        display: grid;
        gap: .55rem;
    }

        .list li {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 1rem;
            min-height: 42px; /* stabiler Row-Height */
        }

    /* Name-Zeile: Label links, Wert + Stift ganz rechts */
    .about-name-row {
        justify-content: flex-start; /* nicht mehr global space-between erzwingen */
    }

    .key {
        color: var(--text-secondary);
    }

    /* Werte-Spalte darf schrumpfen & umbrechen */
    .val {
        flex: 1;
        min-width: 0;
        text-align: right;
    }

    @media (max-width: 425px) {
        /* Name-Zeile: Label + Wert dürfen umbrechen */
        .about-name-row {
            align-items: flex-start;
            flex-wrap: wrap;
        }

            /* Label kann normal links bleiben, muss nicht volle Breite erzwingen */
            .about-name-row .key {
                flex: 0 0 auto;
            }

            /* Nur im Edit-Mode: Input + Button untereinander, volle Breite, links */
            .about-name-row .name-val.is-editing {
                flex-direction: column;
                align-items: stretch;
                gap: .35rem;
                margin-left: 0;
                flex-basis: 100%;
                justify-content: flex-start;
            }

            .about-name-row .name-input {
                width: 100%;
                max-width: 100%;
            }
    }


    /* speziell für lange E-Mails: immer umbrechbar */
    .email-text {
        display: inline-block;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        cursor: pointer; /* bleibt klickbar für Popup */
    }

    .val.badge {
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        padding: .15rem .6rem;
        border-radius: 999px;
        font-weight: 600;
        /* wieder wie vorher: kompakter Pill, nicht mit .val mitwachsen */
        flex: 0 0 auto;
        min-width: auto;
        text-align: center;
        white-space: nowrap;
    }

    .name-val {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: .5rem;
        flex-wrap: nowrap;
        margin-left: auto; /* schiebt den Block ganz nach rechts */
        flex: 0 1 auto; /* nimmt nur so viel Platz wie nötig */
        text-align: right; /* Text/Buttons rechtsbündig */
    }

    .name-input {
        max-width: 240px;
        width: clamp(160px, 60%, 240px);
        white-space: nowrap;
    }

    /* Name-Text läuft sauber aus ohne Sprünge */
    .name-text {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 60%;
    }

    /* Mobile darf der Zeile notfalls umbrechen, aber sauber */
    @media (max-width: 360px) {
        .name-val {
            flex-wrap: wrap;
            justify-content: flex-end; /* Werte rechtsbündig halten */
            align-items: flex-end;
            gap: .4rem .6rem;
            text-align: right;
        }

            .name-val > * {
                text-align: right; /* Text und Button rechts ausrichten */
            }

        .name-text {
            max-width: 100%;
        }
    }

    .image-viewer-overlay {
        overscroll-behavior: contain;
    }

    .motto-card {
        overflow: hidden;
        contain: inline-size;
    }

    .motto-row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: center;
        column-gap: .6rem;
        min-width: 0;
    }

        .motto-row > * {
            min-width: 0;
        }

    .motto {
        min-width: 0;
        max-width: 100%;
        font-style: italic;
        color: var(--text-secondary);
        font-size: 1rem;
        margin: 0;
        hyphens: auto;
        -webkit-hyphens: auto;
        overflow-wrap: anywhere;
        word-break: normal;
    }

    .motto-input {
        min-width: 0;
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .motto-actions {
        display: inline-flex;
        gap: .4rem;
        align-items: center;
        justify-content: flex-end;
        white-space: nowrap;
        flex: 0 0 auto;
        min-width: 0;
    }

    .motto-random-btn {
        display: inline-flex;
        align-items: center;
        gap: .35rem;
    }

    @media (max-width: 480px) {
        .motto-random-btn {
            width: 36px;
            height: 36px;
            justify-content: center;
            padding: 0;
            border-radius: 10px;
        }

        .motto-random-label {
            display: none;
        }
    }

    .image-viewer-stage {
        touch-action: none; /* verhindert Scroll/Rubberband, ohne die Seiten-Scrollbar zu verstecken */
    }

    .profile > section.card:nth-of-type(2) {
        /* extra Abstand zwischen Profil-Check (1) und Wochenziel (2) */
        margin-top: 1.0rem;
    }

    @media (max-width: 480px) {
        .card {
            padding: 1.1rem 1.1rem;
        }

        .stat {
            padding: 0.7rem 0.9rem;
            gap: 0.7rem;
        }

        .stat-value {
            font-size: 1.25rem;
        }

        .title {
            font-size: 1.4rem;
        }
    }

    /* === Achievement Popup (card style) === */

    /* Backdrop: leicht dunkel + Blur, wie ein fokussierter Overlay */
    .achievement-popup-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.55);
        backdrop-filter: blur(6px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2050;
    }

    /* Popup selbst: im Prinzip eine .card mit gleichen Gradients & Shadow */
    .achievement-popup {
        position: relative;
        width: min(420px, 94vw);
        padding: 1.4rem 1.5rem;
        border-radius: 18px;
        background: radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 9%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 7%, transparent), transparent 60%), color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
        border: 1px solid rgba(148, 163, 184, 0.26);
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.22);
        animation: achievement-pop-in 0.24s ease-out;
    }

    /* Header mit Pill + Close-Button */
    .achievement-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: .8rem;
    }

    .name-edit-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: .25rem;
        padding: .25rem .6rem;
        border-radius: 999px;
        border: 1px solid var(--border-color);
        background: var(--bg-secondary);
        color: var(--text-primary);
        font-size: .85rem;
        font-weight: 600;
        cursor: pointer;
        flex-shrink: 0;
    }

    /* ADD: Label für Name-Button */
    .name-edit-label {
        margin-left: .25rem;
    }

    /* Unter 360px: nur noch Stift, kein Text */
    @media (max-width: 360px) {
        .name-edit-label {
            display: none;
        }
    }


    .name-edit-btn i {
        font-size: .9rem;
    }

    /* auf sehr schmalen Screens etwas kompakter */
    @media (max-width: 360px) {
        .name-edit-btn {
            padding: .2rem .45rem;
        }
    }

    .achievement-pill {
        font-size: .75rem;
        padding: .22rem .65rem;
        border-radius: 999px;
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        color: var(--text-primary);
        font-weight: 600;
    }

    .achievement-close {
        border: 0;
        background: transparent;
        color: var(--text-secondary);
        width: 28px;
        height: 28px;
        border-radius: 8px;
        display: grid;
        place-items: center;
        font-size: 1.1rem;
        cursor: pointer;
    }

        .achievement-close:hover {
            background: rgba(148, 163, 184, 0.15);
        }

    /* Body: Icon links, Text rechts – wie deine Quick-Stats Card */
    .achievement-body {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1.1rem;
    }

    /* Icon-Stil angelehnt an .stat-icon */
    .achievement-icon {
        width: 54px;
        height: 54px;
        border-radius: 14px;
        display: grid;
        place-items: center;
        background: radial-gradient(circle at 20% 0%, color-mix(in srgb, var(--accent-primary) 35%, transparent), transparent 55%), color-mix(in srgb, #020617 90%, var(--bg-card) 10%);
        border: 1px solid rgba(148, 163, 184, 0.6);
        box-shadow: 0 6px 16px rgba(15, 23, 42, 0.45);
        color: var(--accent-primary);
        font-size: 1.6rem;
    }

    .achievement-text h4 {
        margin: 0 0 .2rem;
        font-size: 1.05rem;
        font-weight: 700;
    }

    .achievement-text p {
        margin: 0;
        color: var(--text-secondary);
        line-height: 1.35;
        font-size: .92rem;
    }

    /* REPLACE in <style scoped> */
    .achievement-cta {
        width: 100%;
        border: 0;
        padding: .7rem 1rem;
        border-radius: 12px;
        background: linear-gradient( 135deg, color-mix(in srgb, var(--accent-primary) 55%, #020617 45%), color-mix(in srgb, var(--accent-secondary) 55%, #020617 45%) );
        color: #f9fafb;
        font-weight: 700;
        font-size: .98rem;
        cursor: pointer;
        box-shadow: 0 14px 32px rgba(15, 23, 42, .7);
        text-align: center;
        transition: transform .08s ease, box-shadow .15s ease, filter .15s ease;
    }

        .achievement-cta:hover {
            transform: translateY(-1px);
            filter: brightness(1.06);
            box-shadow: 0 18px 42px rgba(15, 23, 42, .85);
        }

    /* Leichter Pop-In, passend zu deinem Card-Hover-Feeling */
    @keyframes achievement-pop-in {
        from {
            transform: translateY(10px) scale(.96);
            opacity: 0;
        }

        to {
            transform: translateY(0) scale(1);
            opacity: 1;
        }
    }

    /* Kleines Responsive-Finetuning */
    @media (max-width: 480px) {
        .achievement-popup {
            padding: 1.1rem 1.1rem;
        }

        .achievement-body {
            gap: .8rem;
        }
    }

    .profile-holdmenu {
        /* Match deine Profile-Cards (radial/soft) */
        --hm-bg: radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 9%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 7%, transparent), transparent 60%), color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
        --hm-border: 1px solid rgba(148, 163, 184, 0.26);
        --hm-shadow: 0 18px 40px rgba(15, 23, 42, 0.22);
        --hm-radius: 16px;
        --hm-pad: .35rem;
        /* bisschen weniger “Glas”, mehr “Card” */
        --hm-backdrop: blur(6px);
        /* Hover subtiler (passt zu Cards) */
        --hm-hover: rgba(148, 163, 184, 0.14);
    }

    html.dark-mode .profile-holdmenu {
        --hm-bg-dark: radial-gradient(circle at top left, color-mix(in srgb, #6366f1 14%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, #22c55e 10%, transparent), transparent 60%), #020617;
        --hm-border-dark: 1px solid rgba(148, 163, 184, 0.45);
        --hm-shadow-dark: 0 22px 55px rgba(0, 0, 0, 0.70);
        --hm-hover-dark: rgba(148, 163, 184, 0.16);
    }

    /* ADD: ab 640px Actions unter dem Text + saubere Abtrennung */
    @media (max-width: 640px) {
        .motto-row {
            grid-template-columns: 1fr;
            row-gap: .75rem;
            column-gap: 0;
            align-items: start;
        }

        .motto-actions {
            width: 100%;
            justify-content: flex-end;
            padding-top: .75rem;
            border-top: 1px solid color-mix(in srgb, var(--border-color) 70%, transparent);
        }
    }
    /* pages/Profile.vue <style scoped> */
    /* ADD */
    .motto-random-emoji {
        display: none;
    }

    @media (max-width: 480px) {
        .motto-random-emoji {
            display: inline;
            font-size: 1.05rem;
            line-height: 1;
        }

        .motto-random-label {
            display: none;
        }
    }
</style>

