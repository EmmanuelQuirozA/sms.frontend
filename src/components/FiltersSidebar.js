import React, { useEffect, useRef } from "react";

const FiltersSidebar = ({
  filters,
  setFilters,
  applyFilters,
  clearFilters,
  isVisible,
  toggleVisibility,
}) => {
  const sidebarRef = useRef();

  // Close sidebar on outside click
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (isVisible && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        toggleVisibility();
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isVisible, toggleVisibility]);

  const handleChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <>
      {/* Overlay */}
      {isVisible && <div className="sidebar-overlay" onClick={toggleVisibility}></div>}
      
      {/* Sidebar */}
      <div
        className={`right-sidebar ${isVisible ? 'visible' : ''}`}
        ref={sidebarRef}
      >
        <div className="sidebar-content">
        {/* Close Button */}
          <button className="btn btn-light close-btn" onClick={toggleVisibility}>
            <i className="bi bi-x"></i>
          </button>

          <h4>Filters</h4>

          {/* Filter inputs */}
          {filters.map((filter, index) => (
            <div className="mb-3" key={index}>
              <label htmlFor={filter.id} className="form-label">
                {filter.label}
              </label>
              {filter.type === 'select' ? (
                <select
                  id={filter.id}
                  className="form-select"
                  value={filter.value}
                  onChange={(e) => filter.onChange(e.target.value)}
                >
                  {filter.options.map((option, idx) => (
                    <option key={idx} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={filter.type || 'text'}
                  id={filter.id}
                  className="form-control"
                  placeholder={filter.placeholder}
                  value={filter.value}
                  onChange={(e) => filter.onChange(e.target.value)}
                  autoComplete="no"
                />
              )}
            </div>
          ))}
          <div className="d-flex justify-content-between">
            <button className="btn btn-primary" onClick={applyFilters}>
              Apply Filters
            </button>
            <button className="btn btn-secondary" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default FiltersSidebar;