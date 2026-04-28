<template>
    <main class="legal-notice">
        <h1>{{ t('legalNotice.title') }}</h1>

        <section>
            <h2>{{ t('legalNotice.provider.title') }}</h2>
            <p>
                Justin Heller<br />
                Mühlweg 2<br />
                92421 Schwandorf<br />
                {{ t('legalNotice.country') }}
            </p>
        </section>

        <section>
            <h2>{{ t('legalNotice.contact.title') }}</h2>
            <p>
                {{ t('legalNotice.phone') }}: 0179 9352261<br />
                {{ t('legalNotice.email') }}:
                <a href="mailto:impressum@trackyourgains-support.de">impressum@trackyourgains-support.de</a>
            </p>
        </section>

        <section>
            <h2>{{ t('legalNotice.responsible.title') }}</h2>
            <p>
                {{ t('legalNotice.responsible.text') }}
            </p>
        </section>

        <section>
            <h2>{{ t('legalNotice.contentLiability.title') }}</h2>
            <p>
                {{ t('legalNotice.contentLiability.text') }}
            </p>
        </section>

        <section>
            <h2>{{ t('legalNotice.linkLiability.title') }}</h2>
            <p>
                {{ t('legalNotice.linkLiability.text') }}
            </p>
        </section>

        <section>
            <h2>{{ t('legalNotice.copyright.title') }}</h2>
            <p>
                {{ t('legalNotice.copyright.text') }}
            </p>
        </section>

        <section>
            <h2>{{ t('legalNotice.dispute.title') }}</h2>
            <p>
                {{ t('legalNotice.dispute.textBefore') }}
                <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">
                    https://ec.europa.eu/consumers/odr
                </a>.
                {{ t('legalNotice.dispute.textAfter') }}
            </p>
        </section>
    </main>
</template>

<script setup lang="ts">
    import { useI18n } from '@/composables/useI18n'

    const { t } = useI18n()
</script>

<style scoped>
    .legal-notice {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem 1.5rem 3rem;
        line-height: 1.6;
        font-size: 0.95rem;
    }

        .legal-notice h1 {
            font-size: 1.8rem;
            margin-bottom: 1.5rem;
        }

        .legal-notice h2 {
            font-size: 1.2rem;
            margin-top: 1.5rem;
            margin-bottom: 0.5rem;
        }

        .legal-notice a {
            text-decoration: underline;
        }
</style>
