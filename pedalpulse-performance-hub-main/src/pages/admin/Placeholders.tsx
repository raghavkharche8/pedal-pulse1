import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Download, RefreshCw } from "lucide-react";
import Papa from "papaparse";
import { toast } from "sonner";

export const RegistrationList = () => {
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const fetchRegistrations = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('registrations')
                .select('*')
                .order('created_at', { ascending: false });

            if (statusFilter !== 'all') {
                if (statusFilter === 'pending_payment') query = query.eq('status', 'pending');
                else if (statusFilter === 'completed') query = query.eq('status', 'completed');
                else if (statusFilter === 'proof_submitted') query = query.eq('verification_status', 'pending');
            }

            const { data, error } = await query;

            if (error) throw error;
            setRegistrations(data || []);
        } catch (error) {
            console.error("Error fetching registrations:", error);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRegistrations();
    }, [statusFilter]);

    const filteredRegs = registrations.filter(r =>
        (r.full_name?.toLowerCase() || "").includes(filter.toLowerCase()) ||
        (r.email?.toLowerCase() || "").includes(filter.toLowerCase()) ||
        (r.challenge_name?.toLowerCase() || "").includes(filter.toLowerCase()) ||
        r.id?.includes(filter)
    );

    const handleExport = () => {
        const csv = Papa.unparse(filteredRegs.map(r => ({
            ID: r.id,
            Name: r.full_name,
            Email: r.email,
            Challenge: r.challenge_name,
            Distance: r.sport_distance,
            Status: r.status,
            Verification: r.verification_status,
            Date: new Date(r.created_at).toLocaleDateString()
        })));

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `registrations_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">All Registrations</h2>
                    <p className="text-slate-500">View and manage all participant records.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchRegistrations}>
                        <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                    </Button>
                    <Button variant="secondary" onClick={handleExport}>
                        <Download className="w-4 h-4 mr-2" /> Export CSV
                    </Button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Search by name, email, challenge..."
                        className="pl-9"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        className="h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="completed">Completed</option>
                        <option value="proof_submitted">Pending Verification</option>
                        <option value="pending_payment">Pending Payment</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="w-[100px]">ID</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Challenge</TableHead>
                            <TableHead>Registered On</TableHead>
                            <TableHead>Payment</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center">
                                    <div className="flex items-center justify-center gap-2 text-slate-500">
                                        <Loader2 className="w-5 h-5 animate-spin" /> Loading...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredRegs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                                    No records found matching your filters.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredRegs.map((reg) => (
                                <TableRow key={reg.id}>
                                    <TableCell className="font-mono text-xs text-slate-500">
                                        {String(reg.id || '').slice(0, 8)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium text-sm">{reg.full_name || "Guest User"}</div>
                                        <div className="text-xs text-slate-500">{reg.email || 'N/A'}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">{reg.challenge_name || 'N/A'}</div>
                                        <div className="text-xs text-slate-500">{reg.sport_distance || 'N/A'}</div>
                                    </TableCell>
                                    <TableCell className="text-xs">
                                        {reg.created_at ? new Date(reg.created_at).toLocaleDateString() : 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={reg.payment_status === 'paid' ? 'text-green-600 bg-green-50 border-green-200' : 'text-orange-600 bg-orange-50'}>
                                            {reg.payment_status || 'Pending'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            {reg.status === 'completed' && <Badge className="bg-green-600 w-fit">Completed</Badge>}
                                            {reg.verification_status === 'pending' && reg.proof_submission_date && <Badge variant="secondary" className="w-fit">Needs Verification</Badge>}
                                            {reg.verification_status === 'rejected' && <Badge variant="destructive" className="w-fit">Proof Rejected</Badge>}
                                            {!reg.proof_submission_date && reg.payment_status === 'paid' && <span className="text-xs text-slate-500">Waiting for proof</span>}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="text-xs text-slate-400 text-center">
                Showing {filteredRegs.length} records
            </div>
        </div>
    );
};

export const AdminReports = () => {
    // Basic placeholder for now, as full analytics require more complex queries
    return (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
            <div className="bg-slate-100 p-6 rounded-full">
                <Download className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Reports & Analytics</h2>
            <p className="text-slate-500 max-w-md">Detailed analytics are under development. You can export raw data from the 'All Registrations' page in the meantime.</p>
        </div>
    );
};

