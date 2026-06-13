import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, Loader2, Eye, EyeOff, Link2, ArrowRight } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';

const Login = () => {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      await login(formData.email, formData.password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Please try again.';
      setErrors({ submit: msg });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setErrors({});
    try {
      await loginWithGoogle(credentialResponse.credential);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.error || 'Google login failed. Please try again.';
      setErrors({ submit: msg });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] bg-surface-50 flex overflow-hidden">
      {/* Left Panel – Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-surface-900 flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center overflow-hidden">
            <img src="/logo.png" alt="LinkIQ Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="text-xl font-bold text-white">LinkIQ</span>
            <p className="text-[10px] text-surface-500 tracking-widest uppercase">Link Intelligence</p>
          </div>
        </div>

        {/* Center copy */}
        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-white leading-snug mb-4">
            Intelligent links.<br />Real-time insights.
          </h2>
          <p className="text-surface-400 text-base leading-relaxed max-w-sm">
            Shorten, track, and optimize your URLs with powerful analytics. One platform for all your link management needs.
          </p>

          {/* Feature row */}
          <div className="mt-10 grid grid-cols-3 gap-6">
            {[
              { label: 'Real-time Tracking', value: 'Analytics' },
              { label: 'Instantly Generated', value: 'QR Codes' },
              { label: 'Personalized Links', value: 'Custom Aliases' },
            ].map((feature) => (
              <div key={feature.label}>
                <p className="text-xl font-bold text-white">{feature.value}</p>
                <p className="text-xs text-surface-500 mt-0.5">{feature.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom tag */}
        <p className="text-surface-600 text-xs relative z-10">© 2025 LinkIQ · Link Intelligence Platform</p>
      </div>

      {/* Right Panel – Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-24 overflow-y-auto">
        <div className="w-full max-w-sm mx-auto">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-surface-900 flex items-center justify-center overflow-hidden">
              <img src="/logo.png" alt="LinkIQ Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-lg font-bold text-surface-900">LinkIQ</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-surface-900 mb-1">Sign in to your account</h1>
            <p className="text-sm text-surface-500">
              Don&apos;t have an account?{' '}
              <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                Create one free
              </Link>
            </p>
          </div>

          <div className="mb-6 flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Google Sign-In failed.')}
              useOneTap
              theme="outline"
              size="large"
              width="384px"
              text="signin_with"
            />
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-surface-50 text-surface-500">Or continue with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-surface-700 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@example.com"
                  className={`w-full pl-9 pr-4 py-2.5 bg-white border rounded-lg text-sm text-surface-900 placeholder-surface-400 outline-none transition-all
                    ${errors.email
                      ? 'border-red-400 focus:ring-2 focus:ring-red-200'
                      : 'border-surface-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                    }`}
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="mt-1.5 text-xs text-red-500">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-surface-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter your password"
                  className={`w-full pl-9 pr-10 py-2.5 bg-white border rounded-lg text-sm text-surface-900 placeholder-surface-400 outline-none transition-all
                    ${errors.password
                      ? 'border-red-400 focus:ring-2 focus:ring-red-200'
                      : 'border-surface-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                    }`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-red-500">{errors.password}</p>}
            </div>

            {/* Submit Error Banner */}
            {errors.submit && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
                <span className="text-red-500 text-lg leading-none mt-0.5">!</span>
                <p className="text-sm text-red-700">{errors.submit}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-surface-900 hover:bg-surface-800 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <p className="mt-8 text-xs text-surface-400 text-center">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
