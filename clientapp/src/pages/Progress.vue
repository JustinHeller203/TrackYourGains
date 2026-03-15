<!--Progress.vue-->
<template>
    <div class="progress">
        <div
            v-if="isPhonePreviewProgressDemo && previewTouch.visible"
            class="preview-touch"
            :class="{ 'is-pressing': previewTouch.pressing }"
            :style="{ left: `${previewTouch.x}px`, top: `${previewTouch.y}px` }">
            <span class="preview-touch__dot"></span>
        </div>
        <!-- ===================== HEADER / INTRO ===================== -->
        <h2 class="page-title">📊 Dein Fortschritt</h2>
        <p class="page-subtext">Alles Wichtige auf einen Blick.</p>

        <div class="dashboard-container">
            <!-- ===================== DASHBOARD-CARDS ===================== -->
            <div class="dashboard-grid">

                <ProgressWeightCard v-model:weightHistory="weightHistory"
                                    :unit="unit"
                                    :compact="compactCards"
                                    :formatWeight="formatWeight"
                                    :kgToDisplay="kgToDisplay"
                                    :displayToKg="displayToKg"
                                    @saved="onWeightSaved"
                                    @invalid="openValidationPopupError" />

                <ProgressCaloriesTodayCard :meals="meals"
                                           :compact="compactCards"
                                           :targetCalories="2500" />

                <ProgressLastWorkoutCard :workouts="workouts"
                                         :compact="compactCards"
                                         :formatWeight="formatWeight" />

                <ProgressGoalWeightCard v-model:goalKg="goal"
                                        :unit="unit"
                                        :compact="compactCards"
                                        :formatWeight="formatWeight"
                                        :kgToDisplay="kgToDisplay"
                                        :displayToKg="displayToKg"
                                        @saved="onGoalSaved"
                                        @invalid="openValidationPopupError" />
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
                           @click="openWeightHistoryCalendarPopup"
                           @export="openDownloadPopup('weightStats')"
                           @reset="resetWeightStats">
                    <canvas id="weightChart"
                            class="chart-canvas chart-canvas--clickable"
                            title="Gewichtsverlauf im Kalender öffnen"
                            aria-label="Gewichtsverlauf im Kalender öffnen"></canvas>
                </ChartCard>

                <ChartCard title="Trainingsstatistik"
                           :hasData="hasWorkoutStats"
                           exportable
                           @click="openTrainingStatsDetails"
                           @export="openDownloadPopup('workoutStats')"
                           @reset="resetWorkoutStats">
                    <template #subtitle>
                        <p class="card-info">Gesamt-Workouts: {{ strengthWorkouts.length }}</p>
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
                                   @reset="resetCalculator('bmi')"
                                   @invalid="onCalcInvalid" />

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
                                        @reset="resetCalculator('calories')"
                                        @invalid="onCalcInvalid" />

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
                                        @reset="resetCalculator('burnRate')"
                                        @invalid="onCalcInvalid" />

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
                                       @reset="resetCalculator('protein')"
                                       @invalid="onCalcInvalid" />

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
                                     @reset="resetCalculator('oneRm')"
                                     @invalid="onCalcInvalid" />

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
                                       @reset="resetCalculator('bodyFat')"
                                       @invalid="onCalcInvalid" />

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
                                                @reset="onCafReset"
                                                @invalid="onCalcInvalid" />

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
                                    @reset="resetCalculator('ffmi')"
                                    @invalid="onCalcInvalid" />
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
                                            @reset="resetCalculator('glyload')"
                                            @invalid="onCalcInvalid" />


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
                                     @reset="resetCalculator('water')"
                                     @invalid="onCalcInvalid" />
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
                               @reset="resetCalculator('bmi')"
                               @invalid="onCalcInvalid" />

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
                                    @reset="resetCalculator('calories')"
                                    @invalid="onCalcInvalid" />

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
                                    @reset="resetCalculator('burnRate')"
                                    @invalid="onCalcInvalid" />

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
                                   @reset="resetCalculator('protein')"
                                   @invalid="onCalcInvalid" />

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
                                 @reset="resetCalculator('oneRm')"
                                 @invalid="onCalcInvalid" />
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
                                            @reset="onCafReset"
                                            @invalid="onCalcInvalid" />

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
                                   @reset="resetCalculator('bodyFat')"
                                   @invalid="onCalcInvalid" />

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
                                @reset="resetCalculator('ffmi')"
                                @invalid="onCalcInvalid" />
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
                                        @reset="resetCalculator('glyload')"
                                        @invalid="onCalcInvalid" />


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
                                 @reset="resetCalculator('water')"
                                 @invalid="onCalcInvalid" />
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
                                    <button type="button" class="open-btn" @click="openPlanProgress(plan.id)">Öffnen</button>
                                </div>
                            </div>
                        </div>

                        <div v-if="otherPlans.length">
                            <h4 class="section-title" style="margin-top: .5rem;">Weitere Pläne</h4>
                            <div v-for="plan in otherPlans" :key="plan.id" class="list-item plan-item">
                                <span>{{ plan.name }} ({{ plan.exercises.length }} Übungen)</span>
                                <div class="list-item-actions">
                                    <button type="button" class="open-btn" @click="openPlanProgress(plan.id)">Öffnen</button>
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
        <!-- Fortschritt ansehen (Cards je Tag) — OHNE Teleport -->
        <PlanProgressPopup ref="planProgressPopupRef"
                           :show="showPlanProgressPopup"
                           :currentPlanId="currentPlanId"
                           :currentPlanName="currentPlanName"
                           :initialView="planProgressInitialView"
                           :planRotationNotice="planRotationNotice"
                           :planRotationTestNotice="planRotationTestNotice"
                           :workouts="workouts"
                           :feedbackStatusByDay="feedbackStatusByDayForCurrentPlan"
                           :formatDayLong="formatDayLong"
                           @close="closePlanProgressPopup"
                           @add-entry="(p) => addEntryFromPlanView(p)"
                           @download="onPlanProgressDownload"
                           @edit-day="editLatestEntryForDay"
                           @edit-entry="editEntryFromPlanView"
                           @delete-day="deleteLatestEntryForDay"
                           @delete-entries="deleteEntriesFromPlanView"
                           @delete="deleteEntriesFromPlanView"
                           @feedback="onPlanProgressFeedbackClick" />

        <ProgressEntryModal ref="progressEntryModalRef"
                            v-model:show="showProgressPopup"
                            :unit="unit"
                            :exercises="getExercisesForPlan(effectivePlanId)"
                            :errors="validationErrorMessages"
                            :planId="effectivePlanId"
                            :latestBodyWeightDisplay="latestRecordedWeightValue"
                            :prefillExercise="progressContinuationPrefillExercise"
                            :prefillSetValues="progressContinuationPrefillSetValues"
                            :activeSetNumber="progressContinuationActiveSetNumber"
                            :prefillSetValuesByExercise="todayTrackedSetValuesByExercise"
                            @save="onProgressModalSave"
                            @delete="onProgressModalDelete"
                            @cancel="onProgressModalCancel"
                            @dismissErrors="clearValidation"
                            @invalid="openValidationPopupError" />

        <BasePopup :show="showTrainingCompletePrompt"
                   title="Training fertig?"
                   overlayClass="training-complete-popup"
                   :showClose="true"
                   :show-actions="false"
                   @cancel="closeTrainingCompletePrompt">
            <div class="training-complete-body">
                Du hast heute alle Übungen erfasst. War das Training abgeschlossen?
            </div>
            <div class="training-complete-actions">
                <PopupActionButton variant="ghost" @click="closeTrainingCompletePrompt">
                    Nein
                </PopupActionButton>
                <PopupActionButton @click="confirmTrainingComplete">
                    Ja
                </PopupActionButton>
            </div>
        </BasePopup>

        <TrainingFeedbackForm :show="showTrainingFeedback"
                              :exercises="feedbackExercisesForPlan"
                              :initialFeedback="trainingFeedbackInitialData"
                              :reviewMode="trainingFeedbackReviewMode"
                              @submit="onTrainingFeedbackSubmit"
                              @skip="onTrainingFeedbackSkip"
                              @close="onTrainingFeedbackClose" />

        <PainFeedbackPopup :show="showPainFeedback"
                           @save="onPainFeedbackSave"
                           @skip="onPainFeedbackSkip" />

        <PainZeroConfirmPopup :show="showPainZeroConfirm"
                              :complaints="painZeroCandidates"
                              @confirmGone="onPainZeroConfirmGone"
                              @keep="onPainZeroKeep" />

        <WeightHistoryCalendarPopup :show="showWeightHistoryCalendarPopup"
                                    :entries="weightHistory"
                                    :goalKg="goal"
                                    :unitLabel="unit"
                                    :formatWeightText="(kg: number) => formatWeight(kg, 1)"
                                    @close="closeWeightHistoryCalendarPopup" />
        <!-- Export-Popup -->
        <ExportPopup :show="showDownloadPopup"
                     v-model="downloadFormat"
                     @confirm="confirmDownload"
                     @cancel="closeDownloadPopup" />

        <!-- Validation Popup-->
        <ValidationPopup :show="calcValidationErrors.length > 0"
                         :errors="calcValidationErrors"
                         @close="clearCalcValidation" />

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
    import { jsPDF } from 'jspdf';
    import { useUnits, KG_PER_LB } from '@/composables/useUnits'
    import Toast from '@/components/ui/Toast.vue'
    import ProgressCaloriesTodayCard from '@/components/ui/progress/ProgressCaloriesTodayCard.vue'
    import ProgressWeightCard from '@/components/ui/progress/ProgressWeightCard.vue'
    import ProgressGoalWeightCard from '@/components/ui/progress/ProgressGoalWeightCard.vue'
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
    import BasePopup from '@/components/ui/popups/BasePopup.vue'
    import PopupActionButton from '@/components/ui/buttons/popup/PopupActionButton.vue'
    import type { Toast as ToastModel } from '@/types/toast'
    import ProgressEntryModal from '@/components/ui/popups/ProgressEntryModal.vue'
    import ValidationPopup from '@/components/ui/popups/ValidationPopup.vue'
    import DeleteConfirmPopup from '@/components/ui/popups/DeleteConfirmPopup.vue'
    import PlanProgressPopup from '@/components/ui/popups/PlanProgressPopup.vue'
    import TrainingFeedbackForm from '@/components/ui/popups/feedback/TrainingFeedbackForm.vue'
    import PainFeedbackPopup from '@/components/ui/feedback/PainFeedbackPopup.vue'
    import PainZeroConfirmPopup from '@/components/ui/feedback/PainZeroConfirmPopup.vue'
    import WeightHistoryCalendarPopup from '@/components/ui/popups/WeightHistoryCalendarPopup.vue'
    import { useProgressStore } from "@/store/progressStore"
    import { useComplaintsStore } from "@/store/complaintsStore"
    import type { CreateProgressEntry, UpdateProgressEntry } from "@/types/Progress"
    import type { TrainingDay, TrainingExercise, TrainingPlan as TrainingPlanDto } from "@/types/TrainingPlan"
    import {
        detectPersonalRecordHits,
        personalRecordMetricLabel,
        personalRecordMetricValueLabel,
    } from '@/utils/personalRecords'
    import { useTrainingPlansStore } from "@/store/trainingPlansStore"
    import { useAuthStore } from "@/store/authStore"
    import ProgressLastWorkoutCard from '@/components/ui/progress/ProgressLastWorkoutCard.vue'
    import { useWeightStore } from "@/store/weightStore"
    import {
        createTrainingSession,
        listTrainingSessions,
        upsertTrainingSessionFeedback,
        type CreateTrainingSessionPayload,
        type TrainingSessionFeedbackPayload,
        type TrainingSessionFeedbackRecord
    } from "@/services/trainingSessions"
    import { listTrainingPlanner, setTrainingPlannerCompletion } from "@/services/trainingPlanner"
    import { appendPainDiaryEntry, evaluatePainDiarySignals } from '@/components/ui/feedback/painDiary'
    import type { ComplaintEntry } from '@/types/complaint'

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
        LS_TRAINING_PLANNER,
        LS_TRAINING_PLANNER_COMPLETED,
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
        weight: number | null
        reps: number | null
    }

    interface Workout {
        id?: string
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
        setDetails?: Array<{ weight: number | null; reps: number | null; durationSec?: number | null; label?: string | null }>
        isDropset?: boolean
        dropsets?: Array<{ weight: number | null; reps: number | null }>
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

    type ProgressEntryModalExposed = {
        openCreate: (opts: { planId: string; defaultBodyWeightDisplay: number | null }) => void
        openEdit: (opts: { planId: string; entry: Workout }) => void
        submit?: () => void
    }

    type PlanProgressPopupExposed = {
        modalEl?: HTMLElement | null
        refreshPlannerState?: () => void | Promise<void>
    }

    type ProgressContinuationDraft = {
        exercise: string
        valuesBySet: Record<number, { weight?: number | null; reps?: number | null }>
        lastCompletedSetNo: number
    }

    const trainingPlansStore = useTrainingPlansStore()
    const auth = useAuthStore()
    const complaintsStore = useComplaintsStore()

    const activePlanId = computed(() => effectivePlanId.value)

    const planExerciseOptions = computed<string[]>(() => {
        const id = activePlanId.value
        if (!id) return []

        const dto = trainingPlansStore.items.find((p: TrainingPlanDto) => p.id === id)
        if (!dto || !Array.isArray(dto.days)) return []

        const names = dto.days.flatMap((d: TrainingDay) =>
            Array.isArray(d.exercises) ? d.exercises.map((x: TrainingExercise) => String(x.name ?? "").trim()) : []
        ).filter(Boolean)

        // unique + sort
        return Array.from(new Set(names)).sort((a: string, b: string) => a.localeCompare(b, "de"))
    })

    // ====== CHARTS UND COPY >>>>>>>>>>

    //INSTANZEN

    let weightChart: Chart | null = null;
    let workoutChart: Chart | null = null;
    let macroChart: Chart | null = null;

    //Funktionen

    const toDayKey = (dateStr?: string) => {
        if (!dateStr) return null
        const d = new Date(dateStr)
        if (Number.isNaN(d.getTime())) return null
        const y = d.getFullYear()
        const m = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `${y}-${m}-${day}`
    }

    const chartEntries = computed(() => {
        const byDay = new Map<string, { entry: WeightEntry; ts: number }>()
        for (const entry of weightHistory.value) {
            const day = toDayKey(entry.date)
            const ts = new Date(entry.date).getTime()
            if (!day || !Number.isFinite(ts)) continue
            const prev = byDay.get(day)
            if (!prev || ts >= prev.ts) {
                byDay.set(day, { entry, ts })
            }
        }
        return Array.from(byDay.values())
            .map(x => x.entry)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    })

    const updateWeightChart = () => {
        const canvas = document.getElementById('weightChart') as HTMLCanvasElement;
        if (!canvas || activeTab.value !== 'stats') return;

        if (weightChart) weightChart.destroy();
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        weightChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartEntries.value.map((entry) => formatDate(entry.date)),
                datasets: [
                    {
                        label: `Gewicht (${unit.value})`,
                        data: chartEntries.value.map((entry) => kgToDisplay(entry.weight)),
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
        const statWorkouts = strengthWorkouts.value;

        workoutChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: statWorkouts.map((w) => w.exercise),
                datasets: [
                    {
                        label: `Gewicht (${unit.value})`,
                        data: statWorkouts.map((w) => kgToDisplay(w.weight)),
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

    function normalizeWorkoutType(rawTypeInput: unknown, exerciseInput = '', workoutLike?: Partial<Workout>): WorkoutType {
        const rawType = String(rawTypeInput ?? '').trim().toLowerCase()
        const name = String(exerciseInput ?? '').toLowerCase()

        const numericType = Number(rawType)
        if (Number.isFinite(numericType)) {
            if (numericType === 1) return 'calisthenics'
            if (numericType === 2) return 'dehnung'
            if (numericType === 3) return 'ausdauer'
            return 'kraft'
        }

        if (rawType === 'kraft' || rawType === 'strength' || rawType === 'weights' || rawType === 'weight') {
            return 'kraft'
        }
        if (rawType === 'ausdauer' || rawType === 'cardio' || rawType === 'endurance' || rawType === 'aerobic') {
            return 'ausdauer'
        }
        if (rawType === 'dehnung' || rawType === 'stretch' || rawType === 'stretching' || rawType === 'mobility') {
            return 'dehnung'
        }
        if (rawType === 'calisthenics' || rawType === 'bodyweight' || rawType === 'bw') {
            return 'calisthenics'
        }

        const isCalisthenicsName = ['klimmzug', 'pull up', 'chin up', 'muscle up', 'liegest', 'push up', 'dip', 'handstand', 'l sit',
            'l-sit', 'front lever', 'back lever', 'human flag', 'planche', 'burpee', 'pistol squat', 'dragon flag', 'toes to bar']
            .some(keyword => name.includes(keyword))
        if (isCalisthenicsName) {
            return 'calisthenics'
        }

        const isCardioName = ['lauf', 'jogg', 'run', 'treadmill', 'rad', 'fahrrad', 'bike', 'spinning', 'cycling', 'row', 'rudern',
            'ergometer', 'crosstrainer', 'ellip', 'seilspring', 'rope', 'treppen', 'stairs', 'schwimm', 'walk', 'hike']
            .some(keyword => name.includes(keyword))
        if (
            isCardioName
            || workoutLike?.durationMin != null
            || workoutLike?.distanceKm != null
            || workoutLike?.avgHr != null
            || workoutLike?.pace != null
            || workoutLike?.hrZone != null
        ) {
            return 'ausdauer'
        }

        const isStretchName = ['dehn', 'stretch', 'mobil', 'mobility', 'beweglich', 'yoga', 'faszien', 'smr', 'roll', 'hip opener']
            .some(keyword => name.includes(keyword))
        const hasStretchFields = workoutLike?.painFree != null || workoutLike?.side != null || workoutLike?.equipment != null
            || (Array.isArray(workoutLike?.setDetails) && workoutLike.setDetails.some((set) => set?.durationSec != null))
        if (isStretchName || hasStretchFields) {
            return 'dehnung'
        }

        return 'kraft'
    }

    function getWorkoutTypeForStats(workout: Workout): WorkoutType {
        return normalizeWorkoutType(workout.type, workout.exercise, workout)
    }

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

    const weightHistory = ref<WeightEntry[]>([])
    const workouts = ref<Workout[]>([])
    const meals = ref<Meal[]>([])

    // goal kommt aus Backend (GoalWeight-Tabelle)
    const goal = ref<number | null>(null)

    const weightStore = useWeightStore()
    // Tabs + Responsive-Handling für :compact in DashboardCard

    const mq = window.matchMedia('(max-width: 600px)')
    const isMobile = ref<boolean>(mq.matches)

    const handleMqChange = (e: MediaQueryListEvent | MediaQueryList) => {
        isMobile.value = 'matches' in e ? e.matches : (e as MediaQueryList).matches
    }

    onMounted(async () => {
        handleMqChange(mq)
        mq.addEventListener?.('change', handleMqChange as any)

        await Promise.all([
            weightStore.loadEntries(),
            weightStore.loadSummary(),
        ])

        weightHistory.value = (weightStore.entries ?? []).map((x: any) => ({
            date: x.date,
            weight: (x.weightKg ?? x.weight) as number,
        }))

        goal.value = weightStore.goalKg
    })

    onUnmounted(() => {
        mq.removeEventListener?.('change', handleMqChange as any)
    })

    const onWeightSaved = async () => {
        await Promise.all([
            weightStore.loadEntries(true),
            weightStore.loadSummary(true),
        ])

        weightHistory.value = (weightStore.entries ?? []).map((x: any) => ({
            date: x.date,
            weight: (x.weightKg ?? x.weight) as number,
        }))

        goal.value = weightStore.goalKg

        nextTick(() => updateWeightChart())

        addToast('Gewicht gespeichert', 'save')
        checkMilestones()
    }

    const onGoalSaved = async () => {
        await weightStore.loadSummary(true)
        goal.value = weightStore.goalKg

        addToast('Zielgewicht gespeichert', 'default')
    }

    // 👉 wird in allen 4 DashboardCards als :compact benutzt

    const compactCards = computed(() => activeTab.value === 'stats' && isMobile.value)

    //  Validierung für Gewicht & Zielgewicht
    const validationErrorMessages = ref<string[]>([]);

    // ===== TabsBar: Aktiver Tab + Suchfelder =====

    // Suche

    const searchQuery = ref<string>('');
    const planSearchQuery = ref<string>('');

    const activeTab = ref<'stats' | 'calculators' | 'plans'>('stats');

    // ===== Stats-Tab: ChartCard Gewichtsverlauf & Trainingsstatistik =====

    const hasWeightStats = computed(() => weightHistory.value.length > 0)

    // Chart initial + bei Änderungen sauber neu zeichnen
    watch(
        [activeTab, unit, () => weightHistory.value.length],
        async () => {
            if (activeTab.value !== 'stats') return
            await nextTick()
            updateWeightChart()
        },
        { flush: 'post' },
    )

    const strengthWorkouts = computed(() => workouts.value.filter((workout) => getWorkoutTypeForStats(workout) === 'kraft'))

    const hasWorkoutStats = computed(() => strengthWorkouts.value.length > 0)

    watch(
        [activeTab, unit, strengthWorkouts],
        async () => {
            if (activeTab.value !== 'stats') return
            await nextTick()
            updateWorkoutChart()
        },
        { flush: 'post' },
    )

    const doResetWeightStats = () => {
        // alten Zustand für Undo merken
        const snapshot = [...weightHistory.value]
        lastResetAction.value = {
            kind: 'weight',
            data: snapshot,
        }

        // wirklich zurücksetzen
        ;(async () => {
            try {
                if (auth.isAuthenticated) {
                    await weightStore.clearAllEntries()
                    weightHistory.value = (weightStore.entries ?? []).map((x: any) => ({
                        date: x.date,
                        weight: x.weight,
                    }))
                    goal.value = weightStore.goalKg
                } else {
                    weightHistory.value = []
                }

                if (weightChart) {
                    weightChart.destroy()
                    weightChart = null
                }

                releaseToasts()
                addToast('Gewichtsverlauf zurückgesetzt', 'reset')
            } catch {
                addToast('Gewichtsverlauf konnte nicht gelöscht werden', 'default')
            } finally {
                lastResetAction.value = null
            }
        })()
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

        ;(async () => {
            try {
                if (auth.isAuthenticated) {
                    const ids = Array.from(
                        new Set(
                            workouts.value
                                .map(w => w.id)
                                .filter((x): x is string => typeof x === 'string' && x.length > 0),
                        ),
                    )

                    await Promise.allSettled(
                        ids.map(id => {
                            const planId = workouts.value.find(w => w.id === id)?.planId
                            return planId ? progressStore.remove(planId, id) : Promise.resolve()
                        }),
                    )
                }

                workouts.value = []
                localStorage.setItem(LS_PROGRESS_WORKOUTS, JSON.stringify(workouts.value))

                if (workoutChart) workoutChart.destroy()
                updateWorkoutChart()

                releaseToasts()
                addToast('Trainingsstatistik zurückgesetzt', 'reset')
            } catch {
                addToast('Trainingsstatistik konnte nicht gelöscht werden', 'default')
            } finally {
                lastResetAction.value = null
            }
        })()
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

    const toastsEnabled = ref(true)

    onMounted(() => {
        const flag = localStorage.getItem(LS_AUTO_CALC_ENABLED)
        autoCalcEnabled.value = flag === 'true'
        loadFavoriteCalculators()

        const stored = localStorage.getItem(LS_TOASTS_ENABLED)
        toastsEnabled.value = stored === null ? true : stored === 'true'
    })


    // ===== Allgemein zu den Calculators =====
    const autoCalcEnabled = ref(false)

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
                        saveToLocalStorage(LS_PROGRESS_BMI, prev)
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
                        saveToLocalStorage(LS_PROGRESS_CALORIES, prev)
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
                        saveToLocalStorage(LS_PROGRESS_BURN_RATE, prev)
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
                        saveToLocalStorage(LS_PROGRESS_ONE_RM, prev)
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
                        saveToLocalStorage(LS_PROGRESS_BODY_FAT, prev)
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
                        saveToLocalStorage(LS_PROGRESS_FFMI, prev)
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
                        saveToLocalStorage(LS_PROGRESS_WATER, prev)
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
                        saveToLocalStorage(LS_PROGRESS_PROTEIN, {
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
                        saveToLocalStorage(LS_PROGRESS_CAFFEINE, prev)
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
                        saveToLocalStorage(LS_PROGRESS_GLYLOAD, {
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

    //=============== Validation Rechner ===========

    const calcValidationErrors = ref<string[]>([])

    function onCalcInvalid(errors: string[]) {
        calcValidationErrors.value = errors
    }
    function clearCalcValidation() {
        calcValidationErrors.value = []
    }
    //=============== Jump to Rechner Infos ===========

    const route = useRoute()
    const router = useRouter()
    const progressStore = useProgressStore()
    const previewProgressTimers: number[] = []
    const previewTouch = ref({ visible: false, x: 0, y: 0, pressing: false })
    const isPhonePreviewProgressDemo = computed(
        () => route.query.preview === 'phone' && route.query.demo === 'progress-tour'
    )

    function clearPreviewProgressTimers() {
        previewProgressTimers.forEach(id => window.clearTimeout(id))
        previewProgressTimers.length = 0
    }

    function queuePreviewProgressStep(delay: number, task: () => void) {
        previewProgressTimers.push(window.setTimeout(task, delay))
    }

    function movePreviewTouch(selector: string, xFactor = 0.5, yFactor = 0.5) {
        const target = document.querySelector<HTMLElement>(selector)
        if (!target) return

        const rect = target.getBoundingClientRect()
        previewTouch.value = {
            visible: true,
            x: rect.left + rect.width * xFactor,
            y: rect.top + rect.height * yFactor,
            pressing: false,
        }
    }

    function pressPreviewTouch(duration = 220) {
        previewTouch.value = {
            ...previewTouch.value,
            pressing: true,
        }

        queuePreviewProgressStep(duration, () => {
            previewTouch.value = {
                ...previewTouch.value,
                pressing: false,
            }
        })
    }

    function clickSelector(selector: string) {
        const target = document.querySelector<HTMLElement>(selector)
        target?.click()
    }

    function touchAndClickSelector(selector: string, touchDelay: number, clickLeadMs: number, xFactor = 0.5, yFactor = 0.5) {
        queuePreviewProgressStep(touchDelay, () => {
            movePreviewTouch(selector, xFactor, yFactor)
        })

        queuePreviewProgressStep(touchDelay + clickLeadMs, () => {
            pressPreviewTouch()
        })

        queuePreviewProgressStep(touchDelay + clickLeadMs + 280, () => {
            clickSelector(selector)
        })
    }

    function swipePreviewOnSelector(
        selector: string,
        startDelay: number,
        fromXFactor: number,
        toXFactor: number,
        yFactor = 0.5,
        durationMs = 900,
        steps = 7
    ) {
        queuePreviewProgressStep(startDelay, () => {
            const target = document.querySelector<HTMLElement>(selector)
            if (!target) return

            const maxScrollLeft = Math.max(0, target.scrollWidth - target.clientWidth)
            if (maxScrollLeft > 0) {
                target.scrollLeft = maxScrollLeft
            }

            for (let step = 0; step <= steps; step++) {
                const progress = step / steps
                queuePreviewProgressStep(step * Math.floor(durationMs / steps), () => {
                    const liveTarget = document.querySelector<HTMLElement>(selector)
                    if (!liveTarget) return

                    const rect = liveTarget.getBoundingClientRect()
                    previewTouch.value = {
                        visible: true,
                        x: rect.left + rect.width * (fromXFactor + ((toXFactor - fromXFactor) * progress)),
                        y: rect.top + rect.height * yFactor,
                        pressing: step > 0 && step < steps,
                    }

                    if (maxScrollLeft > 0) {
                        liveTarget.scrollLeft = Math.max(0, maxScrollLeft * (1 - progress))
                    }
                })
            }
        })
    }

    function notifyPreviewProgressCompleted() {
        if (!isPhonePreviewProgressDemo.value) return

        window.parent?.postMessage(
            {
                type: 'landing-phone-demo-complete',
                demo: 'progress-tour',
                run: Number(route.query?.run ?? 0),
            },
            window.location.origin
        )
    }

    function startPreviewProgressTour() {
        if (!isPhonePreviewProgressDemo.value) return

        clearPreviewProgressTimers()
        activeTab.value = 'stats'
        previewTouch.value = { visible: false, x: 0, y: 0, pressing: false }

        queuePreviewProgressStep(500, () => {
            const plansSection = document.querySelector<HTMLElement>('.plans-section')
            plansSection?.scrollIntoView({ behavior: 'auto', block: 'start' })
        })

        swipePreviewOnSelector('.tabs__segmented', 1200, 0.26, 0.78, 0.5, 1100, 8)

        touchAndClickSelector('.tabs__tab:nth-child(3)', 2900, 780)

        queuePreviewProgressStep(4200, () => {
            activeTab.value = 'plans'
            const plansSection = document.querySelector<HTMLElement>('.plans-section')
            plansSection?.scrollIntoView({ behavior: 'auto', block: 'start' })
        })

        queuePreviewProgressStep(5800, () => {
            const firstPlanId =
                String(trainingPlansStore.items?.[0]?.id ?? '').trim()

            if (firstPlanId) {
                touchAndClickSelector('.plans-section .plan-item .open-btn', 0, 720)
                queuePreviewProgressStep(1100, () => {
                    void openPlanProgress(firstPlanId, 'list')
                })
                touchAndClickSelector('.popup-overlay.plan-progress-popup .progress-topbar .progress-btn:last-child', 3000, 980)
                queuePreviewProgressStep(5000, () => {
                    notifyPreviewProgressCompleted()
                })
            }
        })
    }

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

    const calculateBMI = () => {
        if (bmiWeight.value == null || bmiHeight.value == null) return

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
        saveToLocalStorage(LS_PROGRESS_BMI, {
            gender: bmiGender.value,
            weight: bmiWeight.value,
            height: bmiHeight.value,
            result: bmiResult.value,
        })
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
        withSilentToasts(calculateBMI)
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

    const calculateCalories = () => {
        if (calorieAge.value == null || calorieWeight.value == null || calorieHeight.value == null) return

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
        saveToLocalStorage(LS_PROGRESS_CALORIES, {
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
        withSilentToasts(calculateCalories)
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

    const calculateBurnRate = () => {
        // Safety-Guard
        if (
            burnStartWeight.value == null ||
            burnGoalWeight.value == null ||
            burnMaintenance.value == null ||
            burnIntake.value == null
        ) return

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
        saveToLocalStorage(LS_PROGRESS_BURN_RATE, {
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
        withSilentToasts(calculateBurnRate)
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

    const calculateProtein = () => {
        // Safety-Guard
        if (proteinWeight.value == null) return

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
        saveToLocalStorage(LS_PROGRESS_PROTEIN, {
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
        withSilentToasts(calculateProtein)
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

    const calculateOneRm = () => {
        // Safety-Guard
        if (oneRmWeight.value == null || oneRmReps.value == null) return

        const weightKg = unit.value === 'kg' ? Number(oneRmWeight.value) : Number(oneRmWeight.value) * KG_PER_LB;
        const reps = Number(oneRmReps.value);
        const oneRmKg = weightKg * (1 + reps / 30);
        oneRmResult.value = oneRmKg;

        addToast('1RM berechnet', 'default');
        saveToLocalStorage(LS_PROGRESS_ONE_RM, {
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
        withSilentToasts(calculateOneRm)
    })

    watch([oneRmWeight, oneRmReps, oneRmExercise], () => {
        if (autoCalcEnabled.value) debouncedCalc1RM()
    })

    // ===== Koffein Calculator ==========

    const cafWeight = ref<number | null>(null)
    const cafSensitivity = ref<'low' | 'normal' | 'high'>('normal')
    const cafStatus = ref<'none' | 'pregnant'>('none')
    const cafResult = ref<{ perDose: number; perDay: number } | null>(null)
    const cafLastDoseTime = ref<string>('')
    const cafSleepTime = ref<string>('')
    const showTimingExtras = ref<boolean>(false)

    const calculateCaffeine = () => {
        // Safety-Guard
        if (cafWeight.value == null) return

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

        saveToLocalStorage(LS_PROGRESS_CAFFEINE, {
            weight: cafWeight.value,
            sensitivity: cafSensitivity.value,
            status: cafStatus.value,
            result: cafResult.value,
            lastDoseTime: cafLastDoseTime.value,
            sleepTime: cafSleepTime.value,
            showTimingExtras: showTimingExtras.value,
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
        cafLastDoseTime.value = parsed.lastDoseTime ?? ''
        cafSleepTime.value = parsed.sleepTime ?? ''
        showTimingExtras.value = Boolean(parsed.showTimingExtras)
        cafWeight.value = parsed.weight
        cafSensitivity.value = parsed.sensitivity
        cafStatus.value = parsed.status
        cafResult.value = parsed.result
    }

    const debouncedCalcCaffeine = debounce(() => {
        withSilentToasts(calculateCaffeine)
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

    const calculateBodyFat = () => {
        // Safety-Guard
        if (bodyFatWaist.value == null || bodyFatNeck.value == null || bodyFatHeight.value == null) return
        if (bodyFatGender.value === 'female' && bodyFatHip.value == null) return

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
        saveToLocalStorage(LS_PROGRESS_BODY_FAT, {
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
        withSilentToasts(calculateBodyFat)
    })

    watch([bodyFatGender, bodyFatWaist, bodyFatNeck, bodyFatHip, bodyFatHeight], () => {
        if (autoCalcEnabled.value) debouncedCalcBodyFat()
    })

    // ========== FFMI Calculator ==========

    const ffmiWeight = ref<number | null>(null);
    const ffmiHeight = ref<number | null>(null);
    const ffmiBodyFat = ref<number | null>(null);
    const ffmiResult = ref<{ value: number; category: string } | null>(null);

    const calculateFFMI = () => {
        // Safety-Guard
        if (ffmiWeight.value == null || ffmiHeight.value == null || ffmiBodyFat.value == null) return

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
        saveToLocalStorage(LS_PROGRESS_FFMI, {
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
        withSilentToasts(calculateFFMI)
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

    const calculateGlyLoad = () => {
        // Safety-Guard
        if (glServing.value == null || glCarbs100.value == null || glGi.value == null) return

        const serving = Number(glServing.value)
        const carbs100 = Number(glCarbs100.value)
        const gi = Number(glGi.value)

        const carbsPerServing = (carbs100 * serving) / 100
        const gl = (gi / 100) * carbsPerServing

        glResult.value = gl
        addToast('Glykämische Last berechnet', 'default')

        saveToLocalStorage(LS_PROGRESS_GLYLOAD, {
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

        glResult.value = parsed.result != null ? Number(parsed.result) : null

    }

    const debouncedCalcGlyLoad = debounce(() => {
        withSilentToasts(calculateGlyLoad)
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

    const calculateWater = () => {
        // Safety-Guard
        if (waterWeight.value == null) return

        const weightKg = unit.value === 'kg' ? Number(waterWeight.value) : Number(waterWeight.value) * KG_PER_LB;

        let baseWater = weightKg * 0.035;
        if (waterActivity.value === 'moderate') baseWater += 0.5;
        else if (waterActivity.value === 'high') baseWater += 1.0;
        if (waterClimate.value === 'hot') baseWater += 0.5;
        if (waterClimate.value === 'very_hot') baseWater += 1.0;
        waterResult.value = Math.max(1.5, baseWater);
        addToast('Wasserbedarf berechnet', 'default');
        saveToLocalStorage(LS_PROGRESS_WATER, {
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
        withSilentToasts(calculateWater)
    })

    watch([waterWeight, waterActivity, waterClimate], () => {
        if (autoCalcEnabled.value) debouncedCalcWater()
    })

    // ======== Pläne-Tab: State =======

    type ViewPlan = {
        id: string
        name: string
        isFavorite: boolean
        exercises: string[]
    }

    const toViewPlan = (dto: any): ViewPlan => ({
        id: dto.id,
        name: dto.name,
        isFavorite: !!dto.isFavorite,
        exercises: Array.isArray(dto.days)
            ? dto.days.flatMap((d: any) =>
                Array.isArray(d.exercises)
                    ? d.exercises.map((x: any) => String(x.name ?? x.exercise ?? '').trim()).filter(Boolean)
                    : []
            )
            : [],
    })

    const localPlans = ref<ViewPlan[]>([])

    const trainingPlans = computed<ViewPlan[]>(() => {
        const api = trainingPlansStore.items.map(toViewPlan)
        return api.length ? api : localPlans.value
    })

    const favoritePlans = computed(() =>
        trainingPlans.value.filter(p => p.isFavorite)
    )

    const otherPlans = computed(() =>
        trainingPlans.value.filter(p => !p.isFavorite)
    )

    // ======= Pläne-Tab: Aktionen =======

    const isGuid = (v: string) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v)

    const openPlanProgress = async (planId: string, initialView: 'list' | 'calendar' | 'stats' = 'list') => {
        currentPlanId.value = planId
        lastPlanId.value = planId
        planProgressInitialView.value = initialView

        // Legacy/Local IDs blocken (keine Ghost-Pläne)
        if (!isGuid(planId)) {
            showToast({ message: "Dieser Plan ist lokal/alt und hat keinen Online-Fortschritt.", type: "default" })
            return
        }

        try {
            await trainingPlansStore.loadOne(planId)
        } catch { }

        await progressStore.load(planId, true)

        const state = progressStore.byPlan[planId]
        if (state?.error) {
            showToast({ message: `Fortschritt konnte nicht geladen werden: ${state.error}`, type: "default" })
            return
        }

        syncWorkoutsFromStore(planId)

        showPlanProgressPopup.value = true
    }

    const openTrainingStatsDetails = async () => {
        const current = currentPlanId.value
        const last = lastPlanId.value
        const fromLatestWorkout = [...workouts.value]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map(w => w.planId)
            .find(id => !!id && isGuid(id))
        const firstApiPlan = trainingPlansStore.items.find((p: TrainingPlanDto) => isGuid(p.id))?.id ?? null
        const planId = current ?? last ?? fromLatestWorkout ?? firstApiPlan

        if (!planId) {
            showToast({ message: 'Kein passender Trainingsplan für Details gefunden.', type: 'default' })
            return
        }

        await openPlanProgress(planId, 'stats')
    }


    const matchesPlanSearch = (name: string) => {
        if (!planSearchQuery.value) return true;
        return name.toLowerCase().includes(planSearchQuery.value.toLowerCase());
    };

    // === Pläne-Tab: Initiales Laden aus localStorage ===

    onMounted(async () => {
        try {
            await trainingPlansStore.loadList()
        } catch {
            showToast({ message: "Pläne konnten nicht geladen werden.", type: "default" })
        }

        await loadAllProgressForPlans()

        jumpToCalculatorsFromRoute()
        await maybeOpenPlanProgressFromRoute()
        startPreviewProgressTour()
    })

    watch(
        () => [route.query.tab, route.query.focus, route.query.openPlanProgress, route.query.planId],
        async () => {
            jumpToCalculatorsFromRoute()
            await maybeOpenPlanProgressFromRoute()
            startPreviewProgressTour()
        }
    )

    watch(
        () => trainingPlansStore.items.length,
        () => {
            startPreviewProgressTour()
        }
    )

    onUnmounted(() => {
        clearPreviewProgressTimers()
    })

    //ProgressEntryModal

    const showProgressPopup = ref(false);

    const progressEntryModalRef = ref<ProgressEntryModalExposed | null>(null)
    const planProgressPopupRef = ref<PlanProgressPopupExposed | null>(null)

    const newProgressWeight = ref<number | null>(null)
    const showWeightHistoryCalendarPopup = ref(false)

    const showTrainingCompletePrompt = ref(false)
    const showTrainingFeedback = ref(false)
    const showPainFeedback = ref(false)
    const showPainZeroConfirm = ref(false)
    const painZeroCandidates = ref<ComplaintEntry[]>([])
    const pendingCompletion = ref<{ planId: string; day: string; planned: boolean; calendarMarked?: boolean } | null>(null)
    const pendingFeedbackPlanId = ref<string | null>(null)
    const trainingFeedbackReviewMode = ref(false)
    const trainingFeedbackInitialData = ref<TrainingSessionFeedbackPayload | null>(null)
    const activeTrainingFeedbackSessionId = ref<string | null>(null)
    const completionPrompted = ref<Record<string, true>>({})
    const pendingPromptCheck = ref<{ planId: string; dateIso: string } | null>(null)
    const trainingFeedbackByPlanDay = ref<Record<string, TrainingSessionFeedbackPayload>>({})
    const trainingFeedbackSessionsByPlanDay = ref<Record<string, TrainingSessionFeedbackRecord>>({})


    const editingEntry = ref<Workout | null>(null)
    const progressContinuationByPlan = ref<Record<string, ProgressContinuationDraft>>({})

    const progressContinuationForCurrentPlan = computed<ProgressContinuationDraft | null>(() => {
        const planId = effectivePlanId.value
        if (!planId) return null
        return progressContinuationByPlan.value[planId] ?? null
    })

    const progressContinuationPrefillExercise = computed<string | null>(() =>
        progressContinuationForCurrentPlan.value?.exercise ?? null
    )

    const progressContinuationPrefillSetValues = computed<Record<number, { weight?: number | null; reps?: number | null }> | undefined>(() =>
        progressContinuationForCurrentPlan.value?.valuesBySet
    )

    const progressContinuationActiveSetNumber = computed<number | null>(() =>
        progressContinuationForCurrentPlan.value?.lastCompletedSetNo ?? null
    )

    const progressContinuationLockSetsBefore = computed<number>(() =>
        Math.max(0, progressContinuationForCurrentPlan.value?.lastCompletedSetNo ?? 0)
    )

    const todayTrackedSetValuesByExercise = computed<Record<string, Record<number, { weight?: number | null; reps?: number | null }>>>(() => {
        const planId = effectivePlanId.value
        if (!planId) return {}
        const today = new Date().toISOString().slice(0, 10)

        const entries = workouts.value
            .filter(w => w.planId === planId && (w.date || '').slice(0, 10) === today)
            .filter(w => (w.type ?? 'kraft') !== 'ausdauer')
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

        const out: Record<string, Record<number, { weight?: number | null; reps?: number | null }>> = {}

        for (const w of entries) {
            const key = String(w.exercise ?? '').trim().toLowerCase()
            if (!key) continue

            const target = out[key] ?? {}
            let nextSetNo = Math.max(0, ...Object.keys(target).map(k => Math.floor(Number(k)) || 0)) + 1

            const details = Array.isArray(w.setDetails) && w.setDetails.length
                ? w.setDetails
                : Array.from({ length: Math.max(0, Number(w.sets ?? 0) || 0) }, () => ({
                    weight: w.weight ?? null,
                    reps: w.reps ?? null,
                }))

            for (const s of details) {
                const weightDisplay = s?.weight != null ? kgToDisplay(Number(s.weight)) : null
                target[nextSetNo] = {
                    weight: Number.isFinite(Number(weightDisplay)) ? Number(weightDisplay) : null,
                    reps: s?.reps ?? null,
                }
                nextSetNo++
            }

            out[key] = target
        }

        return out
    })

    const todayTrackedLockedSetsByExercise = computed<Record<string, number>>(() => {
        const out: Record<string, number> = {}
        for (const [key, valuesBySet] of Object.entries(todayTrackedSetValuesByExercise.value)) {
            out[key] = Math.max(0, ...Object.keys(valuesBySet).map(k => Math.floor(Number(k)) || 0))
        }
        return out
    })

    const upsertProgressContinuationDraft = (
        planId: string,
        exercise: string,
        valuesBySet?: Record<number, { weight?: number | null; reps?: number | null }>
    ) => {
        const ex = String(exercise ?? '').trim()
        if (!planId || !ex) return

        const src = valuesBySet ?? {}
        const nextValues: Record<number, { weight?: number | null; reps?: number | null }> = {}
        let lastCompletedSetNo = 0

        for (const [k, v] of Object.entries(src)) {
            const setNo = Math.floor(Number(k))
            if (!Number.isFinite(setNo) || setNo <= 0) continue
            nextValues[setNo] = {
                weight: v?.weight ?? null,
                reps: v?.reps ?? null,
            }
            if ((v?.weight != null) || (v?.reps != null)) {
                lastCompletedSetNo = Math.max(lastCompletedSetNo, setNo)
            }
        }

        if (lastCompletedSetNo <= 0) {
            lastCompletedSetNo = Math.max(0, ...Object.keys(nextValues).map(k => Math.floor(Number(k)) || 0))
        }

        progressContinuationByPlan.value = {
            ...progressContinuationByPlan.value,
            [planId]: {
                exercise: ex,
                valuesBySet: nextValues,
                lastCompletedSetNo,
            },
        }
    }

    const clearProgressContinuationDraft = (planId: string) => {
        if (!planId) return
        const next = { ...progressContinuationByPlan.value }
        delete next[planId]
        progressContinuationByPlan.value = next
    }

    const getProgressForPlan = (planId: string): Workout[] => {
        return workouts.value.filter((w: Workout) => w.planId === planId)
    }

    const getExercisesForPlan = (planId: string | null): PlanExercise[] => {
        if (!planId) return []
        const fromStore = trainingPlansStore.items
            .find((p: TrainingPlanDto) => p.id === planId)?.days
            ?.flatMap((d: TrainingDay) => d.exercises ?? [])
            .map((ex: TrainingExercise) => ({
                exercise: String(ex.name ?? '').trim(),
                sets: Number(ex.sets ?? 0) || 0,
                reps: Number(ex.reps ?? 0) || 0,
            }))
            .filter((e: PlanExercise) => e.exercise.length > 0) ?? []

        if (fromStore.length) {
            const map = new Map<string, PlanExercise>()
            for (const ex of fromStore) {
                if (!map.has(ex.exercise)) map.set(ex.exercise, ex)
            }
            return [...map.values()]
        }

        const names = trainingPlans.value.find(p => p.id === planId)?.exercises ?? []
        return names.map(n => ({ exercise: n, sets: 0, reps: 0 }))
    }
    const visibleDays = ref<number>(14)

    const entriesByDay = computed<Map<string, Workout[]>>(() => {
        const map = new Map<string, Workout[]>()
        const planId = currentPlanId.value
        if (!planId) return map

        for (const w of getProgressForPlan(planId)) {
            const day = (w.date || '').slice(0, 10)
            if (!map.has(day)) map.set(day, [])
            map.get(day)!.push(w)
        }

        // optional: innerhalb Tag sortieren (neu -> alt)
        for (const [day, arr] of map.entries()) {
            map.set(
                day,
                [...arr].sort((a: Workout, b: Workout) => new Date(b.date).getTime() - new Date(a.date).getTime()),
            )
        }

        return map
    })

    const cancelProgressEdit = () => {
        editingEntry.value = null
        validationErrorMessages.value = []
        showProgressPopup.value = false
    }

    const detectedInputType = computed<WorkoutType>(() => {
        return (editingEntry.value?.type ?? 'kraft') as WorkoutType
    })

    const cleanupProgressIO = () => {
        // no-op (damit TS ruhig ist)
    }

    // Abbrechen
    const onProgressModalCancel = () => {
        validationErrorMessages.value = []
        showProgressPopup.value = false
        // dein PlanProgressPopup Watcher kann bleiben (oder später über @closed lösen)
    }

    const onProgressModalDelete = (payload: { planId: string; id?: string; date?: string }) => {
        const planId = payload.planId
        let id = payload.id

        if (!id && payload.date) {
            const day = (payload.date || '').slice(0, 10)
            const hit = workouts.value
                .filter(w => w.planId === planId && (w.date || '').slice(0, 10) === day)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
            id = hit?.id
        }

        if (!id) {
            showToast({ message: "Fehler: Eintrag-ID fehlt (Delete nicht möglich).", type: "default" })
            return
        }

        deleteProgressEntry(planId, id)
        showProgressPopup.value = false
    }

    const toApiWorkoutType = (t: WorkoutType) => {
        switch (t) {
            case 'kraft': return 'Kraft'
            case 'ausdauer': return 'Ausdauer'
            case 'dehnung': return 'Dehnung'
            case 'calisthenics': return 'Calisthenics'
            default: return 'Kraft'
        }
    }

    const fromApiWorkoutType = (t: any): WorkoutType => {
        return normalizeWorkoutType(t)
    }

    const syncWorkoutsFromStore = (planId: string) => {
        const items = progressStore.byPlan?.[planId]?.items ?? []

        // alles für den Plan raus, dann frisch rein (keine Doppelten)
        workouts.value = workouts.value.filter(w => w.planId !== planId)

        for (const it of items) {
            const rawEntry = it as any
            const normalizedType = normalizeWorkoutType(it.type, it.exercise, {
                durationMin: it.durationMin ?? undefined,
                distanceKm: it.distanceKm ?? undefined,
                avgHr: rawEntry.avgHr ?? undefined,
                pace: rawEntry.pace ?? undefined,
                hrZone: rawEntry.hrZone ?? undefined,
                painFree: rawEntry.painFree ?? undefined,
                side: rawEntry.side ?? undefined,
                equipment: rawEntry.equipment ?? undefined,
                setDetails: Array.isArray(rawEntry.setDetails) ? rawEntry.setDetails : undefined,
            })
            workouts.value.push({
                id: it.id,
                planId: it.planId,
                date: typeof it.date === 'string' ? it.date : new Date(it.date as any).toISOString(),
                exercise: it.exercise,
                type: normalizedType,

                sets: it.sets ?? 0,
                reps: it.reps ?? 0,
                weight: it.weightKg ?? 0,

                durationMin: it.durationMin ?? undefined,
                distanceKm: it.distanceKm ?? undefined,

                note: it.note ?? undefined,
                tempo: it.tempo ?? undefined,
                restSeconds: it.restSeconds ?? undefined,
                setDetails: Array.isArray((it as any).setDetails) ? (it as any).setDetails : undefined,
            } as any)
        }
    }

    const toLocalWorkoutFromModal = (workout: Workout): Workout => ({
        ...(workout as any),
        id: (workout as any).id ?? `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        planId: workout.planId ?? null,
        date: typeof workout.date === 'string' ? workout.date : new Date().toISOString(),
        type: (workout.type ?? 'kraft') as any,
        setDetails: Array.isArray((workout as any).setDetails)
            ? (workout as any).setDetails.map((s: any) => ({
                weight: s.weight ?? null,
                reps: s.reps ?? null,
                durationSec: s.durationSec ?? null,
                label: (s.label ?? '').trim() || null,
            }))
            : undefined,
    } as any)

    const upsertLocalWorkoutDraft = (planId: string, workout: Workout, mode: 'create' | 'edit') => {
        const next = toLocalWorkoutFromModal(workout)
        if (mode === 'edit' && (workout as any).id) {
            const id = String((workout as any).id)
            const idx = workouts.value.findIndex(w => w.planId === planId && String((w as any).id ?? '') === id)
            if (idx >= 0) {
                workouts.value.splice(idx, 1, next as any)
                return
            }
        }
        workouts.value.push(next as any)
    }

    async function loadAllProgressForPlans() {
        if (!auth.user) return

        const planIds = trainingPlansStore.items
            .map((p: TrainingPlanDto) => p.id)
            .filter((id: string) => isGuid(id))

        if (!planIds.length) {
            workouts.value = []
            return
        }

        await Promise.all(planIds.map((id: string) => progressStore.load(id, true)))

        workouts.value = []
        planIds.forEach((id: string) => syncWorkoutsFromStore(id))

        if (activeTab.value === 'stats') {
            await nextTick()
            updateWorkoutChart()
        }
    }

    // Save aus Modal: Modal liefert fertigen Workout-Payload + optional BodyWeightKg
    const onProgressModalSave = async (payload: {
        workout: Workout
        updatedBodyWeightKg?: number | null
        mode: 'create' | 'edit'
        editingDate?: string | null
        draft?: {
            valuesBySet?: Record<number, { weight?: number | null; reps?: number | null }>
        }
    }) => {

        validationErrorMessages.value = []
        const { workout, updatedBodyWeightKg, mode, editingDate, draft } = payload
        if (updatedBodyWeightKg != null) {
            const today = new Date().toISOString().split('T')[0]

            try {
                // ✅ 1) Backend speichern (du MUSST eine dieser Actions im weightStore haben)
                // Ich nehme absichtlich einen klaren Namen -> du passt ggf. 1 Zeile an:
                await weightStore.upsertEntry({ date: today, weightKg: updatedBodyWeightKg })

                // ✅ 2) Danach sauber neu laden (damit UI exakt Backend zeigt)
                await Promise.all([
                    weightStore.loadEntries(true),
                    weightStore.loadSummary(true),
                ])

                weightHistory.value = (weightStore.entries ?? []).map((x: any) => ({
                    date: x.date,
                    weight: x.weight,
                }))

                goal.value = weightStore.goalKg

                await nextTick()
                updateWeightChart()

            } catch (e) {
                console.error(e)
                showToast({ message: "Körpergewicht konnte nicht gespeichert werden.", type: "default" })
            }
        }
        const planId = workout.planId
        if (!planId) return

        const prHits = detectPersonalRecordHits(
            getProgressForPlan(planId),
            workout,
            { excludeEntryId: mode === "edit" ? workout.id ?? null : null }
        )

        // Sofort lokal aktualisieren: verhindert, dass Same-Day-Prefill erst nach Reload/Refresh sichtbar wird.
        upsertLocalWorkoutDraft(planId, workout, mode)
        upsertProgressContinuationDraft(planId, workout.exercise, draft?.valuesBySet)

        if (mode === "edit") {
            const id = workout.id
            if (!id) {
                addToast("Fehler: Eintrag-ID fehlt (Backend braucht id).", "default")
                return
            }

            const payload: UpdateProgressEntry = {
                date: workout.date,
                exercise: workout.exercise,
                type: toApiWorkoutType(workout.type as WorkoutType) as any,

                sets: workout.sets ?? null,
                reps: workout.reps ?? null,
                weightKg: workout.weight ?? null,

                durationMin: workout.durationMin ?? null,
                distanceKm: workout.distanceKm ?? null,

                note: workout.note ?? null,
                tempo: workout.tempo ?? null,
                restSeconds: workout.restSeconds ?? null,
                setDetails: Array.isArray(workout.setDetails)
                    ? workout.setDetails.map(s => ({
                        weight: s.weight ?? null,
                        reps: s.reps ?? null,
                        durationSec: s.durationSec ?? null,
                        label: (s.label ?? '').trim() || null,
                    }))
                    : null,
            }

            let updated
            try {
                updated = await progressStore.edit(planId, id, payload)
            } catch (e: any) {
                showToast({ message: e?.message ?? "Speichern fehlgeschlagen.", type: "default" })
                return
            }

            await progressStore.load(planId, true)
            syncWorkoutsFromStore(planId)

            if (!showPersonalRecordToast(workout.exercise, prHits)) {
                showToast({ message: "Fortschritt aktualisiert!", type: "success", emoji: "✅" })
            }

        } else {
            const payload: CreateProgressEntry = {
                planId,
                date: workout.date,
                exercise: workout.exercise,
                type: toApiWorkoutType(workout.type as WorkoutType) as any,

                sets: workout.sets ?? null,
                reps: workout.reps ?? null,
                weightKg: workout.weight ?? null,

                durationMin: workout.durationMin ?? null,
                distanceKm: workout.distanceKm ?? null,

                note: workout.note ?? null,
                tempo: workout.tempo ?? null,
                restSeconds: workout.restSeconds ?? null,
                setDetails: Array.isArray(workout.setDetails)
                    ? workout.setDetails.map(s => ({
                        weight: s.weight ?? null,
                        reps: s.reps ?? null,
                        durationSec: s.durationSec ?? null,
                        label: (s.label ?? '').trim() || null,
                    }))
                    : null,
            }

            let created
            try {
                created = await progressStore.add(planId, payload)
            } catch (e: any) {
                showToast({ message: e?.message ?? "Speichern fehlgeschlagen.", type: "default" })
                return
            }

            await progressStore.load(planId, true)
            syncWorkoutsFromStore(planId)

            if (!showPersonalRecordToast(workout.exercise, prHits)) {
                showToast({ message: "Fortschritt gespeichert!", type: "success", emoji: "✅" })
            }
        }

        const completionCheck = {
            planId,
            dateIso: workout.date ?? editingDate ?? new Date().toISOString(),
        }
        pendingPromptCheck.value = completionCheck

        showProgressPopup.value = false

        // Fallback: Prompt auch dann prüfen, wenn das PlanProgressPopup in diesem Flow nicht geöffnet wird.
        await nextTick()
        await maybePromptTrainingComplete(completionCheck.planId, completionCheck.dateIso)
    }
    //Validation ProgressModalEntry

    const closeTrainingCompletePrompt = () => {
        showTrainingCompletePrompt.value = false
        pendingCompletion.value = null
        pendingFeedbackPlanId.value = null
        resetTrainingFeedbackPopupState()
    }

    const confirmTrainingComplete = async () => {
        const pending = pendingCompletion.value
        if (!pending) {
            showTrainingCompletePrompt.value = false
            return
        }

        if (pending.planned && !pending.calendarMarked) {
            try {
                await markPlannerCompleted(pending.planId, pending.day)
                pendingCompletion.value = { ...pending, calendarMarked: true }
            } catch { }
        }

        pendingFeedbackPlanId.value = pending.planId
        resetTrainingFeedbackPopupState()
        showTrainingCompletePrompt.value = false
        showTrainingFeedback.value = true
    }

    const getSessionStartFromEntries = (planId: string, day: string) => {
        const entries = getProgressForPlan(planId)
            .filter(w => (w.date || '').slice(0, 10) === day)
            .map(w => new Date(w.date).getTime())
            .filter(t => Number.isFinite(t))

        if (!entries.length) return null
        const min = Math.min(...entries)
        return Number.isFinite(min) ? new Date(min).toISOString() : null
    }

    const buildTrainingSessionPayload = (planId: string, day: string, feedback: {
        intensity?: number | null
        bestExercise?: string | null
        strengthTechnique?: number | null
        cardioIntensity?: number | null
        stretchPain?: number | null
        note?: string | null
    } | null): CreateTrainingSessionPayload => {
        const planNames = getPlanExerciseNames(planId)
        const loggedNames = getLoggedExerciseNamesForDay(planId, day)
        const typesPresent = Array.from(new Set((feedbackExercisesForPlan.value ?? [])
            .map((e: { type?: string | null }) => e.type ?? 'kraft'))) as string[]

        const startedAtUtc = getSessionStartFromEntries(planId, day)
        const finishedAtUtc = new Date().toISOString()
        const durationSec = startedAtUtc
            ? Math.max(0, Math.round((new Date(finishedAtUtc).getTime() - new Date(startedAtUtc).getTime()) / 1000))
            : null

        return {
            planId,
            startedAtUtc,
            finishedAtUtc,
            durationSec,
            exercisesTotal: planNames.length || null,
            exercisesDone: loggedNames.length || null,
            typesPresent,
            feedback,
        }
    }

    const onTrainingFeedbackSubmit = async (payload: {
        intensity: number | null
        bestExercise: string | null
        strengthTechnique: number | null
        cardioIntensity: number | null
        stretchPain: number | null
        note: string
    }) => {
        const pending = pendingCompletion.value
        if (!pending) {
            showTrainingFeedback.value = false
            resetTrainingFeedbackPopupState()
            return
        }

        const normalizedFeedback: TrainingSessionFeedbackPayload = {
            intensity: payload.intensity,
            bestExercise: payload.bestExercise,
            strengthTechnique: payload.strengthTechnique,
            cardioIntensity: payload.cardioIntensity,
            stretchPain: payload.stretchPain,
            note: payload.note?.trim() ?? '',
        }

        if (auth.user) {
            try {
                if (activeTrainingFeedbackSessionId.value) {
                    const updated = await upsertTrainingSessionFeedback(activeTrainingFeedbackSessionId.value, normalizedFeedback)
                    setBackendFeedbackRecord(updated)
                } else {
                    const dto = buildTrainingSessionPayload(pending.planId, pending.day, payload)
                    const created = await createTrainingSession(dto)
                    if (created?.sessionId) {
                        activeTrainingFeedbackSessionId.value = created.sessionId
                        // Nach Create direkt Sessions neu laden, damit FinishedAtUtc/FeedbackId sicher vorhanden sind.
                        await loadTrainingFeedbackFromBackendForPlan(pending.planId)
                    }
                }
            } catch {
                showToast({ message: "Feedback konnte nicht gespeichert werden.", type: "default" })
            }
        } else {
            setTrainingFeedbackCacheEntry(pending.planId, pending.day, normalizedFeedback)
        }

        if (pending.planned && !pending.calendarMarked) {
            try { await markPlannerCompleted(pending.planId, pending.day) } catch { }
        }

        showTrainingFeedback.value = false
        pendingCompletion.value = null
        pendingFeedbackPlanId.value = null
        resetTrainingFeedbackPopupState()
        await maybeAskPainFeedbackAfterTraining()
    }

    const onTrainingFeedbackSkip = async () => {
        const pending = pendingCompletion.value
        if (!pending) {
            showTrainingFeedback.value = false
            resetTrainingFeedbackPopupState()
            return
        }

        // In "Feedback ansehen"/Bearbeiten-Modus bedeutet "Skip" nicht "Session ohne Feedback speichern".
        if (trainingFeedbackReviewMode.value) {
            showTrainingFeedback.value = false
            pendingCompletion.value = null
            pendingFeedbackPlanId.value = null
            resetTrainingFeedbackPopupState()
            return
        }

        if (auth.user) {
            try {
                const dto = buildTrainingSessionPayload(pending.planId, pending.day, null)
                await createTrainingSession(dto)
                await loadTrainingFeedbackFromBackendForPlan(pending.planId)
            } catch {
                showToast({ message: "Training-Session konnte nicht gespeichert werden.", type: "default" })
            }
        }

        if (pending.planned && !pending.calendarMarked) {
            try { await markPlannerCompleted(pending.planId, pending.day) } catch { }
        }

        showTrainingFeedback.value = false
        pendingCompletion.value = null
        pendingFeedbackPlanId.value = null
        resetTrainingFeedbackPopupState()
        await maybeAskPainFeedbackAfterTraining()
    }

    const openComplaintsForPainFeedback = () =>
        complaintsStore.entries.filter((entry) => entry.status !== 'weg')

    const maybeAskPainFeedbackAfterTraining = async () => {
        try {
            await complaintsStore.load()
        } catch {
            // ignore
        }
        if (!openComplaintsForPainFeedback().length) {
            showPainFeedback.value = false
            return
        }
        showPainFeedback.value = true
    }

    const onPainFeedbackSave = async (payload: { painLevel: number; note: string }) => {
        const openComplaints = openComplaintsForPainFeedback()
        appendPainDiaryEntry({
            source: 'plan-progress',
            painLevel: payload.painLevel,
            note: payload.note,
            activeComplaints: openComplaints,
        })

        const signals = evaluatePainDiarySignals({
            currentPainLevel: payload.painLevel,
            complaintIds: openComplaints.map((item) => item.id),
        })

        if (signals.improvedVsPrevious) {
            const toBetter = openComplaints.filter((item) => item.status === 'aktiv')
            for (const complaint of toBetter) {
                try {
                    await complaintsStore.updateStatus(complaint.id, 'besser')
                } catch {
                    // ignore and continue
                }
            }
        }

        painZeroCandidates.value = openComplaints.filter((item) => signals.zeroStreakComplaintIds.includes(item.id))
        showPainFeedback.value = false
        showPainZeroConfirm.value = painZeroCandidates.value.length > 0
    }

    const onPainFeedbackSkip = () => {
        showPainFeedback.value = false
    }

    const onPainZeroKeep = () => {
        showPainZeroConfirm.value = false
        painZeroCandidates.value = []
    }

    const onPainZeroConfirmGone = async () => {
        const list = [...painZeroCandidates.value]
        for (const complaint of list) {
            try {
                await complaintsStore.updateStatus(complaint.id, 'weg')
            } catch {
                // ignore and continue
            }
        }
        showPainZeroConfirm.value = false
        painZeroCandidates.value = []
    }

    const maybePromptTrainingComplete = async (planId: string, dateIso: string) => {
        const day = (dateIso || '').slice(0, 10)
        if (!day) return

        const localToday = todayKey()
        const utcToday = new Date().toISOString().slice(0, 10)
        if (day !== localToday && day !== utcToday) return

        if (!getPlanExerciseNames(planId).length && auth.user) {
            try { await trainingPlansStore.loadOne(planId) } catch { }
        }

        if (!isPlanCompleteForDay(planId, day)) return
        if (auth.user) {
            await loadTrainingFeedbackFromBackendForPlan(planId)
            const rec = getBackendFeedbackRecordForDay(planId, day)
            if (rec?.feedbackId) return
        } else {
            if (getTrainingFeedbackCacheEntry(planId, day)) return
        }

        const key = `${planId}|${day}`
        if (completionPrompted.value[key]) return

        const status = await getPlannerStatusForDay(planId, day)
        if (status.completed) return

        completionPrompted.value = { ...completionPrompted.value, [key]: true }
        pendingCompletion.value = { planId, day, planned: status.planned }
        pendingFeedbackPlanId.value = planId
        showTrainingCompletePrompt.value = true
    }

    // Progress.vue — INSERT (above "// ===== Utility: Zahlen, Debounce ...")

    // --- LocalStorage Guards / Helper ---
    const canUseLocalStorage = () => {
        try {
            return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
        } catch {
            return false
        }
    }

    const saveToLocalStorage = (key: string, value: any) => {
        if (!canUseLocalStorage()) return
        try {
            localStorage.setItem(key, JSON.stringify(value))
        } catch { }
    }

    const LS_TRAINING_FEEDBACK_CACHE = 'gym3000.trainingFeedbackByPlanDay.v1'

    const feedbackPlanDayKey = (planId: string, day: string) => `${String(planId)}|${String(day)}`

    const loadTrainingFeedbackCache = () => {
        if (!canUseLocalStorage()) return
        try {
            const raw = localStorage.getItem(LS_TRAINING_FEEDBACK_CACHE)
            const parsed = raw ? JSON.parse(raw) : {}
            trainingFeedbackByPlanDay.value = (parsed && typeof parsed === 'object') ? parsed : {}
        } catch {
            trainingFeedbackByPlanDay.value = {}
        }
    }

    const persistTrainingFeedbackCache = () => {
        saveToLocalStorage(LS_TRAINING_FEEDBACK_CACHE, trainingFeedbackByPlanDay.value)
    }

    const setTrainingFeedbackCacheEntry = (planId: string, day: string, feedback: TrainingSessionFeedbackPayload | null) => {
        const key = feedbackPlanDayKey(planId, day)
        const next = { ...trainingFeedbackByPlanDay.value }
        if (feedback) next[key] = feedback
        else delete next[key]
        trainingFeedbackByPlanDay.value = next
        persistTrainingFeedbackCache()
    }

    const getTrainingFeedbackCacheEntry = (planId: string, day: string) =>
        trainingFeedbackByPlanDay.value[feedbackPlanDayKey(planId, day)] ?? null

    const feedbackPayloadFromRecord = (rec: TrainingSessionFeedbackRecord): TrainingSessionFeedbackPayload | null => {
        if (!rec) return null
        if (!rec.feedbackId) return null
        return {
            intensity: rec.intensity ?? null,
            bestExercise: rec.bestExercise ?? null,
            strengthTechnique: rec.strengthTechnique ?? null,
            cardioIntensity: rec.cardioIntensity ?? null,
            stretchPain: rec.stretchPain ?? null,
            note: rec.note ?? null,
        }
    }

    const setBackendFeedbackRecord = (rec: TrainingSessionFeedbackRecord) => {
        const day = toPlannerDayKey(rec.finishedAtUtc)
        if (!day) return
        const key = feedbackPlanDayKey(rec.planId, day)
        const current = trainingFeedbackSessionsByPlanDay.value[key]
        if (!current) {
            trainingFeedbackSessionsByPlanDay.value = { ...trainingFeedbackSessionsByPlanDay.value, [key]: rec }
            return
        }
        const currentTs = new Date(current.finishedAtUtc || 0).getTime()
        const nextTs = new Date(rec.finishedAtUtc || 0).getTime()
        if (!Number.isFinite(currentTs) || nextTs >= currentTs) {
            trainingFeedbackSessionsByPlanDay.value = { ...trainingFeedbackSessionsByPlanDay.value, [key]: rec }
        }
    }

    const loadTrainingFeedbackFromBackendForPlan = async (planId: string) => {
        if (!auth.user || !planId) return
        try {
            const rows = await listTrainingSessions({ planId })
            const next = { ...trainingFeedbackSessionsByPlanDay.value }
            for (const row of rows ?? []) {
                const day = toPlannerDayKey(row.finishedAtUtc)
                if (!day) continue
                const key = feedbackPlanDayKey(planId, day)
                const prev = next[key]
                if (!prev || new Date(row.finishedAtUtc).getTime() >= new Date(prev.finishedAtUtc).getTime()) {
                    next[key] = row
                }
            }
            trainingFeedbackSessionsByPlanDay.value = next
        } catch { }
    }

    const getBackendFeedbackRecordForDay = (planId: string, day: string) =>
        trainingFeedbackSessionsByPlanDay.value[feedbackPlanDayKey(planId, day)] ?? null

    onMounted(() => {
        loadTrainingFeedbackCache()
    })

    // --- Missing popup refs (were referenced but not defined) ---
    const showWeightPopup = ref(false)
    const showGoalPopup = ref(false)

    // used in watcher below (newProgressWeight -> newWeight)
    const newWeight = ref<number | null>(null)

    // Minimal close/save handlers to satisfy TS (and avoid crashes)
    const closeWeightPopup = () => { showWeightPopup.value = false }
    const closeGoalPopup = () => { showGoalPopup.value = false }

    const saveWeight = () => {
        // If you later re-add the popup, wire it here.
        showWeightPopup.value = false
    }

    const saveGoal = () => {
        // If you later re-add the popup, wire it here.
        showGoalPopup.value = false
    }

    const openWeightHistoryCalendarPopup = () => {
        if (!weightHistory.value?.length) return
        showWeightHistoryCalendarPopup.value = true
    }

    const closeWeightHistoryCalendarPopup = () => {
        showWeightHistoryCalendarPopup.value = false
    }

    // --- latest recorded weight display (used by ProgressEntryModal + openCreate default) ---
    const latestRecordedWeightDisplay = computed<string | null>(() => {
        // bevorzugt: aktuellster Eintrag aus weightHistory
        const kg =
            (weightHistory.value?.length ? weightHistory.value[0].weight : null)
            ?? (weightStore as any)?.latestKg
            ?? null

        return kg == null ? null : formatWeight(kg, 1)
    })

    const clearValidation = () => {
        validationErrorMessages.value = []
    }

    //Core-Flow fürs Modal

    const openProgressPopup = async (planId: string) => {
        validationErrorMessages.value = []
        currentPlanId.value = planId
        lastPlanId.value = planId

        showProgressPopup.value = true
        await nextTick()

        progressEntryModalRef.value?.openCreate({
            planId,
            defaultBodyWeightDisplay: latestRecordedWeightValue.value,
        })
    }

    const editProgressEntry = async (planId: string, entry: Workout) => {
        validationErrorMessages.value = []
        currentPlanId.value = planId
        lastPlanId.value = planId

        if (showPlanProgressPopup.value) showPlanProgressPopup.value = false

        showProgressPopup.value = true
        await nextTick()

        progressEntryModalRef.value?.openEdit({ planId, entry })
    }

    const saveProgress = () => {
        progressEntryModalRef.value?.submit?.()
    }

    const onProgressEntryDelete = () => {
        if (currentPlanId.value && editingEntry.value) {
            const id = editingEntry.value.id
            if (!id) {
                showToast({ message: "Fehler: Eintrag-ID fehlt.", type: "default" })
                return
            }
            deleteProgressEntry(currentPlanId.value, id)
        }
        editingEntry.value = null
        showProgressPopup.value = false
        // PlanProgressPopup öffnet automatisch über den watcher
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
                    weight: (detail?.weight ?? it.weight),
                    reps: (detail?.reps ?? it.reps),
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

        const filtered = all.filter((w: Workout) => {
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

    const deleteProgressEntry = async (planId: string, id: string) => {
        await progressStore.remove(planId, id)
        workouts.value = workouts.value.filter(w => !(w.planId === planId && w.id === id))
        clearProgressContinuationDraft(planId)
        showToast({ message: "Eintrag gelöscht!", type: "success", emoji: "🗑️" })
    }

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

    const todayKey = () => {
        const d = new Date()
        const y = d.getFullYear()
        const m = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `${y}-${m}-${day}`
    }

    const normalizeExerciseName = (v: string) =>
        String(v ?? '')
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '')

    const isExerciseMatch = (planName: string, loggedName: string) => {
        const p = normalizeExerciseName(planName)
        const l = normalizeExerciseName(loggedName)
        if (!p || !l) return false
        if (p === l) return true
        return p.includes(l) || l.includes(p)
    }

    const getPlanExerciseNames = (planId: string) =>
        getExercisesForPlan(planId).map(x => String(x.exercise ?? '').trim()).filter(Boolean)

    const getLoggedExerciseNamesForDay = (planId: string, day: string) =>
        getProgressForPlan(planId)
            .filter(w => (w.date || '').slice(0, 10) === day)
            .map(w => String(w.exercise ?? '').trim())
            .filter(Boolean)

    const isPlanCompleteForDay = (planId: string, day: string) => {
        const planNames = getPlanExerciseNames(planId)
        if (!planNames.length) return false

        const loggedNames = getLoggedExerciseNamesForDay(planId, day)
        if (!loggedNames.length) return false

        if (planNames.length === 1) return true

        let matched = 0
        for (const p of planNames) {
            if (loggedNames.some(l => isExerciseMatch(p, l))) matched += 1
        }
        return matched >= planNames.length
    }

    const toPlannerDayKey = (dateStr?: string | null) => {
        if (!dateStr) return null
        const normalized = dateStr.length === 10 ? `${dateStr}T00:00:00Z` : dateStr
        const d = new Date(normalized)
        if (Number.isNaN(d.getTime())) return null
        const y = d.getUTCFullYear()
        const m = String(d.getUTCMonth() + 1).padStart(2, '0')
        const day = String(d.getUTCDate()).padStart(2, '0')
        return `${y}-${m}-${day}`
    }

    const getPlannerStatusForDay = async (planId: string, day: string) => {
        if (auth.user) {
            const items = await listTrainingPlanner()
            const planned = (items ?? []).some(i =>
                !i?.isRestDay &&
                String(i.planId ?? '') === String(planId) &&
                toPlannerDayKey(i.date) === day
            )
            const completed = (items ?? []).some(i =>
                String(i.planId ?? '') === String(planId) &&
                toPlannerDayKey(i.date) === day &&
                !!i.isCompleted
            )
            return { planned, completed }
        }

        try {
            const rawPlanner = localStorage.getItem(LS_TRAINING_PLANNER)
            const planner = rawPlanner ? JSON.parse(rawPlanner) : {}
            const plannedList = planner?.[day] ?? []
            const planned = Array.isArray(plannedList)
                ? plannedList.some((p: any) => String(p?.planId ?? '') === String(planId))
                : false

            const rawCompleted = localStorage.getItem(LS_TRAINING_PLANNER_COMPLETED)
            const completedArr = rawCompleted ? JSON.parse(rawCompleted) : []
            const completed = Array.isArray(completedArr) ? completedArr.includes(day) : false
            return { planned, completed }
        } catch {
            return { planned: false, completed: false }
        }
    }

    const markPlannerCompleted = async (planId: string, day: string) => {
        if (auth.user) {
            await setTrainingPlannerCompletion(`${day}T00:00:00.000Z`, true, planId)
            await planProgressPopupRef.value?.refreshPlannerState?.()
            return
        }

        try {
            const raw = localStorage.getItem(LS_TRAINING_PLANNER_COMPLETED)
            const arr = raw ? JSON.parse(raw) : []
            const next = Array.isArray(arr) ? [...arr] : []
            if (!next.includes(day)) next.push(day)
            localStorage.setItem(LS_TRAINING_PLANNER_COMPLETED, JSON.stringify(next))
            await planProgressPopupRef.value?.refreshPlannerState?.()
        } catch { }
    }

    const normalizeFeedbackExerciseType = (t: unknown): 'kraft' | 'calisthenics' | 'dehnung' | 'ausdauer' => {
        const n = typeof t === 'number' ? t : Number(String(t ?? '').trim())
        if (Number.isFinite(n)) {
            if (n === 2) return 'dehnung'
            if (n === 3) return 'ausdauer'
            if (n === 1) return 'calisthenics'
            return 'kraft'
        }

        const s = String(t ?? '').toLowerCase().trim()
        if (!s) return 'kraft'
        if (s === 'ausdauer' || s === 'cardio' || s === 'endurance' || s === 'aerobic' || s.includes('ausdauer')) return 'ausdauer'
        if (s === 'dehnung' || s === 'stretch' || s === 'stretching' || s === 'mobility' || s.includes('dehnung')) return 'dehnung'
        if (s === 'calisthenics' || s === 'bodyweight' || s === 'bw') return 'calisthenics'
        if (s === 'kraft' || s === 'strength' || s === 'weights' || s === 'weight') return 'kraft'
        return 'kraft'
    }

    const inferFeedbackTypeFromNameAndFields = (name: string, rawType: unknown, item?: any) => {
        let type = normalizeFeedbackExerciseType(rawType)
        const n = String(name ?? '').toLowerCase()

        const isCardioName = ['lauf', 'jogg', 'run', 'treadmill', 'rad', 'fahrrad', 'bike', 'spinning', 'cycling', 'row', 'rudern',
            'ergometer', 'crosstrainer', 'ellip', 'seilspring', 'rope', 'treppen', 'stairs', 'schwimm', 'walk', 'hike']
            .some(k => n.includes(k))
        const isStretchName = ['dehn', 'stretch', 'mobil', 'mobility', 'beweglich', 'yoga', 'faszien', 'smr', 'roll', 'hip opener']
            .some(k => n.includes(k))

        const hasCardioFields = item?.durationMin != null || item?.distanceKm != null || item?.avgHr != null || item?.pace != null || item?.hrZone != null
        const hasStretchFields = item?.painFree != null || item?.side != null || item?.equipment != null ||
            (Array.isArray(item?.setDetails) && item.setDetails.some((s: any) => s?.durationSec != null))

        if (type === 'kraft') {
            if (isStretchName || hasStretchFields) type = 'dehnung'
            else if (isCardioName || hasCardioFields) type = 'ausdauer'
        } else if (type === 'dehnung') {
            if ((isCardioName || hasCardioFields) && !hasStretchFields) type = 'ausdauer'
        } else if (type === 'ausdauer') {
            if ((isStretchName || hasStretchFields) && !hasCardioFields) type = 'dehnung'
        }

        return type
    }

    const feedbackExercisesForPlan = computed(() => {
        const planId = pendingFeedbackPlanId.value
        if (!planId) return []
        const day = pendingCompletion.value?.day ?? null

        if (day) {
            const entries = getProgressForPlan(planId)
                .filter(w => (w.date || '').slice(0, 10) === day)
                .filter(w => !!String(w.exercise ?? '').trim())

            if (entries.length) {
                const uniq = new Map<string, { exercise: string; type: 'kraft' | 'calisthenics' | 'dehnung' | 'ausdauer' }>()
                for (const w of entries) {
                    const exercise = String(w.exercise ?? '').trim()
                    if (!exercise) continue
                    const key = exercise.toLowerCase()
                    if (!uniq.has(key)) {
                        uniq.set(key, {
                            exercise,
                            type: inferFeedbackTypeFromNameAndFields(exercise, (w as any).type, w),
                        })
                    }
                }
                return Array.from(uniq.values())
            }
        }

        const dto = trainingPlansStore.items.find((p: TrainingPlanDto) => p.id === planId)
        if (dto && Array.isArray(dto.days)) {
            return dto.days.flatMap((d: TrainingDay) =>
                Array.isArray(d.exercises)
                    ? d.exercises.map((x: TrainingExercise) => ({
                        exercise: String(x.name ?? '').trim(),
                        type: inferFeedbackTypeFromNameAndFields(
                            String(x.name ?? '').trim(),
                            x.category ?? null,
                            x
                        ),
                    }))
                    : []
            ).filter((x: { exercise: string }) => !!x.exercise)
        }

        const names = trainingPlans.value.find(p => p.id === planId)?.exercises ?? []
        return names.map(n => ({ exercise: n, type: inferFeedbackTypeFromNameAndFields(n, null) }))
    })

    const feedbackStatusByDayForCurrentPlan = computed<Record<string, boolean>>(() => {
        const planId = currentPlanId.value ?? lastPlanId.value
        if (!planId) return {}

        const out: Record<string, boolean> = {}
        const source = auth.user ? trainingFeedbackSessionsByPlanDay.value : trainingFeedbackByPlanDay.value
        for (const key of Object.keys(source)) {
            if (!key.startsWith(`${planId}|`)) continue
            const day = key.slice(planId.length + 1)
            if (!day) continue
            if (auth.user) {
                const rec = (source as Record<string, TrainingSessionFeedbackRecord>)[key]
                if (rec?.feedbackId) out[day] = true
            } else {
                out[day] = true
            }
        }
        return out
    })

    const resetTrainingFeedbackPopupState = () => {
        trainingFeedbackReviewMode.value = false
        trainingFeedbackInitialData.value = null
        activeTrainingFeedbackSessionId.value = null
    }

    const onTrainingFeedbackClose = () => {
        showTrainingFeedback.value = false
        pendingCompletion.value = null
        pendingFeedbackPlanId.value = null
        resetTrainingFeedbackPopupState()
    }

    const onPlanProgressFeedbackClick = async (payload: { day: string }) => {
        const planId = currentPlanId.value ?? lastPlanId.value
        const day = String(payload?.day ?? '').slice(0, 10)
        if (!planId || !day) return

        if (auth.user) {
            await loadTrainingFeedbackFromBackendForPlan(planId)
        }

        const status = await getPlannerStatusForDay(planId, day)

        pendingCompletion.value = {
            planId,
            day,
            planned: status.planned,
            calendarMarked: status.completed,
        }
        pendingFeedbackPlanId.value = planId

        if (auth.user) {
            const rec = getBackendFeedbackRecordForDay(planId, day)
            const feedback = rec ? feedbackPayloadFromRecord(rec) : null
            activeTrainingFeedbackSessionId.value = rec?.sessionId ?? null
            if (feedback) {
                trainingFeedbackReviewMode.value = true
                trainingFeedbackInitialData.value = { ...feedback }
            } else {
                trainingFeedbackReviewMode.value = false
                trainingFeedbackInitialData.value = null
            }
        } else {
            const cached = getTrainingFeedbackCacheEntry(planId, day)
            activeTrainingFeedbackSessionId.value = null
            if (cached) {
                trainingFeedbackReviewMode.value = true
                trainingFeedbackInitialData.value = { ...cached }
            } else {
                trainingFeedbackReviewMode.value = false
                trainingFeedbackInitialData.value = null
            }
        }

        showTrainingFeedback.value = true
    }

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
    const showPlanProgressPopup = ref(false)
    const currentPlanId = ref<string | null>(null)
    const lastPlanId = ref<string | null>(null)
    const planProgressInitialView = ref<'list' | 'calendar' | 'stats'>('list')
    const effectivePlanId = computed(() => currentPlanId.value ?? lastPlanId.value)

    const maybeOpenPlanProgressFromRoute = async () => {
        const tab = String(route.query.tab ?? '')
        const openFlag = String(route.query.openPlanProgress ?? '')
        const planId = String(route.query.planId ?? '').trim()
        if (tab !== 'plans' || openFlag !== '1' || !planId) return

        activeTab.value = 'plans'
        currentPlanId.value = planId
        lastPlanId.value = planId

        await nextTick()
        showPlanProgressPopup.value = true

        const q: Record<string, any> = { ...route.query }
        delete q.openPlanProgress
        router.replace({ query: q })
    }

    watch(showProgressPopup, async (open, wasOpen) => {
        if (wasOpen && !open) {
            // Modal wurde gerade geschlossen -> sofort PlanProgressPopup öffnen
            if (currentPlanId.value) {
                await nextTick()
                showPlanProgressPopup.value = true
            }
        }
    })

    watch(showPlanProgressPopup, async (open) => {
        if (!open) return
        const planId = currentPlanId.value ?? lastPlanId.value
        if (auth.user && planId) {
            await loadTrainingFeedbackFromBackendForPlan(planId)
        }
        const pending = pendingPromptCheck.value
        if (!pending) return
        pendingPromptCheck.value = null
        await maybePromptTrainingComplete(pending.planId, pending.dateIso)
    })


    const deleteEntriesFromPlanView = (payload: { planId: string; entries: any[] }) => {
        const planId = payload?.planId
        const entries = payload?.entries ?? []
        if (!planId || !entries.length) return

        for (const e of entries) {
            const id = e?.id
            if (id) {
                deleteProgressEntry(planId, id)
            } else {
                showToast({ message: 'Fehler: Eintrag-ID fehlt (kann nicht löschen)', type: 'default' })
            }
        }

        showToast({
            message: entries.length === 1 ? 'Eintrag gelöscht' : `${entries.length} Einträge gelöscht`,
            type: 'success',
        })
    }

    // ===== Kebab -> ActionSelectPopup flow =====
    type PlanKebabAction = 'download' | 'edit' | 'delete'

    const showPlanActionSelectPopup = ref(false)
    const kebabPlanId = ref<string | null>(null)
    const kebabAction = ref<PlanKebabAction | null>(null)

    const openPlanActionsFromKebab = (planId: string, action: PlanKebabAction) => {
        kebabPlanId.value = planId
        kebabAction.value = action
        showPlanActionSelectPopup.value = true
    }

    // Wenn im ActionSelectPopup "Download" gewählt wird -> dann erst DownloadPopup öffnen
    const onPlanActionSelectDownload = async () => {
        const planId = kebabPlanId.value ?? currentPlanId.value ?? lastPlanId.value
        showPlanActionSelectPopup.value = false
        await nextTick()
        if (planId) openDownloadPopup('progress', planId)
    }

    const editEntryFromPlanView = async (entry: any) => {
        const planId = currentPlanId.value
        if (!planId) return

        // Plan-Popup weg, sonst liegt das Edit-Modal ggf. dahinter
        showPlanProgressPopup.value = false

        await nextTick()
        editProgressEntry(planId, entry)
    }

    const closePlanProgressPopup = () => {
        showPlanProgressPopup.value = false
        currentPlanId.value = null
        planProgressInitialView.value = 'list'
    }

    const currentPlanName = computed(() =>
        trainingPlans.value.find(p => p.id === currentPlanId.value)?.name ?? ''
    )

    const PLAN_ROTATION_ACTIVE_WEEKS = 8
    const PLAN_ROTATION_MIN_SESSIONS = 10
    const PLAN_ROTATION_RECENT_DAYS = 21

    const pad2 = (n: number) => String(n).padStart(2, '0')

    const toUtcDayKey = (dateStr?: string | null) => {
        if (!dateStr) return null
        const normalized = dateStr.length === 10 ? `${dateStr}T00:00:00Z` : dateStr
        const d = new Date(normalized)
        if (Number.isNaN(d.getTime())) return null
        return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`
    }

    const toUtcWeekKey = (dateStr?: string | null) => {
        if (!dateStr) return null
        const normalized = dateStr.length === 10 ? `${dateStr}T00:00:00Z` : dateStr
        const d = new Date(normalized)
        if (Number.isNaN(d.getTime())) return null
        const day = d.getUTCDay()
        const diff = (day + 6) % 7 // Monday = 0
        const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
        monday.setUTCDate(monday.getUTCDate() - diff)
        return `${monday.getUTCFullYear()}-${pad2(monday.getUTCMonth() + 1)}-${pad2(monday.getUTCDate())}`
    }

    const formatDayLong = (yyyyMMdd: string) => {
        const [y, m, d] = yyyyMMdd.split('-').map(Number)
        return new Date(y, (m ?? 1) - 1, d ?? 1).toLocaleDateString('de-DE', {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        })
    }

    const planRotationNotice = computed<null | { title: string; body: string }>(() => {
        const planId = currentPlanId.value
        if (!planId) return null

        const items = workouts.value.filter(w => w.planId === planId && !!w.date)
        if (items.length < PLAN_ROTATION_MIN_SESSIONS) return null

        const weekKeys = new Set<string>()
        const dayKeys: string[] = []

        for (const it of items) {
            const dayKey = toUtcDayKey(it.date)
            if (dayKey) dayKeys.push(dayKey)
            const weekKey = toUtcWeekKey(it.date)
            if (weekKey) weekKeys.add(weekKey)
        }

        const activeWeeks = weekKeys.size
        if (activeWeeks < PLAN_ROTATION_ACTIVE_WEEKS) return null

        const lastDay = dayKeys.sort().at(-1)
        if (!lastDay) return null

        const today = new Date()
        const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
        const lastUtc = Date.parse(`${lastDay}T00:00:00Z`)
        const daysSinceLast = Math.floor((todayUtc - lastUtc) / 86400000)
        if (Number.isNaN(daysSinceLast) || daysSinceLast > PLAN_ROTATION_RECENT_DAYS) return null

        return {
            title: 'Zeit für einen neuen Plan?',
            body: `Du nutzt diesen Plan seit ${activeWeeks} aktiven Wochen (${items.length} Einträge) – oft lohnt sich dann ein neuer Trainingsreiz. Letzter Eintrag: ${formatDayLong(lastDay)}.`,
        }
    })

    const planRotationTestNotice = computed<null | { title: string; body: string }>(() => {
        const planId = currentPlanId.value
        if (!planId) return null

        const items = workouts.value.filter(w => w.planId === planId && !!w.date)
        const dayKeys: string[] = []

        for (const it of items) {
            const dayKey = toUtcDayKey(it.date)
            if (dayKey) dayKeys.push(dayKey)
        }

        const lastDay = dayKeys.sort().at(-1) ?? toUtcDayKey(new Date().toISOString())
        if (!lastDay) return null

        return {
            title: 'Zeit für einen neuen Plan?',
            body: `Du nutzt diesen Plan seit ${PLAN_ROTATION_ACTIVE_WEEKS} aktiven Wochen (${items.length} Einträge) – oft lohnt sich dann ein neuer Trainingsreiz. Letzter Eintrag: ${formatDayLong(lastDay)}.`,
        }
    })

    const editLatestEntryForDay = (day: string) => {
        const planId = currentPlanId.value
        if (!planId) return

        const items = workouts.value
            .filter(w => w.planId === planId && (w.date || '').slice(0, 10) === day)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

        if (!items.length) {
            showToast({ message: 'Kein Eintrag für diesen Tag', type: 'default' })
            return
        }

        editProgressEntry(planId, items[0])
    }

    const addEntryFromPlanView = (payload?: { planId?: string; keepOpen?: boolean }) => {
        const planId = payload?.planId ?? currentPlanId.value ?? lastPlanId.value
        if (!planId) return

        lastPlanId.value = planId

        if (!payload?.keepOpen) {
            showPlanProgressPopup.value = false
        }

        openProgressPopup(planId)
    }

    const deleteLatestEntryForDay = (day: string) => {
        const planId = currentPlanId.value
        if (!planId) return

        const items = workouts.value
            .filter(w => w.planId === planId && (w.date || '').slice(0, 10) === day)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

        if (!items.length) {
            showToast({ message: 'Kein Eintrag für diesen Tag', type: 'default' })
            return
        }
        const id = items[0].id
        if (!id) {
            showToast({ message: 'Fehler: Eintrag-ID fehlt', type: 'default' })
            return
        }
        deleteProgressEntry(planId, id)
        showToast({ message: 'Eintrag gelöscht', type: 'success' })
    }

    //======== Export Popup ========

    const showDownloadPopup = ref(false);
    const downloadFormat = ref<'html' | 'csv' | 'json' | 'pdf' | 'txt'>('html');
    const downloadCalculator = ref<string | null>(null);
    const downloadPlanId = ref<string | null>(null);
    const downloadPlanDays = ref<string[]>([])

    const onPlanProgressDownload = (payload: { planId: string; days: string[] }) => {
        downloadPlanId.value = payload.planId
        downloadPlanDays.value = payload.days

        // WICHTIG: sonst macht confirmDownload() sofort return
        downloadCalculator.value = 'progress'

        showPlanProgressPopup.value = false
        showDownloadPopup.value = true
    }

    const openDownloadPopup = (calculator: string, planId?: string) => {
        const blocked = new Set(['bmi', 'calories', 'burnRate', 'oneRm', 'bodyFat', 'ffmi', 'water', 'protein', 'caffeine', 'glyload'])
        if (blocked.has(calculator)) return

        downloadCalculator.value = calculator
        downloadPlanId.value = planId || null
        downloadPlanDays.value = [] // wichtig: alte Day-Selection killen
        downloadFormat.value = 'html'
        showDownloadPopup.value = true
    }

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

            case 'progress': {
                if (!downloadPlanId.value) { addToast('Kein Plan ausgewählt', 'default'); closeDownloadPopup(); return; }
                const plan = trainingPlans.value.find(p => p.id === downloadPlanId.value)
                const all = getProgressForPlan(downloadPlanId.value)

                const selected = downloadPlanDays.value.length
                    ? all.filter(e => downloadPlanDays.value.includes((e.date || '').slice(0, 10)))
                    : all

                if (!selected.length) {
                    addToast('Kein Fortschritt zum Herunterladen', 'default')
                    closeDownloadPopup()
                    return
                }

                const progress = selected

                data = {
                    planName: plan?.name || 'Unbekannter Plan',
                    progress: progress.map((e: Workout) => ({
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
                if (!strengthWorkouts.value.length) {
                    addToast('Keine Trainingsdaten zum Herunterladen', 'default')
                    closeDownloadPopup()
                    return
                }
                data = {
                    totalWorkouts: strengthWorkouts.value.length,
                    entries: strengthWorkouts.value.map(w => ({
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

    const suppressToasts = ref(false)
    let toastReleaseTimer: ReturnType<typeof setTimeout> | null = null

    const toastPosition = ref<'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'>('bottom-right')
    const lastResetAction = ref<{ kind: 'weight' | 'workout'; data: any } | null>(null)
    const lastCalculatorReset = ref<{
        id: 'bmi' | 'calories' | 'oneRm' | 'bodyFat' | 'ffmi' | 'water' | 'protein' | 'caffeine' | 'glyload' | 'burnRate';
        data: any;
    } | null>(null)

    // Toast Snapshots Rechner

    type CafResetSnapshot = {
        weight: number | null
        sensitivity: 'low' | 'normal' | 'high'
        status: 'none' | 'pregnant'
        lastDoseTime: string
        sleepTime: string
        showTimingExtras: boolean
    }

    function onCafReset(snapshot?: CafResetSnapshot) {
        // 1) HARD RESET (refs korrekt)
        cafWeight.value = null
        cafSensitivity.value = 'normal'
        cafStatus.value = 'none'
        cafLastDoseTime.value = ''
        cafSleepTime.value = ''
        showTimingExtras.value = false
        cafResult.value = null

        // 2) Toast mit Undo (dein System: addToast)
        addToast(
            'Koffein-Rechner zurückgesetzt',
            'reset',
            snapshot
                ? {
                    label: 'Rückgängig',
                    handler: () => {
                        cafWeight.value = snapshot.weight
                        cafSensitivity.value = snapshot.sensitivity
                        cafStatus.value = snapshot.status
                        cafLastDoseTime.value = snapshot.lastDoseTime
                        cafSleepTime.value = snapshot.sleepTime
                        showTimingExtras.value = snapshot.showTimingExtras

                        if (autoCalcEnabled.value) {
                            withSilentToasts(calculateCaffeine)
                        }
                    },
                }
                : undefined,
        )
    }


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

    // ADD: "Display" (string) -> number fürs Modal
    const latestRecordedWeightValue = computed<number | null>(() => {
        const raw = latestRecordedWeightDisplay.value
        if (raw == null) return null

        // akzeptiert "82", "82.5", "82,5", "82 kg"
        const cleaned = String(raw).replace(',', '.').replace(/[^\d.]/g, '').trim()
        if (!cleaned) return null

        const n = Number(cleaned)
        return Number.isFinite(n) ? n : null
    })

    function debounce<F extends (...args: any[]) => void>(fn: F, wait = 300) {
        let t: number | undefined
        return (...args: Parameters<F>) => {
            if (t) clearTimeout(t)
            t = window.setTimeout(() => fn(...args), wait)
        }
    }

    const currentWeight = computed<number | null>(() =>
        weightHistory.value.length ? weightHistory.value[0].weight : null
    )

    const initialWeight = computed(() =>
        weightHistory.value.length ? weightHistory.value[weightHistory.value.length - 1].weight : null
    );

    const matchesSearch = (calculatorName: string) => {
        if (!searchQuery.value) return true;
        return calculatorName.toLowerCase().includes(searchQuery.value.toLowerCase());
    };

    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const formatPersonalRecordToastMessage = (exercise: string, hits: ReturnType<typeof detectPersonalRecordHits>) => {
        const parts = hits.slice(0, 3).map(hit =>
            `${personalRecordMetricLabel(hit.metric)} ${personalRecordMetricValueLabel(hit.metric, hit.currentValue)}`
        )

        const suffix = hits.length > 3 ? ` +${hits.length - 3}` : ''
        return `PR erreicht: ${exercise} · ${parts.join(' · ')}${suffix}`
    }

    const showPersonalRecordToast = (exercise: string, hits: ReturnType<typeof detectPersonalRecordHits>) => {
        if (!hits.length) return false
        showToast({
            message: formatPersonalRecordToastMessage(exercise, hits),
            type: 'success',
            emoji: '🏆',
        })
        confetti({ particleCount: 120, spread: 72, origin: { y: 0.62 } })
        return true
    }


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
        reps?: number,
        entryDate?: string, // 👈 neu: damit wir den aktuellen Eintrag beim Vergleich ausklammern können
    ) => {
        if (workouts.value.length === 10) {
            celebrateMilestone('Meilenstein: 10 Workouts erreicht! 🎉')
        }

        if (initialWeight.value != null && currentWeight.value != null) {
            const weightChange = Math.abs(currentWeight.value - initialWeight.value)
            if (weightChange >= 5) {
                celebrateMilestone('Meilenstein: 5 kg Gewichtsveränderung! 🎉')
            }
        }

        if (planId && exercise && typeof weightKg === 'number' && typeof reps === 'number') {
            const prevEntry = getProgressForPlan(planId)
                .filter((e: Workout) =>
                    e.exercise === exercise
                    && (e.type === 'kraft' || e.type === 'calisthenics')
                    && (!entryDate || e.date !== entryDate) // 👈 wichtig: NICHT gegen den aktuellen Eintrag vergleichen
                )
                .sort((a: Workout, b: Workout) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

            if (!prevEntry) return

            const improved =
                weightKg > prevEntry.weight ||
                (weightKg === prevEntry.weight && reps > (prevEntry.reps ?? -Infinity))

            if (improved) {
                showToast({
                    message: `Meilenstein erreicht! ${exercise}: ${formatWeight(weightKg, 0)} × ${reps} Wdh. 🎉`,
                    type: 'success',
                    emoji: '🎉',
                })
                confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
            }
        }
    }


    const celebrateMilestone = (message: string) => {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        addToast(message, 'default');
    };

    const loadFromLocalStorage = () => {
        try {
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
            const workoutsData = localStorage.getItem(LS_PROGRESS_WORKOUTS);
            if (workoutsData) {
                const parsed = JSON.parse(workoutsData);
                workouts.value = Array.isArray(parsed)
                    ? parsed.map((workout: Workout) => ({
                        ...workout,
                        type: normalizeWorkoutType(workout?.type, workout?.exercise, workout),
                    }))
                    : [];
            }
            const proteinData = localStorage.getItem(LS_PROGRESS_PROTEIN);
            if (proteinData) {
                const parsed = JSON.parse(proteinData)
                proteinWeight.value = parsed.weight
                proteinGoal.value = parsed.goal
                proteinResult.value = parsed.result

                if (autoCalcEnabled.value) {
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

                if (autoCalcEnabled.value) {
                    calculateBurnRate()
                }
            }

            const trainingData = localStorage.getItem(LS_TRAINING_DATA);
            if (trainingData) {
            }
        } catch (err) {
            console.error('Error loading from localStorage:', err);
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
            freezeProgressBackground()
        });
    }, { immediate: true });

    watch(unit, () => {
        if (activeTab.value === 'stats') {
            updateWeightChart();
            updateWorkoutChart();
        }
    });

    let bgFreezeObserver: MutationObserver | null = null
    function freezeProgressBackground() {
        const el = document.querySelector('.progress') as HTMLElement | null
        if (!el) return

        // wir nutzen jetzt .progress::before als Background-Layer
        // => alle alten Inline-Copies killen, damit nix "alt" durchblitzt
        el.style.backgroundImage = ''
        el.style.backgroundColor = ''
        el.style.backgroundRepeat = ''
        el.style.backgroundPosition = ''
        el.style.backgroundSize = ''
        el.style.backgroundAttachment = ''
    }

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

        freezeProgressBackground()
        window.addEventListener('resize', freezeProgressBackground)

        bgFreezeObserver = new MutationObserver(() => freezeProgressBackground())
        bgFreezeObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class', 'style'],
        })

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

        window.removeEventListener('resize', freezeProgressBackground)
        bgFreezeObserver?.disconnect()
        bgFreezeObserver = null
    })
</script>

<style scoped>

    .preview-touch {
        position: fixed;
        z-index: 12050;
        width: 1.15rem;
        height: 1.15rem;
        margin-left: -0.575rem;
        margin-top: -0.575rem;
        pointer-events: none;
    }

    .preview-touch__dot {
        position: absolute;
        inset: 0;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.96);
        border: 2px solid rgba(29, 78, 216, 0.92);
        box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.3);
        animation: previewTouchPulse 1.2s ease-out infinite;
    }

    .preview-touch.is-pressing .preview-touch__dot {
        transform: scale(0.72);
        box-shadow: 0 0 0 0.4rem rgba(59, 130, 246, 0.12);
        transition: transform 90ms ease, box-shadow 90ms ease;
    }

    @keyframes previewTouchPulse {
        0% {
            transform: scale(0.88);
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.34);
        }
        70% {
            transform: scale(1);
            box-shadow: 0 0 0 0.7rem rgba(59, 130, 246, 0);
        }
        100% {
            transform: scale(0.9);
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
        }
    }

    .progress {
        padding: clamp(1.4rem, 3vw, 2.4rem);
        min-height: 100vh;
        font-family: 'Inter', sans-serif;
        color: var(--text-primary);
        overflow-x: hidden;
        /* eigener Layer statt "Parent Background klauen" */
        position: relative;
        isolation: isolate;
        background: transparent;
    }

    /* Dark Mode soll auch keinen eigenen Background setzen */
    html.dark-mode .progress {
        background: transparent;
    }

    .progress::before {
        content: "";
        position: fixed;
        inset: 0;
        z-index: -1;
        pointer-events: none;
        background: radial-gradient( circle at top left, color-mix(in srgb, var(--accent-primary) 16%, transparent), transparent 58% ), radial-gradient( circle at bottom right, color-mix(in srgb, var(--accent-secondary) 12%, transparent), transparent 62% ), var(--bg-app, #f8fafc);
    }

    html.dark-mode .progress::before {
        background: radial-gradient( circle at top left, color-mix(in srgb, var(--accent-primary) 22%, transparent), transparent 58% ), radial-gradient( circle at bottom right, color-mix(in srgb, var(--accent-secondary) 16%, transparent), transparent 62% ), #020617;
    }

    .chart-canvas {
        display: block;
        width: 100% !important; /* überschreibt Chart.js-Inlinebreite */
        max-width: 100%;
        height: 240px !important; /* fixe, angenehme Mobile-Höhe */
        box-sizing: border-box;
    }

    .chart-canvas--clickable {
        cursor: pointer;
    }

    .chart-canvas--clickable:focus-visible {
        outline: 2px solid color-mix(in srgb, var(--accent-primary) 65%, white 35%);
        outline-offset: 4px;
        border-radius: 8px;
    }

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
        text-align: center;
    }

    .page-subtext {
        color: var(--text-secondary);
        margin-bottom: 2rem;
        font-size: 1rem;
        font-weight: 500;
        text-align: center;
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

<style scoped>
    .training-complete-body {
        text-align: center;
        color: var(--text-secondary);
        margin: 0.25rem 0 0.6rem;
    }

    .training-complete-actions {
        display: flex;
        justify-content: center;
        gap: 0.6rem;
        margin-top: 0.5rem;
        flex-wrap: wrap;
    }
</style>
