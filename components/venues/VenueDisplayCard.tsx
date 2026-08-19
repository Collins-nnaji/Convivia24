import Link from 'next/link';
import { Heart, Image as ImageIcon, MapPin, Star } from 'lucide-react';

type VenueCardProps = {
  venue: {
    slug: string;
    name: string;
    kind: string;
    area: string;
    tagline: string;
    photoUrl?: string | null;
    followerCount?: number;
    reviewCount?: number;
    avgRating?: number;
    hours?: string;
  };
  km?: number;
};

export default function VenueDisplayCard({ venue, km }: VenueCardProps) {
  return (
    <Link
      href={`/events/venues/${venue.slug}`}
      className="group block bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-indigo-200 hover:shadow-lg transition-all duration-300"
    >
      <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {venue.photoUrl ? (
          <img src={venue.photoUrl} alt={venue.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/80 flex items-center justify-center">
              <ImageIcon size={24} className="text-gray-400" />
            </div>
          </div>
        )}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-[10px] font-semibold text-gray-700 px-2.5 py-1 rounded-full capitalize">
          {venue.kind}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
              {venue.name}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
              <MapPin size={11} /> {venue.area}
              {km != null && <span>· {km.toFixed(1)} km</span>}
            </p>
          </div>
          {(venue.avgRating ?? 0) > 0 && (
            <div className="flex items-center gap-1 shrink-0">
              <Star size={12} className="text-amber-400" fill="currentColor" />
              <span className="text-xs font-semibold text-gray-700">{(venue.avgRating ?? 0).toFixed(1)}</span>
            </div>
          )}
        </div>

        <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">
          {venue.tagline}
        </p>

        <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
          {(venue.followerCount ?? 0) > 0 && (
            <span className="inline-flex items-center gap-1">
              <Heart size={11} /> {venue.followerCount}
            </span>
          )}
          {(venue.reviewCount ?? 0) > 0 && (
            <span className="inline-flex items-center gap-1">
              <Star size={11} /> {venue.reviewCount} reviews
            </span>
          )}
          {venue.hours && (
            <span className="ml-auto truncate max-w-[120px]">{venue.hours}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
