import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { personalDetailsSchema, ProfileFormData } from '@/lib/validation';
import { supabase } from '@/lib/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const EditProfileModal = ({ isOpen, onClose, onSuccess }: EditProfileModalProps) => {
    const { user } = useAuth();

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors, isSubmitting, isValid }
    } = useForm<ProfileFormData>({
        resolver: zodResolver(personalDetailsSchema),
        mode: "onBlur"
    });

    useEffect(() => {
        if (isOpen && user) {
            const meta = user.user_metadata || {};
            reset({
                firstName: meta.first_name || '',
                lastName: meta.last_name || '',
                countryCode: meta.country_code || '+91',
                phone: meta.phone || '',
                gender: meta.gender || undefined
            });
        }
    }, [isOpen, user, reset]);

    const onSubmit = async (data: ProfileFormData) => {
        try {
            const { error } = await supabase.auth.updateUser({
                data: {
                    first_name: data.firstName,
                    last_name: data.lastName,
                    country_code: data.countryCode,
                    phone: data.phone,
                    gender: data.gender
                }
            });

            if (error) throw error;

            toast.success("Profile updated successfully");
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Profile Update Error", error);
            toast.error(error.message || "Failed to update profile");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input id="firstName" {...register('firstName')} placeholder="John" />
                            {errors.firstName && <p className="text-xs text-red-500">{errors.firstName.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input id="lastName" {...register('lastName')} placeholder="Doe" />
                            {errors.lastName && <p className="text-xs text-red-500">{errors.lastName.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Phone Number</Label>
                        <div className="flex gap-2">
                            <Select
                                defaultValue="+91"
                                onValueChange={(val) => setValue('countryCode', val)}
                            >
                                <SelectTrigger className="w-[80px]">
                                    <SelectValue placeholder="+91" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="+91">+91 (IND)</SelectItem>
                                    <SelectItem value="+1">+1 (USA)</SelectItem>
                                    <SelectItem value="+44">+44 (UK)</SelectItem>
                                    <SelectItem value="+971">+971 (UAE)</SelectItem>
                                </SelectContent>
                            </Select>
                            <Input
                                {...register('phone')}
                                placeholder="9876543210"
                                type="tel"
                                className="flex-1"
                            />
                        </div>
                        {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Gender</Label>
                        <Select onValueChange={(val: any) => setValue('gender', val)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Gender" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                                <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.gender && <p className="text-xs text-red-500">{errors.gender.message}</p>}
                    </div>

                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div className="space-y-1">
                            <Label className="text-xs text-slate-500">Email Address</Label>
                            <div className="text-sm font-medium text-slate-700">{user?.email}</div>
                            <p className="text-[10px] text-slate-400">Contact support to change email associated with account.</p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
