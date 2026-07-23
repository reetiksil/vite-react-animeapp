import React from 'react'

const Animecard = ({ anime: { title, score, year, rating, images } }) => {
    const imageUrl = images?.jpg?.image_url || '/noposter.png';
    
    // Split the string at " (" and keep the first part. 
    // "R - 17+ (violence & profanity)" becomes "R - 17+"
    const cleanRating = rating ? rating.split(' (')[0] : 'N/A';

    return (
        <div className='anime-card'>
            <img src={imageUrl} alt={title} />
            <div className='mt-4'>
                <h3>{title}</h3>
            </div>
            <div className="content">
                <div className="rating">
                    <img src="/star.svg" alt="Star icon" />
                    <p>{score ? score.toFixed(1) : 'N/A'}</p>
                </div>
                
                <span>•</span>
                {/* Added 'truncate' to ensure text cuts off cleanly with ... if it ever gets too long */}
                <p className="lang truncate">{cleanRating}</p>
                
                <span>•</span>
                <p className="year">{year ? year : 'N/A'}</p>
            </div>
        </div>
    )
}

export default Animecard