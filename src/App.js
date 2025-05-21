import React from 'react';
import './styles/App.css';
import SearchBox from './components/SearchBox';
import ResultsSection from './components/ResultsSection';
import useMusic from './hooks/useMusic';

const Header = () => (
  <header>
    <h1>Reccomend me a song</h1>
    <p className="tagline">Discover songs similar to your favorites!</p>
  </header>
);

const App = () => {
  const {
    query,
    setQuery,
    results,
    loading,
    error,
    notFound,
    performSearch,
    excludeSameArtist,
    setExcludeSameArtist,
    searchResults,
    selectedTrack,
    findSimilarTracks
  } = useMusic();

  return (
    <div className="container">
      <Header />
      
      <SearchBox
        query={query}
        onQueryChange={setQuery}
        onSearch={performSearch}
        excludeSameArtist={excludeSameArtist}
        onExcludeSameArtistChange={setExcludeSameArtist}
      />
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {loading && <div className="loader" />}
      
      <ResultsSection
        searchResults={searchResults}
        notFound={notFound}
        results={results}
        selectedTrack={selectedTrack}
        onTrackSelect={findSimilarTracks}
      />
    </div>
  );
};

export default App;