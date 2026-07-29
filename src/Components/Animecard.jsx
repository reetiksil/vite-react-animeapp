import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

// The Fully Expanded Platform Helper
const getPlatformInfo = (url) => {
    const urlLower = url.toLowerCase();

    // The Western Giants
    if (urlLower.includes('crunchyroll')) return { name: 'Crunchyroll', color: 'bg-[#F47521]/10 text-[#F47521] border-[#F47521]/20 hover:bg-[#F47521]/20', icon: '/crunchyroll.svg' };
    if (urlLower.includes('hulu')) return { name: 'Hulu', color: 'bg-[#1CE783]/10 text-[#1CE783] border-[#1CE783]/20 hover:bg-[#1CE783]/20', icon: '/hulu.svg' };
    if (urlLower.includes('netflix')) return { name: 'Netflix', color: 'bg-[#E50914]/10 text-[#E50914] border-[#E50914]/20 hover:bg-[#E50914]/20', icon: '/netflix.svg' };
    if (urlLower.includes('amazon') || urlLower.includes('prime')) return { name: 'Prime Video', color: 'bg-[#00A8E1]/10 text-[#00A8E1] border-[#00A8E1]/20 hover:bg-[#00A8E1]/20', icon: '/prime.svg' };

    // Other Major Players
    if (urlLower.includes('hidive')) return { name: 'HIDIVE', color: 'bg-[#00AEEF]/10 text-[#00AEEF] border-[#00AEEF]/20 hover:bg-[#00AEEF]/20', icon: '/hidive.svg' };
    if (urlLower.includes('disney')) return { name: 'Disney+', color: 'bg-[#113CCF]/10 text-[#7196FF] border-[#113CCF]/40 hover:bg-[#113CCF]/30', icon: '/disney.svg' };
    if (urlLower.includes('funimation')) return { name: 'Funimation', color: 'bg-[#5B2896]/10 text-[#A66CFB] border-[#5B2896]/30 hover:bg-[#5B2896]/30', icon: '/funimation.svg' };
    if (urlLower.includes('tubi')) return { name: 'Tubi', color: 'bg-[#F26422]/10 text-[#F26422] border-[#F26422]/20 hover:bg-[#F26422]/20', icon: '/tubi.svg' };

    // Asian / Regional Platforms
    if (urlLower.includes('youtube') || urlLower.includes('muse') || urlLower.includes('ani-one')) return { name: 'YouTube (Official)', color: 'bg-[#FF0000]/10 text-[#FF0000] border-[#FF0000]/20 hover:bg-[#FF0000]/20', icon: '/youtube.svg' };
    if (urlLower.includes('bilibili')) return { name: 'Bilibili', color: 'bg-[#00A1D6]/10 text-[#00A1D6] border-[#00A1D6]/20 hover:bg-[#00A1D6]/20', icon: '/bilibili.svg' };
    if (urlLower.includes('jiocinema')) return { name: 'JioCinema', color: 'bg-[#E30B5C]/10 text-[#E30B5C] border-[#E30B5C]/20 hover:bg-[#E30B5C]/20', icon: '/jiocinema.svg' };

    // The Catch-All Fallback (Make sure you add a generic link.svg or play.svg in your public folder!)
    return { name: 'Watch Here', color: 'bg-light-100/10 text-light-100 border-light-100/20 hover:bg-light-100/20', icon: '/link.svg' };
};

