import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, UploadCloud, X, AlertCircle, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import imageCompression from 'browser-image-compression';
import { toast } from 'sonner';

// --- Validation Schema ---
const proofSchema = z.object({
    activityDate: z.string().min(1, "Activity date is required"),
    activityDistance: z.coerce.number().min(0.01, "Distance must be greater than 0"),
    hours: z.coerce.number().min(0, "Hours cannot be negative"),
    minutes: z.coerce.number().min(0, "Minutes cannot be negative").max(59, "Minutes must be under 60"),
    notes: z.string().max(500, "Notes limited to 500 characters").optional(),
    stravaLink: z.string().optional(),
}).refine((data) => data.hours > 0 || data.minutes > 0, {
    message: "Total time must be greater than 0",
    path: ["minutes"],
});

type ProofFormData = z.infer<typeof proofSchema>;

interface ProofSubmissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    registration: any;
    onSuccess: () => void;
}

export const ProofSubmissionModal = ({ isOpen, onClose, registration, onSuccess }: ProofSubmissionModalProps) => {
    const { user } = useAuth();
    const [submissionType, setSubmissionType] = useState<"upload" | "link">("upload");
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [compressionStatus, setCompressionStatus] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
        reset,
        watch,
        setValue
    } = useForm<ProofFormData>({
        resolver: zodResolver(proofSchema),
        defaultValues: {
            activityDate: new Date().toISOString().split('T')[0],
            activityDistance: registration?.sport_distance ? parseFloat(registration.sport_distance.replace(/[^0-9.]/g, '')) : 0,
            hours: 0,
            minutes: 0,
            notes: '',
            stravaLink: ''
        }
    });

    const stravaLink = watch('stravaLink');

    // --- Image Handling ---
    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const selectedFile = acceptedFiles[0];
        if (!selectedFile) return;

        // Validate type and size (initial raw check)
        if (selectedFile.size > 5 * 1024 * 1024) {
            toast.error("File is too large (max 5MB)");
            return;
        }

        try {
            // Compression
            const options = {
                maxSizeMB: 0.5,
                maxWidthOrHeight: 1920,
                useWebWorker: true,
                onProgress: (p: number) => setCompressionStatus(`Compressing: ${p}%`)
            };

            setCompressionStatus("Compressing...");
            const compressedFile = await imageCompression(selectedFile, options);
            setCompressionStatus(`Compressed: ${(selectedFile.size / 1024 / 1024).toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);

            setFile(compressedFile);
            setPreviewUrl(URL.createObjectURL(compressedFile));
        } catch (error) {
            console.error("Compression error:", error);
            toast.error("Failed to process image. Please try another.");
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/jpeg': [],
            'image/png': [],
            'image/jpg': []
        },
        maxFiles: 1,
        multiple: false
    });

    const removeFile = () => {
        setFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setCompressionStatus(null);
    };

    // --- Submission Handler ---
    const onSubmit = async (data: ProofFormData) => {
        if (!user) {
            toast.error("You must be logged in.");
            return;
        }

        // Custom Validation based on active tab
        let finalProofUrl = "";

        if (submissionType === "upload") {
            if (!file) {
                toast.error("Please upload a screenshot.");
                return;
            }
        } else {
            if (!data.stravaLink || !data.stravaLink.trim()) {
                toast.error("Please enter a valid activity link.");
                return;
            }
            try {
                new URL(data.stravaLink); // Simple URL validation
            } catch (_) {
                toast.error("Please enter a valid URL (e.g., https://strava.com/...)");
                return;
            }
            finalProofUrl = data.stravaLink;
        }

        setUploading(true);
        setUploadProgress(0);

        try {
            // 1. Upload File (if applicable)
            if (submissionType === "upload" && file) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${user.id}/${registration.id}/${Date.now()}-proof.${fileExt}`;

                setUploadProgress(30);

                const { error: uploadError } = await supabase.storage
                    .from('proof-submissions')
                    .upload(fileName, file);

                if (uploadError) throw uploadError;

                setUploadProgress(70);

                const { data: { publicUrl } } = supabase.storage
                    .from('proof-submissions')
                    .getPublicUrl(fileName);

                finalProofUrl = publicUrl;
            }

            // 2. Update Database
            const formattedTime = `${data.hours}h ${data.minutes}m`;

            const { error: dbError } = await supabase
                .from('registrations')
                .update({
                    proof_submission_date: new Date().toISOString(),
                    proof_image_url: finalProofUrl,
                    activity_date: data.activityDate,
                    activity_time: formattedTime,
                    activity_distance: data.activityDistance,
                    activity_notes: data.notes,
                    status: 'proof_submitted',
                    verification_status: 'pending'
                })
                .eq('id', registration.id);

            if (dbError) throw dbError;

            setUploadProgress(100);
            toast.success("Proof submitted successfully! 🎉");
            onSuccess();
            onClose();

        } catch (error: any) {
            console.error("Submission error:", error);
            toast.error(error.message || "Failed to submit proof. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Submit Activity Proof</DialogTitle>
                    <DialogDescription>
                        For {registration?.challenge_name || 'Challenge'} • {registration?.sport_distance}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">

                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3 text-sm text-blue-700">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p>Verify your activity by uploading a screenshot or providing a public link to your activity (Strava, Garmin, etc.).</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        {/* Activity Date */}
                        <div className="space-y-2">
                            <Label htmlFor="activityDate">Activity Date</Label>
                            <Input
                                id="activityDate"
                                type="date"
                                {...register('activityDate')}
                                max={new Date().toISOString().split('T')[0]}
                            />
                            {errors.activityDate && <p className="text-xs text-red-500">{errors.activityDate.message}</p>}
                        </div>

                        {/* Distance */}
                        <div className="space-y-2">
                            <Label htmlFor="activityDistance">Distance (km)</Label>
                            <Input
                                id="activityDistance"
                                type="number"
                                step="0.01"
                                {...register('activityDistance')}
                            />
                            {errors.activityDistance && <p className="text-xs text-red-500">{errors.activityDistance.message}</p>}
                        </div>
                    </div>

                    {/* Time Taken */}
                    <div className="space-y-2">
                        <Label>Time Taken</Label>
                        <div className="flex items-center gap-2">
                            <div className="flex-1">
                                <Input type="number" placeholder="0" min="0" {...register('hours')} />
                                <span className="text-xs text-slate-500 mt-1 block">Hours</span>
                            </div>
                            <span className="font-bold text-slate-400">:</span>
                            <div className="flex-1">
                                <Input type="number" placeholder="0" min="0" max="59" {...register('minutes')} />
                                <span className="text-xs text-slate-500 mt-1 block">Minutes</span>
                            </div>
                        </div>
                        {errors.minutes && <p className="text-xs text-red-500">{errors.minutes.message}</p>}
                    </div>

                    <div className="space-y-4">
                        <Label>Proof Type</Label>
                        <Tabs value={submissionType} onValueChange={(v) => setSubmissionType(v as "upload" | "link")} className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="upload" className="flex items-center gap-2">
                                    <UploadCloud className="w-4 h-4" /> Screenshot
                                </TabsTrigger>
                                <TabsTrigger value="link" className="flex items-center gap-2">
                                    <LinkIcon className="w-4 h-4" /> Activity Link
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="upload" className="mt-4 space-y-2">
                                {!file ? (
                                    <div
                                        {...getRootProps()}
                                        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors
                                            ${isDragActive ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-primary/50 hover:bg-slate-50'}
                                        `}
                                    >
                                        <input {...getInputProps()} />
                                        <UploadCloud className="w-10 h-10 text-slate-400 mb-2" />
                                        <p className="text-sm font-medium text-slate-900">Click to upload or drag & drop</p>
                                        <p className="text-xs text-slate-500 mt-1">JPG, PNG up to 5MB</p>
                                    </div>
                                ) : (
                                    <div className="relative border border-slate-200 rounded-xl p-3 flex gap-3 items-center bg-slate-50">
                                        <div className="w-16 h-16 bg-slate-200 rounded-lg overflow-hidden flex-shrink-0">
                                            {previewUrl && <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                                            <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(0)} KB</p>
                                            {compressionStatus && <p className="text-[10px] text-green-600 mt-0.5">{compressionStatus}</p>}
                                        </div>
                                        <button type="button" onClick={removeFile} className="p-2 hover:bg-slate-200 rounded-full text-slate-500">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="link" className="mt-4 space-y-2">
                                <div className="space-y-2">
                                    <Label htmlFor="stravaLink" className="sr-only">Activity Link</Label>
                                    <div className="relative">
                                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <Input
                                            id="stravaLink"
                                            placeholder="Paste your Strava or other activity link here..."
                                            className="pl-9"
                                            {...register('stravaLink')}
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500">Ensure the activity is set to Public so we can verify it.</p>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Additional Notes (Optional)</Label>
                        <Textarea
                            id="notes"
                            placeholder="Any details about your run/ride..."
                            {...register('notes')}
                            className="resize-none h-24"
                        />
                        <div className="text-right text-xs text-slate-400">
                            {watch('notes')?.length || 0}/500
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button type="button" variant="outline" onClick={onClose} disabled={uploading}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={uploading || !isValid || (submissionType === "upload" && !file) || (submissionType === "link" && !stravaLink)}
                            className="bg-primary hover:bg-primary/90 min-w-[140px]"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    {uploadProgress < 100 ? `Processing...` : 'Finalizing...'}
                                </>
                            ) : (
                                'Submit Proof'
                            )}
                        </Button>
                    </DialogFooter>

                </form>
            </DialogContent>
        </Dialog>
    );
};
