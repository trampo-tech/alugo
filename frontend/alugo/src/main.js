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
import CartPage from './CartPage'; // Importar CartPage
import { UserProvider } from './UserContext';
import { CartProvider } from './CartContext'; // Importar CartProvider

function Main() {
  return (
    <Router>
      <UserProvider>
        <CartProvider> {/* Envolva toda a aplicação com CartProvider */}
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
            <Route path="/cart" element={<CartPage />} /> {/* Nova rota para o carrinho */}
            {/* Se tiver outras rotas, adicione-as aqui */}
          </Routes>
        </CartProvider>
      </UserProvider>
    </Router>
  );
}

export default Main;
