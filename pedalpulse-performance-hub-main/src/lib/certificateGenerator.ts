import { jsPDF } from "jspdf";
import { supabase } from "./supabase";

export const generateCertificate = async (registration: any, userName: string) => {
    try {
        // 1. Create PDF
        const doc = new jsPDF({
            orientation: "landscape",
            unit: "px",
            format: [800, 600] // Custom landscape size
        });

        // Background / Border
        doc.setLineWidth(10);
        doc.setDrawColor(255, 215, 0); // Gold
        doc.rect(20, 20, 760, 560);

        doc.setLineWidth(2);
        doc.setDrawColor(0, 0, 0);
        doc.rect(35, 35, 730, 530);

        // Header
        doc.setFont("helvetica", "bold");
        doc.setFontSize(40);
        doc.setTextColor(33, 33, 33);
        doc.text("CERTIFICATE OF COMPLETION", 400, 100, { align: "center" });

        // Challenge Name
        doc.setFontSize(24);
        doc.setTextColor(249, 115, 22); // Orange/Primary
        doc.text(registration.challenge_name || "Challenge Name", 400, 160, { align: "center" });

        // Presented To
        doc.setFont("helvetica", "normal");
        doc.setFontSize(16);
        doc.setTextColor(100);
        doc.text("This certificate is proudly presented to", 400, 220, { align: "center" });

        // User Name
        doc.setFont("helvetica", "bold");
        doc.setFontSize(36);
        doc.setTextColor(0);
        doc.text(userName, 400, 280, { align: "center" });

        // Details
        doc.setFont("helvetica", "normal");
        doc.setFontSize(18);
        doc.setTextColor(60);

        const text = `For successfully completing the ${registration.sport_distance} event\non ${new Date(registration.activity_date).toLocaleDateString()}.`;
        doc.text(text, 400, 360, { align: "center", lineHeightFactor: 1.5 });

        // Stats
        doc.setFontSize(16);
        doc.text(`Time: ${registration.activity_time || 'N/A'}   |   Distance: ${registration.activity_distance} km`, 400, 420, { align: "center" });

        // Footer / Signature (Mock)
        doc.setLineWidth(1);
        doc.line(250, 500, 550, 500);
        doc.setFontSize(12);
        doc.text("PedalPulse Team", 400, 520, { align: "center" });

        // 2. Generate Blob
        const pdfBlob = doc.output("blob");

        // 3. Upload to Supabase
        const fileName = `${registration.user_id}/${registration.id}/certificate-${Date.now()}.pdf`;

        const { error: uploadError } = await supabase.storage
            .from('certificates')
            .upload(fileName, pdfBlob, {
                contentType: 'application/pdf',
                upsert: true
            });

        if (uploadError) throw uploadError;

        // 4. Get URL
        const { data: { publicUrl } } = supabase.storage
            .from('certificates')
            .getPublicUrl(fileName);

        return publicUrl;

    } catch (error) {
        console.error("Certificate Generation Error:", error);
        throw error;
    }
};
