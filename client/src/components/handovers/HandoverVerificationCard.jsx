import React, { useState } from 'react';
import {
  ShieldCheck,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Copy,
  Check,
  KeyRound,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { Button } from '../common/Button';
import { StatusBadge } from '../common/Badge';
import { formatDate } from '../../utils/formatters';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const HandoverVerificationCard = ({
  handover,
  currentUser,
  onHandoverCompleted
}) => {
  const { showToast } = useToast();
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);

  if (!handover) return null;

  const isOwner = currentUser?._id === handover.ownerId?._id || currentUser?._id === handover.ownerId;
  const isFinder = currentUser?._id === handover.finderId?._id || currentUser?._id === handover.finderId;
  const isCompleted = handover.status === 'COMPLETED';

  const copyCode = () => {
    navigator.clipboard.writeText(handover.verificationCode);
    setCopied(true);
    showToast('Verification code copied to clipboard!', 'info');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!inputCode || inputCode.length < 6) {
      showToast('Please enter the 6-digit verification code.', 'warning');
      return;
    }

    try {
      setVerifying(true);
      const res = await api.put(`/handovers/${handover._id}/confirm`, {
        verificationCode: inputCode.trim()
      });

      if (res.data.success) {
        showToast('Verification PIN confirmed! Item successfully marked as RETURNED.', 'success');
        if (onHandoverCompleted) onHandoverCompleted(res.data.data);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid verification code. Please double check.';
      showToast(msg, 'error');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden">
      {/* Header Banner */}
      <div className={`p-5 flex items-center justify-between ${
        isCompleted
          ? 'bg-emerald-50 border-b border-emerald-100'
          : 'bg-indigo-50/70 border-b border-indigo-100'
      }`}>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">
              Ref: {handover.handoverReference}
            </span>
            <StatusBadge status={handover.status} type="item" />
          </div>
          <h4 className="text-base font-bold text-slate-900 mt-1">
            {isCompleted ? 'Item Handover Completed & Verified' : 'Scheduled Handover in Progress'}
          </h4>
        </div>

        {isCompleted && (
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Verification Code Box */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
          <div>
            <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider block">
              6-Digit Handover Verification PIN
            </span>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-3xl font-black font-mono tracking-widest text-emerald-400">
                {handover.verificationCode}
              </span>
              <button
                type="button"
                onClick={copyCode}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
                title="Copy PIN"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {isOwner
                ? 'Show this PIN to the finder when receiving your item in person.'
                : 'Enter this PIN after receiving confirmation from the owner.'}
            </p>
          </div>

          {!isCompleted && isFinder && (
            <form onSubmit={handleVerifyCode} className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                maxLength={6}
                placeholder="Enter PIN"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.replace(/\D/g, ''))}
                className="w-32 px-3 py-2 text-center text-slate-900 font-mono font-bold text-sm bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
              <Button variant="accent" size="sm" type="submit" loading={verifying}>
                Verify & Complete
              </Button>
            </form>
          )}
        </div>

        {/* Schedule & Location Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-400 font-medium flex items-center gap-1.5 mb-1">
              <MapPin className="w-3.5 h-3.5 text-indigo-500" /> Meetup Location
            </span>
            <strong className="text-slate-800 text-sm font-semibold">{handover.location}</strong>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-400 font-medium flex items-center gap-1.5 mb-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Scheduled Date
            </span>
            <strong className="text-slate-800 text-sm font-semibold">
              {formatDate(handover.scheduledDate)}
            </strong>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-400 font-medium flex items-center gap-1.5 mb-1">
              <Clock className="w-3.5 h-3.5 text-indigo-500" /> Scheduled Time
            </span>
            <strong className="text-slate-800 text-sm font-semibold">{handover.scheduledTime}</strong>
          </div>
        </div>

        {/* Two-Party Confirmation Badges */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <span className="text-xs font-bold text-slate-700 block mb-2">
            Two-Party Confirmation Status:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  handover.finderConfirmed || isCompleted
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span className="text-slate-600">
                Finder ({handover.finderId?.name || 'Finder'}):{' '}
                <strong className={handover.finderConfirmed || isCompleted ? 'text-emerald-600' : 'text-slate-500'}>
                  {handover.finderConfirmed || isCompleted ? 'Confirmed' : 'Awaiting confirmation'}
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  handover.ownerConfirmed || isCompleted
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span className="text-slate-600">
                Owner ({handover.ownerId?.name || 'Owner'}):{' '}
                <strong className={handover.ownerConfirmed || isCompleted ? 'text-emerald-600' : 'text-slate-500'}>
                  {handover.ownerConfirmed || isCompleted ? 'Confirmed' : 'Awaiting confirmation'}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {handover.notes && (
          <p className="text-xs text-slate-500 italic">
            <strong>Notes:</strong> {handover.notes}
          </p>
        )}
      </div>
    </div>
  );
};
