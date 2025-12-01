import { memo, useState, useRef } from "react";
import { Movie } from "@/types/movie";

interface MovieCardProps {
  movie: Movie;
  isFavorite: boolean;
  onToggleFavorite: (movie: Movie) => void;
  isLoading?: boolean;
}

const MovieCard = ({ movie, isFavorite, onToggleFavorite, isLoading = false }: MovieCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const isProcessingRef = useRef(false);

  // Validate poster URL - check for empty string, "N/A", or invalid URL
  const hasValidPoster = movie.poster && 
    movie.poster.trim() !== "" && 
    movie.poster !== "N/A" && 
    !imageError;

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleToggleClick = () => {
    // Prevent multiple clicks - check both external loading state and local processing state
    if (isLoading || isLocalLoading || isProcessingRef.current) {
      return;
    }

    // Set local loading state immediately to prevent rapid clicks
    isProcessingRef.current = true;
    setIsLocalLoading(true);

    // Call the toggle function
    onToggleFavorite(movie);

    // Keep loading state for a minimum duration to prevent rapid clicks
    // This ensures the button stays disabled even if the mutation completes quickly
    setTimeout(() => {
      isProcessingRef.current = false;
      setIsLocalLoading(false);
    }, 500);
  };

  // Combined loading state - either external or local
  const isButtonLoading = isLoading || isLocalLoading;

  return (
    <div className="group relative bg-white rounded-lg overflow-hidden hover:mouse-pointer shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="relative aspect-[2/3] overflow-hidden">
        {hasValidPoster ? (
          <>
            {imageLoading && (
              <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
                <div className="text-gray-400">
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            )}
            <img
              src={movie.poster}
              alt={movie.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={handleImageError}
              onLoad={handleImageLoad}
              style={{ display: imageLoading ? 'none' : 'block' }}
            />
          </>
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <svg className="h-12 w-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">No Image</p>
            </div>
          </div>
        )}
        
        <button
          onClick={handleToggleClick}
          disabled={isButtonLoading}
          className={`absolute top-2 right-2 p-2.5 rounded-full transition-all duration-200 shadow-lg ${
            isButtonLoading
              ? "bg-blue-500 text-white cursor-not-allowed animate-pulse"
              : "cursor-pointer"
          } ${
            !isButtonLoading && isFavorite
              ? "bg-red-500 text-white hover:bg-red-600"
              : !isButtonLoading
              ? "bg-white/90 text-gray-600 hover:bg-white hover:text-red-500"
              : ""
          }`}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          {isButtonLoading ? (
            <svg 
              className="h-5 w-5 animate-spin" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="3"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
              />
            </svg>
          ) : (
            <svg 
              className={`h-5 w-5 transition-all duration-200 ${isFavorite ? "fill-current" : ""}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          )}
        </button>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 line-clamp-2 text-black group-hover:text-blue-600 transition-colors">
          {movie.title}
        </h3>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{movie.year}</span>
        </div>
      </div>

      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 pointer-events-none" />
    </div>
  );
};

// Memoize component to prevent unnecessary re-renders
export default memo(MovieCard);

