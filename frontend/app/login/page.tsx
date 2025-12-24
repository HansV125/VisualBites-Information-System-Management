'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, BadgeInfo, Key, ChevronRight, AlertCircle } from 'lucide-react';
import { Footer } from '@/components/footer';
import { CloseButton } from '@/components/ui/close-button';
import { Checkbox } from '@/components/ui/checkbox';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'include'
            });

            if (!res.ok) {
                throw new Error('Invalid credentials');
            }

            router.push('/admin');
        } catch (err) {
            setError('ACCESS DENIED: Invalid Credentials');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full min-h-0 lg:min-h-screen flex flex-col lg:pl-72 lg:pt-0">
            <main className="flex-grow relative flex items-center justify-center p-4 bg-noise overflow-y-auto">
                <div
                    className="absolute inset-0 z-0 opacity-5 pointer-events-none"
                    style={{
                        backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
                        backgroundSize: '20px 20px'
                    }}
                />

                <CloseButton
                    onClick={() => router.push('/')}
                    className="absolute top-6 right-6 z-20"
                />

                <div className="w-full max-w-[600px] bg-paper border-4 border-black p-0 shadow-[8px_8px_0px_0px_#000000] relative z-10">
                    <div className="p-4 sm:p-8 pb-4 sm:pb-6 border-b-4 border-black border-dashed text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-[repeating-linear-gradient(45deg,black,black_10px,transparent_10px,transparent_20px)] opacity-10" />

                        <span className="inline-flex items-center gap-2 bg-black text-white px-2 sm:px-3 py-1 font-mono text-[10px] sm:text-xs font-bold mb-2 sm:mb-4 uppercase tracking-widest border border-black">
                            <Lock size={12} className="sm:hidden" />
                            <Lock size={14} className="hidden sm:block" />
                            Secure Access
                        </span>

                        <h2 className="text-[#0e121b] tracking-tight text-2xl sm:text-4xl font-bold leading-tight px-4 text-center font-hand uppercase transform -rotate-1">
                            RESTRICTED AREA
                        </h2>

                        <p className="text-[#0e121b] text-xs sm:text-base font-normal leading-normal pt-2 px-4 text-center font-mono">
                            Staff credentials required for entry.
                        </p>
                    </div>

                    <div className="p-4 sm:p-8 pt-4 sm:pt-6 bg-paper">
                        <form className="flex flex-col gap-4 sm:gap-6" onSubmit={handleLogin}>
                            {error && (
                                <div className="bg-red-100 border-l-4 border-red-600 text-red-700 p-3 sm:p-4 font-mono text-xs sm:text-sm flex items-center gap-2">
                                    <AlertCircle size={16} />
                                    {error}
                                </div>
                            )}

                            <div className="flex flex-col gap-2">
                                <label className="text-[#0e121b] text-xs sm:text-sm font-bold leading-normal uppercase tracking-wider flex justify-between font-mono">
                                    <span>Chef ID</span>
                                    <span className="text-[10px] sm:text-xs font-normal text-gray-500">ID-####</span>
                                </label>
                                <div className="relative group/input">
                                    <input
                                        className="flex w-full rounded-none text-[#0e121b] focus:outline-none border-2 border-black bg-[#f8f9fb] h-10 sm:h-14 placeholder:text-[#506795] p-3 sm:p-4 pr-10 sm:pr-12 text-xs sm:text-base font-mono shadow-none focus:shadow-[4px_4px_0px_0px_#000000] transition-all focus:-translate-y-0.5 focus:-translate-x-0.5"
                                        placeholder="admin@visualbites.com"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                    <div className="absolute right-3 sm:right-4 top-2 sm:top-4 text-gray-400 pointer-events-none group-focus-within/input:text-black transition-colors">
                                        <BadgeInfo size={20} className="sm:hidden" />
                                        <BadgeInfo size={24} className="hidden sm:block" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[#0e121b] text-xs sm:text-sm font-bold leading-normal uppercase tracking-wider font-mono">
                                    Password
                                </label>
                                <div className="relative group/input">
                                    <input
                                        className="flex w-full rounded-none text-[#0e121b] focus:outline-none border-2 border-black bg-[#f8f9fb] h-10 sm:h-14 placeholder:text-[#506795] p-3 sm:p-4 pr-10 sm:pr-12 text-xs sm:text-base font-mono shadow-none focus:shadow-[4px_4px_0px_0px_#000000] transition-all focus:-translate-y-0.5 focus:-translate-x-0.5"
                                        placeholder="••••••••"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <div className="absolute right-3 sm:right-4 top-2 sm:top-4 text-gray-400 pointer-events-none group-focus-within/input:text-black transition-colors">
                                        <Key size={20} className="sm:hidden" />
                                        <Key size={24} className="hidden sm:block" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4 mt-2">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex w-full cursor-pointer items-center justify-center rounded-none h-10 sm:h-14 px-4 bg-black text-white text-sm sm:text-lg font-bold uppercase tracking-[0.05em] border-2 border-transparent hover:bg-white hover:text-black hover:border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] hover:shadow-[6px_6px_0px_0px_#000000] transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-none font-mono group disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span>{isLoading ? 'Authenticating...' : 'Enter Kitchen'}</span>
                                    {!isLoading && <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" size={16} />}
                                </button>

                                <div className="flex items-center justify-between px-1">
                                    <Checkbox label="Keep me logged in" />
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
