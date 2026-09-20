import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <>
            <style>{`
                :root {
                    --wlc-bg:   #0C0D14;
                    --wlc-s1:   #13141E;
                    --wlc-s2:   #1B1D2A;
                    --wlc-bdr:  #272A40;
                    --wlc-bdr-s:#1C1E30;
                    --wlc-tx:   #DDE0F0;
                    --wlc-tx2:  #8890AF;
                    --wlc-tx3:  #52566E;
                    --wlc-p:    #FF6040;
                    --wlc-p-lt: #FF7D62;
                }
                .auth-root {
                    min-height: 100svh;
                    background: var(--wlc-bg);
                    color: var(--wlc-tx);
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 24px 16px;
                }
                .auth-card {
                    width: 100%;
                    max-width: 380px;
                    background: var(--wlc-s1);
                    border: 1px solid var(--wlc-bdr-s);
                    border-radius: 16px;
                    padding: 32px 28px;

                    /* shadcn CSS var overrides */
                    --background: 233 16% 8%;
                    --foreground: 228 40% 90%;
                    --card: 233 16% 10%;
                    --card-foreground: 228 40% 90%;
                    --primary: 14 100% 63%;
                    --primary-foreground: 0 0% 100%;
                    --secondary: 233 20% 16%;
                    --secondary-foreground: 228 30% 80%;
                    --muted: 233 20% 16%;
                    --muted-foreground: 228 18% 68%;
                    --accent: 233 20% 18%;
                    --accent-foreground: 228 40% 90%;
                    --destructive: 349 100% 63%;
                    --destructive-foreground: 0 0% 100%;
                    --border: 233 22% 24%;
                    --input: 233 22% 24%;
                    --ring: 14 100% 63%;
                    --radius: 8px;
                    color-scheme: dark;
                }
                /* inputs: explicit bg so they show against the card */
                .auth-card input:not([type="checkbox"]):not([type="radio"]) {
                    background: var(--wlc-bg) !important;
                    border-color: #2E3247 !important;
                    color: var(--wlc-tx) !important;
                    border-radius: 8px !important;
                    height: 42px !important;
                    font-size: 14px !important;
                }
                .auth-card input:not([type="checkbox"]):not([type="radio"]):focus {
                    border-color: var(--wlc-p) !important;
                    box-shadow: 0 0 0 3px rgba(255, 96, 64, 0.15) !important;
                    outline: none !important;
                }
                .auth-card input::placeholder {
                    color: var(--wlc-tx3) !important;
                }
                /* password input wrapper */
                .auth-card [data-slot="control"],
                .auth-card .relative {
                    border-radius: 8px;
                }
                /* labels */
                .auth-card label {
                    color: #B0B6CE !important;
                    font-size: 13px !important;
                    font-weight: 500 !important;
                }
                /* links */
                .auth-card a {
                    color: var(--wlc-p-lt) !important;
                }
                .auth-card a:hover {
                    color: #FFAA95 !important;
                }
                /* muted / helper text */
                .auth-card .text-muted-foreground {
                    color: #6E7494 !important;
                }
                /* primary button */
                .auth-card button[type="submit"],
                .auth-card [data-slot="button"][class*="bg-primary"] {
                    background: var(--wlc-p) !important;
                    color: #fff !important;
                    font-weight: 700 !important;
                    border-radius: 8px !important;
                    height: 42px !important;
                    border: none !important;
                    font-size: 14px !important;
                }
                .auth-card button[type="submit"]:hover {
                    background: var(--wlc-p-lt) !important;
                }
                .auth-logo-wrap {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 20px;
                    margin-bottom: 28px;
                }
                .auth-logo { height: 28px; width: auto; object-fit: contain; }
                .auth-title {
                    text-align: center;
                    font-size: 18px;
                    font-weight: 800;
                    color: var(--wlc-tx);
                    letter-spacing: -.3px;
                }
                .auth-desc {
                    text-align: center;
                    font-size: 13px;
                    color: var(--wlc-tx2);
                    margin-top: 4px;
                    line-height: 1.5;
                }
            `}</style>

            <div className="auth-root">
                <div className="auth-card">
                    <div className="auth-logo-wrap">
                        <Link href={home()}>
                            <AppLogoIcon className="auth-logo" />
                        </Link>
                        <div>
                            {title && <div className="auth-title">{title}</div>}
                            {description && <div className="auth-desc">{description}</div>}
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </>
    );
}
