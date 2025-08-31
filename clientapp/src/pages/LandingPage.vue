<template>
    <div class="landing">
        <section class="hero">
            <h1 class="hero-title">
                <span class="typed-text">{{ typedText }}</span><span class="cursor">|</span>
            </h1>
            <p class="hero-subtitle">Dein Begleiter für Fitness, Ernährung und Fortschritt. Starte jetzt und erreiche deine Ziele! 💪</p>
            <router-link to="/progress" class="cta-button">Jetzt loslegen</router-link>
        </section>
        <section class="stats">
            <h2 class="section-title">Deine Erfolge 🏆</h2>
            <div class="stats-grid">
                <div class="stat-card">
                    <span class="stat-number">42</span>
                    <p class="stat-text">Workouts abgeschlossen</p>
                </div>
                <div class="stat-card">
                    <span class="stat-number">15</span>
                    <p class="stat-text">Mahlzeiten geplant</p>
                </div>
                <div class="stat-card">
                    <span class="stat-number">3</span>
                    <p class="stat-text">Kilo abgenommen</p>
                </div>
            </div>
        </section>
        <section class="features">
            <h2 class="section-title">Alles, was du brauchst 🌟</h2>
            <div class="features-grid">
                <div class="feature-card">
                    <h3 class="feature-title">🏋️‍♂️ Training</h3>
                    <p class="feature-text">Plane Workouts, die dich voranbringen.</p>
                </div>
                <div class="feature-card">
                    <h3 class="feature-title">🍎 Ernährung</h3>
                    <p class="feature-text">Tracke Mahlzeiten für maximale Energie.</p>
                </div>
                <div class="feature-card">
                    <h3 class="feature-title">📈 Fortschritt</h3>
                    <p class="feature-text">Sieh deine Erfolge auf einen Blick.</p>
                </div>
                <div class="feature-card">
                    <h3 class="feature-title">🎥 Tutorials</h3>
                    <p class="feature-text">Lerne Techniken wie ein Profi.</p>
                </div>
            </div>
        </section>
        <section class="quick-links">
            <h2 class="section-title">Schnellstart ⚡</h2>
            <div class="links-grid">
                <router-link to="/training" class="link-button">Trainingsplan erstellen</router-link>
                <router-link to="/nutrition" class="link-button">Mahlzeit planen</router-link>
                <router-link to="/progress" class="link-button">Fortschritt ansehen</router-link>
            </div>
        </section>
        <section class="testimonials">
            <h2 class="section-title">Was unsere Nutzer sagen 🗣️</h2>
            <div class="testimonials-grid">
                <div class="testimonial-card">
                    <p class="testimonial-text">"TrackYourGains hat mir geholfen, meine Fitnessziele zu erreichen! 🎯"</p>
                    <p class="testimonial-author">- Max Mustermann</p>
                </div>
                <div class="testimonial-card">
                    <p class="testimonial-text">"Ich liebe die Ernährungs-Tracking-Funktion. Sie ist so einfach zu bedienen! 🍴"</p>
                    <p class="testimonial-author">- Anna Beispiel</p>
                </div>
            </div>
        </section>
        <section class="blog">
            <h2 class="section-title">Aktuelle Blogbeiträge 📚</h2>
            <div class="blog-grid">
                <div class="blog-card">
                    <h3 class="blog-title">Wie du deine Fitnessziele erreichst 🏆</h3>
                    <p class="blog-text">Erfahre, wie du mit TrackYourGains deine Fitnessziele erreichen kannst.</p>
                </div>
                <div class="blog-card">
                    <h3 class="blog-title">Tipps für bessere Ernährung 🍎</h3>
                    <p class="blog-text">Lerne, wie du deine Mahlzeiten optimierst.</p>
                </div>
            </div>
        </section>
        <section class="cta">
            <h2 class="section-title">Bereit für deine Transformation? 🌟</h2>
            <router-link to="/progress" class="cta-button">Los geht’s! 🚀</router-link>
        </section>
    </div>
</template>

<script setup lang="ts">
    import { ref, onMounted } from 'vue'

    const typedText = ref('')
    const fullText = 'TrackYourGains'
    let index = 0

    const typeText = () => {
        if (index < fullText.length) {
            typedText.value += fullText.charAt(index)
            index++
            setTimeout(typeText, 100)
        }
    }

    onMounted(() => {
        typeText()
    })
</script>

