import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, KeyRound, LoaderCircle, LockKeyhole, Mail, Sparkles } from 'lucide-react';
import { useBrand } from '../../context/BrandContext';

const DEMO_EMAIL = 'director@emblem.design';
const DEMO_PASSWORD = 'EmblemDemo2026!';

export function AuthPage({ onBack, onSuccess }) {
  const { login, register, demoLogin } = useBrand();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegisterMode) await register(name, email, password);
      else if (email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD) await demoLogin();
      else await login(email, password);
      onSuccess();
    } catch (err) {
      setError(err.message || 'We could not sign you in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const enterDemo = async () => {
    setError('');
    setDemoLoading(true);
    try {
      await demoLogin();
      onSuccess();
    } catch (err) {
      setError(err.message || 'Demo access is unavailable right now.');
    } finally {
      setDemoLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setIsRegisterMode(false);
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setError('');
  };

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#faf7f4] px-4 py-5 sm:px-7 sm:py-8">
      <div className="mx-auto grid min-h-[min(760px,calc(100vh-116px))] w-full max-w-6xl overflow-hidden rounded-[30px] border border-[#eadfd9] bg-[#fffdfb] shadow-[0_30px_90px_-55px_rgba(69,37,47,.35)] lg:grid-cols-[.94fr_1.06fr]">
        <section className="relative hidden min-h-[650px] flex-col justify-between overflow-hidden bg-[#572132] p-10 text-white lg:flex xl:p-14" aria-label="About EMBLEM">
          <div className="pointer-events-none absolute -right-36 -top-28 h-[470px] w-[470px] rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-16 top-20 h-[310px] w-[310px] rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -bottom-32 -left-24 h-[390px] w-[390px] rounded-full bg-[#9e3d58]/30 blur-3xl" />
          <button type="button" onClick={onBack} className="relative z-10 inline-flex w-fit items-center gap-3 rounded-lg text-left" aria-label="Back to EMBLEM home">
            <span className="flex h-9 w-9 rotate-45 items-center justify-center rounded-[10px] border border-white/25 bg-white/10"><span className="h-2.5 w-2.5 rounded-sm bg-white" /></span>
            <span className="text-sm font-extrabold tracking-[.16em]">EMBLEM</span>
          </button>

          <div className="relative z-10 max-w-lg py-12">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[.07] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[.16em] text-white/75"><Sparkles size={12}/>Your brand workspace</span>
            <h1 className="mt-7 text-5xl font-semibold leading-[1.02] tracking-[-.065em] xl:text-6xl">Every brand starts with a <span className="studio-serif font-normal italic text-[#edc5cd]">point of view.</span></h1>
            <p className="mt-6 max-w-md text-sm leading-7 text-white/70">Sign in to return to the ideas, visual systems, and brand assets you’ve been shaping.</p>
            <div className="mt-9 space-y-3 border-t border-white/15 pt-5 text-xs text-white/75">
              {['Your brand strategy and visual direction', 'Logo, color, and typography systems', 'A workspace for every saved identity'].map((line) => <p key={line} className="flex items-center gap-2.5"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[#edc5cd]"><Check size={12}/></span>{line}</p>)}
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between border-t border-white/15 pt-4 text-[9px] uppercase tracking-[.14em] text-white/45"><span>Strategy, made tangible</span><span>EMBLEM · 01</span></div>
        </section>

        <section className="flex min-w-0 flex-col px-5 py-6 sm:px-10 sm:py-9 lg:px-12 xl:px-16" aria-labelledby="auth-title">
          <div className="flex items-center justify-between">
            <button type="button" onClick={onBack} className="inline-flex items-center gap-2 rounded-full px-2 py-2 text-xs font-semibold text-[#827276] transition hover:bg-[#f8f1ee] hover:text-[#6b2438]"><ArrowLeft size={15}/>Back to EMBLEM</button>
            <span className="font-mono text-[9px] uppercase tracking-[.14em] text-[#ad9b9c]">Secure workspace access</span>
          </div>

          <div className="mx-auto my-auto w-full max-w-md py-8">
            <div className="mb-7 lg:hidden"><span className="inline-flex h-9 w-9 rotate-45 items-center justify-center rounded-[10px] bg-[#6b2438]"><span className="h-2.5 w-2.5 rounded-sm bg-white" /></span><p className="mt-3 text-xs font-extrabold tracking-[.16em] text-[#382a2d]">EMBLEM</p></div>
            <p className="text-[9px] font-bold uppercase tracking-[.18em] text-[#9a6875]">{isRegisterMode ? 'Start your workspace' : 'Welcome back'}</p>
            <h2 id="auth-title" className="mt-2 text-3xl font-semibold tracking-[-.055em] text-[#302729] sm:text-[2.6rem]">{isRegisterMode ? 'Create your account.' : 'Sign in to EMBLEM.'}</h2>
            <p className="mt-3 text-sm leading-6 text-[#85787a]">{isRegisterMode ? 'Save your identities and return to them whenever you need.' : 'Pick up where your brand takes shape.'}</p>

            {error && <div role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs leading-5 text-rose-800">{error}</div>}

            <form onSubmit={submit} className="mt-7 space-y-4">
              {isRegisterMode && <label className="block"><span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[.12em] text-[#78686c]">Your name</span><span className="relative block"><input autoComplete="name" required value={name} onChange={(event) => setName(event.target.value)} placeholder="Alex Morgan" className="h-12 w-full rounded-xl border border-[#e9ddda] bg-white pl-4 pr-4 text-sm text-[#302729] outline-none transition placeholder:text-[#b8abad] focus:border-[#a76777] focus:ring-4 focus:ring-[#8f4859]/[.08]" /></span></label>}
              <label className="block"><span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[.12em] text-[#78686c]">Email address</span><span className="relative block"><Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a89598]"/><input autoComplete="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@yourstudio.com" className="h-12 w-full rounded-xl border border-[#e9ddda] bg-white pl-11 pr-4 text-sm text-[#302729] outline-none transition placeholder:text-[#b8abad] focus:border-[#a76777] focus:ring-4 focus:ring-[#8f4859]/[.08]" /></span></label>
              <label className="block"><span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[.12em] text-[#78686c]">Password</span><span className="relative block"><LockKeyhole size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a89598]"/><input autoComplete={isRegisterMode ? 'new-password' : 'current-password'} type={showPassword ? 'text' : 'password'} required minLength={isRegisterMode ? 8 : undefined} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={isRegisterMode ? 'At least 8 characters' : 'Enter your password'} className="h-12 w-full rounded-xl border border-[#e9ddda] bg-white pl-11 pr-12 text-sm text-[#302729] outline-none transition placeholder:text-[#b8abad] focus:border-[#a76777] focus:ring-4 focus:ring-[#8f4859]/[.08]"/><button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#a08f91] hover:bg-[#f8f1ee]">{showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}</button></span>{isRegisterMode && <span className="mt-1.5 block text-[10px] text-[#a08f91]">Use 8 or more characters.</span>}</label>

              <button type="submit" disabled={loading || demoLoading} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#6b2438] text-sm font-semibold text-white shadow-[0_12px_24px_-16px_rgba(107,36,56,.75)] transition hover:bg-[#552031] disabled:cursor-wait disabled:opacity-60">{loading ? <><LoaderCircle size={16} className="animate-spin"/>{isRegisterMode ? 'Creating account…' : 'Signing in…'}</> : <>{isRegisterMode ? 'Create account' : 'Sign in'}<ArrowRight size={16}/></>}</button>
            </form>

            {!isRegisterMode && <div className="mt-6 rounded-2xl border border-[#eadfd9] bg-[#fbf7f4] p-4 sm:p-5">
              <div className="flex items-start gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#7b3448]"><KeyRound size={16}/></span><div className="min-w-0 flex-1"><p className="text-xs font-semibold text-[#49383c]">One demo account, ready to explore</p><p className="mt-1 text-[10px] leading-5 text-[#918184]">Use the shared credentials for a guided look around EMBLEM.</p></div></div>
              <div className="mt-4 grid gap-2 rounded-xl border border-[#eee4df] bg-white p-3 font-mono text-[10px] sm:grid-cols-2"><p className="min-w-0"><span className="mb-1 block font-sans text-[8px] font-semibold uppercase tracking-wider text-[#aa989a]">Email</span><span className="break-all text-[#5c4b4f]">{DEMO_EMAIL}</span></p><p><span className="mb-1 block font-sans text-[8px] font-semibold uppercase tracking-wider text-[#aa989a]">Password</span><span className="text-[#5c4b4f]">{DEMO_PASSWORD}</span></p></div>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row"><button type="button" onClick={fillDemoCredentials} className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-[#e6d7d7] bg-white px-3 text-[11px] font-semibold text-[#6b2438] transition hover:bg-[#fff9f8]"><KeyRound size={13}/>Fill demo credentials</button><button type="button" onClick={enterDemo} disabled={loading || demoLoading} className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl px-3 text-[11px] font-semibold text-[#6b2438] transition hover:bg-[#f3e8e8] disabled:opacity-60">{demoLoading ? <LoaderCircle size={14} className="animate-spin"/> : <ArrowRight size={14}/>}Enter demo workspace</button></div>
            </div>}

            <div className="mt-6 border-t border-[#f0e8e5] pt-5 text-center text-xs text-[#918184]">{isRegisterMode ? 'Already have an account?' : 'New to EMBLEM?'} <button type="button" onClick={() => { setIsRegisterMode((value) => !value); setError(''); }} className="font-semibold text-[#6b2438] hover:text-[#4f1c2c]">{isRegisterMode ? 'Sign in' : 'Create an account'}</button></div>
          </div>

          <div className="flex items-center justify-between border-t border-[#f0e8e5] pt-4 text-[9px] text-[#aa989a]"><span className="inline-flex items-center gap-1.5"><LockKeyhole size={11}/>Your session is protected</span><span>© {new Date().getFullYear()} EMBLEM</span></div>
        </section>
      </div>
    </main>
  );
}

export default AuthPage;
