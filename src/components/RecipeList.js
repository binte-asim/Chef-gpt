import React, { useState } from "react";

const CUISINE_CATEGORIES = ["All", "Italian", "Mexican", "Indian", "Japanese", "Thai", "Middle Eastern"];

const Loader = () => (
  <div className="loader-container">
    <svg className="loader-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle className="loader-circle" cx="50" cy="50" r="45"/>
    </svg>
    <span className="loader-text">Stirring up a recipe...</span>
  </div>
);


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


const RecipeList = ({ savedRecipes = [], setSavedRecipes }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [generatedRecipe, setGeneratedRecipe] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [notification, setNotification] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchImageFromUnsplash = async (query) => {
    const unsplashKey = "nrniO93MqXDJXc7Fyv9Ei69QJaV18PzE6kErOBScGP4"; 
    try {
      const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&client_id=${unsplashKey}&orientation=landscape&per_page=1`);
      const data = await res.json();
      return data.results?.[0]?.urls?.regular || null;
    } catch (err) {
      console.warn("Image fetch failed:", err);
      return null;
    }
  };

  const handleGenerate = async () => {
    if (!searchTerm.trim()) {
      alert("Please enter a food name.");
      return;
    }
    setGeneratedRecipe(null);
    setLoading(true);
    const apiKey = "AIzaSyA909dN525id591snFTB5xf3k-FX_5xV54"; 

  
    const prompt = `You are a professional chef assistant. Your only purpose is to provide food recipes. If the user's input is not related to food, ingredients, or a type of cuisine, you must respond with the exact phrase: "I can only help with food-related questions. Please ask me for a recipe." Otherwise, provide a complete recipe for: ${searchTerm}. Include title, ingredients, instructions, prep/cook time, and serving size.`;

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      const data = await res.json();
      const recipeText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No recipe found.";

      
      if (recipeText.includes("I can only help with food-related questions")) {
        setGeneratedRecipe({
          title: "Not a food query!",
          content: recipeText,
          category: "Generated",
          image: null, 
        });
      } else {
        
        const titleMatch = recipeText.match(/Title:\s*(.*)/);
        const recipeTitle = titleMatch ? titleMatch[1].replace(/\*\*/g, '') : `Recipe for ${searchTerm}`;
        const imageUrl = await fetchImageFromUnsplash(searchTerm);

        setGeneratedRecipe({
          title: recipeTitle,
          content: recipeText,
          category: "Generated",
          image: imageUrl,
        });
      }

    } catch (err) {
      console.error("Failed to generate recipe:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = (recipeToSave) => {
    if (!recipeToSave || recipeToSave.title === "Not a food query!") {
        
        setNotification("This is not a recipe and cannot be saved.");
        setTimeout(() => setNotification(""), 3000);
        return;
    }
    const isSaved = savedRecipes.some((r) => r.title === recipeToSave.title);
    if (!isSaved) {
      setSavedRecipes((prev) => [...prev, recipeToSave]);
      setNotification(`${recipeToSave.title} has been saved!`);
    } else {
      setNotification(`${recipeToSave.title} is already in your saved recipes.`);
    }
    setTimeout(() => setNotification(""), 3000);
  };
  
  const notificationStyle = {
    position: "fixed", left: "50%", transform: "translateX(-50%)",
    backgroundColor: "var(--secondary-color)", color: "white", padding: "12px 24px",
    borderRadius: "8px", zIndex: 1000, boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
    opacity: notification ? 1 : 0, top: notification ? "20px" : "-100px",
    transition: "opacity 0.5s, top 0.5s",
  };

  return (
    <>
      <div style={notificationStyle}>{notification}</div>
      <h2>Find or Create a Recipe</h2>
      <div className="filters">
        <input
          type="text"
          placeholder="e.g., 'Chicken Alfredo'"
          className="search-bar"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="category-dropdown"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {CUISINE_CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <button onClick={handleGenerate} className="generate-btn" disabled={loading}>
          Generate Recipe
        </button>
      </div>

      {loading && <Loader />}

      {generatedRecipe && !loading && (
        <div className="recipe-card generated-recipe">
          <div className="recipe-card-content">
            {generatedRecipe.image && (
                <img src={generatedRecipe.image} alt={generatedRecipe.title} className="recipe-card-img" style={{ marginBottom: '1.5rem' }}/>
            )}
            <h3>{generatedRecipe.title}</h3>
            <FormattedRecipeContent content={generatedRecipe.content} />
            <button onClick={() => handleSave(generatedRecipe)} className="save-btn">
                Save Recipe
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default RecipeList;
