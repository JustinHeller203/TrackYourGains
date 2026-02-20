<!--components/ui/training/TrainingPlansList.vue-->

<template>
    <div>
        <div class="workout-list plans-section" data-tyg="plans-section">
            <h3 class="section-title">Deine Trainingspläne</h3>

            <UiSearch v-model="planSearch"
                      placeholder="Nach Planname oder Trainingsziel suchen"
                      aria-label="Trainingspläne durchsuchen"
                      class="plan-search" />

            <!-- Externer Plan per Code -->
            <div v-if="externalQueryActive" class="external-plan-box">
                <div v-if="externalLoading" class="external-plan-hint">
                    Suche externen Plan…
                </div>

                <div v-else-if="externalError" class="external-plan-error">
                    {{ externalError }}
                </div>

                <div v-else-if="externalView" class="external-plan-card">
                    <div class="external-plan-left">
                        <div class="external-plan-title">
                            🔗 Externer Plan: <b>{{ externalView.name }}</b>
                        </div>
                        <div class="external-plan-sub">
                            {{ externalView.exerciseCount }} Übungen · Code: {{ middleEllipsis(String(externalView.code ?? ''), 14) }}
                        </div>
                    </div>

                    <div class="external-plan-actions">
                        <ActionIconButton title="Installieren"
                                          aria-label="Externen Trainingsplan installieren"
                                          @click="installExternalPlan">
                            <img class="icon-download icon-download--install"
                                 src="/DownloadButton.png"
                                 alt=""
                                 aria-hidden="true" />
                        </ActionIconButton>
                    </div>
                </div>

                <div v-else class="external-plan-hint">
                    Kein externer Plan gefunden.
                </div>
            </div>

            <!-- Favoriten sortieren -->
            <Draggable v-if="plans.length && favoritePlanItems.length"
                       v-model="favoritePlanItems"
                       item-key="id"
                       :handle="isMobile ? undefined : '.plan-drag-handle'"
                       ghost-class="drag-ghost"
                       chosen-class="drag-chosen"
                       drag-class="dragging"
                       :force-fallback="true"
                       :animation="0"
                       direction="vertical"
                       easing="cubic-bezier(0.16,1,0.3,1)"
                       :disabled="planSearch.trim().length > 0"
                       :delay="dragDelay"
                       :delay-on-touch-only="true"
                       :touch-start-threshold="8"
                       :fallback-tolerance="3"
                       :fallback-on-body="true"
                       :scroll="true"
                       :scroll-sensitivity="40"
                       :scroll-speed="12"
                       :swap-threshold="0.3"
                       :filter="isMobile ? dragFilter : undefined"
                       tag="div"
                       class="plan-drag-stack">

                <template #item="{ element: plan }">
                    <div v-if="planMatchesSearch(plan)"
                         class="list-item plan-item"
                         :class="{ 'menu-open': planMenuOpenId === plan.id }"
                         :key="plan.id"
                         :data-plan-id="plan.id"
                         @click="onPlanCardClick($event, plan.id)">
                        <div class="plan-row1">
                            <span class="plan-drag-handle" title="Ziehen zum Verschieben">⠿</span>

                            <span class="plan-title"
                                  :title="plan.name"
                                  @click.stop="loadPlan(plan.id)"
                                  @dblclick.stop="editPlan(plan.id)">
                                <span class="plan-name-scroll">{{ plan.name }}</span>
                                <span class="plan-count">({{ plan.exerciseCount }} Übungen)</span>
                            </span>

                            <div class="plan-right">
                                <FavoriteButton :active="favoritePlans.includes(plan.id)"
                                                :titleActive="'Aus Favoriten entfernen'"
                                                :titleInactive="'Zu Favoriten hinzufügen'"
                                                @toggle="toggleFavoritePlan(plan.id)" />

                                <div class="inline-actions">
                                    <EditButton title="Plan bearbeiten" @click.stop="editPlanInBuilder(plan.id)" />
                                    <DeleteButton title="Plan löschen" @click="openDeletePopup(() => deletePlan(plan.id))" />
                                    <ActionIconButton title="Exportieren"
                                                      aria-label="Trainingsplan exportieren"
                                                      @click="downloadPlan(plan)">⬇️</ActionIconButton>
                                </div>

                                <span class="kebab-wrap">
                                    <ActionIconButton title="Mehr"
                                                      aria-label="Weitere Aktionen"
                                                      @click.stop="togglePlanMenu(plan.id)">⋯</ActionIconButton>
                                </span>

                                <ActionIconButton class="play-btn"
                                                  title="Starten"
                                                  aria-label="Training starten"
                                                  @click.stop="startSimulation(plan)">
                                    <img class="play-icon" src="/PlayButton.png" alt="" aria-hidden="true" />
                                </ActionIconButton>
                            </div>

                            <PlanMenu v-if="planMenuOpenId === plan.id"
                                      @edit="editPlanInBuilder(plan.id)"
                                      @delete="openDeletePopup(() => deletePlan(plan.id))"
                                      @download="openDownloadPopup(plan)" />
                        </div>

                    </div>
                </template>
            </Draggable>

            <!-- Nicht-Favoriten sortieren -->
            <Draggable v-if="plans.length"
                       v-model="otherPlanItems"
                       item-key="id"
                       :handle="isMobile ? undefined : '.plan-drag-handle'"
                       ghost-class="drag-ghost"
                       chosen-class="drag-chosen"
                       drag-class="dragging"
                       :force-fallback="true"
                       :animation="0"
                       direction="vertical"
                       easing="cubic-bezier(0.16,1,0.3,1)"
                       :disabled="planSearch.trim().length > 0"
                       :delay="dragDelay"
                       :delay-on-touch-only="true"
                       :touch-start-threshold="8"
                       :fallback-tolerance="3"
                       :fallback-on-body="true"
                       :scroll="true"
                       :scroll-sensitivity="40"
                       :scroll-speed="12"
                       :swap-threshold="0.3"
                       :filter="isMobile ? dragFilter : undefined"
                       tag="div"
                       class="plan-drag-stack plan-drag-stack--others">

                <template #item="{ element: plan }">
                    <div v-if="planMatchesSearch(plan)"
                         class="list-item plan-item"
                         :class="{ 'menu-open': planMenuOpenId === plan.id }"
                         :key="plan.id"
                         :data-plan-id="plan.id"
                         @click="onPlanCardClick($event, plan.id)">
                        <div class="plan-row1">
                            <span class="plan-drag-handle" title="Ziehen zum Verschieben">⠿</span>

                            <span class="plan-title"
                                  :title="plan.name"
                                  @click.stop="loadPlan(plan.id)"
                                  @dblclick.stop="editPlan(plan.id)">
                                <span class="plan-name-scroll">{{ plan.name }}</span>
                                <span class="plan-count">({{ (plan.exerciseCount ?? plan.exercises?.length ?? 0) }} Übungen)</span>
                            </span>

                            <div class="plan-right">
                                <FavoriteButton :active="favoritePlans.includes(plan.id)"
                                                :titleActive="'Aus Favoriten entfernen'"
                                                :titleInactive="'Zu Favoriten hinzufügen'"
                                                @toggle="toggleFavoritePlan(plan.id)" />

                                <div class="inline-actions">
                                    <EditButton title="Plan bearbeiten" @click.stop="editPlanInBuilder(plan.id)" />
                                    <DeleteButton title="Plan löschen" @click="openDeletePopup(() => deletePlan(plan.id))" />
                                    <ActionIconButton title="Exportieren"
                                                      aria-label="Trainingsplan exportieren"
                                                     @click="downloadPlan(plan)">⬇️</ActionIconButton>
                                </div>

                                <span class="kebab-wrap">
                                    <ActionIconButton title="Mehr"
                                                      aria-label="Weitere Aktionen"
                                                      @click.stop="togglePlanMenu(plan.id)">⋯</ActionIconButton>
                                </span>

                                <ActionIconButton class="play-btn"
                                                  title="Starten"
                                                  aria-label="Training starten"
                                                  @click.stop="startSimulation(plan)">
                                    <img class="play-icon" src="/PlayButton.png" alt="" aria-hidden="true" />
                                </ActionIconButton>
                            </div>

                            <PlanMenu v-if="planMenuOpenId === plan.id"
                                      @edit="editPlanInBuilder(plan.id)"
                                      @delete="openDeletePopup(() => deletePlan(plan.id))"
                                      @download="downloadPlan(plan)" />
                        </div>
                    </div>
                </template>
            </Draggable>
        </div>

        <!-- Ausgewählter Trainingsplan -->
        <div v-if="selectedPlan"
             ref="selectedPlanRoot"
             class="workout-list"
             :class="{ 'plan-scroll-highlight': isPlanScrollHighlight }">
            <div class="plan-header">
                <h3 class="section-title" @dblclick="editPlan(selectedPlan.id)">
                    <span class="plan-title-main">
                        Trainingsplan: {{ selectedPlan.name }}
                    </span>

                    <div v-if="selectedPlan.code" class="plan-code-row">
                        <span class="plan-code-badge"
                              :title="`${selectedPlan.code} (Klick zum Kopieren)`"
                              @click.stop="copyPlanCode(selectedPlan.code)">
                            Code: {{ middleEllipsis(selectedPlan.code, 14) }}
                        </span>
                    </div>
                </h3>
                <CloseButton title="Plan schließen" @click="closePlan" />
            </div>

            <Table class="exercise-table full-width narrow" variant="narrow">
                <table ref="resizeTable" data-cols="3">
                    <thead>
                        <tr>
                            <th class="resizable" :style="{ width: columnWidths[0] + '%' }">
                                <span class="th-text">Übung</span>
                            </th>
                            <th class="resizable" :style="{ width: columnWidths[1] + '%' }">
                                <span class="th-text">
                                    {{ selectedPlan.exercises.some(ex => ex.type === 'ausdauer') ? 'Sätze / Min' : 'Sätze' }}
                                </span>
                            </th>
                            <th class="resizable th-wdh" :style="{ width: columnWidths[2] + '%' }">
                                <span class="th-text th-label">
                                    <span class="full">
                                        {{
                                            selectedPlan.exercises.some(ex => ex.type === 'ausdauer' || ex.type === 'dehnung')
                                                ? 'Wdh. / km / s'
                                                : 'Wiederholungen'
                                        }}
                                    </span>
                                    <span class="mid">
                                        {{
                                            selectedPlan.exercises.some(ex => ex.type === 'ausdauer' || ex.type === 'dehnung')
                                                ? 'Wdh./km/s'
                                                : 'Wiederhol...'
                                        }}
                                    </span>
                                    <span class="short">
                                        {{
                                            selectedPlan.exercises.some(ex => ex.type === 'ausdauer' || ex.type === 'dehnung')
                                                ? 'W/km/s'
                                                : 'Wdh.'
                                        }}
                                    </span>
                                </span>
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr v-for="(ex, index) in selectedPlan.exercises"
                            :key="index"
                            class="resizable-row"
                            :style="{ height: rowHeights[index] + 'px' }"
                            @dblclick="openEditPopup('selectedPlan', index, $event)">
                            <td :style="{ width: columnWidths[0] + '%' }">{{ ex.exercise }}</td>

                            <!-- Sätze/Min -->
                            <td :style="{ width: columnWidths[1] + '%' }">
                                {{ ex.type === 'ausdauer' ? `${ex.sets} min` : ex.sets }}
                            </td>

                            <!-- Wdh./km/s -->
                            <td :style="{ width: columnWidths[2] + '%' }">
                                <template v-if="ex.type === 'ausdauer'">
                                    {{ ex.reps ? `${ex.reps} km` : '-' }}
                                </template>
                                <template v-else-if="ex.type === 'dehnung'">
                                    {{ ex.reps }} s
                                </template>
                                <template v-else>
                                    {{ ex.reps }}
                                </template>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </Table>

            <button v-if="customExercises.length > 0"
                    type="button"
                    class="custom-toggle-btn"
                    :class="{ on: showCustomExercises }"
                    :aria-expanded="showCustomExercises"
                    @click="toggleCustomExercises">
                <span class="custom-toggle-text">
                    {{ showCustomExercises ? 'Benutzerdefinierte Übungen ausblenden' : 'Benutzerdefinierte Übungen anzeigen' }}
                </span>
                <span class="custom-toggle-arrow" aria-hidden="true"></span>
            </button>

            <div v-if="showCustomExercises">
                <h3 class="section-title">Eigene Übungen</h3>

                <Table class="exercise-table full-width narrow" variant="narrow">
                    <table ref="customResizeTable" data-cols="4">
                        <thead>
                            <tr>
                                <th class="resizable" :style="{ width: customColWidths[0] + '%' }">
                                    <span class="th-text">Name</span>
                                </th>
                                <th class="resizable th-muskel" :style="{ width: customColWidths[1] + '%' }">
                                    <span class="th-text th-label">
                                        <span class="full">Muskelgruppe</span>
                                        <span class="mid">Muskelgr...</span>
                                        <span class="short">Muskel...</span>
                                    </span>
                                </th>
                                <th class="resizable" :style="{ width: customColWidths[2] + '%' }">
                                    <span class="th-text">Typ</span>
                                </th>
                                <th :style="{ width: customColWidths[3] + '%' }">Aktion</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr v-for="(ex, i) in customExercises" :key="i">
                                <td :style="{ width: customColWidths[0] + '%' }"
                                    @dblclick="openEditPopup('customExerciseName', i)">
                                    <span>{{ ex.name }}</span>
                                </td>

                                <td class="v-stack"
                                    :style="{ width: customColWidths[1] + '%' }"
                                    @dblclick="openEditPopup('customExerciseMuscle', i)">
                                    <span>{{ ex.muscle }}</span>
                                </td>

                                <td :style="{ width: customColWidths[2] + '%' }"
                                    @dblclick="openEditPopup('customExerciseType', i)">
                                    {{ typeLabel(ex.type) }}
                                </td>

                                <td class="action-cell">
                                    <DeleteButton class="table-delete-btn"
                                                  title="Benutzerdefinierte Übung entfernen"
                                                  @click="removeCustomExercise(i)" />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </Table>
            </div>
        </div>
    </div>

    <PlanCreatedTutorial :isActive="!!planTutActive"
                         :planId="planTutPlanId ?? null"
                         :openPlan="openPlanFromTutorial"
                         @done="closePlanTut"
                         @skipped="closePlanTut" />

    <TrainingSimulation :show="simOpen"
                        :plan="simPlan"
                        @close="closeSimulation"
                        @progressSave="onSimProgressSave"
                        @progressInvalid="onSimProgressInvalid"
                        @progressCancel="onSimProgressCancel" />
