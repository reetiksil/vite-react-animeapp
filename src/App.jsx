import React, { useEffect, useState } from 'react'
import Search from './Components/Search'
import Loader from './Components/Loader';
import Animecard from './Components/Animecard';
import { useDebounce } from 'react-use';

const API_BASE_URL = "https://kitsu.io/api/edge";

const App = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [animeList, setAnimeList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(true);

    useDebounce(
        () => {
            setDebouncedSearchTerm(searchTerm);
            setPage(1);
        }, 
        500, 
        [searchTerm]
    );

    const fetchAnimes = async (query = '', currentPage = 1) => {
        setIsLoading(true);
        setErrorMessage('');
        try {
            const offset = (currentPage - 1) * 20;

            const endpoint = query
                ? `${API_BASE_URL}/anime?filter[text]=${encodeURIComponent(query)}&page[limit]=20&page[offset]=${offset}`
                : `${API_BASE_URL}/anime?sort=-userCount&page[limit]=20&page[offset]=${offset}`; 
                
            // Removed API_OPTIONS
            const response = await fetch(endpoint); 
            
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
    }

    useEffect(() => {
        fetchAnimes(debouncedSearchTerm, page);
    }, [debouncedSearchTerm, page]);

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
                    <section className='all-animes'>
                        <h2>Popular Animes</h2>
                        {isLoading ? (
                            <Loader />
                        ) : errorMessage ? (
                            <p className='text-red-500'>{errorMessage}</p>
                        ) : (
                            <>
                                <ul>
                                    {animeList.map((anime) => (
                                        // Changed key from mal_id to id
                                        <Animecard key={anime.id} anime={anime}/> 
                                    ))}
                                </ul>

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

export default App