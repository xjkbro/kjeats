import type { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src="/kjeats-logo.png"
            alt="kjeats"
            {...props}
        />
    );
}