const Animecard = ({ anime }) => {
    // UI States
    const [isExpanded, setIsExpanded] = useState(false);

    // Data States
    const [genres, setGenres] = useState([]);
    const [streamingLinks, setStreamingLinks] = useState([]);
    const [isLoadingExtra, setIsLoadingExtra] = useState(false);
    const [hasFetched, setHasFetched] = useState(false);

    const {
        canonicalTitle,
        averageRating,
        startDate,
        ageRating,
        posterImage,
        synopsis,
        youtubeVideoId
    } = anime.attributes || {};

    const imageUrl = posterImage?.large || posterImage?.medium || "/noposter.png";
    const year = startDate ? startDate.split("-")[0] : "N/A";
    const cleanRating = ageRating || "N/A";

    const toggleExpand = () => setIsExpanded((prev) => !prev);

    // Lock Background Scroll Effect (Open Only) with Anti-Jitter padding
    useEffect(() => {
        if (isExpanded) {
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = `${scrollbarWidth}px`;
        }

        // NO cleanup here - let handleExitComplete manage removal after animation
        return () => {
            // Only runs on unmount, preserving scroll lock during animation
        };
    }, [isExpanded]);

    // Restore scroll only AFTER the exit animation finishes
    const handleExitComplete = () => {
        // Only restore if modal is actually closed
        if (!isExpanded) {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        }
    };

    // Fetch Extra Data Effect
    useEffect(() => {
        if (isExpanded && !hasFetched) {
            const fetchExtraDetails = async () => {
                setIsLoadingExtra(true);
                try {
                    const catRes = await fetch(`https://kitsu.io/api/edge/anime/${anime.id}/categories`);
                    const catData = await catRes.json();
                    const topGenres = catData.data?.slice(0, 4).map(c => c.attributes.title) || [];
                    setGenres(topGenres);

                    const streamRes = await fetch(`https://kitsu.io/api/edge/anime/${anime.id}/streaming-links`);
                    const streamData = await streamRes.json();
                    const links = streamData.data?.map(s => s.attributes.url) || [];

                    const uniqueLinks = [...new Set(links.map(url => getPlatformInfo(url).name))]
                        .map(name => links.find(url => getPlatformInfo(url).name === name));

                    setStreamingLinks(uniqueLinks);
                    setHasFetched(true);
                } catch (error) {
                    console.error("Failed to fetch extra details", error);
                } finally {
                    setIsLoadingExtra(false);
                }
            };
            fetchExtraDetails();
        }
    }, [isExpanded, anime.id, hasFetched]);

    return (
        <>
            {/* ---------- GRID CARD ---------- */}
            <div
                className="anime-card cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_20px_rgba(117,117,242,0.15)] border border-transparent hover:border-light-100/20"
                onClick={toggleExpand}
            >
                <img className="object-cover h-auto w-full rounded-lg" src={imageUrl} alt={canonicalTitle || "Anime Poster"} />

                <div className="mt-4">
                    <h3 className="line-clamp-2 text-white font-bold text-base" title={canonicalTitle}>
                        {canonicalTitle}
                    </h3>
                </div>

                <div className="content mt-2 flex flex-row items-center overflow-hidden gap-1">
                    <div className="rating shrink-0 flex flex-row items-center gap-1">
                        <img src="/star.svg" alt="Star" className="size-4 min-w-[16px] max-w-[16px] object-contain shrink-0" />
                        <p className="font-bold text-sm text-white">
                            {averageRating ? (averageRating / 10).toFixed(1) : "N/A"}
                        </p>
                    </div>

                    <span className="shrink-0 text-xs text-gray-400">•</span>

                    <p className="lang truncate text-xs text-gray-200" title={cleanRating}>
                        {cleanRating}
                    </p>

                    <span className="shrink-0 text-xs text-gray-400">•</span>

                    <p className="year shrink-0 text-sm font-medium text-gray-200">{year}</p>
                </div>
            </div>

            {/* ---------- EXPANDED MODAL CARD ---------- */}
            <AnimatePresence onExitComplete={handleExitComplete}>
                {isExpanded && (
                    <motion.div
                        key="modal-overlay"
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/80 backdrop-blur-md"
                        onClick={toggleExpand}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.35 }}
                    >
                        <motion.div
                            className="bg-dark-100 rounded-3xl p-6 md:p-8 w-full max-w-5xl max-h-[90vh] overflow-hidden relative shadow-[0_0_50px_rgba(117,117,242,0.1)] border border-light-100/10 flex flex-col md:flex-row gap-8"
                            onClick={(e) => e.stopPropagation()}
                            initial={{
                                opacity: 0,
                                scale: 0.95,
                                y: 20,
                            }}

                            animate={{
                                opacity: 1,
                                scale: 1,
                                y: 0,
                            }}

                            exit={{
                                opacity: 0,
                                scale: 0.98,
                                y: 10,
                            }}

                            transition={{
                                duration: 0.3,
                                ease: "easeOut",
                            }}
                        >
                            {/* Close Button */}
                            <button
                                onClick={toggleExpand}
                                className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center bg-light-100/5 hover:bg-light-100/10 border border-light-100/10 text-gray-100 hover:text-white transition-all z-20"
                            >
                                ✕
                            </button>

                            {/* LEFT SIDEBAR: Poster & Links */}
                            <div className="w-full md:w-[30%] shrink-0 flex flex-col gap-6 h-full overflow-hidden" style={{ maxHeight: 'calc(90vh - 4rem)' }}>
                                <img
                                    src={imageUrl}
                                    alt={canonicalTitle}
                                    className="w-full rounded-2xl object-cover shadow-2xl border border-light-100/10 shrink-0"
                                />

                                <div className="flex flex-col gap-3 min-h-0 flex-1">
                                    <h4 className="text-light-200 font-bold text-xs uppercase tracking-[0.2em] ml-1 shrink-0">Where to Watch</h4>

                                    <div className="flex-1 overflow-y-auto overscroll-contain custom-scrollbar pr-2 flex flex-col gap-2">
                                        {isLoadingExtra ? (
                                            <div className="h-12 w-full bg-light-100/5 rounded-xl animate-pulse shrink-0"></div>
                                        ) : streamingLinks.length > 0 ? (
                                            streamingLinks.map((url, index) => {
                                                const platform = getPlatformInfo(url);
                                                return (
                                                    <a
                                                        key={index}
                                                        href={url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all border shrink-0 ${platform.color}`}
                                                    >
                                                        <img src={platform.icon} alt={`${platform.name} icon`} className="w-5 h-5 object-contain" />
                                                        {platform.name}
                                                    </a>
                                                )
                                            })
                                        ) : (
                                            <div className="px-4 py-3 rounded-xl bg-light-100/5 border border-light-100/10 text-gray-100 text-sm font-medium shrink-0">
                                                No legal streams found.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT CONTENT: Details, Genres, Trailer */}
                            <div className="w-full md:w-[70%] flex flex-col h-full overflow-hidden" style={{ maxHeight: 'calc(90vh - 4rem)' }}>

                                {/* Pinned Header */}
                                <div className="shrink-0">
                                    <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight tracking-tight pr-10">
                                        {canonicalTitle}
                                    </h2>

                                    <div className="flex flex-wrap items-center gap-3 text-sm text-light-100 mb-6 font-medium">
                                        <span className="bg-light-100/10 px-4 py-1.5 rounded-full border border-light-100/10 flex items-center gap-2">
                                            <img src="/star.svg" alt="Star icon" className="w-4 h-4 min-w-[16px] max-w-[16px] object-contain shrink-0" />
                                            {averageRating ? (averageRating / 10).toFixed(1) : 'N/A'}
                                        </span>
                                        <span className="bg-light-100/10 px-4 py-1.5 rounded-full border border-light-100/10">{cleanRating}</span>
                                        <span className="bg-light-100/10 px-4 py-1.5 rounded-full border border-light-100/10">{year}</span>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-6 min-h-[32px]">
                                        {isLoadingExtra ? (
                                            <div className="h-8 w-32 bg-light-100/5 rounded-full animate-pulse"></div>
                                        ) : (
                                            genres.map((genre, index) => (
                                                <span key={index} className="px-3 py-1 bg-[#7575f2]/10 text-[#cecefb] border border-[#7575f2]/30 rounded-full text-xs font-bold uppercase tracking-wider">
                                                    {genre}
                                                </span>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Scrollable Body (Synopsis + Trailer) */}
                                <div className="flex-1 overflow-y-auto overscroll-contain custom-scrollbar pr-4 flex flex-col gap-6 pb-2">
                                    <p className="text-gray-100 text-base leading-relaxed font-light m-0 text-left">
                                        {synopsis || "No synopsis available."}
                                    </p>

                                    {youtubeVideoId ? (
                                        <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-light-100/10 shrink-0 mt-auto">
                                            <iframe
                                                width="100%"
                                                height="100%"
                                                src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                                                title={`${canonicalTitle} Trailer`}
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            ></iframe>
                                        </div>
                                    ) : (
                                        <div className="w-full aspect-video rounded-2xl bg-light-100/5 flex items-center justify-center border border-light-100/10 shrink-0 mt-auto">
                                            <p className="text-gray-100 font-medium">No trailer available</p>
                                        </div>
                                    )}
                                </div>

                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Animecard;
