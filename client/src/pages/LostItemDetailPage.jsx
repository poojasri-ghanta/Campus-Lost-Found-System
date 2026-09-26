import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Sparkles,
  ShieldCheck,
  User,
  Trash2,
  Edit,
  Tag,
  CheckCircle2,
  RefreshCw,
  Compass
} from 'lucide-react';
import { StatusBadge, ConfidenceBadge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Item3DIcon } from '../components/common/Item3DIcon';
import { VerificationTimeline } from '../components/common/VerificationTimeline';
import { formatDate } from '../utils/formatters';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const LostItemDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [item, setItem] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/lost-items/${id}`);
      if (res.data.success) {
        setItem(res.data.data);
        setMatches(res.data.matches || []);
      }
    } catch (err) {
      console.error('Failed to load lost item details:', err);
      showToast('Lost item report not found.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleRescan = async () => {
    try {
      setScanning(true);
      const res = await api.post('/matches/generate', { lostItemId: id });
      if (res.data.success) {
        showToast(`Matching engine scan complete. Found ${res.data.count} potential correlations.`, 'success');
        fetchDetails();
      }
    } catch (err) {
      showToast('Error running matching engine scan.', 'error');
    } finally {
      setScanning(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this lost item report?')) return;
    try {
      const res = await api.delete(`/lost-items/${id}`);
      if (res.data.success) {
        showToast('Lost item report deleted.', 'info');
        navigate('/lost-items');
      }
    } catch (err) {
      showToast('Failed to delete report.', 'error');
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage label="Loading item report details..." />;
  }

  if (!item) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-cocoa-500">Report not found.</p>
        <Link to="/lost-items" className="text-xs text-terracotta-600 font-bold mt-2 inline-block">
          ← Back to Lost Items
        </Link>
      </div>
    );
  }

  const isOwner = user?._id === item.reportedBy?._id || user?._id === item.reportedBy;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Navigation & Actions Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-cocoa-600 hover:text-charcoal-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {(isOwner || isAdmin) && (
          <div className="flex items-center gap-2">
            <Button variant="danger" size="sm" onClick={handleDelete}>
              <Trash2 className="w-3.5 h-3.5" />
              Delete Report
            </Button>
          </div>
        )}
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Item Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-cream-50 rounded-3xl border border-biscuit-200/80 p-6 sm:p-8 shadow-warm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <StatusBadge status={item.status} type="item" />
                <span className="text-xs font-bold text-cocoa-500 uppercase tracking-wider font-display">
                  Category: {item.category}
                </span>
              </div>
              <span className="text-xs text-cocoa-400">
                Reported {formatDate(item.createdAt)}
              </span>
            </div>

            <div className="flex items-start gap-4">
              <Item3DIcon category={item.category} size="lg" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 font-display">
                  {item.title}
                </h1>
                <p className="text-xs text-cocoa-600 mt-1 flex items-center gap-2 font-medium">
                  <span>📍 Lost near {item.location}</span>
                  <span>•</span>
                  <span>📅 {formatDate(item.lostDate)}</span>
                </p>
              </div>
            </div>

            {/* Photo if present */}
            {item.image && (
              <div className="rounded-2xl overflow-hidden aspect-[16/9] bg-cream-100 max-h-72 border border-biscuit-200/80 shadow-warm-sm">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Key Specs Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-cream-100/60 p-4 rounded-2xl border border-biscuit-200/80">
              <div>
                <span className="text-cocoa-500 block text-[10px] uppercase font-bold font-display">Primary Color</span>
                <span className="font-bold text-charcoal-900">{item.color}</span>
              </div>
              <div>
                <span className="text-cocoa-500 block text-[10px] uppercase font-bold font-display">Brand</span>
                <span className="font-bold text-charcoal-900">{item.brand || 'Unspecified'}</span>
              </div>
              <div>
                <span className="text-cocoa-500 block text-[10px] uppercase font-bold font-display">Lost Location</span>
                <span className="font-bold text-charcoal-900 truncate block">{item.location}</span>
              </div>
              <div>
                <span className="text-cocoa-500 block text-[10px] uppercase font-bold font-display">Lost Date</span>
                <span className="font-bold text-charcoal-900">{formatDate(item.lostDate)}</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cocoa-500 font-display">
                Full Description & Details
              </h3>
              <p className="text-sm text-charcoal-800 leading-relaxed whitespace-pre-line">
                {item.description}
              </p>
            </div>

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {item.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-cocoa-700 bg-biscuit-100 px-2.5 py-1 rounded-lg border border-biscuit-200/70"
                  >
                    <Tag className="w-3 h-3 text-cocoa-400" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Matching Engine Widget & Reporter Card */}
        <div className="space-y-6">
          {/* Potential Matches Panel */}
          <div className="bg-cream-50 rounded-3xl border border-biscuit-200/80 p-6 shadow-warm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-biscuit-200/70">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-bold text-charcoal-900 font-display">
                  Algorithmic Matches
                </h3>
              </div>
              <button
                type="button"
                onClick={handleRescan}
                disabled={scanning}
                className="text-xs text-terracotta-600 hover:text-terracotta-800 flex items-center gap-1 font-semibold disabled:opacity-50 font-display"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
                Re-Scan
              </button>
            </div>

            {matches.length === 0 ? (
              <div className="text-center py-6 text-xs text-cocoa-400 space-y-2">
                <p>No high-confidence found items correlated yet.</p>
                <p className="text-[11px] text-cocoa-400">
                  Our background matching engine scans newly reported items 24/7.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {matches.map((m) => (
                  <div
                    key={m._id}
                    className="p-3.5 rounded-2xl bg-cream-100/60 border border-biscuit-200/80 hover:border-terracotta-300 transition space-y-2 card-hover-lift"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-charcoal-900 line-clamp-1 font-display">
                        {m.foundItemId?.title || 'Found Item'}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-black font-mono shrink-0">
                        {m.matchScore}%
                      </span>
                    </div>

                    <div className="text-[11px] text-cocoa-600 space-y-0.5">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-terracotta-500" />
                        <span className="truncate">{m.foundItemId?.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-terracotta-500" />
                        <span>{formatDate(m.foundItemId?.foundDate)}</span>
                      </div>
                    </div>

                    <Link to={`/matches/${m._id}`} className="block pt-1">
                      <Button variant="secondary" size="sm" className="w-full text-xs">
                        Inspect Factors & Claim →
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reporter Profile */}
          <div className="bg-cream-50 rounded-3xl border border-biscuit-200/80 p-5 shadow-warm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cocoa-500 font-display">
              Reported By
            </h4>
            <div className="flex items-center gap-3">
              <img
                src={
                  item.reportedBy?.profileImage ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    item.reportedBy?.name || 'User'
                  )}&background=d96237&color=fff`
                }
                alt={item.reportedBy?.name}
                className="w-10 h-10 rounded-xl object-cover border border-biscuit-200 shadow-warm-sm"
              />
              <div className="min-w-0 flex-1 text-xs">
                <span className="font-bold text-charcoal-900 block truncate font-display">{item.reportedBy?.name}</span>
                <span className="text-cocoa-600 block truncate">{item.reportedBy?.department}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
