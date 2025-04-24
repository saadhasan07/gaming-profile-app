import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaGamepad, FaFilter, FaSearch, FaSort, FaStar, FaUsers, FaFire } from 'react-icons/fa';
import GameCard from './GameCard';
import Spinner from '../layout/Spinner';
import './GamesCatalog.css';

const GamesCatalog = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    genre: '',
    platform: '',
    sort: 'rating',
    order: 'desc',
    page: 1,
    limit: 12,
    featured: false,
    popular: false,
    trending: false
  });
  const [genres, setGenres] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [featuredGames, setFeaturedGames] = useState([]);

  // Fetch initial data
  useEffect(() => {
    fetchGenres();
    fetchPlatforms();
    fetchFeaturedGames();
    fetchGames();
  }, []);

  // Fetch games when filters change
  useEffect(() => {
    fetchGames();
  }, [filters.page, filters.sort, filters.order]);

  const fetchGenres = async () => {
    try {
      const res = await axios.get('/api/games/genres');
      setGenres(res.data.data);
    } catch (err) {
      console.error('Error fetching genres:', err);
    }
  };

  const fetchPlatforms = async () => {
    try {
      const res = await axios.get('/api/games/platforms');
      setPlatforms(res.data.data);
    } catch (err) {
      console.error('Error fetching platforms:', err);
    }
  };

  const fetchFeaturedGames = async () => {
    try {
      const res = await axios.get('/api/games', {
        params: {
          featured: true,
          limit: 3
        }
      });
      setFeaturedGames(res.data.data);
    } catch (err) {
      console.error('Error fetching featured games:', err);
    }
  };

  const fetchGames = async () => {
    try {
      setLoading(true);
      
      const params = {
        search: filters.search,
        genre: filters.genre,
        platform: filters.platform,
        sort: filters.sort,
        order: filters.order,
        page: filters.page,
        limit: filters.limit
      };
      
      if (filters.featured) params.featured = true;
      if (filters.popular) params.popular = true;
      if (filters.trending) params.trending = true;
      
      const res = await axios.get('/api/games', { params });
      
      setGames(res.data.data);
      setTotalPages(res.data.totalPages);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching games:', err);
      toast.error('Failed to load games');
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters({
      ...filters,
      [name]: type === 'checkbox' ? checked : value,
      page: 1 // Reset to first page on filter change
    });
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    fetchGames();
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      genre: '',
      platform: '',
      sort: 'rating',
      order: 'desc',
      page: 1,
      limit: 12,
      featured: false,
      popular: false,
      trending: false
    });
    
    // Fetch games with reset filters
    setTimeout(fetchGames, 0);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    
    setFilters({
      ...filters,
      page: newPage
    });
    
    // Scroll to top of catalog
    document.querySelector('.games-catalog')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSortChange = (sortOption) => {
    let sort, order;
    
    switch (sortOption) {
      case 'rating-desc':
        sort = 'rating';
        order = 'desc';
        break;
      case 'rating-asc':
        sort = 'rating';
        order = 'asc';
        break;
      case 'popularity-desc':
        sort = 'totalPlayers';
        order = 'desc';
        break;
      case 'popularity-asc':
        sort = 'totalPlayers';
        order = 'asc';
        break;
      case 'release-desc':
        sort = 'releaseDate';
        order = 'desc';
        break;
      case 'release-asc':
        sort = 'releaseDate';
        order = 'asc';
        break;
      default:
        sort = 'rating';
        order = 'desc';
    }
    
    setFilters({
      ...filters,
      sort,
      order,
      page: 1
    });
  };

  return (
    <div className="games-catalog">
      <div className="catalog-header">
        <h1 className="catalog-title">
          <FaGamepad /> Game Catalog
        </h1>
        <div className="catalog-actions">
          <div className="search-box">
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search games..."
              onKeyPress={(e) => e.key === 'Enter' && handleApplyFilters(e)}
            />
            <button 
              className="search-btn"
              onClick={handleApplyFilters}
            >
              <FaSearch />
            </button>
          </div>
          <button
            className="filter-toggle-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
      </div>
      
      {showFilters && (
        <div className="filters-panel">
          <form onSubmit={handleApplyFilters}>
            <div className="filters-container">
              <div className="filter-group">
                <label>Genre</label>
                <select
                  name="genre"
                  value={filters.genre}
                  onChange={handleFilterChange}
                >
                  <option value="">All Genres</option>
                  {genres.map((genre, index) => (
                    <option key={index} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="filter-group">
                <label>Platform</label>
                <select
                  name="platform"
                  value={filters.platform}
                  onChange={handleFilterChange}
                >
                  <option value="">All Platforms</option>
                  {platforms.map((platform, index) => (
                    <option key={index} value={platform}>
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="filter-group">
                <label>Sort By</label>
                <select
                  value={`${filters.sort}-${filters.order}`}
                  onChange={(e) => handleSortChange(e.target.value)}
                >
                  <option value="rating-desc">Highest Rating</option>
                  <option value="rating-asc">Lowest Rating</option>
                  <option value="popularity-desc">Most Popular</option>
                  <option value="popularity-asc">Least Popular</option>
                  <option value="release-desc">Newest First</option>
                  <option value="release-asc">Oldest First</option>
                </select>
              </div>
              
              <div className="filter-group checkbox-group">
                <div className="checkbox-wrapper">
                  <label className="checkbox-container">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={filters.featured}
                      onChange={handleFilterChange}
                    />
                    <span className="checkmark"></span>
                    Featured Games
                  </label>
                </div>
                
                <div className="checkbox-wrapper">
                  <label className="checkbox-container">
                    <input
                      type="checkbox"
                      name="popular"
                      checked={filters.popular}
                      onChange={handleFilterChange}
                    />
                    <span className="checkmark"></span>
                    Popular Games
                  </label>
                </div>
                
                <div className="checkbox-wrapper">
                  <label className="checkbox-container">
                    <input
                      type="checkbox"
                      name="trending"
                      checked={filters.trending}
                      onChange={handleFilterChange}
                    />
                    <span className="checkmark"></span>
                    Trending Games
                  </label>
                </div>
              </div>
            </div>
            
            <div className="filters-actions">
              <button type="button" className="reset-btn" onClick={handleResetFilters}>
                Reset Filters
              </button>
              <button type="submit" className="apply-btn">
                Apply Filters
              </button>
            </div>
          </form>
        </div>
      )}
      
      {featuredGames.length > 0 && filters.page === 1 && !filters.search && !filters.genre && !filters.platform && !filters.featured && !filters.popular && !filters.trending && (
        <div className="featured-games-section">
          <h2 className="section-title">
            <FaStar /> Featured Games
          </h2>
          <div className="featured-games-grid">
            {featuredGames.map(game => (
              <GameCard key={game._id} game={game} />
            ))}
          </div>
        </div>
      )}
      
      <div className="games-grid-section">
        <div className="games-header">
          <h2 className="section-title">
            {filters.trending ? (
              <>
                <FaFire /> Trending Games
              </>
            ) : filters.popular ? (
              <>
                <FaUsers /> Popular Games
              </>
            ) : filters.featured ? (
              <>
                <FaStar /> Featured Games
              </>
            ) : filters.search ? (
              <>
                <FaSearch /> Search Results
              </>
            ) : (
              <>
                <FaGamepad /> All Games
              </>
            )}
          </h2>
          
          <div className="results-info">
            Showing {games.length} of {games.length * totalPages} games
          </div>
        </div>
        
        {loading ? (
          <div className="spinner-container">
            <Spinner />
          </div>
        ) : games.length === 0 ? (
          <div className="no-games-found">
            <p>No games found matching your criteria.</p>
            <button onClick={handleResetFilters} className="reset-btn">
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            <div className="games-grid">
              {games.map(game => (
                <div key={game._id} className="game-card-wrapper">
                  <GameCard game={game} />
                </div>
              ))}
            </div>
            
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={filters.page === 1}
                >
                  Previous
                </button>
                
                <div className="pagination-pages">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      className={`pagination-page ${filters.page === page ? 'active' : ''}`}
                      onClick={() => handlePageChange(page)}
                      disabled={filters.page === page}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={filters.page === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GamesCatalog;