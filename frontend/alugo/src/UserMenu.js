// alugo/frontend/alugo/src/UserMenu.js
import React, { useState, useContext } from 'react';
import { UserContext } from './UserContext';
import { CartContext } from './CartContext'; // Importar CartContext
import { useNavigate } from 'react-router-dom';
import { User, ShoppingCart } from 'lucide-react'; // Importar ShoppingCart

function UserMenu() {
  const { loggedInUser, logout } = useContext(UserContext);
  const { cartItemCount } = useContext(CartContext); // Obter count do carrinho
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setIsOpen(false);
  };

  const handleMyProductsClick = () => {
    navigate('/my-products');
    setIsOpen(false);
  };

  const handleMyRentalsClick = () => {
    navigate('/my-rentals');
    setIsOpen(false);
  };

  const handleCartClick = () => { // Nova função para navegar para o carrinho
    navigate('/cart');
    setIsOpen(false);
  };

  return (
    <div className="user-menu-group"> {/* Novo contêiner para o menu e o ícone do carrinho */}
      {/* Ícone do Carrinho */}
      <button className="cart-icon-button" onClick={handleCartClick}>
        <ShoppingCart size={24} />
        {cartItemCount > 0 && <span className="cart-item-count">{cartItemCount}</span>}
      </button>

      {loggedInUser ? (
        <div className="user-menu-container">
          <button className="user-icon-button" onClick={() => setIsOpen(!isOpen)}>
            <User size={24} />
          </button>
          {isOpen && (
            <div className="user-dropdown-menu">
              <p>Olá, {loggedInUser.nome}!</p>
              <button onClick={handleProfileClick}>Gerenciar Perfil</button>
              <button onClick={handleMyProductsClick}>Meus Produtos</button>
              <button onClick={handleMyRentalsClick}>Meus Aluguéis</button>
              <button onClick={handleLogout}>Sair</button>
            </div>
          )}
        </div>
      ) : (
        <div className="header-buttons">
          <button className="outline" onClick={() => navigate('/login')}>Login</button>
          <button className="primary" onClick={() => navigate('/register')}>Cadastro</button>
        </div>
      )}
    </div>
  );
}

export default UserMenu;
