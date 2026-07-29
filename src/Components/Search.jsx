import React from 'react';

const Search = ({ searchTerm, setSearchTerm }) => {
    const handleSubmit = (e) => e.preventDefault();

    return (
        <form 
            onSubmit={handleSubmit} 
            className="w-full bg-light-100/10 border border-light-100/20 px-4 py-3 rounded-lg mt-10 max-w-3xl mx-auto shadow-lg shadow-light-100/5 transition-all focus-within:bg-light-100/15 focus-within:border-light-100/40"
        >
            <div className="relative flex items-center">
                {/* 1. Strict constraints applied directly to the image tag */}
                <img 
                    src="/search.svg" 
                    alt="search icon" 
                    className="absolute left-2 w-5 h-5 min-w-[20px] max-w-[20px] opacity-70 object-contain shrink-0" 
                />
                
                <input 
                    type="text" 
                    placeholder="Search for an anime..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-transparent py-2 sm:pr-10 pl-10 text-base text-white placeholder-light-200/70 outline-hidden border-none focus:ring-0"
                />
            </div>
        </form>
    );
};

export default Search;