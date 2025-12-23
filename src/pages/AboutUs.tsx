import PageWrapper from "@/components/PageWrapper";
import Header from "@/components/Header";

const AboutUs = () => {
    return (
        <PageWrapper>
            <div className="min-h-screen w-full bg-neutral-50 pt-20 px-4 pb-12">
                <Header />
                <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-neutral-200">
                    <h1 className="text-3xl font-bold mb-8">About Us</h1>

                    <div className="space-y-6 text-neutral-600">
                        <section>
                            <h2 className="text-xl font-semibold text-neutral-900 mb-3">Who We Are</h2>
                            <p>We are a passionate team dedicated to creating engaging and educational interactive experiences. Our platform combines fun gameplay with cognitive challenges to help users improve their skills.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-neutral-900 mb-3">Our Mission</h2>
                            <p>Our mission is to make learning and brain training accessible and enjoyable for everyone. We believe that games can be a powerful tool for personal growth and development.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-neutral-900 mb-3">Contact</h2>
                            <p>If you have any questions or feedback, please feel free to reach out to our support team.</p>
                        </section>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
};

export default AboutUs;
