<!-- src/Footer/FAQ.vue -->
<template>
    <div class="legal-page">
        <header ref="headerEl" class="faq-header">
            <div class="faq-header__inner">
                <div class="faq-hero">
                    <div class="faq-hero__copy">
                        <span class="faq-kicker">{{ t('faq.kicker') }}</span>
                        <h1 class="faq-title">{{ t('faq.title') }}</h1>
                        <p class="faq-subtitle">
                            {{ t('faq.subtitle') }}
                        </p>
                    </div>

                    <div class="faq-hero__stats" aria-hidden="true">
                        <div class="faq-stat">
                            <strong>8</strong>
                            <span>{{ t('faq.stats.sections') }}</span>
                        </div>
                        <div class="faq-stat">
                            <strong>85+</strong>
                            <span>{{ t('faq.stats.answers') }}</span>
                        </div>
                        <div class="faq-stat">
                            <strong>{{ t('faq.stats.searchTitle') }}</strong>
                            <span>{{ t('faq.stats.searchText') }}</span>
                        </div>
                    </div>
                </div>

                <div class="faq-search">
                    <UiSearch v-model="searchQuery"
                              :placeholder="t('faq.search.placeholder')"
                              :ariaLabel="t('faq.search.aria')"
                              :center="true"
                              maxWidth="720px" />

                    <div class="faq-search__meta" v-if="searchQuery.trim().length">
                        <span v-if="matchCount > 0">{{ t('faq.search.matches').replace('{count}', String(matchCount)) }}</span>
                        <span v-else>{{ t('faq.search.noMatches') }}</span>
                    </div>
                </div>
            </div>
        </header>

        <p class="faq-no-results" v-if="searchQuery.trim().length && matchCount === 0">
            {{ t('faq.noResults') }}
        </p>

        <p class="faq-picker-hint">
            {{ t('faq.pickerHint') }}
        </p>

        <nav class="faq-filter" :aria-label="t('faq.categories.aria')">
            <template v-for="cat in categories" :key="cat.key">
                <button type="button"
                        class="faq-filter-button"
                        :class="{ active: activeCategory === cat.key }"
                        @click="toggleCategory(cat.key)">
                    <span class="faq-filter-button__icon" aria-hidden="true">{{ cat.icon }}</span>
                    <span class="faq-filter-button__copy">
                        <strong>{{ t(cat.labelKey) }}</strong>
                        <small>{{ t(cat.descriptionKey) }}</small>
                    </span>
                </button>

                <Transition v-if="activeCategory === cat.key" name="faq-panels">
                    <div v-if="activeCategory === cat.key" class="faq-panels faq-panels--inline">
                        <!-- Landing -->
                        <section class="faq-section" v-if="activeCategory === 'all' || activeCategory === 'landing'">
                            <h3 v-if="activeCategory === 'all'" class="faq-section-label">{{ t('faq.category.landing.label') }}</h3>
                            <details>
                                <summary>{{ t('faq.landing.q1') }}</summary>
                                <p>
                                    {{ t('faq.landing.a1') }}
                                </p>
                            </details>

                            <details>
                                <summary>{{ t('faq.landing.q2') }}</summary>
                                <p>
                                    {{ t('faq.landing.a2') }}
                                </p>
                            </details>

                            <details>
                                <summary>{{ t('faq.landing.q3') }}</summary>
                                <p>
                                    {{ t('faq.landing.a3') }}
                                </p>
                            </details>

                            <details>
                                <summary>{{ t('faq.landing.q4') }}</summary>
                                <p>
                                    {{ t('faq.landing.a4') }}
                                </p>
                            </details>

                            <details>
                                <summary>{{ t('faq.landing.q5') }}</summary>
                                <p>
                                    {{ t('faq.landing.a5') }}
                                </p>
                            </details>

                            <details>
                                <summary>{{ t('faq.landing.q6') }}</summary>
                                <p>
                                    {{ t('faq.landing.a6') }}
                                </p>
                            </details>

                            <details>
                                <summary>{{ t('faq.landing.q7') }}</summary>
                                <p>
                                    {{ t('faq.landing.a7') }}
                                </p>
                            </details>

                            <details>
                                <summary>{{ t('faq.landing.q8') }}</summary>
                                <p>
                                    {{ t('faq.landing.a8') }}
                                </p>
                            </details>
                        </section>

                        <!-- Training -->
                        <section class="faq-section" v-if="activeCategory === 'all' || activeCategory === 'training'">
                            <h3 v-if="activeCategory === 'all'" class="faq-section-label">{{ t('faq.category.training.label') }}</h3>
                            <details>
                                <summary>{{ t('faq.training.q1') }}</summary>
                                <p>
                                    {{ t('faq.training.a1') }}
                                </p>
                            </details>

                            <details>
                                <summary>{{ t('faq.training.q2') }}</summary>
                                <p>
                                    {{ t('faq.training.a2') }}
                                </p>
                            </details>

                            <details>
                                <summary>{{ t('faq.training.q3') }}</summary>
                                <p>
                                    {{ t('faq.training.a3') }}
                                </p>
                            </details>

                            <details>
                                <summary>{{ t('faq.training.q4') }}</summary>
                                <p>
                                    {{ t('faq.training.a4') }}
                                </p>
                            </details>

                            <details>
                                <summary>{{ t('faq.training.q5') }}</summary>
                                <p>
                                    {{ t('faq.training.a5') }}
                                </p>
                            </details>

                            <details>
                                <summary>{{ t('faq.training.q6') }}</summary>
                                <p>
                                    {{ t('faq.training.a6') }}
                                </p>
                            </details>

                            <details>
                                <summary>{{ t('faq.training.q7') }}</summary>
                                <p>
                                    {{ t('faq.training.a7') }}
                                </p>
                            </details>

                            <details>
                                <summary>{{ t('faq.training.q8') }}</summary>
                                <p>
                                    {{ t('faq.training.a8') }}
                                </p>
                            </details>

                            <details>
                                <summary>{{ t('faq.training.q9') }}</summary>
                                <p>
                                    {{ t('faq.training.a9') }}
                                </p>
                            </details>

                            <details>
                                <summary>{{ t('faq.training.q10') }}</summary>
                                <p>
                                    {{ t('faq.training.a10') }}
                                </p>
                            </details>

                            <details>
                                <summary>{{ t('faq.training.q11') }}</summary>
                                <p>
                                    {{ t('faq.training.a11') }}
                                </p>
                            </details>

                            <details>
                                <summary>{{ t('faq.training.q12') }}</summary>
                                <p>
                                    {{ t('faq.training.a12') }}
                                </p>
                            </details>

                            <details>
                                <summary>{{ t('faq.training.q13') }}</summary>
                                <p>
                                    {{ t('faq.training.a13') }}
                                </p>
                            </details>

                            <details>
                                <summary>{{ t('faq.training.q14') }}</summary>
                                <p>
                                    {{ t('faq.training.a14') }}
                                </p>
                            </details>

                            <details>
                                <summary>{{ t('faq.training.q15') }}</summary>
                                <p>
                                    {{ t('faq.training.a15') }}
                                </p>
                            </details>

                            <details>
                                <summary>{{ t('faq.training.q16') }}</summary>
                                <p>
                                    {{ t('faq.training.a16') }}
                                </p>
                            </details>

                            <details>
                                <summary>{{ t('faq.training.q17') }}</summary>
                                <p>
                                    {{ t('faq.training.a17') }}
                                </p>
                            </details>
                        </section>

                        <!-- Fortschritt -->
                        <section class="faq-section" v-if="activeCategory === 'all' || activeCategory === 'progress'">
                            <h3 v-if="activeCategory === 'all'" class="faq-section-label">{{ t('faq.category.progress.label') }}</h3>
                            <details>
                                <summary>{{ t('faq.progress.q1') }}</summary>
                                <p>{{ t('faq.progress.a1') }}</p>
                            </details>

                            <details>
                                <summary>{{ t('faq.progress.q2') }}</summary>
                                <p>{{ t('faq.progress.a2') }}</p>
                            </details>

                            <details>
                                <summary>{{ t('faq.progress.q3') }}</summary>
                                <p>{{ t('faq.progress.a3') }}</p>
                            </details>

                            <details>
                                <summary>{{ t('faq.progress.q4') }}</summary>
                                <p>{{ t('faq.progress.a4') }}</p>
                            </details>

                            <details>
                                <summary>{{ t('faq.progress.q5') }}</summary>
                                <p>{{ t('faq.progress.a5') }}</p>
                            </details>

                            <details>
                                <summary>{{ t('faq.progress.q6') }}</summary>
                                <p>{{ t('faq.progress.a6') }}</p>
                            </details>

                            <details>
                                <summary>{{ t('faq.progress.q7') }}</summary>
                                <p>{{ t('faq.progress.a7') }}</p>
                            </details>

                            <details>
                                <summary>{{ t('faq.progress.q8') }}</summary>
                                <p>{{ t('faq.progress.a8') }}</p>
                            </details>

                            <details>
                                <summary>{{ t('faq.progress.q9') }}</summary>
                                <p>{{ t('faq.progress.a9') }}</p>
                            </details>
                        </section>

                        <!-- Timer & Stopwatch -->
                        <section class="faq-section" v-if="activeCategory === 'all' || activeCategory === 'timers'">
                            <h3 v-if="activeCategory === 'all'" class="faq-section-label">{{ t('faq.section.timers') }}</h3>
                            <details>
                                <summary>{{ t('faq.timers.q1') }}</summary>
                                <p>{{ t('faq.timers.a1') }}</p>
                            </details>

                            <details>
                                <summary>{{ t('faq.timers.q2') }}</summary>
                                <p>{{ t('faq.timers.a2') }}</p>
                            </details>

                            <details>
                                <summary>{{ t('faq.timers.q3') }}</summary>
                                <p>{{ t('faq.timers.a3') }}</p>
                            </details>

                            <details>
                                <summary>{{ t('faq.timers.q4') }}</summary>
                                <p>{{ t('faq.timers.a4') }}</p>
                            </details>

                            <details>
                                <summary>{{ t('faq.timers.q5') }}</summary>
                                <p>{{ t('faq.timers.a5') }}</p>
                            </details>

                            <details>
                                <summary>{{ t('faq.timers.q6') }}</summary>
                                <p>{{ t('faq.timers.a6') }}</p>
                            </details>

                            <details>
                                <summary>{{ t('faq.timers.q7') }}</summary>
                                <p>{{ t('faq.timers.a7') }}</p>
                            </details>

                            <details>
                                <summary>{{ t('faq.timers.q8') }}</summary>
                                <p>{{ t('faq.timers.a8') }}</p>
                            </details>

                            <details>
                                <summary>{{ t('faq.timers.q9') }}</summary>
                                <p>{{ t('faq.timers.a9') }}</p>
                            </details>

                            <details>
                                <summary>{{ t('faq.timers.q10') }}</summary>
                                <p>{{ t('faq.timers.a10') }}</p>
                            </details>

                            <details>
                                <summary>{{ t('faq.timers.q11') }}</summary>
                                <p>{{ t('faq.timers.a11') }}</p>
                            </details>
                        </section>

                        <!-- Beschwerden -->
                        <section class="faq-section" v-if="activeCategory === 'all' || activeCategory === 'complaints'">
                            <h3 v-if="activeCategory === 'all'" class="faq-section-label">{{ t('faq.category.complaints.label') }}</h3>
                            <details>
                                <summary>{{ t('faq.complaints.q1') }}</summary>
                                <p>{{ t('faq.complaints.a1') }}</p>
                            </details>

                            <details>
                                <summary>{{ t('faq.complaints.q2') }}</summary>
                                <p>{{ t('faq.complaints.a2') }}</p>
                            </details>

                            <details>
                                <summary>{{ t('faq.complaints.q3') }}</summary>
                                <p>{{ t('faq.complaints.a3') }}</p>
                            </details>

                            <details>
                                <summary>{{ t('faq.complaints.q4') }}</summary>
                                <p>{{ t('faq.complaints.a4') }}</p>
                            </details>

                            <details>
                                <summary>{{ t('faq.complaints.q5') }}</summary>
                                <p>{{ t('faq.complaints.a5') }}</p>
                            </details>

                            <details>
                                <summary>{{ t('faq.complaints.q5') }}</summary>
                                <p>{{ t('faq.complaints.a5') }}</p>
                            </details>

                            <details>
                                <summary>{{ t('faq.complaints.q7') }}</summary>
                                <p>{{ t('faq.complaints.a7') }}</p>
                            </details>

                            <details>
                                <summary>{{ t('faq.complaints.q8') }}</summary>
                                <p>{{ t('faq.complaints.a8') }}</p>
                            </details>
                        </section>

                        <!-- Tutorials -->
                        <section class="faq-section" v-if="activeCategory === 'all' || activeCategory === 'tutorials'">
                            <h3 v-if="activeCategory === 'all'" class="faq-section-label">{{ t('faq.category.tutorials.label') }}</h3>
                            <details>
                                <summary>{{ t('faq.tutorials.q1') }}</summary>
                                <p>{{ t('faq.tutorials.a1') }}</p>
                            </details>

                            <details>
                                <summary>{{ t('faq.tutorials.q2') }}</summary>
                                <p>{{ t('faq.tutorials.a2') }}</p>
                            </details>

                            <details>
                                <summary>{{ t('faq.tutorials.q3') }}</summary>
                                <p>{{ t('faq.tutorials.a3') }}</p>
                            </details>

                            <details>
                                <summary>{{ t('faq.tutorials.q4') }}</summary>
                                <p>{{ t('faq.tutorials.a4') }}</p>
                            </details>

                            <details>
                                <summary>{{ t('faq.tutorials.q5') }}</summary>
                                <p>{{ t('faq.tutorials.a5') }}</p>
                            </details>

                            <details>
                                <summary>{{ t('faq.tutorials.q6') }}</summary>
                                <p>{{ t('faq.tutorials.a6') }}</p>
                            </details>

                            <details>
                                <summary>{{ t('faq.tutorials.q7') }}</summary>
                                <p>{{ t('faq.tutorials.a7') }}</p>
                            </details>
                        </section>

                        <!-- Einstellungen -->
                        <section class="faq-section" v-if="activeCategory === 'all' || activeCategory === 'settings'">
                            <h3 v-if="activeCategory === 'all'" class="faq-section-label">{{ t('faq.category.settings.label') }}</h3>
                            <details>
                                <summary>{{ t('faq.settings.q1') }}</summary>
                                <p>{{ t('faq.settings.a1') }}</p>
                            </details>

                            <details>
                                <summary>{{ t('faq.settings.q2') }}</summary>
                                <p>{{ t('faq.settings.a2') }}</p>
                            </details>

                            <details>
                                <summary>{{ t('faq.settings.q3') }}</summary>
                                <p>{{ t('faq.settings.a3') }}</p>
                            </details>

                            <details>
                                <summary>{{ t('faq.settings.q4') }}</summary>
                                <p>{{ t('faq.settings.a4') }}</p>
                            </details>

                            <details>
                                <summary>{{ t('faq.settings.q5') }}</summary>
                                <p>{{ t('faq.settings.a5') }}</p>
                            </details>

                            <details>
                                <summary>{{ t('faq.settings.q6') }}</summary>
                                <p>{{ t('faq.settings.a6') }}</p>
                            </details>

                            <details>
                                <summary>{{ t('faq.settings.q7') }}</summary>
                                <p>{{ t('faq.settings.a7') }}</p>
                            </details>
                        </section>

                        <!-- Profil -->
                        <section class="faq-section" v-if="activeCategory === 'all' || activeCategory === 'profile'">
                            <h3 v-if="activeCategory === 'all'" class="faq-section-label">{{ t('faq.category.profile.label') }}</h3>
                            <details>
                                <summary>{{ t('faq.profile.q1') }}</summary>
                                <p>{{ t('faq.profile.a1') }}</p>
                            </details>

                            <details>
                                <summary>{{ t('faq.profile.q2') }}</summary>
                                <p>{{ t('faq.profile.a2') }}</p>
                            </details>

                            <details>
                                <summary>{{ t('faq.profile.q3') }}</summary>
                                <p>{{ t('faq.profile.a3') }}</p>
                            </details>

                            <details>
                                <summary>{{ t('faq.profile.q4') }}</summary>
                                <p>{{ t('faq.profile.a4') }}</p>
                            </details>

                            <details>
                                <summary>{{ t('faq.profile.q5') }}</summary>
                                <p>{{ t('faq.profile.a5') }}</p>
                            </details>

                            <details>
                                <summary>{{ t('faq.profile.q6') }}</summary>
                                <p>{{ t('faq.profile.a6') }}</p>
                            </details>

                            <details>
                                <summary>{{ t('faq.profile.q7') }}</summary>
                                <p>{{ t('faq.profile.a7') }}</p>
                            </details>

                            <details>
                                <summary>{{ t('faq.profile.q8') }}</summary>
                                <p>{{ t('faq.profile.a8') }}</p>
                            </details>
                        </section>
                    </div>
                </Transition>
            </template>
        </nav>
    </div>
