import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ManagePage from './pages/ManagePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import {Navigate} from 'react-router-dom';

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path = "/" element = {<Navigate to ="/login" />} />
                <Route path = "/manage" element = {<ManagePage />} />
                <Route path = "/login" element = {<LoginPage />} />
                <Route path = "register" element = {<RegisterPage />} />
            </Routes>
        </Router>
    );
}