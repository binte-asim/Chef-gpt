import React, { useState } from "react";
import Header from "./components/Header";
import Tabs from "./components/Tabs";
import RecipeList from "./components/RecipeList";
import SavedRecipes from "./components/SavedRecipes";
import "./styles/main.css";

// FormattedRecipeContent component for consistent recipe text rendering
const FormattedRecipeContent = ({ content }) => {
  if (!content) return null;
  const lines = content.split('\n');
  const elements = [];
  let listItems = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} style={{ paddingLeft: '20px', margin: '1rem 0' }}>
          {listItems.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((line) => {
    const trimmedLine = line.trim().replace(/\*\*/g, '');
    if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
      listItems.push(trimmedLine.substring(2));
    } else {
      flushList();
      if (trimmedLine) {
        if (trimmedLine.endsWith(':')) {
          elements.push(<h4 key={elements.length} style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>{trimmedLine}</h4>);
        } else {
          elements.push(<p key={elements.length}>{trimmedLine}</p>);
        }
      }
    }
  });

  flushList();
  return <>{elements}</>;
};

// RecipeModal component for viewing recipe details
const RecipeModal = ({ recipe, onClose }) => {
  if (!recipe) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        {recipe.image && <img src={recipe.image} alt={recipe.title} className="modal-img" />}
        <h2>{recipe.title}</h2>
        <FormattedRecipeContent content={recipe.content} />
      </div>
    </div>
  );
};


function App() {
  const [activeTab, setActiveTab] = useState("all");
  const [savedRecipes, setSavedRecipes] = useState([]);
  
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const handleViewRecipe = (recipe) => setSelectedRecipe(recipe);
  const handleCloseModal = () => setSelectedRecipe(null);

  // New handler to delete a recipe from the saved list
  const handleDeleteRecipe = (recipeToDelete) => {
    setSavedRecipes(prevRecipes => 
      prevRecipes.filter(recipe => recipe.title !== recipeToDelete.title)
    );
  };

  return (
    <div className="container">
      <Header />
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="content-area">
        {activeTab === "all" ? (
          <RecipeList
            savedRecipes={savedRecipes}
            setSavedRecipes={setSavedRecipes}
          />
        ) : (
          <SavedRecipes 
            savedRecipes={savedRecipes} 
            onViewRecipe={handleViewRecipe} 
            onDeleteRecipe={handleDeleteRecipe}
          />
        )}
      </div>
      <RecipeModal recipe={selectedRecipe} onClose={handleCloseModal} />
    </div>
  );
}

export default App;