</template>
<script setup lang="ts">
    import { ref, computed, nextTick, watch, onMounted, onUnmounted } from 'vue'
    import Draggable from 'vuedraggable'

    import UiSearch from '@/components/ui/kits/UiSearch.vue'
    import Table from '@/components/ui/kits/UiTable.vue'

    import FavoriteButton from '@/components/ui/buttons/FavoriteButton.vue'
    import EditButton from '@/components/ui/buttons/EditButton.vue'
    import DeleteButton from '@/components/ui/buttons/DeleteButton.vue'
    import ActionIconButton from '@/components/ui/buttons/ActionIconButton.vue'
    import CloseButton from '@/components/ui/buttons/CloseButton.vue'
    import PlanMenu from '@/components/ui/menu/PlanMenu.vue'

    import { useTrainingPlansStore } from '@/store/trainingPlansStore'
    import { useAuthStore } from '@/store/authStore'
    import type { TrainingPlan as TrainingPlanDto } from '@/types/TrainingPlan'
    import { getTrainingPlanByCode, installTrainingPlanByCode } from "@/services/trainingPlans"

    import PlanCreatedTutorial from "@/components/ui/TygTutorials/PlanCreatedTutorial.vue"
    import TrainingSimulation from "@/components/ui/popups/TrainingSimulation.vue"
    import { useProgressStore } from "@/store/progressStore"

    /* -------------------- Types (nur Plans) -------------------- */
    type ExerciseType = 'kraft' | 'calisthenics' | 'dehnung' | 'ausdauer'
    type CustomExerciseType = Exclude<ExerciseType, 'ausdauer'>

    interface PlanExercise {
        exercise: string
        sets: number
        reps: number
        goal?: string
        type?: ExerciseType
    }

    type ViewPlan = {
        id: string
        name: string
        isFavorite: boolean
        code?: string | null
        exercises: PlanExercise[]
        exerciseCount: number
    }

    const props = defineProps<{
        // Gäste-Pläne kommen vom Parent (weil der Builder dort sitzt)
        guestPlans?: ViewPlan[]
        onEditInBuilder?: (payload: { planId: string; name: string; exercises: PlanExercise[] }) => void

        // ✅ Custom Exercises kommen vom Parent (Quelle bleibt 1x: Training.vue / Builder)
        customExercises?: Array<{ name: string; muscle: string; type: CustomExerciseType }>
        onRemoveCustomExercise?: (index: number) => void

        // ✅ Guest-Aktionen zurück an Parent (weil Parent die Quelle der Wahrheit ist)
        onGuestDeletePlan?: (planId: string) => void
        onGuestEditPlan?: (planId: string) => void

        // Parent-UI Aktionen (Popups + Toast)
        openEditPopup: (
            type:
                | 'table'
                | 'selectedPlan'
                | 'planName'
                | 'selectedPlanName'
                | 'customExerciseName'
                | 'customExerciseMuscle'
                | 'customExerciseType',
            index: number | string,
            event?: MouseEvent
        ) => void

        openDeletePopup: (action: () => void) => void
        openDownloadPopup: (plan: ViewPlan) => void
        addToast: (message: string, type?: 'delete' | 'add' | 'save' | 'timer' | 'load') => void

        // ✅ Tutorial (Option B)
        planTutActive?: boolean
        planTutPlanId?: string | null
    }>()

    const emit = defineEmits<{
        (e: "planTutDone"): void
    }>()

    const closePlanTut = () => emit("planTutDone")

    const simOpen = ref(false)
    const simPlan = ref<ViewPlan | null>(null)

    const downloadPlan = async (plan: ViewPlan) => {
        closePlanMenu()

        // Gast: hat exercises schon drin
        if (!auth.user) {
            props.openDownloadPopup(plan)
            return
        }

        const hasAnyExercises = (p: any) =>
            Array.isArray(p?.days) &&
            p.days.some((d: any) => Array.isArray(d?.exercises) && d.exercises.length > 0)

        try {
            // 1) quick try: item aus store
            let dto = getAccountPlanDto(plan.id)

            // 2) wenn "light" -> full nachladen (genau wie beim Öffnen)
            if (!dto || !hasAnyExercises(dto)) {
                await trainingPlansStore.loadOne(plan.id)
                dto =
                    (trainingPlansStore.selected as any) ??
                    getAccountPlanDto(plan.id) ??
                    null
            }

            if (!dto) {
                props.addToast('Plan konnte nicht geladen werden', 'delete')
                return
            }

            // 3) export braucht ViewPlan mit exercises
            const fullView = flattenDto(dto)
            props.openDownloadPopup(fullView)
        } catch {
            props.addToast('Plan konnte nicht geladen werden', 'delete')
        }
    }
    const startSimulation = async (plan: ViewPlan) => {
        closePlanMenu()

        // Gast: hat i.d.R. schon exercises drin
        if (!auth.user) {
            simPlan.value = plan
            simOpen.value = true
            return
        }

        // Account: items sind oft "light" → full nachladen
        const hasAnyExercises = (p: any) =>
            Array.isArray(p?.days) &&
            p.days.some((d: any) => Array.isArray(d?.exercises) && d.exercises.length > 0)

        try {
            let dto = getAccountPlanDto(plan.id)

            if (!dto || !hasAnyExercises(dto)) {
                await trainingPlansStore.loadOne(plan.id)
                dto =
                    (trainingPlansStore.selected as any) ??
                    getAccountPlanDto(plan.id) ??
                    null
            }

            if (!dto) {
                props.addToast('Plan konnte nicht geladen werden', 'delete')
                return
            }

            // sim braucht ViewPlan mit exercises
            simPlan.value = flattenDto(dto)
            simOpen.value = true
        } catch {
            props.addToast('Plan konnte nicht geladen werden', 'delete')
        }
    }

    const closeSimulation = () => {
        simOpen.value = false
        simPlan.value = null
    }
    const openPlanFromTutorial = (planId: string) => {
        loadPlan(planId)
    }
    /* -------------------- Stores -------------------- */
    const trainingPlansStore = useTrainingPlansStore()
    const auth = useAuthStore()

    const progressStore = useProgressStore()

    // nimmt das Workout aus ProgressEntryModal und macht es API-safe
    const toCreatePayload = (workout: any) => {
        const { id, planId, ...rest } = (workout ?? {})
        return rest
    }

    const toUpdatePayload = (workout: any) => {
        const { id, planId, ...rest } = (workout ?? {})
        return rest
    }

    const onSimProgressSave = async (payload: any) => {
        const workout = payload?.workout ?? null
        if (!workout) return

        // PlanId kommt im Normalfall aus dem Workout (ProgressEntryModal kriegt planId)
        const planId =
            (workout?.planId as string | null) ??
            (simPlan.value?.id ?? null)

        if (!planId) return

        // Gäste / lokale IDs: progressStore.load blockt GUID sowieso.
        // Wir skippen persistieren hier hart, damit nix weird passiert.
        if (!auth.user) return

        try {
            if (workout?.id) {
                await progressStore.edit(planId, String(workout.id), toUpdatePayload(workout))
            } else {
                await progressStore.add(planId, toCreatePayload(workout))
            }

            // direkt refresh, damit PlanProgressPopup sofort sauber ist
            await progressStore.load(planId, true)
        } catch (e) {
            // du hast hier keinen Toast in der Signatur vom Event,
            // aber du hast props.addToast im Component.
            props.addToast("Progress speichern fehlgeschlagen", "delete")
        }
    }

    const onSimProgressInvalid = (_errors: string[]) => {
        // optional: props.addToast("Bitte prüf deine Eingaben", "delete")
    }

    const onSimProgressCancel = () => {
        // optional: nix tun
    }

    /* -------------------- Helpers -------------------- */
    const canUseLocalStorage = () => !!auth.user

    const LS_FAV_ORDER = 'LS_TRAINING_FAV_ORDER_IDS'

    const readFavOrder = (): string[] => {
        if (!canUseLocalStorage()) return []
        try {
            const raw = localStorage.getItem(LS_FAV_ORDER)
            const arr = raw ? JSON.parse(raw) : []
            return Array.isArray(arr) ? arr.filter(x => typeof x === 'string') : []
        } catch {
            return []
        }
    }

    const writeFavOrder = (ids: string[]) => {
        if (!canUseLocalStorage()) return
        localStorage.setItem(LS_FAV_ORDER, JSON.stringify(ids))
    }

    const isCardioName = (name: string) => {
        const n = (name || '').toLowerCase()
        return [
            'lauf', 'jogg', 'run', 'treadmill', 'rad', 'fahrrad', 'bike', 'spinning', 'cycling',
            'row', 'rudern', 'ergometer', 'crosstrainer', 'ellip', 'seilspring', 'rope',
            'treppen', 'stairs', 'schwimm', 'walk', 'hike'
        ].some(k => n.includes(k))
    }

    const isStretchName = (name: string) => {
        const n = (name || '').toLowerCase()
        return [
            'dehn', 'stretch', 'mobil', 'mobility', 'beweglich', 'yoga', 'faszien', 'smr',
            'roll', 'hip opener'
        ].some(k => n.includes(k))
    }
    const mapDtoExerciseToPlanExercise = (ex: any): PlanExercise => {
        // Kraft/Calisthenics: sets/reps oder setCount/repCount etc.
        const strengthSets = normalizeNum(ex?.sets ?? ex?.setCount ?? ex?.setsCount)
        const strengthReps = normalizeNum(ex?.reps ?? ex?.repCount ?? ex?.repsCount)

        // Ausdauer: minutes + distance
        const cardioMinRaw = normalizeNum(ex?.durationMin ?? ex?.minutes ?? ex?.durationMinutes ?? ex?.timeMin)
        const cardioKmRaw = normalizeNum(ex?.distanceKm ?? ex?.kilometers ?? ex?.km ?? ex?.distance)

        // Dehnung: seconds (bei dir wird reps als “s” angezeigt)
        const stretchSecRaw = normalizeNum(ex?.durationSec ?? ex?.seconds ?? ex?.durationSeconds ?? ex?.timeSec)

        // ✅ Type aus DTO (kann bei dir aber faktisch falsch sein)
        const dtoType = normalizeTypeFromDto(ex)

        // ✅ Name für Heuristik
        const name = String(ex?.name ?? ex?.exercise ?? '').trim()

        // ✅ Candidates (Cardio/Stretch kann bei dir in sets/reps stecken)
        let cardioMin = cardioMinRaw
        let cardioKm = cardioKmRaw
        let stretchSec = stretchSecRaw

        // ✅ Falls dedicated cardio Felder fehlen, aber es cardio sein sollte (dtoType ODER Name)
        if (cardioMin <= 0 && strengthSets > 0 && isCardioName(name)) cardioMin = strengthSets
        if (cardioKm <= 0 && strengthReps > 0 && isCardioName(name) && strengthReps <= 100) cardioKm = strengthReps

        // ✅ Falls dedicated stretch Felder fehlen, aber es stretch sein sollte (dtoType ODER Name)
        if (stretchSec <= 0 && strengthReps > 0 && isStretchName(name)) stretchSec = strengthReps

        if (isStretchName(name) && stretchSec <= 0 && cardioMinRaw > 0 && cardioKmRaw === 0) {
            stretchSec = Math.round(cardioMinRaw * 60)
            cardioMin = 0
            cardioKm = 0
        }

        // ✅ Spezialfall: Cardio hat Sekunden in reps (z.B. Radfahren reps=2040s) -> in Minuten umrechnen
        if (isCardioName(name) && cardioMinRaw <= 0 && cardioMin <= 0 && strengthReps >= 60) {
            cardioMin = Math.max(1, Math.round(strengthReps / 60)) // 2040s -> 34min
        }

        // ✅ Jetzt erst “has…” auf den FINALEN Candidates prüfen
        const hasCardio = cardioMin > 0 || cardioKm > 0
        const hasStretch = stretchSec > 0

        // ✅ Type: Daten/Name gewinnt IMMER wenn eindeutig
        let type: ExerciseType = dtoType
        if (hasCardio && !hasStretch) type = 'ausdauer'
        else if (hasStretch && !hasCardio) type = 'dehnung'

        // ✅ Output-Mapping
        const sets =
            type === 'ausdauer' ? cardioMin
                : (type === 'dehnung' ? 1 : strengthSets)

        const reps =
            type === 'ausdauer' ? cardioKm
                : (type === 'dehnung' ? stretchSec : strengthReps)

        return {
            exercise: name,
            sets,
            reps,
            type,
        }
    }

    const normalizeNum = (v: unknown): number => {
        const n = typeof v === 'number' ? v : Number(String(v ?? '').replace(',', '.').trim())
        return Number.isFinite(n) ? n : 0
    }

    const normalizeTypeFromDto = (ex: any): ExerciseType => {
        const raw =
            ex?.type ??
            ex?.exerciseType ??
            ex?.trainingType ??
            ex?.workoutType ??
            ex?.kind ??
            ex?.categoryName ??
            ex?.category

        // wenn’s schon string ist -> sauber normalisieren
        const s = String(raw ?? '').toLowerCase().trim()
        if (s === 'ausdauer' || s === 'cardio' || s === 'endurance' || s === 'aerobic' || s.includes('ausdauer')) return 'ausdauer'
        if (s === 'dehnung' || s === 'stretch' || s === 'stretching' || s === 'mobility' || s.includes('dehnung')) return 'dehnung'
        if (s === 'calisthenics' || s === 'bodyweight' || s === 'bw') return 'calisthenics'
        if (s === 'kraft' || s === 'strength' || s === 'weights' || s === 'weight') return 'kraft'

        const cat = Number(raw)
        if (Number.isFinite(cat)) {
            if (cat === 2) return 'dehnung'
            if (cat === 3) return 'ausdauer'
            if (cat === 1) return 'calisthenics'
            return 'kraft'
        }

        return 'kraft'
    }
    const flattenDto = (p: TrainingPlanDto): ViewPlan => {
        const flat: PlanExercise[] = []
        for (const d of (p.days ?? [])) {
            for (const ex of (d.exercises ?? [])) flat.push(mapDtoExerciseToPlanExercise(ex))
        }

        const fallbackCount =
            Number((p as any)?.exerciseCount ?? (p as any)?.exercisesCount ?? (p as any)?.exercise_count ?? 0) || 0

        const count = flat.length > 0 ? flat.length : fallbackCount

        return {
            id: p.id,
            name: p.name,
            isFavorite: !!p.isFavorite,
            code: (p as any)?.code ?? null,
            exercises: flat,
            exerciseCount: count,
        }
    }

    function middleEllipsis(str: string, max = 36) {
        const s = (str || '').trim()
        if (s.length <= max) return s
        const head = Math.ceil((max - 1) / 2)
        const tail = Math.floor((max - 1) / 2)
        return s.slice(0, head) + '…' + s.slice(-tail)
    }

    const copyPlanCode = async (code?: string | null) => {
        const c = (code ?? '').trim()
        if (!c) { props.addToast('Kein Code vorhanden', 'delete'); return }

        try {
            await navigator.clipboard.writeText(c)
            props.addToast('Code kopiert', 'save')
        } catch {
            props.addToast('Kopieren fehlgeschlagen', 'delete')
        }
    }

    const typeLabel = (t: ExerciseType) =>
        ({ kraft: 'Kraft', calisthenics: 'Calisthenics', dehnung: 'Dehnung', ausdauer: 'Ausdauer' } as const)[t]

    const editPlanInBuilder = async (planId: string) => {
        closePlanMenu()

        if (!props.onEditInBuilder) {
            props.addToast('Edit im Builder fehlt: onEditInBuilder', 'delete')
            return
        }

        // Gast
        if (!auth.user) {
            const gp = (props.guestPlans ?? []).find(p => p.id === planId)
            if (!gp) { props.addToast('Plan nicht gefunden', 'delete'); return }

            props.onEditInBuilder({
                planId: gp.id,
                name: gp.name,
                exercises: Array.isArray(gp.exercises) ? gp.exercises.map(x => ({ ...x })) : [],
            })

            props.addToast('Plan im Builder geöffnet', 'save')
            return
        }

        // Account
        try {
            // IMMER Full-Plan laden (items sind oft light)
            await trainingPlansStore.loadOne(planId)

            const dtoFull =
                (trainingPlansStore.selected as any) ??
                getAccountPlanDto(planId) ??
                null

            if (!dtoFull) { props.addToast('Plan nicht gefunden', 'delete'); return }

            setStoreSelectedPlan(dtoFull)

            const view = flattenDto(dtoFull)
            props.onEditInBuilder({
                planId: view.id,
                name: view.name,
                exercises: Array.isArray(view.exercises) ? view.exercises.map(x => ({ ...x })) : [],
            })

            props.addToast('Plan im Builder geöffnet', 'save')
        } catch {
            props.addToast('Plan konnte nicht geladen werden', 'delete')
        }
    }

    const buildPlanShareUrl = (code?: string | null) => {
        const c = (code ?? '').trim()
        if (!c) return 'https://trackyourgains.de'
        const origin = (typeof window !== 'undefined' && window.location?.origin)
            ? window.location.origin
            : 'https://trackyourgains.de'
        return `${origin}/training?code=${encodeURIComponent(c)}`
    }

    const buildShareLines = (ctx: { kind: 'plan' | 'progress' | 'whatever'; url?: string; title?: string }) => {
        const url = (ctx.url ?? 'https://trackyourgains.de').trim() // ctx.url am besten schon encoded/deep
        if (ctx.kind === 'plan') {
            return [
                '🔥 Ich hab dir meinen Trainingsplan in TrackYourGains geschickt.',
                '👉 Öffnen & direkt loslegen:',
                url,
                '',
                'Hol dir die App — macht Planung & Progress so viel cleaner 💪',
            ]
        }

        if (ctx.kind === 'progress') {
            return [
                '📈 Ich hab dir meinen Progress in TrackYourGains geschickt.',
                '👉 Öffnen:',
                url,
            ]
        }

        // fallback
        return [
            '📦 Export aus TrackYourGains:',
            url,
        ]
    }

    const shareLines = computed(() =>
        buildShareLines({
            kind: 'plan',
            url: buildPlanShareUrl(selectedPlan.value?.code ?? null),
        })
    )
    /* -------------------- UI State (nur Plans) -------------------- */
    const planSearch = ref('')

    const externalPlan = ref<TrainingPlanDto | null>(null)
    const externalLoading = ref(false)
    const externalError = ref<string | null>(null)

    let externalT: number | null = null

    const isValidPlanCodeFrontend = (raw: string) => {
        const code = (raw ?? '').trim()
        if (code.length !== 12) return false

        const U = "ABCDEFGHJKLMNPQRSTUVWXYZ"
        const L = "abcdefghijkmnpqrstuvwxyz"
        const D = "23456789"
        const S = "&-_,#."
        const ALL = U + L + D + S

        let hasU = false, hasL = false, hasD = false, specialCount = 0

        for (const c of code) {
            if (!ALL.includes(c)) return false
            if (U.includes(c)) hasU = true
            else if (L.includes(c)) hasL = true
            else if (D.includes(c)) hasD = true
            else if (S.includes(c)) specialCount++
        }

        return hasU && hasL && hasD && specialCount === 1
    }

    const externalQueryActive = computed(() => isValidPlanCodeFrontend(planSearch.value))

    const externalView = computed<ViewPlan | null>(() => {
        if (!externalPlan.value) return null
        return flattenDto(externalPlan.value)
    })

    const openViewPlanInUi = async (view: ViewPlan, toastMsg?: string) => {
        selectedPlan.value = {
            ...view,
            exercises: Array.isArray(view.exercises) ? view.exercises.map(x => ({ ...x })) : [],
        }
        rowHeights.value = Array(selectedPlan.value.exercises.length).fill(40)
        columnWidths.value = [50, 25, 25]
        if (toastMsg) props.addToast(toastMsg, 'load')
        await scrollToSelectedPlan()
    }

    const fetchExternalPlan = async (code: string) => {
        externalLoading.value = true
        externalError.value = null
        externalPlan.value = null

        try {
            const dto = await getTrainingPlanByCode(code.trim())
            externalPlan.value = dto

            // ✅ direkt im UI anzeigen (ohne Install)
            const view = flattenDto(dto)
            await openViewPlanInUi(view, "Externer Plan geöffnet")
        } catch (e: any) {
            const status = e?.response?.status ?? e?.status
            if (status === 404) {
                externalError.value = null
                externalPlan.value = null
            } else if (status === 400) {
                externalError.value = "Ungültiger Code."
            } else {
                externalError.value = "Externer Plan konnte nicht geladen werden."
            }
        } finally {
            externalLoading.value = false
        }
    }

    watch(planSearch, (val) => {
        if (externalT) window.clearTimeout(externalT)

        // Nur triggern wenn es wie ein Code aussieht
        if (!isValidPlanCodeFrontend(val)) {
            externalPlan.value = null
            externalError.value = null
            externalLoading.value = false
            return
        }

        externalT = window.setTimeout(() => {
            fetchExternalPlan(val)
        }, 350)
    })

    const installExternalPlan = async () => {
        const code = planSearch.value.trim()
        if (!isValidPlanCodeFrontend(code)) return

        if (!auth.user) {
            props.addToast("Zum Installieren musst du eingeloggt sein", "delete")
            return
        }

        try {
            const created = await installTrainingPlanByCode(code)

            // Liste refreshen, damit es direkt in "Deine Trainingspläne" auftaucht
            await trainingPlansStore.loadList()

            props.addToast("Plan installiert ✅", "add")

            // optional: direkt öffnen
            await loadPlan(created.id)

            // Suchfeld leeren (damit externe Card weg ist)
            planSearch.value = ""
        } catch (e: any) {
            const msg = e?.response?.data?.message ?? e?.message ?? null
            props.addToast(msg || "Installieren fehlgeschlagen", "delete")
        }
    }

    const selectedPlan = ref<ViewPlan | null>(null)
    const selectedPlanRoot = ref<HTMLElement | null>(null)

    const showCustomExercises = ref(false)

    // ✅ Quelle der Wahrheit: Parent
    const customExercises = computed(() => props.customExercises ?? [])

    /* -------------------- Plans + Favoriten -------------------- */
    const plans = computed<ViewPlan[]>(() => {
        if (!auth.user) return (props.guestPlans ?? [])
        return trainingPlansStore.items.map(flattenDto)
    })

    const favoritePlans = computed<string[]>(() => {
        if (!auth.user) return []

        const items = trainingPlansStore.items as TrainingPlanDto[]
        const favIds = new Set(items.filter(p => !!p.isFavorite).map(p => p.id))
        const order = readFavOrder().filter(id => favIds.has(id))
        const missing = Array.from(favIds).filter(id => !order.includes(id))
        return [...order, ...missing]
    })

    watch(favoritePlans, (ids) => {
        if (!auth.user) return
        writeFavOrder(ids)
    }, { immediate: true })

    /* -------------------- Draggable / Mobile -------------------- */
    const isMobile = ref(false)
    const dragDelay = computed(() => 0)
    const dragFilter =
        '.inline-actions, .inline-actions *, .kebab-wrap, .kebab-wrap *, button, select, input, textarea, a'

    let mq: MediaQueryList | null = null
    const onMedia = (e: MediaQueryListEvent | MediaQueryList) => {
        // @ts-ignore (legacy types)
        isMobile.value = !!e.matches
    }

    /* -------------------- Plan Menü -------------------- */
    const planMenuOpenId = ref<string | null>(null)

    const togglePlanMenu = (id: string) => {
        planMenuOpenId.value = (planMenuOpenId.value === id) ? null : id
    }

    const closePlanMenu = () => { planMenuOpenId.value = null }

    const onDocClick = (e: MouseEvent) => {
        const el = e.target as HTMLElement | null
        if (!el) return
        if (el.closest('.plan-menu') || el.closest('.kebab-wrap')) return
        if (el.closest('.toast') || el.closest('.toast-container') || el.closest('[data-toast-root]')) return
        closePlanMenu()
    }

    watch(planSearch, () => closePlanMenu())

    /* -------------------- Computeds für Drag-Listen -------------------- */
    const favoritePlanItems = computed<ViewPlan[]>({
        get() {
            const map = new Map(plans.value.map(p => [p.id, p]))
            return favoritePlans.value.map(id => map.get(id)).filter(Boolean) as ViewPlan[]
        },
        set(newArr) {
            if (!canUseLocalStorage()) return
            writeFavOrder(newArr.map(p => p.id))
        }
    })

    const otherPlanItems = computed<ViewPlan[]>({
        get() {
            const fav = new Set(favoritePlans.value)
            return plans.value.filter(p => !fav.has(p.id))
        },
        set(_) { }
    })

    const planMatchesSearch = (plan: ViewPlan) => {
        const q = planSearch.value.toLowerCase().trim()
        return !q
            || plan.name.toLowerCase().includes(q)
            || plan.exercises.some(ex => (ex.goal ?? '').toLowerCase().includes(q))
    }
    const onPlanCardClick = (e: MouseEvent, planId: string) => {
        const el = e.target as HTMLElement | null
        if (!el) return

        // Nicht öffnen, wenn User auf interaktive Elemente klickt
        if (el.closest('.plan-drag-handle')) return
        if (el.closest('.plan-menu')) return
        if (el.closest('.kebab-wrap')) return
        if (el.closest('.inline-actions')) return
        if (el.closest('button, a, input, textarea, select')) return

        loadPlan(planId)
    }


    const isPlanScrollHighlight = ref(false)

    const scrollToSelectedPlan = async () => {
        await nextTick()

        const el = selectedPlanRoot.value
        if (!el) return

        el.scrollIntoView({ behavior: 'smooth', block: 'center' })

        // mini highlight / umrandung für feedback
        isPlanScrollHighlight.value = true
        window.setTimeout(() => { isPlanScrollHighlight.value = false }, 900)
    }
    /* -------------------- Actions (Account + Gast) -------------------- */
    const loadPlan = async (planId: string) => {
        closePlanMenu()

        // Gast
        if (!auth.user) {
            const gp = (props.guestPlans ?? []).find(p => p.id === planId)
            if (!gp) { props.addToast('Plan nicht gefunden', 'delete'); return }

            selectedPlan.value = {
                ...gp,
                exercises: Array.isArray(gp.exercises) ? gp.exercises.map(x => ({ ...x })) : [],
            }
            rowHeights.value = Array(selectedPlan.value.exercises.length).fill(40)
            columnWidths.value = [50, 25, 25]
            props.addToast('Plan geladen', 'load')
            await scrollToSelectedPlan()
            return
        }

        // Account
        try {
            // 1) Erst lokal aus items (schnell)
            let dto = getAccountPlanDto(planId)

            // ✅ Light-vs-Full check: items sind oft ohne days/exercises → dann ist Tabelle leer
            const hasAnyExercises = (p: any) =>
                Array.isArray(p?.days) &&
                p.days.some((d: any) => Array.isArray(d?.exercises) && d.exercises.length > 0)

            // 2) Wenn dto fehlt ODER dto "light" ist → IMMER Full-Plan nachladen
            if (!dto || !hasAnyExercises(dto)) {
                await trainingPlansStore.loadOne(planId)
                dto =
                    (trainingPlansStore.selected as any) ??
                    getAccountPlanDto(planId) ??
                    null
            }

            if (!dto) { props.addToast('Plan nicht gefunden', 'delete'); return }

            // selected MUSS Full sein (sonst später wieder leer/buggy)
            setStoreSelectedPlan(dto)

            selectedPlan.value = flattenDto(dto)
            rowHeights.value = Array(selectedPlan.value.exercises.length).fill(40)
            columnWidths.value = [50, 25, 25]
            props.addToast('Plan geladen', 'load')
            await scrollToSelectedPlan()
        } catch {
            props.addToast('Plan konnte nicht geladen werden', 'delete')
        }
    }

    const closePlan = () => {
        closePlanMenu()
        selectedPlan.value = null
        columnWidths.value = [50, 25, 25]
        rowHeights.value = []
        props.addToast('Plan geschlossen', 'load')
    }

    const getAccountPlanDto = (planId: string) => {
        const items = (trainingPlansStore.items ?? []) as TrainingPlanDto[]
        return items.find(p => p.id === planId) ?? null
    }

    const setStoreSelectedPlan = (dto: TrainingPlanDto | null) => {
        try { (trainingPlansStore as any).selected = dto } catch { }
    }

    const editPlan = async (planId: string) => {
        if (!auth.user) {
            if (!props.onGuestEditPlan) {
                props.addToast('Guest-Edit fehlt: onGuestEditPlan', 'delete')
                return
            }
            props.onGuestEditPlan(planId)
            return
        }

        try {
            // Beim Edit IMMER Full-Plan laden (items sind oft nur "light")
            await trainingPlansStore.loadOne(planId)

            const dtoFull =
                (trainingPlansStore.selected as any) ??
                getAccountPlanDto(planId) ??
                null

            if (!dtoFull) { props.addToast('Plan nicht gefunden', 'delete'); return }

            // selected MUSS Full sein, sonst knallt Validation
            setStoreSelectedPlan(dtoFull)

            props.openEditPopup('planName', planId)
            props.addToast('Plan wird bearbeitet', 'save')
        } catch {
            props.addToast('Plan konnte nicht geladen werden', 'delete')
        }
    }

    const deletePlan = async (planId: string) => {
        if (!auth.user) {
            if (!props.onGuestDeletePlan) {
                props.addToast('Guest-Delete fehlt: onGuestDeletePlan', 'delete')
                return
            }

            props.openDeletePopup(() => {
                props.onGuestDeletePlan?.(planId)
                if (selectedPlan.value?.id === planId) closePlan()
                props.addToast('Trainingsplan gelöscht', 'delete')
            })
            return
        }
        try {
            await trainingPlansStore.remove(planId)
            writeFavOrder(readFavOrder().filter(id => id !== planId))
            if (selectedPlan.value?.id === planId) closePlan()
            props.addToast('Trainingsplan gelöscht', 'delete')
        } catch (e: any) {
            props.addToast(e?.message ?? 'Löschen fehlgeschlagen', 'delete')
        }
    }

    const toggleFavoritePlan = async (planId: string) => {
        // Favoriten sind Account-only bei dir (LS + Store). Als Gast: nix.
        if (!auth.user) return

        const p = (trainingPlansStore.items as TrainingPlanDto[]).find(x => x.id === planId)
        if (!p) return

        const nextFav = !p.isFavorite
        await trainingPlansStore.toggleFavorite(planId)

        const order = readFavOrder().filter(id => id !== planId)
        if (nextFav) order.unshift(planId)
        writeFavOrder(order)

        props.addToast(
            nextFav ? 'Plan zu Favoriten hinzugefügt' : 'Plan aus Favoriten entfernt',
            nextFav ? 'add' : 'delete'
        )
    }

    /* -------------------- Custom Exercises (nur UI) -------------------- */
    const toggleCustomExercises = () => {
        showCustomExercises.value = !showCustomExercises.value
    }

    const removeCustomExercise = (index: number) => {
        if (!props.onRemoveCustomExercise) {
            props.addToast('Remove fehlt: onRemoveCustomExercise', 'delete')
            return
        }

        props.openDeletePopup(() => {
            props.onRemoveCustomExercise?.(index)
            if ((props.customExercises?.length ?? 0) <= 1) showCustomExercises.value = false
            props.addToast('Benutzerdefinierte Übung gelöscht', 'delete')
        })
    }

    /* -------------------- Resizable Tables (selected plan + custom) -------------------- */
    const columnWidths = ref([50, 25, 25])
    const rowHeights = ref<number[]>([])
    const resizeTable = ref<HTMLTableElement | null>(null)

    const customColWidths = ref([40, 30, 15, 15])
    const customResizeTable = ref<HTMLTableElement | null>(null)

    let headerRO: ResizeObserver | null = null

    function applyHeaderState(th: HTMLElement) {
        const label = th.querySelector('.th-label') as HTMLElement | null
        if (!label) return
        const w = th.clientWidth
        label.classList.remove('is-full', 'is-mid', 'is-short')
        const SHORT = 80
        const MID = 120
        if (w <= SHORT) label.classList.add('is-short')
        else if (w <= MID) label.classList.add('is-mid')
        else label.classList.add('is-full')
    }

    function setupHeaderShorteningFallback() {
        headerRO?.disconnect()
        headerRO = new ResizeObserver((entries) => {
            entries.forEach(entry => applyHeaderState(entry.target as HTMLElement))
        })

        const ths = Array.from(document.querySelectorAll('th.th-wdh, th.th-muskel')) as HTMLElement[]
        ths.forEach(th => {
            applyHeaderState(th)
            headerRO?.observe(th)
        })
    }

    function teardownHeaderShorteningFallback() {
        headerRO?.disconnect()
        headerRO = null
    }

    function normalizeStrictTo100(
        widthsPct: number[],
        tableEl: HTMLTableElement,
        minPxByCol: number[],
        preferGiveBackIndex: number
    ) {
        const tw = tableEl.getBoundingClientRect().width || 1
        const minPct = minPxByCol.map(px => +(px / tw * 100).toFixed(4))

        const clamped = widthsPct.map((v, i) => Math.max(minPct[i] ?? 0, +v))

        let sum = +clamped.reduce((a, b) => a + b, 0).toFixed(4)
        const diff = +(100 - sum).toFixed(4)

        if (Math.abs(diff) > 0.0001) {
            const idx = Math.min(Math.max(preferGiveBackIndex, 0), clamped.length - 1)
            clamped[idx] = Math.max(minPct[idx] ?? 0, +(clamped[idx] + diff).toFixed(4))
        }
        return clamped
    }

    const initResizeTable = () => {
        const table = resizeTable.value
        if (!table) return

        table.querySelectorAll('.resizer,.row-resizer').forEach(el => el.remove())

        const MIN_PX_BY_COL = [16, 16, 16]
        const ths = Array.from(table.querySelectorAll('thead th')) as HTMLElement[]
        const lastIdx = ths.length - 1

        ths.forEach((th, colIndex) => {
            th.style.position = 'relative'
            const isLast = colIndex === lastIdx

            const makeResizer = (side: 'right' | 'left') => {
                const resizer = document.createElement('div')
                resizer.className = `resizer resizer-${side}`
                th.appendChild(resizer)

                if (side === 'right') { resizer.style.right = '0'; resizer.style.left = 'auto' }
                else { resizer.style.left = '0'; resizer.style.right = 'auto' }

                let startX = 0
                let start = [...columnWidths.value]

                const onMove = (e: PointerEvent) => {
                    requestAnimationFrame(() => {
                        const tw = table.getBoundingClientRect().width || 1
                        const raw = e.clientX - startX
                        const dir = (isLast && side === 'left') ? -1 : 1
                        const dxRaw = dir * raw

                        const partnerIndex = isLast ? colIndex - 1 : colIndex + 1
                        if (partnerIndex < 0 || partnerIndex >= start.length) return

                        const currPx = (start[colIndex] / 100) * tw
                        const partnerPx = (start[partnerIndex] / 100) * tw

                        const minCurr = MIN_PX_BY_COL[colIndex] ?? 16
                        const minPartner = MIN_PX_BY_COL[partnerIndex] ?? 16

                        const maxDxRight = partnerPx - minPartner
                        const maxDxLeft = -(currPx - minCurr)
                        const dx = Math.max(maxDxLeft, Math.min(dxRaw, maxDxRight))

                        const newCurrPx = currPx + dx
                        const newPartnerPx = partnerPx - dx

                        const next = [...start]
                        next[colIndex] = +(newCurrPx / tw * 100).toFixed(4)
                        next[partnerIndex] = +(newPartnerPx / tw * 100).toFixed(4)

                        columnWidths.value = normalizeStrictTo100(next, table, MIN_PX_BY_COL, partnerIndex)
                    })
                }

                const onUp = (e: PointerEvent) => {
                    window.removeEventListener('pointermove', onMove)
                    window.removeEventListener('pointerup', onUp)
                    resizer.classList.remove('is-active')
                    document.body.classList.remove('is-resizing-col')
                    try { (resizer as any).releasePointerCapture?.(e.pointerId) } catch { }
                }

                const onDown = (e: PointerEvent) => {
                    e.preventDefault(); e.stopPropagation()
                    startX = e.clientX
                    start = [...columnWidths.value]
                    try { (resizer as any).setPointerCapture?.(e.pointerId) } catch { }
                    resizer.classList.add('is-active')
                    document.body.classList.add('is-resizing-col')
                    window.addEventListener('pointermove', onMove)
                    window.addEventListener('pointerup', onUp)
                }

                resizer.addEventListener('pointerdown', onDown)
            }

            if (isLast) { makeResizer('left'); makeResizer('right') }
            else { makeResizer('right') }
        })

        // row resize
        const rows = Array.from(table.querySelectorAll('tbody tr.resizable-row')) as HTMLElement[]
        rows.forEach((row, rowIndex) => {
            row.style.position = 'relative'
            const r = document.createElement('div')
            r.className = 'row-resizer'
            Object.assign(r.style, {
                position: 'absolute', left: '0', bottom: '-4px', width: '100%', height: '10px',
                cursor: 'row-resize', zIndex: '3', background: 'transparent',
            })
            row.appendChild(r)

            let startY = 0
            let startH = rowHeights.value[rowIndex] || row.getBoundingClientRect().height

            const onMove = (e: MouseEvent) => {
                requestAnimationFrame(() => {
                    const dy = e.pageY - startY
                    const minH = 28
                    rowHeights.value[rowIndex] = Math.max(minH, Math.round(startH + dy))
                })
            }
            const onUp = () => {
                document.removeEventListener('mousemove', onMove)
                document.removeEventListener('mouseup', onUp)
                r.classList.remove('is-active')
                document.body.classList.remove('is-resizing-row')
            }
            const onDown = (e: MouseEvent) => {
                e.preventDefault()
                startY = e.pageY
                startH = rowHeights.value[rowIndex] || row.getBoundingClientRect().height
                r.classList.add('is-active')
                document.body.classList.add('is-resizing-row')
                document.addEventListener('mousemove', onMove)
                document.addEventListener('mouseup', onUp)
            }
            r.addEventListener('mousedown', onDown)
        })
    }

    const initCustomResizeTable = () => {
        const table = customResizeTable.value
        if (!table) return

        table.querySelectorAll('.resizer').forEach(el => el.remove())

        const MIN_PX_BY_COL = [16, 16, 16, 44]
        const ths = Array.from(table.querySelectorAll('thead th')) as HTMLElement[]
        const lastIdx = ths.length - 1

        ths.forEach((th, colIndex) => {
            th.style.position = 'relative'
            const isLast = colIndex === lastIdx

            const makeResizer = (side: 'right' | 'left') => {
                const resizer = document.createElement('div')
                resizer.className = `resizer resizer-${side}`
                th.appendChild(resizer)
                if (side === 'right') { resizer.style.right = '0'; resizer.style.left = 'auto' }
                else { resizer.style.left = '0'; resizer.style.right = 'auto' }

                let startX = 0
                let start = [...customColWidths.value]

                const onMove = (e: PointerEvent) => {
                    requestAnimationFrame(() => {
                        const tw = table.getBoundingClientRect().width || 1
                        const raw = e.clientX - startX
                        const dir = (isLast && side === 'left') ? -1 : 1
                        const dxRaw = dir * raw

                        const partnerIndex = isLast ? colIndex - 1 : colIndex + 1
                        if (partnerIndex < 0 || partnerIndex >= start.length) return

                        const currPx = (start[colIndex] / 100) * tw
                        const partnerPx = (start[partnerIndex] / 100) * tw

                        const minCurr = MIN_PX_BY_COL[colIndex] ?? 16
                        const minPartner = MIN_PX_BY_COL[partnerIndex] ?? 16

                        const maxDxRight = partnerPx - minPartner
                        const maxDxLeft = -(currPx - minCurr)
                        const dx = Math.max(maxDxLeft, Math.min(dxRaw, maxDxRight))

                        const newCurrPx = currPx + dx
                        const newPartnerPx = partnerPx - dx

                        const next = [...start]
                        next[colIndex] = +(newCurrPx / tw * 100).toFixed(4)
                        next[partnerIndex] = +(newPartnerPx / tw * 100).toFixed(4)

                        customColWidths.value = normalizeStrictTo100(next, table, MIN_PX_BY_COL, partnerIndex)
                    })
                }

                const onUp = (e: PointerEvent) => {
                    window.removeEventListener('pointermove', onMove)
                    window.removeEventListener('pointerup', onUp)
                    resizer.classList.remove('is-active')
                    document.body.classList.remove('is-resizing-col')
                    try { (resizer as any).releasePointerCapture?.(e.pointerId) } catch { }
                }

                const onDown = (e: PointerEvent) => {
                    e.preventDefault(); e.stopPropagation()
                    startX = e.clientX
                    start = [...customColWidths.value]
                    try { (resizer as any).setPointerCapture?.(e.pointerId) } catch { }
                    resizer.classList.add('is-active')
                    document.body.classList.add('is-resizing-col')
                    window.addEventListener('pointermove', onMove)
                    window.addEventListener('pointerup', onUp)
                }

                resizer.addEventListener('pointerdown', onDown)
            }

            if (isLast) { makeResizer('left'); makeResizer('right') }
            else { makeResizer('right') }
        })
    }

    /* -------------------- Watchers for tables -------------------- */
    watch(selectedPlan, (val) => {
        if (val) {
            nextTick(() => {
                initResizeTable()
                setupHeaderShorteningFallback()
            })
        } else {
            nextTick(() => setupHeaderShorteningFallback())
        }
    })

    watch(showCustomExercises, (val) => {
        if (!val) return
        nextTick(() => {
            initCustomResizeTable()
            setupHeaderShorteningFallback()
        })
    }, { immediate: false })

    watch(customExercises, () => {
        if (!showCustomExercises.value) return
        nextTick(() => {
            initCustomResizeTable()
            setupHeaderShorteningFallback()
        })
    }, { deep: true })

    /* -------------------- Mount / Unmount -------------------- */
    onMounted(() => {
        document.addEventListener('click', onDocClick)

        try {
            const sp = new URLSearchParams(window.location.search)
            const code = (sp.get('code') ?? '').trim()
            if (code && isValidPlanCodeFrontend(code)) {
                // nur setzen -> watch(planSearch) übernimmt fetch (kein Doppel-Call)
                planSearch.value = code
            }
        } catch { }
        if (typeof window !== 'undefined') {
            mq = window.matchMedia('(max-width: 560px)')
            onMedia(mq)
            try { mq.addEventListener('change', onMedia as any) } catch { mq.addListener(onMedia as any) }
        }

        nextTick(() => setupHeaderShorteningFallback())
    })

    onUnmounted(() => {
        document.removeEventListener('click', onDocClick)

        if (mq) {
            try { mq.removeEventListener('change', onMedia as any) } catch { mq.removeListener(onMedia as any) }
        }

        teardownHeaderShorteningFallback()
    })

    defineExpose({
        openPlanForTutorial: (planId: string) => loadPlan(planId),
    })

