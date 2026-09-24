import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Eye,
  MapPin,
  Calendar,
  Sparkles,
  Info,
  CheckCircle2,
  FileKey
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { ITEM_CATEGORIES, CAMPUS_LOCATIONS } from '../utils/constants';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export const ReportFoundItemPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    // PUBLIC FIELDS
    title: '',
    category: ITEM_CATEGORIES[0],
    publicColor: '',
    location: CAMPUS_LOCATIONS[0],
    customLocation: '',
    foundDate: new Date().toISOString().split('T')[0],
    publicDescription: '',
    publicImage: '',

    // PRIVATE VERIFICATION SECRETS (Progressive Disclosure)
    privateDetails: {
      brand: '',
      model: '',
      scratches: '',
      caseDetails: '',
      wallpaper: '',
      serialNumber: '',
      specificContents: '',
      uniqueMarks: '',
      additionalSecret: ''
    }
  });

  const handlePublicChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePrivateChange = (e) => {
    setFormData({
      ...formData,
      privateDetails: {
        ...formData.privateDetails,
        [e.target.name]: e.target.value
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalLocation =
      formData.location === 'Other / Unspecified Location' && formData.customLocation
        ? formData.customLocation
        : formData.location;

    try {
      setLoading(true);
      const res = await api.post('/found-items', {
        ...formData,
        location: finalLocation
      });

      if (res.data.success) {
        showToast(
          'Found item registered with progressive disclosure! Verification questionnaire auto-generated.',
          'success'
        );
        navigate(`/found-items/${res.data.data._id}`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit found item report.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-heading">
            Report a Found Item
          </h1>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold uppercase tracking-wide">
            Finder Portal
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500">
          Register an item you recovered on campus. Follow our progressive disclosure structure to
          protect private details so only the true owner can claim it.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* SECTION 1: PUBLIC INFORMATION */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-soft space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Eye className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Part 1: Public Information
                </h3>
                <p className="text-xs text-slate-400">
                  Visible to students browsing the public registry
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
              Public Tier
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Item Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handlePublicChange}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {ITEM_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                General Public Item Name *
              </label>
              <input
                type="text"
                name="title"
                required
                placeholder="e.g. Black Smartphone found near Library (Do NOT write exact model or passcode in public title)"
                value={formData.title}
                onChange={handlePublicChange}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                General Color *
              </label>
              <input
                type="text"
                name="publicColor"
                required
                placeholder="e.g. Black, Silver, Brown"
                value={formData.publicColor}
                onChange={handlePublicChange}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Found Location *
              </label>
              <select
                name="location"
                value={formData.location}
                onChange={handlePublicChange}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {CAMPUS_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Found Date *
              </label>
              <input
                type="date"
                name="foundDate"
                required
                max={new Date().toISOString().split('T')[0]}
                value={formData.foundDate}
                onChange={handlePublicChange}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {formData.location === 'Other / Unspecified Location' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Custom Campus Location
              </label>
              <input
                type="text"
                name="customLocation"
                required
                placeholder="Specify classroom, building, bench, or lawn area..."
                value={formData.customLocation}
                onChange={handlePublicChange}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Public Description *
            </label>
            <textarea
              name="publicDescription"
              required
              rows={2}
              placeholder="e.g. Found on a study table in the library 2nd floor around 3:00 PM. Safely kept with finder."
              value={formData.publicDescription}
              onChange={handlePublicChange}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Public Photo URL (Optional - only upload sanitized exterior photo)
            </label>
            <input
              type="url"
              name="publicImage"
              placeholder="https://images.unsplash.com/..."
              value={formData.publicImage}
              onChange={handlePublicChange}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* SECTION 2: PRIVATE VERIFICATION SECRETS */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-900/60 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Part 2: Private Verification Information (Strictly Confidential)
                </h3>
                <p className="text-xs text-slate-400">
                  NEVER exposed in public APIs. Used exclusively to formulate & score ownership claim quizzes.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/30">
              🔒 Encrypted / Protected
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Exact Brand & Model
              </label>
              <input
                type="text"
                name="brand"
                placeholder="e.g. Samsung Galaxy S23 Ultra / Apple MacBook Pro 14"
                value={formData.privateDetails.brand}
                onChange={handlePrivateChange}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Protective Case / Keychain / Sleeve Details
              </label>
              <input
                type="text"
                name="caseDetails"
                placeholder="e.g. Transparent case with blue NASA sticker on back"
                value={formData.privateDetails.caseDetails}
                onChange={handlePrivateChange}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Physical Scratches / Dents / Wear Marks
              </label>
              <input
                type="text"
                name="scratches"
                placeholder="e.g. Hairline scratch across camera bezel, tiny dent on bottom left corner"
                value={formData.privateDetails.scratches}
                onChange={handlePrivateChange}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Lock Screen Wallpaper / Screen Clues
              </label>
              <input
                type="text"
                name="wallpaper"
                placeholder="e.g. Mountain landscape wallpaper, golden retriever photo"
                value={formData.privateDetails.wallpaper}
                onChange={handlePrivateChange}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Specific Compartment Contents / Notes Inside
              </label>
              <input
                type="text"
                name="specificContents"
                placeholder="e.g. Contains student transit card and gym locker key #104"
                value={formData.privateDetails.specificContents}
                onChange={handlePrivateChange}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Serial Number / Model Identifier / Unique Marks
              </label>
              <input
                type="text"
                name="serialNumber"
                placeholder="e.g. Serial ending in C02G or initials engraved 'D.M.'"
                value={formData.privateDetails.serialNumber}
                onChange={handlePrivateChange}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit action */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={() => navigate(-1)} disabled={loading}>
            Cancel
          </Button>
          <Button variant="accent" type="submit" loading={loading} size="lg">
            <ShieldCheck className="w-5 h-5" />
            Publish Found Item with Progressive Security
          </Button>
        </div>
      </form>
    </div>
  );
};
