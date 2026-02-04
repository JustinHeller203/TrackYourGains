<template>
    <div v-if="uiErrors.items.length" class="err-overlay" data-err-overlay>
        <div class="err-head">
            <div class="err-title">⚠️ Errors ({{ uiErrors.items.length }})</div>
            <div class="err-actions">
                <button type="button" class="err-btn" @click="copyAll()">Copy</button>
                <button type="button" class="err-btn danger" @click="clearUiErrors()">Clear</button>
            </div>
        </div>

        <div class="err-list">
            <div v-for="e in uiErrors.items" :key="e.id" class="err-item">
                <div class="err-meta">
                    <span class="chip">{{ e.source }}</span>
                    <span class="time">{{ new Date(e.at).toLocaleTimeString() }}</span>
                </div>

                <div class="err-msg">{{ e.message }}</div>

                <details v-if="e.info || e.stack" class="err-details">
                    <summary>Details</summary>
                    <pre v-if="e.info" class="pre">{{ e.info }}</pre>
                    <pre v-if="e.stack" class="pre">{{ e.stack }}</pre>
                </details>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { uiErrors, clearUiErrors } from '@/lib/errorBus'

const copyAll = async () => {
  const text = uiErrors.items
    .map(e =>
      [
        `# ${new Date(e.at).toISOString()} [${e.source}]`,
        e.message,
        e.info ? `INFO:\n${e.info}` : '',
        e.stack ? `STACK:\n${e.stack}` : '',
        '',
      ].filter(Boolean).join('\n')
    )
    .join('\n')

  try {
    await navigator.clipboard.writeText(text)
  } catch {
    // fallback: nix, user kann manuell markieren
  }
}
</script>

<style scoped>
    .err-overlay {
        position: fixed;
        top: 12px;
        right: 12px;
        width: min(520px, calc(100vw - 24px));
        max-height: min(70vh, 720px);
        overflow: hidden;
        z-index: 999999;
        border-radius: 14px;
        background: rgba(20,20,20,.92);
        color: #fff;
        box-shadow: 0 10px 30px rgba(0,0,0,.35);
        border: 1px solid rgba(255,255,255,.12);
        backdrop-filter: blur(10px);
    }

    .err-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 12px;
        border-bottom: 1px solid rgba(255,255,255,.12);
    }

    .err-title {
        font-weight: 700;
        font-size: .95rem
    }

    .err-actions {
        display: flex;
        gap: 8px
    }

    .err-btn {
        appearance: none;
        border: 0;
        cursor: pointer;
        padding: 6px 10px;
        border-radius: 10px;
        background: rgba(255,255,255,.12);
        color: #fff;
        font-weight: 600;
        font-size: .82rem;
    }

        .err-btn.danger {
            background: rgba(255,60,60,.22)
        }

    .err-list {
        overflow: auto;
        max-height: calc(70vh - 44px);
        padding: 10px 12px;
    }

    .err-item {
        padding: 10px 10px;
        border-radius: 12px;
        background: rgba(255,255,255,.06);
        border: 1px solid rgba(255,255,255,.08);
        margin-bottom: 10px;
    }

    .err-meta {
        display: flex;
        gap: 8px;
        align-items: center;
        opacity: .85;
        margin-bottom: 6px
    }

    .chip {
        font-size: .72rem;
        padding: 2px 8px;
        border-radius: 999px;
        background: rgba(255,255,255,.12);
    }

    .time {
        font-size: .75rem
    }

    .err-msg {
        font-size: .9rem;
        line-height: 1.25;
        white-space: pre-wrap
    }

    .err-details {
        margin-top: 8px
    }

    .pre {
        margin: 8px 0 0;
        padding: 8px;
        border-radius: 10px;
        background: rgba(0,0,0,.28);
        overflow: auto;
        font-size: .78rem;
        line-height: 1.2;
    }
</style>
