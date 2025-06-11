// alugo/frontend/alugo/src/main.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import NovoItem from './newItem';
import ItensList from './list';
import AboutPage from './about';
import Categorias from './cat';
import LoginPage from './login';
import RegisterPage from './Register';
import ProfilePage from './ProfilePage';
import MyProductsPage from './MyProductsPage';
import ProductDetailsPage from './ProductDetailsPage';
import MyRentalsPage from './MyRentalsPage';
import { UserProvider } from './UserContext';

function Main() {
  return (
    <Router>
      <UserProvider>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/novo-item" element={<NovoItem />} />
          <Route path="/listagem" element={<ItensList />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/categorias" element={<Categorias />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/my-products" element={<MyProductsPage />} />
          <Route path="/item/:id" element={<ProductDetailsPage />} />
          <Route path="/my-rentals" element={<MyRentalsPage />} />
        </Routes>
      </UserProvider>
    </Router>
  );
}

export default Main;