</template>

<script setup lang="ts">
    import { onMounted, onUnmounted, ref, watch, nextTick } from "vue";
    import UiSearch from "@/components/ui/kits/UiSearch.vue";
    import { useI18n } from "@/composables/useI18n";

    const { t } = useI18n();

    type CatKey = "all" | "landing" | "training" | "progress" | "timers" | "complaints" | "tutorials" | "settings" | "profile";
    type Category = { key: CatKey; labelKey: string; icon: string; descriptionKey: string };

    const categories: Category[] = [
        { key: "all", labelKey: "faq.category.all.label", icon: "◌", descriptionKey: "faq.category.all.description" },
        { key: "landing", labelKey: "faq.category.landing.label", icon: "⌂", descriptionKey: "faq.category.landing.description" },
        { key: "training", labelKey: "faq.category.training.label", icon: "◫", descriptionKey: "faq.category.training.description" },
        { key: "progress", labelKey: "faq.category.progress.label", icon: "◔", descriptionKey: "faq.category.progress.description" },
        { key: "timers", labelKey: "faq.category.timers.label", icon: "◷", descriptionKey: "faq.category.timers.description" },
        { key: "complaints", labelKey: "faq.category.complaints.label", icon: "✚", descriptionKey: "faq.category.complaints.description" },
        { key: "tutorials", labelKey: "faq.category.tutorials.label", icon: "▷", descriptionKey: "faq.category.tutorials.description" },
        { key: "settings", labelKey: "faq.category.settings.label", icon: "⚙", descriptionKey: "faq.category.settings.description" },
        { key: "profile", labelKey: "faq.category.profile.label", icon: "◎", descriptionKey: "faq.category.profile.description" },
    ];

    const activeCategory = ref<CatKey | null>(null);

    const toggleCategory = (key: CatKey) => {
        activeCategory.value = activeCategory.value === key ? null : key;
    };

    const searchQuery = ref("");
    const matchCount = ref(0);

    const headerEl = ref<HTMLElement | null>(null);

    const norm = (s: string) => (s || "").toLowerCase().replace(/\s+/g, " ").trim();

    const escapeHtml = (s: string) =>
        s.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    const highlightText = (text: string, q: string) => {
        if (!q) return escapeHtml(text);

        const lower = text.toLowerCase();
        const needle = q.toLowerCase();

        let out = "";
        let i = 0;

        while (true) {
            const idx = lower.indexOf(needle, i);
            if (idx === -1) break;

            out += escapeHtml(text.slice(i, idx));
            out += `<span class="faq-hit">${escapeHtml(text.slice(idx, idx + needle.length))}</span>`;
            i = idx + needle.length;
        }

        out += escapeHtml(text.slice(i));
        return out;
    };

    const applyHighlights = (detailsEl: HTMLDetailsElement, q: string) => {
        const targets = [
            detailsEl.querySelector("summary"),
            ...Array.from(detailsEl.querySelectorAll("p")),
        ].filter(Boolean) as HTMLElement[];

        targets.forEach((el) => {
            if (!el.dataset.origText) el.dataset.origText = el.textContent ?? "";

            if (!q) {
                el.textContent = el.dataset.origText ?? "";
                return;
            }

            const orig = el.dataset.origText ?? "";
            el.innerHTML = highlightText(orig, q);
        });
    };

    const applyFaqFilter = () => {
        const q = norm(searchQuery.value);
        const root = document.querySelector(".legal-page");
        if (!root) return;

        const detailsEls = Array.from(root.querySelectorAll(".faq-section details")) as HTMLDetailsElement[];

        let matches = 0;

        detailsEls.forEach((d) => {
            const summaryText = d.querySelector("summary")?.textContent ?? "";
            const fullText = d.textContent ?? "";
            const hay = norm(`${summaryText} ${fullText}`);

            const isMatch = !q || hay.includes(q);

            (d as HTMLElement).style.display = isMatch ? "" : "none";

            if (q) d.open = isMatch;
            else d.open = false;

            if (isMatch && q) matches += 1;

            applyHighlights(d, q);
        });

        matchCount.value = q ? matches : 0;

        const sections = Array.from(root.querySelectorAll(".faq-section")) as HTMLElement[];
        sections.forEach((sec) => {
            if (!q) {
                sec.style.display = "";
                return;
            }
            const visible = Array.from(sec.querySelectorAll("details")).some((d) => (d as HTMLElement).style.display !== "none");
            sec.style.display = visible ? "" : "none";
        });
    };

    onMounted(async () => {
        await nextTick();
        applyFaqFilter();
    });

    onUnmounted(() => {
    });

    watch(searchQuery, async () => {
        if (searchQuery.value.trim().length && !activeCategory.value) {
            activeCategory.value = "all";
            await nextTick();
        }

        applyFaqFilter();
    });

    watch(activeCategory, async () => {
        await nextTick();
        applyFaqFilter();
    });
