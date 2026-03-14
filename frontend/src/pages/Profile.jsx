import { useEffect, useState, useRef } from 'react';
import { Camera, Eye, EyeOff, User } from 'lucide-react';
import { format } from 'date-fns';
import { api } from '../api/client';
import { useAuth } from '../contexts/AuthContext';

export default function Profile() {
  const { username, login: refreshAuth } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Email edit
  const [email, setEmail] = useState('');
  const [emailMsg, setEmailMsg] = useState('');
  const [emailSaving, setEmailSaving] = useState(false);

  // Password change
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [pwMsg, setPwMsg] = useState('');
  const [pwSaving, setPwSaving] = useState(false);

  const fileRef = useRef();

  useEffect(() => {
    api.getProfile().then(p => {
      setProfile(p);
      setEmail(p.email);
    }).finally(() => setLoading(false));
  }, []);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return alert('Image must be under 2 MB');
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target.result;
      const updated = await api.updateProfile({ avatar: base64 });
      setProfile(updated);
    };
    reader.readAsDataURL(file);
  };

  const handleEmailSave = async (e) => {
    e.preventDefault();
    setEmailMsg('');
    setEmailSaving(true);
    try {
      const updated = await api.updateProfile({ email });
      setProfile(updated);
      setEmailMsg('success:Email updated successfully');
    } catch (err) {
      setEmailMsg('error:' + (err.response?.data?.error || 'Failed to update email'));
    } finally {
      setEmailSaving(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setPwMsg('');
    if (pwForm.next !== pwForm.confirm) return setPwMsg('error:Passwords do not match');
    if (pwForm.next.length < 6) return setPwMsg('error:Password must be at least 6 characters');
    setPwSaving(true);
    try {
      await api.changePassword(pwForm.current, pwForm.next);
      setPwMsg('success:Password changed successfully');
      setPwForm({ current: '', next: '', confirm: '' });
    } catch (err) {
      setPwMsg('error:' + (err.response?.data?.error || 'Failed to change password'));
    } finally {
      setPwSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const initials = (profile?.username || 'TR').slice(0, 2).toUpperCase();
  const joinDate = profile?.created_at
    ? (() => { try { return format(new Date(profile.created_at), 'MMMM d, yyyy'); } catch { return profile.created_at; } })()
    : '—';

  return (
    <div className="space-y-6 fade-in-up max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="text-muted text-sm mt-1">Manage your account</p>
      </div>

      {/* Avatar + basic info */}
      <div className="card p-6 flex items-center gap-5">
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center">
            {profile?.avatar
              ? <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover" />
              : <span className="text-white text-2xl font-bold">{initials}</span>
            }
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-7 h-7 bg-accent hover:bg-indigo-500 rounded-lg flex items-center justify-center shadow-lg transition-colors"
          >
            <Camera size={13} className="text-white" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>
        <div>
          <p className="text-white font-semibold text-lg">{profile?.username}</p>
          <p className="text-muted text-sm">{profile?.email}</p>
          <p className="text-muted text-xs mt-1">Member since {joinDate}</p>
        </div>
      </div>

      {/* Edit email */}
      <div className="card p-6">
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
          <User size={16} className="text-accent" /> Account Info
        </h2>
        <form onSubmit={handleEmailSave} className="space-y-4">
          <div>
            <label className="text-muted text-xs uppercase tracking-wider font-medium block mb-1.5">Username</label>
            <input value={profile?.username || ''} disabled className="input opacity-50 cursor-not-allowed" />
          </div>
          <div>
            <label className="text-muted text-xs uppercase tracking-wider font-medium block mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input"
              required
            />
          </div>
          {emailMsg && (
            <p className={`text-sm ${emailMsg.startsWith('success') ? 'text-profit' : 'text-loss'}`}>
              {emailMsg.split(':').slice(1).join(':')}
            </p>
          )}
          <button type="submit" disabled={emailSaving || email === profile?.email} className="btn-primary">
            {emailSaving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Change password */}
      <div className="card p-6">
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Eye size={16} className="text-accent" /> Change Password
        </h2>
        <form onSubmit={handlePasswordSave} className="space-y-4">
          <div>
            <label className="text-muted text-xs uppercase tracking-wider font-medium block mb-1.5">Current Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={pwForm.current}
                onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))}
                className="input pr-10"
                required
              />
              <button type="button" onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white">
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-muted text-xs uppercase tracking-wider font-medium block mb-1.5">New Password</label>
            <input
              type={showPw ? 'text' : 'password'}
              value={pwForm.next}
              onChange={e => setPwForm(f => ({ ...f, next: e.target.value }))}
              className="input"
              placeholder="Min. 6 characters"
              required
            />
          </div>
          <div>
            <label className="text-muted text-xs uppercase tracking-wider font-medium block mb-1.5">Confirm New Password</label>
            <input
              type={showPw ? 'text' : 'password'}
              value={pwForm.confirm}
              onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
              className="input"
              required
            />
          </div>
          {pwMsg && (
            <p className={`text-sm ${pwMsg.startsWith('success') ? 'text-profit' : 'text-loss'}`}>
              {pwMsg.split(':').slice(1).join(':')}
            </p>
          )}
          <button type="submit" disabled={pwSaving} className="btn-primary">
            {pwSaving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
