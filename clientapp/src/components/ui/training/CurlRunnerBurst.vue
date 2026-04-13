<template>
    <div class="curl-burst" aria-hidden="true">
        <svg viewBox="0 0 140 140" class="curl-burst__svg" role="presentation">
            <g transform="translate(28 10)">
                <circle cx="42" cy="12" r="8" class="curl-head" />
                <path d="M42 22 L42 56" class="curl-stroke" />
                <path d="M42 36 L29 52" class="curl-stroke curl-stroke--dim" />
                <path d="M42 36 L55 52" class="curl-stroke curl-stroke--dim" />

                <g transform="translate(42 38)">
                    <path d="M0 0 L-18 8" class="curl-stroke" />
                    <path d="M0 0 L18 8" class="curl-stroke" />

                    <g class="curl-forearms-barbell">
                        <animateTransform
                            attributeName="transform"
                            type="translate"
                            values="0 0; 0 -18; 0 0"
                            dur="0.95s"
                            repeatCount="indefinite" />
                        <animateTransform
                            attributeName="transform"
                            additive="sum"
                            type="scale"
                            values="1 1; 1.02 1.02; 1 1"
                            dur="0.95s"
                            repeatCount="indefinite" />
                        <path d="M-18 8 L-16 30" class="curl-stroke" />
                        <path d="M18 8 L16 30" class="curl-stroke" />
                        <path d="M-30 30 L30 30" class="curl-bar" />
                        <rect x="-36" y="20" width="4.5" height="20" rx="1.5" class="curl-plate" />
                        <rect x="-43" y="16" width="5.5" height="28" rx="1.5" class="curl-plate" />
                        <rect x="31.5" y="20" width="4.5" height="20" rx="1.5" class="curl-plate" />
                        <rect x="37.5" y="16" width="5.5" height="28" rx="1.5" class="curl-plate" />
                    </g>
                </g>

                <path d="M42 56 L31 82" class="curl-stroke" />
                <path d="M31 82 L26 110" class="curl-stroke" />
                <path d="M42 56 L53 82" class="curl-stroke" />
                <path d="M53 82 L58 110" class="curl-stroke" />
                <path d="M12 116 L72 116" class="curl-ground" />
            </g>
        </svg>
    </div>
</template>

<style scoped>
    .curl-burst {
        position: relative;
        width: 100%;
        height: 100%;
        color: inherit;
    }

    .curl-burst__svg {
        width: 100%;
        height: 100%;
        overflow: visible;
    }

    .curl-stroke,
    .curl-bar,
    .curl-ground {
        fill: none;
        stroke: currentColor;
        stroke-width: 6;
        stroke-linecap: round;
        stroke-linejoin: round;
    }

    .curl-stroke--dim {
        opacity: 0.82;
    }

    .curl-head,
    .curl-plate {
        fill: currentColor;
    }

    .curl-ground {
        stroke-width: 4;
        opacity: 0.18;
    }
</style>
