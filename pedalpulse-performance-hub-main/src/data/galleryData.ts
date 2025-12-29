// Gallery image data with participant metadata
// Images located in /src/Gallery folder

export interface GalleryImage {
    id: string;
    src: string;
    participantName: string;
    distance: string;
    activity: 'Running' | 'Cycling' | 'Walking';
    time: string;
    location: string;
    challenge: string;
    challengeDate: string;
    aspectRatio?: 'portrait' | 'landscape' | 'square';
}

export const challengeFilters = [
    { id: 'all', label: 'All Challenges' },
    { id: 'republic-2026', label: 'Republic Day 2026' },
    { id: 'independence-2025', label: 'Independence Day 2025' },
    { id: 'womens-2025', label: "Women's Day 2025" },
] as const;

export type ChallengeFilter = typeof challengeFilters[number]['id'];

// Import all gallery images
import img1 from '@/Gallery/05113f8e-e818-40c8-8448-1e07b32f40b4.jpg';
import img2 from '@/Gallery/135290-140550-1580175539287743.jpeg';
import img3 from '@/Gallery/135290-140550-1766927767222573.jpeg';
import img4 from '@/Gallery/135290-140550-2051056305379431.jpeg';
import img5 from '@/Gallery/135290-140550-2148410742256117.jpeg';
import img6 from '@/Gallery/135290-140550-2432344447142251.jpeg';
import img7 from '@/Gallery/135290-140550-657911646879781.jpeg';
import img8 from '@/Gallery/135290-140550-664365442890541.jpeg';
import img9 from '@/Gallery/135290-140550-902788365254223.jpeg';
import img10 from '@/Gallery/3e8d1394-7e90-47e8-adc3-521d717a84ad.jpg';
import img11 from '@/Gallery/477091450_18058022885296493_5791730719235603806_n.jpeg';
import img12 from '@/Gallery/477201603_18058022876296493_8541394955454873101_n.jpeg';
import img13 from '@/Gallery/7f77c17e-241b-436e-a72a-054bef637db6.jpg';
import img14 from '@/Gallery/WhatsApp Image 2024-06-11 at 12.27.25 PM.jpeg';
import img15 from '@/Gallery/WhatsApp Image 2024-07-14 at 09.34.01_be5edb9d.jpg';
import img16 from '@/Gallery/WhatsApp Image 2024-07-14 at 09.34.13_ad27e93c.jpg';
import img17 from '@/Gallery/WhatsApp Image 2024-07-14 at 09.35.06_233d5527.jpg';
import img18 from '@/Gallery/WhatsApp Image 2024-07-14 at 09.35_edited.jpg';
import img19 from '@/Gallery/WhatsApp Image 2024-07-14 at 09.36.31_592dde2e.jpg';
import img20 from '@/Gallery/WhatsApp Image 2025-05-18 at 6.28.11 PM.jpeg';
import img21 from '@/Gallery/WhatsApp Image 2025-05-23 at 1.53.30 PM.jpeg';
import img22 from '@/Gallery/WhatsApp Image 2025-05-23 at 10.44.02 AM.jpeg';
import img23 from '@/Gallery/WhatsApp Image 2025-05-23 at 8.29.34 PM.jpeg';
import img24 from '@/Gallery/ab6d06df8b58d3c7345ddb4ce782ed936b1dca3d.jpg';
import img25 from '@/Gallery/b4db1f0c-7b48-4d1c-a84c-67f64fff5a1b.jpg';
import img26 from '@/Gallery/c82d682c-4317-46da-b111-ed8e37e21031.jpg';
import img27 from '@/Gallery/d52c5f9f-550c-4f71-bd9f-3267fb31e7c8.jpg';
import img28 from '@/Gallery/f4bbd940-9c1a-44b8-aefd-724ab458307e.jpg';
import img29 from '@/Gallery/fb4a36e3-e910-4dd0-82a3-5c3609b9cd6d.jpg';
import img30 from '@/Gallery/Screenshot 2025-03-31 154128.png';
import img31 from '@/Gallery/Screenshot 2025-03-31 154450.png';
import img32 from '@/Gallery/Screenshot 2025-03-31 154637.png';

