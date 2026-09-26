import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, KeyRound, CheckCircle, ArrowRight, X, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import api from '../services/api';

export const LoginPage = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot password modal state
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1 = Request code, 2 = Enter code & new password
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [generatedCodeHint, setGeneratedCodeHint] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      navigate(from, { replace: true });
    }
  };

  const setDemoUser = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password123!');
  };

  const handleOpenForgot = () => {
    setForgotEmail(email || '');
    setResetCode('');
    setNewPassword('');
    setConfirmPassword('');
    setGeneratedCodeHint('');
    setForgotStep(1);
    setIsForgotOpen(true);
  };

  const handleRequestResetCode = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      showToast('Please enter your registered campus email address.', 'warning');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: forgotEmail });
      if (res.data.success) {
        showToast(res.data.message || 'Verification code generated.', 'success');
        if (res.data.resetCode) {
          setGeneratedCodeHint(res.data.resetCode);
          setResetCode(res.data.resetCode);
        }
        setForgotStep(2);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to request reset code.';
      showToast(msg, 'error');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetCode || !newPassword) {
      showToast('Please enter the verification code and new password.', 'warning');
      return;
    }

    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters long.', 'warning');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        email: forgotEmail,
        resetCode,
        newPassword
      });
      if (res.data.success) {
        showToast(res.data.message || 'Password reset successfully! You can now log in.', 'success');
        setEmail(forgotEmail);
        setPassword(newPassword);
        setIsForgotOpen(false);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reset password. Please check your code.';
      showToast(msg, 'error');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-cream-100 font-display">
          Sign in to your account
        </h2>
        <p className="mt-1 text-xs text-cocoa-300">
          Enter your university credentials to access verified recovery services
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-cream-200 mb-1.5 font-display">
            Campus Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3 w-4 h-4 text-cocoa-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. alex.rivers@campus.edu"
              className="w-full pl-10 pr-3.5 py-2.5 bg-charcoal-900/80 border border-charcoal-700/80 rounded-xl text-cream-100 text-xs placeholder:text-cocoa-400 focus:outline-none focus:ring-2 focus:ring-terracotta-500/30 focus:border-terracotta-500 transition"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-cream-200 font-display">Password</label>
            <button
              type="button"
              onClick={handleOpenForgot}
              className="text-[11px] text-terracotta-400 hover:text-terracotta-300 hover:underline transition cursor-pointer font-medium"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3 w-4 h-4 text-cocoa-400" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-3.5 py-2.5 bg-charcoal-900/80 border border-charcoal-700/80 rounded-xl text-cream-100 text-xs placeholder:text-cocoa-400 focus:outline-none focus:ring-2 focus:ring-terracotta-500/30 focus:border-terracotta-500 transition"
            />
          </div>
        </div>

        <Button variant="primary" size="md" type="submit" loading={loading} className="w-full shadow-warm">
          <LogIn className="w-4 h-4" />
          Sign In
        </Button>
      </form>

      {/* Demo Credentials Picker */}
      <div className="pt-4 border-t border-charcoal-800">
        <span className="text-[11px] font-bold uppercase tracking-wider text-cocoa-400 block mb-2.5 text-center font-display">
          Quick Demo Credentials (Password: Password123!)
        </span>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => setDemoUser('alex.rivers@campus.edu')}
            className="p-2.5 text-left bg-charcoal-800/80 hover:bg-charcoal-700 rounded-xl border border-charcoal-700 transition text-cream-200 hover:text-white"
          >
            <strong className="block text-terracotta-300 font-semibold">Alex Rivers</strong>
            <span className="text-[10px] text-cocoa-400">Student (CS)</span>
          </button>
          <button
            type="button"
            onClick={() => setDemoUser('sam.chen@campus.edu')}
            className="p-2.5 text-left bg-charcoal-800/80 hover:bg-charcoal-700 rounded-xl border border-charcoal-700 transition text-cream-200 hover:text-white"
          >
            <strong className="block text-olive-300 font-semibold">Sam Chen</strong>
            <span className="text-[10px] text-cocoa-400">Finder (Eng)</span>
          </button>
          <button
            type="button"
            onClick={() => setDemoUser('jessica.taylor@campus.edu')}
            className="p-2.5 text-left bg-charcoal-800/80 hover:bg-charcoal-700 rounded-xl border border-charcoal-700 transition text-cream-200 hover:text-white"
          >
            <strong className="block text-amber-300 font-semibold">Jessica Taylor</strong>
            <span className="text-[10px] text-cocoa-400">Student (Bio)</span>
          </button>
          <button
            type="button"
            onClick={() => setDemoUser('admin@campus.edu')}
            className="p-2.5 text-left bg-rust-950/60 hover:bg-rust-900/80 rounded-xl border border-rust-700/50 transition text-rust-200"
          >
            <strong className="block text-rust-300 font-semibold">Dr. Marcus Vance</strong>
            <span className="text-[10px] text-rust-400">Administrator</span>
          </button>
        </div>
      </div>

      <div className="text-center pt-2">
        <p className="text-xs text-cocoa-300">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-terracotta-400 hover:text-terracotta-300 transition">
            Register here
          </Link>
        </p>
      </div>

      {/* Forgot Password Modal */}
      {isForgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-charcoal-900 border border-charcoal-700 rounded-3xl max-w-md w-full p-6 shadow-warm-lg relative space-y-5 text-cream-100">
            <button
              onClick={() => setIsForgotOpen(false)}
              className="absolute top-4 right-4 text-cocoa-400 hover:text-cream-100 p-1.5 rounded-xl hover:bg-charcoal-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-terracotta-500/10 border border-terracotta-500/20 rounded-2xl text-terracotta-400 shadow-warm-sm">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-display text-cream-100">Password Recovery</h3>
                <p className="text-xs text-cocoa-300">
                  {forgotStep === 1
                    ? 'Enter your email to receive a recovery verification code'
                    : 'Enter the verification code and set your new password'}
                </p>
              </div>
            </div>

            {forgotStep === 1 ? (
              <form onSubmit={handleRequestResetCode} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-cream-200 mb-1.5 font-display">
                    Registered Campus Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-cocoa-400" />
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="e.g. alex.rivers@campus.edu"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-charcoal-950 border border-charcoal-700 rounded-xl text-cream-100 text-xs placeholder:text-cocoa-400 focus:outline-none focus:ring-2 focus:ring-terracotta-500/30 focus:border-terracotta-500"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsForgotOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    loading={forgotLoading}
                  >
                    Send Verification Code
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                {generatedCodeHint && (
                  <div className="p-3 bg-olive-900/30 border border-olive-600/40 rounded-xl text-xs text-olive-300 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-olive-400" />
                      <span>Demo OTP Code: <strong className="font-mono text-olive-200">{generatedCodeHint}</strong></span>
                    </div>
                    <span className="text-[10px] bg-olive-800/40 px-2 py-0.5 rounded text-olive-200">
                      Auto-filled
                    </span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-cream-200 mb-1.5 font-display">
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    placeholder="123456"
                    className="w-full px-3.5 py-2.5 bg-charcoal-950 border border-charcoal-700 rounded-xl text-cream-100 text-sm font-mono tracking-widest text-center placeholder:text-cocoa-500 focus:outline-none focus:ring-2 focus:ring-terracotta-500/30 focus:border-terracotta-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-cream-200 mb-1.5 font-display">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-cocoa-400" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-charcoal-950 border border-charcoal-700 rounded-xl text-cream-100 text-xs placeholder:text-cocoa-400 focus:outline-none focus:ring-2 focus:ring-terracotta-500/30 focus:border-terracotta-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-cream-200 mb-1.5 font-display">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-cocoa-400" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-charcoal-950 border border-charcoal-700 rounded-xl text-cream-100 text-xs placeholder:text-cocoa-400 focus:outline-none focus:ring-2 focus:ring-terracotta-500/30 focus:border-terracotta-500"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="text-xs text-cocoa-400 hover:text-cream-100 transition"
                  >
                    ← Back
                  </button>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsForgotOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      loading={forgotLoading}
                    >
                      Reset Password
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
