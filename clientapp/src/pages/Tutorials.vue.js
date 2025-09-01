import { ref, computed, onMounted } from 'vue';
const searchQuery = ref('');
const selectedCategory = ref('');
const loading = ref(true);
const darkMode = ref(false);
const tutorials = ref([]);
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
    return tutorials.value.filter(tutorial => {
        const matchesSearchQuery = tutorial.title.toLowerCase().includes(searchQuery.value.toLowerCase());
        const matchesCategory = selectedCategory.value ? tutorial.category === selectedCategory.value : true;
        return matchesSearchQuery && matchesCategory;
    });
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['tutorials']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['search-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['tutorial-card']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['tutorial-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['video-placeholder']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['card-info']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['no-tutorials']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tutorials" },
    ...{ class: ({ 'dark-mode': __VLS_ctx.darkMode }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "page-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "search-and-filter" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    placeholder: "Tutorial suchen...",
    ...{ class: "search-bar" },
});
(__VLS_ctx.searchQuery);
__VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
    value: (__VLS_ctx.selectedCategory),
    ...{ class: "category-filter" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "Oberkörper",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "Unterkörper",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "Ganzkörper",
});
if (__VLS_ctx.loading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "loading-indicator" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    if (__VLS_ctx.filteredTutorials.length === 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "no-tutorials" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "tutorials-grid" },
        });
        for (const [tutorial] of __VLS_getVForSourceType((__VLS_ctx.filteredTutorials))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (tutorial.id),
                ...{ class: "tutorial-card" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
                ...{ class: "card-title" },
            });
            (tutorial.title);
            if (tutorial.videoUrl) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.iframe, __VLS_intrinsicElements.iframe)({
                    src: (tutorial.videoUrl),
                    frameborder: "0",
                    allowfullscreen: true,
                    ...{ class: "video-frame" },
                });
            }
            else {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "video-placeholder" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
            }
            __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
                ...{ class: "card-info" },
            });
            (tutorial.description);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
                ...{ class: "card-category" },
            });
            (tutorial.category);
        }
    }
}
/** @type {__VLS_StyleScopedClasses['tutorials']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['search-and-filter']} */ ;
/** @type {__VLS_StyleScopedClasses['search-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['category-filter']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['no-tutorials']} */ ;
/** @type {__VLS_StyleScopedClasses['tutorials-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['tutorial-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['video-frame']} */ ;
/** @type {__VLS_StyleScopedClasses['video-placeholder']} */ ;
/** @type {__VLS_StyleScopedClasses['card-info']} */ ;
/** @type {__VLS_StyleScopedClasses['card-category']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            searchQuery: searchQuery,
            selectedCategory: selectedCategory,
            loading: loading,
            darkMode: darkMode,
            filteredTutorials: filteredTutorials,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
