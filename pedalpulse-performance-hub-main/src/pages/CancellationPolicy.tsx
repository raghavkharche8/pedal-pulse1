import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { XCircle, AlertTriangle, Shield } from 'lucide-react';

const CancellationPolicy = () => {
    return (
        <div className="min-h-screen bg-background">
            <Header />

            <div className="pt-24 pb-16 bg-gradient-to-b from-slate-50 to-white">
                <div className="container px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 text-red-700 text-sm font-semibold mb-4">
                            <XCircle className="w-4 h-4" />
                            Cancellation & Refund Policy
                        </div>
                        <h1 className="font-display font-bold text-4xl md:text-5xl text-slate-900 mb-4">
                            Cancellation & Refund Policy
                        </h1>
                        <p className="text-lg text-slate-600">
                            Last updated: January 3, 2026
                        </p>
                    </motion.div>

                    {/* Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 md:p-12 space-y-8"
                    >
                        {/* Main Policy */}
                        <section className="bg-red-50 border-2 border-red-300 rounded-xl p-6">
                            <h2 className="font-display font-bold text-2xl text-red-900 mb-4 flex items-center gap-3">
                                <Shield className="w-6 h-6" />
                                Non-Refundable & Non-Transferable Policy
                            </h2>
                            <div className="space-y-4 text-red-900">
                                <p className="font-semibold text-lg">
                                    All challenge registrations and tickets purchased on PedalPulse are <strong className="underline">strictly NON-REFUNDABLE and NON-TRANSFERABLE</strong>.
                                </p>
                                <p>
                                    Once you complete your registration and payment, the transaction is final. We do not provide refunds, credits, or transfers under any circumstances.
                                </p>
                            </div>
                        </section>

                        {/* What This Means */}
                        <section>
                            <h2 className="font-display font-bold text-2xl text-slate-900 mb-4">
                                What This Means
                            </h2>
                            <div className="space-y-3 text-slate-600">
                                <p className="flex items-start gap-2">
                                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                    <span><strong>No Refunds:</strong> If you cancel your registration for any reason, you will not receive a refund of your registration fee.</span>
                                </p>
                                <p className="flex items-start gap-2">
                                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                    <span><strong>No Transfers:</strong> Your registration cannot be transferred to another person, another challenge, or a future event.</span>
                                </p>
                                <p className="flex items-start gap-2">
                                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                    <span><strong>No Exceptions:</strong> This policy applies to all registration types (Free and Premium) and all participants.</span>
                                </p>
                            </div>
                        </section>

                        {/* Why This Policy */}
                        <section className="bg-slate-50 rounded-xl p-6">
                            <h2 className="font-display font-bold text-2xl text-slate-900 mb-4">
                                Why We Have This Policy
                            </h2>
                            <div className="space-y-3 text-slate-600">
                                <p>
                                    Virtual challenges involve significant upfront costs and planning, including:
                                </p>
                                <ul className="space-y-2 ml-6">
                                    <li className="list-disc">Production and procurement of medals and merchandise</li>
                                    <li className="list-disc">Digital infrastructure and platform maintenance</li>
                                    <li className="list-disc">E-certificate and poster design preparation</li>
                                    <li className="list-disc">Logistics and shipping arrangements</li>
                                    <li className="list-disc">Customer support and verification systems</li>
                                </ul>
                                <p className="mt-4">
                                    These costs are incurred immediately upon registration, making refunds and transfers financially impractical.
                                </p>
                            </div>
                        </section>

                        {/* Common Scenarios */}
                        <section>
                            <h2 className="font-display font-bold text-2xl text-slate-900 mb-4">
                                Common Questions
                            </h2>
                            <div className="space-y-4">
                                <div className="border-l-4 border-slate-300 pl-4">
                                    <p className="font-semibold text-slate-900 mb-1">What if I can't participate due to illness or injury?</p>
                                    <p className="text-slate-600">Unfortunately, we cannot provide refunds for personal circumstances, including medical emergencies. We recommend purchasing event insurance if available.</p>
                                </div>
                                <div className="border-l-4 border-slate-300 pl-4">
                                    <p className="font-semibold text-slate-900 mb-1">Can I defer my registration to the next challenge?</p>
                                    <p className="text-slate-600">No. Each challenge is a separate event, and registrations cannot be carried forward or deferred.</p>
                                </div>
                                <div className="border-l-4 border-slate-300 pl-4">
                                    <p className="font-semibold text-slate-900 mb-1">Can my friend participate in my place?</p>
                                    <p className="text-slate-600">No. Registrations are non-transferable. Your friend must register separately with their own email and payment.</p>
                                </div>
                                <div className="border-l-4 border-slate-300 pl-4">
                                    <p className="font-semibold text-slate-900 mb-1">What if I made a duplicate registration by mistake?</p>
                                    <p className="text-slate-600">Please contact us immediately if you believe you made an error. While we cannot guarantee a refund, we will review each case individually.</p>
                                </div>
                            </div>
                        </section>

                        {/* Event Cancellation by PedalPulse */}
                        <section className="bg-green-50 border border-green-200 rounded-xl p-6">
                            <h2 className="font-display font-bold text-2xl text-green-900 mb-4">
                                Event Cancellation by PedalPulse
                            </h2>
                            <p className="text-green-800">
                                If PedalPulse cancels a challenge due to unforeseen circumstances (natural disasters, force majeure, technical failures), all registered participants will receive a <strong>full refund (100%)</strong> within 7-10 business days. This is the <strong>only scenario</strong> where refunds are provided.
                            </p>
                        </section>

                        {/* Before You Register */}
                        <section className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                            <h2 className="font-display font-bold text-xl text-amber-900 mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" />
                                Please Read Before Registering
                            </h2>
                            <ul className="space-y-2 text-amber-900 text-sm">
                                <li className="flex items-start gap-2">
                                    <span className="font-bold mt-0.5">•</span>
                                    <span>By completing your registration, you acknowledge and agree to this Non-Refundable and Non-Transferable policy.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="font-bold mt-0.5">•</span>
                                    <span>Ensure you have reviewed all challenge details (dates, distances, requirements) before registering.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="font-bold mt-0.5">•</span>
                                    <span>Double-check your email address and shipping address as these cannot be changed after payment.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="font-bold mt-0.5">•</span>
                                    <span>If you have any questions or concerns, please contact us BEFORE completing your registration.</span>
                                </li>
                            </ul>
                        </section>

                        {/* Free Pass Note */}
                        <section className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                            <h2 className="font-display font-bold text-xl text-blue-900 mb-3">
                                Note for Free Pass Participants
                            </h2>
                            <p className="text-blue-800">
                                Free registrations do not involve payment, so there is nothing to refund. However, free registrations are also <strong>non-transferable</strong>. Each participant must register individually with their own email address.
                            </p>
                        </section>

                        {/* Contact */}
                        <section className="border-t pt-6">
                            <h2 className="font-display font-bold text-xl text-slate-900 mb-3">
                                Have Questions?
                            </h2>
                            <p className="text-slate-600">
                                If you have any questions about this policy before registering, please contact us at{' '}
                                <a href="mailto:support@pedalpulse.in" className="text-primary hover:underline font-semibold">
                                    support@pedalpulse.in
                                </a>
                            </p>
                            <p className="text-sm text-slate-500 mt-4">
                                This policy is part of our Terms of Service and is subject to applicable Indian law.
                            </p>
                        </section>
                    </motion.div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default CancellationPolicy;
