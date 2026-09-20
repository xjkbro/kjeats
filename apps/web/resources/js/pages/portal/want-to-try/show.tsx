import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import * as WantToTryController from '@/actions/App/Http/Controllers/WantToTryController';
import PortalLayout from '@/layouts/portal/portal-layout';

interface Props {
    item: {
        id: number;
        emoji: string;
        name: string;
        cuisine: string | null;
        location: string | null;
        notes: string | null;
        restaurant_id: number | null;
        created_at: string;
        user: { id: number; name: string };
    };
}

function formatDate(isoDate: string): string {
    return new Date(isoDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function WantToTryShow({ item }: Props) {
    return (
        <div className="p-4 lg:p-7 kj-anim-viewin">
            <div className="flex flex-col items-center text-center mb-8">
                <div className="text-5xl leading-none mb-2">{item.emoji}</div>
                <h1 className="text-2xl font-bold text-[var(--fl-tx)] tracking-tight mb-2">{item.name}</h1>
                <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
                    {item.cuisine && <span className="fl-badge fl-badge-org">{item.cuisine}</span>}
                    {item.location && <span className="fl-badge fl-badge-def">{item.location}</span>}
                </div>
                <p className="text-xs text-[var(--fl-tx2)]">
                    Added by {item.user.name} · {formatDate(item.created_at)}
                </p>
            </div>

            {item.notes && (
                <section className="mb-6">
                    <h3 className="text-[10px] font-bold text-[var(--fl-tx2)] uppercase tracking-[1px] flex items-center gap-2">Notes</h3>
                    <div className="bg-[var(--fl-s2)] rounded-xl p-4 text-sm text-[var(--fl-tx)] leading-relaxed">
                        {item.notes}
                    </div>
                </section>
            )}

            <section className="mb-6">
                <h3 className="text-[10px] font-bold text-[var(--fl-tx2)] uppercase tracking-[1px] flex items-center gap-2 mb-4 justify-center">Actions</h3>
                <div className="flex gap-3 justify-center">
                    <Link
                        href={WantToTryController.convertToReview(item.id).url}
                        method="post"
                        as="button"
                        className="inline-flex items-center justify-center gap-[7px] px-[22px] py-[11px] rounded-full text-[15px] font-bold tracking-[-.2px] cursor-pointer border-[1.5px] border-solid border-transparent whitespace-nowrap transition-all duration-100 bg-gradient-to-br from-[var(--fl-p)] to-[#FF7D62] text-white shadow-[var(--fl-p-glw)] active:scale-[.97] active:shadow-[0_2px_8px_rgba(255,96,64,.3)]"
                    >
                        Convert to Review
                    </Link>
                    <Link
                        href={WantToTryController.destroy(item.id).url}
                        method="delete"
                        as="button"
                        className="inline-flex items-center justify-center gap-[7px] px-[22px] py-[11px] rounded-full text-[15px] font-bold tracking-[-.2px] cursor-pointer border-[1.5px] border-solid border-transparent whitespace-nowrap transition-all duration-100 bg-[var(--fl-s2)] text-[var(--fl-tx)] border-[var(--fl-bdr-h)] active:bg-[var(--fl-s3)] active:scale-[.97]"
                    >
                        Remove
                    </Link>
                </div>
            </section>
        </div>
    );
}

WantToTryShow.layout = (page: ReactNode) => <PortalLayout showBack title="Want to Try">{page}</PortalLayout>;
