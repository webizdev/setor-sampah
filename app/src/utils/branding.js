import { supabase } from '../supabase.js';

/**
 * Initializes dynamic branding (Logo, Favicon, PWA Icon)
 * by fetching the latest profile from Supabase.
 */
export async function initDynamicBranding() {
    try {
        const { data: profile, error } = await supabase
            .from('yari_company_profile')
            .select('nama, logo_url')
            .maybeSingle();

        if (error || !profile || !profile.logo_url) return profile;

        const logoUrl = profile.logo_url;
        const appName = profile.nama || 'YARI';

        // 1. Update Title & Favicon
        document.title = appName;
        updateFavicon(logoUrl);

        // 2. Update PWA Manifest Dynamically
        updateManifest(appName, logoUrl);

        return profile;
        
    } catch (err) {
        console.error('Failed to init dynamic branding:', err);
    }
}

function updateFavicon(url) {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = url;
}

function updateManifest(name, logoUrl) {
    // Standard PWA Manifest Template
    const manifest = {
        "name": name,
        "short_name": name.split(' ')[0],
        "start_url": "/",
        "display": "standalone",
        "background_color": "#ffffff",
        "theme_color": "#0f5238",
        "description": "Aplikasi pengelolaan sampah mandiri.",
        "icons": [
            {
                "src": logoUrl,
                "sizes": "192x192",
                "type": "image/png",
                "purpose": "any"
            },
            {
                "src": logoUrl,
                "sizes": "512x512",
                "type": "image/png",
                "purpose": "maskable"
            },
            {
                "src": logoUrl,
                "sizes": "1024x1024",
                "type": "image/png",
                "purpose": "any"
            }
        ],
        "orientation": "portrait"
    };

    const stringManifest = JSON.stringify(manifest);
    const blob = new Blob([stringManifest], { type: 'application/json' });
    const manifestURL = URL.createObjectURL(blob);
    
    let link = document.querySelector("link[rel='manifest']");
    if (link) {
        link.setAttribute('href', manifestURL);
    }
}
