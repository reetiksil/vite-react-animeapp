import React, { useEffect, useState, useRef } from 'react';
import Search from './Components/Search';
import Loader from './Components/Loader';
import Animecard from './Components/Animecard';
import { useDebounce } from 'react-use';

const API_BASE_URL = "https://kitsu.io/api/edge";

// --- CONFIGURATION DICTIONARIES ---
const ADVANCED_FILTERS = {
    sort: [
        { value: '-userCount', label: 'Most Popular' },
        { value: '-averageRating', label: 'Highest Rated' },
        { value: '-favoritesCount', label: 'Most Favorited' },
        { value: '-startDate', label: 'Newest Releases' },
        { value: 'startDate', label: 'Oldest Releases' },
        { value: '-episodeCount', label: 'Most Episodes' },
        { value: 'episodeCount', label: 'Fewest Episodes' }
    ],
    status: [
        { value: '', label: 'All Statuses' },
        { value: 'current', label: 'Currently Airing' },
        { value: 'finished', label: 'Finished' },
        { value: 'upcoming', label: 'Upcoming' }
    ],
    subtype: [
        { value: '', label: 'All Types' },
        { value: 'TV', label: 'TV Series' },
        { value: 'movie', label: 'Movie' },
        { value: 'OVA', label: 'OVA / Special' }
    ],
    ageRating: [
        { value: '', label: 'All Ratings' },
        { value: 'G', label: 'G (All Ages)' },
        { value: 'PG', label: 'PG (Children)' },
        { value: 'R', label: 'R (17+)' }
    ]
};

const GENRES = [
    "Action", "Adventure", "Cars", "Comedy", "Dementia", 
    "Demons", "Drama", "Ecchi", "Fantasy", "Game", 
    "Harem", "Historical", "Horror", "Isekai", "Josei", 
    "Kids", "Magic", "Martial Arts", "Mecha", "Military", 
    "Music", "Mystery", "Parody", "Police", "Psychological", 
    "Romance", "Samurai", "School", "Sci-Fi", "Seinen", 
    "Shoujo", "Shoujo Ai", "Shounen", "Shounen Ai", 
    "Slice of Life", "Space", "Sports", "Super Power", 
    "Supernatural", "Thriller", "Vampire"
];

