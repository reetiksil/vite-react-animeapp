import React from 'react'

const Animecard = ({ anime }) => {
    // Kitsu nests attributes inside anime.attributes
    const { canonicalTitle, averageRating, startDate, ageRating, posterImage } = anime.attributes || {};
    
    const imageUrl = posterImage?.large || posterImage?.medium || '/noposter.png';
    const year = startDate ? startDate.split('-')[0] : 'N/A';
    const cleanRating = ageRating || 'N/A';

    return (
        <div className='anime-card'>
            <img src={imageUrl} alt={canonicalTitle || 'Anime Poster'} />
            <div className='mt-4'>
                <h3 className="line-clamp-2" title={canonicalTitle}>{canonicalTitle}</h3>
            </div>
            
            <div className="content">
                <div className="rating shrink-0">
                    <img src="/star.svg" alt="Star icon" />
                    <p>{averageRating ? (averageRating / 10).toFixed(1) : 'N/A'}</p>
                </div>
                
                <span className="shrink-0 text-gray-400">•</span>
                <p className="lang truncate" title={cleanRating}>{cleanRating}</p>
                
                <span className="shrink-0 text-gray-400">•</span>
                <p className="year shrink-0">{year}</p>
            </div>
        </div>
    )
}

export default Animecard