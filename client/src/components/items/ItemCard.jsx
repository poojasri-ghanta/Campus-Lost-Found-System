import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Lock, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';
import { StatusBadge } from '../common/Badge';
import { formatDate } from '../../utils/formatters';

export const ItemCard = ({ item, type = 'found' }) => {
  const isFound = type === 'found';
  const detailUrl = isFound ? `/found-items/${item._id}` : `/lost-items/${item._id}`;
  const dateVal = isFound ? item.foundDate : item.lostDate;
  const imageSrc = isFound ? item.publicImage : item.image;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 shadow-soft hover:shadow-card hover:border-indigo-200 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Image / Header Thumbnail */}
      <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
            <ShieldCheck className="w-12 h-12 opacity-30" />
            <span className="text-xs font-semibold mt-2 text-slate-500">
              {item.category}
            </span>
          </div>
        )}

        {/* Status Badge in Corner */}
        <div className="absolute top-3 left-3">
          <StatusBadge status={item.status} type="item" />
        </div>

        {/* Category Pill in Top Right */}
        <div className="absolute top-3 right-3 bg-slate-900/70 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
          {item.category}
        </div>

        {/* Disputed Warning Banner if applicable */}
        {item.isDisputed && (
          <div className="absolute bottom-0 inset-x-0 bg-red-600/90 backdrop-blur-sm text-white text-[11px] font-bold py-1 px-3 flex items-center justify-center gap-1.5 animate-pulse">
            <ShieldCheck className="w-3.5 h-3.5" />
            Dispute Review Required
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span>Color: <strong className="text-slate-700 font-semibold">{isFound ? item.publicColor : item.color}</strong></span>
            {item.brand && (
              <span className="text-slate-400">| Brand: <strong className="text-slate-700 font-semibold">{item.brand}</strong></span>
            )}
          </div>

          <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
            <Link to={detailUrl}>{item.title}</Link>
          </h3>

          <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {isFound ? item.publicDescription : item.description}
          </p>
        </div>

        {/* Metadata & Actions */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="space-y-1.5 text-xs text-slate-500 mb-4">
            <div className="flex items-center gap-2 truncate">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{item.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{formatDate(dateVal)}</span>
            </div>
          </div>

          {/* Progressive Security Footer Indicator */}
          {isFound && (
            <div className="mb-3 flex items-center justify-between text-[11px] bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
              <span className="text-slate-500 flex items-center gap-1 font-medium">
                <Lock className="w-3 h-3 text-indigo-500" /> Private Details
              </span>
              <span className="font-bold text-indigo-600">Concealed</span>
            </div>
          )}

          {/* Action button */}
          <Link
            to={detailUrl}
            className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-xs ${
              isFound
                ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {isFound ? (
              <>
                <UserCheck className="w-3.5 h-3.5" />
                View & Verify Ownership
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                Inspect Matches ({item.potentialMatchCount || 0})
              </>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
};
