import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ManagePage from './pages/ManagePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import {Navigate} from 'react-router-dom';

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path = "/" element = {<Navigate to ="/manage" />} />
                <Route path = "/manage" element = {<ManagePage />} />
            </Routes>
        </Router>
    );
}