// Gallery data with participant metadata
export const galleryImages: GalleryImage[] = [
    {
        id: '1',
        src: img1,
        participantName: 'Rajesh Kumar',
        distance: '50 KM',
        activity: 'Cycling',
        time: '2h 34m',
        location: 'Mumbai, India',
        challenge: 'Republic Day 2026',
        challengeDate: '20-26 January 2026',
        aspectRatio: 'portrait',
    },
    {
        id: '2',
        src: img2,
        participantName: 'Priya Sharma',
        distance: '21 KM',
        activity: 'Running',
        time: '2h 15m',
        location: 'Delhi, India',
        challenge: 'Independence Day 2025',
        challengeDate: '10-15 August 2025',
        aspectRatio: 'portrait',
    },
    {
        id: '3',
        src: img3,
        participantName: 'Amit Patel',
        distance: '100 KM',
        activity: 'Cycling',
        time: '5h 45m',
        location: 'Bangalore, India',
        challenge: 'Republic Day 2026',
        challengeDate: '20-26 January 2026',
        aspectRatio: 'landscape',
    },
    {
        id: '4',
        src: img4,
        participantName: 'Sneha Reddy',
        distance: '10 KM',
        activity: 'Running',
        time: '58m',
        location: 'Hyderabad, India',
        challenge: "Women's Day 2025",
        challengeDate: '1-8 March 2025',
        aspectRatio: 'portrait',
    },
    {
        id: '5',
        src: img5,
        participantName: 'Vikram Singh',
        distance: '25 KM',
        activity: 'Cycling',
        time: '1h 20m',
        location: 'Pune, India',
        challenge: 'Independence Day 2025',
        challengeDate: '10-15 August 2025',
        aspectRatio: 'portrait',
    },
    {
        id: '6',
        src: img6,
        participantName: 'Ananya Iyer',
        distance: '5 KM',
        activity: 'Walking',
        time: '45m',
        location: 'Chennai, India',
        challenge: "Women's Day 2025",
        challengeDate: '1-8 March 2025',
        aspectRatio: 'portrait',
    },
    {
        id: '7',
        src: img7,
        participantName: 'Rohit Menon',
        distance: '50 KM',
        activity: 'Cycling',
        time: '2h 50m',
        location: 'Kochi, India',
        challenge: 'Republic Day 2026',
        challengeDate: '20-26 January 2026',
        aspectRatio: 'portrait',
    },
    {
        id: '8',
        src: img8,
        participantName: 'Kavitha Nair',
        distance: '21 KM',
        activity: 'Running',
        time: '2h 05m',
        location: 'Trivandrum, India',
        challenge: "Women's Day 2025",
        challengeDate: '1-8 March 2025',
        aspectRatio: 'landscape',
    },
    {
        id: '9',
        src: img9,
        participantName: 'Suresh Babu',
        distance: '75 KM',
        activity: 'Cycling',
        time: '4h 10m',
        location: 'Coimbatore, India',
        challenge: 'Independence Day 2025',
        challengeDate: '10-15 August 2025',
        aspectRatio: 'portrait',
    },
    {
        id: '10',
        src: img10,
        participantName: 'Deepika Verma',
        distance: '10 KM',
        activity: 'Running',
        time: '1h 02m',
        location: 'Jaipur, India',
        challenge: 'Republic Day 2026',
        challengeDate: '20-26 January 2026',
        aspectRatio: 'portrait',
    },
    {
        id: '11',
        src: img11,
        participantName: 'Arjun Das',
        distance: '100 KM',
        activity: 'Cycling',
        time: '6h 20m',
        location: 'Kolkata, India',
        challenge: 'Independence Day 2025',
        challengeDate: '10-15 August 2025',
        aspectRatio: 'portrait',
    },
    {
        id: '12',
        src: img12,
        participantName: 'Meera Krishnan',
        distance: '5 KM',
        activity: 'Running',
        time: '32m',
        location: 'Mysore, India',
        challenge: "Women's Day 2025",
        challengeDate: '1-8 March 2025',
        aspectRatio: 'portrait',
    },
    {
        id: '13',
        src: img13,
        participantName: 'Nikhil Rao',
        distance: '50 KM',
        activity: 'Cycling',
        time: '2h 45m',
        location: 'Ahmedabad, India',
        challenge: 'Republic Day 2026',
        challengeDate: '20-26 January 2026',
        aspectRatio: 'portrait',
    },
    {
        id: '14',
        src: img14,
        participantName: 'Pooja Gupta',
        distance: '10 KM',
        activity: 'Walking',
        time: '1h 35m',
        location: 'Lucknow, India',
        challenge: "Women's Day 2025",
        challengeDate: '1-8 March 2025',
        aspectRatio: 'square',
    },
    {
        id: '15',
        src: img15,
        participantName: 'Karthik Raja',
        distance: '25 KM',
        activity: 'Cycling',
        time: '1h 15m',
        location: 'Madurai, India',
        challenge: 'Independence Day 2025',
        challengeDate: '10-15 August 2025',
        aspectRatio: 'portrait',
    },
    {
        id: '16',
        src: img16,
        participantName: 'Lakshmi Sundaram',
        distance: '21 KM',
        activity: 'Running',
        time: '2h 25m',
        location: 'Salem, India',
        challenge: 'Republic Day 2026',
        challengeDate: '20-26 January 2026',
        aspectRatio: 'portrait',
    },
    {
        id: '17',
        src: img17,
        participantName: 'Sanjay Pillai',
        distance: '75 KM',
        activity: 'Cycling',
        time: '4h 30m',
        location: 'Nagpur, India',
        challenge: 'Independence Day 2025',
        challengeDate: '10-15 August 2025',
        aspectRatio: 'portrait',
    },
    {
        id: '18',
        src: img18,
        participantName: 'Divya Menon',
        distance: '10 KM',
        activity: 'Running',
        time: '55m',
        location: 'Bhopal, India',
        challenge: "Women's Day 2025",
        challengeDate: '1-8 March 2025',
        aspectRatio: 'portrait',
    },
    {
        id: '19',
        src: img19,
        participantName: 'Ganesh Iyer',
        distance: '50 KM',
        activity: 'Cycling',
        time: '2h 55m',
        location: 'Indore, India',
        challenge: 'Republic Day 2026',
        challengeDate: '20-26 January 2026',
        aspectRatio: 'portrait',
    },
    {
        id: '20',
        src: img20,
        participantName: 'Radha Krishnamurthy',
        distance: '5 KM',
        activity: 'Walking',
        time: '48m',
        location: 'Chandigarh, India',
        challenge: "Women's Day 2025",
        challengeDate: '1-8 March 2025',
        aspectRatio: 'portrait',
    },
    {
        id: '21',
        src: img21,
        participantName: 'Mohan Lal',
        distance: '100 KM',
        activity: 'Cycling',
        time: '5h 50m',
        location: 'Vishakhapatnam, India',
        challenge: 'Independence Day 2025',
        challengeDate: '10-15 August 2025',
        aspectRatio: 'portrait',
    },
    {
        id: '22',
        src: img22,
        participantName: 'Sunita Devi',
        distance: '21 KM',
        activity: 'Running',
        time: '2h 10m',
        location: 'Patna, India',
        challenge: 'Republic Day 2026',
        challengeDate: '20-26 January 2026',
        aspectRatio: 'landscape',
    },
    {
        id: '23',
        src: img23,
        participantName: 'Ravi Shankar',
        distance: '25 KM',
        activity: 'Cycling',
        time: '1h 25m',
        location: 'Ranchi, India',
        challenge: 'Independence Day 2025',
        challengeDate: '10-15 August 2025',
        aspectRatio: 'landscape',
    },
    {
        id: '24',
        src: img24,
        participantName: 'Anjali Kapoor',
        distance: '10 KM',
        activity: 'Running',
        time: '1h 05m',
        location: 'Guwahati, India',
        challenge: "Women's Day 2025",
        challengeDate: '1-8 March 2025',
        aspectRatio: 'portrait',
    },
    {
        id: '25',
        src: img25,
        participantName: 'Prakash Joshi',
        distance: '75 KM',
        activity: 'Cycling',
        time: '4h 15m',
        location: 'Dehradun, India',
        challenge: 'Republic Day 2026',
        challengeDate: '20-26 January 2026',
        aspectRatio: 'portrait',
    },
    {
        id: '26',
        src: img26,
        participantName: 'Nandini Shetty',
        distance: '5 KM',
        activity: 'Running',
        time: '28m',
        location: 'Mangalore, India',
        challenge: "Women's Day 2025",
        challengeDate: '1-8 March 2025',
        aspectRatio: 'portrait',
    },
    {
        id: '27',
        src: img27,
        participantName: 'Venkat Raman',
        distance: '50 KM',
        activity: 'Cycling',
        time: '2h 40m',
        location: 'Tirupati, India',
        challenge: 'Independence Day 2025',
        challengeDate: '10-15 August 2025',
        aspectRatio: 'portrait',
    },
    {
        id: '28',
        src: img28,
        participantName: 'Shweta Agarwal',
        distance: '10 KM',
        activity: 'Walking',
        time: '1h 40m',
        location: 'Varanasi, India',
        challenge: 'Republic Day 2026',
        challengeDate: '20-26 January 2026',
        aspectRatio: 'portrait',
    },
    {
        id: '29',
        src: img29,
        participantName: 'Harish Chand',
        distance: '100 KM',
        activity: 'Cycling',
        time: '6h 05m',
        location: 'Surat, India',
        challenge: 'Independence Day 2025',
        challengeDate: '10-15 August 2025',
        aspectRatio: 'portrait',
    },
    {
        id: '30',
        src: img30,
        participantName: 'Geeta Rani',
        distance: '21 KM',
        activity: 'Running',
        time: '2h 20m',
        location: 'Amritsar, India',
        challenge: "Women's Day 2025",
        challengeDate: '1-8 March 2025',
        aspectRatio: 'landscape',
    },
    {
        id: '31',
        src: img31,
        participantName: 'Anil Kumar',
        distance: '25 KM',
        activity: 'Cycling',
        time: '1h 18m',
        location: 'Jodhpur, India',
        challenge: 'Republic Day 2026',
        challengeDate: '20-26 January 2026',
        aspectRatio: 'landscape',
    },
    {
        id: '32',
        src: img32,
        participantName: 'Rekha Sharma',
        distance: '5 KM',
        activity: 'Walking',
        time: '42m',
        location: 'Udaipur, India',
        challenge: "Women's Day 2025",
        challengeDate: '1-8 March 2025',
        aspectRatio: 'landscape',
    },
];

// Filter images by challenge
export const filterByChallenge = (images: GalleryImage[], filter: ChallengeFilter): GalleryImage[] => {
    if (filter === 'all') return images;

    const challengeMap: Record<ChallengeFilter, string> = {
        'all': '',
        'republic-2026': 'Republic Day 2026',
        'independence-2025': 'Independence Day 2025',
        'womens-2025': "Women's Day 2025",
    };

    return images.filter(img => img.challenge === challengeMap[filter]);
};

// Get challenge stats
export const getGalleryStats = () => {
    const uniqueChallenges = new Set(galleryImages.map(img => img.challenge));
    const uniqueLocations = new Set(galleryImages.map(img => img.location.split(',')[0]));

    return {
        finishers: galleryImages.length,
        challenges: uniqueChallenges.size,
        cities: uniqueLocations.size,
    };
};
