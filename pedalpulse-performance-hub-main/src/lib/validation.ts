import { z } from 'zod';

const phoneRegex = /^[0-9]{10}$/;

// Reusable atomic schemas
export const personalDetailsSchema = z.object({
    firstName: z.string().min(2, "Please enter a valid first name"),
    lastName: z.string().min(2, "Please enter a valid last name"),
    countryCode: z.string(),
    phone: z.string().regex(phoneRegex, "Please enter a valid 10-digit phone number"),
    gender: z.enum(["Male", "Female", "Other", "Prefer not to say"], { required_error: "Please select gender" }),
});

export const addressSchema = z.object({
    addressLine1: z.string().min(3, "Address is required"),
    addressLine2: z.string().optional(),
    pincode: z.string().length(6, "Pincode must be exactly 6 digits").regex(/^\d+$/, "Only numbers allowed"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    country: z.string().default("India"),
});

export const registrationSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    confirmPhone: z.string().regex(phoneRegex, "Please enter a valid 10-digit phone number"),

    sportDistance: z.string().min(1, "Please select a challenge"),
    courier: z.string().min(1, "Please select a courier preference"),

    source: z.string().min(1, "Please tell us how you found us"),
    clubName: z.string().optional(),
    password: z.string().min(6, "Password must be at least 6 characters").or(z.literal("")).optional(),
    verificationMethod: z.enum(["manual", "strava_auto"]).default("manual"),

    terms: z.boolean().refine(val => val === true, "You must agree to terms and conditions"),
})
    .merge(personalDetailsSchema)
    .merge(addressSchema)
    .refine((data) => data.phone === data.confirmPhone, {
        message: "Phone numbers do not match",
        path: ["confirmPhone"], // path of error
    });

export type ProfileFormData = z.infer<typeof personalDetailsSchema>;
export type AddressFormData = z.infer<typeof addressSchema>;
export type RegistrationFormData = z.infer<typeof registrationSchema>;
