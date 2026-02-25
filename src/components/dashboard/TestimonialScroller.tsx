
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Quote } from "lucide-react";

interface Testimonial {
    text: string;
    author: string;
}

const testimonials: Testimonial[] = [
    {
        text: "Harry The Blaze is really helpful, especially for candidates who are not very familiar with the MNC assessment process, and I genuinely appreciate the effort put into creating it. However, when it comes to the AI-enabled interview feature, I felt that the questions were somewhat repetitive and mostly focused on past activities. Including a wider range of questions or more depth could make it feel closer to a real interview. Overall, the platform is useful, and the work behind it is truly appreciated.",
        author: "Aspiring Candidate",
    },
    {
        text: "Overall, my experience with the app was very good. The app is well designed and the user experience was excellent. When I attempted the assessment directly on the company’s platform, I noticed that some of the games were different compared to the practice ones. However, the way you’ve designed and structured the practice on the app is really helpful.",
        author: "User Feedback",
    },
    {
        text: "One suggestion would be to please add the updated Communication Round pattern and also include tips and strategies from Round 1 till final selection, which would be very helpful for candidates.",
        author: "Community Member",
    },
    {
        text: "Ha sir, there is no option for unselecting the bubble, if by mistake if i choose a wrong bubble it automatically moving forward even time left for that particular question. Hope u get it.. And sir its an excellant work. This bug helps to practice more hope u keep it like that only.",
        author: "Student",
    },
    {
        text: "Thanks for your portal buddy .... really helped a lot with cognitive assessment. The company conducted a selection round yesterday for on campus.",
        author: "On-Campus Student",
    },
    {
        text: "I haven’t tried the Communication Round yet. Recently, I attempted the assessment through the off-campus process, but unfortunately I couldn’t clear the gaming round. This app is a lifesaver for practice.",
        author: "Off-Campus Applicant",
    },
];

export const TestimonialScroller = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!scrollerRef.current) return;

            const scrollerContent = Array.from(scrollerRef.current.children);

            // Clone items to ensure seamless loop if needed

            gsap.to(scrollerRef.current, {
                x: "-50%",
                ease: "none",
                duration: 80, // Slower for reading long text
                repeat: -1,
            });
        },
        { scope: containerRef }
    );

    return (
        <div className="w-full py-16 overflow-hidden bg-[#fcfcf9]" ref={containerRef}>
            <div className="max-w-[100vw] relative">
                {/* Fade masks */}
                <div className="absolute left-0 top-0 bottom-0 w-12 md:w-32 z-10 bg-gradient-to-r from-[#fcfcf9] to-transparent pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-12 md:w-32 z-10 bg-gradient-to-l from-[#fcfcf9] to-transparent pointer-events-none" />

                <div className="flex w-max gap-8" ref={scrollerRef}>
                    {/* Double map for seamless loop */}
                    {[...testimonials, ...testimonials].map((t, index) => (
                        <div
                            key={index}
                            className="w-[350px] md:w-[450px] flex-shrink-0 bg-white border border-stone-100 rounded-2xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-lg transition-all hover:-translate-y-1"
                        >
                            <Quote className="w-8 h-8 text-stone-200 mb-4 fill-stone-50" />
                            <p className="text-stone-600 text-sm leading-relaxed mb-6 font-['Inter'] italic">
                                "{t.text}"
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 text-sm font-bold border border-stone-200">
                                    {t.author[0]}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-stone-800 uppercase tracking-wide">
                                        {t.author}
                                    </p>
                                    <p className="text-[10px] text-stone-400 font-medium uppercase tracking-wider">
                                        Student
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
