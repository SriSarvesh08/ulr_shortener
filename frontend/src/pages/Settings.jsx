import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';
import {
  User, Shield, Bell, CreditCard,
  Check, Eye, EyeOff,
  Loader2, Lock, CheckCircle2, Zap, Star
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ─── Razorpay script loader ─────────────────────────────────────── */
const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

/* ─── Notification defaults ──────────────────────────────────────── */
const NOTIF_KEY = 'linkiq_notif_prefs';
const defaultNotifs = {
  weeklyDigest: true,
  linkExpiry: true,
  safetyDrop: false,
  newLogin: true,
  promoUpdates: false,
};

const Settings = () => {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  /* ── Profile ── */
  const [profileName, setProfileName] = useState(user?.name || '');
  const [bio, setBio] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  /* ── Security ── */
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false });
  const [pwLoading, setPwLoading] = useState(false);
  const [twoFaEnabled, setTwoFaEnabled] = useState(false);

  /* ── Notifications ── */
  const [notifs, setNotifs] = useState(() => {
    try {
      return { ...defaultNotifs, ...JSON.parse(localStorage.getItem(NOTIF_KEY) || '{}') };
    } catch { return defaultNotifs; }
  });

  /* ── Billing ── */
  const [billingLoading, setBillingLoading] = useState(null); // 'pro' | 'enterprise' | null
  const [currentPlan, setCurrentPlan] = useState('free');

  /* ── Save notifications to localStorage whenever they change ── */
  useEffect(() => {
    localStorage.setItem(NOTIF_KEY, JSON.stringify(notifs));
  }, [notifs]);

  const toggleNotif = (key) => {
    const nextVal = !notifs[key];
    setNotifs((prev) => ({ ...prev, [key]: nextVal }));
    toast.success(nextVal ? 'Notification enabled.' : 'Notification disabled.');
  };

  /* ── Profile save ── */
  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profileName.trim() || profileName.trim().length < 2) {
      toast.error('Name must be at least 2 characters.');
      return;
    }
    setProfileLoading(true);
    try {
      const { data } = await api.put('/auth/profile', { name: profileName.trim(), bio });
      if (setUser) setUser((u) => ({ ...u, name: data.user.name }));
      toast.success('Profile saved successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  /* ── Password change ── */
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPw !== pwForm.confirm) {
      toast.error('New passwords do not match.');
      return;
    }
    if (pwForm.newPw.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }
    setPwLoading(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: pwForm.current,
        newPassword: pwForm.newPw,
      });
      toast.success('Password updated successfully!');
      setPwForm({ current: '', newPw: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update password.');
    } finally {
      setPwLoading(false);
    }
  };

  /* ── Razorpay checkout ── */
  const handleUpgrade = async (plan) => {
    setBillingLoading(plan);
    const loaded = await loadRazorpay();
    if (!loaded) {
      toast.error('Failed to load Razorpay. Check your internet connection.');
      setBillingLoading(null);
      return;
    }

    try {
      const { data } = await api.post('/payment/create-order', { plan });

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'LinkIQ',
        description: data.description,
        image: '/logo.png',
        order_id: data.orderId,
        handler: async (response) => {
          try {
            await api.post('/payment/verify', response);
            setCurrentPlan(plan);
            toast.success(`🎉 Upgraded to ${plan === 'pro' ? 'LinkIQ Pro' : 'Enterprise'}!`);
          } catch {
            toast.error('Payment verification failed. Contact support.');
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: { color: '#2563eb' },
        modal: { ondismiss: () => setBillingLoading(null) },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (res) => {
        toast.error(`Payment failed: ${res.error.description}`);
        setBillingLoading(null);
      });
      rzp.open();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to initiate payment.';
      // If keys aren't set yet, show a friendly message
      if (msg.includes('not configured') || msg.includes('YOUR_KEY')) {
        toast(
          '⚠️ Razorpay keys not configured yet.\nAdd RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET to backend/.env',
          { duration: 6000, icon: '🔑' }
        );
      } else {
        toast.error(msg);
      }
    } finally {
      setBillingLoading(null);
    }
  };



  const ToggleRow = ({ label, description, checked, onChange }) => (
    <div className="flex items-center justify-between p-4 bg-surface-50 border border-surface-200 rounded-lg">
      <div className="pr-4">
        <p className="text-sm font-medium text-surface-900">{label}</p>
        <p className="text-xs text-surface-500 mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          checked ? 'bg-blue-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );

  const navItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in font-sans">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 mb-2">Account Settings</h1>
        <p className="text-surface-500">Manage your profile, security, notifications, and billing.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        {/* ── Sidebar Nav ── */}
        <div className="space-y-1">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === id
                  ? 'bg-white border border-surface-200 shadow-sm text-surface-900 font-semibold'
                  : 'text-surface-500 hover:bg-surface-100 hover:text-surface-900'
              }`}
            >
              <Icon size={18} className={activeTab === id ? 'text-blue-600' : 'text-surface-400'} />
              {label}
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        <div className="md:col-span-3 space-y-6">

          {/* ══ PROFILE ══ */}
          {activeTab === 'profile' && (
            <>
              <div className="glass-card p-6 space-y-6">
                <h2 className="text-lg font-semibold text-surface-900">Profile Information</h2>

                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-sky-400 flex items-center justify-center shadow-inner border-2 border-surface-200 flex-shrink-0">
                    <span className="text-2xl font-bold text-white">{user?.name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="text-xs text-surface-500">Profile picture is generated from your initials.</p>
                    <p className="text-xs text-surface-400 mt-1">Email: <span className="font-mono text-surface-600">{user?.email}</span></p>
                  </div>
                </div>

                <form onSubmit={handleProfileSave} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-surface-700">Full Name</label>
                      <input
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="input-field w-full"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-surface-700">Email Address</label>
                      <input
                        type="email"
                        defaultValue={user?.email}
                        disabled
                        className="input-field w-full opacity-60 cursor-not-allowed"
                      />
                      <p className="text-[10px] text-surface-500">Email cannot be changed.</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-surface-700">Bio</label>
                    <textarea
                      rows="3"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="input-field w-full resize-none"
                      placeholder="Tell us a little about yourself..."
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button type="submit" disabled={profileLoading} className="btn-primary text-sm !py-2 !px-6 flex items-center gap-2 disabled:opacity-60">
                      {profileLoading ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>

              <div className="glass-card p-6 border border-red-200 bg-red-50/10">
                <h2 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h2>
                <p className="text-sm text-surface-500 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                <button onClick={() => toast.error('Account deletion is locked for safety during demo.')} className="btn-danger">
                  Delete Account
                </button>
              </div>
            </>
          )}

          {/* ══ SECURITY ══ */}
          {activeTab === 'security' && (
            <div className="glass-card p-6 space-y-6">
              <h2 className="text-lg font-semibold text-surface-900">Security Preferences</h2>

              <form onSubmit={handlePasswordChange} className="space-y-4">
                {[
                  { field: 'current', label: 'Current Password' },
                  { field: 'newPw', label: 'New Password' },
                  { field: 'confirm', label: 'Confirm New Password' },
                ].map(({ field, label }) => (
                  <div key={field} className="space-y-1.5">
                    <label className="text-sm font-medium text-surface-700">{label}</label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                      <input
                        type={showPw[field] ? 'text' : 'password'}
                        value={pwForm[field]}
                        onChange={(e) => setPwForm((p) => ({ ...p, [field]: e.target.value }))}
                        className="input-field w-full !pl-9 !pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw((p) => ({ ...p, [field]: !p[field] }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-700"
                      >
                        {showPw[field] ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                ))}
                <div className="pt-2 flex justify-end">
                  <button type="submit" disabled={pwLoading} className="btn-primary text-sm flex items-center gap-2 disabled:opacity-60">
                    {pwLoading ? <><Loader2 size={14} className="animate-spin" /> Updating…</> : 'Update Password'}
                  </button>
                </div>
              </form>

              <div className="border-t border-surface-200 pt-6 space-y-3">
                <h3 className="text-sm font-semibold text-surface-900">Two-Factor Authentication (2FA)</h3>
                <ToggleRow
                  label="Enable 2FA Protection"
                  description="Secure your account with a mobile authenticator app (Google Authenticator, Duo)."
                  checked={twoFaEnabled}
                  onChange={() => {
                    setTwoFaEnabled((v) => !v);
                    toast.success(!twoFaEnabled ? '2FA Enabled!' : '2FA Disabled.');
                  }}
                />
                {twoFaEnabled && (
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700">
                    <p className="font-semibold mb-1">Next Steps</p>
                    <p>1. Download Google Authenticator or Authy on your phone.</p>
                    <p>2. Scan the QR code that will appear at next login.</p>
                    <p>3. Enter the 6-digit code to confirm setup.</p>
                  </div>
                )}
              </div>
            </div>
          )}


          {/* ══ NOTIFICATIONS ══ */}
          {activeTab === 'notifications' && (
            <div className="glass-card p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-surface-900">Notification Preferences</h2>
                <p className="text-xs text-surface-500 mt-1">Preferences are saved automatically to your browser.</p>
              </div>

              <div className="space-y-3">
                <ToggleRow
                  label="Weekly Click Digest"
                  description="Receive a weekly summary of click stats across all active links every Monday."
                  checked={notifs.weeklyDigest}
                  onChange={() => toggleNotif('weeklyDigest')}
                />
                <ToggleRow
                  label="Link Expiration Alerts"
                  description="Get an alert 24 hours before any of your links expire."
                  checked={notifs.linkExpiry}
                  onChange={() => toggleNotif('linkExpiry')}
                />
                <ToggleRow
                  label="Safety Score Drops"
                  description="Alert me immediately if a link's safety rating falls below the safe threshold."
                  checked={notifs.safetyDrop}
                  onChange={() => toggleNotif('safetyDrop')}
                />
                <ToggleRow
                  label="New Login Alerts"
                  description="Get notified when a new device signs into your account."
                  checked={notifs.newLogin}
                  onChange={() => toggleNotif('newLogin')}
                />
                <ToggleRow
                  label="Product Updates & Announcements"
                  description="Receive emails about new features and platform improvements."
                  checked={notifs.promoUpdates}
                  onChange={() => toggleNotif('promoUpdates')}
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-surface-400 pt-2">
                <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0" />
                Preferences saved automatically.
              </div>
            </div>
          )}

          {/* ══ BILLING ══ */}
          {activeTab === 'billing' && (
            <div className="glass-card p-6 space-y-6">
              <h2 className="text-lg font-semibold text-surface-900">Plans &amp; Billing</h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                {/* Free */}
                <div className={`p-5 border-2 rounded-xl flex flex-col justify-between transition-all ${
                  currentPlan === 'free' ? 'border-surface-900 bg-surface-50' : 'border-surface-200 bg-white'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-surface-500">Starter</span>
                      {currentPlan === 'free' && (
                        <span className="text-[10px] bg-surface-900 text-white px-2 py-0.5 rounded font-semibold">Active</span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-surface-900 mt-1">Free</h3>
                    <p className="text-xs text-surface-500 mt-2 leading-relaxed">100 links/month, basic analytics, QR codes.</p>
                    <ul className="mt-3 space-y-1.5">
                      {['100 links / month', 'Basic analytics', 'QR code generation', 'URL safety check'].map((f) => (
                        <li key={f} className="flex items-center gap-2 text-xs text-surface-600">
                          <Check size={12} className="text-emerald-500 flex-shrink-0" /> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <p className="text-lg font-bold text-surface-900 mt-4">₹0 <span className="text-xs font-normal text-surface-500">/ mo</span></p>
                </div>

                {/* Pro */}
                <div className={`p-5 border-2 rounded-xl flex flex-col justify-between transition-all relative ${
                  currentPlan === 'pro' ? 'border-blue-600 bg-blue-50/20' : 'border-blue-200 bg-white hover:border-blue-400'
                }`}>
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <Star size={10} /> Most Popular
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600">Pro</span>
                      {currentPlan === 'pro' && (
                        <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded font-semibold">Active</span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-surface-900 mt-1">LinkIQ Pro</h3>
                    <p className="text-xs text-surface-500 mt-2 leading-relaxed">Unlimited links, advanced analytics, custom aliases.</p>
                    <ul className="mt-3 space-y-1.5">
                      {['Unlimited links', 'Advanced analytics', 'Custom aliases', 'Priority support', 'Bulk upload (CSV)'].map((f) => (
                        <li key={f} className="flex items-center gap-2 text-xs text-surface-600">
                          <Check size={12} className="text-blue-500 flex-shrink-0" /> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-lg font-bold text-surface-900">₹749 <span className="text-xs font-normal text-surface-500">/ mo</span></p>
                    {currentPlan !== 'pro' && (
                      <button
                        onClick={() => handleUpgrade('pro')}
                        disabled={!!billingLoading}
                        className="btn-primary !py-1.5 !px-4 text-xs flex items-center gap-1.5 disabled:opacity-60"
                      >
                        {billingLoading === 'pro' ? <Loader2 size={13} className="animate-spin" /> : <Zap size={13} />}
                        {billingLoading === 'pro' ? 'Opening…' : 'Upgrade'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Enterprise */}
                <div className={`p-5 border-2 rounded-xl flex flex-col justify-between transition-all ${
                  currentPlan === 'enterprise' ? 'border-purple-600 bg-purple-50/20' : 'border-purple-200 bg-white hover:border-purple-400'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-purple-600">Enterprise</span>
                      {currentPlan === 'enterprise' && (
                        <span className="text-[10px] bg-purple-600 text-white px-2 py-0.5 rounded font-semibold">Active</span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-surface-900 mt-1">Enterprise</h3>
                    <p className="text-xs text-surface-500 mt-2 leading-relaxed">Everything in Pro, plus team seats and API access.</p>
                    <ul className="mt-3 space-y-1.5">
                      {['Everything in Pro', 'Team management', 'Dedicated API access', 'SLA support', 'Custom branding'].map((f) => (
                        <li key={f} className="flex items-center gap-2 text-xs text-surface-600">
                          <Check size={12} className="text-purple-500 flex-shrink-0" /> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-lg font-bold text-surface-900">₹2,499 <span className="text-xs font-normal text-surface-500">/ mo</span></p>
                    {currentPlan !== 'enterprise' && (
                      <button
                        onClick={() => handleUpgrade('enterprise')}
                        disabled={!!billingLoading}
                        className="btn-primary !py-1.5 !px-4 text-xs bg-purple-600 hover:bg-purple-700 flex items-center gap-1.5 disabled:opacity-60"
                      >
                        {billingLoading === 'enterprise' ? <Loader2 size={13} className="animate-spin" /> : <Zap size={13} />}
                        {billingLoading === 'enterprise' ? 'Opening…' : 'Upgrade'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Usage bar */}
              <div className="border-t border-surface-200 pt-6 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-surface-700">
                  <span>Monthly URL Usage</span>
                  <span>{user?._count?.urls || 0} / {currentPlan === 'free' ? '100' : '∞'} links</span>
                </div>
                <div className="w-full h-2.5 bg-surface-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: currentPlan === 'free' ? `${Math.min(((user?._count?.urls || 0) / 100) * 100, 100)}%` : '20%' }}
                  />
                </div>
                <p className="text-[11px] text-surface-400">
                  {currentPlan === 'free'
                    ? `${Math.max(0, 100 - (user?._count?.urls || 0))} links remaining this month.`
                    : 'Unlimited links on your current plan.'}
                </p>
              </div>


            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Settings;
