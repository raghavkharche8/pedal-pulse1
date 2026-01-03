import { Link } from 'react-router-dom';
import { CheckCircle2, Share2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const ThankYou = () => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Header />

            <main className="flex-1 flex items-center justify-center p-4">
                <div className="bg-white rounded-[32px] shadow-2xl shadow-slate-200 border border-slate-100 p-8 md:p-16 text-center max-w-2xl w-full mx-auto animate-fade-in-up mt-20 mb-20">
                    <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce-short">
                        <CheckCircle2 className="w-12 h-12" />
                    </div>

                    <h1 className="font-display font-bold text-4xl md:text-5xl text-slate-900 mb-4">
                        You're In 🎉
                    </h1>
                    <p className="font-sans text-lg text-slate-500 mb-4">
                        Republic Day 2026 Challenge — confirmed.
                    </p>
                    <p className="font-sans text-sm text-slate-400 mb-12">
                        Now the only thing left is the ride.
                    </p>

                    <div className="bg-slate-50 rounded-2xl p-8 mb-10 text-left border border-slate-100">
                        <h3 className="font-display font-semibold text-xl text-slate-900 mb-6">What's Next?</h3>
                        <ul className="space-y-4">
                            {[
                                "Check your email for confirmation receipt",
                                "Training plan will be shared via WhatsApp",
                                "Complete your challenge between 26 Jan - 1 Feb",
                                "Medal will be shipped within 5 days of verification"
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                                        {i + 1}
                                    </span>
                                    <span className="text-slate-600">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button asChild className="bg-slate-900 hover:bg-slate-800 h-12 px-8 rounded-xl text-lg">
                            <Link to="/dashboard">Go to Dashboard</Link>
                        </Button>
                        <Button
                            variant="outline"
                            className="border-slate-200 h-12 px-8 rounded-xl text-lg hover:bg-slate-50 gap-2 text-slate-700"
                            onClick={async () => {
                                const shareData = {
                                    title: 'I just registered for PedalPulse Republic Day 2026 Challenge!',
                                    text: 'Join me in the Republic Day 2026 virtual running/cycling challenge. Earn a premium medal! 🏅',
                                    url: 'https://pedalpulse.in/challenges'
                                };
                                try {
                                    if (navigator.share) {
                                        await navigator.share(shareData);
                                    } else {
                                        await navigator.clipboard.writeText(shareData.url);
                                        alert('Link copied to clipboard!');
                                    }
                                } catch (err) {
                                    console.log('Share cancelled');
                                }
                            }}
                        >
                            <Share2 className="w-5 h-5" />
                            Share with Friends
                        </Button>
                    </div>

                    {/* Fun motivational line */}
                    <p className="text-sm text-slate-400 italic mt-8">
                        Spoiler alert: The finish line feels amazing.
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ThankYou;
