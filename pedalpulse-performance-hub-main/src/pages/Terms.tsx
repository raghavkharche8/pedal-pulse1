import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';

const Terms = () => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Header />

            <main className="flex-1 pt-24 pb-20">
                <div className="container mx-auto max-w-4xl px-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 md:p-12">
                        <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-2">
                            Terms of Service
                        </h1>
                        <p className="text-slate-500 mb-8">Last updated: December 30, 2025</p>

                        <div className="prose prose-slate max-w-none">
                            <section className="mb-8">
                                <h2 className="text-xl font-bold text-slate-900 mb-4">1. Acceptance of Terms</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    By accessing or using PedalPulse ("the Platform"), you agree to be bound by these Terms of Service.
                                    If you do not agree to these terms, please do not use our services. These terms apply to all users,
                                    including visitors, registered users, and challenge participants.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-bold text-slate-900 mb-4">2. Description of Service</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    PedalPulse is a fitness challenge platform that allows users to participate in running and cycling
                                    challenges, track their activities through Strava integration, compete on leaderboards, and earn
                                    medals and certificates upon completion.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-bold text-slate-900 mb-4">3. User Accounts</h2>

                                <h3 className="text-lg font-semibold text-slate-800 mb-3">3.1 Account Creation</h3>
                                <p className="text-slate-600 leading-relaxed mb-4">
                                    To participate in challenges, you must create an account with accurate and complete information.
                                    You are responsible for maintaining the confidentiality of your account credentials.
                                </p>

                                <h3 className="text-lg font-semibold text-slate-800 mb-3">3.2 Account Responsibility</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    You are solely responsible for all activities that occur under your account.
                                    Notify us immediately of any unauthorized use of your account.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-bold text-slate-900 mb-4">4. Challenge Participation</h2>

                                <h3 className="text-lg font-semibold text-slate-800 mb-3">4.1 Registration</h3>
                                <p className="text-slate-600 leading-relaxed mb-4">
                                    Challenge registration requires payment of the specified fee. All registrations are final
                                    once payment is completed. Registration fees are non-refundable except as stated in
                                    our Refund Policy.
                                </p>

                                <h3 className="text-lg font-semibold text-slate-800 mb-3">4.2 Challenge Rules</h3>
                                <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
                                    <li>Activities must be completed within the challenge timeframe</li>
                                    <li>Activities must be recorded using GPS-enabled devices</li>
                                    <li>Strava integration is required for automatic verification</li>
                                    <li>Manual uploads may require additional verification</li>
                                    <li>Only outdoor activities recorded with GPS are eligible for leaderboard rankings</li>
                                </ul>

                                <h3 className="text-lg font-semibold text-slate-800 mb-3">4.3 Fair Play</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    All activities must be genuine and completed by the registered participant.
                                    Any fraudulent activity, including but not limited to GPS spoofing, activity
                                    manipulation, or using someone else's activities, will result in immediate
                                    disqualification without refund.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-bold text-slate-900 mb-4">5. Strava Integration</h2>
                                <p className="text-slate-600 leading-relaxed mb-4">
                                    Our platform integrates with Strava for activity verification. By connecting your Strava account:
                                </p>
                                <ul className="list-disc pl-6 text-slate-600 space-y-2">
                                    <li>You authorize us to access your activity data for verification purposes</li>
                                    <li>Your activities will be automatically synced when you request a sync</li>
                                    <li>Verified activities may appear on public leaderboards</li>
                                    <li>You can disconnect Strava at any time from your Dashboard</li>
                                </ul>
                                <p className="text-slate-600 leading-relaxed mt-4">
                                    PedalPulse is not developed, sponsored, or endorsed by Strava. Strava and the Strava
                                    logo are trademarks of Strava, Inc.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-bold text-slate-900 mb-4">6. Medals and Rewards</h2>

                                <h3 className="text-lg font-semibold text-slate-800 mb-3">6.1 Eligibility</h3>
                                <p className="text-slate-600 leading-relaxed mb-4">
                                    Medals and certificates are awarded upon successful verification of challenge completion.
                                    You must complete the registered distance within the challenge timeframe.
                                </p>

                                <h3 className="text-lg font-semibold text-slate-800 mb-3">6.2 Shipping</h3>
                                <p className="text-slate-600 leading-relaxed mb-4">
                                    Medals are shipped to the address provided during registration. Please ensure your
                                    shipping address is accurate. Additional shipping charges may apply for certain locations.
                                    We are not responsible for delays caused by shipping carriers or customs.
                                </p>

                                <h3 className="text-lg font-semibold text-slate-800 mb-3">6.3 Delivery Timeline</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    Medals are typically shipped within 15-30 days after challenge completion and verification.
                                    Delivery times may vary based on location and carrier availability.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-bold text-slate-900 mb-4">7. Payments and Refunds</h2>

                                <h3 className="text-lg font-semibold text-slate-800 mb-3">7.1 Payment Processing</h3>
                                <p className="text-slate-600 leading-relaxed mb-4">
                                    All payments are processed securely through Razorpay. By making a payment, you agree
                                    to Razorpay's terms of service.
                                </p>

                                <h3 className="text-lg font-semibold text-slate-800 mb-3">7.2 Refund Policy</h3>
                                <p className="text-slate-600 leading-relaxed mb-4">
                                    Registration fees are generally non-refundable. Refunds may be considered in the
                                    following circumstances:
                                </p>
                                <ul className="list-disc pl-6 text-slate-600 space-y-2">
                                    <li>Challenge cancellation by PedalPulse</li>
                                    <li>Technical errors resulting in duplicate payments</li>
                                    <li>Request submitted before challenge start date (subject to processing fee)</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-bold text-slate-900 mb-4">8. Leaderboards</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    By participating in challenges, you consent to your name, activity data, and performance
                                    statistics being displayed on public leaderboards. Leaderboard rankings are determined
                                    by the maximum single-activity distance recorded via Strava during the challenge period.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-bold text-slate-900 mb-4">9. Intellectual Property</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    All content, trademarks, logos, and intellectual property on the Platform are owned by
                                    PedalPulse or its licensors. You may not use, copy, or distribute any content without
                                    prior written permission.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-bold text-slate-900 mb-4">10. User Conduct</h2>
                                <p className="text-slate-600 leading-relaxed mb-4">You agree not to:</p>
                                <ul className="list-disc pl-6 text-slate-600 space-y-2">
                                    <li>Submit false or misleading information</li>
                                    <li>Manipulate or falsify activity data</li>
                                    <li>Attempt to circumvent verification systems</li>
                                    <li>Harass, abuse, or harm other users</li>
                                    <li>Use the Platform for any unlawful purpose</li>
                                    <li>Interfere with or disrupt the Platform's operation</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-bold text-slate-900 mb-4">11. Health Disclaimer</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    Participation in fitness challenges involves physical activity that may pose health risks.
                                    You should consult with a physician before starting any exercise program. PedalPulse is
                                    not responsible for any injuries or health issues resulting from challenge participation.
                                    You participate at your own risk.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-bold text-slate-900 mb-4">12. Limitation of Liability</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    To the maximum extent permitted by law, PedalPulse shall not be liable for any indirect,
                                    incidental, special, consequential, or punitive damages arising from your use of the
                                    Platform or participation in challenges. Our total liability shall not exceed the
                                    amount paid by you for the specific challenge in question.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-bold text-slate-900 mb-4">13. Indemnification</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    You agree to indemnify and hold harmless PedalPulse, its officers, directors, employees,
                                    and agents from any claims, damages, losses, or expenses arising from your use of the
                                    Platform, violation of these terms, or infringement of any third-party rights.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-bold text-slate-900 mb-4">14. Modifications to Service</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    We reserve the right to modify, suspend, or discontinue any part of the Platform at any
                                    time without prior notice. We may also modify challenge rules, pricing, or rewards with
                                    reasonable notice to affected participants.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-bold text-slate-900 mb-4">15. Termination</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    We may terminate or suspend your account at any time for violation of these terms or
                                    for any other reason at our discretion. Upon termination, your right to use the
                                    Platform ceases immediately.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-bold text-slate-900 mb-4">16. Governing Law</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    These Terms shall be governed by and construed in accordance with the laws of India.
                                    Any disputes arising from these terms shall be subject to the exclusive jurisdiction
                                    of the courts in Kota, Rajasthan, India.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-bold text-slate-900 mb-4">17. Changes to Terms</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    We reserve the right to update these Terms at any time. We will notify users of
                                    significant changes via email or through the Platform. Continued use of the Platform
                                    after changes constitutes acceptance of the modified terms.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-slate-900 mb-4">18. Contact Information</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    For questions about these Terms of Service, please contact us at:
                                </p>
                                <p className="text-slate-600 mt-2">
                                    <strong>Email:</strong> info@pedalpulse.in<br />
                                    <strong>Website:</strong> <a href="https://pedalpulse.in" className="text-orange-600 hover:underline">pedalpulse.in</a>
                                </p>
                            </section>
                        </div>

                        <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between">
                            <Link to="/" className="text-orange-600 hover:underline text-sm font-medium">
                                ← Back to Home
                            </Link>
                            <Link to="/privacy-policy" className="text-orange-600 hover:underline text-sm font-medium">
                                Privacy Policy →
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Terms;
