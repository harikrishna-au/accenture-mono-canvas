import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    name?: string;
    type?: string;
    keywords?: string;
    canonical?: string;
    image?: string;
    publishedTime?: string;
    authorName?: string;
    jsonLd?: object | object[];
}

const SEO = ({
    title = "Harry The Blaze",
    description = "Cognitive skill training platform for MNC assessments — game-based aptitude and communication simulations",
    name = "Harry The Blaze",
    type = "website",
    keywords = "Harry the Blaze, cognitive assessment, MNC practice, aptitude training, game-based assessment, communication round, placement preparation",
    canonical,
    image = "https://www.harrytheblaze.site/og-image.png",
    publishedTime,
    authorName,
    jsonLd,
}: SEOProps) => {
    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{title}</title>
            <meta name='description' content={description} />
            <meta name='keywords' content={keywords} />
            {canonical && <link rel="canonical" href={canonical} />}

            {/* Open Graph */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            {canonical && <meta property="og:url" content={canonical} />}
            <meta property="og:site_name" content="Harry The Blaze" />
            {publishedTime && <meta property="article:published_time" content={publishedTime} />}
            {authorName && <meta property="article:author" content={authorName} />}

            {/* Twitter Card */}
            <meta name="twitter:creator" content={authorName ?? name} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />

            {/* JSON-LD Structured Data */}
            {jsonLd && (
                <script type="application/ld+json">
                    {JSON.stringify(Array.isArray(jsonLd) ? jsonLd : jsonLd)}
                </script>
            )}
        </Helmet>
    );
};

export default SEO;
