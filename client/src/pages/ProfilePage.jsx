import React, { useState } from 'react';
import { User, Mail, Building, CreditCard, Phone, ShieldCheck, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { formatDate } from '../utils/formatters';

export const ProfilePage = () => {
  const { user, updateUserProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    department: user?.department || '',
    studentId: user?.studentId || '',
    phone: user?.phone || '',
    profileImage: user?.profileImage || ''
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await updateUserProfile(formData);
    setSaving(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-charcoal-900 font-display">
          Student / User Profile
        </h1>
        <p className="text-xs sm:text-sm text-cocoa-600 mt-1">
          Manage your verified campus recovery contact details
        </p>
      </div>

      <div className="bg-cream-50 rounded-3xl border border-biscuit-200/80 p-6 sm:p-8 shadow-warm space-y-6">
        {/* Profile Card Summary */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-cream-100/70 border border-biscuit-200/80">
          <img
            src={
              formData.profileImage ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user?.name || 'User'
              )}&background=d96237&color=fff`
            }
            alt={user?.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-biscuit-300 shadow-warm-sm"
          />
          <div>
            <h3 className="text-lg font-bold text-charcoal-900 font-display">{user?.name}</h3>
            <p className="text-xs text-cocoa-600">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="px-2.5 py-0.5 rounded-md bg-terracotta-100 text-terracotta-800 text-[10px] font-bold uppercase font-display">
                {user?.role}
              </span>
              <span className="text-[11px] text-cocoa-400">
                Member since {formatDate(user?.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-charcoal-800 mb-1.5 flex items-center gap-1.5 font-display">
                <User className="w-3.5 h-3.5 text-terracotta-500" /> Full Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-cream-100/60 border border-biscuit-200 rounded-xl focus:ring-2 focus:ring-terracotta-500/20 focus:border-terracotta-500 focus:outline-none transition text-charcoal-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-800 mb-1.5 flex items-center gap-1.5 font-display">
                <Mail className="w-3.5 h-3.5 text-terracotta-500" /> Campus Email (Fixed)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 text-xs bg-biscuit-100 border border-biscuit-200 rounded-xl text-cocoa-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-charcoal-800 mb-1.5 flex items-center gap-1.5 font-display">
                <Building className="w-3.5 h-3.5 text-terracotta-500" /> Department / Major
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-cream-100/60 border border-biscuit-200 rounded-xl focus:ring-2 focus:ring-terracotta-500/20 focus:border-terracotta-500 focus:outline-none transition text-charcoal-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-800 mb-1.5 flex items-center gap-1.5 font-display">
                <CreditCard className="w-3.5 h-3.5 text-terracotta-500" /> Student / Staff ID
              </label>
              <input
                type="text"
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-cream-100/60 border border-biscuit-200 rounded-xl focus:ring-2 focus:ring-terracotta-500/20 focus:border-terracotta-500 focus:outline-none transition text-charcoal-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-charcoal-800 mb-1.5 flex items-center gap-1.5 font-display">
                <Phone className="w-3.5 h-3.5 text-terracotta-500" /> Phone Number
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-cream-100/60 border border-biscuit-200 rounded-xl focus:ring-2 focus:ring-terracotta-500/20 focus:border-terracotta-500 focus:outline-none transition text-charcoal-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-800 mb-1.5 font-display">
                Avatar / Profile Image URL
              </label>
              <input
                type="url"
                value={formData.profileImage}
                onChange={(e) => setFormData({ ...formData, profileImage: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2.5 text-xs bg-cream-100/60 border border-biscuit-200 rounded-xl focus:ring-2 focus:ring-terracotta-500/20 focus:border-terracotta-500 focus:outline-none transition text-charcoal-900 placeholder:text-cocoa-400"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-biscuit-200/70 flex justify-end">
            <Button variant="primary" type="submit" loading={saving} className="shadow-warm">
              <Save className="w-4 h-4" />
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
