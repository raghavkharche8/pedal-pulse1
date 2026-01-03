import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const CONSENT_KEY = 'cookie_consent';

interface ConsentState {
    analytics: boolean;
    marketing: boolean;
    timestamp: string;
}

export const CookieConsent = () => {
    const [showBanner, setShowBanner] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        // Check if user has already given consent
        const consent = localStorage.getItem(CONSENT_KEY);
        if (!consent) {
            setShowBanner(true);
        } else {
            // Apply saved preferences
            const prefs: ConsentState = JSON.parse(consent);
            if (prefs.marketing) {
                enableMetaPixel();
            }
        }
    }, []);

    const enableMetaPixel = () => {
        // Re-enable Meta Pixel tracking
        if (typeof window !== 'undefined' && (window as any).fbq) {
            (window as any).fbq('consent', 'grant');
        }
    };

    const disableMetaPixel = () => {
        // Revoke Meta Pixel consent
        if (typeof window !== 'undefined' && (window as any).fbq) {
            (window as any).fbq('consent', 'revoke');
        }
    };

    const saveConsent = (analytics: boolean, marketing: boolean) => {
        const consent: ConsentState = {
            analytics,
            marketing,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));

        if (marketing) {
            enableMetaPixel();
        } else {
            disableMetaPixel();
        }

        setShowBanner(false);
    };

    const acceptAll = () => {
        saveConsent(true, true);
    };

    const acceptEssential = () => {
        saveConsent(false, false);
    };

    if (!showBanner) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-slate-200 shadow-lg">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-2">🍪 Cookie Preferences</h3>
                        <p className="text-sm text-slate-600 mb-3">
                            We use cookies to enhance your experience and analyze site usage.
                            You can customize your preferences below.
                        </p>

                        {showDetails && (
                            <div className="bg-slate-50 rounded-lg p-4 mb-3 text-sm">
                                <div className="mb-3">
                                    <p className="font-medium text-slate-800">Essential Cookies</p>
                                    <p className="text-slate-600">Required for the site to function. Cannot be disabled.</p>
                                </div>
                                <div className="mb-3">
                                    <p className="font-medium text-slate-800">Analytics Cookies</p>
                                    <p className="text-slate-600">Help us understand how you use our site.</p>
                                </div>
                                <div>
                                    <p className="font-medium text-slate-800">Marketing Cookies (Meta Pixel)</p>
                                    <p className="text-slate-600">Used for personalized advertising on Facebook/Instagram.</p>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => setShowDetails(!showDetails)}
                            className="text-sm text-primary hover:underline mb-3"
                        >
                            {showDetails ? 'Hide details' : 'Learn more'}
                        </button>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                        <Button variant="outline" size="sm" onClick={acceptEssential}>
                            Essential Only
                        </Button>
                        <Button size="sm" onClick={acceptAll}>
                            Accept All
                        </Button>
                        <button
                            onClick={acceptEssential}
                            className="p-1 text-slate-400 hover:text-slate-600"
                            aria-label="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CookieConsent;
