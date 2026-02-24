import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Add page routes here as features are built */}
        <Route path="/" element={<div>Interactive Product Analytics Dashboard</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
