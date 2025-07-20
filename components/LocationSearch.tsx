import { useState, useCallback, useRef, useEffect } from 'react';
import { MapPin, Loader2, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from './ui/Input';
import { cn } from '@/util/cn';
import { useDebounce } from '@/hooks/useDebounce';

interface Location {
  display_name: string;
  lat: string;
  lon: string;
  address: {
    city?: string;
    state?: string;
    country?: string;
  };
}

interface LocationSearchProps {
  value: string;
  onChange: (location: {
    address: string;
    lat: number;
    lng: number;
    timezone: string;
  }) => void;
  onBlur?: () => void;
  error?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
}

export function LocationSearch({
  value,
  onChange,
  onBlur,
  error,
  label,
  placeholder = 'Search for a location...',
  required,
}: LocationSearchProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  const searchLocations = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(searchQuery)}&format=json&limit=5&addressdetails=1`
      );
      const data = await response.json();
      setSuggestions(data);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Location search failed:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debouncedQuery && debouncedQuery !== value) {
      searchLocations(debouncedQuery);
    }
  }, [debouncedQuery, searchLocations, value]);

  const getTimezone = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://api.timezonedb.com/v2.1/get-time-zone?` +
        `key=YOUR_API_KEY&format=json&by=position&lat=${lat}&lng=${lng}`
      );
      const data = await response.json();
      return data.zoneName || 'UTC';
    } catch {
      // Fallback timezone estimation
      const offset = Math.round(lng / 15);
      return `UTC${offset >= 0 ? '+' : ''}${offset}`;
    }
  };

  const selectLocation = async (location: Location) => {
    const lat = parseFloat(location.lat);
    const lng = parseFloat(location.lon);
    const timezone = await getTimezone(lat, lng);
    
    onChange({
      address: location.display_name,
      lat,
      lng,
      timezone,
    });
    
    setQuery(location.display_name);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          selectLocation(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setSelectedIndex(-1);
  };

  const handleBlur = () => {
    // Delay to allow click on suggestion
    setTimeout(() => {
      setShowSuggestions(false);
      onBlur?.();
    }, 200);
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        onBlur={handleBlur}
        label={label}
        placeholder={placeholder}
        error={error}
        required={required}
        leftIcon={<MapPin className="w-5 h-5" />}
        rightIcon={
          isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Search className="w-5 h-5" />
          )
        }
      />

      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => selectLocation(suggestion)}
                className={cn(
                  'w-full text-left px-4 py-3 transition-colors',
                  'hover:bg-gray-50 dark:hover:bg-gray-800',
                  'border-b border-gray-100 dark:border-gray-800 last:border-b-0',
                  selectedIndex === index && 'bg-gray-50 dark:bg-gray-800'
                )}
              >
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {suggestion.address.city || suggestion.address.state || 'Unknown'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {suggestion.display_name}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}