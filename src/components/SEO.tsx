import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    name?: string;
    type?: string;
    keywords?: string;
    canonical?: string;
}

const SEO = ({
    title = "Harry The Blaze",
    description = "Cognitive skill training platform for MNC assessments — game-based aptitude and communication simulations",
    name = "Harry The Blaze",
    type = "website",
    keywords = "Harry the Blaze, cognitive assessment, MNC practice, aptitude training, game-based assessment, communication round, placement preparation",
    canonical
}: SEOProps) => { // Use proper React functional component syntax if preferred
    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{title}</title>
            <meta name='description' content={description} />
            <meta name='keywords' content={keywords} />
            {canonical && <link rel="canonical" href={canonical} />}

            {/* End standard metadata tags */}

            {/* Facebook tags */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            {/* End Facebook tags */}

            {/* Twitter tags */}
            <meta name="twitter:creator" content={name} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            {/* End Twitter tags */}
        </Helmet>
    );
};

export default SEO;
