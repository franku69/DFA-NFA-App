// Import the logo image and the CSS file for styling
import logo from './logo.svg'; // Imports the logo image from the file system
import './App.css'; // Imports the CSS styles for this component

// Define the App component
function App() {
  return (
    // Main container for the App component
    <div className="App">
      {/* Header section of the app */}
      <header className="App-header">
        {/* Logo image displayed in the header */}
        <img src={logo} className="App-logo" alt="logo" /> 
        <p>
          {/* Instructions for editing the App.js file */}
          Edit <code>src/App.js</code> and save to reload.
        </p>
        {/* Link to React documentation */}
        <a
          className="App-link" // CSS class for the link styling
          href="https://reactjs.org" // URL for React documentation
          target="_blank" // Opens the link in a new tab
          rel="noopener noreferrer" // Security feature to prevent some vulnerabilities when opening in a new tab
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

// Export the App component so it can be used in other parts of the app
export default App;
