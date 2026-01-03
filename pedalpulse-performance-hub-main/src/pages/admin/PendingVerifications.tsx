import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Eye } from "lucide-react";
import { VerificationModal } from "@/components/admin/VerificationModal";

const PendingVerifications = () => {
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("");
    const [selectedReg, setSelectedReg] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchPending = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('registrations')
                .select('*') // In production, select specific columns and join with user metadata if possible
                .eq('verification_status', 'pending')
                .not('proof_submission_date', 'is', null) // Only actual submissions
                .order('proof_submission_date', { ascending: true }); // Oldest first

            if (error) throw error;
            setRegistrations(data || []);
        } catch (error) {
            console.error("Error fetching pending verifications:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPending();
    }, []);

    const filteredRegs = registrations.filter(r =>
        r.user_id?.toLowerCase().includes(filter.toLowerCase()) ||
        r.challenge_name?.toLowerCase().includes(filter.toLowerCase()) ||
        r.id?.includes(filter)
    );

    const openVerify = (reg: any) => {
        setSelectedReg(reg);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Pending Verifications</h2>
                    <p className="text-slate-500">Review and approve athlete proofs.</p>
                </div>
                <div className="relative w-64">
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
                            <TableHead>Challenge</TableHead>
                            <TableHead>Activity Date</TableHead>
                            <TableHead>Distance</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead>Submitted</TableHead>
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
                                    No pending verifications found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredRegs.map((reg) => (
                                <TableRow key={reg.id}>
                                    <TableCell className="font-mono text-xs text-slate-500">
                                        {String(reg.id || '').slice(0, 8)}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {reg.challenge_name || 'N/A'}
                                        <div className="text-xs text-slate-500 font-normal">{reg.sport_distance || 'N/A'}</div>
                                    </TableCell>
                                    <TableCell>{reg.activity_date || 'N/A'}</TableCell>
                                    <TableCell>{reg.activity_distance || '0'} km</TableCell>
                                    <TableCell>{reg.activity_time || 'N/A'}</TableCell>
                                    <TableCell className="text-slate-500 text-xs">
                                        {reg.proof_submission_date ? new Date(reg.proof_submission_date).toLocaleDateString() : 'N/A'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button size="sm" onClick={() => openVerify(reg)}>
                                            <Eye className="w-4 h-4 mr-1" /> Review
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <VerificationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                registration={selectedReg}
                onStatusChange={fetchPending}
            />
        </div>
    );
};

export default PendingVerifications;
