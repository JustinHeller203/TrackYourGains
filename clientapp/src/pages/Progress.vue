<template>
    <div class="progress">
        <!-- ===================== HEADER / INTRO ===================== -->
        <h2 class="page-title">📊 Dein Fortschritt</h2>
        <p class="page-subtext">Alles Wichtige auf einen Blick.</p>

        <div class="dashboard-container">
            <!-- ===================== DASHBOARD-CARDS ===================== -->
            <div class="dashboard-grid">
                <DashboardCard title="Aktuelles Gewicht"
                               :info="currentWeightDisplay"
                               clickable
                               @click="openWeightPopup" />

                <DashboardCard title="Kalorien heute"
                               :info="totalCalories + ' / 2500 kcal'" />

                <DashboardCard title="Letztes Training"
                               :info="lastWorkout || 'Kein Training erfasst'" />

                <DashboardCard title="Zielgewicht"
                               :info="goal ? formatWeight(goal, 1) : 'Kein Ziel gesetzt'"
                               clickable
                               @click="openGoalPopup" />
            </div>

            <!-- ===================== TABS ===================== -->
            <TabsBar v-model:modelValue="activeTab"
                     :searchQuery="searchQuery"
                     :planSearchQuery="planSearchQuery"
                     @update:searchQuery="val => (searchQuery = val)"
                     @update:planSearchQuery="val => (planSearchQuery = val)" />

            <!-- ===================== STATISTIKEN TAB ===================== -->
            <div v-show="activeTab === 'stats'" class="progress-charts">
                <ChartCard title="Gewichtsverlauf"
                           exportable
                           @export="openDownloadPopup('weightStats')"
                           @reset="resetWeightStats">
                    <canvas id="weightChart"></canvas>
                </ChartCard>

                <ChartCard title="Trainingsstatistik"
                           exportable
                           @export="openDownloadPopup('workoutStats')"
                           @reset="resetWorkoutStats">
                    <template #subtitle>
                        <p class="card-info">Gesamt-Workouts: {{ workouts.length }}</p>
                    </template>
                    <canvas id="workoutChart"></canvas>
                </ChartCard>
            </div>

            <!-- ======= FILTER-LEISTE (nur für Rechner) ======= -->
            <div v-show="activeTab === 'calculators'" class="calc-filterbar">
                <label class="calc-filterlabel">Kategorie</label>
                <select v-model="calcCategory" class="calc-filterselect">
                    <option value="alle">Alle</option>
                    <option value="gesundheit">Gesundheit</option>
                    <option value="kraft">Kraft</option>
                    <option value="ernaehrung">Ernährung</option>
                    <option value="alltag">Alltag</option>
                </select>
            </div>

            <!-- ===================== CALCULATORS TAB ===================== -->
            <div v-show="activeTab === 'calculators'" class="calculators-grid">

                <!-- ======= FAVORITEN-BEREICH (oben) ======= -->
                <template v-if="favoriteCalcs.length">
                    <!-- BMI Favorit -->
                    <BmiCalculator v-if="isFavorite('BMI') && matchesCalc('BMI')"
                                   title="BMI-Rechner"
                                   info="Der BMI (Body-Mass-Index) misst das Verhältnis von Gewicht zu Größe."
                                   :unit="unit"
                                   :autoCalcEnabled="autoCalcEnabled"
                                   :bmiGender="bmiGender"
                                   :bmiWeight="bmiWeight"
                                   :bmiHeight="bmiHeight"
                                   :bmiResult="bmiResult"
                                   :isFavorite="true"
                                   @toggleFavorite="() => toggleFavorite('BMI')"
                                   @update:bmiGender="val => (bmiGender = val)"
                                   @update:bmiWeight="val => (bmiWeight = val)"
                                   @update:bmiHeight="val => (bmiHeight = val)"
                                   @calculate="calculateBMI"
                                   @copy="copyBMI"
                                   @export="openDownloadPopup('bmi')"
                                   @reset="resetCalculator('bmi')" />

                    <!-- Kalorien Favorit -->
                    <CaloriesCalculator v-if="isFavorite('Kalorienbedarf') && matchesCalc('Kalorienbedarf')"
                                        :unit="unit"
                                        :autoCalcEnabled="autoCalcEnabled"
                                        :calorieAge="calorieAge"
                                        :calorieGender="calorieGender"
                                        :calorieWeight="calorieWeight"
                                        :calorieHeight="calorieHeight"
                                        :calorieActivity="calorieActivity"
                                        :calorieGoal="calorieGoal"
                                        :calorieResult="calorieResult"
                                        :isFavorite="true"
                                        @toggleFavorite="() => toggleFavorite('Kalorienbedarf')"
                                        @update:calorieAge="v => calorieAge = v"
                                        @update:calorieGender="v => calorieGender = v"
                                        @update:calorieWeight="v => calorieWeight = v"
                                        @update:calorieHeight="v => calorieHeight = v"
                                        @update:calorieActivity="v => calorieActivity = v"
                                        @update:calorieGoal="v => calorieGoal = v"
                                        @calculate="calculateCalories"
                                        @copy="copyCalories"
                                        @export="openDownloadPopup('calories')"
                                        @reset="resetCalculator('calories')" />
                    <!-- Protein Favorit -->
                    <ProteinCalculator v-if="isFavorite('Proteinbedarf') && matchesCalc('Proteinbedarf')"
                                       :unit="unit"
                                       :autoCalcEnabled="autoCalcEnabled"
                                       :proteinWeight="proteinWeight"
                                       :proteinGoal="proteinGoal"
                                       :proteinActivity="proteinActivity"
                                       :proteinMeals="proteinMeals"
                                       :proteinResult="proteinResult"
                                       :isFavorite="true"
                                       @toggleFavorite="() => toggleFavorite('Proteinbedarf')"
                                       @update:proteinWeight="v => proteinWeight = v"
                                       @update:proteinGoal="v => proteinGoal = v"
                                       @update:proteinActivity="v => proteinActivity = v"
                                       @update:proteinMeals="v => proteinMeals = v"
                                       @calculate="calculateProtein"
                                       @copy="copyProtein"
                                       @export="openDownloadPopup('protein')"
                                       @reset="resetCalculator('protein')" />

                    <!-- 1RM Favorit -->
                    <OneRmCalculator v-if="isFavorite('1RM') && matchesCalc('1RM')"
                                     :unit="unit"
                                     :autoCalcEnabled="autoCalcEnabled"
                                     :oneRmExercise="oneRmExercise"
                                     :oneRmWeight="oneRmWeight"
                                     :oneRmReps="oneRmReps"
                                     :oneRmResult="oneRmResult"
                                     :isFavorite="true"
                                     :formattedResult="oneRmResult !== null ? formatWeight(oneRmResult, 1) : ''"
                                     @toggleFavorite="() => toggleFavorite('1RM')"
                                     @update:oneRmExercise="v => oneRmExercise = v"
                                     @update:oneRmWeight="v => oneRmWeight = v"
                                     @update:oneRmReps="v => oneRmReps = v"
                                     @calculate="calculateOneRm"
                                     @copy="copyOneRm"
                                     @export="openDownloadPopup('oneRm')"
                                     @reset="resetCalculator('oneRm')" />

                    <!-- Körperfett Favorit -->
                    <BodyFatCalculator v-if="isFavorite('Körperfett') && matchesCalc('Körperfett')"
                                       :autoCalcEnabled="autoCalcEnabled"
                                       :bodyFatGender="bodyFatGender"
                                       :bodyFatWaist="bodyFatWaist"
                                       :bodyFatNeck="bodyFatNeck"
                                       :bodyFatHip="bodyFatHip"
                                       :bodyFatHeight="bodyFatHeight"
                                       :bodyFatResult="bodyFatResult"
                                       :isFavorite="true"
                                       @toggleFavorite="() => toggleFavorite('Körperfett')"
                                       @update:bodyFatGender="v => bodyFatGender = v"
                                       @update:bodyFatWaist="v => bodyFatWaist = v"
                                       @update:bodyFatNeck="v => bodyFatNeck = v"
                                       @update:bodyFatHip="v => bodyFatHip = v"
                                       @update:bodyFatHeight="v => bodyFatHeight = v"
                                       @calculate="calculateBodyFat"
                                       @copy="copyBodyFat"
                                       @export="openDownloadPopup('bodyFat')"
                                       @reset="resetCalculator('bodyFat')" />

                    <!-- Koffein Favorit -->
                    <CaffeineSafeDoseCalculator v-if="isFavorite('Koffein') && matchesCalc('Koffein')"
                                                :unit="unit"
                                                :autoCalcEnabled="autoCalcEnabled"
                                                :cafWeight="cafWeight"
                                                :cafSensitivity="cafSensitivity"
                                                :cafStatus="cafStatus"
                                                :cafResult="cafResult"
                                                :isFavorite="true"
                                                @toggleFavorite="() => toggleFavorite('Koffein')"
                                                @update:cafWeight="v => cafWeight = v"
                                                @update:cafSensitivity="v => cafSensitivity = v"
                                                @update:cafStatus="v => cafStatus = v"
                                                @calculate="calculateCaffeine"
                                                @copy="copyCaffeine"
                                                @export="openDownloadPopup('caffeine')"
                                                @reset="resetCalculator('caffeine')" />

                    <!-- FFMI Favorit -->
                    <FfmiCalculator v-if="isFavorite('FFMI') && matchesCalc('FFMI')"
                                    :unit="unit"
                                    :autoCalcEnabled="autoCalcEnabled"
                                    :ffmiWeight="ffmiWeight"
                                    :ffmiHeight="ffmiHeight"
                                    :ffmiBodyFat="ffmiBodyFat"
                                    :ffmiResult="ffmiResult"
                                    :isFavorite="true"
                                    @toggleFavorite="() => toggleFavorite('FFMI')"
                                    @update:ffmiWeight="v => ffmiWeight = v"
                                    @update:ffmiHeight="v => ffmiHeight = v"
                                    @update:ffmiBodyFat="v => ffmiBodyFat = v"
                                    @calculate="calculateFFMI"
                                    @copy="copyFFMI"
                                    @export="openDownloadPopup('ffmi')"
                                    @reset="resetCalculator('ffmi')" />
                    <!-- GL Favorit -->
                    <GlycemicLoadCalculator v-if="isFavorite('Glykämische Last') && matchesCalc('Glykämische Last')"
                                            :autoCalcEnabled="autoCalcEnabled"
                                            :glFood="glFood"
                                            :glServing="glServing"
                                            :glCarbs100="glCarbs100"
                                            :glGi="glGi"
                                            :glResult="glResult"
                                            :isFavorite="true"
                                            @toggleFavorite="() => toggleFavorite('Glykämische Last')"
                                            @update:glFood="v => glFood = v"
                                            @update:glServing="v => glServing = v"
                                            @update:glCarbs100="v => glCarbs100 = v"
                                            @update:glGi="v => glGi = v"
                                            @calculate="calculateGlyLoad"
                                            @copy="copyGlyLoad"
                                            @export="openDownloadPopup('glyload')"
                                            @reset="resetCalculator('glyload')" />

                    <!-- Wasser Favorit -->
                    <WaterCalculator v-if="isFavorite('Wasserbedarf') && matchesCalc('Wasserbedarf')"
                                     :unit="unit"
                                     :autoCalcEnabled="autoCalcEnabled"
                                     :waterWeight="waterWeight"
                                     :waterActivity="waterActivity"
                                     :waterClimate="waterClimate"
                                     :waterResult="waterResult"
                                     :isFavorite="true"
                                     @toggleFavorite="() => toggleFavorite('Wasserbedarf')"
                                     @update:waterWeight="v => waterWeight = v"
                                     @update:waterActivity="v => waterActivity = v"
                                     @update:waterClimate="v => waterClimate = v"
                                     @calculate="calculateWater"
                                     @copy="copyWater"
                                     @export="openDownloadPopup('water')"
                                     @reset="resetCalculator('water')" />
                </template>


                <!-- ======= STANDARD-BEREICH (ohne Favoriten-Duplikate) ======= -->
                <BmiCalculator v-if="!isFavorite('BMI') && matchesCalc('BMI')"
                               title="BMI-Rechner"
                               info="Der BMI (Body-Mass-Index) misst das Verhältnis von Gewicht zu Größe."
                               :unit="unit"
                               :autoCalcEnabled="autoCalcEnabled"
                               :bmiGender="bmiGender"
                               :bmiWeight="bmiWeight"
                               :bmiHeight="bmiHeight"
                               :bmiResult="bmiResult"
                               :isFavorite="isFavorite('BMI')"
                               @toggleFavorite="() => toggleFavorite('BMI')"
                               @update:bmiGender="val => (bmiGender = val)"
                               @update:bmiWeight="val => (bmiWeight = val)"
                               @update:bmiHeight="val => (bmiHeight = val)"
                               @calculate="calculateBMI"
                               @copy="copyBMI"
                               @export="openDownloadPopup('bmi')"
                               @reset="resetCalculator('bmi')" />

                <!-- ========== Kalorienbedarfsrechner ========== -->
                <CaloriesCalculator v-if="matchesCalc('Kalorienbedarf') && !isFavorite('Kalorienbedarf')"
                                    :unit="unit"
                                    :autoCalcEnabled="autoCalcEnabled"
                                    :calorieAge="calorieAge"
                                    :calorieGender="calorieGender"
                                    :calorieWeight="calorieWeight"
                                    :calorieHeight="calorieHeight"
                                    :calorieActivity="calorieActivity"
                                    :calorieGoal="calorieGoal"
                                    :calorieResult="calorieResult"
                                    :isFavorite="isFavorite('Kalorienbedarf')"
                                    @toggleFavorite="() => toggleFavorite('Kalorienbedarf')"
                                    @update:calorieAge="v => calorieAge = v"
                                    @update:calorieGender="v => calorieGender = v"
                                    @update:calorieWeight="v => calorieWeight = v"
                                    @update:calorieHeight="v => calorieHeight = v"
                                    @update:calorieActivity="v => calorieActivity = v"
                                    @update:calorieGoal="v => calorieGoal = v"
                                    @calculate="calculateCalories"
                                    @copy="copyCalories"
                                    @export="openDownloadPopup('calories')"
                                    @reset="resetCalculator('calories')" />

                <ProteinCalculator v-if="matchesCalc('Proteinbedarf') && !isFavorite('Proteinbedarf')"
                                   :unit="unit"
                                   :autoCalcEnabled="autoCalcEnabled"
                                   :proteinWeight="proteinWeight"
                                   :proteinGoal="proteinGoal"
                                   :proteinActivity="proteinActivity"
                                   :proteinMeals="proteinMeals"
                                   :proteinResult="proteinResult"
                                   :isFavorite="isFavorite('Proteinbedarf')"
                                   @toggleFavorite="() => toggleFavorite('Proteinbedarf')"
                                   @update:proteinWeight="v => proteinWeight = v"
                                   @update:proteinActivity="v => proteinActivity = v"
                                   @update:proteinMeals="v => proteinMeals = v"
                                   @update:proteinGoal="v => proteinGoal = v"
                                   @calculate="calculateProtein"
                                   @copy="copyProtein"
                                   @export="openDownloadPopup('protein')"
                                   @reset="resetCalculator('protein')" />

                <!-- ========== 1RM Rechner ========== -->
                <OneRmCalculator v-if="matchesCalc('1RM') && !isFavorite('1RM')"
                                 :unit="unit"
                                 :autoCalcEnabled="autoCalcEnabled"
                                 :oneRmExercise="oneRmExercise"
                                 :oneRmWeight="oneRmWeight"
                                 :oneRmReps="oneRmReps"
                                 :oneRmResult="oneRmResult"
                                 :isFavorite="isFavorite('1RM')"
                                 :formattedResult="oneRmResult !== null ? formatWeight(oneRmResult, 1) : ''"
                                 @toggleFavorite="() => toggleFavorite('1RM')"
                                 @update:oneRmExercise="v => oneRmExercise = v"
                                 @update:oneRmWeight="v => oneRmWeight = v"
                                 @update:oneRmReps="v => oneRmReps = v"
                                 @calculate="calculateOneRm"
                                 @copy="copyOneRm"
                                 @export="openDownloadPopup('oneRm')"
                                 @reset="resetCalculator('oneRm')" />
                <!-- Koffein Standard -->
                <CaffeineSafeDoseCalculator v-if="matchesCalc('Koffein') && !isFavorite('Koffein')"
                                            :unit="unit"
                                            :autoCalcEnabled="autoCalcEnabled"
                                            :cafWeight="cafWeight"
                                            :cafSensitivity="cafSensitivity"
                                            :cafStatus="cafStatus"
                                            :cafResult="cafResult"
                                            :isFavorite="isFavorite('Koffein')"
                                            @toggleFavorite="() => toggleFavorite('Koffein')"
                                            @update:cafWeight="v => cafWeight = v"
                                            @update:cafSensitivity="v => cafSensitivity = v"
                                            @update:cafStatus="v => cafStatus = v"
                                            @calculate="calculateCaffeine"
                                            @copy="copyCaffeine"
                                            @export="openDownloadPopup('caffeine')"
                                            @reset="resetCalculator('caffeine')" />

                <!-- ========== Körperfett Rechner ========== -->
                <BodyFatCalculator v-if="matchesCalc('Körperfett') && !isFavorite('Körperfett')"
                                   :autoCalcEnabled="autoCalcEnabled"
                                   :bodyFatGender="bodyFatGender"
                                   :bodyFatWaist="bodyFatWaist"
                                   :bodyFatNeck="bodyFatNeck"
                                   :bodyFatHip="bodyFatHip"
                                   :bodyFatHeight="bodyFatHeight"
                                   :bodyFatResult="bodyFatResult"
                                   :isFavorite="isFavorite('Körperfett')"
                                   @toggleFavorite="() => toggleFavorite('Körperfett')"
                                   @update:bodyFatGender="v => bodyFatGender = v"
                                   @update:bodyFatWaist="v => bodyFatWaist = v"
                                   @update:bodyFatNeck="v => bodyFatNeck = v"
                                   @update:bodyFatHip="v => bodyFatHip = v"
                                   @update:bodyFatHeight="v => bodyFatHeight = v"
                                   @calculate="calculateBodyFat"
                                   @copy="copyBodyFat"
                                   @export="openDownloadPopup('bodyFat')"
                                   @reset="resetCalculator('bodyFat')" />

                <!-- ========== FFMI Rechner ========== -->
                <FfmiCalculator v-if="matchesCalc('FFMI') && !isFavorite('FFMI')"
                                :unit="unit"
                                :autoCalcEnabled="autoCalcEnabled"
                                :ffmiWeight="ffmiWeight"
                                :ffmiHeight="ffmiHeight"
                                :ffmiBodyFat="ffmiBodyFat"
                                :ffmiResult="ffmiResult"
                                :isFavorite="isFavorite('FFMI')"
                                @toggleFavorite="() => toggleFavorite('FFMI')"
                                @update:ffmiWeight="v => ffmiWeight = v"
                                @update:ffmiHeight="v => ffmiHeight = v"
                                @update:ffmiBodyFat="v => ffmiBodyFat = v"
                                @calculate="calculateFFMI"
                                @copy="copyFFMI"
                                @export="openDownloadPopup('ffmi')"
                                @reset="resetCalculator('ffmi')" />
                <!-- GL Standard -->
                <GlycemicLoadCalculator v-if="matchesCalc('Glykämische Last') && !isFavorite('Glykämische Last')"
                                        :autoCalcEnabled="autoCalcEnabled"
                                        :glFood="glFood"
                                        :glServing="glServing"
                                        :glCarbs100="glCarbs100"
                                        :glGi="glGi"
                                        :glResult="glResult"
                                        :isFavorite="isFavorite('Glykämische Last')"
                                        @toggleFavorite="() => toggleFavorite('Glykämische Last')"
                                        @update:glFood="v => glFood = v"
                                        @update:glServing="v => glServing = v"
                                        @update:glCarbs100="v => glCarbs100 = v"
                                        @update:glGi="v => glGi = v"
                                        @calculate="calculateGlyLoad"
                                        @copy="copyGlyLoad"
                                        @export="openDownloadPopup('glyload')"
                                        @reset="resetCalculator('glyload')" />

                <!-- ========== Wasserbedarfsrechner ========== -->
                <WaterCalculator v-if="matchesCalc('Wasserbedarf') && !isFavorite('Wasserbedarf')"
                                 :unit="unit"
                                 :autoCalcEnabled="autoCalcEnabled"
                                 :waterWeight="waterWeight"
                                 :waterActivity="waterActivity"
                                 :waterClimate="waterClimate"
                                 :waterResult="waterResult"
                                 :isFavorite="isFavorite('Wasserbedarf')"
                                 @toggleFavorite="() => toggleFavorite('Wasserbedarf')"
                                 @update:waterWeight="v => waterWeight = v"
                                 @update:waterActivity="v => waterActivity = v"
                                 @update:waterClimate="v => waterClimate = v"
                                 @calculate="calculateWater"
                                 @copy="copyWater"
                                 @export="openDownloadPopup('water')"
                                 @reset="resetCalculator('water')" />

            </div>


            <!-- ===================== PLÄNE TAB ===================== -->
            <div v-show="activeTab === 'plans'" class="plans-section">
                <div class="plan-card" v-if="matchesPlanSearch('Trainingsplan')">
                    <div class="card-header">
                        <h3 class="card-title">📅 Trainingsplan</h3>
                        <div class="card-actions">
                            <button class="action-btn" @click="openDownloadPopup('plans')">⬇️</button>
                        </div>
                    </div>
                    <p>Dein aktueller Trainingsplan.</p>
                </div>

                <div class="plan-card" v-if="matchesPlanSearch('Ernährungsplan')">
                    <div class="card-header">
                        <h3 class="card-title">🥗 Ernährungsplan</h3>
                        <div class="card-actions">
                            <button class="action-btn" @click="openDownloadPopup('nutrition')">⬇️</button>
                        </div>
                    </div>
                    <p>Dein Ernährungsplan.</p>
                </div>
            </div>
        </div>

        <!-- ===================== POPUPS ===================== -->
        <!-- Gewicht -->
        <WeightPopup :show="showWeightPopup"
                     v-model="newWeight"
                     :placeholder="unit === 'kg' ? 'Gewicht in kg' : 'Gewicht in lbs'"
                     @save="saveWeight"
                     @cancel="closeWeightPopup" />

        <!-- Ziel -->
        <GoalPopup :show="showGoalPopup"
                   v-model="newGoal"
                   :placeholder="unit === 'kg' ? 'Ziel in kg' : 'Ziel in lbs'"
                   @save="saveGoal"
                   @cancel="closeGoalPopup" />


        <!-- Export-Popup -->
        <ExportPopup :show="showDownloadPopup"
                     v-model="downloadFormat"
                     @confirm="confirmDownload"
                     @cancel="closeDownloadPopup" />

        <!-- Toast -->
        <Toast :toast="toast"
               position="bottom-center"
               :dismissible="true"
               @dismiss="startToastExit" />

    </div>
