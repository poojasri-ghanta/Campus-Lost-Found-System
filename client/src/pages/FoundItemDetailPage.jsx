import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Lock,
  ShieldCheck,
  UserCheck,
  AlertOctagon,
  Sparkles,
  CheckCircle2,
  Trash2,
  Edit3,
  User,
  Eye,
  Sliders,
  ArrowRight
} from 'lucide-react';
import { StatusBadge, ConfidenceBadge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { VerificationModal } from '../components/claims/VerificationModal';
import { ClaimReviewDrawer } from '../components/claims/ClaimReviewDrawer';
import { HandoverScheduleModal } from '../components/handovers/HandoverScheduleModal';
import { formatDate } from '../utils/formatters';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const FoundItemDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [item, setItem] = useState(null);
  const [claims, setClaims] = useState([]);
  const [userActiveClaim, setUserActiveClaim] = useState(null);
  const [isReporter, setIsReporter] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [selectedReviewClaim, setSelectedReviewClaim] = useState(null);
  const [scheduleClaim, setScheduleClaim] = useState(null);
  const [userLostItems, setUserLostItems] = useState([]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/found-items/${id}`);
      if (res.data.success) {
        setItem(res.data.data);
        setIsReporter(res.data.isReporter);
        setClaims(res.data.claims || []);
        setUserActiveClaim(res.data.userActiveClaim || null);
      }

      if (isAuthenticated) {
        const lostRes = await api.get('/lost-items/my');
        if (lostRes.data.success) setUserLostItems(lostRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load found item:', err);
      showToast('Found item not found.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id, isAuthenticated]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to remove this found item report?')) return;
    try {
      const res = await api.delete(`/found-items/${id}`);
      if (res.data.success) {
        showToast('Found item report removed.', 'info');
        navigate('/found-items');
      }
    } catch (err) {
      showToast('Failed to delete report.', 'error');
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage label="Loading found item records..." />;
  }

  if (!item) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-slate-500">Found item report not found.</p>
        <Link to="/found-items" className="text-xs text-indigo-600 font-bold mt-2 inline-block">
          ← Back to Found Items
        </Link>
      </div>
    );
  }

  const isFinderOrAdmin = isReporter || isAdmin;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {isFinderOrAdmin && (
          <div className="flex items-center gap-2">
            <Button variant="danger" size="sm" onClick={handleDelete}>
              <Trash2 className="w-3.5 h-3.5" />
              Delete Report
            </Button>
          </div>
        )}
      </div>

      {/* Disputed Alert Banner */}
      {item.isDisputed && (
        <div className="p-5 rounded-3xl bg-red-50 border border-red-200 text-red-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertOctagon className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold">Multiple Conflicting Claims – Admin Review Active</h4>
              <p className="text-xs text-red-800 mt-0.5">
                This found item received {item.claimCount} claims. The campus administration will
                compare verification answers side-by-side to verify the rightful owner.
              </p>
            </div>
          </div>
          {isAdmin && (
            <Link to="/admin/disputes" className="shrink-0">
              <Button variant="danger" size="sm">
                Open Dispute Workbench →
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Item Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-soft space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <StatusBadge status={item.status} type="item" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Category: {item.category}
                </span>
              </div>
              <span className="text-xs text-slate-400">
                Found on {formatDate(item.foundDate)}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
              {item.title}
            </h1>

            {/* Public Photo */}
            {item.publicImage && (
              <div className="rounded-2xl overflow-hidden aspect-[16/9] bg-slate-100 max-h-72">
                <img
                  src={item.publicImage}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Public Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Public Color</span>
                <span className="font-bold text-slate-800">{item.publicColor}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Found Location</span>
                <span className="font-bold text-slate-800 truncate block">{item.location}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Claims</span>
                <span className="font-bold text-indigo-600 font-mono">{item.claimCount || 0}</span>
              </div>
            </div>

            {/* Public Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Public Description
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {item.publicDescription}
              </p>
            </div>

            {/* Progressive Disclosure Secret Box (FOR FINDER / ADMIN ONLY) */}
            {isFinderOrAdmin && item.privateDetails && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white space-y-4 shadow-lg border border-indigo-900">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      Private Verification Identifiers (Concealed from Public)
                    </h4>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                    Finder/Admin Access Only
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {item.privateDetails.brand && (
                    <div>
                      <span className="text-slate-400 block text-[10px]">Brand / Model:</span>
                      <strong className="text-white">{item.privateDetails.brand} {item.privateDetails.model}</strong>
                    </div>
                  )}
                  {item.privateDetails.caseDetails && (
                    <div>
                      <span className="text-slate-400 block text-[10px]">Case / Cover:</span>
                      <strong className="text-white">{item.privateDetails.caseDetails}</strong>
                    </div>
                  )}
                  {item.privateDetails.scratches && (
                    <div>
                      <span className="text-slate-400 block text-[10px]">Scratches / Marks:</span>
                      <strong className="text-white">{item.privateDetails.scratches}</strong>
                    </div>
                  )}
                  {item.privateDetails.wallpaper && (
                    <div>
                      <span className="text-slate-400 block text-[10px]">Screen Wallpaper:</span>
                      <strong className="text-white">{item.privateDetails.wallpaper}</strong>
                    </div>
                  )}
                  {item.privateDetails.specificContents && (
                    <div>
                      <span className="text-slate-400 block text-[10px]">Inside Contents:</span>
                      <strong className="text-white">{item.privateDetails.specificContents}</strong>
                    </div>
                  )}
                  {item.privateDetails.serialNumber && (
                    <div>
                      <span className="text-slate-400 block text-[10px]">Serial / Unique Marks:</span>
                      <strong className="text-white">{item.privateDetails.serialNumber}</strong>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Claim & Ownership Action / Review Queue */}
        <div className="space-y-6">
          {/* If Viewer is Claimant / Student: */}
          {!isReporter && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-soft space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  Ownership Verification
                </h3>
              </div>

              {userActiveClaim ? (
                <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-900">Your Claim Status</span>
                    <StatusBadge status={userActiveClaim.status} type="claim" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600">Verification Match:</span>
                    <ConfidenceBadge
                      rating={userActiveClaim.confidenceRating}
                      score={userActiveClaim.verificationScore}
                    />
                  </div>
                  <Link to={`/claims/${userActiveClaim._id}`} className="block pt-1">
                    <Button variant="secondary" size="sm" className="w-full">
                      View Claim Details →
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Is this your misplaced item? Complete the verification screening to prove
                    ownership without exposing private details.
                  </p>
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={() => {
                      if (!isAuthenticated) {
                        navigate('/login');
                      } else {
                        setShowClaimModal(true);
                      }
                    }}
                  >
                    <UserCheck className="w-4 h-4" />
                    Request Ownership / Submit Claim
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* If Viewer is Finder or Admin: Incoming Claims Queue */}
          {isFinderOrAdmin && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-soft space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900 font-heading">
                    Ownership Claims Queue ({claims.length})
                  </h3>
                </div>
              </div>

              {claims.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  No claims submitted for this found item yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {claims.map((c) => (
                    <div
                      key={c._id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-indigo-300 transition space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h5 className="text-xs font-bold text-slate-900">
                            {c.claimantId?.name || 'Claimant'}
                          </h5>
                          <span className="text-[10px] text-slate-400">
                            {c.claimantId?.department} • ID: {c.claimantId?.studentId || 'N/A'}
                          </span>
                        </div>
                        <ConfidenceBadge rating={c.confidenceRating} score={c.verificationScore} />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <StatusBadge status={c.status} type="claim" />
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setSelectedReviewClaim(c)}
                        >
                          Review Answers →
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Reporting Finder Profile */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-soft space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Recovered & Reported By
            </h4>
            <div className="flex items-center gap-3">
              <img
                src={
                  item.reportedBy?.profileImage ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    item.reportedBy?.name || 'Finder'
                  )}&background=10b981&color=fff`
                }
                alt={item.reportedBy?.name}
                className="w-10 h-10 rounded-xl object-cover border border-slate-200"
              />
              <div className="min-w-0 flex-1 text-xs">
                <span className="font-bold text-slate-900 block truncate">{item.reportedBy?.name}</span>
                <span className="text-slate-500 block truncate">{item.reportedBy?.department}</span>
                <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider block mt-0.5">
                  Verified Finder
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Claim Submission Modal */}
      <VerificationModal
        isOpen={showClaimModal}
        onClose={() => setShowClaimModal(false)}
        foundItem={item}
        userLostItems={userLostItems}
        onClaimSubmitted={() => fetchDetails()}
      />

      {/* Claim Review Drawer (Finder / Admin) */}
      {selectedReviewClaim && (
        <ClaimReviewDrawer
          claim={selectedReviewClaim}
          foundItem={item}
          onClose={() => setSelectedReviewClaim(null)}
          onStatusUpdated={() => {
            fetchDetails();
            setSelectedReviewClaim(null);
          }}
          onScheduleHandover={(claimObj) => {
            setScheduleClaim(claimObj);
          }}
        />
      )}

      {/* Handover Schedule Modal */}
      {scheduleClaim && (
        <HandoverScheduleModal
          isOpen={!!scheduleClaim}
          onClose={() => setScheduleClaim(null)}
          claim={scheduleClaim}
          onHandoverScheduled={() => {
            fetchDetails();
            navigate('/handovers');
          }}
        />
      )}
    </div>
  );
};
