import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Header />

            <main className="flex-1 pt-24 pb-20">
                <div className="container mx-auto max-w-4xl px-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 md:p-12">
                        <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-2">
                            Privacy Policy
                        </h1>
                        <p className="text-slate-500 mb-8">Last updated: December 30, 2025</p>

                        <div className="prose prose-slate max-w-none">
                            <section className="mb-8">
                                <h2 className="text-xl font-bold text-slate-900 mb-4">1. Introduction</h2>
                                <p className="text-slate-600 leading-relaxed mb-4">
                                    Welcome to PedalPulse ("we," "our," or "us"). We are committed to protecting your personal information
                                    and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard
                                    your information when you use our fitness challenge platform and services.
                                </p>
                                <p className="text-slate-600 leading-relaxed">
                                    By using our services, you agree to the collection and use of information in accordance with this policy.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-bold text-slate-900 mb-4">2. Information We Collect</h2>

                                <h3 className="text-lg font-semibold text-slate-800 mb-3">2.1 Personal Information</h3>
                                <p className="text-slate-600 leading-relaxed mb-4">
                                    When you register for challenges or create an account, we collect:
                                </p>
                                <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
                                    <li>Name (first and last name)</li>
                                    <li>Email address</li>
                                    <li>Phone number</li>
                                    <li>Gender</li>
                                    <li>Shipping address (for medal delivery)</li>
                                    <li>T-shirt size preference</li>
                                </ul>

                                <h3 className="text-lg font-semibold text-slate-800 mb-3">2.2 Payment Information</h3>
                                <p className="text-slate-600 leading-relaxed mb-4">
                                    Payment processing is handled by Razorpay. We do not store your credit card numbers,
                                    CVV, or complete payment details. Razorpay's privacy policy governs the collection of
                                    payment information.
                                </p>

                                <h3 className="text-lg font-semibold text-slate-800 mb-3">2.3 Strava Data</h3>
                                <p className="text-slate-600 leading-relaxed mb-4">
                                    If you choose to connect your Strava account, we access:
                                </p>
                                <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
                                    <li>Your Strava profile information (name, profile photo)</li>
                                    <li>Activity data (distance, duration, date, activity type)</li>
                                    <li>Activity ID for verification purposes</li>
                                </ul>
                                <p className="text-slate-600 leading-relaxed mb-4">
                                    <strong>Important:</strong> We only access your Strava activities when you explicitly
                                    choose to sync. We never post to Strava on your behalf. You can disconnect Strava
                                    at any time from your Dashboard.
                                </p>

                                <h3 className="text-lg font-semibold text-slate-800 mb-3">2.4 Automatically Collected Information</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    We automatically collect certain information when you visit our website, including
                                    IP address, browser type, device information, and cookies for session management.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-bold text-slate-900 mb-4">3. How We Use Your Information</h2>
                                <p className="text-slate-600 leading-relaxed mb-4">We use the collected information to:</p>
                                <ul className="list-disc pl-6 text-slate-600 space-y-2">
                                    <li>Process challenge registrations and payments</li>
                                    <li>Verify challenge completion through Strava integration</li>
                                    <li>Ship medals and merchandise to your address</li>
                                    <li>Generate and deliver digital certificates</li>
                                    <li>Display leaderboard rankings (first name and last initial only)</li>
                                    <li>Send important updates about your challenges</li>
                                    <li>Improve our services and user experience</li>
                                    <li>Respond to customer support inquiries</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-bold text-slate-900 mb-4">4. Information Sharing</h2>
                                <p className="text-slate-600 leading-relaxed mb-4">
                                    We do not sell, trade, or rent your personal information. We may share your information with:
                                </p>
                                <ul className="list-disc pl-6 text-slate-600 space-y-2">
                                    <li><strong>Shipping Partners:</strong> Name and address for medal delivery</li>
                                    <li><strong>Payment Processors:</strong> Razorpay for secure payment processing</li>
                                    <li><strong>Strava:</strong> OAuth tokens for activity verification (with your consent)</li>
                                    <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-bold text-slate-900 mb-4">5. Leaderboard Display</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    Public leaderboards display participant names, activity distances, and times.
                                    Only participants who have completed payment and connected Strava appear on leaderboards.
                                    Your email, phone number, and address are never displayed publicly.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-bold text-slate-900 mb-4">6. Data Security</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    We implement appropriate security measures to protect your personal information, including
                                    encrypted data transmission (HTTPS), secure database storage with Supabase, and access controls.
                                    However, no method of transmission over the internet is 100% secure.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-bold text-slate-900 mb-4">7. Your Rights</h2>
                                <p className="text-slate-600 leading-relaxed mb-4">You have the right to:</p>
                                <ul className="list-disc pl-6 text-slate-600 space-y-2">
                                    <li>Access your personal data</li>
                                    <li>Correct inaccurate information</li>
                                    <li>Request deletion of your data</li>
                                    <li>Disconnect third-party integrations (Strava)</li>
                                    <li>Opt out of marketing communications</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-bold text-slate-900 mb-4">8. Cookies</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    We use essential cookies for authentication and session management. These are necessary
                                    for the website to function properly. We do not use advertising or tracking cookies.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-bold text-slate-900 mb-4">9. Third-Party Services</h2>
                                <p className="text-slate-600 leading-relaxed mb-4">
                                    Our platform integrates with third-party services that have their own privacy policies:
                                </p>
                                <ul className="list-disc pl-6 text-slate-600 space-y-2">
                                    <li><a href="https://www.strava.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">Strava Privacy Policy</a></li>
                                    <li><a href="https://razorpay.com/privacy/" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">Razorpay Privacy Policy</a></li>
                                    <li><a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">Supabase Privacy Policy</a></li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-bold text-slate-900 mb-4">10. Children's Privacy</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    Our services are not intended for individuals under 13 years of age. We do not knowingly
                                    collect personal information from children under 13.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-bold text-slate-900 mb-4">11. Changes to This Policy</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    We may update this Privacy Policy from time to time. We will notify you of any changes
                                    by posting the new policy on this page and updating the "Last updated" date.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-slate-900 mb-4">12. Contact Us</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    If you have any questions about this Privacy Policy, please contact us at:
                                </p>
                                <p className="text-slate-600 mt-2">
                                    <strong>Email:</strong> info@pedalpulse.in<br />
                                    <strong>Website:</strong> <a href="https://pedalpulse.in" className="text-orange-600 hover:underline">pedalpulse.in</a>
                                </p>
                            </section>
                        </div>

                        <div className="mt-10 pt-6 border-t border-slate-100">
                            <Link to="/" className="text-orange-600 hover:underline text-sm font-medium">
                                ← Back to Home
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PrivacyPolicy;
