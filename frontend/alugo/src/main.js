import React, { useState, useEffect } from 'react';
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
import CartPage from './CartPage';

import { UserProvider } from './UserContext';
import { CartProvider } from './CartContext';

function Main() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLoginSuccess = userData => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    setUser(null);
  };

  return (
    <Router>
      <UserProvider value={{ user, handleLoginSuccess, handleLogout }}>
        <CartProvider>
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
            <Route path="/cart" element={<CartPage />} />
          </Routes>
        </CartProvider>
      </UserProvider>
    </Router>
  );
}

export default Main;