</script>

<style scoped>
    .legal-page {
        max-width: 1120px;
        margin: 2.6rem auto 4rem;
        padding: 1.2rem 1.2rem 3rem;
        overflow: visible;
    }

    .faq-header {
        position: sticky;
        top: var(--app-header-height, 0px);
        z-index: 50;
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
        margin-bottom: 1.5rem;
    }

    .faq-header__inner {
        max-width: 1120px;
        margin: 0 auto;
        padding: 0;
    }

    .faq-hero {
        display: grid;
        grid-template-columns: minmax(0, 1.6fr) minmax(260px, .95fr);
        gap: 1rem;
        padding: 1.3rem;
        border-radius: 24px;
        border: 1px solid color-mix(in srgb, var(--border-color) 82%, rgba(75, 108, 183, 0.18) 18%);
        background: radial-gradient(circle at top right, rgba(75, 108, 183, 0.12), transparent 34%), linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 96%, #ffffff 4%), color-mix(in srgb, var(--bg-secondary) 92%, #ffffff 8%));
        box-shadow: 0 20px 48px rgba(15, 23, 42, 0.08);
    }

    .faq-kicker {
        display: inline-flex;
        align-items: center;
        padding: 0.36rem 0.68rem;
        margin-bottom: 0.7rem;
        border-radius: 999px;
        background: color-mix(in srgb, var(--accent-primary) 12%, transparent);
        color: color-mix(in srgb, var(--accent-secondary) 78%, var(--text-primary) 22%);
        font-size: 0.76rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
    }

    .faq-title {
        margin: 0;
        line-height: 1.1;
        font-size: clamp(2rem, 3vw, 3rem);
    }

    .faq-subtitle {
        margin: 0;
        max-width: 62ch;
        color: var(--text-secondary);
        line-height: 1.58;
        font-size: 1rem;
    }

    .faq-hero__stats {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 0.75rem;
        align-content: start;
    }

    .faq-stat {
        display: grid;
        gap: 0.18rem;
        padding: 0.95rem 0.9rem;
        border-radius: 18px;
        border: 1px solid color-mix(in srgb, var(--border-color) 74%, rgba(75, 108, 183, 0.18) 26%);
        background: color-mix(in srgb, var(--bg-card) 88%, rgba(255,255,255,.26) 12%);
        text-align: center;
    }

        .faq-stat strong {
            font-size: 1.1rem;
            line-height: 1.1;
        }

        .faq-stat span {
            font-size: 0.82rem;
            color: var(--text-secondary);
        }

    .faq-search {
        margin: 1rem 0 0;
        display: flex;
        flex-direction: column;
        gap: 0.65rem;
    }

    .faq-search__meta {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        gap: 1rem;
        opacity: 0.85;
        font-size: 0.95rem;
    }

    .faq-picker-hint {
        margin: 0 0 0.9rem;
        padding: 0 0.15rem;
        color: var(--text-secondary);
        font-size: 0.92rem;
        line-height: 1.5;
    }

    .faq-no-results {
        margin: 0 0 1.25rem;
        padding: 1rem 1.1rem;
        border-radius: 18px;
        border: 1px solid color-mix(in srgb, #f59e0b 26%, var(--border-color) 74%);
        background: color-mix(in srgb, #f59e0b 8%, var(--bg-card) 92%);
        line-height: 1.55;
    }

    .faq-filter {
        display: grid;
        grid-template-columns: 1fr;
        gap: 0.8rem;
        margin: 1.2rem 0 1.8rem;
        align-items: start;
    }

    .faq-panels {
        display: grid;
        gap: 1.7rem;
    }

    .faq-panels--inline {
        grid-column: 1 / -1;
        margin-top: 0.1rem;
    }

    .faq-panels-enter-active,
    .faq-panels-leave-active {
        transition: opacity .24s ease, transform .28s cubic-bezier(0.22, 0.61, 0.36, 1);
    }

    .faq-panels-enter-from,
    .faq-panels-leave-to {
        opacity: 0;
        transform: translateY(18px) scale(.985);
    }

    .faq-filter-button {
        display: flex;
        align-items: flex-start;
        gap: 0.8rem;
        text-align: left;
        border-radius: 20px;
        border: 1px solid color-mix(in srgb, var(--border-color) 82%, rgba(75, 108, 183, 0.16) 18%);
        padding: 0.95rem 1rem;
        font-size: 0.94rem;
        background: linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 94%, #ffffff 6%), color-mix(in srgb, var(--bg-secondary) 94%, #ffffff 6%));
        cursor: pointer;
        box-shadow: 0 12px 28px rgba(15, 23, 42, 0.05);
        transition: transform 0.14s ease, border-color 0.14s ease, box-shadow 0.14s ease, background-color 0.14s ease;
    }

        .faq-filter-button:hover {
            transform: translateY(-2px);
            border-color: color-mix(in srgb, var(--accent-primary) 28%, var(--border-color) 72%);
            box-shadow: 0 18px 34px rgba(15, 23, 42, 0.08);
        }

        .faq-filter-button.active {
            border-color: color-mix(in srgb, var(--accent-primary) 42%, var(--border-color) 58%);
            background: radial-gradient(circle at top right, color-mix(in srgb, var(--accent-primary) 14%, transparent), transparent 40%), linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 96%, #ffffff 4%), color-mix(in srgb, var(--bg-secondary) 88%, var(--accent-primary) 12%));
            box-shadow: 0 20px 40px rgba(15, 23, 42, 0.1);
        }

    .faq-filter-button__icon {
        width: 2.35rem;
        height: 2.35rem;
        border-radius: 14px;
        display: inline-grid;
        place-items: center;
        flex: 0 0 auto;
        background: color-mix(in srgb, var(--accent-primary) 14%, transparent);
        color: color-mix(in srgb, var(--accent-secondary) 76%, var(--text-primary) 24%);
        font-size: 1.05rem;
        font-weight: 900;
    }

    .faq-filter-button__copy {
        display: grid;
        gap: 0.25rem;
    }

        .faq-filter-button__copy strong {
            font-size: 0.96rem;
            line-height: 1.2;
        }

        .faq-filter-button__copy small {
            color: var(--text-secondary);
            line-height: 1.38;
            font-size: 0.78rem;
        }

    .faq-section {
        display: flex;
        flex-direction: column;
        gap: 0.8rem;
        margin-top: 0.2rem;
    }

    .faq-section-label {
        margin: 0 0 0.1rem;
        padding: 0 0.15rem;
        font-size: 0.92rem;
        font-weight: 800;
        letter-spacing: 0.02em;
        color: var(--text-secondary);
    }

    .faq-section details {
        border-radius: 18px;
        border: 1px solid color-mix(in srgb, var(--border-color) 84%, rgba(75, 108, 183, 0.14) 16%);
        padding: 0;
        background: color-mix(in srgb, var(--bg-card) 94%, rgba(255,255,255,.06) 6%);
        overflow: hidden;
        transition: border-color .16s ease, box-shadow .16s ease, transform .16s ease;
    }

        .faq-section details[open] {
            border-color: color-mix(in srgb, var(--accent-primary) 34%, var(--border-color) 66%);
            box-shadow: 0 16px 34px rgba(15, 23, 42, 0.08);
        }

    .faq-section summary {
        position: relative;
        font-weight: 700;
        cursor: pointer;
        list-style: none;
        padding: 1rem 3.25rem 1rem 1rem;
        line-height: 1.42;
    }

        .faq-section summary::-webkit-details-marker {
            display: none;
        }

        .faq-section summary::after {
            content: "+";
            position: absolute;
            right: 0.95rem;
            top: 50%;
            width: 1.8rem;
            height: 1.8rem;
            display: grid;
            place-items: center;
            border-radius: 999px;
            background: color-mix(in srgb, var(--accent-primary) 14%, transparent);
            color: color-mix(in srgb, var(--accent-secondary) 72%, var(--text-primary) 28%);
            font-size: 1rem;
            font-weight: 900;
            transform: translateY(-50%);
            transition: transform .16s ease, background-color .16s ease;
        }

    .faq-section details[open] summary::after {
        content: "−";
        transform: translateY(-50%) rotate(180deg);
    }

    .faq-section p {
        margin: 0;
        padding: 0 1rem 1rem;
        color: var(--text-secondary);
        line-height: 1.62;
    }

    :global(.faq-hit) {
        display: inline-block;
        padding: 0 0.18em;
        border-radius: 6px;
        background: rgba(255, 214, 10, 0.28);
    }

    @media (max-width: 860px) {
        .legal-page {
            margin-top: 1.8rem;
            padding: 0.95rem 0.9rem 2.5rem;
        }

        .faq-header__inner {
            padding: 0;
        }

        .faq-hero {
            grid-template-columns: 1fr;
            padding: 1rem;
            border-radius: 20px;
        }

        .faq-hero__stats {
            grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .faq-section {
            margin-top: 0.15rem;
        }

            .faq-section summary {
                padding: 0.9rem 3rem 0.9rem 0.9rem;
            }

            .faq-section p {
                padding: 0 0.9rem 0.95rem;
            }
    }

    html.dark-mode .faq-hero {
        border-color: color-mix(in srgb, rgba(99, 102, 241, 0.18) 46%, var(--border-color) 54%);
        box-shadow: 0 20px 44px rgba(2, 6, 23, 0.34);
    }

    html.dark-mode .faq-hero {
        background: radial-gradient(circle at top right, rgba(129, 140, 248, 0.18), transparent 36%), linear-gradient(180deg, rgba(11, 20, 48, 0.96), rgba(7, 11, 24, 0.98));
    }

    html.dark-mode .faq-stat,
    html.dark-mode .faq-filter-button,
    html.dark-mode .faq-section details {
        background: color-mix(in srgb, rgba(11, 20, 48, 0.96) 88%, rgba(129, 140, 248, 0.08) 12%);
        border-color: color-mix(in srgb, rgba(99, 102, 241, 0.2) 40%, var(--border-color) 60%);
    }

        html.dark-mode .faq-filter-button.active {
            background: radial-gradient(circle at top right, rgba(129, 140, 248, 0.16), transparent 40%), linear-gradient(180deg, rgba(11, 20, 48, 0.98), rgba(16, 24, 40, 0.98));
        }

    html.dark-mode .faq-filter-button__icon,
    html.dark-mode .faq-section summary::after,
    html.dark-mode .faq-kicker {
        background: rgba(129, 140, 248, 0.18);
        color: #dbeafe;
    }

    html.dark-mode .faq-no-results {
        background: color-mix(in srgb, rgba(245, 158, 11, 0.12) 36%, rgba(11, 20, 48, 0.88) 64%);
    }
</style>
