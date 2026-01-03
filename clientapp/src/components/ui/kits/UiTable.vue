<template>
    <div class="tyg-table" :class="[{ 'is-compact': density === 'compact' }, variant !== 'default' ? variant : null]">
        <div class="table-scroll">
            <slot />
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    density?: 'normal' | 'compact'
    variant?: 'default' | 'narrow'
}>()
</script>

<style>

    .tyg-table {
        /* Resizer defaults (table-local statt :root) */
        --resize-hit: 10px;
        --resize-line: 1px;
        --resize-line-hover: 2px;
        --resize-color: #94a3b8;
        --resize-color-hover: #60a5fa;
        border-radius: 14px;
        overflow: hidden;
        border: 1px solid rgba(148, 163, 184, 0.26);
        background: radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 9%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 7%, transparent), transparent 60%), color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
        box-shadow: 0 16px 38px rgba(15, 23, 42, 0.18);
    }

    html.dark-mode .tyg-table {
        --resize-color: #64748b;
        --resize-color-hover: #3b82f6;
        border-color: rgba(148, 163, 184, 0.38);
        background: radial-gradient(circle at top left, color-mix(in srgb, #6366f1 14%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, #22c55e 10%, transparent), transparent 60%), rgba(2, 6, 23, 0.78);
        box-shadow: 0 20px 55px rgba(0, 0, 0, 0.55);
    }

    /* Scroll wrapper */
    .tyg-table .table-scroll {
        overflow-x: auto;
        overflow-y: hidden;
        max-width: 100%;
        -webkit-overflow-scrolling: touch;
    }

        /* Table base */
        .tyg-table .table-scroll > table {
            width: 100%;
            table-layout: fixed;
            border-collapse: separate;
            border-spacing: 0;
        }

            /* min-width per tabellentyp -> echte horizontale scrollbarkeit */
            .tyg-table .table-scroll > table[data-cols="3"] {
                min-width: 560px;
            }

            .tyg-table .table-scroll > table[data-cols="4"] {
                min-width: 720px;
            }

    /* Cells */
    .tyg-table th,
    .tyg-table td {
        padding: 0.95rem 0.75rem;
        text-align: center;
        vertical-align: middle;
        border-bottom: 1px solid rgba(148, 163, 184, 0.18);
        border-right: 1px solid rgba(148, 163, 184, 0.14);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

        .tyg-table th:last-child,
        .tyg-table td:last-child {
            border-right: 0;
            /* letzte Spalte: keine Ellipsis + genug Platz für Icon-Buttons */
            overflow: visible;
            text-overflow: clip;
            white-space: nowrap;
            min-width: 44px;
        }

    /* Training exercise-table: 1:1 Verhalten wie früher (inkl. last-child Override) */
    .tyg-table .table-scroll .exercise-table.full-width th,
    .tyg-table .table-scroll .exercise-table.full-width td,
    .tyg-table .table-scroll > table.exercise-table.full-width th,
    .tyg-table .table-scroll > table.exercise-table.full-width td {
        padding: 1.5rem !important;
        text-align: center !important;
        min-width: 0 !important;
        text-overflow: ellipsis !important;
        white-space: nowrap !important;
        overflow: hidden !important;
    }

        /* Wichtig: killt die "letzte Spalte immer min 44px + overflow visible" Logik NUR für diese Tabelle */
        .tyg-table .table-scroll .exercise-table.full-width th:last-child,
        .tyg-table .table-scroll .exercise-table.full-width td:last-child,
        .tyg-table .table-scroll > table.exercise-table.full-width th:last-child,
        .tyg-table .table-scroll > table.exercise-table.full-width td:last-child {
            min-width: 0 !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
        }

        /* First column: readable */
        .tyg-table th:first-child,
        .tyg-table td:first-child {
            text-align: left;
            padding-left: 1rem;
        }

    /* Header: dashboard look */
    .tyg-table thead th {
        background: color-mix(in srgb, var(--bg-card) 88%, #0f172a 12%);
        color: var(--text-primary);
        text-transform: uppercase;
        letter-spacing: 0.12em;
        font-size: 0.78rem;
        font-weight: 700;
        /* Header kann auf Breite reagieren */
        container-type: inline-size;
        position: relative; /* für Resizer */
    }

    html.dark-mode .tyg-table thead th {
        background: rgba(15, 23, 42, 0.96);
        color: #fff;
    }

    /* Zebra + hover */
    .tyg-table tbody tr:nth-child(even) td {
        background: color-mix(in srgb, var(--bg-card) 96%, #0f172a 4%);
    }

    html.dark-mode .tyg-table tbody tr:nth-child(even) td {
        background: rgba(15, 23, 42, 0.78);
    }

    .tyg-table tbody tr:hover td {
        background: color-mix(in srgb, var(--bg-card) 86%, var(--accent-primary) 14%);
        color: var(--text-primary);
    }

    html.dark-mode .tyg-table tbody tr:hover td {
        background: color-mix(in srgb, rgba(15, 23, 42, 0.92) 82%, #6366f1 18%);
        color: #fff;
    }

    /* Density */
    .tyg-table.is-compact th,
    .tyg-table.is-compact td {
        padding: 0.9rem 0.55rem;
        font-size: 0.9rem;
        line-height: 1.25;
    }

    /* Variant: narrow (mehr Umbruch in erster Spalte) */
    .tyg-table.narrow td:first-child,
    .tyg-table.narrow th:first-child {
        white-space: normal;
        word-break: break-word;
        hyphens: auto;
    }

    /* Action cell */
    .tyg-table td.action-cell {
        text-align: center;
    }

    .tyg-table .table-delete-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        margin: 0 auto;
        line-height: 1;
    }

    /* Optional: Zelle als eigener Container (dein .v-stack usecase) */
    .tyg-table .v-stack {
        container-type: inline-size;
        white-space: normal;
        word-break: break-word;
        hyphens: auto;
    }

    /* ===== Resizer (Spalten) – unterstützt beide Markup-Varianten ===== */
    body.is-resizing-col {
        cursor: col-resize;
        user-select: none;
    }

    body.is-resizing-row {
        cursor: row-resize;
        user-select: none;
    }

    /* Variante B: <span class="th-text"><span class="resizer"/></span> */
    .tyg-table thead th .th-text {
        position: relative;
        display: block;
        overflow: hidden;
        padding-right: 8px;
    }

        .tyg-table thead th .th-text > .resizer {
            position: absolute;
            top: 0;
            right: 0;
            width: var(--resize-hit);
            height: 100%;
            cursor: col-resize;
            z-index: 5;
            background: transparent;
            touch-action: none;
        }

            .tyg-table thead th .th-text > .resizer::before {
                content: "";
                width: var(--resize-line);
                height: 100%;
                background: var(--resize-color);
                opacity: .7;
                transition: transform .12s ease, background-color .12s ease, opacity .12s ease;
                display: block;
                margin-left: auto;
            }

            .tyg-table thead th .th-text > .resizer:hover::before,
            .tyg-table thead th .th-text > .resizer.is-active::before {
                background: var(--resize-color-hover);
                opacity: 1;
                transform: scaleX(2);
            }

    /* ===== Resizer (Zeilen) ===== */
    .tyg-table tr.resizable-row {
        position: relative;
    }

        .tyg-table tr.resizable-row > .row-resizer {
            position: absolute;
            left: 0;
            bottom: -4px;
            width: 100%;
            height: var(--resize-hit);
            cursor: row-resize;
            z-index: 3;
            display: flex;
            align-items: flex-end;
            justify-content: center;
            background: transparent;
        }

            .tyg-table tr.resizable-row > .row-resizer::before {
                content: "";
                display: block;
                height: var(--resize-line);
                width: 60%;
                background: var(--resize-color);
                opacity: .7;
                transition: height .12s ease, background-color .12s ease, opacity .12s ease;
                border-radius: 1px;
            }

            .tyg-table tr.resizable-row > .row-resizer:hover::before,
            .tyg-table tr.resizable-row > .row-resizer.is-active::before {
                height: var(--resize-line-hover);
                background: var(--resize-color-hover);
                opacity: 1;
            }

    /* Header-Kürzung: zeigt je nach Klasse genau EINS */
    .tyg-table .th-label .full,
    .tyg-table .th-label .mid,
    .tyg-table .th-label .short {
        display: none;
    }

    .tyg-table .th-label.is-full .full {
        display: inline;
    }

    .tyg-table .th-label.is-mid .mid {
        display: inline;
    }

    .tyg-table .th-label.is-short .short {
        display: inline;
    }

    /* sanfter Fokusrahmen (z.B. tryFocusFromStorage) */
    .tyg-table .flash-focus {
        outline: 2px solid var(--accent-primary);
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-primary) 55%, transparent), 0 0 18px var(--accent-hover);
        transition: box-shadow .3s ease;
    }

    /* ===== Live-Preview Table Tweaks (falls Preview-Card Table auch <Table> nutzt) ===== */
    .preview-card .tyg-table .table-scroll > table {
        width: max-content;
        max-width: 100%;
        min-width: 540px;
    }

    @media (max-width: 560px) {
        .preview-card .tyg-table .table-scroll > table {
            min-width: 500px;
        }
    }

    /* Compact in preview: etwas mehr vertikale Luft */
    .preview-card .tyg-table.is-compact th,
    .preview-card .tyg-table.is-compact td {
        padding: 1.0rem 0.4rem;
        font-size: .9rem;
        line-height: 1.25;
    }

    .preview-card .tyg-table .th-text {
        line-height: 1.25;
    }

    .tyg-table .table-scroll > table.exercise-table.full-width th,
    .tyg-table .table-scroll > table.exercise-table.full-width td {
        padding: 1.5rem;
        text-align: center;
        min-width: 0;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
</style>
