<!--src/pages/Tutorial.vue-->
<template>
    <div class="tutorials" :class="{ 'dark-mode': darkMode }">
        <h2 class="page-title">🎥 Übungstutorials</h2>
        <div class="search-and-filter">
            <input v-model="searchQuery" placeholder="Tutorial suchen..." class="search-bar" />
        </div>
        <div v-if="loading" class="loading-indicator">
            <p>Tutorials werden geladen...</p>
        </div>
        <div v-else>
            <div v-if="filteredTutorials.length === 0" class="no-tutorials">
                <p>Keine Tutorials gefunden.</p>
            </div>
            <div v-else class="tutorials-grid">
                <div v-for="tutorial in filteredTutorials" :key="tutorial.id" class="tutorial-card">
                    <h3 class="card-title">{{ tutorial.title }}</h3>
                    <iframe v-if="tutorial.videoUrl"
                            :src="tutorial.videoUrl"
                            class="video-frame"
                            frameborder="0"
                            allowfullscreen
                            loading="lazy"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerpolicy="strict-origin-when-cross-origin" />
                    <div v-else class="video-placeholder">
                        <p>Video wird bald hinzugefügt</p>
                    </div>
                    <p class="card-info">{{ tutorial.description }}</p>
                    <p class="card-category">{{ tutorial.category }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, computed, onMounted } from 'vue';

    const searchQuery = ref('');
    const loading = ref(true);
    const darkMode = ref(false);

    interface Tutorial {
        id: number;
        title: string;
        description: string;
        videoUrl: string | null;
        category: string;
    }

    const tutorials = ref<Tutorial[]>([]);

    onMounted(async () => {
        // Simulate loading data from an external source
        await new Promise(resolve => setTimeout(resolve, 1000));
        tutorials.value = [
            {
                id: 1,
                title: 'Bankdrücken',
                description: 'Lerne die korrekte Technik für Bankdrücken.',
                videoUrl: 'https://www.youtube.com/embed/vthMCtgVtFw',
                category: 'Oberkörper'
            },
            {
                id: 2,
                title: 'Kniebeugen',
                description: 'Meistere die Kniebeuge für starke Beine.',
                videoUrl: 'https://www.youtube.com/embed/ultWZbUMPL8',
                category: 'Unterkörper'
            },
            {
                id: 3,
                title: 'Kreuzheben',
                description: 'Perfektioniere deine Kreuzhebe-Technik.',
                videoUrl: 'https://www.youtube.com/embed/VL5Ab0T07e4',
                category: 'Ganzkörper'
            },
            {
                id: 4,
                title: 'Schulterdrücken',
                description: 'Stärke deine Schultern mit dieser Übung.',
                videoUrl: 'https://www.youtube.com/embed/2H6FQKVjWrE',
                category: 'Oberkörper'
            },
            {
                id: 5,
                title: 'Klimmzüge',
                description: 'Bau deinen Rücken mit Klimmzügen auf.',
                videoUrl: 'https://www.youtube.com/embed/eGo4IYlbE5g',
                category: 'Oberkörper'
            },
            {
                id: 6,
                title: 'Ausfallschritte',
                description: 'Form deine Beine und deinen Po mit Ausfallschritten.',
                videoUrl: 'https://www.youtube.com/embed/QOVaHwm-Q6U',
                category: 'Unterkörper'
            },
            {
                id: 7,
                title: 'Plank',
                description: 'Stärke deine Core-Muskulatur mit dem Plank.',
                videoUrl: 'https://www.youtube.com/embed/pSHjTRCQxIw',
                category: 'Ganzkörper'
            },
            {
                id: 8,
                title: 'Bizepscurls',
                description: 'Trainiere deine Arme mit Curls.',
                videoUrl: 'https://www.youtube.com/embed/ykJmrZ5v0Oo',
                category: 'Oberkörper'
            },
            {
                id: 9,
                title: 'Beinpresse',
                description: 'Kräftige deine Beine an der Beinpresse.',
                videoUrl: null,
                category: 'Unterkörper'
            },
            {
                id: 10,
                title: 'Burpees',
                description: 'Ganzkörper-Killerübung für Ausdauer und Kraft.',
                videoUrl: 'https://www.youtube.com/embed/dZgVxmf6jkA',
                category: 'Ganzkörper'
            }
        ];
        loading.value = false;
    });

    const filteredTutorials = computed(() => {
        const q = searchQuery.value.trim().toLowerCase();
        if (!q) return tutorials.value;

        return tutorials.value.filter(t =>
            t.title.toLowerCase().includes(q)
            || t.description.toLowerCase().includes(q)
            || t.category.toLowerCase().includes(q)
        );
    });
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

    .search-bar {
        width: min(520px, 100%);
    }
    .search-bar, .category-filter {
        min-width: 0;
    }
    /* dürfen schrumpfen */

    @media (max-width: 600px) {
        .page-title {
            font-size: 1.75rem;
        }
    }
    @media (max-width: 600px) {
        .tutorials {
            padding: 1rem;
        }
        /* angenehmer auf Phone */
        .search-and-filter {
            flex-direction: column;
            align-items: stretch;
        }

        .search-bar, .category-filter {
            width: 100%;
        }
    }

    .search-bar, .category-filter {
        padding: 0.5rem;
        border-radius: 8px;
        border: 1px solid var(--border-color);
    }

    .tutorials-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); /* flexibler */
        gap: 1.25rem;
        max-width: 100%;
        overflow-x: clip;
    }

        .tutorials-grid > * {
            min-width: 0;
        }

    /* Tutorial.vue – REPLACE alter .tutorial-card-Block */

    /* Premium-Card für YT-Tutorials – optisch wie workout-list / plan-card */
    .tutorial-card {
        position: relative;
        z-index: 1;
        background: radial-gradient( circle at top left, color-mix(in srgb, var(--accent-primary) 10%, transparent), transparent 56% ), radial-gradient( circle at bottom right, color-mix(in srgb, var(--accent-secondary) 8%, transparent), transparent 60% ), color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
        padding: 1.3rem 1.4rem 1.2rem;
        border-radius: 18px;
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.22);
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
            box-shadow: 0 22px 48px rgba(15, 23, 42, 0.32);
            border-color: rgba(129, 140, 248, 0.7);
        }

            .tutorial-card:hover::before {
                opacity: 1;
            }

    /* Dark-Mode Variante – same vibe wie Progress / plan-card */
    html.dark-mode .tutorial-card {
        background: radial-gradient( circle at top left, color-mix(in srgb, #6366f1 16%, transparent), transparent 55% ), radial-gradient( circle at bottom right, color-mix(in srgb, #22c55e 11%, transparent), transparent 62% ), #020617;
        border-color: rgba(148, 163, 184, 0.5);
        box-shadow: 0 22px 55px rgba(0, 0, 0, 0.7);
    }

    /* Typo sauber halten wie bei deinen anderen Cards */
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
</style>
