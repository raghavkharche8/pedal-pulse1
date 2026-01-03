import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, Truck, Package, Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { sendShippingEmail } from "@/lib/notifications";
import Papa from "papaparse";

const ShippingManagement = () => {
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("");
    const [selectedReg, setSelectedReg] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Modal State
    const [trackingNumber, setTrackingNumber] = useState("");
    const [courier, setCourier] = useState("Delhivery");
    const [updating, setUpdating] = useState(false);
    const [importing, setImporting] = useState(false);

    const fetchCompleted = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('registrations')
                .select('*')
                .eq('status', 'completed')
                .neq('medal_delivery_status', 'delivered')
                .order('verified_at', { ascending: false });

            if (error) throw error;
            setRegistrations(data || []);
        } catch (error) {
            console.error("Error fetching shipping list:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompleted();
    }, []);

    const filteredRegs = registrations.filter(r =>
        r.user_id?.toLowerCase().includes(filter.toLowerCase()) ||
        r.challenge_name?.toLowerCase().includes(filter.toLowerCase()) ||
        r.id?.includes(filter) ||
        r.full_name?.toLowerCase().includes(filter.toLowerCase())
    );

    const openUpdate = (reg: any) => {
        setSelectedReg(reg);
        setTrackingNumber(reg.medal_tracking_number || "");
        setCourier(reg.medal_courier || "Delhivery");
        setIsModalOpen(true);
    };

    const handleUpdate = async () => {
        if (!trackingNumber) {
            toast.error("Tracking number is required");
            return;
        }

        setUpdating(true);
        try {
            const { error } = await supabase
                .from('registrations')
                .update({
                    medal_tracking_number: trackingNumber,
                    medal_courier: courier,
                    medal_dispatch_date: new Date().toISOString(),
                    medal_delivery_status: 'dispatched'
                })
                .eq('id', selectedReg.id);

            if (error) throw error;

            // Send Email
            if (selectedReg.email || selectedReg.user_email) {
                await sendShippingEmail(
                    selectedReg.email || selectedReg.user_email,
                    selectedReg.full_name || "Athlete",
                    selectedReg.challenge_name,
                    trackingNumber,
                    courier
                );
            }

            toast.success("Shipping details updated and user notified.");
            setIsModalOpen(false);
            fetchCompleted();
        } catch (error: any) {
            toast.error("Failed to update shipping: " + error.message);
        } finally {
            setUpdating(false);
        }
    };

    const handleExport = () => {
        if (filteredRegs.length === 0) {
            toast.error("No data to export");
            return;
        }

        const csvData = filteredRegs.map(reg => ({
            "Registration ID": reg.id,
            "Full Name": reg.full_name || reg.user_metadata?.first_name || 'N/A',
            "Email": reg.email || reg.user_email || 'N/A',
            "Phone": reg.phone || reg.user_metadata?.phone || 'N/A',
            "Challenge": reg.challenge_name,
            "Address": reg.address || '',
            "City": reg.city || '',
            "State": reg.state || '',
            "Pincode": reg.pincode || '',
            "Dispatch Status": reg.medal_delivery_status,
            "Tracking Number": reg.medal_tracking_number || '',
            "Courier": reg.medal_courier || ''
        }));

        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `shipping_data_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        toast.success("Exported shipping data successfully.");
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setImporting(true);
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results: any) => {
                const rows = results.data;
                let updatedCount = 0;
                let errors = 0;

                toast.info(`Processing ${rows.length} records...`);

                for (const row of rows) {
                    const regId = row['Registration ID'];
                    const tracking = row['Tracking Number'];
                    const courierName = row['Courier'] || 'Delhivery';

                    if (!regId || !tracking) continue;

                    try {
                        // 1. Update DB
                        const { error } = await supabase
                            .from('registrations')
                            .update({
                                medal_tracking_number: tracking,
                                medal_courier: courierName,
                                medal_delivery_status: 'dispatched',
                                medal_dispatch_date: new Date().toISOString()
                            })
                            .eq('id', regId);

                        if (error) throw error;

                        // 2. Fetch User to Send Email (Optimized: we could map from existing data if available, but safe to fetch or skip)
                        // For bulk, let's try to notify.
                        // We need email and name.
                        const { data: regData } = await supabase
                            .from('registrations')
                            .select('email, user_email, full_name, challenge_name')
                            .eq('id', regId)
                            .single();

                        if (regData) {
                            await sendShippingEmail(
                                regData.email || regData.user_email,
                                regData.full_name || "Athlete",
                                regData.challenge_name,
                                tracking,
                                courierName
                            );
                        }

                        updatedCount++;
                    } catch (e) {
                        console.error(`Failed to update ID ${regId}`, e);
                        errors++;
                    }
                }

                setImporting(false);
                toast.success(`Import complete! Updated: ${updatedCount}, Failed: ${errors}`);
                fetchCompleted();
                if (fileInputRef.current) fileInputRef.current.value = "";
            },
            error: (err) => {
                toast.error("CSV Parse Error: " + err.message);
                setImporting(false);
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Shipping Management</h2>
                    <p className="text-slate-500">Manage medal dispatch for completed finishers.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleExport}>
                        <Download className="w-4 h-4 mr-2" /> Export CSV
                    </Button>
                    <Button variant="outline" onClick={handleImportClick} disabled={importing}>
                        {importing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                        Import CSV
                    </Button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept=".csv"
                        className="hidden"
                    />
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Search ID, User..."
                        className="pl-9 bg-white"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="w-[100px]">ID</TableHead>
                            <TableHead>Finisher</TableHead>
                            <TableHead>Challenge</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead>Completion Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-32 text-center">
                                    <div className="flex items-center justify-center gap-2 text-slate-500">
                                        <Loader2 className="w-5 h-5 animate-spin" /> Loading...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredRegs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-32 text-center text-slate-500">
                                    No pending shipments found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredRegs.map((reg) => (
                                <TableRow key={reg.id}>
                                    <TableCell className="font-mono text-xs text-slate-500">
                                        {String(reg.id || '').slice(0, 8)}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {reg.full_name || reg.email || reg.user_id || 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        {reg.challenge_name || 'N/A'}
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate text-xs text-slate-600" title={reg.address || reg.city || ''}>
                                        {reg.address ? reg.address.slice(0, 30) + '...' : reg.city || 'N/A'}
                                    </TableCell>
                                    <TableCell className="text-xs">
                                        {reg.verified_at ? new Date(reg.verified_at).toLocaleDateString() : 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={reg.medal_delivery_status === 'dispatched' ? 'default' : 'secondary'}>
                                            {reg.medal_delivery_status === 'not_shipped' ? 'Pending' : 'Dispatched'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button size="sm" variant="outline" onClick={() => openUpdate(reg)}>
                                            <Truck className="w-4 h-4 mr-1" /> Update
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Shipping</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Courier Service</Label>
                            <Select value={courier} onValueChange={setCourier}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Delhivery">Delhivery</SelectItem>
                                    <SelectItem value="BlueDart">BlueDart</SelectItem>
                                    <SelectItem value="DTDC">DTDC</SelectItem>
                                    <SelectItem value="India Post">India Post</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Tracking Number</Label>
                            <Input
                                placeholder="Enter tracking ID"
                                value={trackingNumber}
                                onChange={(e) => setTrackingNumber(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpdate} disabled={updating}>
                            {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save & Notify"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ShippingManagement;
