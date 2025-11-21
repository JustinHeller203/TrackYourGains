<!--Tutorial.vue-->
<template>
    <div class="tutorials" :class="{ 'dark-mode': darkMode }">
        <h2 class="page-title">ðŸŽ¥ Ãœbungstutorials</h2>
        <div class="search-and-filter">
            <input v-model="searchQuery" placeholder="Tutorial suchen..." class="search-bar" />
            <select v-model="selectedCategory" class="category-filter">
                <option value="">Alle Kategorien</option>
                <option value="OberkÃ¶rper">OberkÃ¶rper</option>
                <option value="UnterkÃ¶rper">UnterkÃ¶rper</option>
                <option value="GanzkÃ¶rper">GanzkÃ¶rper</option>
            </select>
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
                        <p>Video wird bald hinzugefÃ¼gt</p>
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
    const selectedCategory = ref('');
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
                title: 'BankdrÃ¼cken',
                description: 'Lerne die korrekte Technik fÃ¼r BankdrÃ¼cken.',
                videoUrl: 'https://www.youtube.com/embed/vthMCtgVtFw',
                category: 'OberkÃ¶rper'
            },
            {
                id: 2,
                title: 'Kniebeugen',
                description: 'Meistere die Kniebeuge fÃ¼r starke Beine.',
                videoUrl: 'https://www.youtube.com/embed/ultWZbUMPL8',
                category: 'UnterkÃ¶rper'
            },
            {
                id: 3,
                title: 'Kreuzheben',
                description: 'Perfektioniere deine Kreuzhebe-Technik.',
                videoUrl: 'https://www.youtube.com/embed/VL5Ab0T07e4',
                category: 'GanzkÃ¶rper'
            },
            {
                id: 4,
                title: 'SchulterdrÃ¼cken',
                description: 'StÃ¤rke deine Schultern mit dieser Ãœbung.',
                videoUrl: 'https://www.youtube.com/embed/2H6FQKVjWrE',
                category: 'OberkÃ¶rper'
            },
            {
                id: 5,
                title: 'KlimmzÃ¼ge',
                description: 'Bau deinen RÃ¼cken mit KlimmzÃ¼gen auf.',
                videoUrl: 'https://www.youtube.com/embed/eGo4IYlbE5g',
                category: 'OberkÃ¶rper'
            },
            {
                id: 6,
                title: 'Ausfallschritte',
                description: 'Form deine Beine und deinen Po mit Ausfallschritten.',
                videoUrl: 'https://www.youtube.com/embed/QOVaHwm-Q6U',
                category: 'UnterkÃ¶rper'
            },
            {
                id: 7,
                title: 'Plank',
                description: 'StÃ¤rke deine Core-Muskulatur mit dem Plank.',
                videoUrl: 'https://www.youtube.com/embed/pSHjTRCQxIw',
                category: 'GanzkÃ¶rper'
            },
            {
                id: 8,
                title: 'Bizepscurls',
                description: 'Trainiere deine Arme mit Curls.',
                videoUrl: 'https://www.youtube.com/embed/ykJmrZ5v0Oo',
                category: 'OberkÃ¶rper'
            },
            {
                id: 9,
                title: 'Beinpresse',
                description: 'KrÃ¤ftige deine Beine an der Beinpresse.',
                videoUrl: null,
                category: 'UnterkÃ¶rper'
            },
            {
                id: 10,
                title: 'Burpees',
                description: 'GanzkÃ¶rper-KillerÃ¼bung fÃ¼r Ausdauer und Kraft.',
                videoUrl: 'https://www.youtube.com/embed/dZgVxmf6jkA',
                category: 'GanzkÃ¶rper'
            }
        ];
        loading.value = false;
    });

    const filteredTutorials = computed(() => {
        return tutorials.value.filter(tutorial => {
            const matchesSearchQuery = tutorial.title.toLowerCase().includes(searchQuery.value.toLowerCase());
            const matchesCategory = selectedCategory.value ? tutorial.category === selectedCategory.value : true;
            return matchesSearchQuery && matchesCategory;
        });
    });
</script>

<style scoped>
    .tutorials {
        padding: 2rem;
        background: var(--bg-primary);
        overflow-x: hidden; /* âŸµ verhindert seitliches Wischen */
        max-width: 100%;
    }

        .tutorials.dark-mode {
            background: #0d1117;
        }

    .page-title {
        font-size: 2.5rem;
        font-weight: 800;
        background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 1.5rem;
    }

        .page-title.dark-mode {
            background: linear-gradient(135deg, #6B8DD6, #4B6CB7);
        }

    .search-and-filter {
        display: flex;
        align-items: center;
        gap: .75rem; /* statt margin-right auf dem Input */
        flex-wrap: wrap; /* darf umbrechen */
        margin-bottom: 1.5rem;
    }

    .search-bar, .category-filter {
        min-width: 0;
    }
    /* dÃ¼rfen schrumpfen */

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

    .tutorial-card {
        background: var(--bg-card);
        padding: 1.25rem;
        border-radius: 12px;
        box-shadow: var(--shadow);
        transition: transform 0.3s;
        max-width: 100%;
    }

    .card-title, .card-info {
        overflow-wrap: anywhere;
        word-break: break-word;
    }


    .tutorial-card.dark-mode {
        background: #21262d;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .tutorial-card:hover {
        transform: translateY(-6px);
        box-shadow: var(--shadow-hover);
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
        width: 100% !important; /* Ã¼berschreibt evtl. Inline-Werte */
        max-width: 100%;
        aspect-ratio: 16 / 9; /* responsive HÃ¶he */
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
