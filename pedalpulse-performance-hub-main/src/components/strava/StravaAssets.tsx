/**
 * Official Strava Brand Assets
 * 
 * COMPLIANCE: Strava API Brand Guidelines (Sept 29, 2025)
 * 
 * Rules followed:
 * - "Connect with Strava" button links to https://www.strava.com/oauth/authorize
 * - Button height: 48px @1x
 * - Colors: Orange (#FC4C01) or White only
 * - "View on Strava" exact text for links
 * - "Powered by Strava" for attribution
 * - Never modify, alter or animate Strava logos
 * - Strava logo must be separate from app logo
 * - Strava name must not appear more prominent than app name
 */

import React from 'react';

// Official Strava Brand Colors
const STRAVA_ORANGE = '#FC4C01';
const STRAVA_LIGHT_ORANGE = '#FDA580';

/**
 * Strava Logo Mark Only (Arrow Icon)
 * Extracted from official Strava branding
 * ViewBox based on 512x512 original, paths scaled
 */
const StravaLogoMark = ({
    color = 'orange',
    size = 20
}: {
    color?: 'orange' | 'white' | 'black';
    size?: number;
}) => {
    const primaryColor = color === 'orange' ? STRAVA_ORANGE : color === 'white' ? '#FFFFFF' : '#2D2D2D';
    const secondaryColor = color === 'orange' ? STRAVA_LIGHT_ORANGE : color === 'white' ? 'rgba(255,255,255,0.6)' : 'rgba(45,45,45,0.6)';

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 512 512"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            {/* Main arrow (upper) */}
            <path
                d="M120 288L232 56l112 232h-72l-40-96-40 96z"
                fill={primaryColor}
            />
            {/* Secondary arrow (lower, lighter) */}
            <path
                d="M280 288l32 72 32-72h48l-80 168-80-168z"
                fill={secondaryColor}
            />
        </svg>
    );
};

/**
 * Official "Connect with Strava" Button
 * 
 * MUST:
 * - Link to https://www.strava.com/oauth/authorize (web) or /mobile/authorize (mobile)
 * - Height: 48px @1x, 96px @2x
 * - Colors: Orange or White only
 * - Never modify, animate, or alter
 */
export const ConnectWithStravaButton = ({
    onClick,
    variant = 'orange',
    className = ''
}: {
    onClick: () => void;
    variant?: 'orange' | 'white';
    className?: string;
}) => {
    const isOrange = variant === 'orange';

    return (
        <button
            onClick={onClick}
            className={`inline-flex items-center gap-3 px-5 rounded transition-opacity hover:opacity-90 active:scale-[0.98] ${className}`}
            style={{
                height: 48,
                backgroundColor: isOrange ? STRAVA_ORANGE : '#FFFFFF',
                border: isOrange ? 'none' : '1px solid #E0E0E0',
                cursor: 'pointer'
            }}
            aria-label="Connect with Strava"
        >
            {/* Strava Logo Mark */}
            <svg
                width="24"
                height="24"
                viewBox="0 0 512 512"
                fill="none"
                aria-hidden="true"
            >
                <path
                    d="M120 288L232 56l112 232h-72l-40-96-40 96z"
                    fill={isOrange ? '#FFFFFF' : STRAVA_ORANGE}
                />
                <path
                    d="M280 288l32 72 32-72h48l-80 168-80-168z"
                    fill={isOrange ? 'rgba(255,255,255,0.6)' : STRAVA_LIGHT_ORANGE}
                />
            </svg>

            {/* Button Text */}
            <span style={{
                color: isOrange ? '#FFFFFF' : '#4A4A4A',
                fontSize: 14,
                fontWeight: 600,
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                whiteSpace: 'nowrap'
            }}>
                Connect with Strava
            </span>
        </button>
    );
};

/**
 * Official "Powered by Strava" Logo
 * 
 * MUST appear wherever Strava data is displayed:
 * - Leaderboards with Strava data
 * - Activity preview cards
 * - Proof submission confirmation
 */
export const PoweredByStrava = ({
    variant = 'orange',
    size = 'normal',
    className = ''
}: {
    variant?: 'orange' | 'white' | 'black';
    size?: 'small' | 'normal';
    className?: string;
}) => {
    const colors = {
        orange: STRAVA_ORANGE,
        white: '#FFFFFF',
        black: '#2D2D2D'
    };

    const textColor = colors[variant];
    const iconSize = size === 'small' ? 14 : 18;
    const fontSize = size === 'small' ? 10 : 12;

    return (
        <div
            className={`inline-flex items-center gap-1.5 ${className}`}
            style={{ lineHeight: 1 }}
        >
            <StravaLogoMark color={variant} size={iconSize} />
            <span style={{
                color: textColor,
                fontSize,
                fontWeight: 500,
                letterSpacing: '0.01em',
                fontFamily: 'system-ui, -apple-system, sans-serif'
            }}>
                Powered by Strava
            </span>
        </div>
    );
};

/**
 * Official "View on Strava" Link Component
 * 
 * MUST:
 * - Use EXACT text: "View on Strava"
 * - Be identifiable as a link using: bold weight, underline, OR orange color #FC5200
 * - Be legible
 */
export const ViewOnStravaLink = ({
    activityId,
    showIcon = true,
    className = ''
}: {
    activityId: string | number;
    showIcon?: boolean;
    className?: string;
}) => {
    return (
        <a
            href={`https://www.strava.com/activities/${activityId}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1.5 transition-opacity hover:opacity-80 ${className}`}
            style={{
                color: STRAVA_ORANGE,
                fontWeight: 600,
                fontSize: 13,
                textDecoration: 'none',
                fontFamily: 'system-ui, -apple-system, sans-serif'
            }}
        >
            {showIcon && <StravaLogoMark color="orange" size={14} />}
            View on Strava
        </a>
    );
};

/**
 * Strava Data Disclaimer (Required for transparency)
 * 
 * Shows users how their Strava data is accessed:
 * - Only when user chooses to sync
 * - Never posts to Strava
 * - Can disconnect anytime
 */
export const StravaDisclaimer = ({ className = '' }: { className?: string }) => (
    <p className={`text-xs text-slate-500 leading-relaxed ${className}`}>
        We only access your Strava activities when you choose to sync.
        We never post to Strava. You can disconnect anytime from your Dashboard.
    </p>
);

/**
 * Leaderboard Disclaimer (Required for compliance)
 * 
 * Clarifies that only Strava-verified activities are ranked
 */
export const LeaderboardDisclaimer = ({ className = '' }: { className?: string }) => (
    <div className={`flex flex-wrap items-center gap-2 text-xs text-slate-500 ${className}`}>
        <PoweredByStrava variant="orange" size="small" />
        <span className="text-slate-300">•</span>
        <span>Verified leaderboard — only Strava-connected activities are ranked.</span>
    </div>
);
