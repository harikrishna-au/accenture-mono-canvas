import PageWrapper from "@/components/PageWrapper";
import Header from "@/components/Header";

const RefundPolicy = () => {
    return (
        <PageWrapper>
            <div className="min-h-screen w-full bg-neutral-50 pt-20 px-4 pb-12">
                <Header />
                <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-neutral-200">
                    <h1 className="text-3xl font-bold mb-8">Refund and Cancellation Policy</h1>

                    <div className="space-y-6 text-neutral-600">
                        <section>
                            <h2 className="text-xl font-semibold text-neutral-900 mb-3">1. Refund Eligibility</h2>
                            <p>We want you to be satisfied with your purchase. However, because our products are digital goods delivered via Internet download, we generally offer no refunds.</p>
                            <p className="mt-2">If you change your mind about your purchase and you have not downloaded our product, we will happily issue you a refund upon your request.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-neutral-900 mb-3">2. Refund Requests</h2>
                            <p>Refund requests made after you have downloaded our product are handled on a case by case basis and are issued at our sole discretion. Refund requests, if any, must be made within thirty (30) days of your original purchase.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-neutral-900 mb-3">3. Cancellation</h2>
                            <p>You can cancel your subscription at any time. Your access will continue until the end of your current billing period.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-neutral-900 mb-3">4. Contact Us</h2>
                            <p>If you have any questions about our Returns and Refunds Policy, please contact us by email.</p>
                        </section>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
};

export default RefundPolicy;
