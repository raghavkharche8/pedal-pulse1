// TypeScript interfaces for Admin Panel data structures

export interface Registration {
    id: string;
    user_id: string;
    challenge_name: string;
    sport: string;
    sport_distance: string;
    full_name?: string;
    email?: string;
    user_email?: string;
    phone?: string;
    gender?: string;
    age?: number;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    payment_id?: string;
    payment_status: 'pending' | 'paid' | 'failed';
    status: 'pending' | 'registered' | 'proof_submitted' | 'completed';
    verification_status: 'pending' | 'approved' | 'rejected';
    proof_submission_date?: string;
    proof_image_url?: string;
    activity_date?: string;
    activity_distance?: number;
    activity_time?: string;
    activity_notes?: string;
    verification_notes?: string;
    verified_at?: string;
    verified_by?: string;
    certificate_url?: string;
    medal_tracking_number?: string;
    medal_courier?: string;
    medal_dispatch_date?: string;
    medal_delivery_status: 'not_shipped' | 'dispatched' | 'in_transit' | 'out_for_delivery' | 'delivered';
    created_at: string;
    updated_at?: string;
}

export interface AdminUser {
    id: string;
    user_id: string;
    email: string;
    role: 'admin' | 'super_admin';
    full_name?: string;
    created_at: string;
}

export interface DashboardStats {
    totalRegistrations: number;
    pendingVerifications: number;
    completedChallenges: number;
    totalRevenue: number;
    medalsShipped: number;
    averageCompletionRate: number;
}

export interface ChartDataPoint {
    name: string;
    value: number;
    date?: string;
}

export interface FilterOptions {
    status?: string;
    challenge?: string;
    sport?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
}