</template>

<script setup lang="ts">
    import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
    import Chart from 'chart.js/auto';
    import confetti from 'canvas-confetti';
    import jsPDF from 'jspdf';
    import { useUnits, KG_PER_LB } from '@/composables/useUnits'
    import Toast from '@/components/ui/Toast.vue'
    import DashboardCard from '@/components/ui/DashboardCard.vue'
    import WeightPopup from '@/components/ui/popups/WeightPopup.vue'
    import GoalPopup from '@/components/ui/popups/GoalPopup.vue'
    import ExportPopup from '@/components/ui/popups/ExportPopup.vue'
    import TabsBar from '@/components/ui/TabsBar.vue'
    import ChartCard from '@/components/ui/charts/ChartCard.vue'
    import BmiCalculator from '@/components/ui/calculators/BmiCalculator.vue'
    import CaloriesCalculator from '@/components/ui/calculators/CaloriesCalculator.vue'
    import OneRmCalculator from '@/components/ui/calculators/OneRmCalculator.vue'
    import BodyFatCalculator from '@/components/ui/calculators/BodyFatCalculator.vue'
    import FfmiCalculator from '@/components/ui/calculators/FfmiCalculator.vue'
    import WaterCalculator from '@/components/ui/calculators/WaterCalculator.vue'
    import ProteinCalculator from '@/components/ui/calculators/ProteinCalculator.vue'
    import CaffeineSafeDoseCalculator from '@/components/ui/calculators/CaffeineSafeDoseCalculator.vue'
    import GlycemicLoadCalculator from '@/components/ui/calculators/GlycemicLoadCalculator.vue'

    // Interfaces
    interface PlanExercise {
        exercise: string;
        sets: number;
        reps: number;
        goal?: string;
    }

    interface TrainingPlan {
        id: string;
        name: string;
        exercises: PlanExercise[];
    }

    interface WeightEntry {
        date: string;
        weight: number;
    }

    interface Meal {
        name: string;
        calories: number;
    }

    interface Workout {
        exercise: string;
        weight: number;
        reps: number;
        date: string;
        planId?: string;
    }

    interface Toast {
        id: number;
        message: string;
        emoji: string;
        type: string;
        exiting: boolean;
    }

    // Refs
    const { unit, kgToDisplay, displayToKg, formatWeight } = useUnits()
    const trainingPlans = ref < TrainingPlan[] > ([]);
    const weightHistory = ref < WeightEntry[] > ([
        { date: '2025-05-28', weight: 76.4 },
        { date: '2025-05-27', weight: 76.2 },
    ]);
    const workouts = ref < Workout[] > ([
        { exercise: 'Bankdrücken', weight: 80, reps: 8, date: new Date().toISOString(), planId: undefined },
        { exercise: 'Kniebeuge', weight: 100, reps: 10, date: new Date().toISOString(), planId: undefined },
    ]);
    const meals = ref < Meal[] > ([
        { name: 'Frühstück', calories: 600 },
        { name: 'Mittagessen', calories: 850 },
        { name: 'Snack', calories: 300 },
    ]);
    // Glykämische Last
    const glFood = ref < string > ('')
    const glServing = ref < number | null > (null)
    const glCarbs100 = ref < number | null > (null)
    const glGi = ref < number | null > (null)
    const glResult = ref < { gl: number; category: 'niedrig' | 'mittel' | 'hoch' } | null > (null)

    const newWeight = ref < number | null > (null);
    const goal = ref < number | null > (null);
    const newGoal = ref < number | null > (null);
    const showWeightPopup = ref(false);
    const showGoalPopup = ref(false);
    const showProgressPopup = ref(false);
    const showValidationPopup = ref(false);
    const showDownloadPopup = ref(false);
    const validationErrorMessages = ref < string[] > ([]);
    const toast = ref < Toast | null > (null);
    const weightInput = ref < HTMLInputElement | null > (null);
    const goalInput = ref < HTMLInputElement | null > (null);
    const progressExerciseInput = ref < HTMLSelectElement | null > (null);
    const progressWeightInput = ref < HTMLInputElement | null > (null);
    const downloadFormatInput = ref < HTMLSelectElement | null > (null);
    const validationOkButton = ref < HTMLButtonElement | null > (null);
    const downloadFormat = ref < 'html' | 'csv' | 'json' | 'pdf' | 'txt' > ('html');
    const downloadCalculator = ref < string | null > (null);
    const downloadPlanId = ref < string | null > (null);
    const searchQuery = ref < string > ('');
    const currentPlanId = ref < string | null > (null);
    const currentExercise = ref < string > ('');
    const newProgressWeight = ref < number | null > (null);
    const newProgressReps = ref < number | null > (null);
    let toastId = 0;
    let toastTimeout: NodeJS.Timeout | null = null;

    const activeTab = ref < 'stats' | 'calculators' | 'plans' > ('stats');

    // Calculator Data
    const bmiGender = ref < 'male' | 'female' > ('male');
    const bmiWeight = ref < number | null > (null);
    const bmiHeight = ref < number | null > (null);
    const bmiResult = ref < { value: number; category: string } | null > (null);
    const proteinActivity = ref < 'low' | 'moderate' | 'high' > ('low')
    const proteinMeals = ref < number | null > (null)

    const calorieAge = ref < number | null > (null);
    const calorieGender = ref < 'male' | 'female' > ('male');
    const calorieWeight = ref < number | null > (null);
    const calorieHeight = ref < number | null > (null);
    const calorieActivity = ref < string > ('1.2');
    const calorieGoal = ref < number > (0);
    const calorieResult = ref < {
        total: number;
        macros: { carbs: number; protein: number; fat: number };
    } | null > (null);
    const proteinWeight = ref < number | null > (null)
    const proteinGoal = ref < 'maintain' | 'bulk' | 'cut' > ('maintain')
    const proteinResult = ref < { recommend: number; min?: number; max?: number; factor: number; weightDisplay: string } | null > (null)

    // Abgeleitete Liste für das Template-Header-Check
    const favoriteCalcs = computed(() => Array.from(favoriteCalculators.value));
    const cafWeight = ref < number | null > (null)
    const cafSensitivity = ref < 'low' | 'normal' | 'high' > ('normal')
    const cafStatus = ref < 'none' | 'pregnant' > ('none')
    const cafResult = ref < { perDose: number; perDay: number } | null > (null)

    const isFavorite = (id: string) => isFavCalculator(id);
    const toggleFavorite = (id: string) => toggleFavCalculator(id);

    const oneRmExercise = ref < string > ('');
    const oneRmWeight = ref < number | null > (null);
    const oneRmReps = ref < number | null > (null);
    const oneRmResult = ref < number | null > (null);

    const bodyFatGender = ref < 'male' | 'female' > ('male');
    const bodyFatWaist = ref < number | null > (null);
    const bodyFatNeck = ref < number | null > (null);
    const bodyFatHip = ref < number | null > (null);
    const bodyFatHeight = ref < number | null > (null);
    const bodyFatResult = ref < number | null > (null);
    const toastsEnabled = ref(true);

    const ffmiWeight = ref < number | null > (null);
    const ffmiHeight = ref < number | null > (null);
    const ffmiBodyFat = ref < number | null > (null);
    const ffmiResult = ref < { value: number; category: string } | null > (null);

    const waterWeight = ref < number | null > (null);
    const waterActivity = ref < 'low' | 'moderate' | 'high' > ('low');
    const waterClimate = ref < 'temperate' | 'hot' | 'very_hot' > ('temperate');
    const waterResult = ref < number | null > (null);

    const planSearchQuery = ref < string > ('');
    const maxEntries = ref(3);
    const editingEntry = ref(null);
    // Zustand für "Mehr anzeigen"
    const showMore = ref < { [key: string]: boolean } > ({});
    const autoCalcEnabled = ref(false)

    function debounce<F extends (...args: any[]) => void>(fn: F, wait = 300) {
        let t: number | undefined
        return (...args: Parameters<F>) => {
            if (t) clearTimeout(t)
            t = window.setTimeout(() => fn(...args), wait)
        }
    }

    const editProgressEntry = (planId, entry) => {
        currentPlanId.value = planId;
        currentExercise.value = entry.exercise;
        newProgressWeight.value = kgToDisplay(entry.weight);
        newProgressReps.value = entry.reps;
        editingEntry.value = entry;
        showProgressPopup.value = true;
    };

    const matchesPlanSearch = (name: string) => {
        if (!planSearchQuery.value) return true;
        return name.toLowerCase().includes(planSearchQuery.value.toLowerCase());
    };
    const deleteProgressEntry = (planId, date) => {
        workouts.value = workouts.value.filter(w => !(w.planId === planId && w.date === date));
        showToast({ message: 'Eintrag gelöscht!', type: 'success', emoji: '🗑️' });
    };

    const calculateProgress = (planId: string) => {
        const today = new Date().toISOString().split('T')[0];
        const progressEntries = getProgressForPlan(planId).filter(entry => entry.date.startsWith(today));
        const totalExercises = trainingPlans.value.find(p => p.id === planId)?.exercises.length || 1;
        return Math.min((progressEntries.length / totalExercises) * 100, 100);
    };

    const currentWeightDisplay = computed(() =>
        weightHistory.value.length ? formatWeight(weightHistory.value[0].weight, 1) : 'N/A'
    )

    // Begrenzt die angezeigten Einträge
    const displayedEntries = (planId: string) => {
        const entries = getProgressForPlan(planId);
        if (showMore.value[planId]) {
            return entries;
        }
        return entries.slice(0, maxEntries.value);
    };
    const toggleShowMore = (planId: string) => {
        showMore.value[planId] = !showMore.value[planId];
    };
    // Computed Properties
    const lastWorkout = computed(() =>
        workouts.value.length
            ? `${workouts.value[0].exercise} – ${formatWeight(workouts.value[0].weight, 0)} x ${workouts.value[0].reps}`
            : null
    );


    const totalCalories = computed(() => meals.value.reduce((sum, meal) => sum + meal.calories, 0));

    const currentWeight = computed(() =>
        weightHistory.value.length ? weightHistory.value[0].weight.toString() : 'N/A'
    );

    const initialWeight = computed(() =>
        weightHistory.value.length ? weightHistory.value[weightHistory.value.length - 1].weight : null
    );

    const matchesSearch = (calculatorName: string) => {
        if (!searchQuery.value) return true;
        return calculatorName.toLowerCase().includes(searchQuery.value.toLowerCase());
    };

    const validateProtein = (): string[] => {
        const errors: string[] = []
        const w = Number(proteinWeight.value)
        if (!Number.isFinite(w) || w <= 0) errors.push('Gewicht muss größer als 0 sein')
        if (!proteinGoal.value) errors.push('Ziel muss ausgewählt sein')
        return errors
    }


    const calculateProtein = () => {
        const errors = validateProtein()
        if (errors.length) {
            openValidationPopupError(errors)
            return
        }

        const weightKg = unit.value === 'kg' ? Number(proteinWeight.value) : Number(proteinWeight.value) * KG_PER_LB

        let factor = 1.6
        let range: { min?: number; max?: number } = {}

        if (proteinGoal.value === 'maintain') {
            factor = 1.6
            range = { min: 1.4 * weightKg, max: 1.8 * weightKg }
        } else if (proteinGoal.value === 'bulk') {
            factor = 2.0
            range = { min: 1.8 * weightKg, max: 2.2 * weightKg }
        } else if (proteinGoal.value === 'cut') {
            factor = 2.2
            range = { min: 2.0 * weightKg, max: 2.6 * weightKg }
        }

        const recommend = factor * weightKg
        proteinResult.value = {
            recommend,
            min: range.min,
            max: range.max,
            factor,
            weightDisplay: `${proteinWeight.value} ${unit.value}`
        }

        addToast('Proteinbedarf berechnet', 'default')
        saveToLocalStorage('protein', {
            weight: proteinWeight.value,
            goal: proteinGoal.value,
            result: proteinResult.value
        })
    }

    const copyProtein = () => {
        if (!proteinResult.value) return
        const r = proteinResult.value
        const rangeLine = (r.min && r.max) ? `\n- Range: ${r.min.toFixed(0)}–${r.max.toFixed(0)} g/Tag` : ''
        const txt = `Proteinbedarf
- Empfehlung: ${r.recommend.toFixed(0)} g/Tag${rangeLine}
- Faktor: ${r.factor.toFixed(2)} g/kg
- Gewicht: ${r.weightDisplay}
- Ziel: ${proteinGoal.value}`
        copyText(txt)
    }

    const getProgressForPlan = (planId: string) => {
        return workouts.value.filter((workout) => workout.planId === planId);
    };

    const getExercisesForPlan = (planId: string | null) => {
        if (!planId) return [];
        const plan = trainingPlans.value.find((p) => p.id === planId);
        return plan ? plan.exercises : [];
    };

    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    // Validation Functions
    const validateWeight = (weight: number | null): string | null => {
        if (weight === null || isNaN(weight)) return 'Gewicht muss eine Zahl sein';
        if (weight <= 0) return 'Gewicht muss größer als 0 sein';
        const kg = displayToKg(Number(weight));
        if (kg > 200) return 'Gewicht darf maximal 200 kg sein';

        return null;
    };

    const validateGoal = (g: number | null): string | null => {
        if (g === null || isNaN(g)) return 'Zielgewicht muss eine Zahl sein';
        if (g <= 0) return 'Zielgewicht muss größer als 0 sein';
        const kg = displayToKg(Number(g));
        if (kg > 200) return 'Zielgewicht darf maximal 200 kg sein';
        return null;
    };


    const validateProgress = (): string[] => {
        const errors: string[] = [];
        if (!currentExercise.value) errors.push('Eine Übung muss ausgewählt sein');
        if (newProgressWeight.value === null || isNaN(newProgressWeight.value) || newProgressWeight.value <= 0)
            errors.push('Gewicht muss größer als 0 sein');
        if (newProgressReps.value === null || isNaN(newProgressReps.value) || newProgressReps.value <= 0)
            errors.push('Wiederholungen müssen größer als 0 sein');
        return errors;
    };

    const validateBMI = (): string[] => {
        const errors: string[] = [];
        if (!bmiGender.value) errors.push('Geschlecht muss ausgewählt sein');
        if (bmiWeight.value === null || isNaN(bmiWeight.value) || bmiWeight.value <= 0)
            errors.push('Gewicht muss größer als 0 sein');
        if (bmiHeight.value === null || isNaN(bmiHeight.value) || bmiHeight.value <= 0)
            errors.push('Größe muss größer als 0 sein');
        return errors;
    };

    function startToastExit(id: number) {
        if (!toast.value || toast.value.id !== id) return
        toast.value.exiting = true
        setTimeout(() => { toast.value = null }, 300)
    }


    const resetWeightStats = () => {
        weightHistory.value = []

        if (weightChart) weightChart.destroy()
        updateWeightChart()
        addToast('Gewichtsverlauf zurückgesetzt', 'default')
    }

    const resetWorkoutStats = () => {
        workouts.value = []
        localStorage.setItem('progress_workouts', JSON.stringify(workouts.value))
        if (workoutChart) workoutChart.destroy()
        updateWorkoutChart()
        addToast('Trainingsstatistik zurückgesetzt', 'default')
    }
    const validateCalories = (): string[] => {
        const errors: string[] = [];
        if (calorieAge.value === null || isNaN(calorieAge.value) || calorieAge.value <= 0)
            errors.push('Alter muss größer als 0 sein');
        if (calorieWeight.value === null || isNaN(calorieWeight.value) || calorieWeight.value <= 0)
            errors.push('Gewicht muss größer als 0 sein');
        if (calorieHeight.value === null || isNaN(calorieHeight.value) || calorieHeight.value <= 0)
            errors.push('Größe muss größer als 0 sein');
        return errors;
    };

    const validateOneRm = (): string[] => {
        const errors: string[] = [];
        if (oneRmWeight.value === null || isNaN(oneRmWeight.value) || oneRmWeight.value <= 0)
            errors.push('Gewicht muss größer als 0 sein');
        if (oneRmReps.value === null || isNaN(oneRmReps.value) || oneRmReps.value <= 0)
            errors.push('Wiederholungen müssen größer als 0 sein');
        return errors;
    };

    const validateBodyFat = (): string[] => {
        const errors: string[] = [];
        if (bodyFatWaist.value === null || isNaN(bodyFatWaist.value) || bodyFatWaist.value <= 0)
            errors.push('Bauchumfang muss größer als 0 sein');
        if (bodyFatNeck.value === null || isNaN(bodyFatNeck.value) || bodyFatNeck.value <= 0)
            errors.push('Halsumfang muss größer als 0 sein');
        if (bodyFatHeight.value === null || isNaN(bodyFatHeight.value) || bodyFatHeight.value <= 0)
            errors.push('Größe muss größer als 0 sein');
        if (bodyFatGender.value === 'female' && (bodyFatHip.value === null || isNaN(bodyFatHip.value) || bodyFatHip.value <= 0))
            errors.push('Hüftumfang muss größer als 0 sein');
        return errors;
    };

    const validateFFMI = (): string[] => {
        const errors: string[] = [];
        if (ffmiWeight.value === null || isNaN(ffmiWeight.value) || ffmiWeight.value <= 0)
            errors.push('Gewicht muss größer als 0 sein');
        if (ffmiHeight.value === null || isNaN(ffmiHeight.value) || ffmiHeight.value <= 0)
            errors.push('Größe muss größer als 0 sein');
        if (ffmiBodyFat.value === null || isNaN(ffmiBodyFat.value) || ffmiBodyFat.value < 0 || ffmiBodyFat.value > 100)
            errors.push('Körperfettanteil muss zwischen 0 und 100% liegen');
        return errors;
    };

    const validateWater = (): string[] => {
        const errors: string[] = [];
        if (waterWeight.value === null || isNaN(waterWeight.value) || waterWeight.value <= 0)
            errors.push('Gewicht muss größer als 0 sein');
        return errors;
    };

    // Calculator Logic
    const calculateBMI = () => {
        const errors = validateBMI();
        if (errors.length) {
            openValidationPopupError(errors);
            return;
        }
        const weightKg = unit.value === 'kg' ? Number(bmiWeight.value) : Number(bmiWeight.value) * KG_PER_LB
        const heightM = Number(bmiHeight.value) / 100
        const bmi = weightKg / (heightM * heightM)

        let category = '';
        if (bmiGender.value === 'male') {
            if (bmi < 18.5) category = 'Untergewicht';
            else if (bmi < 25) category = 'Normalgewicht';
            else if (bmi < 30) category = 'Übergewicht';
            else category = 'Adipositas';
        } else {
            if (bmi < 19) category = 'Untergewicht';
            else if (bmi < 26) category = 'Normalgewicht';
            else if (bmi < 31) category = 'Übergewicht';
            else category = 'Adipositas';
        }
        bmiResult.value = { value: bmi, category };
        addToast('BMI berechnet', 'default');
        saveToLocalStorage('bmi', {
            gender: bmiGender.value,
            weight: bmiWeight.value,
            height: bmiHeight.value,
            result: bmiResult.value,
        });
    };

    const calculateCalories = () => {
        const errors = validateCalories();
        if (errors.length) {
            openValidationPopupError(errors);
            return;
        }
        let bmr = 0;
        const weightKg = unit.value === 'kg' ? Number(calorieWeight.value) : Number(calorieWeight.value) * KG_PER_LB;
        const height = Number(calorieHeight.value);
        const age = Number(calorieAge.value);
        if (calorieGender.value === 'male') {
            bmr = 88.362 + 13.397 * weightKg + 4.799 * height - 5.677 * age;
        } else {
            bmr = 447.593 + 9.247 * weightKg + 3.098 * height - 4.330 * age;
        }
        const activityFactor = Number(calorieActivity.value);
        const maintenance = bmr * activityFactor;
        const total = maintenance + Number(calorieGoal.value);
        const macros = {
            carbs: (total * 0.5) / 4,
            protein: (total * 0.3) / 4,
            fat: (total * 0.2) / 9,
        };
        calorieResult.value = { total, macros };
        updateMacroChart();
        addToast('Kalorienbedarf berechnet', 'default');
        saveToLocalStorage('calories', {
            age,
            gender: calorieGender.value,
            weight: calorieWeight.value,
            height: calorieHeight.value,
            activity: calorieActivity.value,
            goal: calorieGoal.value,
            result: calorieResult.value,
        });

    };

    const calculators = ref([
        { key: 'BMI', name: 'BMI-Rechner', isFavorite: false },
        { key: 'Kalorienbedarf', name: 'Kalorienbedarfsrechner', isFavorite: false },
        { key: '1RM', name: '1RM-Rechner', isFavorite: false },
        { key: 'Körperfett', name: 'Körperfett-Rechner', isFavorite: false },
        { key: 'FFMI', name: 'FFMI-Rechner', isFavorite: false },
        { key: 'Wasserbedarf', name: 'Wasserbedarfsrechner', isFavorite: false },
        { key: 'Proteinbedarf', name: 'Proteinbedarfsrechner', isFavorite: false },
        { key: 'Glykämische Last', name: 'GL-Rechner', isFavorite: false },
        { key: 'Koffein', name: 'Koffein – sichere Dosis', isFavorite: false },
    ])


    const sortedCalculators = computed(() => {
        return calculators.value
            .filter(c => matchesSearch(c.key))
            .sort((a, b) => Number(b.isFavorite) - Number(a.isFavorite))
    })

    const getCalculatorComponent = (key: string) => {
        switch (key) {
            case 'BMI': return 'BmiCalculator'
            case 'Kalorienbedarf': return 'CaloriesCalculator'
            case '1RM': return 'OneRmCalculator'
            case 'Körperfett': return 'BodyFatCalculator'
            case 'FFMI': return 'FfmiCalculator'
            case 'Wasserbedarf': return 'WaterCalculator'
            default: return 'div'
        }
    }

    const calculateOneRm = () => {
        const errors = validateOneRm();
        if (errors.length) {
            openValidationPopupError(errors);
            return;
        }
        const weightKg = unit.value === 'kg' ? Number(oneRmWeight.value) : Number(oneRmWeight.value) * KG_PER_LB;
        const reps = Number(oneRmReps.value);
        const oneRmKg = weightKg * (1 + reps / 30);
        oneRmResult.value = oneRmKg;

        addToast('1RM berechnet', 'default');
        saveToLocalStorage('oneRm', {
            exercise: oneRmExercise.value,
            weight: oneRmWeight.value,
            reps,
            result: oneRmResult.value,
        });
    };

    // ---- Kategorien-Filter ----
    type CalcCategory = 'alle' | 'gesundheit' | 'kraft' | 'ernaehrung' | 'alltag'

    const calcCategory = ref < CalcCategory > ('alle')

    const CALC_CATEGORY: Record<string, CalcCategory> = {
        'BMI': 'gesundheit',
        'Kalorienbedarf': 'ernaehrung',
        '1RM': 'kraft',
        'Körperfett': 'gesundheit',
        'FFMI': 'gesundheit',
        'Wasserbedarf': 'alltag',
        'Proteinbedarf': 'ernaehrung',
        'Koffein': 'alltag',
        'Glykämische Last': 'ernaehrung',

    }

    const validateCaffeine = (): string[] => {
        const errors: string[] = []
        if (cafWeight.value === null || isNaN(cafWeight.value) || cafWeight.value <= 0) {
            errors.push('Gewicht muss größer als 0 sein')
        }
        return errors
    }

    const validateGlyLoad = (): string[] => {
        const errors: string[] = []
        if (!glFood.value.trim()) errors.push('Lebensmittel muss angegeben werden')
        if (glServing.value === null || isNaN(glServing.value) || glServing.value <= 0)
            errors.push('Portionsgröße muss größer als 0 g sein')
        if (glCarbs100.value === null || isNaN(glCarbs100.value) || glCarbs100.value < 0)
            errors.push('Kohlenhydrate pro 100 g müssen ≥ 0 g sein')
        if (glGi.value === null || isNaN(glGi.value) || glGi.value < 0 || glGi.value > 110)
            errors.push('Glykämischer Index muss zwischen 0 und 110 liegen')
        return errors
    }

    const calculateGlyLoad = () => {
        const errors = validateGlyLoad()
        if (errors.length) { openValidationPopupError(errors); return }

        const serving = Number(glServing.value)
        const carbs100 = Number(glCarbs100.value)
        const gi = Number(glGi.value)

        const carbsPerServing = (carbs100 * serving) / 100
        const gl = (gi / 100) * carbsPerServing

        let category: 'niedrig' | 'mittel' | 'hoch' = 'niedrig'
        if (gl >= 20) category = 'hoch'
        else if (gl >= 10) category = 'mittel'

        glResult.value = { gl, category }
        addToast('Glykämische Last berechnet', 'default')

        saveToLocalStorage('glyload', {
            food: glFood.value,
            serving: serving,
            carbs100: carbs100,
            gi: gi,
            result: glResult.value,
        })
    }

    const copyGlyLoad = () => {
        if (!glResult.value) return
        const r = glResult.value
        const txt = `Glykämische Last
- Lebensmittel: ${glFood.value || '-'}
- Portion: ${glServing.value ?? '-'} g
- KH (pro 100 g): ${glCarbs100.value ?? '-'} g
- GI: ${glGi.value ?? '-'}
- GL (Portion): ${r.gl.toFixed(1)} (${r.category})`
        copyText(txt)
    }

    const calculateCaffeine = () => {
        const errors = validateCaffeine()
        if (errors.length) { openValidationPopupError(errors); return }

        const kg = unit.value === 'kg'
            ? Number(cafWeight.value)
            : Number(cafWeight.value) * KG_PER_LB

        let mgPerKg = 4
        if (cafSensitivity.value === 'low') mgPerKg = 3
        if (cafSensitivity.value === 'high') mgPerKg = 6

        let dayCap = 400
        if (cafStatus.value === 'pregnant') dayCap = 200

        const perDay = Math.min(Math.round(mgPerKg * kg), dayCap)
        const perDose = Math.min(Math.round(perDay / 2), 200)

        cafResult.value = { perDose, perDay }
        addToast('Koffein-Empfehlung berechnet', 'default')

        saveToLocalStorage('caffeine', {
            weight: cafWeight.value,
            sensitivity: cafSensitivity.value,
            status: cafStatus.value,
            result: cafResult.value,
        })
    }

    const copyCaffeine = () => {
        if (!cafResult.value) return
        const r = cafResult.value
        const txt = `Koffein – sichere Dosis
- Max. pro Tag: ${r.perDay} mg
- Empfehlung je Einzeldosis: ${r.perDose} mg
- Gewicht: ${cafWeight.value ?? '-'} ${unit.value}
- Empfindlichkeit: ${cafSensitivity.value}
- Status: ${cafStatus.value}`
        copyText(txt)
    }

    const matchesCalc = (key: string) => {
        const searchOk = matchesSearch(key)
        const category = CALC_CATEGORY[key] ?? 'alle'
        const categoryOk = calcCategory.value === 'alle' || category === calcCategory.value
        return searchOk && categoryOk
    }

    const calculateBodyFat = () => {
        const errors = validateBodyFat();
        if (errors.length) {
            openValidationPopupError(errors);
            return;
        }
        const waist = Number(bodyFatWaist.value);
        const neck = Number(bodyFatNeck.value);
        const height = Number(bodyFatHeight.value);
        let bodyFat = 0;
        if (bodyFatGender.value === 'male') {
            bodyFat = 86.010 * Math.log10(waist - neck) - 70.041 * Math.log10(height) + 36.76;
        } else {
            const hip = Number(bodyFatHip.value);
            bodyFat = 163.205 * Math.log10(waist + hip - neck) - 97.684 * Math.log10(height) - 78.387;
        }
        bodyFatResult.value = Math.max(0, bodyFat);
        addToast('Körperfett berechnet', 'default');
        saveToLocalStorage('bodyFat', {
            gender: bodyFatGender.value,
            waist,
            neck,
            hip: bodyFatHip.value,
            height,
            result: bodyFatResult.value,
        });
    };

    const calculateFFMI = () => {
        const errors = validateFFMI();
        if (errors.length) {
            openValidationPopupError(errors);
            return;
        }
        const weightKg = unit.value === 'kg' ? Number(ffmiWeight.value) : Number(ffmiWeight.value) * KG_PER_LB;
        const heightM = Number(ffmiHeight.value) / 100;
        const bodyFat = Number(ffmiBodyFat.value) / 100;
        const leanMass = weightKg * (1 - bodyFat);
        const ffmi = leanMass / (heightM * heightM) + 6.1 * (1.8 - heightM);
        let category = '';
        if (ffmi < 18) category = 'Unterdurchschnittlich';
        else if (ffmi < 20) category = 'Durchschnittlich';
        else if (ffmi < 22) category = 'Überdurchschnittlich';
        else if (ffmi < 25) category = 'Sehr muskulös';
        else category = 'Extrem muskulös';
        ffmiResult.value = { value: ffmi, category };
        addToast('FFMI berechnet', 'default');
        saveToLocalStorage('ffmi', {
            weight: ffmiWeight.value,
            height: ffmiHeight.value,
            bodyFat: ffmiBodyFat.value,
            result: ffmiResult.value,
        });
    };

    const calculateWater = () => {
        const errors = validateWater();
        if (errors.length) {
            openValidationPopupError(errors);
            return;
        }
        const weightKg = unit.value === 'kg' ? Number(waterWeight.value) : Number(waterWeight.value) * KG_PER_LB;
        let baseWater = weightKg * 0.035;
        if (waterActivity.value === 'moderate') baseWater += 0.5;
        else if (waterActivity.value === 'high') baseWater += 1.0;
        if (waterClimate.value === 'hot') baseWater += 0.5;
        if (waterClimate.value === 'very_hot') baseWater += 1.0;
        waterResult.value = Math.max(1.5, baseWater);
        addToast('Wasserbedarf berechnet', 'default');
        saveToLocalStorage('water', {
            weight: waterWeight.value,
            activity: waterActivity.value,
            climate: waterClimate.value,
            result: waterResult.value,
        });

    };

    const resetCalculator = (calculator: string) => {
        switch (calculator) {
            case 'bmi':
                bmiGender.value = 'male';
                bmiWeight.value = null;
                bmiHeight.value = null;
                bmiResult.value = null;
                localStorage.removeItem('progress_bmi');
                addToast('BMI-Rechner zurückgesetzt', 'reset');
                break;

            case 'calories':
                calorieAge.value = null;
                calorieGender.value = 'male';
                calorieWeight.value = null;
                calorieHeight.value = null;
                calorieActivity.value = '1.2';
                calorieGoal.value = 0;
                calorieResult.value = null;
                localStorage.removeItem('progress_calories');
                addToast('Kalorienbedarfsrechner zurückgesetzt', 'reset');
                break;

            case 'oneRm':
                oneRmExercise.value = '';
                oneRmWeight.value = null;
                oneRmReps.value = null;
                oneRmResult.value = null;
                localStorage.removeItem('progress_oneRm');
                addToast('1RM-Rechner zurückgesetzt', 'reset');
                break;

            case 'bodyFat':
                bodyFatGender.value = 'male';
                bodyFatWaist.value = null;
                bodyFatNeck.value = null;
                bodyFatHip.value = null;
                bodyFatHeight.value = null;
                bodyFatResult.value = null;
                localStorage.removeItem('progress_bodyFat');
                addToast('Körperfett-Rechner zurückgesetzt', 'reset');
                break;

            case 'ffmi':
                ffmiWeight.value = null;
                ffmiHeight.value = null;
                ffmiBodyFat.value = null;
                ffmiResult.value = null;
                localStorage.removeItem('progress_ffmi');
                addToast('FFMI-Rechner zurückgesetzt', 'reset');
                break;

            case 'water':
                waterWeight.value = null;
                waterActivity.value = 'low';
                waterClimate.value = 'temperate';
                waterResult.value = null;
                localStorage.removeItem('progress_water');
                addToast('Wasserbedarfsrechner zurückgesetzt', 'reset');
                break;
            case 'protein':
                proteinWeight.value = null
                proteinGoal.value = 'maintain'
                proteinResult.value = null
                localStorage.removeItem('progress_protein')
                addToast('Proteinbedarf-Rechner zurückgesetzt', 'reset')
                break;
            case 'caffeine':
                cafWeight.value = null
                cafSensitivity.value = 'normal'
                cafStatus.value = 'none'
                cafResult.value = null
                localStorage.removeItem('progress_caffeine')
                addToast('Koffein-Rechner zurückgesetzt', 'reset')
                break
            case 'glyload':
                glFood.value = ''
                glServing.value = null
                glCarbs100.value = null
                glGi.value = null
                glResult.value = null
                localStorage.removeItem('progress_glyload')
                addToast('GL-Rechner zurückgesetzt', 'reset')
                break

        }
    };

    const openProgressPopup = (planId: string) => {
        currentPlanId.value = planId;
        currentExercise.value = getExercisesForPlan(planId)[0]?.exercise || '';
        newProgressWeight.value = null;
        newProgressReps.value = null;
        showProgressPopup.value = true;
        nextTick(() => {
            if (progressExerciseInput.value) progressExerciseInput.value.focus();
        });
    };

    const saveProgress = () => {
        if (!currentExercise.value || !newProgressWeight.value || !newProgressReps.value) {
            validationErrorMessages.value = ['Bitte alle Felder ausfüllen.'];
            showValidationPopup.value = true;
            return;
        }
        if (editingEntry.value) {
            const index = workouts.value.findIndex(w => w.planId === currentPlanId.value && w.date === editingEntry.value.date);
            if (index !== -1) {
                workouts.value[index] = {
                    planId: currentPlanId.value,
                    exercise: currentExercise.value,
                    weight: displayToKg(Number(newProgressWeight.value)),
                    reps: Number(newProgressReps.value),
                    date: editingEntry.value.date,
                };
                showToast({ message: 'Fortschritt aktualisiert!', type: 'success', emoji: '✅' });
            }
            editingEntry.value = null;
        } else {
            const weightKg = displayToKg(Number(newProgressWeight.value));
            workouts.value.push({
                planId: currentPlanId.value,
                exercise: currentExercise.value,
                weight: weightKg,
                reps: Number(newProgressReps.value),
                date: new Date().toISOString(),
            });

            checkMilestones(currentPlanId.value, currentExercise.value, newProgressWeight.value, newProgressReps.value);
            showToast({ message: 'Fortschritt gespeichert!', type: 'success', emoji: '✅' });
        }
        closeProgressPopup();
    };

    function showToast(opts: { message: string; type?: 'default' | 'add' | 'delete' | 'save' | 'timer' | 'reset' | 'success'; emoji?: string }) {
        const mapped = opts.type === 'success' ? 'add' : (opts.type ?? 'default');
        addToast(opts.message, mapped);
    }

    const closeProgressPopup = () => {
        showProgressPopup.value = false;
        currentPlanId.value = null;
        currentExercise.value = '';
        newProgressWeight.value = null;
        newProgressReps.value = null;
    };

    // clean version
    const openDownloadPopup = (calculator: string, planId?: string) => {
        downloadCalculator.value = calculator;
        downloadPlanId.value = planId || null;
        downloadFormat.value = 'html';
        showDownloadPopup.value = true;
    };


    const closeDownloadPopup = () => {
        showDownloadPopup.value = false;
        downloadCalculator.value = null;
        downloadPlanId.value = null;
        downloadFormat.value = 'html';
    };

    const confirmDownload = () => {
        if (!downloadCalculator.value) return;

        let data: any = {};
        let filename = '';
        let content = '';
        let type = '';

        switch (downloadCalculator.value) {
            case 'bmi':
                if (!bmiResult.value) { addToast('Kein BMI-Ergebnis zum Herunterladen', 'default'); closeDownloadPopup(); return; }
                data = {
                    gender: bmiGender.value,
                    weight: bmiWeight.value,
                    height: bmiHeight.value,
                    bmi: bmiResult.value.value.toFixed(1),
                    category: bmiResult.value.category,
                };
                filename = 'bmi_result';
                break;

            case 'calories':
                if (!calorieResult.value) { addToast('Kein Kalorienbedarf-Ergebnis zum Herunterladen', 'default'); closeDownloadPopup(); return; }
                data = {
                    age: calorieAge.value,
                    gender: calorieGender.value,
                    weight: calorieWeight.value,
                    height: calorieHeight.value,
                    activity: calorieActivity.value,
                    goal: calorieGoal.value,
                    total: calorieResult.value.total.toFixed(0),
                    macros: {
                        carbs: calorieResult.value.macros.carbs.toFixed(0),
                        protein: calorieResult.value.macros.protein.toFixed(0),
                        fat: calorieResult.value.macros.fat.toFixed(0),
                    },
                };
                filename = 'calorie_result';
                break;

            case 'oneRm':
                if (!oneRmResult.value) { addToast('Kein 1RM-Ergebnis zum Herunterladen', 'default'); closeDownloadPopup(); return; }
                data = {
                    exercise: oneRmExercise.value,
                    weight: oneRmWeight.value,
                    reps: oneRmReps.value,
                    oneRm: oneRmResult.value.toFixed(1),
                };
                filename = 'one_rm_result';
                break;

            case 'bodyFat':
                if (!bodyFatResult.value) { addToast('Kein Körperfett-Ergebnis zum Herunterladen', 'default'); closeDownloadPopup(); return; }
                data = {
                    gender: bodyFatGender.value,
                    waist: bodyFatWaist.value,
                    neck: bodyFatNeck.value,
                    hip: bodyFatHip.value,
                    height: bodyFatHeight.value,
                    bodyFat: bodyFatResult.value.toFixed(1),
                };
                filename = 'bodyFat_result';
                break;

            case 'ffmi':
                if (!ffmiResult.value) { addToast('Kein FFMI-Ergebnis zum Herunterladen', 'default'); closeDownloadPopup(); return; }
                data = {
                    weight: ffmiWeight.value,
                    height: ffmiHeight.value,
                    bodyFat: ffmiBodyFat.value,
                    ffmi: ffmiResult.value.value.toFixed(1),
                    category: ffmiResult.value.category,
                };
                filename = 'ffmi_result';
                break;

            case 'water':
                if (!waterResult.value) { addToast('Kein Wasserbedarf-Ergebnis zum Herunterladen', 'default'); closeDownloadPopup(); return; }
                data = {
                    weight: waterWeight.value,
                    activity: waterActivity.value,
                    climate: waterClimate.value,
                    water: waterResult.value.toFixed(1),
                };
                filename = 'water_result';
                break;

            case 'protein':
                if (!proteinResult.value) { addToast('Kein Protein-Ergebnis zum Herunterladen', 'default'); closeDownloadPopup(); return; }
                data = {
                    weight: proteinWeight.value,
                    unit: unit.value,
                    goal: proteinGoal.value,
                    recommend_g_per_day: proteinResult.value.recommend.toFixed(0),
                    range_g_per_day: proteinResult.value.min && proteinResult.value.max
                        ? `${proteinResult.value.min.toFixed(0)}–${proteinResult.value.max.toFixed(0)}`
                        : null,
                    factor_g_per_kg: proteinResult.value.factor.toFixed(2),
                };
                filename = 'protein_result';
                break;

            case 'caffeine':
                if (!cafResult.value) { addToast('Kein Koffein-Ergebnis zum Herunterladen', 'default'); closeDownloadPopup(); return }
                data = {
                    weight: cafWeight.value,
                    unit: unit.value,
                    sensitivity: cafSensitivity.value,
                    status: cafStatus.value,
                    per_dose_mg: cafResult.value.perDose,
                    per_day_mg: cafResult.value.perDay,
                }
                filename = 'caffeine_result'
                break

            case 'progress': {
                if (!downloadPlanId.value) { addToast('Kein Plan ausgewählt', 'default'); closeDownloadPopup(); return; }
                const plan = trainingPlans.value.find(p => p.id === downloadPlanId.value);
                const progress = getProgressForPlan(downloadPlanId.value);
                if (!progress.length) { addToast('Kein Fortschritt zum Herunterladen', 'default'); closeDownloadPopup(); return; }
                data = {
                    planName: plan?.name || 'Unbekannter Plan',
                    progress: progress.map((entry) => ({
                        exercise: entry.exercise,
                        weight: entry.weight,
                        reps: entry.reps,
                        date: formatDate(entry.date),
                    })),
                };
                filename = `progress_${(plan?.name || 'plan').toLowerCase().replace(/\s+/g, '_')}`;
                break;
            }
            case 'glyload':
                if (!glResult.value) { addToast('Kein GL-Ergebnis zum Herunterladen', 'default'); closeDownloadPopup(); return }
                data = {
                    food: glFood.value,
                    serving_g: glServing.value,
                    carbs_per_100g_g: glCarbs100.value,
                    gi: glGi.value,
                    gl_per_serving: glResult.value.gl.toFixed(1),
                    category: glResult.value.category,
                }
                filename = 'glycemic_load_result'
                break

            case 'weightStats': {
                if (!weightHistory.value.length) {
                    addToast('Kein Gewichtsverlauf zum Herunterladen', 'default')
                    closeDownloadPopup()
                    return
                }
                data = {
                    series: weightHistory.value.map(e => ({
                        date: formatDate(e.date),
                        weight_display: formatWeight(e.weight, 1),
                        weight_raw_kg: e.weight
                    }))
                }
                filename = 'weight_stats'
                break
            }

            case 'workoutStats': {
                if (!workouts.value.length) {
                    addToast('Keine Trainingsdaten zum Herunterladen', 'default')
                    closeDownloadPopup()
                    return
                }
                data = {
                    totalWorkouts: workouts.value.length,
                    entries: workouts.value.map(w => ({
                        exercise: w.exercise,
                        weight_display: formatWeight(w.weight, 1),
                        weight_raw_kg: w.weight,
                        reps: w.reps,
                        date: formatDate(w.date)
                    }))
                }
                filename = 'workout_stats'
                break
            }

            case 'plans':
            case 'nutrition':
                addToast('Export für diesen Bereich ist noch nicht implementiert', 'default');
                closeDownloadPopup();
                return;


            default:
                addToast('Unbekannter Exporttyp', 'default');
                closeDownloadPopup();
                return;
        }

        // 2) PDF direkt mit jsPDF
        if (downloadFormat.value === 'pdf') {
            const doc = new jsPDF();
            doc.setFontSize(16);
            const title = (downloadCalculator.value === 'progress' ? 'Fortschritt' : downloadCalculator.value.toUpperCase()) + ' Ergebnis';
            doc.text(title, 20, 20);
            doc.setFontSize(12);
            let y = 30;

            const writeKV = (k: string, v: any) => {
                if (y > 280) { doc.addPage(); y = 20; }
                doc.text(`${k}: ${v}`, 20, y);
                y += 8;
            };

            Object.entries(data).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    if (y > 275) { doc.addPage(); y = 20; }
                    doc.text(`${key}:`, 20, y); y += 8;
                    value.forEach((item: any, idx: number) => {
                        if (y > 275) { doc.addPage(); y = 20; }
                        doc.text(`Eintrag ${idx + 1}:`, 25, y); y += 8;
                        Object.entries(item).forEach(([k, v]) => writeKV(`  ${k}`, v));
                        y += 4;
                    });
                } else if (typeof value === 'object' && value !== null) {
                    if (y > 275) { doc.addPage(); y = 20; }
                    doc.text(`${key}:`, 20, y); y += 8;
                    Object.entries(value).forEach(([k, v]) => writeKV(`  ${k}`, v));
                } else {
                    writeKV(key, value);
                }
            });

            doc.save(`${filename}.pdf`);
            addToast('PDF heruntergeladen', 'save');
            closeDownloadPopup();
            return;
        }

        switch (downloadFormat.value) {
            case 'html':
                content = `
<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8" />
<title>${downloadCalculator.value === 'progress' ? 'Fortschritt' : String(downloadCalculator.value).toUpperCase()} Ergebnis</title>
<style>
  body { font-family: Arial, sans-serif; padding: 20px; color:#111827; }
  h1 { margin-top:0; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
  th { background-color: #f3f4f6; }
  code { white-space: pre-wrap; }
</style>
</head>
<body>
  <h1>${downloadCalculator.value === 'progress' ? 'Fortschritt' : String(downloadCalculator.value).toUpperCase()} Ergebnis</h1>
  <table>
    ${Object.entries(data).map(([key, value]) => {
                    if (Array.isArray(value)) {
                        return `<tr><th>${key}</th><td>${value.map((item: any, i: number) =>
                            `Eintrag ${i + 1}:<br>${Object.entries(item).map(([k, v]) => `${k}: ${v}`).join('<br>')}`
                        ).join('<br><br>')
                            }</td></tr>`;
                    } else if (typeof value === 'object' && value !== null) {
                        return `<tr><th>${key}</th><td>${Object.entries(value).map(([k, v]) => `${k}: ${v}`).join('<br>')}</td></tr>`;
                    }
                    return `<tr><th>${key}</th><td>${value}</td></tr>`;
                }).join('')}
  </table>
</body>
</html>`;
                type = 'text/html';
                filename += '.html';
                break;

            case 'csv':
                if (downloadCalculator.value === 'progress') {
                    content = `exercise,weight,reps,date\n${data.progress.map((e: any) =>
                        `${e.exercise},${e.weight},${e.reps},${e.date}`
                    ).join('\n')}`;
                } else {
                    content = Object.entries(data).map(([k, v]) => {
                        if (typeof v === 'object' && v !== null) {
                            return `${k},"${Object.entries(v).map(([kk, vv]) => `${kk}:${vv}`).join(';')}"`;
                        }
                        return `${k},${v}`;
                    }).join('\n');
                }
                type = 'text/csv';
                filename += '.csv';
                break;

            case 'json':
                content = JSON.stringify(data, null, 2);
                type = 'application/json';
                filename += '.json';
                break;

            case 'txt':
                if (downloadCalculator.value === 'progress') {
                    content = `Plan: ${data.planName}\n\n` + data.progress.map((e: any, i: number) =>
                        `#${i + 1}\nÜbung: ${e.exercise}\nGewicht: ${e.weight}\nWdh: ${e.reps}\nDatum: ${e.date}\n`
                    ).join('\n');
                } else {
                    const toLines = (obj: any, indent = ''): string => {
                        if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
                            return Object.entries(obj).map(([k, v]) => `${indent}${k}:\n${toLines(v, indent + '  ')}`).join('');
                        }
                        if (Array.isArray(obj)) {
                            return obj.map((v, i) => `${indent}- (${i + 1}) ${typeof v === 'object' ? '\n' + toLines(v, indent + '  ') : v}\n`).join('');
                        }
                        return `${indent}${obj}\n`;
                    };
                    content = toLines(data);
                }
                type = 'text/plain';
                filename += '.txt';
                break;

            default:
                addToast('Unbekanntes Exportformat', 'default');
                closeDownloadPopup();
                return;
        }

        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        addToast('Ergebnis heruntergeladen', 'save');
        closeDownloadPopup();
    };


    const checkMilestones = (
        planId?: string,
        exercise?: string,
        weight?: number,
        reps?: number
    ) => {
        // 1) Generisches Workout-Milestone
        if (workouts.value.length >= 10) {
            celebrateMilestone('Meilenstein: 10 Workouts erreicht! 🎉');
        }

        // 2) Gewichts-Meilenstein
        if (initialWeight.value && currentWeight.value) {
            const weightChange = Math.abs(Number(currentWeight.value) - initialWeight.value);
            if (weightChange >= 5) {
                celebrateMilestone('Meilenstein: 5 kg Gewichtsveränderung! 🎉');
            }
        }

        // 3) Übungsspezifischer Meilenstein
        if (planId && exercise && typeof weight === 'number' && typeof reps === 'number') {
            const progressEntries = getProgressForPlan(planId);
            const lastEntry = progressEntries
                .filter(e => e.exercise === exercise)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

            if (lastEntry) {
                if (weight > lastEntry.weight || (weight === lastEntry.weight && reps > lastEntry.reps)) {
                    showToast({
                        message: `Meilenstein erreicht! ${exercise}: ${weight} kg x ${reps} Wdh. 🎉`,
                        type: 'success',
                        emoji: '🎉',
                    });
                    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                }
            }
        }
    };

    const debouncedCalcGlyLoad = debounce(() => {
        if (!validateGlyLoad().length) calculateGlyLoad()
    })
    watch([glFood, glServing, glCarbs100, glGi], () => {
        if (autoCalcEnabled.value) debouncedCalcGlyLoad()
    })
    watch(autoCalcEnabled, (on) => {
        if (!on) return
        debouncedCalcGlyLoad()
    })

    const glyloadData = localStorage.getItem('progress_glyload')
    if (glyloadData) {
        const parsed = JSON.parse(glyloadData)
        glFood.value = parsed.food
        glServing.value = parsed.serving
        glCarbs100.value = parsed.carbs100
        glGi.value = parsed.gi
        glResult.value = parsed.result
    }

    const caffeineData = localStorage.getItem('progress_caffeine')
    if (caffeineData) {
        const parsed = JSON.parse(caffeineData)
        cafWeight.value = parsed.weight
        cafSensitivity.value = parsed.sensitivity
        cafStatus.value = parsed.status
        cafResult.value = parsed.result
    }

    const celebrateMilestone = (message: string) => {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        addToast(message, 'default');
    };

    const debouncedCalcCaffeine = debounce(() => {
        if (!validateCaffeine().length) calculateCaffeine()
    })
    watch([cafWeight, cafSensitivity, cafStatus], () => {
        if (autoCalcEnabled.value) debouncedCalcCaffeine()
    })
    watch(autoCalcEnabled, (on) => {
        if (!on) return
        debouncedCalcCaffeine()
    })

    const saveToLocalStorage = (key: string, data: any) => {
        try {
            localStorage.setItem(`progress_${key}`, JSON.stringify(data));
        } catch (err) {
            console.error(`Error saving ${key} to localStorage:`, err);
        }
    };

    const loadFromLocalStorage = () => {
        try {
            // Load Progress data
            const bmiData = localStorage.getItem('progress_bmi');
            if (bmiData) {
                const parsed = JSON.parse(bmiData);
                bmiGender.value = parsed.gender;
                bmiWeight.value = parsed.weight;
                bmiHeight.value = parsed.height;
                bmiResult.value = parsed.result;
            }
            const calorieData = localStorage.getItem('progress_calories');
            if (calorieData) {
                const parsed = JSON.parse(calorieData);
                calorieAge.value = parsed.age;
                calorieGender.value = parsed.gender;
                calorieWeight.value = parsed.weight;
                calorieHeight.value = parsed.height;
                calorieActivity.value = parsed.activity;
                calorieGoal.value = parsed.goal;
                calorieResult.value = parsed.result;
            }
            const oneRmData = localStorage.getItem('progress_oneRm');
            if (oneRmData) {
                const parsed = JSON.parse(oneRmData);
                oneRmExercise.value = parsed.exercise;
                oneRmWeight.value = parsed.weight;
                oneRmReps.value = parsed.reps;
                oneRmResult.value = parsed.result;
            }
            const bodyFatData = localStorage.getItem('progress_bodyFat');
            if (bodyFatData) {
                const parsed = JSON.parse(bodyFatData);
                bodyFatGender.value = parsed.gender;
                bodyFatWaist.value = parsed.waist;
                bodyFatNeck.value = parsed.neck;
                bodyFatHip.value = parsed.hip;
                bodyFatHeight.value = parsed.height;
                bodyFatResult.value = parsed.result;
            }
            const ffmiData = localStorage.getItem('progress_ffmi');
            if (ffmiData) {
                const parsed = JSON.parse(ffmiData);
                ffmiWeight.value = parsed.weight;
                ffmiHeight.value = parsed.height;
                ffmiBodyFat.value = parsed.bodyFat;
                ffmiResult.value = parsed.result;
            }
            const waterData = localStorage.getItem('progress_water');
            if (waterData) {
                const parsed = JSON.parse(waterData);
                waterWeight.value = parsed.weight;
                waterActivity.value = parsed.activity;
                waterClimate.value = parsed.climate;
                waterResult.value = parsed.result;
            }
            const goalData = localStorage.getItem('progress_goal');
            if (goalData) {
                const parsed = JSON.parse(goalData);
                goal.value = parsed.goal;
            }
            const workoutsData = localStorage.getItem('progress_workouts');
            if (workoutsData) {
                const parsed = JSON.parse(workoutsData);
                workouts.value = parsed;
            }
            const proteinData = localStorage.getItem('progress_protein')
            if (proteinData) {
                const parsed = JSON.parse(proteinData)
                proteinWeight.value = parsed.weight
                proteinGoal.value = parsed.goal
                proteinResult.value = parsed.result

                if (autoCalcEnabled.value && !validateProtein().length) {
                    calculateProtein()
                }
            }

            // Load Training Plans
            const trainingData = localStorage.getItem('trainingData');
            if (trainingData) {
                try {
                    const parsedTraining = JSON.parse(trainingData);
                    if (parsedTraining && Array.isArray(parsedTraining.plans)) {
                        trainingPlans.value = parsedTraining.plans;
                        console.log(`Geladene Trainingspläne: ${trainingPlans.value.length}`);
                    } else {
                        console.warn("trainingData gefunden, aber 'plans' ist kein Array oder fehlt.");
                        trainingPlans.value = [];
                    }
                } catch (e) {
                    console.error('Error parsing trainingData:', e);
                    trainingPlans.value = [];
                }
            } else {
                console.log("Keine trainingData im localStorage gefunden.");
                trainingPlans.value = [];
            }
        } catch (err) {
            console.error('Error loading from localStorage:', err);
            trainingPlans.value = [];
        }
    };

    const openWeightPopup = () => {
        newWeight.value = null;
        showWeightPopup.value = true;
        nextTick(() => {
            if (weightInput.value) weightInput.value.focus();
        });
    };

    const saveWeight = () => {
        const error = validateWeight(newWeight.value);
        if (error) {
            openValidationPopupError([error]);
            return;
        }
        const today = new Date().toISOString().split('T')[0];
        const weightKg = displayToKg(Number(newWeight.value));
        weightHistory.value.unshift({ date: today, weight: weightKg });
        newWeight.value = null;
        updateWeightChart();
        addToast('Gewicht gespeichert', 'save');
        checkMilestones();
        closeWeightPopup();
    };

    const downloadResult = (fmt: 'pdf' | 'html' | 'csv' | 'json' | 'txt') => {
        downloadFormat.value = fmt as any;
        confirmDownload();
    };

    const closeWeightPopup = () => {
        showWeightPopup.value = false;
        newWeight.value = null;
    };

    const openGoalPopup = () => {
        newGoal.value = null;
        showGoalPopup.value = true;
        nextTick(() => {
            if (goalInput.value) goalInput.value.focus();
        });
    };

    const saveGoal = () => {
        const error = validateGoal(newGoal.value);
        if (error) {
            openValidationPopupError([error]);
            return;
        }
        goal.value = displayToKg(Number(newGoal.value));
        saveToLocalStorage('goal', { goal: goal.value });
        addToast('Zielgewicht gespeichert', 'default');
        closeGoalPopup();
    };

    const closeGoalPopup = () => {
        showGoalPopup.value = false;
        newGoal.value = null;
    };

    const openValidationPopupError = (errors: string[]) => {
        validationErrorMessages.value = errors;
        showValidationPopup.value = true;
        nextTick(() => {
            if (validationOkButton.value) validationOkButton.value.focus();
        });
    };

    const closeValidationPopup = () => {
        showValidationPopup.value = false;
        validationErrorMessages.value = [];
    };

    const addToast = (
        message: string,
        type: 'delete' | 'add' | 'save' | 'timer' | 'load' | 'reset' | 'default' = 'load'
    ) => {

        if (!toastsEnabled.value) return;

        if (toastTimeout) {
            clearTimeout(toastTimeout);
            toast.value = null;
        }
        const id = toastId++;
        const emojis = {
            delete: '🗑️',
            add: '✅',
            save: '💾',
            timer: '⏰',
            load: '📋',
            reset: '♻️',
            default: '📋',
        } as const;

        const types = {
            delete: 'toast-delete',
            add: 'toast-add',
            save: 'toast-save',
            timer: 'toast-timer',
            load: 'toast-default',
            reset: 'toast-reset',
            default: 'toast-default',
        } as const;

        const mapped = types[type];
        toast.value = { id, message, emoji: emojis[type], type: mapped, exiting: false };

        toastTimeout = setTimeout(() => {
            if (toast.value) {
                toast.value.exiting = true;
                setTimeout(() => {
                    toast.value = null;
                    toastTimeout = null;
                }, 300);
            }
        }, 3000);
    };


    const handleOverlayClick = (event: MouseEvent) => {
        if (event.target === event.currentTarget) {
            closeWeightPopup();
            closeGoalPopup();
            closeProgressPopup();
            closeValidationPopup();
            closeDownloadPopup();
        }
    };

    const handleKeydown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            closeWeightPopup();
            closeGoalPopup();
            closeProgressPopup();
            closeValidationPopup();
            closeDownloadPopup();
        } else if (event.key === 'Enter') {
            if (showValidationPopup.value) {
                event.preventDefault();
                closeValidationPopup();
            } else if (showWeightPopup.value) {
                event.preventDefault();
                saveWeight();
            } else if (showGoalPopup.value) {
                event.preventDefault();
                saveGoal();
            } else if (showProgressPopup.value) {
                event.preventDefault();
                saveProgress();
            } else if (showDownloadPopup.value) {
                event.preventDefault();
                confirmDownload();
            }
        }
    };

    let weightChart: Chart | null = null;
    let workoutChart: Chart | null = null;
    let macroChart: Chart | null = null;

    const updateWeightChart = () => {
        const canvas = document.getElementById('weightChart') as HTMLCanvasElement;
        if (!canvas || activeTab.value !== 'stats') return;

        if (weightChart) weightChart.destroy();
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        weightChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: weightHistory.value.map((entry) => formatDate(entry.date)).reverse(),
                datasets: [
                    {
                        label: `Gewicht (${unit.value})`,
                        data: weightHistory.value.map((entry) => kgToDisplay(entry.weight)).reverse(),
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.2)',
                        fill: true,
                        tension: 0.4,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: { backgroundColor: '#ffffff', titleColor: '#1f2937', bodyColor: '#6b7280' },
                    legend: { labels: { color: '#1f2937' } },
                },
                scales: {
                    x: { ticks: { color: '#6b7280' } },
                    y: { beginAtZero: false, ticks: { color: '#6b7280' } },
                },
            },
        });

        // Dark-Mode-Anpassungen
        if (document.documentElement.classList.contains('dark-mode') && weightChart) {
            weightChart.options.plugins!.tooltip!.backgroundColor = '#1f2937';
            weightChart.options.plugins!.tooltip!.titleColor = '#e5e7eb';
            weightChart.options.plugins!.tooltip!.bodyColor = '#9ca3af';
            weightChart.options.plugins!.legend!.labels!.color = '#e5e7eb';
            weightChart.options.scales!.x!.ticks!.color = '#9ca3af';
            weightChart.options.scales!.y!.ticks!.color = '#9ca3af';
            weightChart.data.datasets[0].borderColor = '#818cf8';
            weightChart.data.datasets[0].backgroundColor = 'rgba(129, 140, 248, 0.2)';
            weightChart.update();
        }
    };

    const copyText = async (text: string) => {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text)
            } else {
                const ta = document.createElement('textarea')
                ta.value = text
                ta.style.position = 'fixed'
                ta.style.left = '-9999px'
                document.body.appendChild(ta)
                ta.focus()
                ta.select()
                document.execCommand('copy')
                document.body.removeChild(ta)
            }
            addToast('In Zwischenablage kopiert', 'save')
        } catch (e) {
            console.error(e)
            addToast('Kopieren fehlgeschlagen', 'default')
        }
    }

    const copyBMI = () => {
        if (!bmiResult.value) return
        const txt = `BMI-Ergebnis
- BMI: ${bmiResult.value.value.toFixed(1)}
- Kategorie: ${bmiResult.value.category}
- Gewicht: ${bmiWeight.value ?? '-'} ${unit.value}
- Größe: ${bmiHeight.value ?? '-'} cm`
        copyText(txt)
    }

    const copyCalories = () => {
        if (!calorieResult.value) return
        const r = calorieResult.value
        const txt = `Kalorienbedarf
- Gesamt: ${r.total.toFixed(0)} kcal
- Makros: KH ${r.macros.carbs.toFixed(0)}g, Protein ${r.macros.protein.toFixed(0)}g, Fett ${r.macros.fat.toFixed(0)}g
- Alter: ${calorieAge.value ?? '-'} J, Geschlecht: ${calorieGender.value}
- Gewicht: ${calorieWeight.value ?? '-'} ${unit.value}, Größe: ${calorieHeight.value ?? '-'} cm
- Aktivität: ${calorieActivity.value}, Ziel: ${calorieGoal.value > 0 ? '+' : ''}${calorieGoal.value} kcal`
        copyText(txt)
    }

    const copyOneRm = () => {
        if (!oneRmResult.value) return
        const txt = `1RM-Schätzung
- Übung: ${oneRmExercise.value || '-'}
- 1RM: ${formatWeight(oneRmResult.value, 1)}
- Eingabe: ${oneRmWeight.value ?? '-'} ${unit.value} x ${oneRmReps.value ?? '-'}`
        copyText(txt)
    }

    const copyBodyFat = () => {
        if (!bodyFatResult.value) return
        const txt = `Körperfett (US Navy)
- Körperfett: ${bodyFatResult.value.toFixed(1)}%
- Geschlecht: ${bodyFatGender.value}
- Maße: Bauch ${bodyFatWaist.value ?? '-'} cm, Hals ${bodyFatNeck.value ?? '-'} cm${bodyFatGender.value === 'female' ? `, Hüfte ${bodyFatHip.value ?? '-'} cm` : ''}
- Größe: ${bodyFatHeight.value ?? '-'} cm`
        copyText(txt)
    }

    const copyFFMI = () => {
        if (!ffmiResult.value) return
        const txt = `FFMI
- FFMI: ${ffmiResult.value.value.toFixed(1)} (${ffmiResult.value.category})
- Gewicht: ${ffmiWeight.value ?? '-'} ${unit.value}
- Größe: ${ffmiHeight.value ?? '-'} cm
- KFA: ${ffmiBodyFat.value ?? '-'}%`
        copyText(txt)
    }

    const copyWater = () => {
        if (!waterResult.value) return
        const txt = `Wasserbedarf
- Empfehlung: ${waterResult.value.toFixed(1)} Liter/Tag
- Gewicht: ${waterWeight.value ?? '-'} ${unit.value}
- Aktivität: ${waterActivity.value}
- Klima: ${waterClimate.value}`
        copyText(txt)
    }


    const updateWorkoutChart = () => {
        const canvas = document.getElementById('workoutChart') as HTMLCanvasElement;
        if (!canvas || activeTab.value !== 'stats') return;

        if (workoutChart) workoutChart.destroy();
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        workoutChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: workouts.value.map((w) => w.exercise),
                datasets: [
                    {
                        label: `Gewicht (${unit.value})`,
                        data: workouts.value.map((w) => kgToDisplay(w.weight)),
                        backgroundColor: '#6366f1',
                        borderColor: '#4338ca',
                        borderWidth: 1,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: { backgroundColor: '#ffffff', titleColor: '#1f2937', bodyColor: '#6b7280' },
                    legend: { labels: { color: '#1f2937' } },
                },
                scales: {
                    x: { ticks: { color: '#6b7280' } },
                    y: { beginAtZero: true, ticks: { color: '#6b7280' } },
                },
            },
        });

        // Dark-Mode-Anpassungen
        if (document.documentElement.classList.contains('dark-mode') && workoutChart) {
            workoutChart.options.plugins!.tooltip!.backgroundColor = '#1f2937';
            workoutChart.options.plugins!.tooltip!.titleColor = '#e5e7eb';
            workoutChart.options.plugins!.tooltip!.bodyColor = '#9ca3af';
            workoutChart.options.plugins!.legend!.labels!.color = '#e5e7eb';
            workoutChart.options.scales!.x!.ticks!.color = '#9ca3af';
            workoutChart.options.scales!.y!.ticks!.color = '#9ca3af';
            workoutChart.data.datasets[0].backgroundColor = '#818cf8';
            workoutChart.data.datasets[0].borderColor = '#4b5563';
            workoutChart.update();
        }
    };


    const updateMacroChart = () => {
        const canvas = document.getElementById('macroChart') as HTMLCanvasElement;
        if (!canvas || activeTab.value !== 'calculators' || !calorieResult.value) return;
        if (macroChart) macroChart.destroy();
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        macroChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Kohlenhydrate', 'Eiweiß', 'Fett'],
                datasets: [{
                    data: [
                        calorieResult.value.macros.carbs,
                        calorieResult.value.macros.protein,
                        calorieResult.value.macros.fat,
                    ],
                    backgroundColor: ['#6366f1', '#10b981', '#f59e0b'],
                    borderWidth: 1,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { color: '#1f2937' } },
                    tooltip: { backgroundColor: '#ffffff', titleColor: '#1f2937', bodyColor: '#6b7280' },
                },
            },
        });
        if (document.documentElement.classList.contains('dark-mode') && macroChart) {
            macroChart.options.plugins!.legend!.labels!.color = '#e5e7eb';
            macroChart.options.plugins!.tooltip!.backgroundColor = '#1f2937';
            macroChart.options.plugins!.tooltip!.titleColor = '#e5e7eb';
            macroChart.options.plugins!.tooltip!.bodyColor = '#9ca3af';
            macroChart.update();
        }
    };

    onMounted(() => {
        const flag = localStorage.getItem('autoCalcEnabled')
        autoCalcEnabled.value = flag === 'true'
        loadFavoriteCalculators()

        const stored = localStorage.getItem('toastsEnabled')
        toastsEnabled.value = stored === null ? true : stored === 'true'

        // Live-Updates aus Settings.vue
        window.addEventListener('toasts-enabled-changed', handleToastsSetting)
    })

    function handleToastsSetting(e: Event) {
        const enabled = Boolean((e as CustomEvent).detail)
        toastsEnabled.value = enabled
        if (!enabled && toast.value) {
            toast.value = null
            if (toastTimeout) {
                clearTimeout(toastTimeout)
                toastTimeout = null
            }
        }
    }

    // ===== Favoriten-Rechner =====
    const favoriteCalculators = ref < Set < string >> (new Set())

    const FAVORITES_KEY = 'progress_favorite_calculators'

    const loadFavoriteCalculators = () => {
        try {
            const raw = localStorage.getItem(FAVORITES_KEY)
            if (!raw) return
            const arr: string[] = JSON.parse(raw)
            favoriteCalculators.value = new Set(arr)
        } catch (e) {
            console.error('Fehler beim Laden der Lieblings-Rechner:', e)
        }
    }

    const saveFavoriteCalculators = () => {
        try {
            localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favoriteCalculators.value]))
        } catch (e) {
            console.error('Fehler beim Speichern der Lieblings-Rechner:', e)
        }
    }

    const toggleFavCalculator = (id: string) => {
        if (favoriteCalculators.value.has(id)) {
            favoriteCalculators.value.delete(id)
            addToast('Favorit entfernt', 'default')
        } else {
            favoriteCalculators.value.add(id)
            addToast('Als Favorit markiert', 'default')
        }
        saveFavoriteCalculators()
    }

    const isFavCalculator = (id: string) => favoriteCalculators.value.has(id)

    // ===== Auto-BMI =====
    const debouncedCalcBMI = debounce(() => {
        if (!validateBMI().length) calculateBMI()
    })
    watch([bmiGender, bmiWeight, bmiHeight], () => {
        if (autoCalcEnabled.value) debouncedCalcBMI()
    })

    // ===== Auto-Kalorien =====
    const debouncedCalcCalories = debounce(() => {
        if (!validateCalories().length) calculateCalories()
    })
    watch([calorieAge, calorieGender, calorieWeight, calorieHeight, calorieActivity, calorieGoal], () => {
        if (autoCalcEnabled.value) debouncedCalcCalories()
    })

    // ===== Auto-1RM =====
    const debouncedCalc1RM = debounce(() => {
        if (!validateOneRm().length) calculateOneRm()
    })
    watch([oneRmWeight, oneRmReps, oneRmExercise], () => {
        if (autoCalcEnabled.value) debouncedCalc1RM()
    })

    // ===== Auto-Körperfett =====
    const debouncedCalcBodyFat = debounce(() => {
        if (!validateBodyFat().length) calculateBodyFat()
    })
    watch([bodyFatGender, bodyFatWaist, bodyFatNeck, bodyFatHip, bodyFatHeight], () => {
        if (autoCalcEnabled.value) debouncedCalcBodyFat()
    })

    // ===== Auto-FFMI =====
    const debouncedCalcFFMI = debounce(() => {
        if (!validateFFMI().length) calculateFFMI()
    })
    watch([ffmiWeight, ffmiHeight, ffmiBodyFat], () => {
        if (autoCalcEnabled.value) debouncedCalcFFMI()
    })

    // ===== Auto-Wasser =====
    const debouncedCalcWater = debounce(() => {
        if (!validateWater().length) calculateWater()
    })
    watch([waterWeight, waterActivity, waterClimate], () => {
        if (autoCalcEnabled.value) debouncedCalcWater()
    })

    watch(autoCalcEnabled, (on) => {
        if (!on) return
        debouncedCalcBMI()
        debouncedCalcCalories()
        debouncedCalc1RM()
        debouncedCalcBodyFat()
        debouncedCalcFFMI()
        debouncedCalcWater()
    })

    const debouncedCalcProtein = debounce(() => {
        if (!validateProtein().length) calculateProtein()
    }, 300)

    watch([proteinWeight, proteinGoal, unit], () => {
        if (autoCalcEnabled.value) debouncedCalcProtein()
    }, { flush: 'post' })

    watch(autoCalcEnabled, (on) => {
        if (on) debouncedCalcProtein()
    })

    watch([proteinWeight, proteinGoal], () => {
        if (autoCalcEnabled.value && !validateProtein().length) calculateProtein()
    }, { immediate: true, flush: 'post' })


    watch(activeTab, (newValue) => {
        nextTick(() => {
            if (newValue === 'stats') {
                updateWeightChart();
                updateWorkoutChart();
                if (macroChart) macroChart.destroy();
                macroChart = null;
            } else if (newValue === 'calculators' && calorieResult.value) {
                updateMacroChart();
                if (weightChart) weightChart.destroy();
                if (workoutChart) workoutChart.destroy();
                weightChart = null;
                workoutChart = null;
            } else {
                if (weightChart) weightChart.destroy();
                if (workoutChart) workoutChart.destroy();
                if (macroChart) macroChart.destroy();
                weightChart = null;
                workoutChart = null;
                macroChart = null;
            }
        });
    }, { immediate: true });

    watch(unit, () => {
        if (activeTab.value === 'stats') {
            updateWeightChart();
            updateWorkoutChart();
        }
    });

    onMounted(() => {
        loadFromLocalStorage();
        checkMilestones();
        window.addEventListener('keydown', handleKeydown);
    });

    onUnmounted(() => {
        window.removeEventListener('keydown', handleKeydown);
        window.removeEventListener('toasts-enabled-changed', handleToastsSetting);
        if (weightChart) weightChart.destroy();
        if (workoutChart) workoutChart.destroy();
        if (macroChart) macroChart.destroy();
    });
