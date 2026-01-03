import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title: string;
    description: string;
    keywords?: string;
    canonical?: string;
    ogImage?: string;
    ogType?: string;
    jsonLd?: object;
}

export const SEO = ({
    title,
    description,
    keywords,
    canonical,
    ogImage = 'https://pedalpulse.in/Logo/Logo.png',
    ogType = 'website',
    jsonLd
}: SEOProps) => {
    const siteUrl = 'https://pedalpulse.in';
    const fullTitle = `${title} | PedalPulse - Virtual Running & Cycling Challenges India`;

    return (
        <Helmet>
            {/* Primary Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="title" content={fullTitle} />
            <meta name="description" content={description} />
            {keywords && <meta name="keywords" content={keywords} />}

            {/* Canonical URL */}
            {canonical && <link rel="canonical" href={`${siteUrl}${canonical}`} />}

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={ogType} />
            <meta property="og:url" content={`${siteUrl}${canonical || ''}`} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={ogImage} />
            <meta property="og:site_name" content="PedalPulse" />
            <meta property="og:locale" content="en_IN" />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={`${siteUrl}${canonical || ''}`} />
            <meta property="twitter:title" content={fullTitle} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:image" content={ogImage} />

            {/* Additional Meta */}
            <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
            <meta name="author" content="PedalPulse" />
            <meta name="geo.region" content="IN" />
            <meta name="geo.placename" content="India" />

            {/* JSON-LD Structured Data */}
            {jsonLd && (
                <script type="application/ld+json">
                    {JSON.stringify(jsonLd)}
                </script>
            )}
        </Helmet>
    );
};
