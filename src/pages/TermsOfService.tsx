import PageWrapper from "@/components/PageWrapper";
import Header from "@/components/Header";

const TermsOfService = () => {
    return (
        <PageWrapper>
            <div className="min-h-screen w-full bg-neutral-50 pt-20 px-4 pb-12">
                <Header />
                <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-neutral-200">
                    <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>

                    <div className="space-y-6 text-neutral-600">
                        <section>
                            <h2 className="text-xl font-semibold text-neutral-900 mb-3">1. Acceptance of Terms</h2>
                            <p>By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-neutral-900 mb-3">2. Use License</h2>
                            <p>Permission is granted to temporarily view the materials (information or software) on this website for personal, non-commercial transitory viewing only.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-neutral-900 mb-3">3. Disclaimer</h2>
                            <p>The materials on this website are provided "as is". We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties, including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-neutral-900 mb-3">4. Limitations</h2>
                            <p>In no event shall we or our suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on this website.</p>
                        </section>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
};

export default TermsOfService;
