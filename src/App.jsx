import React, { useEffect, useState } from 'react'
import Search from './Components/Search'
import Loader from './Components/Loader';
import Animecard from './Components/Animecard';
import { useDebounce } from 'react-use';

const API_BASE_URL = "https://api.jikan.moe/v4";

const API_OPTIONS = {
    method: 'GET',
    headers: {
        accept: 'application/json'
    }
}

const App = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [animeList, setAnimeList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    // Fixed useDebounce syntax
    useDebounce(
        () => setDebouncedSearchTerm(searchTerm), 
        500, 
        [searchTerm]
    );

    const fetchAnimes = async (query = '') => {
        setIsLoading(true);
        setErrorMessage('');
        try {
            // Fixed the Jikan search parameter from 'query' to 'q'
            const endpoint = query
                ? `${API_BASE_URL}/anime?q=${encodeURIComponent(query)}`
                : `${API_BASE_URL}/anime`; 
                
            const response = await fetch(endpoint, API_OPTIONS); 
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            setAnimeList(data.data || []);
            
        } catch (error) {
           console.error(`Error fetching Anime: ${error}`);
           setErrorMessage('Error fetching anime. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchAnimes(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

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
                            <ul>
                                {animeList.map((anime) => (
                                    
                                    <Animecard key={anime.mal_id} anime={anime}/> 
                                ))}
                            </ul>
                        )}
                    </section>
                </div>
            </div>
        </main>
    )
}

export default App