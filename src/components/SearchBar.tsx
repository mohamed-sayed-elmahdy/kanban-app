'use client';

import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';

interface Props {
    value: string;
    onChange: (val: string) => void;
}

/** Debounced search bar – fires onChange 300ms after user stops typing. */
export default function SearchBar({ value, onChange }: Props) {
    const [local, setLocal] = useState(value);
    const timer = useRef<ReturnType<typeof setTimeout>>();

    useEffect(() => {
        setLocal(value);
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setLocal(val);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => onChange(val), 300);
    };

    const clear = () => {
        setLocal('');
        onChange('');
    };

    return (
        <div className="relative flex w-full max-w-xs items-center">
            <Search className="absolute left-3 h-4 w-4 text-white/30 pointer-events-none" />
            <input
                type="text"
                value={local}
                onChange={handleChange}
                placeholder="Search tasks…"
                className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-8 text-sm text-white
                   placeholder:text-white/25 outline-none transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
            />
            {local && (
                <button
                    onClick={clear}
                    className="absolute right-2 rounded p-0.5 text-white/30 transition hover:text-white"
                    aria-label="Clear search"
                >
                    <X className="h-3.5 w-3.5" />
                </button>
            )}
        </div>
    );
}