</script>

<style scoped>
    .progress {
        padding: 2rem;
        background: var(--bg-primary);
        min-height: 100vh;
        font-family: 'Inter', sans-serif;
        color: var(--text-primary);
    }

    .page-title {
        font-size: 2.25rem;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 1rem;
        letter-spacing: -0.025em;
    }

    .page-subtext {
        color: var(--text-secondary);
        margin-bottom: 2rem;
        font-size: 1rem;
        font-weight: 500;
    }

    .dashboard-container {
        max-width: 1200px;
        margin: 0 auto;
    }

    .calc-filterbar {
        display: flex;
        align-items: center;
        gap: .75rem;
        margin: 0 0 1rem 0;
    }

    .calc-filterlabel {
        font-size: .9rem;
        color: var(--text-secondary);
    }

    .calc-filterselect {
        padding: .5rem .75rem;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        background: var(--bg-secondary);
        color: var(--text-primary);
        font-size: .9rem;
    }

        .calc-filterselect:focus {
            outline: none;
            border-color: var(--accent-primary);
            box-shadow: 0 0 5px rgba(99,102,241,0.5);
        }

    .dashboard-grid {
        display: flex;
        gap: 1.5rem;
        flex-wrap: wrap;
        margin-bottom: 2rem;
        overflow: visible;
    }

    .btn-ghost.mini {
        padding: .35rem .6rem;
        font-size: .8rem;
        border-radius: 6px;
    }

    .fav-btn {
        background: transparent;
        border: none;
        font-size: 1.25rem;
        line-height: 1;
        cursor: pointer;
        padding: .25rem .4rem;
        border-radius: 8px;
        color: #6b7280;
        transition: color .2s, text-shadow .2s, transform .1s;
    }

        .fav-btn:hover {
            color: #F59E0B;
            text-shadow: 0 0 8px #F59E0B, 0 0 4px #F59E0B;
            transform: scale(1.05);
        }

        .fav-btn.active {
            color: #F59E0B;
            text-shadow: 0 0 8px #F59E0B, 0 0 4px #F59E0B;
        }

    .card-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 0.5rem;
    }

    .card-info {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--accent-primary);
    }

    .progress-charts {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
    }

    .calculator-card {
        display: inline-block;
        width: 100%;
        break-inside: avoid;
        margin: 0 0 1.5rem;
    }


    .plans-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 2rem;
        margin-bottom: 2rem;
        overflow: visible;
    }

    .plans-list {
        display: contents;
    }

    .plan-card {
        background: var(--bg-card);
        padding: 2rem;
        border-radius: 12px;
        box-shadow: var(--shadow-light);
        border: 1px solid var(--border-color);
        transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
        position: relative;
        z-index: 1;
        cursor: pointer;
    }

        .plan-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(255, 255, 255, 0));
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
        }

        .plan-card:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-hover);
            border-color: var(--accent-primary);
        }

            .plan-card:hover::before {
                opacity: 1;
            }

        .plan-card h3 {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 0.75rem;
            color: var(--text-primary);
        }

        .plan-card p {
            font-size: 1rem;
            color: var(--text-secondary);
            line-height: 1.5;
        }

        .plan-card .plan-description {
            font-size: 1rem;
            color: var(--text-secondary);
            line-height: 1.5;
            margin-bottom: 1rem;
        }

    :root {
        --shadow-light: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .plan-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 1rem;
    }

    .exercise-list {
        list-style: none;
        padding: 0;
        margin-bottom: 1rem;
    }

        .exercise-list li {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0.5rem 0;
            font-size: 0.95rem;
            color: var(--text-secondary);
        }

    .progress-bar {
        background: var(--bg-progress-bar);
        height: 8px;
        border-radius: 4px;
        overflow: hidden;
    }

    .progress-bar-fill {
        background: var(--accent-primary);
        height: 100%;
        transition: width 0.3s ease;
    }

    .no-plans {
        grid-column: 1 / -1;
        text-align: center;
        color: var(--text-secondary);
        font-size: 1rem;
        padding: 2rem;
        background: var(--bg-card);
        border-radius: 16px;
        border: 1px solid var(--border-color);
    }

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }

    .card-actions {
        display: flex;
        gap: 0.5rem;
    }

    .action-btn {
        background: none;
        border: none;
        font-size: 1rem;
        cursor: pointer;
        color: var(--text-secondary);
        transition: color 0.3s ease;
        padding: 0.25rem;
    }

        .action-btn:hover {
            color: var(--accent-primary);
        }

    /* ===================== EXPORT-POPUP ===================== */

    .plans-section {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    /* ===================== BERECHNEN BUTTON ===================== */

    .downloaddistance {
        margin-bottom: 0.5rem;
        display: block;
    }

    .card-footer {
        border-top: 1px solid var(--border-color);
        padding: 0.75rem 1rem 0;
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
    }

    .footer-spacer {
        flex: 1
    }

    .footer-actions {
        display: flex;
        gap: .5rem;
        flex-wrap: wrap;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
        }

        to {
            opacity: 1;
        }
    }

    @keyframes slideIn {
        from {
            transform: translateY(20px);
            opacity: 0;
        }

        to {
            transform: translateY(0);
            opacity: 1;
        }
    }

    @media (max-width: 600px) {

        .progress {
            padding: 1rem;
        }

        .page-title {
            font-size: 1.75rem;
        }

        .dashboard-grid {
            flex-direction: column;
            overflow-x: visible;
        }

        .card {
            min-width: auto;
            width: 100%;
        }

        .progress-charts,
        .calculators-grid,
        .plans-grid {
            grid-template-columns: 1fr;
        }

        .chart-container {
            height: 250px;
        }

        .plans-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
        }

        .plan-card {
            padding: 1.5rem;
        }

            .plan-card h3 {
                font-size: 1.1rem;
            }

        .plan-description,
        .progress-text {
            font-size: 0.9rem;
        }

        .progress-entries h4 {
            font-size: 1rem;
        }

        .progress-entries li {
            font-size: 0.85rem;
        }

        .plan-card p {
            font-size: 0.9rem;
        }
    }
</style>
