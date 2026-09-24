import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, MapPin, Calendar, Tag, Image, ArrowRight } from 'lucide-react';
import { Button } from '../components/common/Button';
import { ITEM_CATEGORIES, CAMPUS_LOCATIONS } from '../utils/constants';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export const ReportLostItemPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: ITEM_CATEGORIES[0],
    description: '',
    color: '',
    brand: '',
    model: '',
    location: CAMPUS_LOCATIONS[0],
    customLocation: '',
    lostDate: new Date().toISOString().split('T')[0],
    image: '',
    tags: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalLocation =
      formData.location === 'Other / Unspecified Location' && formData.customLocation
        ? formData.customLocation
        : formData.location;

    try {
      setLoading(true);
      const res = await api.post('/lost-items', {
        ...formData,
        location: finalLocation,
        tags: formData.tags
          ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : []
      });

      if (res.data.success) {
        showToast('Lost item reported! Automatic matching engine scan initiated.', 'success');
        navigate(`/lost-items/${res.data.data._id}`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit report.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-heading">
          Report a Lost Item
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Provide as much accurate information as possible. Our algorithmic matching service will
          correlate newly reported found items across campus.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-soft space-y-6">
        {/* Category & Title */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
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
              Item Title / Summary *
            </label>
            <input
              type="text"
              name="title"
              required
              placeholder="e.g. Space Gray 14-inch MacBook Pro in sleeve"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Brand, Model & Color */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Primary Color *</label>
            <input
              type="text"
              name="color"
              required
              placeholder="e.g. Dark Gray, Matte Black"
              value={formData.color}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Brand / Manufacturer</label>
            <input
              type="text"
              name="brand"
              placeholder="e.g. Apple, Sony, Fossil"
              value={formData.brand}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Model (Optional)</label>
            <input
              type="text"
              name="model"
              placeholder="e.g. M2 14-inch, Galaxy S23"
              value={formData.model}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Location & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              Estimated Lost Location *
            </label>
            <select
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {CAMPUS_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
            {formData.location === 'Other / Unspecified Location' && (
              <input
                type="text"
                name="customLocation"
                required
                placeholder="Specific room, lawn, building..."
                value={formData.customLocation}
                onChange={handleChange}
                className="mt-2 w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Approximate Lost Date *
            </label>
            <input
              type="date"
              name="lostDate"
              required
              max={new Date().toISOString().split('T')[0]}
              value={formData.lostDate}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Detailed Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Full Description & Identifying Circumstances *
          </label>
          <textarea
            name="description"
            required
            rows={3}
            placeholder="Describe where you last had the item, surrounding events, case or attachments, etc."
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        {/* Photo URL & Keywords */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Image className="w-3.5 h-3.5 text-slate-400" />
              Photo / Reference Image URL (Optional)
            </label>
            <input
              type="url"
              name="image"
              placeholder="https://images.unsplash.com/..."
              value={formData.image}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              Search Tags (comma separated)
            </label>
            <input
              type="text"
              name="tags"
              placeholder="laptop, apple, library, sticker"
              value={formData.tags}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Submit button */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="secondary" type="button" onClick={() => navigate(-1)} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={loading}>
            <Sparkles className="w-4 h-4" />
            Submit & Scan Potential Matches
          </Button>
        </div>
      </form>
    </div>
  );
};
