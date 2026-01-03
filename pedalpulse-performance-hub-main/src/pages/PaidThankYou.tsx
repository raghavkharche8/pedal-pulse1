import { motion } from 'framer-motion';
import {
    Check,
    Mail,
    Calendar,
    Clock,
    Medal,
    ArrowRight,
    Sparkles,
    FileText,
    Truck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';

const PaidThankYou = () => {
    return (
        <div className="min-h-screen bg-background">
            <Header />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
                {/* Background decorations */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-100/50 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
                </div>

                <div className="container-premium relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-3xl mx-auto text-center"
                    >
                        {/* Success Icon */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="relative w-24 h-24 mx-auto mb-8"
                        >
                            <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-30" />
                            <div className="relative w-full h-full bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                                <Check className="w-12 h-12 text-white" strokeWidth={3} />
                            </div>
                        </motion.div>

                        {/* Celebration Text */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-700 text-sm font-bold mb-6">
                                <Sparkles className="w-4 h-4" />
                                Premium Registration Confirmed
                            </div>

                            <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-slate-900 mb-6 tracking-tight">
                                You're All Set! 🎉
                            </h1>

                            <p className="text-xl text-slate-600 mb-4 max-w-2xl mx-auto">
                                Thank you for joining the <strong>Republic Day Virtual Challenge 2026</strong>.
                                Your premium registration is confirmed!
                            </p>

                            <p className="text-lg text-slate-500 mb-8">
                                All details and updates will be sent to your registered email address.
                            </p>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* What's Next Section */}
            <section className="py-16 bg-white">
                <div className="container-premium">
                    <div className="max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-12"
                        >
                            <h2 className="font-display font-bold text-2xl md:text-3xl text-slate-900 mb-3">
                                What Happens Next?
                            </h2>
                            <p className="text-slate-600">
                                Here's everything you need to know about the challenge
                            </p>
                        </motion.div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Email Confirmation */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="bg-slate-50 rounded-2xl p-6 border border-slate-100"
                            >
                                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                                    <Mail className="w-6 h-6 text-blue-600" />
                                </div>
                                <h3 className="font-display font-bold text-lg text-slate-900 mb-2">
                                    Check Your Email
                                </h3>
                                <p className="text-slate-600 text-sm">
                                    You'll receive a confirmation email with your registration details,
                                    receipt, and all instructions for the challenge.
                                </p>
                            </motion.div>

                            {/* Challenge Dates */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="bg-slate-50 rounded-2xl p-6 border border-slate-100"
                            >
                                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mb-4">
                                    <Calendar className="w-6 h-6 text-green-600" />
                                </div>
                                <h3 className="font-display font-bold text-lg text-slate-900 mb-2">
                                    Challenge Period
                                </h3>
                                <p className="text-slate-600 text-sm">
                                    Complete your chosen activity between <strong>26 January - 1 February 2026</strong>.
                                    You can complete it on any ONE day during this period.
                                </p>
                            </motion.div>

                            {/* Proof Submission */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 }}
                                className="bg-slate-50 rounded-2xl p-6 border border-slate-100"
                            >
                                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center mb-4">
                                    <FileText className="w-6 h-6 text-orange-600" />
                                </div>
                                <h3 className="font-display font-bold text-lg text-slate-900 mb-2">
                                    Submit Your Proof
                                </h3>
                                <p className="text-slate-600 text-sm">
                                    After completing your activity, submit your proof (Strava screenshot,
                                    app data, or console display photo) via the link in your email.
                                </p>
                            </motion.div>

                            {/* Medal Delivery */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4 }}
                                className="bg-slate-50 rounded-2xl p-6 border border-slate-100"
                            >
                                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
                                    <Truck className="w-6 h-6 text-purple-600" />
                                </div>
                                <h3 className="font-display font-bold text-lg text-slate-900 mb-2">
                                    Receive Your Medal
                                </h3>
                                <p className="text-slate-600 text-sm">
                                    Once your proof is verified, your premium finisher medal and
                                    e-certificate will be shipped within 5 working days.
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Your Premium Benefits */}
            <section className="py-16 bg-gradient-to-b from-slate-900 to-slate-800 text-white">
                <div className="container-premium">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="max-w-4xl mx-auto"
                    >
                        <div className="text-center mb-10">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 text-amber-400 text-sm font-bold mb-4 border border-amber-500/30">
                                <Medal className="w-4 h-4" />
                                Your Premium Package
                            </div>
                            <h2 className="font-display font-bold text-2xl md:text-3xl text-white">
                                Here's What You're Getting
                            </h2>
                        </div>

                        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { icon: Medal, label: 'Premium Finisher Medal', highlight: true },
                                { icon: FileText, label: 'Digital E-Certificate', highlight: false },
                                { icon: Sparkles, label: 'Customized Poster', highlight: false },
                                { icon: Truck, label: 'Free Shipping', highlight: false },
                            ].map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.1 * idx }}
                                    className={`rounded-xl p-4 text-center ${item.highlight
                                            ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30'
                                            : 'bg-white/5 border border-white/10'
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-lg mx-auto mb-3 flex items-center justify-center ${item.highlight ? 'bg-amber-500' : 'bg-white/10'
                                        }`}>
                                        <item.icon className={`w-5 h-5 ${item.highlight ? 'text-white' : 'text-slate-300'}`} />
                                    </div>
                                    <p className={`text-sm font-medium ${item.highlight ? 'text-amber-400' : 'text-slate-300'}`}>
                                        {item.label}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Important Note */}
            <section className="py-16 bg-white">
                <div className="container-premium">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="max-w-2xl mx-auto"
                    >
                        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                                <Clock className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="font-display font-bold text-lg text-blue-900 mb-2">
                                Important Reminder
                            </h3>
                            <p className="text-blue-800 text-sm mb-4">
                                Keep an eye on your email inbox (and spam folder) for updates about proof
                                submission, tracking information, and more. All communications will be
                                sent to your registered email address.
                            </p>
                            <p className="text-blue-600 text-xs">
                                Need help? Contact us on WhatsApp or email for support.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-12 bg-slate-50">
                <div className="container-premium text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <p className="text-slate-600 mb-6">
                            Share the challenge with your friends and train together!
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                asChild
                                className="bg-primary hover:bg-primary/90 text-white font-display font-semibold px-8 py-6 h-auto rounded-xl"
                            >
                                <Link to="/challenges/republic-day-challenges-2026">
                                    View Challenge Details
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                </Link>
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                className="font-display font-semibold px-8 py-6 h-auto rounded-xl"
                            >
                                <Link to="/">
                                    Back to Home
                                </Link>
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default PaidThankYou;
