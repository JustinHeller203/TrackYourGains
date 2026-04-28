<template>
    <main class="legal-page">
        <h1>{{ t('privacy.title') }}</h1>

        <section>
            <h2>{{ t('privacy.controller.title') }}</h2>
            <p>
                Justin Heller<br />
                Mühlweg 2<br />
                92421 Schwandorf<br />
                {{ t('privacy.country') }}<br />
                {{ t('privacy.email') }}:
                <a href="mailto:impressum@trackyourgains-support.de">
                    impressum@trackyourgains-support.de
                </a>
            </p>
        </section>

        <section>
            <h2>{{ t('privacy.accessData.title') }}</h2>
            <p>{{ t('privacy.accessData.text1') }}</p>
            <ul>
                <li>{{ t('privacy.accessData.item1') }}</li>
                <li>{{ t('privacy.accessData.item2') }}</li>
                <li>{{ t('privacy.accessData.item3') }}</li>
                <li>{{ t('privacy.accessData.item4') }}</li>
                <li>{{ t('privacy.accessData.item5') }}</li>
                <li>{{ t('privacy.accessData.item6') }}</li>
            </ul>
            <p>{{ t('privacy.accessData.text2') }}</p>
        </section>

        <section>
            <h2>{{ t('privacy.vercel.title') }}</h2>
            <p>{{ t('privacy.vercel.text1') }}</p>
            <p>{{ t('privacy.vercel.text2') }}</p>
            <p>{{ t('privacy.vercel.text3') }}</p>
            <p>
                {{ t('privacy.vercel.text4') }}
                <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">
                    https://vercel.com/legal/privacy-policy
                </a>.
            </p>
        </section>

        <section>
            <h2>{{ t('privacy.youtube.title') }}</h2>
            <p>{{ t('privacy.youtube.text1') }}</p>
            <p>{{ t('privacy.youtube.text2') }}</p>
            <p>{{ t('privacy.youtube.text3') }}</p>
            <ul>
                <li>{{ t('privacy.youtube.item1') }}</li>
                <li>{{ t('privacy.youtube.item2') }}</li>
            </ul>
            <p>
                {{ t('privacy.youtube.text4') }}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
                    https://policies.google.com/privacy
                </a>.
            </p>
        </section>

        <section>
            <h2>{{ t('privacy.cookies.title') }}</h2>
            <p>{{ t('privacy.cookies.text1') }}</p>
            <p>{{ t('privacy.cookies.text2') }}</p>
        </section>

        <section>
            <h2>{{ t('privacy.contact.title') }}</h2>
            <p>{{ t('privacy.contact.text1') }}</p>
            <p>{{ t('privacy.contact.text2') }}</p>
        </section>

        <section>
            <h2>{{ t('privacy.storage.title') }}</h2>
            <p>{{ t('privacy.storage.text') }}</p>
        </section>

        <section>
            <h2>{{ t('privacy.rights.title') }}</h2>
            <p>{{ t('privacy.rights.text1') }}</p>
            <ul>
                <li>{{ t('privacy.rights.item1') }}</li>
                <li>{{ t('privacy.rights.item2') }}</li>
                <li>{{ t('privacy.rights.item3') }}</li>
                <li>{{ t('privacy.rights.item4') }}</li>
                <li>{{ t('privacy.rights.item5') }}</li>
                <li>{{ t('privacy.rights.item6') }}</li>
            </ul>
            <p>{{ t('privacy.rights.text2') }}</p>
        </section>

        <section>
            <h2>{{ t('privacy.update.title') }}</h2>
            <p>{{ t('privacy.update.text') }}</p>
        </section>
    </main>
</template>

<script setup lang="ts">
    import { useI18n } from '@/composables/useI18n'

    const { t } = useI18n()
</script>

<style scoped>
    .legal-page {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem 1.5rem 3rem;
        line-height: 1.6;
        font-size: 0.95rem;
    }

        .legal-page h1 {
            font-size: 1.8rem;
            margin-bottom: 1.5rem;
        }

        .legal-page h2 {
            font-size: 1.2rem;
            margin-top: 1.5rem;
            margin-bottom: 0.5rem;
        }

        .legal-page a {
            text-decoration: underline;
        }
</style>
