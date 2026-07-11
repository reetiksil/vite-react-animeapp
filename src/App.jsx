import React from 'react'
import Search from './Components/Search'

const App = () => {
    
    return (
        <main>
            <div className='pattern'>
                <div className="wrapper">
                    <header>
                        <img src="./hero.png" alt="BackGround" />
                        <h1>Can't Find Your <br /> Favorite <span className='text-gradient'>Anime</span> ? We've Got You.</h1>
                    </header>
                    <p className='text-2xl-white'> Find legal streaming platforms, discover new series, and spend less time searching</p>
                    <Search/>
                </div>
            </div>
        </main>
    )
}

export default App
