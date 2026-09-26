import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Lock, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';
import { StatusBadge } from '../common/Badge';
import { Item3DIcon } from '../common/Item3DIcon';
import { formatDate } from '../../utils/formatters';

export const ItemCard = ({ item, type = 'found' }) => {
  const isFound = type === 'found';
  const detailUrl = isFound ? `/found-items/${item._id}` : `/lost-items/${item._id}`;
  const dateVal = isFound ? item.foundDate : item.lostDate;
  const imageSrc = isFound ? item.publicImage : item.image;

  return (
    <div className="group bg-white rounded-3xl border border-biscuit-200 shadow-soft hover:shadow-card hover:border-terracotta-300 card-hover-lift transition-all duration-300 flex flex-col overflow-hidden">
      {/* Image / Header Thumbnail */}
      <div className="relative aspect-[16/10] bg-cream-100 overflow-hidden">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-cream-100 via-biscuit-100 to-parchment-200 text-cocoa-500 p-4">
            <Item3DIcon category={item.category} size="xl" />
            <span className="text-xs font-bold mt-2 text-cocoa-600">
              {item.category}
            </span>
          </div>
        )}

        {/* Status Badge in Corner */}
        <div className="absolute top-3 left-3">
          <StatusBadge status={item.status} type="item" />
        </div>

        {/* Category Pill in Top Right */}
        <div className="absolute top-3 right-3 bg-cocoa-950/75 backdrop-blur-md text-cream-50 text-[10px] font-bold px-3 py-1 rounded-full border border-white/10">
          {item.category}
        </div>

        {/* Disputed Warning Banner if applicable */}
        {item.isDisputed && (
          <div className="absolute bottom-0 inset-x-0 bg-rust-600/90 backdrop-blur-xs text-white text-[11px] font-bold py-1 px-3 flex items-center justify-center gap-1.5 animate-pulse">
            <ShieldCheck className="w-3.5 h-3.5" />
            Dispute Review Required
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-cocoa-500 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-terracotta-500" />
            <span>Color: <strong className="text-cocoa-800 font-bold">{isFound ? item.publicColor : item.color}</strong></span>
            {item.brand && (
              <span className="text-cocoa-400">| Brand: <strong className="text-cocoa-800 font-bold">{item.brand}</strong></span>
            )}
          </div>

          <h3 className="text-base font-bold text-cocoa-950 group-hover:text-terracotta-600 transition-colors line-clamp-1 font-heading">
            <Link to={detailUrl}>{item.title}</Link>
          </h3>

          <p className="mt-2 text-xs text-cocoa-600 line-clamp-2 leading-relaxed">
            {isFound ? item.publicDescription : item.description}
          </p>
        </div>

        {/* Metadata & Actions */}
        <div className="mt-5 pt-4 border-t border-biscuit-100">
          <div className="space-y-1.5 text-xs text-cocoa-600 mb-4">
            <div className="flex items-center gap-2 truncate">
              <MapPin className="w-3.5 h-3.5 text-cocoa-400 shrink-0" />
              <span className="truncate">{item.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-cocoa-400 shrink-0" />
              <span>{formatDate(dateVal)}</span>
            </div>
          </div>

          {/* Progressive Security Footer Indicator */}
          {isFound && (
            <div className="mb-3.5 flex items-center justify-between text-[11px] bg-cream-100 px-3 py-1.5 rounded-xl border border-biscuit-200">
              <span className="text-cocoa-600 flex items-center gap-1.5 font-bold">
                <Lock className="w-3 h-3 text-terracotta-600" /> Private Details
              </span>
              <span className="font-extrabold text-terracotta-600 uppercase text-[10px] tracking-wider">Concealed</span>
            </div>
          )}

          {/* Action button */}
          <Link
            to={detailUrl}
            className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition shadow-xs ${
              isFound
                ? 'bg-terracotta-50 text-terracotta-700 hover:bg-terracotta-600 hover:text-white border border-terracotta-200/80 hover:border-transparent'
                : 'bg-cream-200 text-cocoa-800 hover:bg-cocoa-900 hover:text-white border border-biscuit-300 hover:border-transparent'
            }`}
          >
            {isFound ? (
              <>
                <UserCheck className="w-3.5 h-3.5" />
                View & Verify Ownership
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Inspect Matches ({item.potentialMatchCount || 0})
              </>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
};

