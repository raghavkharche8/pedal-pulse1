import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Package, Truck, MapPin, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

const ShippingPolicy = () => {
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
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
                            <Package className="w-4 h-4" />
                            Shipping Policy
                        </div>
                        <h1 className="font-display font-bold text-4xl md:text-5xl text-slate-900 mb-4">
                            Shipping & Delivery Policy
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
                        {/* Overview */}
                        <section>
                            <h2 className="font-display font-bold text-2xl text-slate-900 mb-4 flex items-center gap-3">
                                <Truck className="w-6 h-6 text-primary" />
                                Overview
                            </h2>
                            <p className="text-slate-600 leading-relaxed">
                                Thank you for participating in PedalPulse virtual challenges! This Shipping Policy outlines how we deliver physical items (medals, merchandise) and digital items (e-certificates, posters) to our participants across India and internationally.
                            </p>
                        </section>

                        {/* What We Ship */}
                        <section>
                            <h2 className="font-display font-bold text-2xl text-slate-900 mb-4">
                                What We Ship
                            </h2>
                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                                    <div>
                                        <p className="font-semibold text-slate-900">Physical Items (Premium Package)</p>
                                        <p className="text-slate-600">Finisher medals, t-shirts, and other merchandise</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                                    <div>
                                        <p className="font-semibold text-slate-900">Digital Items (All Packages)</p>
                                        <p className="text-slate-600">E-certificates, customized posters (delivered via email)</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Shipping Within India */}
                        <section className="bg-slate-50 rounded-xl p-6">
                            <h2 className="font-display font-bold text-2xl text-slate-900 mb-4 flex items-center gap-3">
                                <MapPin className="w-6 h-6 text-primary" />
                                Shipping Within India
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-2">Delivery Timeline</h3>
                                    <ul className="space-y-2 text-slate-600">
                                        <li className="flex items-start gap-2">
                                            <span className="text-primary mt-1">•</span>
                                            <span><strong>Metro Cities</strong> (Mumbai, Delhi, Bangalore, Hyderabad, Chennai, Kolkata, Pune): 7-10 business days</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-primary mt-1">•</span>
                                            <span><strong>Tier 2 Cities:</strong> 10-14 business days</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-primary mt-1">•</span>
                                            <span><strong>Remote Areas:</strong> 14-21 business days</span>
                                        </li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-2">Shipping Charges</h3>
                                    <p className="text-slate-600">
                                        <strong className="text-green-600">FREE SHIPPING</strong> on all orders within India (included in premium package price).
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-2">Courier Partners</h3>
                                    <p className="text-slate-600">
                                        We use trusted courier partners including Delhivery, Blue Dart, India Post, and DTDC for reliable delivery.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* International Shipping */}
                        <section>
                            <h2 className="font-display font-bold text-2xl text-slate-900 mb-4">
                                International Shipping
                            </h2>
                            <div className="space-y-4 text-slate-600">
                                <p>
                                    We currently ship to select international locations. International shipping charges and timelines vary by destination.
                                </p>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <p className="text-blue-900">
                                        <strong>Note:</strong> International participants are responsible for any customs duties, taxes, or import fees charged by their country.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Processing Time */}
                        <section>
                            <h2 className="font-display font-bold text-2xl text-slate-900 mb-4 flex items-center gap-3">
                                <Clock className="w-6 h-6 text-primary" />
                                Processing Time
                            </h2>
                            <div className="space-y-3 text-slate-600">
                                <p className="flex items-start gap-2">
                                    <span className="text-primary mt-1">→</span>
                                    <span>Medals are dispatched <strong>after successful activity verification</strong> and challenge completion.</span>
                                </p>
                                <p className="flex items-start gap-2">
                                    <span className="text-primary mt-1">→</span>
                                    <span>Processing typically takes <strong>3-5 business days</strong> after verification.</span>
                                </p>
                                <p className="flex items-start gap-2">
                                    <span className="text-primary mt-1">→</span>
                                    <span>Bulk orders (corporate/group registrations) may require additional processing time.</span>
                                </p>
                            </div>
                        </section>

                        {/* Digital Delivery */}
                        <section className="bg-gradient-to-br from-primary/5 to-orange-50 rounded-xl p-6">
                            <h2 className="font-display font-bold text-2xl text-slate-900 mb-4">
                                Digital Item Delivery
                            </h2>
                            <div className="space-y-3 text-slate-600">
                                <p>
                                    E-certificates and digital posters are delivered to your registered email address within <strong>24-48 hours</strong> after challenge completion and activity verification.
                                </p>
                                <p className="text-sm text-slate-500">
                                    Please check your spam/promotions folder if you don't receive the email in your inbox.
                                </p>
                            </div>
                        </section>

                        {/* Tracking */}
                        <section>
                            <h2 className="font-display font-bold text-2xl text-slate-900 mb-4">
                                Order Tracking
                            </h2>
                            <p className="text-slate-600 mb-4">
                                Once your order is dispatched, you will receive:
                            </p>
                            <ul className="space-y-2 text-slate-600">
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                    <span>Email confirmation with tracking number</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                    <span>SMS updates on delivery status</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                    <span>Real-time tracking link to monitor your shipment</span>
                                </li>
                            </ul>
                        </section>

                        {/* Important Notes */}
                        <section className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                            <h2 className="font-display font-bold text-xl text-amber-900 mb-4 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5" />
                                Important Notes
                            </h2>
                            <ul className="space-y-2 text-amber-900 text-sm">
                                <li className="flex items-start gap-2">
                                    <span className="font-bold mt-0.5">•</span>
                                    <span>Ensure your shipping address is correct during registration. Address changes after dispatch may not be possible.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="font-bold mt-0.5">•</span>
                                    <span>PedalPulse is not responsible for delays caused by courier companies, natural disasters, or force majeure events.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="font-bold mt-0.5">•</span>
                                    <span>If your package is lost or damaged during transit, please contact us within 7 days of expected delivery date.</span>
                                </li>
                            </ul>
                        </section>
                    </motion.div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default ShippingPolicy;