</script>


<style scoped>
    /* ===== 1:1 aus Training.vue (Plans + SelectedPlan) – inkl. Duplikaten ===== */

    .section-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--text-primary);
        text-align: center;
    }

    html.dark-mode .section-title {
        color: #ffffff;
    }

    .plan-search {
        margin-bottom: 1rem;
    }

    .plan-header {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        align-items: center;
        width: 100%;
        position: relative;
    }

        .plan-header > .section-title {
            grid-column: 2;
            justify-self: center;
            text-align: center;
        }

        .plan-header > :not(.section-title) {
            grid-column: 3;
            justify-self: end;
        }

    .drag-ghost {
        opacity: 0.6;
    }

    /* Zelle wird selbst Container → reagiert auf ihre eigene Breite */
    .v-stack {
        container-type: inline-size;
        white-space: normal;
        word-break: break-word;
        hyphens: auto;
    }

    /* Stelle sicher: mittlere Spalte darf schrumpfen */
    .plan-item > .plan-row1 {
        display: grid !important;
        grid-template-columns: auto minmax(0,1fr) auto;
        align-items: center;
        gap: .5rem;
    }

    /* Titel darf nie wachsen, sondern ellipsen */
    .plan-title {
        display: block;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        -webkit-mask-image: linear-gradient(to right, #000 80%, transparent);
        mask-image: linear-gradient(to right, #000 80%, transparent);
    }

    /* Buttons rechts dürfen nie umbrechen */
    .plan-right {
        display: inline-flex;
        gap: .5rem;
        align-items: center;
        white-space: nowrap;
    }

    .list-item {
        background: var(--bg-card);
        padding: 1rem;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: transform 0.2s;
    }

    html.dark-mode .list-item {
        background: #1c2526;
        color: #c9d1d9;
    }

    .list-item:hover {
        transform: translateY(-2px);
    }

    .plan-item {
        cursor: pointer;
    }

    .plan-title {
        display: inline-flex;
        align-items: center;
        gap: .35rem;
        min-width: 0;
        max-width: 100%;
        -webkit-mask-image: none;
        mask-image: none;
        text-overflow: clip;
    }

        .plan-title .plan-name-scroll {
            display: block;
            flex: 1 1 auto;
            min-width: 0;
            white-space: nowrap;
            overflow-x: auto;
            overflow-y: hidden;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
        }

            .plan-title .plan-name-scroll::-webkit-scrollbar {
                display: none;
            }

        .plan-title .plan-count {
            flex: 0 0 auto;
            white-space: nowrap;
        }

    .plan-drag-stack {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        width: 100%;
    }

        .plan-drag-stack > .plan-item {
            width: 100%;
        }

    html.dark-mode {
        /* in Training.vue war das auf .training, hier bleibt’s absichtlich so wie’s wirkt:
           die vars existieren trotzdem global, aber wir lassen den Block drin für identische Cascade */
    }

    .list-item-actions .action-btn {
        line-height: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }

    /* Karte selbst darf über Nachbarn stehen */
    .plan-item {
        position: relative;
    }

        .plan-item.menu-open {
            z-index: 999;
        }

            .plan-item.menu-open:hover {
                transform: none !important;
            }

    .plan-menu {
        z-index: 1000;
    }

    .exercise-table.full-width th,
    .exercise-table.full-width td {
        padding: 1.5rem;
        text-align: center;
        min-width: 0;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .custom-toggle-btn {
        margin-left: auto;
        margin-right: auto;
    }

    .custom-toggle-arrow {
        width: 1.05rem;
        height: 1.05rem;
        flex: 0 0 auto;
        opacity: .92;
        transform: rotate(0deg);
        transition: transform .18s ease, opacity .18s ease, filter .18s ease;
        filter: drop-shadow(0 1px 0 rgba(0,0,0,.10));
    }

    @supports (mask-image: url("")) or (-webkit-mask-image: url("")) {
        .custom-toggle-arrow {
            background: currentColor;
            -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M6.7 9.3a1 1 0 0 1 1.4 0L12 13.2l3.9-3.9a1 1 0 1 1 1.4 1.4l-4.6 4.6a1 1 0 0 1-1.4 0l-4.6-4.6a1 1 0 0 1 0-1.4z'/%3E%3C/svg%3E");
            -webkit-mask-repeat: no-repeat;
            -webkit-mask-position: center;
            -webkit-mask-size: 100% 100%;
            mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M6.7 9.3a1 1 0 0 1 1.4 0L12 13.2l3.9-3.9a1 1 0 1 1 1.4 1.4l-4.6 4.6a1 1 0 0 1-1.4 0l-4.6-4.6a1 1 0 0 1 0-1.4z'/%3E%3C/svg%3E");
            mask-repeat: no-repeat;
            mask-position: center;
            mask-size: 100% 100%;
        }
    }

    @supports not (mask-image: url("")) and not (-webkit-mask-image: url("")) {
        .custom-toggle-arrow {
            border-right: 2px solid currentColor;
            border-bottom: 2px solid currentColor;
            width: .6rem;
            height: .6rem;
            transform: rotate(45deg);
            filter: none;
        }
    }

    .custom-toggle-btn.on .custom-toggle-arrow {
        transform: rotate(180deg);
        opacity: 1;
    }

    @media (max-width:560px) {
        .plan-item {
            display: flex !important;
        }

        .plan-row1 {
            display: grid;
            grid-template-columns: auto 1fr auto;
            align-items: center;
            gap: .5rem;
            width: 100%;
        }

        .plan-title {
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .plan-right {
            display: inline-flex;
            align-items: center;
            gap: .25rem;
            flex-wrap: nowrap;
        }

        .inline-actions {
            display: inline-flex !important;
            gap: .25rem;
        }

        .kebab-wrap {
            display: none !important;
        }

        .desktop-open {
            display: inline-flex !important;
        }

        .mobile-open, .plan-row2 {
            display: none !important;
        }

        .plan-menu {
            z-index: 1000;
        }
    }

    .plan-scroll-highlight {
        outline: 2px solid color-mix(in srgb, var(--accent-primary) 60%, transparent);
        outline-offset: 6px;
        border-radius: 18px; /* matcht deine card vibes */
        box-shadow: 0 0 0 6px color-mix(in srgb, var(--accent-primary) 12%, transparent);
        transition: outline-color .18s ease, box-shadow .18s ease;
    }

    .plan-title {
        flex: 1 1 auto;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }


    .desktop-open {
        display: inline-flex;
    }

    .mobile-open {
        display: none;
    }

    html.dark-mode .plan-menu {
        border-color: rgba(148, 163, 184, 0.34);
        background: radial-gradient(circle at 18% 30%, color-mix(in srgb, #6366f1 18%, transparent), transparent 62%), radial-gradient(circle at 85% 75%, color-mix(in srgb, #22c55e 12%, transparent), transparent 70%), rgba(2, 6, 23, 0.78);
        box-shadow: 0 22px 60px rgba(0, 0, 0, 0.58), inset 0 1px 0 rgba(255,255,255,0.05);
    }

    .plan-drag-handle {
        cursor: grab;
        margin-right: .5rem;
        user-select: none;
    }

    .plan-row1 > .plan-title {
        flex: 1 1 auto;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .plan-row1 > .inline-actions {
        display: inline-flex;
        gap: .4rem;
    }

    .plan-row1 {
        width: 100%;
        position: relative;
    }

    @media (min-width:1025px) {
        .plan-row1 .inline-actions {
            margin-left: auto;
        }
    }

    .plan-menu {
        position: absolute;
        right: .5rem;
        top: calc(100% + .5rem);
        display: flex;
        gap: .35rem;
        padding: .45rem;
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: 10px;
        box-shadow: 0 6px 18px rgba(0,0,0,.15);
        z-index: 50;
    }

        .plan-menu > * {
            inline-size: auto;
        }

    .plan-item > .plan-row1 {
        display: grid !important;
        grid-template-columns: auto 1fr auto;
        align-items: center;
        width: 100%;
    }

        .plan-item > .plan-row1 .plan-drag-handle {
            grid-column: 1;
        }

        .plan-item > .plan-row1 .plan-title {
            grid-column: 2;
            justify-self: center;
            text-align: center;
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .plan-item > .plan-row1 .plan-right {
            grid-column: 3;
            justify-self: end;
            display: inline-flex;
            align-items: center;
            gap: .5rem;
        }

        .plan-item > .plan-row1 .desktop-open {
            order: 3;
        }

    @media (max-width:1024px) {
        .plan-item > .plan-row1 .inline-actions {
            display: none !important;
        }

        .plan-item > .plan-row1 .desktop-open {
            display: inline-flex !important;
        }
    }

    @media (max-width:560px) {
        .plan-row2, .mobile-open {
            display: none !important;
        }
    }

    .plan-item {
        display: block;
    }

        .plan-item > .plan-row1 {
            display: grid !important;
            grid-template-columns: auto 1fr auto;
            align-items: center;
            width: 100%;
        }

            .plan-item > .plan-row1 .plan-title {
                justify-self: center;
                text-align: center;
                min-width: 0;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .plan-item > .plan-row1 .plan-right {
                justify-self: end;
                display: inline-flex;
                align-items: center;
                gap: .5rem;
            }

    .plan-row2 {
        display: none;
    }

    @media (max-width:560px) {
        .plan-row2 {
            display: block;
        }

        .mobile-open {
            display: inline-flex !important;
        }

        .desktop-open {
            display: none !important;
        }
    }

    .inline-actions {
        display: inline-flex;
        gap: .4rem;
    }


    .list-item.plan-item {
        position: relative;
        padding: 1.35rem 1.6rem;
        border-radius: 18px;
        background: radial-gradient( circle at top left, color-mix(in srgb, var(--accent-primary) 9%, transparent), transparent 55% ), radial-gradient( circle at bottom right, color-mix(in srgb, var(--accent-secondary) 7%, transparent), transparent 60% ), color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
        border: 1px solid rgba(148, 163, 184, 0.26);
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.22);
        display: block;
        transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease, background 0.25s ease;
    }

    @media (hover: hover) {
        .list-item.plan-item:hover {
            transform: translateY(-3px) scale(1.01);
            box-shadow: 0 22px 50px rgba(15, 23, 42, 0.32);
            border-color: rgba(129, 140, 248, 0.55);
        }
    }

    html.dark-mode .list-item.plan-item {
        background: radial-gradient( circle at top left, color-mix(in srgb, #6366f1 14%, transparent), transparent 55% ), radial-gradient( circle at bottom right, color-mix(in srgb, #22c55e 10%, transparent), transparent 60% ), #020617;
        border-color: rgba(148, 163, 184, 0.45);
        box-shadow: 0 22px 55px rgba(0, 0, 0, 0.7);
    }

    .plan-drag-stack .plan-item {
        touch-action: pan-y;
        -webkit-tap-highlight-color: transparent;
        will-change: transform;
    }

    .sortable-chosen {
        user-select: none;
    }

    .sortable-ghost,
    .drag-ghost {
        opacity: .85;
        transform: scale(.98);
    }

    .drag-chosen,
    .dragging,
    .sortable-chosen,
    .sortable-drag,
    .sortable-ghost {
        transition: none !important;
    }

    .sortable-drag {
        opacity: 0.98;
        cursor: grabbing;
        pointer-events: none;
    }

    .drag-ghost,
    .sortable-ghost {
        opacity: .4 !important;
    }

    .plan-drag-stack > *,
    .drag-stack > *,
    .list-item.plan-item {
        will-change: transform;
    }

    .dragging .list-item.plan-item {
        transform: none !important;
    }

    .plan-code-badge {
        margin-left: .5rem;
        padding: .15rem .45rem;
        border-radius: 999px;
        font-size: .8rem;
        opacity: .9;
        border: 1px solid rgba(255,255,255,.18);
        cursor: copy;
        user-select: none;
    }

    .plan-code-copy {
        margin-left: .35rem;
    }

    .plan-header .section-title {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: .35rem;
        min-width: 0;
    }

    .plan-title-main {
        max-width: 100%;
        min-width: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .plan-code-row {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: .35rem;
        white-space: nowrap;
        max-width: 100%;
    }

    /* mehr Luft zwischen Plan-Liste und anderem */
    .plans-section {
        margin-top: 2.25rem;
        margin-bottom: 2.25rem;
    }

    .play-icon {
        width: 30px;
        height: 30px;
        display: block;
        object-fit: contain;
        opacity: .95;
        pointer-events: none; /* klick bleibt auf dem Button */
        filter: drop-shadow(0 1px 2px rgba(0,0,0,.25));
    }

    .inline-actions {
        display: inline-flex;
        gap: .4rem;
    }

    /* HARD ALIGN: alle rechten Controls kriegen exakt gleiche Zeilenhöhe */
    .plan-right {
        align-items: center;
    }

        /* Wichtig: Das trifft FavoriteButton-Root, kebab-wrap, OpenButton-Root, inline-actions-Wrapper */
        .plan-right > * {
            height: 44px;
            display: inline-flex;
            align-items: center;
        }

        /* inline-actions ist ein Wrapper → Höhe hart */
        .plan-right > .inline-actions {
            height: 44px;
            align-items: center;
        }

    /* kebab-wrap Buttons exakt gleiche Clickfläche */
    .kebab-wrap {
        display: inline-flex;
        align-items: center;
        height: 44px;
        gap: .4rem;
    }

        .kebab-wrap button {
            width: 44px;
            height: 44px;
            padding: 0;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            line-height: 1;
        }

        /* ⋯ hängt sonst optisch zu tief */
        .kebab-wrap button {
            font-size: 22px;
        }

            .kebab-wrap button:last-child {
                transform: translateY(-2px);
            }

    /* ADD (only once) – put this as the ONLY max-width:560px block, at the end */
    @media (max-width: 560px) {

        /* ✅ Draggable soll funktionieren -> Handle sichtbar lassen */
        .plan-drag-handle {
            display: inline-flex !important;
        }

        /* ✅ Mobile: wir zeigen Play + Kebab (kebab-wrap), inline-actions weg */
        .inline-actions {
            display: none !important;
        }

        .kebab-wrap {
            display: inline-flex !important;
            align-items: center;
            height: 44px;
            gap: .4rem;
        }

        /* ✅ Layout stabil und nicht 5x anders */
        .plan-item {
            position: relative;
            display: block !important;
        }

        .plan-row1 {
            display: grid !important;
            grid-template-columns: auto minmax(0, 1fr) auto;
            align-items: center;
            gap: .5rem;
            width: 100%;
            position: relative;
        }

        .plan-title {
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .plan-right {
            display: inline-flex;
            align-items: center;
            gap: .35rem;
            flex-wrap: nowrap;
            white-space: nowrap;
        }

        /* ✅ PlanMenu muss auf Mobile sauber drüber liegen */
        .plan-menu {
            position: absolute;
            right: .5rem;
            top: calc(100% + .55rem);
            display: flex;
            gap: .35rem;
            padding: .5rem;
            border-radius: 14px;
            border: 1px solid rgba(148, 163, 184, 0.28);
            background: radial-gradient(circle at 18% 30%, color-mix(in srgb, var(--accent-primary) 16%, transparent), transparent 62%), radial-gradient(circle at 85% 75%, color-mix(in srgb, var(--accent-secondary) 12%, transparent), transparent 70%), color-mix(in srgb, var(--bg-card) 88%, white 12%);
            box-shadow: 0 18px 44px rgba(15, 23, 42, 0.22), inset 0 1px 0 rgba(255,255,255,0.08);
            backdrop-filter: blur(14px);
            -webkit-backdrop-filter: blur(14px);
            z-index: 1200;
        }

        html.dark-mode .plan-menu {
            border-color: rgba(148, 163, 184, 0.34);
            background: radial-gradient(circle at 18% 30%, color-mix(in srgb, #6366f1 18%, transparent), transparent 62%), radial-gradient(circle at 85% 75%, color-mix(in srgb, #22c55e 12%, transparent), transparent 70%), rgba(2, 6, 23, 0.78);
            box-shadow: 0 22px 60px rgba(0, 0, 0, 0.58), inset 0 1px 0 rgba(255,255,255,0.05);
        }

        /* ✅ Abstand der Section auf Mobile */
        .plans-section {
            margin-top: 1.75rem;
            margin-bottom: 1.75rem;
        }

        /* ✅ kill leftovers (diese Klassen existieren bei dir, aber sollen mobile nichts tun) */
        .plan-row2,
        .mobile-open {
            display: none !important;
        }

        .desktop-open {
            display: inline-flex !important;
        }

        .kebab-wrap .play-icon {
            transform: translateY(4px);
        }
    }

    /* ===== RESPONSIVE ACTIONS: clean & eindeutig ===== */
    /* ===== RESPONSIVE ACTIONS (final): <=1024 = kebab, >=1025 = inline ===== */
    @media (min-width: 1023px) {
        .inline-actions {
            display: inline-flex !important;
        }

        .kebab-wrap {
            display: none !important;
        }
    }

    @media (max-width: 1024px) {
        .inline-actions {
            display: none !important;
        }

        .kebab-wrap {
            display: inline-flex !important;
        }
    }

    /* Play IMMER ganz rechts */
    .plan-right .play-btn {
        order: 9999;
    }

    .plan-drag-stack--others {
        margin-top: 1.25rem; /* Abstand zwischen Favoriten & Nicht-Favoriten */
    }

    .external-plan-box {
        margin: 12px 0 16px;
        padding: 0;
        border: 0;
        background: transparent;
    }

    .external-plan-card {
        display: flex;
        gap: 14px;
        align-items: center;
        justify-content: space-between;
        padding: 1.05rem 1.25rem;
        border-radius: 18px;
        /* TYG premium card vibe (matcht deine .list-item.plan-item Richtung) */
        background: radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 10%, transparent), transparent 58%), radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 8%, transparent), transparent 62%), color-mix(in srgb, var(--bg-card) 92%, #020617 8%);
        border: 1px solid rgba(148, 163, 184, 0.28);
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.22);
        transition: transform .22s ease, box-shadow .22s ease, border-color .22s ease, background .22s ease;
    }

    @media (hover: hover) {
        .external-plan-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 22px 50px rgba(15, 23, 42, 0.30);
            border-color: rgba(129, 140, 248, 0.55);
        }
    }

    html.dark-mode .external-plan-card {
        background: radial-gradient(circle at top left, color-mix(in srgb, #6366f1 14%, transparent), transparent 58%), radial-gradient(circle at bottom right, color-mix(in srgb, #22c55e 10%, transparent), transparent 62%), #020617;
        border-color: rgba(148, 163, 184, 0.26);
        box-shadow: 0 22px 55px rgba(0, 0, 0, 0.70);
    }

    .external-plan-left {
        min-width: 0;
    }

    .external-plan-title {
        font-size: 0.98rem;
        font-weight: 700;
        color: var(--text-primary);
        letter-spacing: .2px;
    }

    .external-plan-sub {
        margin-top: .2rem;
        font-size: 0.85rem;
        opacity: 0.88;
    }

    .external-plan-hint,
    .external-plan-error {
        padding: .9rem 1.15rem;
        border-radius: 16px;
        border: 1px solid rgba(148, 163, 184, 0.22);
        background: color-mix(in srgb, var(--bg-card) 86%, #020617 14%);
        box-shadow: 0 12px 26px rgba(15, 23, 42, 0.18);
        font-size: 0.85rem;
    }

    .external-plan-error {
        border-color: rgba(239, 68, 68, 0.35);
    }

    .external-plan-actions :deep(button),
    .external-plan-actions button {
        height: 44px;
        padding: 0 .85rem;
        border-radius: 12px;
        /* neutral + clean */
        border: 1px solid rgba(148, 163, 184, 0.20);
        background: color-mix(in srgb, var(--bg-card) 88%, #020617 12%);
        box-shadow: 0 10px 22px rgba(15, 23, 42, 0.14);
        transition: background .15s ease, border-color .15s ease;
    }


    .icon-download--install {
        width: 50px;
        height: 40px;
        display: block;
        pointer-events: none;
        filter: brightness(0) invert(1); /* macht das Icon weiß */
    }

    .install-text {
        margin-left: .45rem;
        font-weight: 700;
    }
</style>