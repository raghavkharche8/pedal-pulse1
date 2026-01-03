import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Calendar, Clock, Trophy, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ViewSubmissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    registration: any;
    onResubmit: () => void;
}

export const ViewSubmissionModal = ({ isOpen, onClose, registration, onResubmit }: ViewSubmissionModalProps) => {
    if (!isOpen || !registration) return null;

    const isRejected = registration.verification_status === 'rejected';

    // Safely parse time if needed or just display
    const timeDisplay = registration.activity_time || 'N/A';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between pr-4">
                        <DialogTitle>Submission Details</DialogTitle>
                        <Badge variant={isRejected ? "destructive" : "outline"} className={
                            registration.verification_status === 'approved' ? 'bg-green-100 text-green-700 border-green-200' :
                                registration.verification_status === 'rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                                    'bg-yellow-100 text-yellow-700 border-yellow-200'
                        }>
                            {registration.verification_status?.toUpperCase()}
                        </Badge>
                    </div>
                    <DialogDescription>
                        Submitted on {new Date(registration.proof_submission_date).toLocaleDateString()}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    {/* Rejection Notice */}
                    {isRejected && (
                        <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex gap-3 text-red-700">
                            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                            <div>
                                <p className="font-semibold text-sm">Submission Rejected</p>
                                <p className="text-sm mt-1">{registration.verification_notes || "Reason not specified. Please check requirements and try again."}</p>
                            </div>
                        </div>
                    )}

                    {/* Activity Snapshot */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <Calendar className="w-5 h-5 text-slate-400 mx-auto mb-2" />
                            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Date</p>
                            <p className="font-bold text-slate-900">{registration.activity_date}</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <Trophy className="w-5 h-5 text-slate-400 mx-auto mb-2" />
                            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Distance</p>
                            <p className="font-bold text-slate-900">{registration.activity_distance} km</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <Clock className="w-5 h-5 text-slate-400 mx-auto mb-2" />
                            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Time</p>
                            <p className="font-bold text-slate-900">{timeDisplay}</p>
                        </div>
                    </div>

                    {/* Proof - Image or Link */}
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-slate-900">Proof of Activity</h4>
                        {registration.proof_image_url ? (
                            (() => {
                                const url = registration.proof_image_url;
                                // Simple heuristic: if it mentions 'supabase' and 'proof-submissions', it's likely our uploaded image.
                                // Or check extension. But for now, let's assume if it starts with 'http' and doesn't look like an image extension, it's a link.
                                // Actually, checking if it is a Strava/External link is safer.
                                const isSupabaseFile = url.includes('supabase') && url.includes('proof-submissions');

                                if (isSupabaseFile) {
                                    return (
                                        <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 relative group">
                                            <img
                                                src={url}
                                                alt="Proof"
                                                className="w-full h-auto max-h-[300px] object-contain"
                                            />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Button variant="secondary" asChild size="sm" className="gap-2">
                                                    <a href={url} target="_blank" rel="noopener noreferrer">
                                                        <ExternalLink className="w-4 h-4" />
                                                        Open Full Image
                                                    </a>
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                } else {
                                    return (
                                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
                                            <p className="text-sm text-slate-600 mb-3">User provided an activity link:</p>
                                            <Button asChild variant="outline" className="gap-2">
                                                <a href={url} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="w-4 h-4" />
                                                    View Activity Link
                                                </a>
                                            </Button>
                                            <p className="text-xs text-slate-400 mt-2 break-all">{url}</p>
                                        </div>
                                    );
                                }
                            })()
                        ) : (
                            <p className="text-sm text-slate-500 italic">No proof provided</p>
                        )}
                    </div>

                    {/* Notes */}
                    {registration.activity_notes && (
                        <div className="space-y-1">
                            <h4 className="text-sm font-medium text-slate-900">Notes</h4>
                            <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                {registration.activity_notes}
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0 mt-6">
                    <Button variant="outline" onClick={onClose}>Close</Button>
                    {isRejected && (
                        <Button onClick={onResubmit}>Resubmit Proof</Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
