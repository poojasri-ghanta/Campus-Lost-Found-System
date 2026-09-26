import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, ShieldCheck, Calendar, Clock, MapPin, CheckCircle2 } from 'lucide-react';
import { HandoverVerificationCard } from '../components/handovers/HandoverVerificationCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const HandoversPage = () => {
  const { user } = useAuth();
  const [handovers, setHandovers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHandovers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/handovers');
      if (res.data.success) {
        setHandovers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load handovers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHandovers();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-charcoal-900 font-display">
            Secure Item Handovers
          </h1>
          <span className="px-3 py-0.5 rounded-full bg-terracotta-100 text-terracotta-800 text-xs font-bold border border-terracotta-200/80 font-display">
            6-Digit PIN Protocol
          </span>
        </div>
        <p className="text-xs sm:text-sm text-cocoa-600">
          Coordinate physical item meetups and enter mutual verification codes to permanently close cases
        </p>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading handover sessions..." />
      ) : handovers.length === 0 ? (
        <EmptyState
          title="No scheduled handovers"
          description="Handovers are automatically initiated once an ownership claim is verified and approved by the finder."
          icon={ArrowLeftRight}
        />
      ) : (
        <div className="space-y-6">
          {handovers.map((handover) => (
            <HandoverVerificationCard
              key={handover._id}
              handover={handover}
              currentUser={user}
              onHandoverCompleted={() => fetchHandovers()}
            />
          ))}
        </div>
      )}
    </div>
  );
};
