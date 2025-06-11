// alugo/frontend/alugo/src/UserMenu.js
import React, { useState, useContext } from 'react';
import { UserContext } from './UserContext';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';

function UserMenu() {
  const { loggedInUser, logout } = useContext(UserContext);
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

  const handleMyRentalsClick = () => { // Nova função para Meus Aluguéis
    navigate('/my-rentals');
    setIsOpen(false);
  };

  if (!loggedInUser) {
    return (
      <div className="header-buttons">
        <button className="outline" onClick={() => navigate('/login')}>Login</button>
        <button className="primary" onClick={() => navigate('/register')}>Cadastro</button>
      </div>
    );
  }

  return (
    <div className="user-menu-container">
      <button className="user-icon-button" onClick={() => setIsOpen(!isOpen)}>
        <User size={24} />
      </button>
      {isOpen && (
        <div className="user-dropdown-menu">
          <p>Olá, {loggedInUser.nome}!</p>
          <button onClick={handleProfileClick}>Gerenciar Perfil</button>
          <button onClick={handleMyProductsClick}>Meus Produtos</button>
          <button onClick={handleMyRentalsClick}>Meus Aluguéis</button> {/* Nova opção */}
          <button onClick={handleLogout}>Sair</button>
        </div>
      )}
    </div>
  );
}

export default UserMenu;