// --- CUSTOM DROPDOWN COMPONENT ---
const CustomDropdown = ({ label, options, value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedOption = options.find(opt => opt.value === value) || options[0];

    return (
        <div className="relative flex flex-col gap-2">
            <label className="text-light-200 text-xs font-bold uppercase tracking-wider">{label}</label>
            
            <div 
                className="bg-dark-100 text-gray-200 text-sm font-medium border border-light-100/20 rounded-xl px-4 py-2.5 flex justify-between items-center cursor-pointer hover:border-light-200 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                {selectedOption.label}
                <svg className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="#cecefb">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute top-[100%] left-0 w-full mt-2 bg-dark-100 border border-light-100/20 rounded-xl shadow-2xl z-20 overflow-hidden flex flex-col py-1">
                        {options.map(opt => (
                            <div 
                                key={opt.value}
                                className={`px-4 py-2.5 text-sm cursor-pointer transition-colors hover:bg-light-100/10 ${value === opt.value ? 'text-[#7575f2] font-bold bg-[#7575f2]/10' : 'text-gray-200'}`}
                                onClick={() => {
                                    onChange(opt.value);
                                    setIsOpen(false);
                                }}
                            >
                                {opt.label}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

const App = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [animeList, setAnimeList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(true);

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const filterContainerRef = useRef(null);
    
    // 1. ACTIVE FILTERS
    const [activeFilters, setActiveFilters] = useState({
        sort: '-userCount', 
        status: '',
        subtype: '',
        ageRating: '',
        genres: []
    });

    // 2. PENDING FILTERS
    const [pendingFilters, setPendingFilters] = useState(activeFilters);

    // --- RECOMMENDATION ENGINE STATE ---
    const [recommendations, setRecommendations] = useState(() => {
        const saved = localStorage.getItem('animeRecommendations');
        return saved ? JSON.parse(saved) : [];
    });

    useDebounce(
        () => {
            setDebouncedSearchTerm(searchTerm);
            setPage(1); 
        }, 
        1000, 
        [searchTerm]
    );

    // --- OUTSIDE CLICK LISTENER ---
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isFilterOpen && filterContainerRef.current && !filterContainerRef.current.contains(event.target)) {
                setIsFilterOpen(false);
                setPendingFilters(activeFilters); // Reset to active state if clicked away
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isFilterOpen, activeFilters]);

    // --- FILTER HANDLERS ---
    const handleOpenFilters = () => {
        setPendingFilters(activeFilters);
        setIsFilterOpen(!isFilterOpen);
    };

    const handlePendingChange = (key, value) => {
        setPendingFilters(prev => ({ ...prev, [key]: value }));
    };

    const togglePendingGenre = (genre) => {
        setPendingFilters(prev => {
            const newGenres = prev.genres.includes(genre)
                ? prev.genres.filter(g => g !== genre)
                : [...prev.genres, genre];
            return { ...prev, genres: newGenres };
        });
    };

    const applyFilters = () => {
        setActiveFilters(pendingFilters);
        setIsFilterOpen(false);
        setPage(1);
    };

    const clearFilters = () => {
        const resetState = {
            sort: '-userCount', 
            status: '',
            subtype: '',
            ageRating: '',
            genres: []
        };
        setPendingFilters(resetState); 
    };

    const handleGenreClickFromCard = (genre) => {
        const newFilters = {
            sort: '-userCount', 
            status: '',
            subtype: '',
            ageRating: '',
            genres: [genre]
        };
        setActiveFilters(newFilters);
        setPendingFilters(newFilters);
        setSearchTerm(''); 
        setPage(1);
    };

    // --- TRACKING ALGORITHM ---
    const trackValidSearch = (results, query) => {
        // Only track if it was an actual text search and it returned valid data
        if (!query || results.length === 0) return;

        const topMatch = results[0]; // Grab the closest match to their search

        setRecommendations(prev => {
            let updatedTracker = [...prev];
            const existingIndex = updatedTracker.findIndex(item => item.animeData.id === topMatch.id);

            if (existingIndex >= 0) {
                // If they searched this before, increase its rank score
                updatedTracker[existingIndex].score += 1;
            } else {
                // If it's a new search, add it to the tracker
                updatedTracker.push({
                    score: 1,
                    animeData: topMatch // Store the full object so we can use its poster and title
                });
            }

            // Sort by highest score first, and keep only the top 10
            updatedTracker.sort((a, b) => b.score - a.score);
            const topRecommendations = updatedTracker.slice(0, 10);

            // Save to browser memory
            localStorage.setItem('animeRecommendations', JSON.stringify(topRecommendations));
            return topRecommendations;
        });
    };
    // --- API ENGINE ---
    const fetchAnimes = async (query, currentPage, filters) => {
        setIsLoading(true);
        setErrorMessage('');
        try {
            const offset = (currentPage - 1) * 20;
            let url = `${API_BASE_URL}/anime?page[limit]=20&page[offset]=${offset}`;

            if (query) url += `&filter[text]=${encodeURIComponent(query)}`;
            if (filters.sort) url += `&sort=${filters.sort}`;
            if (filters.status) url += `&filter[status]=${filters.status}`;
            if (filters.subtype) url += `&filter[subtype]=${filters.subtype}`;
            if (filters.ageRating) url += `&filter[ageRating]=${filters.ageRating}`;
            if (filters.genres.length > 0) url += `&filter[categories]=${filters.genres.join(',')}`;

            const response = await fetch(url); 
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            
            const data = await response.json();
            setAnimeList(data.data || []);
            setHasNextPage(data.links?.next ? true : false);
            
        } catch (error) {
            console.error(`Error fetching Anime: ${error}`);
            setErrorMessage('Error fetching anime. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

   useEffect(() => {
        fetchAnimes(debouncedSearchTerm, page, activeFilters);
    }, [debouncedSearchTerm, page, activeFilters]);

    // --- NEW: DEDICATED TRACKING DEBOUNCER ---
    // Waits 2 full seconds after the results load and the user stops typing
    useDebounce(
        () => {
            // Only track if there is an active search and valid results are on screen
            if (debouncedSearchTerm && animeList.length > 0) {
                trackValidSearch(animeList, debouncedSearchTerm);
            }
        }, 
        2000, // 2000ms (2 seconds) delay
        [debouncedSearchTerm, animeList]
    );
    const hasActiveFilters = activeFilters.status || activeFilters.subtype || activeFilters.ageRating || activeFilters.genres.length > 0;

    // --- DYNAMIC HEADING LOGIC ---
    const getDynamicHeading = () => {
        if (debouncedSearchTerm) {
            return `Results for "${debouncedSearchTerm}"`;
        }

        let prefix = "Popular";
        
        if (activeFilters.status === 'current') {
            prefix = "Currently Airing";
        } else if (activeFilters.status === 'upcoming') {
            prefix = "Upcoming";
        } else if (activeFilters.sort === '-averageRating') {
            prefix = "Highest Rated";
        } else if (activeFilters.sort === '-startDate') {
            prefix = "Latest";
        } else if (activeFilters.sort === '-favoritesCount') {
            prefix = "Most Favorited";
        }

        let genreString = "";
        if (activeFilters.genres.length > 0) {
            genreString = activeFilters.genres.slice(0, 2).join(' & ');
        }

        const combinedTitle = `${prefix} ${genreString} Anime`;
        return combinedTitle.replace(/\s+/g, ' ').trim();
    };

    return (
        <main>
            <div className='pattern'>
                <div className="wrapper">
                    <header>
                        <img src="./hero.png" alt="BackGround" />
                        <h1>Can't Find Your <br /> Favorite <span className='text-gradient'>Anime</span> ? We've Got You.</h1>
                        <p className='text-2xl-white'> Find legal streaming platforms, discover new series, and spend less time searching</p>
                        <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                    </header>
                    
                    <section className='all-animes mt-12 sm:mt-16'>
                        {/* ---------- RECOMMENDATIONS SECTION ---------- */}
                        {recommendations.length > 0 && !debouncedSearchTerm && (
                            <div className="mb-12 animate-fade-in w-full">
                                <div className="flex items-center gap-3 mb-4 px-2">
                                    <h2 className="mb-0 text-xl sm:text-2xl font-bold text-white">Recommended For You</h2>
                                </div>
                                
                                <ul className="flex flex-row overflow-x-auto gap-5 sm:gap-6 px-2 pb-6 pt-2 hide-scrollbar w-full">
                                    {recommendations.map((rec) => (
                                        <li 
                                            key={`rec-${rec.animeData.id}`} 
                                            onClick={() => setSearchTerm(rec.animeData.attributes.canonicalTitle || rec.animeData.attributes.titles.en)}
                                            className="flex flex-col gap-3 min-w-[130px] max-w-[130px] sm:min-w-[160px] sm:max-w-[160px] cursor-pointer group shrink-0"
                                        >
                                            {/* Poster Container with Overflow Hidden for the Zoom Effect */}
                                            <div className="w-full aspect-[2/3] overflow-hidden rounded-xl shadow-lg shadow-black/40 bg-dark-100">
                                                <img 
                                                    src={rec.animeData.attributes.posterImage?.small || './hero.png'} 
                                                    alt={rec.animeData.attributes.canonicalTitle}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out" 
                                                />
                                            </div>
                                            
                                            {/* Title */}
                                            <span className="text-gray-200 text-sm font-bold line-clamp-2 group-hover:text-[#7575f2] transition-colors">
                                                {rec.animeData.attributes.canonicalTitle || rec.animeData.attributes.titles.en || "Unknown Title"}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                                
                                <div className="w-full h-px bg-light-100/10 mt-6 mb-8"></div>
                            </div>
                        )}
                        {/* ---------- END RECOMMENDATIONS ---------- */}
                        {/* THE TRACKED CONTAINER REF GOES HERE */}
                        <div className="flex flex-col mb-8 gap-4 w-full relative" ref={filterContainerRef}>
                            
                            <div className="flex justify-between items-center gap-4">
                                <h2 className="mb-0 capitalize">{getDynamicHeading()}</h2>
                                
                                <button 
                                    onClick={handleOpenFilters}
                                    className={`relative flex items-center justify-center p-3 rounded-xl transition-all border ${isFilterOpen ? 'bg-[#7575f2] text-white border-[#7575f2]' : 'bg-dark-100 text-gray-200 border-light-100/20 hover:border-light-200 hover:bg-light-100/5'}`}
                                    title="Open Filters"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                                    </svg>
                                    {hasActiveFilters && (
                                        <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[#1CE783] border-2 border-dark-100"></span>
                                    )}
                                </button>
                            </div>

                            {isFilterOpen && (
                                <div className="absolute top-[110%] right-0 w-full z-30 bg-dark-100/95 border border-light-100/10 rounded-2xl p-6 sm:p-8 flex flex-col gap-8 animate-fade-in shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-md">
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <CustomDropdown 
                                            label="Sort By" 
                                            options={ADVANCED_FILTERS.sort} 
                                            value={pendingFilters.sort} 
                                            onChange={(val) => handlePendingChange('sort', val)} 
                                        />
                                        {['status', 'subtype', 'ageRating'].map(filterKey => (
                                            <CustomDropdown 
                                                key={filterKey}
                                                label={filterKey}
                                                options={ADVANCED_FILTERS[filterKey]} 
                                                value={pendingFilters[filterKey]} 
                                                onChange={(val) => handlePendingChange(filterKey, val)} 
                                            />
                                        ))}
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <label className="text-light-200 text-xs font-bold uppercase tracking-wider">Genres</label>
                                        <div className="flex flex-wrap gap-2">
                                            {GENRES.map(genre => {
                                                const isActive = pendingFilters.genres.includes(genre);
                                                return (
                                                    <button
                                                        key={genre}
                                                        onClick={() => togglePendingGenre(genre)}
                                                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                                                            isActive 
                                                            ? 'bg-[#7575f2] text-white border-[#7575f2] shadow-[0_0_15px_rgba(117,117,242,0.4)]' 
                                                            : 'bg-dark-100 text-gray-300 border-light-100/10 hover:border-light-100/30 hover:text-white'
                                                        }`}
                                                    >
                                                        {genre}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="flex justify-end items-center gap-4 pt-4 border-t border-light-100/10">
                                        <button 
                                            onClick={clearFilters}
                                            className="px-6 py-2.5 text-sm font-bold text-gray-300 hover:text-white transition-colors"
                                        >
                                            Clear All
                                        </button>
                                        <button 
                                            onClick={applyFilters}
                                            className="px-8 py-2.5 bg-[#7575f2] hover:bg-[#6262df] text-white text-sm font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(117,117,242,0.3)]"
                                        >
                                            Apply Filters
                                        </button>
                                    </div>

                                </div>
                            )}
                        </div>

                        {isLoading ? (
                            <Loader />
                        ) : errorMessage ? (
                            <p className='text-red-500'>{errorMessage}</p>
                        ) : (
                            <>
                                {animeList.length === 0 && !isLoading ? (
                                    <div className="text-center text-gray-400 py-12">
                                        <h3 className="text-xl text-white mb-2">No anime found</h3>
                                        <p>Try adjusting your search or filters.</p>
                                    </div>
                                ) : (
                                    <ul>
                                        {animeList.map((anime) => (
                                            <Animecard 
                                                key={anime.id} 
                                                anime={anime}
                                                onGenreClick={handleGenreClickFromCard} 
                                            /> 
                                        ))}
                                    </ul>
                                )}

                                {animeList.length > 0 && (
                                    <div className="flex justify-center items-center gap-4 mt-8 pb-8">
                                        <button 
                                            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                            disabled={page === 1}
                                            className="px-4 py-2 bg-dark-100 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark-200 transition-colors"
                                        >
                                            Previous
                                        </button>
                                        
                                        <span className="text-gray-300 font-medium">
                                            Page {page}
                                        </span>

                                        <button 
                                            onClick={() => setPage((prev) => prev + 1)}
                                            disabled={!hasNextPage}
                                            className="px-4 py-2 bg-dark-100 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark-200 transition-colors"
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </section>
                </div>
            </div>
        </main>
    )
}

export default App;