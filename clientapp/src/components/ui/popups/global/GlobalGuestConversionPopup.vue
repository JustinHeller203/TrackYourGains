<template>
    <BasePopup :show="show"
               overlayClass="global-guest-conversion-popup"
               :showActions="false"
               @cancel="emit('close')">
        <div class="conversion-popup">
            <div class="conversion-popup__hero">
                <span class="conversion-popup__eyebrow">TrackYourGains Account</span>
                <h3 class="conversion-popup__headline">Hol mehr aus jedem Training heraus.</h3>
                <p class="conversion-popup__subline">
                    Mit Account werden Planung, Fortschritt und dein kompletter Trainingsverlauf zu einem klaren System statt zu einzelnen Momenten.
                </p>
            </div>

            <div class="conversion-popup__benefits">
                <article v-for="benefit in benefits" :key="benefit.title" class="conversion-popup__benefit">
                    <span class="conversion-popup__icon" aria-hidden="true">{{ benefit.icon }}</span>
                    <div class="conversion-popup__benefit-copy">
                        <strong>{{ benefit.title }}</strong>
                        <span>{{ benefit.text }}</span>
                    </div>
                </article>
            </div>

            <div class="conversion-popup__trust">
                <span class="conversion-popup__trust-kicker">Warum es sich lohnt</span>
                <p>
                    Deine Pläne, Gewichtsdaten, Fortschrittswerte und Trainingsentscheidungen bleiben an einem Ort und entwickeln sich mit dir weiter.
                </p>
            </div>
        </div>

        <template #actions>
            <div class="conversion-popup__actions">
                <button type="button" class="conversion-popup__later" @click="emit('later')">
                    Später
                </button>

                <PopupActionButton variant="ghost"
                                   class="conversion-popup__button conversion-popup__button--secondary"
                                   @click="emit('login')">
                    Anmelden
                </PopupActionButton>

                <PopupActionButton class="conversion-popup__button conversion-popup__button--primary"
                                   @click="emit('register')">
                    Registrieren
                </PopupActionButton>
            </div>
        </template>
    </BasePopup>
</template>

<script setup lang="ts">
    import BasePopup from '@/components/ui/popups/BasePopup.vue'
    import PopupActionButton from '@/components/ui/buttons/popup/PopupActionButton.vue'

    defineProps<{
        show: boolean
    }>()

    const emit = defineEmits<{
        (e: 'close'): void
        (e: 'later'): void
        (e: 'login'): void
        (e: 'register'): void
    }>()

    const benefits = [
        {
            icon: '01',
            title: 'Pläne und Sessions mit Verlauf',
            text: 'Behalte Trainingspläne, absolvierte Einheiten und nächste Schritte dauerhaft im Blick.',
        },
        {
            icon: '02',
            title: 'Fortschritt, der sichtbar wird',
            text: 'Gewicht, persönliche Entwicklung und Muster werden nachvollziehbar statt nur grob geschätzt.',
        },
        {
            icon: '03',
            title: 'Beschwerden smarter einordnen',
            text: 'Dokumentiere Signale aus dem Körper strukturiert und trainiere fundierter weiter.',
        },
        {
            icon: '04',
            title: 'Alles an einem Ort',
            text: 'Tutorials, Planung, Tracking und Auswertung greifen ohne Tool-Wechsel zusammen.',
        },
    ]
</script>

