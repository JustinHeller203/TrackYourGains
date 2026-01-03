<!--Progress.vue-->
<template>
    <div class="progress">
        <!-- ===================== HEADER / INTRO ===================== -->
        <h2 class="page-title">📊 Dein Fortschritt</h2>
        <p class="page-subtext">Alles Wichtige auf einen Blick.</p>

        <div class="dashboard-container">
            <!-- ===================== DASHBOARD-CARDS ===================== -->
            <div class="dashboard-grid">
                <!-- Mobile-Compact nur im Statistiken-Tab -->
                <DashboardCard title="Aktuelles Gewicht"
                               :info="currentWeightDisplay"
                               :muted="!weightHistory.length"
                               :compact="compactCards"
                               clickable
                               @click="openWeightPopup" />

                <DashboardCard title="Kalorien heute"
                               :info="totalCalories + ' / 2500 kcal'"
                               :compact="compactCards" />

                <DashboardCard title="Letztes Training"
                               :info="lastWorkout || 'Kein Training erfasst'"
                               :muted="!lastWorkout"
                               :compact="compactCards" />

                <DashboardCard title="Zielgewicht"
                               :info="goal ? formatWeight(goal, 1) : 'Kein Ziel gesetzt'"
                               :compact="compactCards"
                               clickable
                               @click="openGoalPopup" />
            </div>

            <!-- ===================== TABS ===================== -->
            <TabsBar v-model:modelValue="activeTab"
                     :searchQuery="searchQuery"
                     :planSearchQuery="planSearchQuery"
                     :calcCategory="calcCategory"
                     @update:searchQuery="val => (searchQuery = val)"
                     @update:planSearchQuery="val => (planSearchQuery = val)"
                     @update:calcCategory="val => (calcCategory = val)" />

            <!-- ===================== STATISTIKEN TAB ===================== -->
            <div v-show="activeTab === 'stats'" class="progress-charts">
                <ChartCard title="Gewichtsverlauf"
                           :hasData="hasWeightStats"
                           exportable
                           @export="openDownloadPopup('weightStats')"
                           @reset="resetWeightStats">
                    <canvas id="weightChart" class="chart-canvas"></canvas>
                </ChartCard>

                <ChartCard title="Trainingsstatistik"
                           :hasData="hasWorkoutStats"
                           exportable
                           @export="openDownloadPopup('workoutStats')"
                           @reset="resetWorkoutStats">
                    <template #subtitle>
                        <p class="card-info">Gesamt-Workouts: {{ workouts.length }}</p>
                    </template>
                    <canvas id="workoutChart" class="chart-canvas"></canvas>
                </ChartCard>
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

                    <!-- Burn Rate Favorit -->
                    <BurnRateCalculator v-if="isFavorite('Burn Rate') && matchesCalc('Burn Rate')"
                                        :unit="unit"
                                        :autoCalcEnabled="autoCalcEnabled"
                                        :burnStartWeight="burnStartWeight"
                                        :burnGoalWeight="burnGoalWeight"
                                        :burnMaintenance="burnMaintenance"
                                        :burnIntake="burnIntake"
                                        :burnResult="burnRateResult"
                                        :isFavorite="true"
                                        @toggleFavorite="() => toggleFavorite('Burn Rate')"
                                        @update:burnStartWeight="(v: number | null) => (burnStartWeight = v)"
                                        @update:burnGoalWeight="(v: number | null) => (burnGoalWeight = v)"
                                        @update:burnMaintenance="(v: number | null) => (burnMaintenance = v)"
                                        @update:burnIntake="(v: number | null) => (burnIntake = v)"
                                        @calculate="calculateBurnRate"
                                        @copy="copyBurnRate"
                                        @export="openDownloadPopup('burnRate')"
                                        @reset="resetCalculator('burnRate')" />

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
                                            :glCarbs="glCarbs"
                                            :glResult="glResult"
                                            :glCategory="glCategory"
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

                <!-- Burn Rate Standard -->
                <BurnRateCalculator v-if="matchesCalc('Burn Rate') && !isFavorite('Burn Rate')"
                                    :unit="unit"
                                    :autoCalcEnabled="autoCalcEnabled"
                                    :burnStartWeight="burnStartWeight"
                                    :burnGoalWeight="burnGoalWeight"
                                    :burnMaintenance="burnMaintenance"
                                    :burnIntake="burnIntake"
                                    :burnResult="burnRateResult"
                                    :isFavorite="isFavorite('Burn Rate')"
                                    @toggleFavorite="() => toggleFavorite('Burn Rate')"
                                    @update:burnStartWeight="(v: number | null) => (burnStartWeight = v)"
                                    @update:burnGoalWeight="(v: number | null) => (burnGoalWeight = v)"
                                    @update:burnMaintenance="(v: number | null) => (burnMaintenance = v)"
                                    @update:burnIntake="(v: number | null) => (burnIntake = v)"
                                    @calculate="calculateBurnRate"
                                    @copy="copyBurnRate"
                                    @export="openDownloadPopup('burnRate')"
                                    @reset="resetCalculator('burnRate')" />

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
                                        :glCarbs="glCarbs"
                                        :glResult="glResult"
                                        :glCategory="glCategory"
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
                <!-- Progress.vue – REPLACE in "Pläne" -> "Trainingspläne" -->
                <div class="workout-list">
                    <h3 class="section-title">Deine Trainingspläne</h3>

                    <div v-if="!trainingPlans.length" class="list-item">
                        Noch keine Trainingspläne – erstelle welche unter „Training“.
                    </div>

                    <template v-else>
                        <div v-if="favoritePlans.length">
                            <h4 class="section-title" style="margin-top: .5rem;">Favoriten</h4>
                            <div v-for="plan in favoritePlans" :key="plan.id" class="list-item plan-item">
                                <span>{{ plan.name }} ({{ plan.exercises.length }} Übungen)</span>
                                <div class="list-item-actions">
                                    <button class="open-btn" @click="openPlanProgress(plan.id)">Öffnen</button>
                                </div>
                            </div>
                        </div>

                        <div v-if="otherPlans.length">
                            <h4 class="section-title" style="margin-top: .5rem;">Weitere Pläne</h4>
                            <div v-for="plan in otherPlans" :key="plan.id" class="list-item plan-item">
                                <span>{{ plan.name }} ({{ plan.exercises.length }} Übungen)</span>
                                <div class="list-item-actions">
                                    <button class="open-btn" @click="openPlanProgress(plan.id)">Öffnen</button>
                                </div>
                            </div>
                        </div>
                    </template>
                </div>

                <div class="plan-card" v-if="matchesPlanSearch('Ernährungsplan')">
                    <div class="card-header">
                        <h3 class="card-title">🥗 Ernährungsplan</h3>
                        <div class="card-actions">
                            <ActionIconButton ariaLabel="Ernährungsplan herunterladen"
                                              title="Herunterladen"
                                              @click="openDownloadPopup('nutrition')">
                                ⬇️
                            </ActionIconButton>
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

        <ProgressEntryModal ref="progressEntryModalRef"
                            v-model:show="showProgressPopup"
                            :isEditing="Boolean(editingEntry)"
                            @delete="() => {
    if (currentPlanId && editingEntry) {
      deleteProgressEntry(currentPlanId, editingEntry.date)
      editingEntry = null
      showProgressPopup = false
      if (reopenPlanProgressAfterSave) {
        showPlanProgressPopup = true
        reopenPlanProgressAfterSave = false
      }
    }
  }"
                            v-model:showExtras="showProgressExtras"
                            :unit="unit"
                            :exercises="getExercisesForPlan(currentPlanId)"
                            v-model:exercise="currentExercise"
                            v-model:sets="newProgressSets"
                            v-model:weight="newProgressWeight"
                            v-model:reps="newProgressReps"
                            v-model:note="newProgressNote"
                            :inputType="detectedInputType"
                            v-model:duration="newProgressDuration"
                            v-model:distance="newProgressDistance"
                            :errors="validationErrorMessages"
                            @save="saveProgress"
                            @cancel="cancelProgressEdit"
                            @dismissErrors="clearValidation"
                            v-model:setDetails="newProgressSetDetails"
                            v-model:tempo="newProgressTempo"
                            v-model:restSeconds="newProgressRestSeconds"
                            v-model:avgHr="newProgressAvgHr"
                            v-model:calories="newProgressCalories"
                            v-model:pace="newProgressPace"
                            v-model:hrZone="newProgressHrZone"
                            v-model:borg="newProgressBorg"
                            v-model:painFree="newProgressPainFree"
                            v-model:movementQuality="newProgressMovementQuality"
                            v-model:equipment="newProgressEquipment"
                            v-model:equipmentCustom="newProgressEquipmentCustom"
                            v-model:side="newProgressSide"
                            @invalid="openValidationPopupError" />

        <!-- Fortschritt ansehen (Cards je Tag) — OHNE Teleport -->
        <PlanProgressPopup ref="planProgressPopupRef"
                           :show="showPlanProgressPopup"
                           :currentPlanId="currentPlanId"
                           :currentPlanName="currentPlanName"
                           :dayCards="dayCards"
                           :visibleDayCards="visibleDayCards"
                           v-model:visibleDays="visibleDays"
                           :expandedDays="expandedDays"
                           :formatDayLong="formatDayLong"
                           :cardioForDay="cardioForDay"
                           :stretchForDay="stretchForDay"
                           @close="closePlanProgressPopup"
                           @add-entry="addEntryFromPlanView"
                           @download="(planId) => openDownloadPopup('progress', planId)"
                           @edit-day="editLatestEntryForDay"
                           @toggle-day="toggleDay" />

        <!-- Export-Popup -->
        <ExportPopup :show="showDownloadPopup"
                     v-model="downloadFormat"
                     @confirm="confirmDownload"
                     @cancel="closeDownloadPopup" />

        <!-- Validation Popup-->
        <ValidationPopup :show="validationErrorMessages.length > 0"
                         :errors="validationErrorMessages"
                         @close="clearValidation" />

        <!-- Delete Confirm Popup (für Stats-Resets) -->
        <DeleteConfirmPopup :show="showDeleteConfirmPopup"
                            @confirm="confirmDeleteNow"
                            @cancel="cancelDeleteConfirm" />


        <!-- Toast -->
        <Toast v-if="toast"
               :toast="toast"
               :dismissible="true"
               :autoDismiss="true"
               :position="toastPosition"
               @dismiss="onToastDismiss" />
    </div>
</template>

