import { ref } from 'vue'
import { LS_APP_LANGUAGE } from '@/constants/storageKeys'
import { translateKey, translateText, type AppLocale } from '@/i18n/translations'
import { footerTranslations } from '@/i18n/footerTranslations'
import { trainingTranslations } from '@/i18n/trainingTranslations'
import { beschwerdenTranslations } from '@/i18n/beschwerdenTranslations'
import { explainTranslations } from '@/i18n/explainTranslations'
import { loginTranslations } from '@/i18n/loginTranslations'
import { stickyTranslations } from '@/i18n/stickyTranslations'

const locale = ref<AppLocale>('de')
const originalTextNodes = new WeakMap<Text, string>()
const originalAttributes = new WeakMap<Element, Map<string, string>>()

let rootElement: HTMLElement | null = null
let mutationObserver: MutationObserver | null = null
let scheduledFrame = 0

function normalizeLocale(value: unknown): AppLocale {
    return value === 'en' ? 'en' : 'de'
}

function readStoredLocale(): AppLocale {
    if (typeof window === 'undefined') return 'de'
    try {
        return normalizeLocale(localStorage.getItem(LS_APP_LANGUAGE))
    } catch {
        return 'de'
    }
}

function writeStoredLocale(value: AppLocale) {
    if (typeof window === 'undefined') return
    try {
        localStorage.setItem(LS_APP_LANGUAGE, value)
    } catch {
        // ignore storage failures
    }
}

function applyLocaleSideEffects(value: AppLocale) {
    if (typeof document === 'undefined') return
    document.documentElement.lang = value
}

function shouldSkipTextNode(node: Text) {
    const parent = node.parentElement
    if (!parent) return true
    if (parent.closest('[data-no-auto-translate="true"]')) return true
    const tagName = parent.tagName
    return tagName === 'SCRIPT' || tagName === 'STYLE'
}

function translateNodeText(node: Text) {
    if (shouldSkipTextNode(node)) return

    const source = originalTextNodes.get(node) ?? node.nodeValue ?? ''
    if (!originalTextNodes.has(node)) {
        originalTextNodes.set(node, source)
    }

    const translated = translateText(source, locale.value)
    if (node.nodeValue !== translated) {
        node.nodeValue = translated
    }
}

function translateElementAttributes(element: Element) {
    if (element.closest('[data-no-auto-translate="true"]')) return

    const attributeNames = ['placeholder', 'title', 'aria-label', 'alt'] as const
    const sourceMap = originalAttributes.get(element) ?? new Map<string, string>()

    for (const attributeName of attributeNames) {
        const current = element.getAttribute(attributeName)
        if (current == null) continue

        const source = sourceMap.get(attributeName) ?? current
        if (!sourceMap.has(attributeName)) {
            sourceMap.set(attributeName, source)
        }

        const translated = translateText(source, locale.value)
        if (current !== translated) {
            element.setAttribute(attributeName, translated)
        }
    }

    if (sourceMap.size) {
        originalAttributes.set(element, sourceMap)
    }
}

function translateTree(root: ParentNode) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    let currentNode = walker.nextNode()

    while (currentNode) {
        translateNodeText(currentNode as Text)
        currentNode = walker.nextNode()
    }

    if (root instanceof Element) {
        translateElementAttributes(root)
        root.querySelectorAll('*').forEach(translateElementAttributes)
    }
}

function scheduleDomTranslation() {
    if (typeof window === 'undefined' || !rootElement) return
    if (scheduledFrame) {
        window.cancelAnimationFrame(scheduledFrame)
    }
    scheduledFrame = window.requestAnimationFrame(() => {
        scheduledFrame = 0
        if (rootElement) {
            translateTree(rootElement)
        }
    })
}

export function forceI18nDomSync() {
    scheduleDomTranslation()
}

export function initI18n() {
    locale.value = readStoredLocale()
    applyLocaleSideEffects(locale.value)
}

export function initI18nDomSync(root: HTMLElement) {
    if (typeof window === 'undefined') return

    rootElement = root
    mutationObserver?.disconnect()
    mutationObserver = new MutationObserver(() => {
        scheduleDomTranslation()
    })
    mutationObserver.observe(root, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ['placeholder', 'title', 'aria-label', 'alt'],
    })

    scheduleDomTranslation()
}

export function useI18n() {
    function setLocale(value: AppLocale) {
        const normalized = normalizeLocale(value)
        locale.value = normalized
        writeStoredLocale(normalized)
        applyLocaleSideEffects(normalized)
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('app-language-changed', { detail: normalized }))
        }
        scheduleDomTranslation()
    }

    function t(key: string) {
        return footerTranslations[locale.value]?.[key]
            ?? footerTranslations.de[key]
            ?? trainingTranslations[locale.value]?.[key]
            ?? trainingTranslations.de[key]
            ?? beschwerdenTranslations[locale.value]?.[key]
            ?? beschwerdenTranslations.de[key]
            ?? explainTranslations[locale.value]?.[key]
            ?? explainTranslations.de[key]
            ?? loginTranslations[locale.value]?.[key]
            ?? loginTranslations.de[key]
            ?? stickyTranslations[locale.value]?.[key]
            ?? stickyTranslations.de[key]
            ?? translateKey(key, locale.value)
    }

    return {
        locale,
        setLocale,
        t,
    }
}
