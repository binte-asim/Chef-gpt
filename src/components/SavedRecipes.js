import React, { useState, useMemo } from 'react';

const EmptyState = ({ message }) => (
  <div className="empty-state">
    <svg className="empty-state-svg" width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20Z" fill="#e9ecef"/>
      <path d="M13 9V4L18 9H13Z" fill="#ced4da"/>
    </svg>
    <p className="empty-state-message">{message}</p>
  </div>
);

const SavedRecipes = ({ savedRecipes, onViewRecipe, onDeleteRecipe }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSavedRecipes = useMemo(() => {
    if (!searchTerm) return savedRecipes;
    return savedRecipes.filter(recipe =>
      recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [savedRecipes, searchTerm]);

  return (
    <>
      <div className="filters">
        <input
          type="text"
          placeholder="Search your saved recipes..."
          className="search-bar"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="recipes">
        {filteredSavedRecipes.length > 0 ? (
          filteredSavedRecipes.map((recipe, index) => (
            <div className="recipe-card" key={index}>
              <button className="delete-btn" onClick={() => onDeleteRecipe(recipe)} title="Delete Recipe">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
              </button>
              {recipe.image && (
                <img src={recipe.image} alt={recipe.title} className="recipe-card-img" />
              )}
              <div className="recipe-card-content">
                <h3>{recipe.title}</h3>
                <p style={{ flexGrow: 0, marginBottom: '1rem', color: '#6c757d' }}>
                  Click below to see the full recipe.
                </p>
                <button onClick={() => onViewRecipe(recipe)} className="generate-btn" style={{width: '100%', marginTop: 'auto'}}>
                  View Recipe
                </button>
              </div>
            </div>
          ))
        ) : (
          <EmptyState 
            message={searchTerm 
              ? "No saved recipes match your search." 
              : "Your recipe book is empty. Go find some delicious ideas!"
            }
          />
        )}
      </div>
    </>
  );
};

export default SavedRecipes;