<script setup lang="ts">
    import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
    import { useRouter } from 'vue-router'
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
    import BurnRateCalculator from '@/components/ui/calculators/BurnRateCalculator.vue'
    import ActionIconButton from '@/components/ui/buttons/ActionIconButton.vue'
    import type { Toast as ToastModel } from '@/types/toast'
    import ProgressEntryModal from '@/components/ui/popups/ProgressEntryModal.vue'
    import ValidationPopup from '@/components/ui/popups/ValidationPopup.vue'
    import DeleteConfirmPopup from '@/components/ui/popups/DeleteConfirmPopup.vue'
    import PopupActionButton from '@/components/ui/buttons/popup/PopupActionButton.vue'
    import PlanProgressPopup from '@/components/ui/popups/PlanProgressPopup.vue'

    import { useRoute } from 'vue-router'

    import {
        LS_AUTO_CALC_ENABLED,
        LS_OPEN_PLAN_ID,
        LS_PROGRESS_FAVORITE_CALCULATORS,
        LS_PROGRESS_WEIGHTS,
        LS_PROGRESS_WORKOUTS,
        LS_PROGRESS_GOAL,

        LS_PROGRESS_BMI,
        LS_PROGRESS_CALORIES,
        LS_PROGRESS_ONE_RM,
        LS_PROGRESS_BODY_FAT,
        LS_PROGRESS_FFMI,
        LS_PROGRESS_WATER,
        LS_PROGRESS_PROTEIN,
        LS_PROGRESS_CAFFEINE,
        LS_PROGRESS_GLYLOAD,
        LS_PROGRESS_BURN_RATE,

        LS_LEGACY_TRAINING_PLANS,

        LS_TOAST_DURATION_MS,
        LS_TOASTS_ENABLED,
        LS_TRAINING_DATA,
    } from '@/constants/storageKeys'
    // Interfaces
    interface PlanExercise {
        exercise: string
        sets: number
        reps: number
        goal?: string
    }
    interface TrainingPlan {
        id: string
        name: string
        exercises: PlanExercise[]
    }

    interface WeightEntry {
        date: string;
        weight: number;
    }

    interface Meal {
        name: string;
        calories: number;
    }

    interface DropSetEntry {
        weight: number;
        reps: number
    }

    interface Workout {
        exercise: string
        sets: number
        weight: number
        reps?: number
        note?: string
        date: string
        planId?: string
        type?: WorkoutType
        durationMin?: number
        distanceKm?: number
        setDetails?: Array<{ weight: number; reps: number }>
        isDropset?: boolean
        dropsets?: Array<{ weight: number; reps: number }>
        tempo?: string
        restSeconds?: number | null
        avgHr?: number | null
        calories?: number | null
        pace?: string | null
        hrZone?: number | null
        borg?: number | null
        painFree?: number | null
        movementQuality?: number | null
        equipment?: string | null
        equipmentCustom?: string | null
        side?: '' | 'links' | 'rechts' | 'beidseitig' | null
    }
    type ExerciseType = 'kraft' | 'calisthenics' | 'dehnung' | 'ausdauer'

    type WorkoutType = 'kraft' | 'calisthenics' | 'dehnung' | 'ausdauer'

    type DayCard = {
        day: string;
        uniqueExercises: number
    }

    type JournalDay = {
        day: string;
        groups: JournalGroup[]
    }

    type JournalGroup = {
        exercise: string
        entries: Workout[]
        note: string | null
    }

    type CalcCategory = 'alle' | 'gesundheit' | 'kraft' | 'ernaehrung' | 'alltag'

    type ProgressEntryModalExposed = { submit: () => void }

    // ====== CHARTS UND COPY >>>>>>>>>>

    //INSTANZEN

    let weightChart: Chart | null = null;
    let workoutChart: Chart | null = null;
    let macroChart: Chart | null = null;

    //Funktionen

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
                    tooltip: {
                        backgroundColor: '#ffffff',
                        titleColor: '#1f2937',
                        bodyColor: '#6b7280',
                    },
                    legend: {
                        // auf sehr schmalen Screens ausblenden, damit es nicht gequetscht wirkt
                        display: window.innerWidth > 420,
                        labels: {
                            color: '#1f2937',
                            boxWidth: 14,
                            boxHeight: 8,
                            padding: 6,
                            font: {
                                size: 10,
                            },
                        },
                    },
                },
                scales: {
                    x: {
                        ticks: { color: '#6b7280' },
                    },
                    y: {
                        beginAtZero: false,
                        ticks: { color: '#6b7280' },
                    },
                },
            },
        });

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
    // ===== Dashboard: Responsive-Flag für kompakte Cards =====

    // Units (oben bei den Composables)

    const { unit, kgToDisplay, displayToKg, formatWeight } = useUnits()

    // Basis-State für die Werte, die in den Cards angezeigt werden

    const weightHistory = ref<WeightEntry[]>([]);
    const workouts = ref<Workout[]>([]);
    const meals = ref<Meal[]>([]);
    const goal = ref<number | null>(null);

    // State für die Popups der DashboardCards

    const newWeight = ref<number | null>(null);
    const newGoal = ref<number | null>(null);
    const showWeightPopup = ref(false);
    const showGoalPopup = ref(false);
    const weightInput = ref<HTMLInputElement | null>(null);
    const goalInput = ref<HTMLInputElement | null>(null);

    // Tabs + Responsive-Handling für :compact in DashboardCard

    const mq = window.matchMedia('(max-width: 600px)')
    const isMobile = ref<boolean>(mq.matches)

    const handleMqChange = (e: MediaQueryListEvent | MediaQueryList) => {
        isMobile.value = 'matches' in e ? e.matches : (e as MediaQueryList).matches
    }

    onMounted(() => {
        handleMqChange(mq)
        mq.addEventListener?.('change', handleMqChange as any)
    })

    onUnmounted(() => {
        mq.removeEventListener?.('change', handleMqChange as any)
    })

    // 👉 wird in allen 4 DashboardCards als :compact benutzt

    const compactCards = computed(() => activeTab.value === 'stats' && isMobile.value)

    // Werte für die einzelnen DashboardCards

    const currentWeightDisplay = computed(() =>
        weightHistory.value.length
            ? formatWeight(weightHistory.value[0].weight, 1)
            : 'Kein Gewicht erfasst'
    )

    const totalCalories = computed(() =>
        meals.value.reduce((sum, meal) => sum + meal.calories, 0)

    );

    const lastWorkout = computed(() => {
        if (!workouts.value.length) return null
        const last = workouts.value.reduce((a, b) =>
            new Date(a.date) > new Date(b.date) ? a : b
        )
        if (last.type === 'ausdauer') {
            const dist = last.distanceKm != null ? ` · ${last.distanceKm} km` : ''
            return `${last.exercise} – ${last.durationMin} Min${dist}`
        }
        if (last.type === 'dehnung') {
            const bits: string[] = []
            if (last.durationMin != null && Number.isFinite(last.durationMin)) bits.push(`${last.durationMin} Min`)
            if (last.sets && last.reps) bits.push(`${last.sets}×${last.reps}`)
            const tail = bits.length ? ` – ${bits.join(' · ')}` : ''
            return `${last.exercise}${tail}`
        }
        return `${last.exercise} – ${formatWeight(last.weight, 0)} × ${last.reps}`
    })

    //  Validierung für Gewicht & Zielgewicht
    const validationErrorMessages = ref<string[]>([]);

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

    // ================== Popup-Logik: Card "Aktuelles Gewicht" ==================

    const latestRecordedWeightDisplay = computed<number | null>(() =>
        weightHistory.value.length ? kgToDisplay(weightHistory.value[0].weight) : null
    )

    const openWeightPopup = () => {
        newWeight.value = newProgressWeight.value ?? latestRecordedWeightDisplay.value ?? null
        showWeightPopup.value = true
        nextTick(() => { if (weightInput.value) weightInput.value.focus() })
    }

    const saveWeight = () => {
        const error = validateWeight(newWeight.value);
        if (error) {
            openValidationPopupError([error]);
            return;
        }
        const today = new Date().toISOString().split('T')[0];
        const weightKg = displayToKg(Number(newWeight.value));
        weightHistory.value.unshift({ date: today, weight: weightKg });

        // Persistieren
        localStorage.setItem(LS_PROGRESS_WEIGHTS, JSON.stringify(weightHistory.value));

        // 👉 Körpergewicht oben im Fortschritt-Editor direkt mitziehen
        newProgressWeight.value = kgToDisplay(weightKg)

        newWeight.value = null;

        // Chart erst updaten, wenn das Canvas nach dem v-if gerendert ist
        nextTick(() => {
            updateWeightChart();
        });

        addToast('Gewicht gespeichert', 'save');
        checkMilestones();
        closeWeightPopup();
    };

    const closeWeightPopup = () => {
        showWeightPopup.value = false;
        newWeight.value = null;
    };

    // ================== Popup-Logik: Card "Zielgewicht" ==================

    const saveToLocalStorage = (key: string, data: any) => {
        try {
            localStorage.setItem(`progress_${key}`, JSON.stringify(data));
        } catch (err) {
            console.error(`Error saving ${key} to localStorage:`, err);
        }
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

    // ===== TabsBar: Aktiver Tab + Suchfelder =====

    // Suche

    const searchQuery = ref<string>('');
    const planSearchQuery = ref<string>('');

    const activeTab = ref<'stats' | 'calculators' | 'plans'>('stats');

    // ===== Stats-Tab: ChartCard Gewichtsverlauf & Trainingsstatistik =====

    const hasWeightStats = computed(() => weightHistory.value.length > 0)
    const hasWorkoutStats = computed(() => workouts.value.length > 0)

    const doResetWeightStats = () => {
        // alten Zustand für Undo merken
        const snapshot = [...weightHistory.value]
        lastResetAction.value = {
            kind: 'weight',
            data: snapshot,
        }

        // wirklich zurücksetzen
        weightHistory.value = []
        localStorage.setItem(LS_PROGRESS_WEIGHTS, JSON.stringify(weightHistory.value))

        if (weightChart) {
            weightChart.destroy()
            weightChart = null
        }

        releaseToasts()

        addToast(
            'Gewichtsverlauf zurückgesetzt',
            'add',
            {
                label: 'Rückgängig',
                handler: () => {
                    if (!lastResetAction.value || lastResetAction.value.kind !== 'weight') return

                    weightHistory.value = [...lastResetAction.value.data]
                    localStorage.setItem(LS_PROGRESS_WEIGHTS, JSON.stringify(weightHistory.value))

                    nextTick(() => {
                        updateWeightChart()
                    })

                    addToast('Gewichtsverlauf wiederhergestellt', 'add')
                    lastResetAction.value = null
                },
            },
        )
    }

    const resetWeightStats = () => {
        if (!weightHistory.value.length) return

        requestDeleteConfirm({
            title: 'Gewichtsverlauf wirklich löschen?',
            message: 'Das setzt deinen Gewichtsverlauf zurück.',
            onConfirm: doResetWeightStats,
        })
    }
    const doResetWorkoutStats = () => {
        const snapshot = [...workouts.value]
        lastResetAction.value = {
            kind: 'workout',
            data: snapshot,
        }

        workouts.value = []
        localStorage.setItem(LS_PROGRESS_WORKOUTS, JSON.stringify(workouts.value))

        if (workoutChart) workoutChart.destroy()
        updateWorkoutChart()

        releaseToasts()

        addToast(
            'Trainingsstatistik zurückgesetzt',
            'add',
            {
                label: 'Rückgängig',
                handler: () => {
                    if (!lastResetAction.value || lastResetAction.value.kind !== 'workout') return

                    workouts.value = [...lastResetAction.value.data]
                    localStorage.setItem(LS_PROGRESS_WORKOUTS, JSON.stringify(workouts.value))

                    nextTick(() => {
                        updateWorkoutChart()
                    })

                    addToast('Trainingsstatistik wiederhergestellt', 'add')
                    lastResetAction.value = null
                },
            },
        )
    }

    const resetWorkoutStats = () => {
        if (!workouts.value.length) return

        requestDeleteConfirm({
            title: 'Trainingsstatistik wirklich löschen?',
            message: 'Das setzt deine Trainingsstatistik zurück.',
            onConfirm: doResetWorkoutStats,
        })
    }


    // ===== Filterleiste =====

    const calcCategory = ref<CalcCategory>('alle')

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
        'Burn Rate': 'ernaehrung',

    }

    const matchesCalc = (key: string) => {
        const searchOk = matchesSearch(key)
        const category = CALC_CATEGORY[key] ?? 'alle'
        const categoryOk = calcCategory.value === 'alle' || category === calcCategory.value
        return searchOk && categoryOk
    }

    const sortedCalculators = computed(() => {
        return calculators.value
            .filter(c => matchesCalc(c.key))
            .sort((a, b) => {
                const aFav = favoriteCalculators.value.has(a.key) ? 1 : 0
                const bFav = favoriteCalculators.value.has(b.key) ? 1 : 0
                if (bFav !== aFav) return bFav - aFav   // Favoriten nach oben
                return a.name.localeCompare(b.name, 'de') // danach alphabetisch
            })
    })

    //===== Favorit Calculators =====

    const favoriteCalculators = ref<Set<string>>(new Set())
    const FAVORITES_KEY = LS_PROGRESS_FAVORITE_CALCULATORS
    const favoriteCalcs = computed(() => Array.from(favoriteCalculators.value));

    const isFavorite = (id: string) => isFavCalculator(id);

    const toggleFavorite = (id: string) => toggleFavCalculator(id);

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

    onMounted(() => {
        const flag = localStorage.getItem(LS_AUTO_CALC_ENABLED)
        autoCalcEnabled.value = flag === 'true'
        loadFavoriteCalculators()

        const stored = localStorage.getItem(LS_TOASTS_ENABLED)
        toastsEnabled.value = stored === null ? true : stored === 'true'
    })


    // ===== Allgemein zu den Calculators =====
    const autoCalcEnabled = ref(false)

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
        { key: 'Burn Rate', name: 'Burn Rate – Kalorien-Bilanz', isFavorite: false },
    ])

    const resetCalculator = (calculator: string) => {
        releaseToasts()

        switch (calculator) {
            case 'bmi': {
                lastCalculatorReset.value = {
                    id: 'bmi',
                    data: {
                        gender: bmiGender.value,
                        weight: bmiWeight.value,
                        height: bmiHeight.value,
                        result: bmiResult.value,
                    }
                }

                bmiGender.value = 'male'
                bmiWeight.value = null
                bmiHeight.value = null
                bmiResult.value = null
                localStorage.removeItem(LS_PROGRESS_BMI)

                addToast('BMI-Rechner zurückgesetzt', 'add', {
                    label: 'Rückgängig',
                    handler: () => {
                        if (!lastCalculatorReset.value || lastCalculatorReset.value.id !== 'bmi') return
                        const prev = lastCalculatorReset.value.data
                        bmiGender.value = prev.gender
                        bmiWeight.value = prev.weight
                        bmiHeight.value = prev.height
                        bmiResult.value = prev.result
                        saveToLocalStorage('bmi', prev)
                        lastCalculatorReset.value = null
                        addToast('BMI-Rechner wiederhergestellt', 'add')
                    }
                })
                break
            }

            case 'calories': {
                lastCalculatorReset.value = {
                    id: 'calories',
                    data: {
                        age: calorieAge.value,
                        gender: calorieGender.value,
                        weight: calorieWeight.value,
                        height: calorieHeight.value,
                        activity: calorieActivity.value,
                        goal: calorieGoal.value,
                        result: calorieResult.value,
                    }
                }

                calorieAge.value = null
                calorieGender.value = 'male'
                calorieWeight.value = null
                calorieHeight.value = null
                calorieActivity.value = '1.2'
                calorieGoal.value = 0
                calorieResult.value = null
                localStorage.removeItem(LS_PROGRESS_CALORIES)

                addToast('Kalorienbedarfsrechner zurückgesetzt', 'add', {
                    label: 'Rückgängig',
                    handler: () => {
                        if (!lastCalculatorReset.value || lastCalculatorReset.value.id !== 'calories') return
                        const prev = lastCalculatorReset.value.data
                        calorieAge.value = prev.age
                        calorieGender.value = prev.gender
                        calorieWeight.value = prev.weight
                        calorieHeight.value = prev.height
                        calorieActivity.value = prev.activity
                        calorieGoal.value = prev.goal
                        calorieResult.value = prev.result
                        saveToLocalStorage('calories', prev)
                        if (calorieResult.value && activeTab.value === 'calculators') {
                            updateMacroChart()
                        }
                        lastCalculatorReset.value = null
                        addToast('Kalorienbedarfsrechner wiederhergestellt', 'add')
                    }
                })
                break
            }

            case 'burnRate': {
                lastCalculatorReset.value = {
                    id: 'burnRate',
                    data: {
                        startWeight: burnStartWeight.value,
                        goalWeight: burnGoalWeight.value,
                        maintenance: burnMaintenance.value,
                        intake: burnIntake.value,
                        result: burnRateResult.value,
                    }
                }

                burnStartWeight.value = null
                burnGoalWeight.value = null
                burnMaintenance.value = null
                burnIntake.value = null
                burnRateResult.value = null
                localStorage.removeItem(LS_PROGRESS_BURN_RATE)

                addToast('Burn Rate zurückgesetzt', 'add', {
                    label: 'Rückgängig',
                    handler: () => {
                        if (!lastCalculatorReset.value || lastCalculatorReset.value.id !== 'burnRate') return
                        const prev = lastCalculatorReset.value.data
                        burnStartWeight.value = prev.startWeight
                        burnGoalWeight.value = prev.goalWeight
                        burnMaintenance.value = prev.maintenance
                        burnIntake.value = prev.intake
                        burnRateResult.value = prev.result
                        saveToLocalStorage('burnRate', prev)
                        lastCalculatorReset.value = null
                        addToast('Burn Rate wiederhergestellt', 'add')
                    }
                })
                break
            }

            case 'oneRm': {
                lastCalculatorReset.value = {
                    id: 'oneRm',
                    data: {
                        exercise: oneRmExercise.value,
                        weight: oneRmWeight.value,
                        reps: oneRmReps.value,
                        result: oneRmResult.value,
                    }
                }

                oneRmExercise.value = ''
                oneRmWeight.value = null
                oneRmReps.value = null
                oneRmResult.value = null
                localStorage.removeItem(LS_PROGRESS_ONE_RM)

                addToast('1RM-Rechner zurückgesetzt', 'add', {
                    label: 'Rückgängig',
                    handler: () => {
                        if (!lastCalculatorReset.value || lastCalculatorReset.value.id !== 'oneRm') return
                        const prev = lastCalculatorReset.value.data
                        oneRmExercise.value = prev.exercise
                        oneRmWeight.value = prev.weight
                        oneRmReps.value = prev.reps
                        oneRmResult.value = prev.result
                        saveToLocalStorage('oneRm', prev)
                        lastCalculatorReset.value = null
                        addToast('1RM-Rechner wiederhergestellt', 'add')
                    }
                })
                break
            }

            case 'bodyFat': {
                lastCalculatorReset.value = {
                    id: 'bodyFat',
                    data: {
                        gender: bodyFatGender.value,
                        waist: bodyFatWaist.value,
                        neck: bodyFatNeck.value,
                        hip: bodyFatHip.value,
                        height: bodyFatHeight.value,
                        result: bodyFatResult.value,
                    }
                }

                bodyFatGender.value = 'male'
                bodyFatWaist.value = null
                bodyFatNeck.value = null
                bodyFatHip.value = null
                bodyFatHeight.value = null
                bodyFatResult.value = null
                localStorage.removeItem(LS_PROGRESS_BODY_FAT)

                addToast('Körperfett-Rechner zurückgesetzt', 'add', {
                    label: 'Rückgängig',
                    handler: () => {
                        if (!lastCalculatorReset.value || lastCalculatorReset.value.id !== 'bodyFat') return
                        const prev = lastCalculatorReset.value.data
                        bodyFatGender.value = prev.gender
                        bodyFatWaist.value = prev.waist
                        bodyFatNeck.value = prev.neck
                        bodyFatHip.value = prev.hip
                        bodyFatHeight.value = prev.height
                        bodyFatResult.value = prev.result
                        saveToLocalStorage('bodyFat', prev)
                        lastCalculatorReset.value = null
                        addToast('Körperfett-Rechner wiederhergestellt', 'add')
                    }
                })
                break
            }

            case 'ffmi': {
                lastCalculatorReset.value = {
                    id: 'ffmi',
                    data: {
                        weight: ffmiWeight.value,
                        height: ffmiHeight.value,
                        bodyFat: ffmiBodyFat.value,
                        result: ffmiResult.value,
                    }
                }

                ffmiWeight.value = null
                ffmiHeight.value = null
                ffmiBodyFat.value = null
                ffmiResult.value = null
                localStorage.removeItem(LS_PROGRESS_FFMI)

                addToast('FFMI-Rechner zurückgesetzt', 'add', {
                    label: 'Rückgängig',
                    handler: () => {
                        if (!lastCalculatorReset.value || lastCalculatorReset.value.id !== 'ffmi') return
                        const prev = lastCalculatorReset.value.data
                        ffmiWeight.value = prev.weight
                        ffmiHeight.value = prev.height
                        ffmiBodyFat.value = prev.bodyFat
                        ffmiResult.value = prev.result
                        saveToLocalStorage('ffmi', prev)
                        lastCalculatorReset.value = null
                        addToast('FFMI-Rechner wiederhergestellt', 'add')
                    }
                })
                break
            }

            case 'water': {
                lastCalculatorReset.value = {
                    id: 'water',
                    data: {
                        weight: waterWeight.value,
                        activity: waterActivity.value,
                        climate: waterClimate.value,
                        result: waterResult.value,
                    }
                }

                waterWeight.value = null
                waterActivity.value = 'low'
                waterClimate.value = 'temperate'
                waterResult.value = null
                localStorage.removeItem(LS_PROGRESS_WATER)

                addToast('Wasserbedarfsrechner zurückgesetzt', 'add', {
                    label: 'Rückgängig',
                    handler: () => {
                        if (!lastCalculatorReset.value || lastCalculatorReset.value.id !== 'water') return
                        const prev = lastCalculatorReset.value.data
                        waterWeight.value = prev.weight
                        waterActivity.value = prev.activity
                        waterClimate.value = prev.climate
                        waterResult.value = prev.result
                        saveToLocalStorage('water', prev)
                        lastCalculatorReset.value = null
                        addToast('Wasserbedarfsrechner wiederhergestellt', 'add')
                    }
                })
                break
            }

            case 'protein': {
                lastCalculatorReset.value = {
                    id: 'protein',
                    data: {
                        weight: proteinWeight.value,
                        goal: proteinGoal.value,
                        activity: proteinActivity.value,
                        meals: proteinMeals.value,
                        result: proteinResult.value,
                    }
                }

                proteinWeight.value = null
                proteinGoal.value = 'maintain'
                proteinActivity.value = 'low'
                proteinMeals.value = null
                proteinResult.value = null
                localStorage.removeItem(LS_PROGRESS_PROTEIN)

                addToast('Proteinbedarf-Rechner zurückgesetzt', 'add', {
                    label: 'Rückgängig',
                    handler: () => {
                        if (!lastCalculatorReset.value || lastCalculatorReset.value.id !== 'protein') return
                        const prev = lastCalculatorReset.value.data
                        proteinWeight.value = prev.weight
                        proteinGoal.value = prev.goal
                        proteinActivity.value = prev.activity
                        proteinMeals.value = prev.meals
                        proteinResult.value = prev.result
                        saveToLocalStorage('protein', {
                            weight: prev.weight,
                            goal: prev.goal,
                            activity: prev.activity,
                            result: prev.result,
                        })
                        lastCalculatorReset.value = null
                        addToast('Proteinbedarf-Rechner wiederhergestellt', 'add')
                    }
                })
                break
            }

            case 'caffeine': {
                lastCalculatorReset.value = {
                    id: 'caffeine',
                    data: {
                        weight: cafWeight.value,
                        sensitivity: cafSensitivity.value,
                        status: cafStatus.value,
                        result: cafResult.value,
                    }
                }

                cafWeight.value = null
                cafSensitivity.value = 'normal'
                cafStatus.value = 'none'
                cafResult.value = null
                localStorage.removeItem(LS_PROGRESS_CAFFEINE)

                addToast('Koffein-Rechner zurückgesetzt', 'add', {
                    label: 'Rückgängig',
                    handler: () => {
                        if (!lastCalculatorReset.value || lastCalculatorReset.value.id !== 'caffeine') return
                        const prev = lastCalculatorReset.value.data
                        cafWeight.value = prev.weight
                        cafSensitivity.value = prev.sensitivity
                        cafStatus.value = prev.status
                        cafResult.value = prev.result
                        saveToLocalStorage('caffeine', prev)
                        lastCalculatorReset.value = null
                        addToast('Koffein-Rechner wiederhergestellt', 'add')
                    }
                })
                break
            }

            case 'glyload': {
                lastCalculatorReset.value = {
                    id: 'glyload',
                    data: {
                        food: glFood.value,
                        serving: glServing.value,
                        carbs100: glCarbs100.value,
                        gi: glGi.value,
                        result: glResult.value,
                    }
                }

                glFood.value = ''
                glServing.value = null
                glCarbs100.value = null
                glGi.value = null
                glResult.value = null
                localStorage.removeItem(LS_PROGRESS_GLYLOAD)

                addToast('GL-Rechner zurückgesetzt', 'add', {
                    label: 'Rückgängig',
                    handler: () => {
                        if (!lastCalculatorReset.value || lastCalculatorReset.value.id !== 'glyload') return
                        const prev = lastCalculatorReset.value.data
                        glFood.value = prev.food
                        glServing.value = prev.serving
                        glCarbs100.value = prev.carbs100
                        glGi.value = prev.gi
                        glResult.value = prev.result
                        saveToLocalStorage('glyload', {
                            food: prev.food,
                            serving: prev.serving,
                            carbs100: prev.carbs100,
                            gi: prev.gi,
                            result: prev.result,
                            category: glCategory.value,
                        })
                        lastCalculatorReset.value = null
                        addToast('GL-Rechner wiederhergestellt', 'add')
                    }
                })
                break
            }
        }
    }

    //=============== Jump to Rechner Infos ===========

    const route = useRoute()
    const router = useRouter()

    async function jumpToCalculatorsFromRoute() {
        const tab = String(route.query.tab || '')
        const focusRaw = String(route.query.focus || '')
        const focus = focusRaw.trim()

        if (tab !== 'calculators') return

        // Tab umschalten
        activeTab.value = 'calculators'

        // optional: Fokus setzt Filter direkt passend
        if (focus) {
            searchQuery.value = focus
            const cat = CALC_CATEGORY[focus]
            if (cat) calcCategory.value = cat
        }

        // warten bis DOM wirklich da ist
        await nextTick()

        // sauber an den Rechner-Bereich
        const el =
            document.querySelector('.calc-filterbar') ||
            document.querySelector('.calculators-grid')

        el?.scrollIntoView({ behavior: 'smooth', block: 'start' })

        // URL cleanen (ohne History-Spam)
        if (route.query.tab || route.query.focus) {
            const q: Record<string, any> = { ...route.query }
            delete q.tab
            delete q.focus
            router.replace({ query: q })
        }
    }

    //=============== BMI Calculator ==========

    const bmiGender = ref<'male' | 'female'>('male');
    const bmiWeight = ref<number | null>(null);
    const bmiHeight = ref<number | null>(null);
    const bmiResult = ref<{ value: number; category: string } | null>(null);

    const validateBMI = (): string[] => {
        const errors: string[] = [];
        if (!bmiGender.value) errors.push('Geschlecht muss ausgewählt sein');
        if (bmiWeight.value === null || isNaN(bmiWeight.value) || bmiWeight.value <= 0)
            errors.push('Gewicht muss größer als 0 sein');
        if (bmiHeight.value === null || isNaN(bmiHeight.value) || bmiHeight.value <= 0)
            errors.push('Größe muss größer als 0 sein');
        return errors;
    };

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

    const copyBMI = () => {
        if (!bmiResult.value) return
        const txt = `BMI-Ergebnis
- BMI: ${bmiResult.value.value.toFixed(1)}
- Kategorie: ${bmiResult.value.category}
- Gewicht: ${bmiWeight.value ?? '-'} ${unit.value}
- Größe: ${bmiHeight.value ?? '-'} cm`
        copyText(txt)
    }

    const debouncedCalcBMI = debounce(() => {
        if (!validateBMI().length) withSilentToasts(calculateBMI)
    })

    watch([bmiGender, bmiWeight, bmiHeight], () => {
        if (autoCalcEnabled.value) debouncedCalcBMI()
    })

    //========== Calories Calculator ==========

    const calorieAge = ref<number | null>(null);
    const calorieGender = ref<'male' | 'female'>('male');
    const calorieWeight = ref<number | null>(null);
    const calorieHeight = ref<number | null>(null);
    const calorieActivity = ref<string>('1.2');
    const calorieGoal = ref<number>(0);
    const calorieResult = ref<{
        total: number;
        macros: { carbs: number; protein: number; fat: number };
    } | null>(null);

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

    const debouncedCalcCalories = debounce(() => {
        if (!validateCalories().length) withSilentToasts(calculateCalories)
    })

    watch([calorieAge, calorieGender, calorieWeight, calorieHeight, calorieActivity, calorieGoal], () => {
        if (autoCalcEnabled.value) debouncedCalcCalories()
    })

    //========== Burn Rate Calculator ==========

    const burnStartWeight = ref<number | null>(null)
    const burnGoalWeight = ref<number | null>(null)
    const burnMaintenance = ref<number | null>(null)
    const burnIntake = ref<number | null>(null)

    type BurnRateResult = {
        dailyDelta: number
        weeklyChangeKg: number
        weeklyChangeDisplay: number
        daysToGoal: number | null
        note?: string
    }
    const burnRateResult = ref<BurnRateResult | null>(null)

    const validateBurnRate = (): string[] => {
        const errors: string[] = []
        const sw = Number(burnStartWeight.value)
        const gw = Number(burnGoalWeight.value)
        const tdee = Number(burnMaintenance.value)
        const intake = Number(burnIntake.value)

        if (!Number.isFinite(sw) || sw <= 0) errors.push('Startgewicht muss > 0 sein')
        if (!Number.isFinite(gw) || gw <= 0) errors.push('Zielgewicht muss > 0 sein')
        if (!Number.isFinite(tdee) || tdee <= 0) errors.push('Erhaltung (TDEE) muss > 0 sein')
        if (!Number.isFinite(intake) || intake <= 0) errors.push('Intake muss > 0 sein')

        return errors
    }

    const calculateBurnRate = () => {
        const errors = validateBurnRate()
        if (errors.length) { openValidationPopupError(errors); return }

        const startKg = unit.value === 'kg' ? Number(burnStartWeight.value) : Number(burnStartWeight.value) * KG_PER_LB
        const goalKg = unit.value === 'kg' ? Number(burnGoalWeight.value) : Number(burnGoalWeight.value) * KG_PER_LB

        const tdee = Number(burnMaintenance.value)
        const intake = Number(burnIntake.value)

        const dailyDelta = intake - tdee // negativ = Defizit, positiv = Überschuss
        const weeklyChangeKg = (dailyDelta * 7) / 7700

        const weeklyChangeDisplay =
            unit.value === 'kg' ? weeklyChangeKg : (weeklyChangeKg / KG_PER_LB)

        const targetChangeKg = goalKg - startKg
        let daysToGoal: number | null = null
        let note = ''

        if (Math.abs(weeklyChangeKg) < 1e-9) {
            daysToGoal = null
            note = 'Du bist auf Erhaltung – so erreichst du das Zielgewicht nicht. Stell Intake/TDEE so ein, dass Defizit/Überschuss entsteht.'
        } else if ((targetChangeKg > 0 && weeklyChangeKg <= 0) || (targetChangeKg < 0 && weeklyChangeKg >= 0)) {
            daysToGoal = null
            note = 'Deine Bilanz passt nicht zum Ziel. Beispiel: Ziel runter → du brauchst Defizit (Bilanz negativ).'
        } else {
            const weeks = Math.abs(targetChangeKg / weeklyChangeKg)
            const days = Math.round(weeks * 7)
            daysToGoal = Number.isFinite(days) ? Math.max(1, days) : null
            note = ''
        }

        burnRateResult.value = { dailyDelta, weeklyChangeKg, weeklyChangeDisplay, daysToGoal, note: note || undefined }

        addToast('Burn Rate berechnet', 'default')
        saveToLocalStorage('burnRate', {
            startWeight: burnStartWeight.value,
            goalWeight: burnGoalWeight.value,
            maintenance: burnMaintenance.value,
            intake: burnIntake.value,
            result: burnRateResult.value,
        })
    }

    const copyBurnRate = () => {
        if (!burnRateResult.value) return
        const r = burnRateResult.value
        const txt = `Burn Rate – Kalorien-Bilanz
- Startgewicht: ${burnStartWeight.value ?? '-'} ${unit.value}
- Zielgewicht: ${burnGoalWeight.value ?? '-'} ${unit.value}
- Erhaltung (TDEE): ${burnMaintenance.value ?? '-'} kcal/Tag
- Intake: ${burnIntake.value ?? '-'} kcal/Tag
- Bilanz: ${r.dailyDelta > 0 ? '+' : ''}${Math.round(r.dailyDelta)} kcal/Tag
- Tempo: ${r.weeklyChangeDisplay > 0 ? '+' : ''}${r.weeklyChangeDisplay.toFixed(2)} ${unit.value === 'kg' ? 'kg' : 'lbs'}/Woche
- Bis Ziel: ${r.daysToGoal != null ? `~${r.daysToGoal} Tage` : '—'}
${r.note ? `- Hinweis: ${r.note}` : ''}`
        copyText(txt)
    }

    const debouncedCalcBurnRate = debounce(() => {
        if (!validateBurnRate().length) withSilentToasts(calculateBurnRate)
    })

    watch([burnStartWeight, burnGoalWeight, burnMaintenance, burnIntake, unit], () => {
        if (autoCalcEnabled.value) debouncedCalcBurnRate()
    })
    watch(autoCalcEnabled, (on) => {
        if (!on) return
        debouncedCalcBurnRate()
    })

    //========== Protein Calculator ==========

    const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

    const proteinWeight = ref<number | null>(null)
    const proteinGoal = ref<'maintain' | 'bulk' | 'cut'>('maintain')
    const proteinResult = ref<{ recommend: number; min?: number; max?: number; factor: number; weightDisplay: string } | null>(null)
    const proteinActivity = ref<'low' | 'moderate' | 'high'>('low')
    const proteinMeals = ref<number | null>(null)

    const validateProtein = (): string[] => {
        const errors: string[] = []
        const w = Number(proteinWeight.value)
        if (!Number.isFinite(w) || w <= 0) errors.push('Gewicht muss größer als 0 sein')
        if (!proteinGoal.value) errors.push('Ziel muss ausgewählt sein')
        return errors
    }

    const calculateProtein = () => {
        const errors = validateProtein()
        if (errors.length) { openValidationPopupError(errors); return }

        const weightKg = unit.value === 'kg'
            ? Number(proteinWeight.value)
            : Number(proteinWeight.value) * KG_PER_LB

        let baseFactor = 1.6, baseMin = 1.4, baseMax = 1.8
        if (proteinGoal.value === 'bulk') {
            baseFactor = 2.0; baseMin = 1.8; baseMax = 2.2
        } else if (proteinGoal.value === 'cut') {
            baseFactor = 2.2; baseMin = 2.0; baseMax = 2.6
        }

        const delta = proteinActivity.value === 'low' ? -0.2
            : proteinActivity.value === 'high' ? 0.3
                : 0.0

        const factor = clamp(baseFactor + delta, 1.2, 2.7)
        const minF = clamp(baseMin + delta, 1.2, 2.7)
        const maxF = clamp(baseMax + delta, 1.2, 2.7)

        const recommend = factor * weightKg
        const range = { min: minF * weightKg, max: maxF * weightKg }

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
            activity: proteinActivity.value,
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

    const debouncedCalcProtein = debounce(() => {
        if (!validateProtein().length) withSilentToasts(calculateProtein)
    }, 300)

    watch([proteinWeight, proteinGoal, proteinActivity, unit], () => {
        if (autoCalcEnabled.value) debouncedCalcProtein()
    }, { flush: 'post' })

    watch(autoCalcEnabled, (on) => {
        if (on) debouncedCalcProtein()
    })

    //========== 1RM ==========

    const oneRmExercise = ref<string>('');
    const oneRmWeight = ref<number | null>(null);
    const oneRmReps = ref<number | null>(null);
    const oneRmResult = ref<number | null>(null);

    const validateOneRm = (): string[] => {
        const errors: string[] = [];
        if (oneRmWeight.value === null || isNaN(oneRmWeight.value) || oneRmWeight.value <= 0)
            errors.push('Gewicht muss größer als 0 sein');
        if (oneRmReps.value === null || isNaN(oneRmReps.value) || oneRmReps.value <= 0)
            errors.push('Wiederholungen müssen größer als 0 sein');
        return errors;
    };

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

    const copyOneRm = () => {
        if (!oneRmResult.value) return
        const txt = `1RM-Schätzung
- Übung: ${oneRmExercise.value || '-'}
- 1RM: ${formatWeight(oneRmResult.value, 1)}
- Eingabe: ${oneRmWeight.value ?? '-'} ${unit.value} x ${oneRmReps.value ?? '-'}`
        copyText(txt)
    }

    const debouncedCalc1RM = debounce(() => {
        if (!validateOneRm().length) withSilentToasts(calculateOneRm)
    })

    watch([oneRmWeight, oneRmReps, oneRmExercise], () => {
        if (autoCalcEnabled.value) debouncedCalc1RM()
    })

    // ===== Koffein Calculator ==========

    const cafWeight = ref<number | null>(null)
    const cafSensitivity = ref<'low' | 'normal' | 'high'>('normal')
    const cafStatus = ref<'none' | 'pregnant'>('none')
    const cafResult = ref<{ perDose: number; perDay: number } | null>(null)

    const validateCaffeine = (): string[] => {
        const errors: string[] = []
        if (cafWeight.value === null || isNaN(cafWeight.value) || cafWeight.value <= 0) {
            errors.push('Gewicht muss größer als 0 sein')
        }
        return errors
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

    const caffeineData = localStorage.getItem(LS_PROGRESS_CAFFEINE)
    if (caffeineData) {
        const parsed = JSON.parse(caffeineData)
        cafWeight.value = parsed.weight
        cafSensitivity.value = parsed.sensitivity
        cafStatus.value = parsed.status
        cafResult.value = parsed.result
    }

    const debouncedCalcCaffeine = debounce(() => {
        if (!validateCaffeine().length) withSilentToasts(calculateCaffeine)
    })

    watch([cafWeight, cafSensitivity, cafStatus], () => {
        if (autoCalcEnabled.value) debouncedCalcCaffeine()
    })
    watch(autoCalcEnabled, (on) => {
        if (!on) return
        debouncedCalcCaffeine()
    })
    // ========== BodyFat Calculator ==========

    const bodyFatGender = ref<'male' | 'female'>('male');
    const bodyFatWaist = ref<number | null>(null);
    const bodyFatNeck = ref<number | null>(null);
    const bodyFatHip = ref<number | null>(null);
    const bodyFatHeight = ref<number | null>(null);
    const bodyFatResult = ref<number | null>(null);

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

    const copyBodyFat = () => {
        if (!bodyFatResult.value) return
        const txt = `Körperfett (US Navy)
- Körperfett: ${bodyFatResult.value.toFixed(1)}%
- Geschlecht: ${bodyFatGender.value}
- Maße: Bauch ${bodyFatWaist.value ?? '-'} cm, Hals ${bodyFatNeck.value ?? '-'} cm${bodyFatGender.value === 'female' ? `, Hüfte ${bodyFatHip.value ?? '-'} cm` : ''}
- Größe: ${bodyFatHeight.value ?? '-'} cm`
        copyText(txt)
    }

    const debouncedCalcBodyFat = debounce(() => {
        if (!validateBodyFat().length) withSilentToasts(calculateBodyFat)
    })

    watch([bodyFatGender, bodyFatWaist, bodyFatNeck, bodyFatHip, bodyFatHeight], () => {
        if (autoCalcEnabled.value) debouncedCalcBodyFat()
    })

    // ========== FFMI Calculator ==========

    const ffmiWeight = ref<number | null>(null);
    const ffmiHeight = ref<number | null>(null);
    const ffmiBodyFat = ref<number | null>(null);
    const ffmiResult = ref<{ value: number; category: string } | null>(null);

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

    const copyFFMI = () => {
        if (!ffmiResult.value) return
        const txt = `FFMI
- FFMI: ${ffmiResult.value.value.toFixed(1)} (${ffmiResult.value.category})
- Gewicht: ${ffmiWeight.value ?? '-'} ${unit.value}
- Größe: ${ffmiHeight.value ?? '-'} cm
- KFA: ${ffmiBodyFat.value ?? '-'}%`
        copyText(txt)
    }

    const debouncedCalcFFMI = debounce(() => {
        if (!validateFFMI().length) withSilentToasts(calculateFFMI)
    })

    watch([ffmiWeight, ffmiHeight, ffmiBodyFat], () => {
        if (autoCalcEnabled.value) debouncedCalcFFMI()
    })

    // ========== GlycemicLoadCalculator ==========

    const glFood = ref<string>('')
    const glServing = ref<number | null>(null)
    const glCarbs100 = ref<number | null>(null)
    const glGi = ref<number | null>(null)
    const glCarbs = computed<number | null>(() => {
        if (glServing.value == null || glCarbs100.value == null) return null
        return (Number(glCarbs100.value) * Number(glServing.value)) / 100
    })

    const glResult = ref<number | null>(null)
    const glCategory = computed<string>(() => {
        if (glResult.value == null) return ''
        if (glResult.value < 10) return 'niedrig'
        if (glResult.value < 20) return 'mittel'
        return 'hoch'
    })

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

        glResult.value = gl
        addToast('Glykämische Last berechnet', 'default')

        saveToLocalStorage('glyload', {
            food: glFood.value,
            serving,
            carbs100,
            gi,
            result: glResult.value,
            category: glCategory.value,
        })
    }

    const copyGlyLoad = () => {
        if (glResult.value == null) return
        const txt = `Glykämische Last
- Lebensmittel: ${glFood.value || '-'}
- Portion: ${glServing.value ?? '-'} g
- KH (pro 100 g): ${glCarbs100.value ?? '-'} g
- GI: ${glGi.value ?? '-'}
- GL (Portion): ${glResult.value.toFixed(1)} (${glCategory.value})`
        copyText(txt)
    }

    const glyloadData = localStorage.getItem(LS_PROGRESS_GLYLOAD)
    if (glyloadData) {
        const parsed = JSON.parse(glyloadData)
        glFood.value = parsed.food
        glServing.value = parsed.serving
        glCarbs100.value = parsed.carbs100
        glGi.value = parsed.gi

        if (parsed.result && typeof parsed.result === 'object' && 'gl' in parsed.result) {
            glResult.value = Number(parsed.result.gl)
        } else {
            glResult.value = parsed.result ?? null
        }
    }

    const debouncedCalcGlyLoad = debounce(() => {
        if (!validateGlyLoad().length) withSilentToasts(calculateGlyLoad)
    })

    watch([glFood, glServing, glCarbs100, glGi], () => {
        if (autoCalcEnabled.value) debouncedCalcGlyLoad()
    })
    watch(autoCalcEnabled, (on) => {
        if (!on) return
        debouncedCalcGlyLoad()
    })
    // ========== Water Calculator ==========

    const waterWeight = ref<number | null>(null);
    const waterActivity = ref<'low' | 'moderate' | 'high'>('low');
    const waterClimate = ref<'temperate' | 'hot' | 'very_hot'>('temperate');
    const waterResult = ref<number | null>(null);

    const validateWater = (): string[] => {
        const errors: string[] = [];
        if (waterWeight.value === null || isNaN(waterWeight.value) || waterWeight.value <= 0)
            errors.push('Gewicht muss größer als 0 sein');
        return errors;
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

    const copyWater = () => {
        if (!waterResult.value) return
        const txt = `Wasserbedarf
- Empfehlung: ${waterResult.value.toFixed(1)} Liter/Tag
- Gewicht: ${waterWeight.value ?? '-'} ${unit.value}
- Aktivität: ${waterActivity.value}
- Klima: ${waterClimate.value}`
        copyText(txt)
    }

    const debouncedCalcWater = debounce(() => {
        if (!validateWater().length) withSilentToasts(calculateWater)
    })

    watch([waterWeight, waterActivity, waterClimate], () => {
        if (autoCalcEnabled.value) debouncedCalcWater()
    })

    // ======== Pläne-Tab: State =======

    const trainingPlans = ref<TrainingPlan[]>([]);
    const favoritePlansIds = ref<string[]>([])



    // === Pläne-Tab: abgeleitete Listen ===
    const favoritePlans = computed(() =>
        trainingPlans.value.filter(p => favoritePlansIds.value.includes(p.id))
    )
    const otherPlans = computed(() =>
        trainingPlans.value.filter(p => !favoritePlansIds.value.includes(p.id))
    )

    // ======= Pläne-Tab: Aktionen =======

    const openPlanProgress = (planId: string) => {
        currentPlanId.value = planId
        showPlanProgressPopup.value = true
    }

    const matchesPlanSearch = (name: string) => {
        if (!planSearchQuery.value) return true;
        return name.toLowerCase().includes(planSearchQuery.value.toLowerCase());
    };

    // === Pläne-Tab: Initiales Laden aus localStorage ===

    onMounted(() => {
        try {
            const raw = localStorage.getItem(LS_TRAINING_DATA)
            if (raw) {
                const parsed = JSON.parse(raw)
                trainingPlans.value = Array.isArray(parsed?.plans) ? parsed.plans : []
                favoritePlansIds.value = Array.isArray(parsed?.favoritePlans) ? parsed.favoritePlans : []
            } else {
                const legacy = localStorage.getItem(LS_LEGACY_TRAINING_PLANS)
                trainingPlans.value = legacy ? JSON.parse(legacy) : []
                favoritePlansIds.value = []
            }
        } catch {
            trainingPlans.value = []
            favoritePlansIds.value = []
        }
        jumpToCalculatorsFromRoute()

    })

    watch(
        () => [route.query.tab, route.query.focus],
        () => jumpToCalculatorsFromRoute()
    )

    //ProgressEntryModal

    const showProgressPopup = ref(false);
    const showProgressExtras = ref(false);

    const currentExercise = ref<string>('');

    const newProgressReps = ref<number | null>(null);
    const newProgressSets = ref<number | null>(null);
    const newProgressNote = ref<string>('');
    const newProgressDuration = ref<number | null>(null)

    const newProgressDistance = ref<number | null>(null)
    const newProgressTempo = ref<string>('')
    const newProgressRestSeconds = ref<number | null>(null)
    const newProgressAvgHr = ref<number | null>(null)
    const newProgressCalories = ref<number | null>(null)
    const newProgressPace = ref<string>('')
    const newProgressHrZone = ref<number | null>(null)
    const newProgressBorg = ref<number | null>(null)

    const newProgressPainFree = ref<number | null>(null)
    const newProgressMovementQuality = ref<number | null>(null)
    const newProgressEquipment = ref<string>('')
    const newProgressEquipmentCustom = ref<string>('')
    const newProgressSide = ref<'' | 'links' | 'rechts' | 'beidseitig'>('')

    const newProgressSetDetails = ref<Array<{ weight: number | null; reps: number | null }>>([])

    const newProgressIsDropset = ref(false)
    const newProgressDropsets = ref<Array<{ weight: number | null; reps: number | null }>>([])

    const editingEntry = ref<Workout | null>(null);

    const reopenPlanProgressAfterSave = ref(false)

    const progressEntryModalRef = ref<ProgressEntryModalExposed | null>(null)

    const newProgressWeight = ref<number | null>(null)

    // --- Helper: Übungs-Namen → Typ erkennen ---

    const isCardioName = (name: string) => {
        const n = (name || '').toLowerCase()
        const kw = [
            'lauf', 'jogg', 'run', 'treadmill',
            'rad', 'fahrrad', 'bike', 'spinning', 'cycling',
            'row', 'rudern', 'ergometer',
            'crosstrainer', 'ellip',
            'seilspring', 'rope',
            'treppen', 'stairs',
            'schwimm', 'walk', 'hike'
        ]
        return kw.some(k => n.includes(k))
    }

    const isStretchName = (name: string) => {
        const n = (name || '').toLowerCase()
        const kw = [
            'dehn', 'stretch', 'mobil', 'mobility', 'beweglich',
            'yoga', 'faszien', 'smr', 'roll', 'piriformis',
            'hamstring', 'calf stretch', 'hip opener'
        ]
        return kw.some(k => n.includes(k))
    }


    const detectedInputType = computed<ExerciseType>(() =>
        isStretchName(currentExercise.value) ? 'dehnung'
            : isCardioName(currentExercise.value) ? 'ausdauer'
                : 'kraft'
    )

    //Validation ProgressModalEntry

    const clearValidation = () => {
        validationErrorMessages.value = []
    }

    const validateProgress = (): string[] => {
        const errors: string[] = []

        if (!currentExercise.value) errors.push('Eine Übung muss ausgewählt sein')
        if (detectedInputType.value === 'ausdauer') {
            if (newProgressDuration.value == null || isNaN(newProgressDuration.value) || newProgressDuration.value <= 0)
                errors.push('Dauer (Min) muss größer als 0 sein')
            if (newProgressDistance.value != null && (isNaN(newProgressDistance.value) || newProgressDistance.value < 0))
                errors.push('Distanz (km) muss ≥ 0 sein')

            const borgN = toNum(newProgressBorg.value)
            if (borgN != null) {
                if (borgN < 6 || borgN > 20) errors.push('Borg-Skala muss zwischen 6 und 20 liegen')
            }
            else if (newProgressBorg.value != null && String(newProgressBorg.value).trim() !== '') {
                errors.push('Borg-Skala muss eine Zahl sein')
            }

            return errors
        }

        if (detectedInputType.value === 'dehnung') {
            if (newProgressSets.value == null || isNaN(newProgressSets.value) || Number(newProgressSets.value) <= 0)
                errors.push('Sätze müssen größer als 0 sein')

            if (newProgressDuration.value != null && String(newProgressDuration.value).trim() !== '') {
                const d = Number(newProgressDuration.value)
                if (!Number.isFinite(d) || d <= 0) errors.push('Dauer (Min) muss > 0 sein, wenn angegeben')
            }

            if (newProgressReps.value != null && String(newProgressReps.value).trim() !== '') {
                const r = Number(newProgressReps.value)
                if (!Number.isFinite(r) || r <= 0) errors.push('Wiederholungen müssen > 0 sein, wenn angegeben')
            }
            return errors
        }

        const perSet = (newProgressSetDetails.value ?? []).filter(r => r !== undefined)

        if (perSet.length > 0) {
            perSet.forEach((r, i) => {
                const w = Number(r.weight)
                const reps = Number(r.reps)
                if (!Number.isFinite(w) || w < 0) errors.push(`Satz ${i + 1}: Gewicht muss ≥ 0 sein`)
                if (!Number.isFinite(reps) || reps <= 0) errors.push(`Satz ${i + 1}: Wdh. müssen > 0 sein`)
            })
        } else {
            if (newProgressSets.value == null || isNaN(newProgressSets.value) || newProgressSets.value <= 0)
                errors.push('Sätze müssen größer als 0 sein')
            if (newProgressReps.value == null || isNaN(newProgressReps.value) || newProgressReps.value <= 0)
                errors.push('Wiederholungen müssen größer als 0 sein')
        }

        if (newProgressIsDropset.value && (newProgressDropsets.value?.length ?? 0) > 0) {
            newProgressDropsets.value.forEach((ds, j) => {
                const any = ds.weight != null || ds.reps != null
                if (!any) return
                if (ds.weight == null || isNaN(ds.weight) || ds.weight <= 0) errors.push(`Dropsatz ${j + 1}: Gewicht muss > 0 sein`)
                if (ds.reps == null || isNaN(ds.reps) || ds.reps <= 0) errors.push(`Dropsatz ${j + 1}: Wdh. müssen > 0 sein`)
            })
        }

        return errors
    }

    //Core-Flow fürs Modal

    const openProgressPopup = (planId: string) => {
        editingEntry.value = null
        validationErrorMessages.value = []
        showProgressExtras.value = false

        currentPlanId.value = planId
        currentExercise.value = ''
        newProgressSets.value = null
        newProgressWeight.value = latestRecordedWeightDisplay.value
        newProgressReps.value = null
        newProgressNote.value = ''
        newProgressIsDropset.value = false
        newProgressDropsets.value = []
        newProgressDuration.value = null
        newProgressDistance.value = null
        showProgressPopup.value = true
    }

    const cancelProgressEdit = () => {
        editingEntry.value = null
        validationErrorMessages.value = []
        showProgressExtras.value = false

        const planIdForReopen = reopenPlanProgressAfterSave.value ? currentPlanId.value : null
        closeProgressPopup()

        if (planIdForReopen) {
            currentPlanId.value = planIdForReopen
            showPlanProgressPopup.value = true
            reopenPlanProgressAfterSave.value = false
        }
    }

    const closeProgressPopup = () => {
        showProgressPopup.value = false

        editingEntry.value = null
        validationErrorMessages.value = []
        showProgressExtras.value = false

        currentPlanId.value = null
        currentExercise.value = ''
        newProgressSets.value = null
        newProgressWeight.value = null
        newProgressReps.value = null
        newProgressNote.value = ''
        newProgressSetDetails.value = []
        newProgressDuration.value = null
        newProgressDistance.value = null
    }

    const editProgressEntry = (planId: string, entry: Workout) => {
        currentPlanId.value = planId
        currentExercise.value = entry.exercise || ''

        newProgressSets.value = entry.sets ?? 1
        newProgressWeight.value = latestRecordedWeightDisplay.value
        newProgressReps.value = entry.reps ?? null
        newProgressNote.value = entry.note ?? ''
        editingEntry.value = entry

        newProgressDuration.value = entry.durationMin ?? null
        newProgressDistance.value = entry.distanceKm ?? null

        if (entry.setDetails && entry.setDetails.length) {
            newProgressSetDetails.value = entry.setDetails.map(s => ({
                weight: s.weight != null ? kgToDisplay(s.weight) : null,
                reps: s.reps ?? null,
            }))
            newProgressSets.value = entry.setDetails.length
        } else {
            newProgressSetDetails.value = []
        }

        newProgressIsDropset.value = Boolean(entry.isDropset && (entry.dropsets?.length ?? 0) > 0)
        newProgressDropsets.value = (entry.dropsets ?? []).map(ds => ({
            weight: ds.weight != null ? kgToDisplay(ds.weight) : null,
            reps: ds.reps ?? null,
        }))

        if (showPlanProgressPopup.value) {
            reopenPlanProgressAfterSave.value = true
            showPlanProgressPopup.value = false
        } else {
            reopenPlanProgressAfterSave.value = false
        }

        showProgressPopup.value = true
    }

    const saveProgress = () => {
        const toNum = (v: unknown): number | null => {
            if (v == null) return null
            const n = Number(String(v).replace(',', '.').trim())
            return Number.isFinite(n) ? n : null
        }
        const hasText = (v: unknown) => String(v ?? '').trim() !== ''

        const hasExercise = Boolean((currentExercise.value || '').trim())

        const displayWeight = newProgressWeight.value
        const enteredKg = (displayWeight != null && !isNaN(displayWeight) && Number(displayWeight) > 0)
            ? displayToKg(Number(displayWeight))
            : null
        const latestKg = weightHistory.value.length ? weightHistory.value[0].weight : null

        const noSets = !newProgressSets.value || Number(newProgressSets.value) <= 0
        const noReps = !newProgressReps.value || Number(newProgressReps.value) <= 0
        const noDur = !newProgressDuration.value || Number(newProgressDuration.value) <= 0
        const noDist = !newProgressDistance.value || Number(newProgressDistance.value) <= 0
        const noNote = !newProgressNote.value || newProgressNote.value.trim() === ''

        const noSetDetails = !(newProgressSetDetails.value?.length) ||
            newProgressSetDetails.value.every(s => (s?.weight == null && s?.reps == null))

        const noDropsets = !newProgressIsDropset.value ||
            !(newProgressDropsets.value?.length) ||
            newProgressDropsets.value.every(ds => (ds?.weight == null && ds?.reps == null))

        const onlyWeightChanged =
            !hasExercise && noSets && noReps && noDur && noDist && noNote && noSetDetails && noDropsets &&
            enteredKg != null && (latestKg == null || Math.abs(enteredKg - latestKg) > 1e-9)

        if (onlyWeightChanged) {
            const today = new Date().toISOString().split('T')[0]
            weightHistory.value.unshift({ date: today, weight: enteredKg })
            localStorage.setItem(LS_PROGRESS_WEIGHTS, JSON.stringify(weightHistory.value))

            newProgressWeight.value = kgToDisplay(enteredKg)
            updateWeightChart()

            addToast('Aktuelles Gewicht aktualisiert', 'save')
            closeProgressPopup()
            return
        }

        const errors = validateProgress()

        if (detectedInputType.value === 'ausdauer') {
            const borgRaw = newProgressBorg.value
            const borgN = toNum(borgRaw)

            if (hasText(borgRaw) && borgN == null) {
                errors.push('Borg-Skala muss eine Zahl sein')
            } else if (borgN != null && (borgN < 6 || borgN > 20)) {
                errors.push('Borg-Skala muss zwischen 6 und 20 liegen')
            }
        }

        if (errors.length) {
            openValidationPopupError(errors)
            return
        }

        let payload: Workout

        if (detectedInputType.value === 'ausdauer') {
            const borgN = toNum(newProgressBorg.value)

            payload = {
                planId: currentPlanId.value ?? undefined,
                exercise: currentExercise.value,
                sets: 0, weight: 0, reps: 0,
                note: newProgressNote.value?.trim() || undefined,
                date: editingEntry.value?.date ?? new Date().toISOString(),
                type: 'ausdauer',
                durationMin: Number(newProgressDuration.value),
                distanceKm: newProgressDistance.value != null ? Number(newProgressDistance.value) : undefined,

                avgHr: toNum(newProgressAvgHr.value) ?? undefined,
                calories: toNum(newProgressCalories.value) ?? undefined,
                pace: newProgressPace.value?.trim() || undefined,
                hrZone: toNum(newProgressHrZone.value) ?? undefined,
                borg: borgN ?? undefined,
            }
        } else if (detectedInputType.value === 'dehnung') {
            const repsOpt =
                (newProgressReps.value != null && String(newProgressReps.value).trim() !== '')
                    ? Number(newProgressReps.value)
                    : undefined
            const durOpt = (newProgressDuration.value != null && String(newProgressDuration.value).trim() !== '')
                ? Number(newProgressDuration.value) : undefined

            payload = {
                planId: currentPlanId.value ?? undefined,
                exercise: currentExercise.value,
                sets: Number(newProgressSets.value) || 0,
                weight: 0,
                reps: repsOpt,
                note: newProgressNote.value?.trim() || undefined,
                date: editingEntry.value?.date ?? new Date().toISOString(),
                type: 'dehnung',
                durationMin: durOpt,

                painFree: toNum(newProgressPainFree.value) ?? undefined,
                movementQuality: toNum(newProgressMovementQuality.value) ?? undefined,
                equipment: newProgressEquipment.value || undefined,
                equipmentCustom: newProgressEquipmentCustom.value || undefined,
                side: newProgressSide.value || undefined,
            }
        } else {
            const hasPerSet = (newProgressSetDetails.value?.length ?? 0) > 0
            const perSet = hasPerSet
                ? newProgressSetDetails.value
                    .filter(r => r.weight != null && r.reps != null)
                    .map(r => ({
                        weight: displayToKg(Number(r.weight)),
                        reps: Number(r.reps),
                    }))
                : []

            const first = perSet[0]

            payload = {
                planId: currentPlanId.value ?? undefined,
                exercise: currentExercise.value,
                sets: hasPerSet ? perSet.length : (Number(newProgressSets.value) || 0),
                weight: hasPerSet ? first.weight : 0,
                reps: hasPerSet ? first.reps : (Number(newProgressReps.value) || 0),
                note: newProgressNote.value?.trim() || undefined,
                date: editingEntry.value?.date ?? new Date().toISOString(),
                type: 'kraft',

                tempo: newProgressTempo.value?.trim() || undefined,
                restSeconds: toNum(newProgressRestSeconds.value) ?? undefined,

                isDropset: newProgressIsDropset.value || undefined,
                dropsets: newProgressIsDropset.value
                    ? (newProgressDropsets.value ?? [])
                        .filter(ds => ds.weight != null && ds.reps != null)
                        .map(ds => ({
                            weight: displayToKg(Number(ds.weight)),
                            reps: Number(ds.reps),
                        }))
                    : undefined,

                setDetails: hasPerSet ? perSet : undefined,
            }
        }

        {
            const displayWeight2 = newProgressWeight.value
            const enteredKg2 = (displayWeight2 != null && !isNaN(displayWeight2) && Number(displayWeight2) > 0)
                ? displayToKg(Number(displayWeight2))
                : null
            const latestKg2 = weightHistory.value.length ? weightHistory.value[0].weight : null

            if (enteredKg2 != null && (latestKg2 == null || Math.abs(enteredKg2 - latestKg2) > 1e-9)) {
                const today2 = new Date().toISOString().split('T')[0]
                weightHistory.value.unshift({ date: today2, weight: enteredKg2 })
                localStorage.setItem(LS_PROGRESS_WEIGHTS, JSON.stringify(weightHistory.value))
                updateWeightChart()
            }
        }

        if (editingEntry.value) {
            const idx = workouts.value.findIndex(
                w => w.planId === payload.planId && w.date === editingEntry.value!.date
            )
            if (idx !== -1) {
                workouts.value[idx] = payload
                showToast({ message: 'Fortschritt aktualisiert!', type: 'success', emoji: '✅' })
            }
            editingEntry.value = null
        } else {
            workouts.value.push(payload)
            if (payload.type !== 'ausdauer') {
                checkMilestones(payload.planId, payload.exercise, payload.weight, payload.reps)
            }
            showToast({ message: 'Fortschritt gespeichert!', type: 'success', emoji: '✅' })
        }

        localStorage.setItem(LS_PROGRESS_WORKOUTS, JSON.stringify(workouts.value))
        closeProgressPopup()

        if (reopenPlanProgressAfterSave.value) {
            const planIdForReopen = payload.planId
            if (planIdForReopen) {
                currentPlanId.value = planIdForReopen
                showPlanProgressPopup.value = true
            }
            reopenPlanProgressAfterSave.value = false
        }
    }

    // ===== Journal & Plan-Progress: State & Helper =====

    const maxEntries = ref(3);
    const showMore = ref<{ [key: string]: boolean }>({});

    const prevWeightHistory = ref<WeightEntry[] | null>(null)
    const prevWorkoutsSnapshot = ref<Workout[] | null>(null)
    const journalSearch = ref<string>('')
    const journalType = ref<'alle' | 'kraft' | 'calisthenics' | 'dehnung' | 'ausdauer'>('alle')

    const TYPE_LABEL: Record<WorkoutType, string> = {
        kraft: 'Kraft',
        calisthenics: 'Calisthenics',
        dehnung: 'Dehnung',
        ausdauer: 'Cardio',
    }

    const maxDropsets = (entries: Workout[]) =>
        Math.max(0, ...entries.map(e => e.dropsets?.length ?? 0))

    const padDropsets = (
        drops: Array<{ weight: number; reps: number }> | undefined,
        n: number
    ) => {
        const arr = drops ? [...drops] : []
        while (arr.length < n) arr.push(undefined as any)
        return arr
    }

    function gridCols(n: number, extras?: { tempo: boolean; rest: boolean }) {
        const base = ['0.7fr', '1fr', '0.9fr']
        const ds = Array.from({ length: n }, () => ['1fr', '0.9fr']).flat()
        const extraCols: string[] = []
        if (extras?.tempo) extraCols.push('minmax(100px, 0.9fr)')
        if (extras?.rest) extraCols.push('minmax(90px, 0.7fr)')
        return [...base, ...ds, ...extraCols].join(' ')
    }
    const summarizeCategories = (items: Workout[]): string => {
        const types = new Set<WorkoutType>(items.map(w => (w.type ?? 'kraft') as WorkoutType))
        const labels = [...types].map(t => TYPE_LABEL[t])
        if (labels.length === 1) return labels[0]
        if (labels.length > 3) return 'Gemischt'
        return labels.join(' + ')
    }

    function aggregateDay(items: Workout[]): JournalGroup[] {
        const strength = items.filter(it => (it.type ?? 'kraft') === 'kraft' || it.type === 'calisthenics')

        const byExercise = new Map<string, {
            entries: Workout[]; notes: string[]
        }>()
        for (const it of strength) {
            const key = it.exercise || 'Unbenannte Übung'
            if (!byExercise.has(key)) byExercise.set(key, { entries: [], notes: [] })

            const setCount = Math.max(1, Number(it.sets ?? 1))
            for (let s = 0; s < setCount; s++) {
                const detail = it.setDetails?.[s]
                byExercise.get(key)!.entries.push({
                    ...it,
                    sets: 1,
                    weight: detail ? detail.weight : it.weight,
                    reps: detail ? detail.reps : it.reps,
                })
            }

            if (it.note) byExercise.get(key)!.notes.push(it.note)
        }

        const groups: JournalGroup[] = []
        for (const [exercise, { entries, notes }] of byExercise.entries()) {
            groups.push({
                exercise,
                entries,
                note: notes.length ? Array.from(new Set(notes)).join(' | ') : null,
            })
        }

        return groups.sort((a, b) => a.exercise.localeCompare(b.exercise, 'de'))
    }

    const journalDays = computed<JournalDay[]>(() => {
        if (!currentPlanId.value) return []
        const all = getProgressForPlan(currentPlanId.value)

        const filtered = all.filter(w => {
            const t = (w.type ?? 'kraft') as WorkoutType
            const typeOk = journalType.value === 'alle' || t === journalType.value
            if (!typeOk) return false
            const q = journalSearch.value.trim().toLowerCase()
            if (!q) return true
            const inExercise = (w.exercise || '').toLowerCase().includes(q)
            const inNote = (w.note || '').toLowerCase().includes(q)
            return inExercise || inNote
        })

        const byDay = new Map<string, Workout[]>()
        for (const w of filtered) {
            const day = (w.date || '').slice(0, 10)
            if (!byDay.has(day)) byDay.set(day, [])
            byDay.get(day)!.push(w)
        }

        return Array.from(byDay.entries())
            .sort((a, b) => b[0].localeCompare(a[0]))
            .map(([day, items]) => ({ day, groups: aggregateDay(items) }))
    })

    const visibleJournalDays = computed(() => journalDays.value.slice(0, visibleDays.value))

    const groupsForDay = (day: string) => {
        const items = entriesByDay.value.get(day) ?? []
        return aggregateDay(items)
    }

    const sortedPlanEntries = computed<Workout[]>(() => {
        if (!currentPlanId.value) return []
        return [...getProgressForPlan(currentPlanId.value)]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    })

    const deleteProgressEntry = (planId: string, date: string) => {
        workouts.value = workouts.value.filter(w => !(w.planId === planId && w.date === date));
        localStorage.setItem(LS_PROGRESS_WORKOUTS, JSON.stringify(workouts.value));
        showToast({ message: 'Eintrag gelöscht!', type: 'success', emoji: '🗑️' });
    };

    function strengthExtrasFlags(entries: Workout[]): { tempo: boolean; rest: boolean } {
        const tempo = entries.some(e => (e.tempo || '').trim().length > 0)
        const rest = entries.some(e => e.restSeconds != null && Number.isFinite(e.restSeconds as number))
        return { tempo, rest }
    }

    const calculateProgress = (planId: string) => {
        const today = new Date().toISOString().split('T')[0];
        const progressEntries = getProgressForPlan(planId).filter(entry => entry.date.startsWith(today));
        const totalExercises = trainingPlans.value.find(p => p.id === planId)?.exercises.length || 1;
        return Math.min((progressEntries.length / totalExercises) * 100, 100);
    };

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

    const openInTraining = (planId: string) => {
        localStorage.setItem(LS_OPEN_PLAN_ID, planId)
        router.push({ name: 'Training' })
    }

    //Show Progress

    type PlanProgressPopupExposed = { modalEl: HTMLElement | null }

    const showPlanProgressPopup = ref(false)
    const currentPlanId = ref<string | null>(null);
    const planProgressPopupRef = ref<PlanProgressPopupExposed | null>(null)
    const visibleDays = ref(7)
    const expandedDays = ref<Set<string>>(new Set())

    let endIO: IntersectionObserver | null = null

    function setupProgressIO() {
        const root = planProgressPopupRef.value?.modalEl ?? null
        if (!root) return
        const endEl = root.querySelector('.scroll-sentinel-end')
        if (!endEl) return
        if (endIO) { endIO.disconnect(); endIO = null }

        endIO = new IntersectionObserver(
            ([entry]) => {
                root.classList.toggle('at-bottom', entry.isIntersecting)
            },
            { root, threshold: 1.0 }
        )
        endIO.observe(endEl)
    }

    function cleanupProgressIO() {
        if (endIO) { endIO.disconnect(); endIO = null }
    }

    const closePlanProgressPopup = () => {
        showPlanProgressPopup.value = false
    }

    const currentPlanName = computed(() =>
        trainingPlans.value.find(p => p.id === currentPlanId.value)?.name ?? ''
    )

    const formatDayLong = (yyyyMMdd: string) => {
        const [y, m, d] = yyyyMMdd.split('-').map(Number)
        return new Date(y, (m ?? 1) - 1, d ?? 1).toLocaleDateString('de-DE', {
            weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric'
        })
    }

    const getProgressForPlan = (planId: string) => {
        return workouts.value.filter((workout) => workout.planId === planId);
    };

    const entriesByDay = computed(() => {
        const map = new Map<string, Workout[]>()
        if (!currentPlanId.value) return map
        for (const w of getProgressForPlan(currentPlanId.value)) {
            const day = (w.date || '').slice(0, 10)
            if (!map.has(day)) map.set(day, [])
            map.get(day)!.push(w)
        }
        // Neueste Tage zuerst
        return new Map([...map.entries()].sort((a, b) => b[0].localeCompare(a[0])))
    })

    const dayCards = computed<DayCard[]>(() => {
        return [...entriesByDay.value.entries()].map(([day, items]) => {
            const uniqueExercises = new Set(items.map(i => i.exercise)).size
            return { day, uniqueExercises }
        })
    })

    const visibleDayCards = computed(() =>
        dayCards.value.slice(0, visibleDays.value)
    )

    const editLatestEntryForDay = (day: string) => {
        if (!currentPlanId.value) return
        const items = getProgressForPlan(currentPlanId.value)
            .filter(w => (w.date || '').slice(0, 10) === day)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

        if (!items.length) {
            showToast({ message: 'Kein Eintrag für diesen Tag', type: 'default' })
            return
        }
        editProgressEntry(currentPlanId.value, items[0])
    }

    function toggleDay(day: string) {
        const next = new Set(expandedDays.value)
        next.has(day) ? next.delete(day) : next.add(day)
        expandedDays.value = next
    }

    const cardioForDay = (day: string) => {
        const items = entriesByDay.value.get(day) ?? []
        return items.filter(w => (w.type ?? 'kraft') === 'ausdauer')
    }

    const stretchForDay = (day: string) => {
        const items = entriesByDay.value.get(day) ?? []
        return items.filter(w => (w.type ?? 'kraft') === 'dehnung')
    }

    const addEntryFromPlanView = () => {
        if (!currentPlanId.value) return
        reopenPlanProgressAfterSave.value = true
        showPlanProgressPopup.value = false
        openProgressPopup(currentPlanId.value)
    }

    watch(showPlanProgressPopup, (open) => {
        nextTick(() => {
            if (open) setupProgressIO();
            else cleanupProgressIO();
        });
    })

    watch(showPlanProgressPopup, v => {
        document.body.style.overflow = v ? 'hidden' : ''
    })

    //======== Export Popup ========

    const showDownloadPopup = ref(false);
    const downloadFormat = ref<'html' | 'csv' | 'json' | 'pdf' | 'txt'>('html');
    const downloadCalculator = ref<string | null>(null);
    const downloadPlanId = ref<string | null>(null);

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

            case 'burnRate':
                if (!burnRateResult.value) { addToast('Kein Burn-Rate-Ergebnis zum Herunterladen', 'default'); closeDownloadPopup(); return }
                data = {
                    start_weight: burnStartWeight.value,
                    goal_weight: burnGoalWeight.value,
                    unit: unit.value,
                    maintenance_kcal_per_day: burnMaintenance.value,
                    intake_kcal_per_day: burnIntake.value,
                    daily_delta_kcal: Math.round(burnRateResult.value.dailyDelta),
                    weekly_change_kg: burnRateResult.value.weeklyChangeKg,
                    weekly_change_display: burnRateResult.value.weeklyChangeDisplay,
                    days_to_goal: burnRateResult.value.daysToGoal,
                    note: burnRateResult.value.note ?? null,
                }
                filename = 'burn_rate_result'
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
                const plan = trainingPlans.value.find(p => p.id === downloadPlanId.value)
                const progress = getProgressForPlan(downloadPlanId.value)
                if (!progress.length) { addToast('Kein Fortschritt zum Herunterladen', 'default'); closeDownloadPopup(); return; }

                data = {
                    planName: plan?.name || 'Unbekannter Plan',
                    progress: progress.map((e) => ({
                        type: e.type ?? 'kraft',
                        exercise: e.exercise,
                        date: formatDate(e.date),
                        duration_min: (e.type === 'ausdauer' || e.type === 'dehnung') ? (e.durationMin ?? null) : null,
                        distance_km: (e.type === 'ausdauer') ? (e.distanceKm ?? null) : null,
                        sets: e.sets ?? null,
                        reps: e.reps ?? null,
                        weight_raw_kg: (e.type === 'kraft' || e.type === 'calisthenics') ? e.weight : null,
                        weight_display: (e.type === 'kraft' || e.type === 'calisthenics') ? formatWeight(e.weight, 1) : null,
                        note: e.note ?? null,
                    })),
                }
                filename = `progress_${(plan?.name || 'plan').toLowerCase().replace(/\s+/g, '_')}`
                break
            }

            case 'glyload':
                if (glResult.value == null) { addToast('Kein GL-Ergebnis zum Herunterladen', 'default'); closeDownloadPopup(); return }
                data = {
                    food: glFood.value,
                    serving_g: glServing.value,
                    carbs_per_100g_g: glCarbs100.value,
                    gi: glGi.value,
                    gl_per_serving: glResult.value.toFixed(1),
                    category: glCategory.value,
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
                    const header = 'type,exercise,date,duration_min,distance_km,sets,reps,weight_raw_kg,weight_display,note'
                    content = header + '\n' + data.progress.map((e: any) => [
                        e.type, e.exercise, e.date,
                        e.duration_min ?? '', e.distance_km ?? '',
                        e.sets ?? '', e.reps ?? '',
                        e.weight_raw_kg ?? '', e.weight_display ?? '',
                        (e.note ?? '').toString().replace(/\n/g, ' ')
                    ].join(',')).join('\n')
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
                        `#${i + 1}
Typ: ${e.type}
Übung: ${e.exercise}
Datum: ${e.date}
Dauer (Min): ${e.duration_min ?? '-'}
Distanz (km): ${e.distance_km ?? '-'}
Sätze: ${e.sets ?? '-'}
Wdh: ${e.reps ?? '-'}
Gewicht: ${e.weight_display ?? '-'}
Notiz: ${e.note ?? '-'}\n`
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

    const downloadResult = (fmt: 'pdf' | 'html' | 'csv' | 'json' | 'txt') => {
        downloadFormat.value = fmt as any;
        confirmDownload();
    };

    // --- Confirm-Delete (global Setting) ---
    const confirmDeleteEnabled = ref(true)

    const showDeleteConfirmPopup = ref(false)
    let pendingDeleteAction: null | (() => void) = null

    const requestDeleteConfirm = (opts: { title?: string; message?: string; onConfirm: () => void }) => {
        if (!confirmDeleteEnabled.value) {
            opts.onConfirm()
            return
        }
        pendingDeleteAction = opts.onConfirm
        showDeleteConfirmPopup.value = true
    }

    const confirmDeleteNow = () => {
        const fn = pendingDeleteAction
        pendingDeleteAction = null
        showDeleteConfirmPopup.value = false
        fn?.()
    }

    const cancelDeleteConfirm = () => {
        pendingDeleteAction = null
        showDeleteConfirmPopup.value = false
    }

    function handleConfirmDeleteSetting(e: Event) {
        confirmDeleteEnabled.value = Boolean((e as CustomEvent).detail)
        if (!confirmDeleteEnabled.value && showDeleteConfirmPopup.value) {
            cancelDeleteConfirm()
        }
    }

    // --- Toast: State / Config

    const toast = ref<ToastModel | null>(null)
    let toastId = 0

    const toastsEnabled = ref(true)

    const suppressToasts = ref(false)
    let toastReleaseTimer: ReturnType<typeof setTimeout> | null = null

    const toastPosition = ref<'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'>('bottom-right')
    const lastResetAction = ref<{ kind: 'weight' | 'workout'; data: any } | null>(null)
    const lastCalculatorReset = ref<{
        id: 'bmi' | 'calories' | 'oneRm' | 'bodyFat' | 'ffmi' | 'water' | 'protein' | 'caffeine' | 'glyload' | 'burnRate';
        data: any;
    } | null>(null)
    // --- Toast: Dismiss & Exit-Animation ---

    function onToastDismiss(id: number) {
        if (!toast.value || toast.value.id !== id) return

        // erst Exit-Animation aktivieren …
        toast.value.exiting = true

        // … dann nach kurzer Zeit wirklich aus dem State werfen
        setTimeout(() => {
            if (toast.value?.id === id) {
                toast.value = null
            }
        }, 220) // ~0.2s, passend zur CSS-Animation
    }

    // --- Toast: Globale Unterdrückung/Freigabe (suppressToasts) ---

    function releaseToasts() {
        if (!suppressToasts.value) return
        suppressToasts.value = false
        window.removeEventListener('pointerdown', releaseToasts)
        window.removeEventListener('keydown', releaseToasts)
        window.removeEventListener('touchstart', releaseToasts as any)
        if (toastReleaseTimer) {
            clearTimeout(toastReleaseTimer)
            toastReleaseTimer = null
        }
    }

    function withSilentToasts(fn: () => void) {
        const prev = suppressToasts.value
        suppressToasts.value = true
        try { fn() } finally { suppressToasts.value = prev }
    }

    // --- Toast: Settings (externes Event "toasts-enabled-changed") ---

    function handleToastsSetting(e: Event) {
        const enabled = Boolean((e as CustomEvent).detail)
        toastsEnabled.value = enabled

        // wenn global deaktiviert → aktuellen Toast schließen
        if (!enabled && toast.value) {
            toast.value = null
        }
    }

    // --- Toast: API nach außen (showToast / addToast) ---

    function showToast(opts: { message: string; type?: 'default' | 'add' | 'delete' | 'save' | 'timer' | 'reset' | 'success'; emoji?: string }) {
        const mapped = opts.type === 'success' ? 'add' : (opts.type ?? 'default');
        addToast(opts.message, mapped);
    }

    const addToast = (
        message: string,
        type: 'delete' | 'add' | 'save' | 'timer' | 'load' | 'reset' | 'default' = 'load',
        action?: { label: string; handler: () => void }
    ) => {
        if (!toastsEnabled.value) return
        if (suppressToasts.value) return

        const id = toastId++
        const emojis = {
            delete: '🗑️',
            add: '✅',
            save: '💾',
            timer: '⏰',
            load: '📋',
            reset: '♻️',
            default: '📋',
        } as const
        const types = {
            delete: 'toast-delete',
            add: 'toast-add',
            save: 'toast-save',
            timer: 'toast-timer',
            load: 'toast-default',
            reset: 'toast-reset',
            default: 'toast-default',
        } as const

        const mapped = types[type]
        const durationMs = Number(localStorage.getItem(LS_TOAST_DURATION_MS)) || 3000
        toast.value = { id, message, emoji: emojis[type], type: mapped, exiting: false, action, durationMs }
    }

    // --- Toast: Integration mit Overlays & Sichtbarkeit ---

    const externalOverlayOpen = ref(false)
    const bodyBlocked = ref(false)
    let _globalOverlayDepth = 0

    const overlayOpen = computed(() =>
        showProgressPopup.value
        || showWeightPopup.value
        || showGoalPopup.value
        || showDownloadPopup.value
        || showPlanProgressPopup.value
        || validationErrorMessages.value.length > 0
        || externalOverlayOpen.value
        || bodyBlocked.value
    )

    // ===== Utility: Zahlen, Debounce, Format, Charts, Global-Events =====

    const toNum = (v: unknown): number | null => {
        if (v == null) return null
        const n = Number(String(v).replace(',', '.').trim())
        return Number.isFinite(n) ? n : null
    }

    function debounce<F extends (...args: any[]) => void>(fn: F, wait = 300) {
        let t: number | undefined
        return (...args: Parameters<F>) => {
            if (t) clearTimeout(t)
            t = window.setTimeout(() => fn(...args), wait)
        }
    }

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

    const getExercisesForPlan = (planId: string | null) => {
        if (!planId) return [];
        const plan = trainingPlans.value.find((p) => p.id === planId);
        return plan ? plan.exercises : [];
    };

    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };


    //Validation Error Popup

    const openValidationPopupError = (errors: string[]) => {
        validationErrorMessages.value = errors
        errors.forEach(e => addToast(e, 'default'))
    }

    // ======= Milestones + loadFromLocalStorage =======

    const checkMilestones = (
        planId?: string,
        exercise?: string,
        weightKg?: number,
        reps?: number
    ) => {
        if (workouts.value.length >= 10) {
            celebrateMilestone('Meilenstein: 10 Workouts erreicht! 🎉');
        }


        if (initialWeight.value && typeof currentWeight.value === 'string') {
            const weightChange = Math.abs(Number(currentWeight.value) - initialWeight.value);
            if (weightChange >= 5) {
                celebrateMilestone('Meilenstein: 5 kg Gewichtsveränderung! 🎉');
            }
        }

        if (planId && exercise && typeof weightKg === 'number' && typeof reps === 'number') {
            const progressEntries = getProgressForPlan(planId);
            const lastEntry = progressEntries
                .filter(e => e.exercise === exercise && (e.type === 'kraft' || e.type === 'calisthenics'))
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

            if (lastEntry) {
                const improved =
                    weightKg > lastEntry.weight ||
                    (weightKg === lastEntry.weight && (reps ?? -Infinity) > (lastEntry.reps ?? -Infinity));
                if (improved) {
                    showToast({ message: `Meilenstein erreicht! ${exercise}: ${formatWeight(weightKg, 0)} × ${reps} Wdh. 🎉`, type: 'success', emoji: '🎉' });
                    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                }
            }
        }
    };

    const celebrateMilestone = (message: string) => {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        addToast(message, 'default');
    };

    const loadFromLocalStorage = () => {
        try {
            const weightsData = localStorage.getItem(LS_PROGRESS_WEIGHTS);
            if (weightsData) {
                const parsed = JSON.parse(weightsData);
                if (Array.isArray(parsed)) {
                    weightHistory.value = parsed;
                }
            }
            const bmiData = localStorage.getItem(LS_PROGRESS_BMI);
            if (bmiData) {
                const parsed = JSON.parse(bmiData);
                bmiGender.value = parsed.gender;
                bmiWeight.value = parsed.weight;
                bmiHeight.value = parsed.height;
                bmiResult.value = parsed.result;
            }
            const calorieData = localStorage.getItem(LS_PROGRESS_CALORIES);
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
            const oneRmData = localStorage.getItem(LS_PROGRESS_ONE_RM);
            if (oneRmData) {
                const parsed = JSON.parse(oneRmData);
                oneRmExercise.value = parsed.exercise;
                oneRmWeight.value = parsed.weight;
                oneRmReps.value = parsed.reps;
                oneRmResult.value = parsed.result;
            }
            const bodyFatData = localStorage.getItem(LS_PROGRESS_BODY_FAT);
            if (bodyFatData) {
                const parsed = JSON.parse(bodyFatData);
                bodyFatGender.value = parsed.gender;
                bodyFatWaist.value = parsed.waist;
                bodyFatNeck.value = parsed.neck;
                bodyFatHip.value = parsed.hip;
                bodyFatHeight.value = parsed.height;
                bodyFatResult.value = parsed.result;
            }
            const ffmiData = localStorage.getItem(LS_PROGRESS_FFMI);
            if (ffmiData) {
                const parsed = JSON.parse(ffmiData);
                ffmiWeight.value = parsed.weight;
                ffmiHeight.value = parsed.height;
                ffmiBodyFat.value = parsed.bodyFat;
                ffmiResult.value = parsed.result;
            }
            const waterData = localStorage.getItem(LS_PROGRESS_WATER);
            if (waterData) {
                const parsed = JSON.parse(waterData);
                waterWeight.value = parsed.weight;
                waterActivity.value = parsed.activity;
                waterClimate.value = parsed.climate;
                waterResult.value = parsed.result;
            }
            const goalData = localStorage.getItem(LS_PROGRESS_GOAL);
            if (goalData) {
                const parsed = JSON.parse(goalData);
                goal.value = parsed.goal;
            }
            const workoutsData = localStorage.getItem(LS_PROGRESS_WORKOUTS);
            if (workoutsData) {
                const parsed = JSON.parse(workoutsData);
                workouts.value = parsed;
            }
            const proteinData = localStorage.getItem(LS_PROGRESS_PROTEIN);
            if (proteinData) {
                const parsed = JSON.parse(proteinData)
                proteinWeight.value = parsed.weight
                proteinGoal.value = parsed.goal
                proteinResult.value = parsed.result

                if (autoCalcEnabled.value && !validateProtein().length) {
                    calculateProtein()
                }
            }

            const burnData = localStorage.getItem(LS_PROGRESS_BURN_RATE);
            if (burnData) {
                const parsed = JSON.parse(burnData)
                burnStartWeight.value = parsed.startWeight ?? null
                burnGoalWeight.value = parsed.goalWeight ?? null
                burnMaintenance.value = parsed.maintenance ?? null
                burnIntake.value = parsed.intake ?? null
                burnRateResult.value = parsed.result ?? null

                if (autoCalcEnabled.value && !validateBurnRate().length) {
                    calculateBurnRate()
                }
            }

            const trainingData = localStorage.getItem(LS_TRAINING_DATA);
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


    const handleKeydown = (event: KeyboardEvent) => {
        if (validationErrorMessages.value.length) {
            if (event.key === 'Escape' || event.key === 'Enter') {
                event.preventDefault()
                validationErrorMessages.value = []
            }
            return
        }

        if (event.key === 'Escape') {
            if (showProgressPopup.value) {
                event.preventDefault()
                cancelProgressEdit()
                return
            }
            closeWeightPopup()
            closeGoalPopup()
            closeDownloadPopup()
        } else if (event.key === 'Enter') {
            if (showWeightPopup.value) { event.preventDefault(); saveWeight() }
            else if (showGoalPopup.value) { event.preventDefault(); saveGoal() }
            else if (showProgressPopup.value) {
                event.preventDefault()
                progressEntryModalRef.value?.submit?.()
            }
            else if (showDownloadPopup.value) { event.preventDefault(); confirmDownload() }
        }
    }

    onUnmounted(() => { document.body.style.overflow = '' })

    watch(newProgressWeight, (v) => {
        if (detectedInputType.value === 'kraft' || detectedInputType.value === 'calisthenics') {
            newWeight.value = v ?? newWeight.value
        }
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
        withSilentToasts(loadFromLocalStorage)
        checkMilestones()

        // --- Toast: Settings (externes Event) ---
        window.addEventListener('toasts-enabled-changed', handleToastsSetting)

        // --- Keyboard / Global-Shortcuts ---
        window.addEventListener('keydown', handleKeydown)

        // --- Toast: Suppression-Release ---
        window.addEventListener('pointerdown', releaseToasts)
        window.addEventListener('keydown', releaseToasts)
        window.addEventListener('touchstart', releaseToasts as any)

        toastReleaseTimer = setTimeout(() => releaseToasts(), 1500)
    })

    onUnmounted(() => {
        // --- Toast: Settings & Suppression ---
        window.removeEventListener('toasts-enabled-changed', handleToastsSetting);
        window.removeEventListener('pointerdown', releaseToasts);
        window.removeEventListener('keydown', releaseToasts);
        window.removeEventListener('touchstart', releaseToasts as any);

        // --- Keyboard / Global Shortcuts ---
        window.removeEventListener('keydown', handleKeydown);

        // --- Progress / IntersectionObserver ---
        cleanupProgressIO();

        // --- Charts Cleanup ---
        if (weightChart) weightChart.destroy();
        if (workoutChart) workoutChart.destroy();
        if (macroChart) macroChart.destroy();
    })
</script>

<style scoped>
    .progress {
        padding: clamp(1.4rem, 3vw, 2.4rem);
        min-height: 100vh;
        font-family: 'Inter', sans-serif;
        color: var(--text-primary);
        overflow-x: hidden;
        /* kein eigener Verlauf hier, damit der Seiten-Background durchgeht */
        background: transparent;
    }

    /* Dark Mode soll auch keinen eigenen Background setzen */
    html.dark-mode .progress {
        background: transparent;
    }
    /* Canvas nie breiter als der Container */
    .chart-canvas {
        display: block;
        width: 100% !important; /* überschreibt Chart.js-Inlinebreite */
        max-width: 100%;
        height: 240px !important; /* fixe, angenehme Mobile-Höhe */
        box-sizing: border-box;
    }

    /* ===== Trainingspläne-Liste (Pläne-Tab) ===== */

    /* Trainingspläne-Box – mehr "Card"-Feeling wie Dashboard/Calculators */
    /* Trainingspläne-Box – gleiches Card-Universum wie Dashboard/Calculators */
    .workout-list {
        position: relative;
        background: radial-gradient( circle at top left, color-mix(in srgb, var(--accent-primary) 10%, transparent), transparent 56% ), radial-gradient( circle at bottom right, color-mix(in srgb, var(--accent-secondary) 8%, transparent), transparent 60% ), color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
        border: 1px solid rgba(148, 163, 184, 0.35);
        border-radius: 18px;
        padding: 1.3rem 1.4rem 1.2rem;
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.22);
        overflow: hidden;
    }

    /* Dark-Mode Variante – wie DashboardCard / CalculatorCard */
    html.dark-mode .workout-list {
        background: radial-gradient( circle at top left, color-mix(in srgb, #6366f1 16%, transparent), transparent 55% ), radial-gradient( circle at bottom right, color-mix(in srgb, #22c55e 11%, transparent), transparent 62% ), #020617;
        border-color: rgba(148, 163, 184, 0.5);
        box-shadow: 0 22px 55px rgba(0, 0, 0, 0.7);
    }

    .section-title {
        font-size: 0.9rem;
        font-weight: 600;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: color-mix(in srgb, var(--text-secondary) 78%, #9ca3af 22%);
        margin: .15rem 0 .85rem;
    }

    /* Zeilen für einzelne Trainingspläne – clean, aber „klickig“ */
    /* Progress.vue – REPLACE .list-item + :hover */

    .list-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: .75rem;
        padding: .75rem 1rem;
        margin-bottom: .5rem;
        /* gleiche Welt wie workout-list / plan-card */
        background: radial-gradient( circle at top left, color-mix(in srgb, var(--accent-primary) 10%, transparent), transparent 60% ), radial-gradient( circle at bottom right, color-mix(in srgb, var(--accent-secondary) 8%, transparent), transparent 62% ), color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
        border: 1px solid rgba(148, 163, 184, 0.35);
        border-radius: 12px;
        box-shadow: 0 14px 30px rgba(15, 23, 42, 0.25);
        transition: background 180ms ease-out, border-color 180ms ease-out, transform 140ms ease-out, box-shadow 200ms ease-out;
    }

        .list-item:hover {
            background: radial-gradient( circle at top left, color-mix(in srgb, var(--accent-primary) 16%, transparent), transparent 55% ), radial-gradient( circle at bottom right, color-mix(in srgb, var(--accent-secondary) 11%, transparent), transparent 60% ), color-mix(in srgb, var(--bg-card) 90%, #020617 10%);
            border-color: rgba(129, 140, 248, 0.7);
            transform: translateY(-2px);
            box-shadow: 0 22px 48px rgba(15, 23, 42, 0.4);
        }

    /* optional: Dark-Mode explizit angleichen */
    html.dark-mode .list-item {
        background: radial-gradient( circle at top left, color-mix(in srgb, #6366f1 16%, transparent), transparent 55% ), radial-gradient( circle at bottom right, color-mix(in srgb, #22c55e 11%, transparent), transparent 62% ), #020617;
        border-color: rgba(148, 163, 184, 0.5);
    }

    /* REPLACE in Progress.vue – .open-btn Styles */

    /* REPLACE in Progress.vue – .open-btn Styles */

    .open-btn {
        appearance: none;
        border: 1px solid rgba(148, 163, 184, 0.6); /* wie Cards / list-item */
        background: color-mix(in srgb, var(--bg-card) 82%, var(--bg-secondary) 18%);
        color: color-mix(in srgb, var(--accent-primary) 80%, #e5e7eb 20%);
        font-weight: 600;
        padding: .42rem .9rem;
        border-radius: 999px;
        cursor: pointer;
        box-shadow: 0 10px 24px rgba(15, 23, 42, 0.55), 0 0 0 1px rgba(15, 23, 42, 0.7); /* crisp edge, wie deine anderen Elemente */
        text-shadow: 0 0 6px rgba(15, 23, 42, 0.9);
        backdrop-filter: blur(6px);
        transition: background 160ms ease-out, border-color 160ms ease-out, color 140ms ease-out, transform 100ms ease-out, box-shadow 180ms ease-out;
    }

        .open-btn:hover {
            background: color-mix(in srgb, var(--accent-primary) 22%, var(--bg-card) 78%);
            border-color: color-mix(in srgb, var(--accent-primary) 90%, #a5b4fc 10%);
            color: #f9fafb;
            transform: translateY(-1px);
            box-shadow: 0 14px 32px rgba(15, 23, 42, 0.7), 0 0 14px color-mix(in srgb, var(--accent-primary) 55%, transparent);
        }

        .open-btn:active {
            transform: translateY(0);
            box-shadow: 0 8px 18px rgba(15, 23, 42, 0.55), 0 0 0 1px rgba(15, 23, 42, 0.9);
        }


    /* leerer Zustand übernimmt den gleichen Card-Look */
    .workout-list .list-item.empty {
        justify-content: center;
        color: var(--text-secondary);
    }

    /* Mobile Feinschliff */
    @media (max-width: 600px) {
        .workout-list {
            padding: 1.1rem 1.1rem 1rem;
            border-radius: 16px;
        }

        .list-item {
            padding: .65rem .8rem;
        }

        .plan-item span {
            font-size: .9rem;
        }

        .open-btn {
            padding: .4rem .7rem;
            font-size: .95rem;
        }
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
        --cards-gap-x: 1.1rem;
        --cards-gap-y: 0.9rem;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: var(--cards-gap-y) var(--cards-gap-x);
        align-items: stretch;
        margin-bottom: 1.4rem;
        width: 100%;
        max-width: 100%;
    }

    /* Feintuning für sehr kleine Screens: 1 Spalte hart erzwingen */
    @media (max-width: 520px) {
        .dashboard-grid {
            grid-template-columns: minmax(0, 1fr);
            gap: 0.85rem;
        }
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

    .progress-charts {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); /* flexibler */
        gap: 1.5rem;
        margin-bottom: 2rem;
        max-width: 100%;
        /* Hover-Effekte der ChartCards sollen nicht abgeschnitten werden */
        overflow: visible;
    }

        .progress-charts .card-info {
            margin: 0;
            margin-top: 0.2rem;
            font-size: 0.95rem;
            font-weight: 500;
            color: var(--text-secondary);
        }

        .progress-charts > * {
            min-width: 0;
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



    /* Ernährungsplan-Card – gleiche Welt wie andere Cards, ohne Farb-Overkill */
    .plan-card {
        position: relative;
        z-index: 1;
        background: radial-gradient( circle at top left, color-mix(in srgb, var(--accent-primary) 10%, transparent), transparent 56% ), radial-gradient( circle at bottom right, color-mix(in srgb, var(--accent-secondary) 8%, transparent), transparent 60% ), color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
        padding: 1.3rem 1.4rem 1.2rem;
        border-radius: 18px;
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.22);
        border: 1px solid rgba(148, 163, 184, 0.35);
        transition: background 180ms ease-out, border-color 180ms ease-out, box-shadow 200ms ease-out, transform 160ms ease-out;
        cursor: default;
        overflow: hidden;
        width: 100%;
    }

        /* leichter Hover wie bei der Trainingspläne-Box */
        .plan-card::before {
            content: '';
            position: absolute;
            inset: 0;
            background: radial-gradient(circle at top left, rgba(129, 140, 248, 0.18), transparent 60%);
            opacity: 0;
            transition: opacity 160ms ease-out;
            pointer-events: none;
        }

        .plan-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 22px 48px rgba(15, 23, 42, 0.32);
            border-color: rgba(129, 140, 248, 0.7);
        }

            .plan-card:hover::before {
                opacity: 1;
            }

    /* Dark-Mode angleichen zur workout-list */
    html.dark-mode .plan-card {
        background: radial-gradient( circle at top left, color-mix(in srgb, #6366f1 16%, transparent), transparent 55% ), radial-gradient( circle at bottom right, color-mix(in srgb, #22c55e 11%, transparent), transparent 62% ), #020617;
        border-color: rgba(148, 163, 184, 0.5);
        box-shadow: 0 22px 55px rgba(0, 0, 0, 0.7);
    }

    /* Header + Titel im gleichen Stil wie andere Card-Header */
    .plan-card .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.9rem;
    }

    .plan-card .card-title {
        font-size: 1rem;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: color-mix(in srgb, var(--text-secondary) 82%, #9ca3af 18%);
        display: flex;
        align-items: center;
        gap: .4rem;
    }

    .plan-card p,
    .plan-card .plan-description {
        font-size: 0.95rem;
        color: var(--text-secondary);
        line-height: 1.5;
    }

    /* Action-Bereich rechts (Download-Icon) */
    .plan-card .card-actions {
        display: flex;
        gap: .5rem;
        align-items: center;
    }

    /* Mobile Feinschliff */
    @media (max-width: 600px) {
        .plan-card {
            padding: 1.3rem 1.3rem 1.1rem;
            border-radius: 16px;
        }

            .plan-card .card-title {
                font-size: 0.9rem;
            }
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



    /* ===================== EXPORT-POPUP ===================== */

    .plans-section {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        width: 100%;
    }

        /* Sicherstellen, dass beide Karten nicht nebeneinander floaten o.ä. */
        .plans-section .workout-list,
        .plans-section .plan-card {
            width: 100%;
            max-width: 100%;
        }

    /* ===================== BERECHNEN BUTTON ===================== */
    .set-table-wrapper {
        overflow-x: auto;
        max-width: 100%;
        padding-bottom: .25rem; /* Platz für die Scrollbar */
        scrollbar-gutter: stable both-edges;
        scrollbar-width: thin;
    }

        .set-table-wrapper::-webkit-scrollbar {
            height: 10px; /* horizontale Scrollbar */
        }

        .set-table-wrapper::-webkit-scrollbar-thumb {
            background: var(--border-color);
            border-radius: 8px;
        }

    .cell--tempo {
        min-width: 100px;
    }

    .cell--rest {
        min-width: 90px;
    }

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

    /* ===== Trainingspläne-Liste (Pläne-Tab) ===== */

    .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,.4);
        display: grid;
        place-items: center;
        z-index: 60;
    }

    .modal {
        width: min(560px, 92vw);
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        box-shadow: var(--shadow);
        padding: 1rem 1rem 0.75rem;
    }

    .modal-title {
        font-weight: 700;
        margin: .25rem 0 0.75rem;
    }

    .field-label {
        display: block;
        font-size: .9rem;
        color: var(--text-secondary);
        margin: .5rem 0 .25rem;
    }

    .input {
        width: 100%;
        padding: .6rem .75rem;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        background: var(--bg-secondary);
        color: var(--text-primary);
    }

        .input:focus {
            outline: none;
            border-color: var(--accent-primary);
        }

    .select {
        appearance: auto;
    }

    .modal-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: .75rem;
    }

    .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: .5rem;
        margin-top: .9rem;
    }

    .btn {
        appearance: none;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: .55rem .9rem;
        font-weight: 600;
        cursor: pointer;
    }

        .btn.ghost {
            background: transparent;
            color: var(--text-primary);
        }

        .btn.primary {
            background: var(--accent-primary);
            color: #fff;
            border-color: transparent;
        }

    .errors {
        margin: .75rem 0 1rem;
        color: #b91c1c;
        font-size: .9rem;
    }

    @media (max-width: 520px) {
        .modal-grid {
            grid-template-columns: 1fr;
        }
    }


    .plan-item span {
        color: var(--text-secondary);
        font-size: .95rem;
    }

    .list-item-actions {
        display: flex;
        gap: .5rem;
    }


    /* Fortschritt ansehen – Header mit Download-Button rechts */
    .modal .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: .75rem; /* etwas Luft unter dem Header */
    }

    .modal .card-actions {
        margin-left: auto;
        display: flex;
        gap: .5rem;
    }

    /* Optional: Titel enger machen, damit er optisch auf gleicher Höhe sitzt */
    .modal .modal-title {
        margin: .25rem 0 .5rem;
    }
    /* Journal Toolbar */
    .journal-toolbar {
        display: flex;
        gap: .5rem;
        margin: .25rem 0 .75rem;
    }

    .journal {
        display: flex;
        flex-direction: column;
        gap: .75rem;
    }

    .journal-day {
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: 10px;
        padding: .5rem .75rem;
    }

    .journal-day-header {
        display: flex;
        align-items: baseline;
        gap: .5rem;
        margin-bottom: .25rem;
    }

    .journal-entries {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .journal-entry {
        padding: .6rem .5rem;
        border-top: 1px dashed var(--border-color);
    }

        .journal-entry:first-child {
            border-top: 0;
        }

    .entry-head {
        display: flex;
        align-items: center;
        gap: .5rem .6rem;
        flex-wrap: wrap;
    }

    .entry-exercise {
        font-weight: 600;
    }

    .entry-summary {
        margin-left: auto;
        font-size: .9rem;
        color: var(--text-secondary);
    }

    .type-chip {
        font-size: .75rem;
        padding: .15rem .45rem;
        border-radius: 999px;
        border: 1px solid var(--border-color);
        background: var(--bg-secondary);
        color: var(--text-secondary);
    }

        .type-chip[data-type="ausdauer"] {
            border-color: #60a5fa22;
        }

        .type-chip[data-type="dehnung"] {
            border-color: #34d39922;
        }

        .type-chip[data-type="kraft"],
        .type-chip[data-type="calisthenics"] {
            border-color: #a78bfa22;
        }

    .chips {
        display: flex;
        flex-wrap: wrap;
        gap: .35rem;
        margin-top: .35rem;
    }

    .chip {
        padding: .2rem .45rem;
        border-radius: 999px;
        border: 1px solid var(--border-color);
        background: var(--bg-secondary);
        font-size: .85rem;
    }

    .note {
        margin-top: .25rem;
        color: var(--text-secondary);
        font-size: .9rem;
    }

    .load-more {
        display: flex;
        justify-content: center;
        margin-top: .5rem;
    }

    .muted {
        color: var(--text-secondary);
    }
    /* Tages-Cards */
    .day-card-list {
        display: flex;
        flex-direction: column;
        gap: .75rem;
    }

    .day-card {
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: .6rem .75rem;
    }

    .day-card-row {
        display: flex;
        align-items: center;
        gap: .75rem;
    }

    .day-card-main {
        flex: 1;
        min-width: 0;
    }

    .day-date {
        font-weight: 700;
    }

    .day-meta {
        display: flex;
        align-items: center;
        gap: .35rem;
        color: var(--text-secondary);
        font-size: .9rem;
    }

    .day-card-actions {
        display: flex;
        align-items: center;
        gap: .4rem; /* Abstand zwischen "Bearbeiten" und "Öffnen/Schließen" */
    }

    .day-details {
        margin-top: .5rem;
    }

    /* Details (nutzt dein Journal-Layout) */
    .journal-entries {
        list-style: none;
        margin: 0;
        padding: 0;
    }

    .journal-entry {
        padding: .6rem .5rem;
        border-top: 1px dashed var(--border-color);
    }

        .journal-entry:first-child {
            border-top: 0;
        }

    .entry-head {
        display: flex;
        gap: .6rem;
        align-items: center;
        flex-wrap: wrap;
    }

    .entry-exercise {
        font-weight: 600;
    }

    .entry-summary {
        margin-left: auto;
        font-size: .9rem;
        color: var(--text-secondary);
    }

    .type-chip {
        font-size: .75rem;
        padding: .15rem .45rem;
        border-radius: 999px;
        border: 1px solid var(--border-color);
        background: var(--bg-secondary);
        color: var(--text-secondary);
    }

        .type-chip[data-type="ausdauer"] {
            border-color: #60a5fa22;
        }

        .type-chip[data-type="dehnung"] {
            border-color: #34d39922;
        }

        .type-chip[data-type="kraft"],
        .type-chip[data-type="calisthenics"] {
            border-color: #a78bfa22;
        }

    .chips {
        display: flex;
        flex-wrap: wrap;
        gap: .35rem;
        margin-top: .35rem;
    }

    .chip {
        padding: .2rem .45rem;
        border-radius: 999px;
        border: 1px solid var(--border-color);
        background: var(--bg-secondary);
        font-size: .85rem;
    }

    .note {
        margin-top: .25rem;
        color: var(--text-secondary);
        font-size: .9rem;
    }

    .load-more {
        display: flex;
        justify-content: center;
        margin-top: .5rem;
    }

    .exercise-block {
        margin: .5rem 0 1rem;
    }

    .exercise-header {
        font-weight: 700;
        margin: .1rem 0 .4rem;
    }

    .set-table {
        display: flex;
        flex-direction: column;
        gap: .35rem;
    }

    .set-row {
        display: flex;
        gap: .5rem;
        align-items: center;
        flex-wrap: wrap; /* bricht auf kleinen Screens sauber um */
    }

    .set-row--head {
        font-size: .85rem;
        color: var(--text-secondary);
    }

    .cell {
        padding: .25rem .45rem;
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: 6px;
        text-align: center;
        min-height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .cell--set {
        min-width: 70px;
        font-weight: 600;
    }

    .cell--weight, .cell--reps, .cell--ds {
        min-width: 88px;
    }

    @media (max-width: 560px) {
        .cell--weight, .cell--reps, .cell--ds {
            min-width: 76px;
        }
    }

    /* Tabelle nutzt volle Breite des Modals */
    .set-table {
        width: 100%;
    }

    /* Jede Zeile ist ein Grid mit gemeinsamen Spalten (per CSS-Var) */
    .set-row {
        display: grid;
        grid-template-columns: var(--grid-cols, 0.7fr 1fr 0.9fr);
        gap: .5rem;
        align-items: center;
    }

    /* Kopfzeile optisch dezenter */
    .set-row--head {
        font-size: .9rem;
        color: var(--text-secondary);
    }

    /* Zellen ohne starre Mindestbreite – füllen die Grid-Spalten */
    .cell {
        min-width: 0; /* überschreibt alte min-width */
        padding: .35rem .5rem;
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: 6px;
        text-align: center;
    }

    /* linke „Satz“-Spalte leicht linksbündig und markanter */
    .cell--set {
        text-align: left;
        font-weight: 600;
    }

    /* alte Min-Breiten abschalten, damit das Grid regiert */
    .cell--weight, .cell--reps, .cell--ds {
        min-width: 0;
    }
    /* Fortschritt-Modal: scrollt erst ab Schwellenhöhe, responsiv */
    .modal--progress {
        display: flex;
        flex-direction: column;
        /* zeigt die Scrollbar nur, wenn die Höhe überschritten wird */
        overflow: auto;
        /* Schwelle: nimm die kleinere von 92% der Viewport-Höhe (mobile sicher)
     und 760px (auf großen Monitoren nicht unendlich hoch) */
        max-height: min(92svh, 760px);
        /* Breite angenehm und responsiv clamped */
        width: clamp(320px, 92vw, 720px);
        /* verhindert “Hintergrund-Scroll-Mitnahme” beim starken Scrollen */
        overscroll-behavior: contain;
        /* Layout springt nicht, wenn die Scrollbar auftaucht */
        scrollbar-gutter: stable;
    }

    /* etwas “Atemluft”, damit das Modal auf Mini-Screens nicht am Rand klebt */
    .modal-overlay {
        padding: 2svh 1rem;
    }

    /* Tablet-Feintuning (optional): etwas kleinere Hartkapp */
    @media (max-width: 900px) {
        .modal--progress {
            max-height: min(92svh, 680px);
        }
    }

    /* sehr kleine Geräte: volle Höhe nutzen, Breite enger */
    @media (max-width: 640px) {
        .modal--progress {
            width: 96vw;
            max-height: 92svh;
            border-radius: 10px;
        }
    }

    /* Fallback für Browser ohne svh-Unterstützung */
    @supports not (height: 1svh) {
        .modal--progress {
            max-height: min(92vh, 760px);
        }

        .modal-overlay {
            padding: 2vh 1rem;
        }
    }

    /* (optional) dezente Scrollbar */
    .modal--progress::-webkit-scrollbar {
        width: 10px;
    }

    .modal--progress::-webkit-scrollbar-thumb {
        background: var(--border-color);
        border-radius: 8px;
    }

    .modal--progress {
        scrollbar-width: thin;
    }
        /* 1) Fortschritt-Header sticky halten */
        .modal--progress > .card-header {
            position: sticky;
            top: 0;
            z-index: 2;
            margin: 0 0 .5rem;
            padding: .75rem .75rem .5rem; /* etwas mehr Padding */
            background: var(--bg-card); /* füllt die Fläche vollständig */
            border-bottom: 1px solid var(--border-color);
            backdrop-filter: none; /* kein „durchscheinender“ Rand */
        }


        /* Optional: Footer-Buttons ebenfalls sticky unten (komfortabel bei langen Listen) */
        .modal--progress > .modal-actions {
            position: sticky;
            bottom: 0;
            z-index: 2;
            padding: .5rem .25rem;
            margin: .5rem 0 0; /* kein negativer Rand-Trick */
            background: transparent; /* Streifen weg */
            border-top: 0;
            box-shadow: none;
        }

        /* Nur wenn man GANZ UNTEN ist → wieder normaler Footer-Hintergrund */
        .modal--progress.at-bottom > .modal-actions {
            background: var(--bg-card);
            border-top: 1px solid var(--border-color);
        }

    /* 3) Overlay: auf Mini-Screens Ränder sichern */
    .modal-overlay {
        /* damit oben/unten genug Luft ist und man bis ganz zum Anfang/Ende scrollen kann */
        padding: clamp(8px, 2svh, 20px) 12px;
    }

    /* Tablet/kleine Laptops */
    @media (max-width: 900px) {
        .modal--progress {
            max-height: min(92svh, 640px);
        }
    }

    @media (max-width: 900px) {
        .modal--progress {
            max-height: min(92svh, 640px);
        }
    }

    @media (max-width: 540px) {
        .modal--progress {
            width: clamp(300px, 82vw, 560px);
        }
    }

    @media (max-width: 420px) {
        .modal--progress {
            width: 94vw;
            max-height: 92svh;
            border-radius: 10px;
        }
    }

    /* Fallback für Browser ohne svh */
    @supports not (height: 1svh) {
        .modal--progress {
            max-height: min(90vh, 680px);
        }

        .modal-overlay {
            padding: clamp(8px, 2vh, 20px) 12px;
        }
    }

    /* sehr kleine Geräte */
    @media (max-width: 640px) {
        .modal--progress {
            width: 96vw;
            max-height: 92svh;
            border-radius: 10px;
        }
    }

    /* Fallback für Browser ohne svh */
    @supports not (height: 1svh) {
        .modal--progress {
            max-height: min(90vh, 680px);
        }

        .modal-overlay {
            padding: clamp(8px, 2vh, 20px) 12px;
        }
    }

    /* dezente, schmale Scrollbar (optional) */
    .modal--progress::-webkit-scrollbar {
        width: 10px;
    }

    .modal--progress::-webkit-scrollbar-thumb {
        background: var(--border-color);
        border-radius: 8px;
    }

    .modal--progress {
        scrollbar-width: thin;
    }

    /* 4) Compact spacing im Inhalt (macht das Popup "schmaler/dünner" wirkend) */
    .day-card {
        padding: .5rem .6rem;
    }

    .set-row {
        gap: .4rem;
    }

    .cell {
        padding: .3rem .45rem;
    }

    .day-card-actions {
        gap: .35rem;
    }

    /* --- Fix: Lücke über dem Fortschritt-Titel + sticky Header --- */
    .modal--progress {
        /* entfernt das leere Top-Padding der Modal-Box */
        padding-top: 0;
        /* allgemein etwas schmaler + niedriger als bisher */
        width: clamp(300px, 84vw, 640px);
        max-height: min(88svh, 640px);
        /* Rest wie gehabt */
        display: flex;
        flex-direction: column;
        overflow: auto;
        overscroll-behavior: contain;
        scrollbar-gutter: stable;
    }

        /* Header füllt die komplette Fläche oben aus */
        .modal--progress > .card-header {
            position: sticky;
            top: 0;
            z-index: 2;
            margin: 0; /* kein zusätzlicher Spalt */
            padding: 1rem 1rem .5rem; /* ersetzt dein .75rem .75rem .5rem */
            background: var(--bg-card); /* deckt die Fläche */
            border-bottom: 1px solid var(--border-color);
            backdrop-filter: none;
        }
    /* Tablet */
    @media (max-width: 900px) {
        .modal--progress {
            width: clamp(300px, 86vw, 600px);
            max-height: min(86svh, 600px);
        }
    }

    /* Abstand zwischen Header-Linie und erstem Inhalt im Fortschritt-Modal */
    .modal--progress > .card-header + .list-item.empty,
    .modal--progress > .card-header + .day-card-list {
        margin-top: 1rem; /* taste dich bei Bedarf ran: .75rem – 1.25rem */
    }
</style>
<style>
    body:has(.modal-overlay) {
        overflow: hidden;
    }
</style>