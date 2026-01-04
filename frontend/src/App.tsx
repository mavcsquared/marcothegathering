import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Dashboard } from './pages/Dashboard';
import { MyCollection } from './pages/MyCollection';

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-surface-dark font-sans text-gray-100">
                <Navbar />

                <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/collection" element={<MyCollection />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