<style>
    .popup-overlay.global-guest-conversion-popup {
        background:
            radial-gradient(circle at top, rgba(99, 102, 241, 0.14), transparent 34%),
            rgba(2, 6, 23, 0.7);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
    }

    .popup-overlay.global-guest-conversion-popup .popup {
        width: min(720px, 94vw);
        border-color: rgba(129, 140, 248, 0.28);
        background:
            radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 16%, transparent), transparent 42%),
            radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 12%, transparent), transparent 48%),
            color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
        box-shadow: 0 36px 90px rgba(2, 6, 23, 0.48);
    }

    html.dark-mode .popup-overlay.global-guest-conversion-popup .popup {
        background:
            radial-gradient(circle at top left, rgba(99, 102, 241, 0.18), transparent 44%),
            radial-gradient(circle at bottom right, rgba(34, 197, 94, 0.12), transparent 48%),
            #020617;
        border-color: rgba(129, 140, 248, 0.34);
        box-shadow: 0 40px 110px rgba(0, 0, 0, 0.72);
    }

    .popup-overlay.global-guest-conversion-popup .popup-body {
        padding: 1.4rem 1.4rem 1rem;
    }

    .popup-overlay.global-guest-conversion-popup .popup-actions {
        padding: 0 1.4rem 1.35rem;
        border-top: none;
    }

    .conversion-popup {
        display: grid;
        gap: 1.05rem;
    }

    .conversion-popup__hero {
        display: grid;
        gap: 0.55rem;
    }

    .conversion-popup__eyebrow {
        display: inline-flex;
        width: fit-content;
        padding: 0.38rem 0.72rem;
        border-radius: 999px;
        border: 1px solid rgba(129, 140, 248, 0.28);
        background: rgba(99, 102, 241, 0.1);
        color: color-mix(in srgb, var(--accent-primary) 84%, var(--text-primary) 16%);
        font-size: 0.78rem;
        font-weight: 800;
        letter-spacing: 0.04em;
        text-transform: uppercase;
    }

    .conversion-popup__headline {
        margin: 0;
        font-size: clamp(1.85rem, 4vw, 2.7rem);
        line-height: 0.98;
        letter-spacing: -0.04em;
        font-weight: 900;
        color: var(--text-primary);
        max-width: 12ch;
    }

    .conversion-popup__subline {
        margin: 0;
        max-width: 50ch;
        color: var(--text-secondary);
        font-size: 1rem;
        line-height: 1.55;
    }

    .conversion-popup__benefits {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.85rem;
    }

    .conversion-popup__benefit {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 0.9rem;
        align-items: start;
        padding: 1rem;
        border-radius: 18px;
        border: 1px solid rgba(148, 163, 184, 0.2);
        background: rgba(255, 255, 255, 0.04);
        box-shadow: 0 14px 32px rgba(15, 23, 42, 0.14);
    }

    html.dark-mode .conversion-popup__benefit {
        background: rgba(2, 6, 23, 0.68);
        box-shadow: 0 18px 38px rgba(0, 0, 0, 0.34);
    }

    .conversion-popup__icon {
        width: 2.6rem;
        height: 2.6rem;
        display: grid;
        place-items: center;
        border-radius: 14px;
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.22), rgba(34, 197, 94, 0.16));
        border: 1px solid rgba(129, 140, 248, 0.22);
        color: var(--text-primary);
        font-size: 0.82rem;
        font-weight: 900;
        letter-spacing: 0.06em;
    }

    .conversion-popup__benefit-copy {
        display: grid;
        gap: 0.35rem;
    }

    .conversion-popup__benefit-copy strong {
        color: var(--text-primary);
        font-size: 1rem;
        line-height: 1.25;
    }

    .conversion-popup__benefit-copy span {
        color: var(--text-secondary);
        font-size: 0.92rem;
        line-height: 1.5;
    }

    .conversion-popup__trust {
        padding: 1rem 1rem 1.05rem;
        border-radius: 18px;
        border: 1px solid rgba(129, 140, 248, 0.18);
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(34, 197, 94, 0.08));
    }

    .conversion-popup__trust-kicker {
        display: inline-flex;
        margin-bottom: 0.45rem;
        font-size: 0.75rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: color-mix(in srgb, var(--accent-secondary) 70%, var(--text-primary) 30%);
    }

    .conversion-popup__trust p {
        margin: 0;
        color: var(--text-primary);
        font-size: 0.95rem;
        line-height: 1.55;
    }

    .conversion-popup__actions {
        display: grid;
        grid-template-columns: 1fr auto auto;
        gap: 0.7rem;
        align-items: center;
        width: 100%;
    }

    .conversion-popup__later,
    .conversion-popup__button {
        appearance: none;
        cursor: pointer;
        font: inherit;
        transition: transform 160ms ease, box-shadow 180ms ease, background 180ms ease, border-color 180ms ease, opacity 160ms ease;
    }

    .conversion-popup__later {
        justify-self: start;
        padding: 0.55rem 0.1rem;
        background: transparent;
        color: var(--text-secondary);
        font-size: 0.92rem;
        font-weight: 700;
    }

    .conversion-popup__button {
        min-height: 3.1rem;
        padding: 0;
        border-radius: 16px;
        letter-spacing: 0.01em;
    }

    .conversion-popup__button:deep(.pab-btn) {
        width: 100%;
        min-height: 3.1rem;
        border-radius: 16px;
        padding: 0.8rem 1.15rem;
        font-size: 0.98rem;
        font-weight: 800;
        justify-content: center;
    }

    .conversion-popup__button--secondary:deep(.pab-btn) {
        background: rgba(255, 255, 255, 0.05);
        border-color: rgba(148, 163, 184, 0.24);
        color: var(--text-primary);
    }

    .conversion-popup__button--primary:deep(.pab-btn) {
        background: linear-gradient(135deg, color-mix(in srgb, var(--accent-primary) 84%, #ffffff 16%), color-mix(in srgb, var(--accent-secondary) 72%, #ffffff 28%));
        color: #f8fafc;
        border: 1px solid rgba(129, 140, 248, 0.38);
        box-shadow: 0 16px 34px rgba(15, 23, 42, 0.24);
    }

    @media (hover: hover) {
        .conversion-popup__later:hover,
        .conversion-popup__button:hover {
            transform: translateY(-1px);
        }

        .conversion-popup__later:hover {
            color: var(--text-primary);
        }

        .conversion-popup__button--secondary:hover:deep(.pab-btn) {
            background: rgba(255, 255, 255, 0.08);
            border-color: rgba(129, 140, 248, 0.28);
            box-shadow: 0 14px 28px rgba(15, 23, 42, 0.14);
        }

        .conversion-popup__button--primary:hover:deep(.pab-btn) {
            box-shadow: 0 20px 42px rgba(15, 23, 42, 0.3);
            filter: saturate(1.04);
        }
    }

    .conversion-popup__later:focus-visible,
    .conversion-popup__button:deep(.pab-btn:focus-visible) {
        outline: none;
        box-shadow: 0 0 0 4px rgba(129, 140, 248, 0.2);
    }

    @media (max-width: 720px) {
        .popup-overlay.global-guest-conversion-popup .popup-body {
            padding: 1.15rem 1rem 0.95rem;
        }

        .popup-overlay.global-guest-conversion-popup .popup-actions {
            padding: 0 1rem 1rem;
        }

        .conversion-popup__benefits,
        .conversion-popup__actions {
            grid-template-columns: 1fr;
        }

        .conversion-popup__later {
            justify-self: center;
            order: 3;
        }

        .conversion-popup__button {
            width: 100%;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .conversion-popup__later,
        .conversion-popup__button {
            transition: none;
        }
    }
</style>
