<template>
    <div class="cardio-runner-burst" aria-hidden="true">
        <svg viewBox="0 0 120 120" class="cardio-runner-burst__svg" role="presentation">
            <g class="runner-trails">
                <path d="M10 86 C18 82, 28 82, 38 86" class="runner-trail runner-trail--one" />
                <path d="M6 98 C16 94, 27 94, 40 98" class="runner-trail runner-trail--two" />
            </g>

            <g class="runner-rig" transform="translate(28 14)">
                <g class="runner-core">
                    <animateTransform
                        attributeName="transform"
                        type="translate"
                        values="0 0; 0 -1.5; 0 0"
                        dur="0.68s"
                        repeatCount="indefinite" />
                    <circle cx="36" cy="9" r="6.5" class="runner-head" />
                    <path d="M34 18 L26 34 L34 53" class="runner-stroke runner-torso" />
                </g>

                <g class="runner-arm runner-arm--back" transform="translate(27 30)">
                    <animateTransform
                        attributeName="transform"
                        additive="sum"
                        type="rotate"
                        values="-24 0 0; 20 0 0; -24 0 0"
                        dur="0.68s"
                        repeatCount="indefinite" />
                    <path d="M0 0 L0 18" class="runner-stroke" />
                    <g transform="translate(0 16)">
                        <animateTransform
                            attributeName="transform"
                            additive="sum"
                            type="rotate"
                            values="12 0 0; -12 0 0; 12 0 0"
                            dur="0.68s"
                            repeatCount="indefinite" />
                        <path d="M0 0 L0 15" class="runner-stroke" />
                    </g>
                </g>

                <g class="runner-arm runner-arm--front" transform="translate(27 30)">
                    <animateTransform
                        attributeName="transform"
                        additive="sum"
                        type="rotate"
                        values="28 0 0; -20 0 0; 28 0 0"
                        dur="0.68s"
                        repeatCount="indefinite" />
                    <path d="M0 0 L0 18" class="runner-stroke" />
                    <g transform="translate(0 16)">
                        <animateTransform
                            attributeName="transform"
                            additive="sum"
                            type="rotate"
                            values="-10 0 0; 14 0 0; -10 0 0"
                            dur="0.68s"
                            repeatCount="indefinite" />
                        <path d="M0 0 L0 15" class="runner-stroke" />
                    </g>
                </g>

                <g class="runner-leg runner-leg--back" transform="translate(34 53)">
                    <animateTransform
                        attributeName="transform"
                        additive="sum"
                        type="rotate"
                        values="-12 0 0; 22 0 0; -12 0 0"
                        dur="0.68s"
                        repeatCount="indefinite" />
                    <path d="M0 0 L0 28" class="runner-stroke" />
                    <g transform="translate(0 26)">
                        <animateTransform
                            attributeName="transform"
                            additive="sum"
                            type="rotate"
                            values="18 0 0; -8 0 0; 18 0 0"
                            dur="0.68s"
                            repeatCount="indefinite" />
                        <path d="M0 0 L0 24" class="runner-stroke" />
                        <g transform="translate(0 22)">
                            <animateTransform
                                attributeName="transform"
                                additive="sum"
                                type="rotate"
                                values="4 0 0; -8 0 0; 4 0 0"
                                dur="0.68s"
                                repeatCount="indefinite" />
                            <path d="M0 0 L13 0" class="runner-stroke runner-foot" />
                        </g>
                    </g>
                </g>

                <g class="runner-leg runner-leg--front" transform="translate(34 53)">
                    <animateTransform
                        attributeName="transform"
                        additive="sum"
                        type="rotate"
                        values="24 0 0; -14 0 0; 24 0 0"
                        dur="0.68s"
                        repeatCount="indefinite" />
                    <path d="M0 0 L0 28" class="runner-stroke" />
                    <g transform="translate(0 26)">
                        <animateTransform
                            attributeName="transform"
                            additive="sum"
                            type="rotate"
                            values="8 0 0; 34 0 0; 8 0 0"
                            dur="0.68s"
                            repeatCount="indefinite" />
                        <path d="M0 0 L0 24" class="runner-stroke" />
                        <g transform="translate(0 22)">
                            <animateTransform
                                attributeName="transform"
                                additive="sum"
                                type="rotate"
                                values="2 0 0; -12 0 0; 2 0 0"
                                dur="0.68s"
                                repeatCount="indefinite" />
                            <path d="M0 0 L14 0" class="runner-stroke runner-foot" />
                        </g>
                    </g>
                </g>
            </g>
        </svg>
    </div>
</template>

<style scoped>
    .cardio-runner-burst {
        position: relative;
        width: 100%;
        height: 100%;
        color: inherit;
    }

    .cardio-runner-burst__svg {
        width: 100%;
        height: 100%;
        overflow: visible;
    }

    .runner-stroke {
        fill: none;
        stroke: currentColor;
        stroke-width: 6;
        stroke-linecap: round;
        stroke-linejoin: round;
    }

    .runner-head {
        fill: currentColor;
    }

    .runner-foot {
        stroke-width: 5.5;
    }

    .runner-leg--front,
    .runner-arm--front {
        opacity: 1;
    }

    .runner-leg--back,
    .runner-arm--back {
        opacity: 0.78;
    }

    .runner-trail {
        fill: none;
        stroke: currentColor;
        stroke-width: 4;
        stroke-linecap: round;
        opacity: 0.18;
    }

    .runner-trail--one {
        animation: runner-trail-one 0.68s linear infinite;
    }

    .runner-trail--two {
        animation: runner-trail-two 0.68s linear infinite;
    }

    @keyframes runner-trail-one {
        0% {
            opacity: 0;
            transform: translateX(8px);
        }
        35% {
            opacity: 0.18;
        }
        100% {
            opacity: 0;
            transform: translateX(-4px);
        }
    }

    @keyframes runner-trail-two {
        0%, 18% {
            opacity: 0;
            transform: translateX(10px);
        }
        55% {
            opacity: 0.14;
        }
        100% {
            opacity: 0;
            transform: translateX(-6px);
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .runner-trail {
            animation: none;
        }
    }
</style>
