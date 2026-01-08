import React, { useEffect, useState, useCallback } from 'react';
import { useData } from '../state/DataContext';
import { Link } from 'react-router-dom';

// Skeleton component for loading state
function ItemSkeleton() {
  return (
    <li className="item skeleton">
      <div className="skeleton-content">
        <span className="skeleton-name"></span>
        <span className="skeleton-category"></span>
        <span className="skeleton-price"></span>
      </div>
    </li>
  );
}

function Items() {
  const { items, pagination, loading, fetchItems } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  // Debounced search
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch items when page or search changes
  useEffect(() => {
    const controller = new AbortController();

    fetchItems(controller.signal, {
      page: currentPage,
      limit,
      q: debouncedQuery
    }).catch((err) => {
      if (err.name !== 'AbortError') {
        console.error(err);
      }
    });

    return () => {
      controller.abort();
    };
  }, [fetchItems, currentPage, debouncedQuery, limit]);

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const goToPage = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  return (
    <div className="items-container">
      {/* Header */}
      <header className="header">
        <div className="header-glow"></div>
        <h1 className="title">
          <span className="title-icon">📦</span>
          Product Catalog
        </h1>
        <p className="subtitle">Browse and search our premium inventory</p>
      </header>

      {/* Search Input */}
      <div className="search-box">
        <div className="search-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search by name or category..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="search-input"
          aria-label="Search products"
        />
        {searchQuery && (
          <button
            className="clear-btn"
            onClick={() => setSearchQuery('')}
            aria-label="Clear search"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Loading State with Skeletons */}
      {loading && (
        <ul className="items-list" aria-busy="true" aria-label="Loading items">
          {[...Array(5)].map((_, i) => (
            <ItemSkeleton key={i} />
          ))}
        </ul>
      )}

      {/* Empty State */}
      {!loading && items.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🔎</div>
          <h2>No items found</h2>
          <p>Try adjusting your search terms</p>
          {searchQuery && (
            <button className="btn btn-secondary" onClick={() => setSearchQuery('')}>
              Clear Search
            </button>
          )}
        </div>
      )}

      {/* Items List */}
      {!loading && items.length > 0 && (
        <>
          <ul className="items-list" role="list" aria-label="Product list">
            {items.map((item, index) => (
              <li key={item.id} className="item" style={{ animationDelay: `${index * 0.05}s` }}>
                <Link to={'/items/' + item.id} aria-label={`View ${item.name}`}>
                  <div className="item-main">
                    <span className="item-name">{item.name}</span>
                    <span className="item-category">{item.category}</span>
                  </div>
                  <span className="item-price">${item.price.toLocaleString()}</span>
                  <span className="item-arrow">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Pagination Controls */}
          <nav className="pagination" aria-label="Pagination">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              className="btn btn-pagination"
              aria-label="Previous page"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
              <span>Previous</span>
            </button>

            <div className="pagination-info">
              <span className="page-indicator">
                {[...Array(pagination.totalPages)].map((_, i) => (
                  <button
                    key={i}
                    className={`page-dot ${i + 1 === pagination.page ? 'active' : ''}`}
                    onClick={() => goToPage(i + 1)}
                    aria-label={`Go to page ${i + 1}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </span>
              <span className="pagination-total">{pagination.total} items</span>
            </div>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className="btn btn-pagination"
              aria-label="Next page"
            >
              <span>Next</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </nav>
        </>
      )}

      <style>{`
        * {
          box-sizing: border-box;
        }
        
        .items-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 40px 24px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          min-height: 100vh;
          background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
        }
        
        /* Header */
        .header {
          text-align: center;
          margin-bottom: 40px;
          position: relative;
        }
        
        .header-glow {
          position: absolute;
          top: -50px;
          left: 50%;
          transform: translateX(-50%);
          width: 400px;
          height: 200px;
          background: radial-gradient(ellipse, rgba(139, 92, 246, 0.3) 0%, transparent 70%);
          pointer-events: none;
        }
        
        .title {
          font-size: 2.75rem;
          font-weight: 800;
          margin: 0 0 12px 0;
          background: linear-gradient(135deg, #fff 0%, #a78bfa 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.02em;
          position: relative;
        }
        
        .title-icon {
          display: inline-block;
          -webkit-text-fill-color: initial;
          margin-right: 8px;
          animation: bounce 2s ease infinite;
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        
        .subtitle {
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.6);
          margin: 0;
          font-weight: 400;
        }
        
        /* Search Box */
        .search-box {
          position: relative;
          margin-bottom: 28px;
        }
        
        .search-icon {
          position: absolute;
          left: 20px;
          top: 50%;
          transform: translateY(-50%);
          color: #8b5cf6;
          pointer-events: none;
          transition: color 0.3s;
        }
        
        .search-input {
          width: 100%;
          padding: 18px 56px;
          font-size: 16px;
          font-weight: 500;
          border: 2px solid rgba(139, 92, 246, 0.3);
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          color: #fff;
          outline: none;
          transition: all 0.3s ease;
        }
        
        .search-input:focus {
          background: rgba(255, 255, 255, 0.1);
          border-color: #8b5cf6;
          box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.2), 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        
        .search-input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }
        
        .clear-btn {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          cursor: pointer;
          color: rgba(255, 255, 255, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        
        .clear-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          color: #fff;
          transform: translateY(-50%) scale(1.1);
        }
        
        /* Items List */
        .items-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .item {
          margin-bottom: 12px;
          animation: slideIn 0.4s ease forwards;
          opacity: 0;
        }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .item a {
          display: flex;
          align-items: center;
          padding: 20px 24px;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          text-decoration: none;
          color: inherit;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .item a:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(139, 92, 246, 0.5);
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(139, 92, 246, 0.3);
        }
        
        .item-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        
        .item-name {
          font-weight: 600;
          font-size: 17px;
          color: #fff;
        }
        
        .item-category {
          display: inline-flex;
          align-items: center;
          font-size: 12px;
          font-weight: 600;
          color: #a78bfa;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .item-category::before {
          content: '';
          display: inline-block;
          width: 6px;
          height: 6px;
          background: #8b5cf6;
          border-radius: 50%;
          margin-right: 8px;
        }
        
        .item-price {
          font-weight: 700;
          font-size: 18px;
          color: #10b981;
          margin-right: 16px;
        }
        
        .item-arrow {
          color: rgba(255, 255, 255, 0.3);
          transition: all 0.3s;
        }
        
        .item a:hover .item-arrow {
          color: #8b5cf6;
          transform: translateX(4px);
        }
        
        /* Skeleton Styles */
        .skeleton .skeleton-content {
          display: flex;
          align-items: center;
          padding: 20px 24px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .skeleton-name, .skeleton-category, .skeleton-price {
          background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 8px;
        }
        
        .skeleton-name {
          width: 180px;
          height: 20px;
          margin-right: auto;
        }
        
        .skeleton-category {
          width: 80px;
          height: 24px;
          margin: 0 20px;
        }
        
        .skeleton-price {
          width: 70px;
          height: 20px;
        }
        
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        
        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 80px 20px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 24px;
          border: 1px dashed rgba(255, 255, 255, 0.1);
        }
        
        .empty-icon {
          font-size: 64px;
          margin-bottom: 20px;
          opacity: 0.8;
        }
        
        .empty-state h2 {
          margin: 0 0 8px 0;
          color: #fff;
          font-weight: 600;
        }
        
        .empty-state p {
          margin: 0 0 24px 0;
          color: rgba(255, 255, 255, 0.5);
        }
        
        /* Buttons */
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px 24px;
          font-size: 14px;
          font-weight: 600;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          text-decoration: none;
        }
        
        .btn-secondary {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }
        
        .btn-pagination {
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
          color: #fff;
          box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
        }
        
        .btn-pagination:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4);
        }
        
        .btn-pagination:active:not(:disabled) {
          transform: translateY(-1px);
        }
        
        .btn-pagination:disabled {
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.3);
          box-shadow: none;
          cursor: not-allowed;
        }
        
        /* Pagination */
        .pagination {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 32px;
          padding: 20px 24px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .pagination-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        
        .page-indicator {
          display: flex;
          gap: 6px;
        }
        
        .page-dot {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: none;
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.6);
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .page-dot:hover {
          background: rgba(139, 92, 246, 0.3);
          color: #fff;
        }
        
        .page-dot.active {
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          color: #fff;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
        }
        
        .pagination-total {
          color: rgba(255, 255, 255, 0.4);
          font-size: 13px;
        }
        
        /* Responsive */
        @media (max-width: 640px) {
          .items-container {
            padding: 24px 16px;
          }
          
          .title {
            font-size: 2rem;
          }
          
          .item a {
            flex-wrap: wrap;
            gap: 12px;
            padding: 16px;
          }
          
          .item-main {
            width: 100%;
          }
          
          .item-price {
            margin-right: auto;
          }
          
          .pagination {
            flex-direction: column;
            gap: 16px;
          }
          
          .btn-pagination {
            width: 100%;
          }
          
          .page-indicator {
            order: -1;
          }
        }
      `}</style>
    </div>
  );
}

export default Items;