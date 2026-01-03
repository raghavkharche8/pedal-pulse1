import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RegistrationForm from '@/components/registration/RegistrationForm';

const RepublicDayRegister = () => {
    return (
        <div className="min-h-screen bg-neutral-50 font-sans">
            <Header />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden bg-gradient-to-br from-neutral-50 via-white to-blue-50/30">
                <div className="container-premium relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-16 px-4">
                        <span className="inline-block py-2 px-5 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-[0.15em] uppercase mb-6 border border-primary/10">
                            Republic Day 2026
                        </span>

                        <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-slate-900 mb-6 tracking-tight">
                            Complete Your <span className="text-primary">Registration</span>
                        </h1>

                        <p className="font-sans text-lg text-slate-600 mb-8 max-w-xl mx-auto">
                            26 Jan - 1 Feb 2026 • Join 500+ Athletes in celebrating the spirit of India.
                        </p>

                        <div className="inline-flex items-center gap-2 text-accent-warm font-medium bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            Step 1 of 2: Details
                        </div>
                    </div>

                    <RegistrationForm />
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default RepublicDayRegister;
