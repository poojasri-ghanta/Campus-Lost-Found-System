import React, { useState } from 'react';
import { Calendar, Clock, MapPin, ShieldCheck } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { CAMPUS_LOCATIONS } from '../../utils/constants';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const HandoverScheduleModal = ({
  isOpen,
  onClose,
  claim,
  onHandoverScheduled
}) => {
  const { showToast } = useToast();
  const [location, setLocation] = useState(CAMPUS_LOCATIONS[0]);
  const [customLocation, setCustomLocation] = useState('');
  const [scheduledDate, setScheduledDate] = useState(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [scheduledTime, setScheduledTime] = useState('2:30 PM');
  const [notes, setNotes] = useState('Please bring your student ID card or photo ID for secondary identification.');
  const [submitting, setSubmitting] = useState(false);

  if (!claim) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalLocation = location === 'Other / Unspecified Location' && customLocation ? customLocation : location;

    try {
      setSubmitting(true);
      const res = await api.post('/handovers', {
        claimId: claim._id,
        location: finalLocation,
        scheduledDate,
        scheduledTime,
        notes
      });

      if (res.data.success) {
        showToast('Item Handover scheduled! A 6-digit verification PIN has been generated.', 'success');
        if (onHandoverScheduled) onHandoverScheduled(res.data.data);
        onClose();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to schedule handover.';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule Physical Item Handover"
      subtitle="Arrange a secure campus meeting location and time with the verified owner"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-2">
        <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-900 flex items-start gap-2.5">
          <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Upon scheduling, the system generates a unique <strong>6-digit verification code</strong>.
            During the physical meetup, the recipient provides this code to the finder to verify receipt
            and permanently close the case.
          </p>
        </div>

        {/* Location selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            Recommended Secure Campus Meetup Location
          </label>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            {CAMPUS_LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
          {location === 'Other / Unspecified Location' && (
            <input
              type="text"
              required
              placeholder="Enter custom campus building / room..."
              value={customLocation}
              onChange={(e) => setCustomLocation(e.target.value)}
              className="mt-2 w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          )}
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Scheduled Date
            </label>
            <input
              type="date"
              required
              value={scheduledDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Scheduled Time Slot
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 2:30 PM"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Instructions */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Handover Instructions / Notes for Owner
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="secondary" type="button" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="accent" type="submit" loading={submitting}>
            Confirm & Generate Verification PIN
          </Button>
        </div>
      </form>
    </Modal>
  );
};