<style scoped>
    .landing {
        font-family: 'Inter', sans-serif;
        background: var(--bg-primary);
    }

        .landing.dark-mode {
            background: #0d1117;
        }

    .hero {
        min-height: 80vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 2rem 1rem;
    }

    .hero-title {
        font-size: 4rem;
        font-weight: 800;
        margin-bottom: 1.5rem;
        background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }

        .hero-title.dark-mode {
            background: linear-gradient(135deg, #6B8DD6, #4B6CB7);
        }

    .hero-subtitle {
        font-size: 1.5rem;
        max-width: 600px;
        margin-bottom: 2rem;
        line-height: 1.6;
        color: var(--text-secondary);
    }

        .hero-subtitle.dark-mode {
            color: #c9d1d9;
        }

    .cta-button {
        background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
        color: #ffffff;
        padding: 1rem 2.5rem;
        border-radius: 50px;
        font-size: 1.2rem;
        font-weight: 700;
        text-decoration: none;
        box-shadow: var(--shadow);
        transition: all 0.3s ease;
    }

        .cta-button.dark-mode {
            background: linear-gradient(135deg, #6B8DD6, #4B6CB7);
        }

        .cta-button:hover {
            transform: scale(1.05);
            box-shadow: var(--shadow-hover);
            background: var(--accent-hover);
        }

        .cta-button.dark-mode:hover {
            background: #5a7bc4;
        }

    .stats, .features, .quick-links, .testimonials, .blog, .cta {
        padding: 4rem 1rem;
        max-width: 1200px;
        margin: 0 auto;
        text-align: center;
    }

        .stats.dark-mode, .features.dark-mode, .quick-links.dark-mode, .testimonials.dark-mode, .blog.dark-mode, .cta.dark-mode {
            background: #0d1117;
        }

    .section-title {
        font-size: 2.5rem;
        font-weight: 800;
        color: var(--text-primary);
        margin-bottom: 2rem;
    }

        .section-title.dark-mode {
            color: #f0f6fc;
        }

    .stats-grid, .features-grid, .links-grid, .testimonials-grid, .blog-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
    }

    .stat-card {
        background: var(--bg-card);
        padding: 1.5rem;
        border-radius: 12px;
        box-shadow: var(--shadow);
        transition: all 0.3s ease;
    }

        .stat-card.dark-mode {
            background: #21262d;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .stat-card:hover {
            transform: scale(1.03);
            box-shadow: var(--shadow-hover);
        }

    .stat-number {
        font-size: 2.5rem;
        font-weight: 800;
        color: var(--accent-primary);
        display: block;
        margin-bottom: 0.5rem;
    }

        .stat-number.dark-mode {
            color: #6B8DD6;
        }

    .stat-text {
        font-size: 1rem;
        color: var(--text-secondary);
    }

        .stat-text.dark-mode {
            color: #c9d1d9;
        }

    .feature-card {
        background: var(--bg-card);
        padding: 1.5rem;
        border-radius: 12px;
        box-shadow: var(--shadow);
        transition: all 0.3s ease;
    }

        .feature-card.dark-mode {
            background: #21262d;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .feature-card:hover {
            transform: scale(1.03);
            box-shadow: var(--shadow-hover);
        }

    .feature-title {
        font-size: 1.4rem;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 0.5rem;
    }

        .feature-title.dark-mode {
            color: #f0f6fc;
        }

    .feature-text {
        font-size: 1rem;
        color: var(--text-secondary);
    }

        .feature-text.dark-mode {
            color: #c9d1d9;
        }

    .testimonial-card {
        background: var(--bg-card);
        padding: 1.5rem;
        border-radius: 12px;
        box-shadow: var(--shadow);
        transition: all 0.3s ease;
    }

        .testimonial-card.dark-mode {
            background: #21262d;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .testimonial-card:hover {
            transform: scale(1.03);
            box-shadow: var(--shadow-hover);
        }

    .testimonial-text {
        font-size: 1rem;
        color: var(--text-secondary);
    }

        .testimonial-text.dark-mode {
            color: #c9d1d9;
        }

    .testimonial-author {
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-top: 0.5rem;
    }

        .testimonial-author.dark-mode {
            color: #f0f6fc;
        }

    .blog-card {
        background: var(--bg-card);
        padding: 1.5rem;
        border-radius: 12px;
        box-shadow: var(--shadow);
        transition: all 0.3s ease;
    }

        .blog-card.dark-mode {
            background: #21262d;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .blog-card:hover {
            transform: scale(1.03);
            box-shadow: var(--shadow-hover);
        }

    .blog-title {
        font-size: 1.4rem;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 0.5rem;
    }

        .blog-title.dark-mode {
            color: #f0f6fc;
        }

    .blog-text {
        font-size: 1rem;
        color: var(--text-secondary);
    }

        .blog-text.dark-mode {
            color: #c9d1d9;
        }

    .link-button {
        background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
        color: #ffffff;
        padding: 1rem;
        border-radius: 50px;
        font-size: 1rem;
        font-weight: 700;
        text-decoration: none;
        box-shadow: var(--shadow);
        transition: all 0.3s ease;
    }

        .link-button.dark-mode {
            background: linear-gradient(135deg, #6B8DD6, #4B6CB7);
        }

        .link-button:hover {
            transform: scale(1.05);
            box-shadow: var(--shadow-hover);
            background: var(--accent-hover);
        }

        .link-button.dark-mode:hover {
            background: #5a7bc4;
        }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }

        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes blink {
        0% {
            opacity: 0;
        }

        50% {
            opacity: 1;
        }

        100% {
            opacity: 0;
        }
    }

    @media (max-width: 768px) {
        .hero-title {
            font-size: 2.8rem;
        }

        .hero-subtitle {
            font-size: 1.2rem;
        }

        .cta-button {
            padding: 0.8rem 2rem;
            font-size: 1rem;
        }

        .section-title {
            font-size: 2rem;
        }

        .stats, .features, .quick-links, .testimonials, .blog, .cta {
            padding: 2rem 1rem;
        }
    }
</style>