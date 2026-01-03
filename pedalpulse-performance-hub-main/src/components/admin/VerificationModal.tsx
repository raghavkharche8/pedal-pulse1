import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2, ExternalLink, Check, X, Download, ZoomIn, ZoomOut, User, Mail, Phone, MapPin, Calendar, CreditCard } from "lucide-react";
import { sendApprovalEmail, sendRejectionEmail } from "@/lib/notifications";
import { generateCertificate } from "@/lib/certificateGenerator";

interface VerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    registration: any;
    onStatusChange: () => void;
    onNext?: () => void; // Move to next pending
}

export const VerificationModal = ({ isOpen, onClose, registration, onStatusChange, onNext }: VerificationModalProps) => {
    const [notes, setNotes] = useState("");
    const [processing, setProcessing] = useState(false);
    const [showApproveConfirm, setShowApproveConfirm] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [imageZoom, setImageZoom] = useState(1);
    const [selectedReason, setSelectedReason] = useState("other");

    const rejectionReasons = [
        { value: "unclear", label: "Image unclear/unreadable" },
        { value: "date_mismatch", label: "Date doesn't match challenge period" },
        { value: "distance_mismatch", label: "Distance doesn't match requirement" },
        { value: "fake", label: "Suspected fake/manipulated screenshot" },
        { value: "wrong_type", label: "Wrong activity type" },
        { value: "other", label: "Other (please specify)" },
    ];

    const handleApprove = async () => {
        setProcessing(true);
        try {
            toast.info("Generating certificate...");

            // Generate certificate
            const userName = registration.full_name || registration.user_name || "Athlete";
            const certificateUrl = await generateCertificate(registration, userName);

            // Update database
            const { error } = await supabase
                .from('registrations')
                .update({
                    verification_status: 'approved',
                    status: 'completed',
                    verification_notes: notes || "Approved",
                    verified_at: new Date().toISOString(),
                    certificate_url: certificateUrl,
                })
                .eq('id', registration.id);

            if (error) throw error;

            // Send email
            const userEmail = registration.user_email || registration.email;
            if (userEmail) {
                await sendApprovalEmail(userEmail, userName, registration.challenge_name, certificateUrl || "");
            }

            toast.success("✅ Submission approved! Certificate generated and user notified.");
            setShowApproveConfirm(false);
            onStatusChange();

            // Move to next if available
            if (onNext) {
                setTimeout(() => {
                    onNext();
                }, 500);
            } else {
                onClose();
            }
        } catch (err: any) {
            console.error("Approval Error:", err);
            toast.error("Failed to approve: " + err.message);
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!rejectionReason || rejectionReason.length < 10) {
            toast.error("Please provide a detailed reason (at least 10 characters)");
            return;
        }

        setProcessing(true);
        try {
            const fullReason = selectedReason !== "other"
                ? `${rejectionReasons.find(r => r.value === selectedReason)?.label}: ${rejectionReason}`
                : rejectionReason;

            // Update database
            const { error } = await supabase
                .from('registrations')
                .update({
                    verification_status: 'rejected',
                    status: 'proof_submitted',
                    verification_notes: fullReason,
                    verified_at: new Date().toISOString(),
                })
                .eq('id', registration.id);

            if (error) throw error;

            // Send email
            const userEmail = registration.user_email || registration.email;
            const userName = registration.full_name || "Athlete";
            if (userEmail) {
                await sendRejectionEmail(userEmail, userName, registration.challenge_name, fullReason);
            }

            toast.success("❌ Submission rejected. User notified to resubmit.");
            setShowRejectDialog(false);
            onStatusChange();

            if (onNext) {
                setTimeout(() => {
                    onNext();
                }, 500);
            } else {
                onClose();
            }
        } catch (err: any) {
            console.error("Rejection Error:", err);
            toast.error("Failed to reject: " + err.message);
        } finally {
            setProcessing(false);
        }
    };

    const downloadImage = async () => {
        if (!registration.proof_image_url) return;

        try {
            const response = await fetch(registration.proof_image_url);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `proof_${registration.id}.jpg`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            toast.error("Failed to download image");
        }
    };

    if (!isOpen || !registration) return null;

    const isExternalLink = registration.proof_image_url && !registration.proof_image_url.includes('proof-submissions');

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            Verification Review
                            <Badge variant="secondary" className="font-mono text-xs">
                                #{String(registration.id || '').slice(0, 8)}
                            </Badge>
                        </DialogTitle>
                        <DialogDescription>
                            Review proof submission and approve or reject
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid md:grid-cols-5 gap-6">
                        {/* Left: User & Activity Details (2 cols) */}
                        <div className="md:col-span-2 space-y-4">
                            {/* User Profile */}
                            <section className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-xl border border-slate-200">
                                <h3 className="font-semibold text-sm text-slate-700 uppercase mb-3 flex items-center gap-2">
                                    <User className="w-4 h-4" /> User Profile
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-start gap-2">
                                        <User className="w-4 h-4 text-slate-400 mt-0.5" />
                                        <div>
                                            <p className="text-xs text-slate-500">Full Name</p>
                                            <p className="font-medium">{registration.full_name || "N/A"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Mail className="w-4 h-4 text-slate-400 mt-0.5" />
                                        <div>
                                            <p className="text-xs text-slate-500">Email</p>
                                            <p className="font-medium text-xs">{registration.email || registration.user_email || "N/A"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Phone className="w-4 h-4 text-slate-400 mt-0.5" />
                                        <div>
                                            <p className="text-xs text-slate-500">Phone</p>
                                            <p className="font-medium">{registration.phone || "N/A"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                                        <div>
                                            <p className="text-xs text-slate-500">Address</p>
                                            <p className="font-medium text-xs">{registration.address || registration.city || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Challenge Details */}
                            <section className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <h3 className="font-semibold text-sm text-blue-900 uppercase mb-3">Challenge Details</h3>
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <p className="text-xs text-blue-600">Challenge</p>
                                        <p className="font-semibold text-blue-900">{registration.challenge_name}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <p className="text-xs text-blue-600">Sport</p>
                                            <p className="font-medium">{registration.sport || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-blue-600">Distance</p>
                                            <p className="font-medium">{registration.sport_distance}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 pt-2">
                                        <Calendar className="w-3 h-3 text-blue-600" />
                                        <p className="text-xs text-blue-700">Registered: {new Date(registration.created_at).toLocaleDateString()}</p>
                                    </div>
                                    {registration.payment_id && (
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="w-3 h-3 text-blue-600" />
                                            <p className="text-xs text-blue-700 font-mono">Payment: {String(registration.payment_id || '').slice(0, 15)}...</p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Activity Submission */}
                            <section className="bg-green-50 p-4 rounded-xl border border-green-100">
                                <h3 className="font-semibold text-sm text-green-900 uppercase mb-3">Activity Submission</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <p className="text-xs text-green-600">Submitted On</p>
                                            <p className="font-medium">{new Date(registration.proof_submission_date).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-green-600">Activity Date</p>
                                            <p className="font-medium">{registration.activity_date}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <p className="text-xs text-green-600">Distance</p>
                                            <p className="font-semibold text-green-900">{registration.activity_distance} km</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-green-600">Time</p>
                                            <p className="font-semibold text-green-900">{registration.activity_time}</p>
                                        </div>
                                    </div>
                                    {registration.activity_notes && (
                                        <div className="pt-2 border-t border-green-200">
                                            <p className="text-xs text-green-600 mb-1">User Notes</p>
                                            <p className="italic text-green-800 text-xs">{registration.activity_notes}</p>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>

                        {/* Right: Proof Image (3 cols) */}
                        <div className="md:col-span-3 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-sm text-slate-900">Proof of Activity</h3>
                                {!isExternalLink && (
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" onClick={() => setImageZoom(Math.max(1, imageZoom - 0.25))}>
                                            <ZoomOut className="w-4 h-4" />
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => setImageZoom(Math.min(3, imageZoom + 0.25))}>
                                            <ZoomIn className="w-4 h-4" />
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={downloadImage}>
                                            <Download className="w-4 h-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="border-2 border-slate-200 rounded-xl overflow-hidden bg-slate-100 min-h-[400px] max-h-[500px] overflow-auto flex items-center justify-center">
                                {registration.proof_image_url ? (
                                    isExternalLink ? (
                                        <div className="text-center p-8">
                                            <p className="text-slate-600 mb-4">User provided an external activity link</p>
                                            <Button asChild>
                                                <a href={registration.proof_image_url} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="w-4 h-4 mr-2" />
                                                    Open Activity Link
                                                </a>
                                            </Button>
                                            <p className="text-xs text-slate-400 mt-3 break-all">{registration.proof_image_url}</p>
                                        </div>
                                    ) : (
                                        <div className="w-full flex items-center justify-center p-4">
                                            <img
                                                src={registration.proof_image_url}
                                                alt="Activity proof"
                                                className="max-w-full h-auto rounded-lg shadow-lg transition-transform"
                                                style={{ transform: `scale(${imageZoom})` }}
                                            />
                                        </div>
                                    )
                                ) : (
                                    <p className="text-slate-400">No proof available</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Admin Notes */}
                    <div className="border-t pt-6 mt-4">
                        <Label htmlFor="adminNotes" className="text-slate-700">Admin Notes (optional)</Label>
                        <Textarea
                            id="adminNotes"
                            placeholder="Add internal notes about this verification..."
                            className="mt-2"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                        />
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0 mt-6">
                        <Button variant="outline" onClick={onClose} disabled={processing}>
                            Close
                        </Button>
                        <div className="flex gap-2">
                            <Button
                                variant="destructive"
                                onClick={() => setShowRejectDialog(true)}
                                disabled={processing}
                            >
                                <X className="w-4 h-4 mr-2" /> Reject
                            </Button>
                            <Button
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => setShowApproveConfirm(true)}
                                disabled={processing}
                            >
                                <Check className="w-4 h-4 mr-2" /> Approve
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Approval Confirmation */}
            <AlertDialog open={showApproveConfirm} onOpenChange={setShowApproveConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Approve This Submission?</AlertDialogTitle>
                        <AlertDialogDescription className="space-y-2">
                            <p>You are about to approve the submission for:</p>
                            <div className="bg-green-50 p-3 rounded-lg border border-green-200 my-2">
                                <p className="font-semibold text-green-900">{registration?.full_name || "User"}</p>
                                <p className="text-sm text-green-700">{registration?.challenge_name}</p>
                            </div>
                            <p className="text-sm">This will:</p>
                            <ul className="text-sm list-disc list-inside space-y-1 text-slate-600">
                                <li>Mark the challenge as completed</li>
                                <li>Generate a certificate automatically</li>
                                <li>Send congratulations email to the user</li>
                                <li>Make the user eligible for medal shipping</li>
                            </ul>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={processing}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleApprove}
                            disabled={processing}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Confirm Approval
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Rejection Dialog */}
            <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <AlertDialogContent className="max-w-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Reject Submission</AlertDialogTitle>
                        <AlertDialogDescription>
                            Please provide a clear reason for rejection. This will be sent to the user.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="space-y-4 py-4">
                        <div>
                            <Label>Rejection Reason Template</Label>
                            <Select value={selectedReason} onValueChange={setSelectedReason}>
                                <SelectTrigger className="mt-2">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {rejectionReasons.map(reason => (
                                        <SelectItem key={reason.value} value={reason.value}>
                                            {reason.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="rejectionReason">Detailed Explanation (min 10 characters)</Label>
                            <Textarea
                                id="rejectionReason"
                                placeholder="Please provide specific details about why this submission is being rejected..."
                                className="mt-2"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                rows={4}
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                {rejectionReason.length}/10 characters minimum
                            </p>
                        </div>
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={processing}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleReject}
                            disabled={processing || rejectionReason.length < 10}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Confirm Rejection
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};
