class I18n {
    constructor() {
        this.translations = {};
        this.supportedLanguages = ['ko', 'en', 'ja', 'es', 'pt', 'zh', 'id', 'tr', 'de', 'fr', 'hi', 'ru'];
        this.currentLang = this.detectLanguage();
    }
    detectLanguage() {
        try {
            const savedLang = localStorage.getItem('app_language');
            if (savedLang && this.supportedLanguages.includes(savedLang)) return savedLang;
        } catch (e) {}
        const browserLang = (navigator.language || 'en').split('-')[0];
        if (this.supportedLanguages.includes(browserLang)) return browserLang;
        return 'en';
    }
    async loadTranslations(lang) {
        try {
            const response = await fetch(`js/locales/${lang}.json`);
            if (!response.ok) throw new Error('Not found');
            this.translations[lang] = await response.json();
            return true;
        } catch (e) {
            if (lang !== 'en') return this.loadTranslations('en');
            return false;
        }
    }
    t(key) {
        try {
            const keys = key.split('.');
            let value = this.translations[this.currentLang];
            for (const k of keys) {
                value = value?.[k];
                if (value === undefined || value === null) return key;
            }
            return value || key;
        } catch (e) { return key; }
    }
    async setLanguage(lang) {
        if (!this.supportedLanguages.includes(lang)) return false;
        if (!this.translations[lang]) await this.loadTranslations(lang);
        this.currentLang = lang;
        try { localStorage.setItem('app_language', lang); } catch (e) {}
        document.documentElement.lang = lang;
        this.updateUI();
        return true;
    }
    updateUI() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const val = this.t(key);
            if (val && val !== key) el.textContent = val;
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            const val = this.t(key);
            if (val && val !== key) el.placeholder = val;
        });
        const titleVal = this.t('app.title');
        if (titleVal && titleVal !== 'app.title') document.title = titleVal;
        const meta = document.querySelector('meta[name="description"]');
        if (meta) {
            const descVal = this.t('app.description');
            if (descVal && descVal !== 'app.description') meta.content = descVal;
        }
    }
    getCurrentLanguage() { return this.currentLang; }
    getLanguageName(lang) {
        const names = {
            ko: '한국어', en: 'English', ja: '日本語', es: 'Español',
            pt: 'Português', zh: '简体中文', id: 'Bahasa Indonesia',
            tr: 'Türkçe', de: 'Deutsch', fr: 'Français', hi: 'हिन्दी', ru: 'Русский'
        };
        return names[lang] || lang;
    }
}
const i18n = new I18n();
