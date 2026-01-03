import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addressSchema, AddressFormData } from '@/lib/validation';
import { supabase } from '@/lib/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Lock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface EditAddressModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const EditAddressModal = ({ isOpen, onClose, onSuccess }: EditAddressModalProps) => {
    const { user } = useAuth();
    const [pincodeLoading, setPincodeLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors }
    } = useForm<AddressFormData>({
        resolver: zodResolver(addressSchema),
        mode: "onBlur"
    });

    const pincode = watch('pincode');

    // Pre-fill
    useEffect(() => {
        if (isOpen && user) {
            const meta = user.user_metadata || {};
            // If address exists in metadata, use it.
            // If not, we could arguably try to fetch the latest registration address, but for now let's stick to metadata or empty.
            // The prompt says "Update most recent registration's address fields" on save.
            reset({
                addressLine1: meta.address_line1 || '',
                addressLine2: meta.address_line2 || '',
                city: meta.city || '',
                state: meta.state || '',
                pincode: meta.pincode || '',
                country: meta.country || 'India'
            });
        }
    }, [isOpen, user, reset]);

    // Pincode Lookup
    useEffect(() => {
        if (pincode && pincode.length === 6) {
            const fetchLocation = async () => {
                setPincodeLoading(true);
                try {
                    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
                    const data = await response.json();

                    if (data && data[0].Status === 'Success') {
                        const place = data[0].PostOffice[0];
                        setValue('city', place.District, { shouldValidate: true });
                        setValue('state', place.State, { shouldValidate: true });
                        setValue('country', 'India');
                        toast.success("Location found!", { duration: 2000 });
                    }
                } catch (error) {
                    console.error("Pincode API Error", error);
                } finally {
                    setPincodeLoading(false);
                }
            };
            const timer = setTimeout(fetchLocation, 500);
            return () => clearTimeout(timer);
        }
    }, [pincode, setValue]);

    const onSubmit = async (data: AddressFormData) => {
        setIsSubmitting(true);
        try {
            if (!user) return;

            // 1. Update User Metadata
            const { error: metaError } = await supabase.auth.updateUser({
                data: {
                    address_line1: data.addressLine1,
                    address_line2: data.addressLine2,
                    city: data.city,
                    state: data.state,
                    pincode: data.pincode,
                    country: data.country
                }
            });

            if (metaError) throw metaError;

            // 2. Update most recent registration (if any)
            // Fetch most recent id
            const { data: latestReg } = await supabase
                .from('registrations')
                .select('id')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (latestReg) {
                await supabase
                    .from('registrations')
                    .update({
                        address_line1: data.addressLine1,
                        address_line2: data.addressLine2,
                        city: data.city,
                        state: data.state,
                        pincode: data.pincode,
                        country: data.country
                    })
                    .eq('id', latestReg.id);
            }

            toast.success("Address updated successfully");
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Update Error", error);
            toast.error(error.message || "Failed to update address");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Address</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
                    <div className="space-y-2">
                        <Label>Address Line 1</Label>
                        <Input {...register('addressLine1')} placeholder="Flat, House no., Building" />
                        {errors.addressLine1 && <p className="text-xs text-red-500">{errors.addressLine1.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Address Line 2 (Optional)</Label>
                        <Input {...register('addressLine2')} placeholder="Area, Street, Village" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Pincode</Label>
                            <div className="relative">
                                <Input {...register('pincode')} maxLength={6} placeholder="400001" />
                                {pincodeLoading && <Loader2 className="w-4 h-4 animate-spin absolute right-3 top-3 text-slate-400" />}
                            </div>
                            {errors.pincode && <p className="text-xs text-red-500">{errors.pincode.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>City</Label>
                            <Input {...register('city')} />
                            {errors.city && <p className="text-xs text-red-500">{errors.city.message}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>State</Label>
                            <Input {...register('state')} />
                            {errors.state && <p className="text-xs text-red-500">{errors.state.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Country</Label>
                            <Select defaultValue="India" onValueChange={(val) => setValue('country', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Country" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="India">India</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Save Address"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
