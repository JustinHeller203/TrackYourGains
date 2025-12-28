<template>
    <section class="profile">
        <!-- Header -->
        <header class="profile-header">

            <div class="avatar-wrap">
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
                    Angemeldet als
                    <strong :title="fullEmail || 'Keine E-Mail hinterlegt'">
                        {{ shortEmail }}
                    </strong>
                </p>
                <div class="actions">
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
                    <button class="btn neutral logout" @click="logout">
                        <i class="fas fa-sign-out-alt"></i>
                        Logout
                    </button>
                </div>
            </div>
        </header>
        <section class="card card--soft-center">
            <h3 class="card-title"><i class="fas fa-user-check"></i> Profil-Check</h3>
            <div class="goal">
                <div class="goal-top">
                    <span>Komplettheit</span>
                    <span class="goal-value">{{ profileCompletion }}%</span>
                </div>
                <div class="bar"><div :style="{ width: profileCompletion + '%' }"></div></div>
            </div>
        </section>
        <!-- INSERT direkt unter dem Profil-Check-<section class="card"> -->
        <section class="card weekly-goal-card">
            <h3 class="card-title">
                <i class="fas fa-bullseye"></i> Wochenziel
            </h3>

            <div class="weekly-goal-inner">
                <div class="weekly-goal-visual"
                     role="img"
                     :aria-label="`Wochenziel: ${weeklyWorkouts}/${targetWorkoutsPerWeek} Workouts`">
                    <svg class="donut" viewBox="0 0 36 36" aria-hidden="true">
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
                    <div class="weekly-goal-line">
                        {{ weeklyWorkouts }} / {{ targetWorkoutsPerWeek }} Workouts
                    </div>
                    <div class="weekly-goal-status-pill">
                        {{ weeklyStatusText }}
                    </div>

                    <p class="weekly-goal-sub" v-if="targetWorkoutsPerWeek">
                        Noch {{ weeklyRemaining }} Workout<span v-if="weeklyRemaining !== 1">s</span> bis zum Ziel
                    </p>
                    <p class="weekly-goal-sub" v-else>
                        Kein Ziel gesetzt – stell dir unten eins ein.
                    </p>
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

            <div class="card">
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
            <div class="card">
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
                    <li><span class="key">Mitglied seit</span><span class="val">{{ memberSince }}</span></li>
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
        <section class="card motto-card">
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

        <!-- === Popups === -->
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

        <!-- Achievement-Popup -->
        <div v-if="showAchievementPopup && latestAchievement"
             class="achievement-popup-backdrop"
             @click.self="closeAchievementPopup">
            <div class="achievement-popup">
                <div class="achievement-header">
                    <span class="achievement-pill">Neues Achievement</span>
                    <button class="achievement-close"
                            type="button"
                            aria-label="Achievement schließen"
                            @click="closeAchievementPopup">
                        ×
                    </button>
                </div>

                <div class="achievement-body">
                    <div class="achievement-icon">
                        <img src="/achievements/FirstStepAchievementIcon.png"
                             alt="Achievement Icon"
                             class="achievement-icon-img" />
                    </div>
                    <div class="achievement-text">
                        <h4>{{ latestAchievement?.label }}</h4>
                        <p>{{ latestAchievement?.desc }}</p>
                    </div>
                </div>

                <button class="achievement-cta"
                        type="button"
                        @click="closeAchievementPopup">
                    Weiter machen 💪
                </button>
            </div>
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
    import { computed, ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
    import { useRouter } from 'vue-router'
    import { useAuthStore } from '@/store/authStore'
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

    // --- Stores / Router ---
    const auth = useAuthStore()
    const router = useRouter()
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

    function resetViewerTransform() {
        viewerScale.value = 1;
        viewerTx.value = 0;
        viewerTy.value = 0;
    }

    // INSERT Goal-Metadaten
    type GoalKey = 'muscle' | 'weight' | 'nutrition';
    const goalLabels: Record<GoalKey, string> = {
        muscle: 'Muskeln aufbauen',
        weight: 'Gewicht tracken',
        nutrition: 'Ernährung loggen'
    };

    const goalOrder = ref<GoalKey[]>(
        loadJSON<GoalKey[]>(LS_PROFILE_GOAL_ORDER, ['muscle', 'weight', 'nutrition'])
    )

    watch(goalOrder, v => saveJSON(LS_PROFILE_GOAL_ORDER, v), { deep: true })

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
        localStorage.setItem(LS_PROFILE_MOTTO, '')
        showUndo('Motto gelöscht', () => {
            motto.value = prev
            localStorage.setItem(LS_PROFILE_MOTTO, prev)
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
        localStorage.removeItem(AVATAR_KEY)
        showUndo('Profilbild entfernt', () => {
            avatarUrl.value = prev
            localStorage.setItem(AVATAR_KEY, prev)
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

    const displayName = ref<string>(localStorage.getItem(LS_PROFILE_DISPLAY_NAME) ?? '');
    const profileCompletion = computed(() => {
        let score = 0, total = 5;
        if (displayName.value.trim()) score++;
        if (avatarUrl.value) score++;
        if (motto.value.trim()) score++;
        if (weeklyWorkouts.value > 0) score++;
        if (progress.value.muscle + progress.value.weight + progress.value.nutrition > 0) score++;
        return Math.round((score / total) * 100);
    });
    watch(displayName, v => localStorage.setItem(LS_PROFILE_DISPLAY_NAME, v));

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
    function saveDisplayName() {
        localStorage.setItem(LS_PROFILE_DISPLAY_NAME, displayName.value || '');
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
    const avatarUrl = ref<string | null>(localStorage.getItem(AVATAR_KEY))
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
                localStorage.setItem(AVATAR_KEY, normalized);
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
        localStorage.removeItem(AVATAR_KEY)
        addToast('Profilbild entfernt', 'delete')
    }
    // --- State init (mit Fallbacks) ---
    const activity = ref<number[]>(loadJSON(LS_KEYS.activity, [1, 0, 2, 1, 3, 2, 2, 1, 0, 2]))

    // Typ vor erster Nutzung definieren
    type Badge = { id: string; icon: string; label: string; desc: string }

    const earnedBadges = ref<string[]>(loadJSON(LS_KEYS.earnedBadges, []))

    const showAchievementPopup = ref(false)
    const latestAchievement = ref<Badge | null>(null)

    type Progress = Record<GoalKey, number>
    const progress = ref<Progress>(
        loadJSON(LS_KEYS.progress, { muscle: 40, weight: 60, nutrition: 55 })
    )

    // Profile.vue – INSERT: AutoGoals-Status + Watch
    const autoGoalPrevious = ref<AutoGoalResult>({
        muscle: progress.value.muscle,
        weightTracking: progress.value.weight,
        nutrition: progress.value.nutrition
    })

    // jedes Mal, wenn sich deine Aktivität ändert → AutoGoals neu berechnen
    watch(
        () => activity.value.slice(),
        (days) => {
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

    const favoriteTimers = ref<number>(Number(localStorage.getItem(LS_KEYS.favorites) ?? 2))
    const motto = ref<string>(localStorage.getItem(LS_KEYS.motto) ?? 'No excuses. Just results.')
    const memberSince = computed(() =>
        localStorage.getItem(LS_KEYS.memberSince) ?? new Date().getFullYear().toString()
    )
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

    // Badges dynamisch
    const computedBadges = computed<Badge[]>(() => {
        const arr: Badge[] = []

        const totalAll = sumLastDays(activity.value, activity.value.length)
        const total30 = sumLastDays(activity.value, 30)

        // Einstieg
        if (totalAll >= 1) {
            arr.push({
                id: 'first_workout',
                icon: 'fas fa-star',
                label: 'Erster Step',
                desc: 'Dein erstes Workout ist drin – wichtiger als perfekt ist gestartet.'
            })
        }

        // Streaks
        if (streakDays.value >= 3) {
            arr.push({
                id: 'streak3',
                icon: 'fas fa-fire',
                label: '3-Tage Streak',
                desc: 'Drei Tage am Stück aktiv – jetzt bloß nicht abbrechen.'
            })
        }
        if (streakDays.value >= 7) {
            arr.push({
                id: 'streak7',
                icon: 'fas fa-bolt',
                label: '7-Tage Streak',
                desc: '7 Tage am Stück aktiv – dein neuer Standard.'
            })
        }
        if (streakDays.value >= 14) {
            arr.push({
                id: 'streak14',
                icon: 'fas fa-mountain',
                label: '14-Tage Streak',
                desc: 'Zwei Wochen durchgezogen. Disziplin > Motivation.'
            })
        }
        if (streakDays.value >= 30) {
            arr.push({
                id: 'streak30',
                icon: 'fas fa-crown',
                label: '30-Tage Streak',
                desc: 'Ein ganzer Monat ohne Drop – absolut krank.'
            })
        }

        // Wochenleistung
        if (weeklyWorkouts.value >= 3) {
            arr.push({
                id: 'weekly3',
                icon: 'fas fa-running',
                label: 'Im Flow',
                desc: '3+ Workouts diese Woche – das ist der Sweet Spot fürs Momentum.'
            })
        }
        if (weeklyWorkouts.value >= 5) {
            arr.push({
                id: 'beast',
                icon: 'fas fa-dragon',
                label: 'Beast Mode',
                desc: '5+ Workouts diese Woche – du lässt Ausreden keine Chance.'
            })
        }
        if (weeklyWorkouts.value >= 7) {
            arr.push({
                id: 'no_days_off',
                icon: 'fas fa-fire-alt',
                label: 'No Days Off',
                desc: 'Jeden Tag diese Woche aktiv gewesen. Maschine.'
            })
        }

        // Volumen (30 Tage & gesamt)
        if (total30 >= 20) {
            arr.push({
                id: 'grinder',
                icon: 'fas fa-dumbbell',
                label: 'Grinder 20/30',
                desc: '20 Workouts in 30 Tagen – du arbeitest, nicht redest.'
            })
        }

        if (totalAll >= 50) {
            arr.push({
                id: 'volume50',
                icon: 'fas fa-medal',
                label: 'Level 50+',
                desc: '50 Workouts insgesamt – deine Basis ist gebaut.'
            })
        }

        if (totalAll >= 100) {
            arr.push({
                id: 'volume100',
                icon: 'fas fa-trophy',
                label: '100 Workouts',
                desc: '100 Workouts sind nicht Glück, das ist Identität.'
            })
        }

        // Comeback – wenn erstes Element 0 und heute >0
        if ((activity.value[0] ?? 0) === 0 && (activity.value.at(-1) ?? 0) > 0) {
            arr.push({
                id: 'comeback',
                icon: 'fas fa-redo-alt',
                label: 'Comeback',
                desc: 'Du warst raus und bist wieder drin. Genau das zählt.'
            })
        }

        return arr
    })

    function closeAchievementPopup() {
        showAchievementPopup.value = false
        latestAchievement.value = null
    }

    // wenn neue Badges dazukommen → einmalig Popup + Toast
    watch(computedBadges, (current) => {
        if (!current.length) return

        const known = new Set(earnedBadges.value)
        const newly = current.find(b => !known.has(b.id))

        if (!newly) return

        earnedBadges.value = Array.from(new Set([...earnedBadges.value, newly.id]))
        latestAchievement.value = newly
        showAchievementPopup.value = true

        addToast(`Neues Achievement: ${newly.label}`, 'add')
    }, { immediate: false })

    // === TEST: Achievements per Leertaste auslösen ===
    const testBadgeIndex = ref(0)

    function triggerTestAchievement() {
        const list = computedBadges.value
        if (!list.length) return

        latestAchievement.value = list[testBadgeIndex.value % list.length]
        testBadgeIndex.value++
        showAchievementPopup.value = true
    }

    function onGlobalKeydown(e: KeyboardEvent) {
        // nur Space
        if (e.code !== 'Space' && e.key !== ' ') return

        const target = e.target as HTMLElement | null
        const tag = target?.tagName
        const isEditable =
            target?.isContentEditable ||
            tag === 'INPUT' ||
            tag === 'TEXTAREA' ||
            tag === 'SELECT'

        // nicht triggern, wenn man in einem Input/Textarea tippt
        if (isEditable) return

        e.preventDefault()
        triggerTestAchievement()
    }

    onMounted(() => {
        window.addEventListener('keydown', onGlobalKeydown)
    })

    onUnmounted(() => {
        window.removeEventListener('keydown', onGlobalKeydown)
    })

    // --- UI: Motto Edit ---
    const editingMotto = ref(false)
    function toggleMotto() {
        if (editingMotto.value) saveMotto()
        editingMotto.value = !editingMotto.value
    }
    function saveMotto() {
        localStorage.setItem(LS_KEYS.motto, motto.value || '')
        addToast('Motto gespeichert', 'save')
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
    function resetProgress() {
        progress.value = { muscle: 40, weight: 60, nutrition: 55 }
    }

    // --- E-Mail / Passwort / Delete (Frontend-only) ---
    const showEmailPopup = ref(false)
    const emailForm = ref({ newEmail: '', password: '' })
    const emailError = ref('')

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
    watch(activity, v => saveJSON(LS_KEYS.activity, v), { deep: true })
    watch(progress, v => saveJSON(LS_KEYS.progress, v), { deep: true })
    watch(favoriteTimers, v => localStorage.setItem(LS_KEYS.favorites, String(v)))
    watch(earnedBadges, v => saveJSON(LS_KEYS.earnedBadges, v), { deep: true })

    onMounted(() => {
        // Falls memberSince noch nicht gesetzt, einmalig setzen
        if (!localStorage.getItem(LS_KEYS.memberSince)) {
            localStorage.setItem(LS_KEYS.memberSince, new Date().getFullYear().toString())
        }
    })

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

            .btn.neutral.logout {
                background: var(--bg-secondary)
            }

        .btn.danger-outline {
            background: transparent;
            border: 1px solid rgba(220,38,38,.6);
            color: rgba(220,38,38,.9);
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
    }

    .weekly-goal-inner {
        display: flex;
        align-items: center;
        justify-content: flex-start; /* Cluster links */
        gap: 1.6rem;
        width: 100%;
        margin: .25rem 0 .1rem;
    }

    .weekly-goal-side {
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: .3rem;
        text-align: left;
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
        font-size: 1.05rem;
        font-weight: 700;
        color: var(--text-primary);
    }


    @media (max-width: 600px) {
        .weekly-goal-inner {
            flex-direction: column;
            align-items: flex-start;
        }

        .weekly-goal-side {
            align-items: flex-start;
            text-align: left;
        }
    }

    /* ADD: kleine Info unter dem Wochenziel */
    .weekly-goal-footer {
        margin-top: .6rem;
        font-size: .8rem;
        color: var(--text-secondary);
    }

    .weekly-goal-auto-hint {
        opacity: .9;
    }

    @media (max-width: 600px) {
        .weekly-goal-inner {
            flex-direction: column;
            align-items: center;
        }

        .weekly-goal-side {
            align-items: center;
            text-align: center;
        }

        .weekly-goal-status-pill {
            white-space: normal;
            text-align: center;
        }

        .weekly-goal-controls {
            justify-content: flex-start;
        }
    }

    /* Donut-Styles */
    .donut {
        width: 130px;
        height: 130px;
    }

    .donut-bg {
        fill: none;
        stroke: var(--bg-secondary);
        stroke-width: 3;
    }

    .donut-fg {
        fill: none;
        stroke: var(--accent-primary);
        stroke-width: 3.6;
        transform: rotate(-90deg);
        transform-origin: 50% 50%;
    }

    .donut-label {
        font-weight: 800;
        font-size: 1rem;
        fill: var(--text-primary);
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


    .donut-bg {
        fill: none;
        stroke: var(--bg-secondary);
        stroke-width: 3;
    }

    .donut-fg {
        fill: none;
        stroke: var(--accent-primary);
        stroke-width: 3.6;
        transform: rotate(-90deg);
        transform-origin: 50% 50%;
    }

    .donut-label {
        font-weight: 800;
        font-size: .9rem;
        fill: var(--text-primary);
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

</style>