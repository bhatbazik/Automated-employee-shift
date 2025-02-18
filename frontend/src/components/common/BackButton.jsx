import React from "react";
import { useNavigate } from "react-router-dom";

const BackButton = ({ fallback = "/" }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate(fallback); // Redirect to fallback if no history
    }
  };

  return (
    <button 
      onClick={handleBack} 
      className="text-blue-600 text-sm hover:underline mb-4"
    >
      ← Back
    </button>
  );
};

export default BackButton;
