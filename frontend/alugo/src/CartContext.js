// alugo/frontend/alugo/src/CartContext.js
import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  // Inicializa o carrinho do localStorage (se houver)
  const [cartItems, setCartItems] = useState(() => {
    const storedCart = localStorage.getItem('cartItems');
    return storedCart ? JSON.parse(storedCart) : [];
  });

  // Salva o carrinho no localStorage sempre que ele muda
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item) => {
    // Verifica se o item já está no carrinho com as mesmas datas
    const existingItemIndex = cartItems.findIndex(
      (cartItem) => cartItem.item_id === item.item_id && 
                    cartItem.data_inicio === item.data_inicio && 
                    cartItem.data_fim === item.data_fim
    );

    if (existingItemIndex > -1) {
      // Se o item já existe com as mesmas datas, não adiciona novamente
      // Ou você pode optar por permitir múltiplos (se for o caso de alugar o mesmo item várias vezes, o que não faz sentido aqui)
      console.log('Item já está no carrinho com estas datas.');
      // Opcional: retornar uma flag ou lançar um erro
      return false; 
    } else {
      setCartItems((prevItems) => [...prevItems, item]);
      return true;
    }
  };

  const removeFromCart = (itemIdToRemove, dataInicioToRemove, dataFimToRemove) => {
    setCartItems((prevItems) =>
      prevItems.filter(
        (item) => !(item.item_id === itemIdToRemove && 
                    item.data_inicio === dataInicioToRemove && 
                    item.data_fim === dataFimToRemove)
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Valor fornecido pelo contexto
  const contextValue = {
    cartItems,
    addToCart,
    removeFromCart,
    clearCart,
    cartItemCount: cartItems.length, // Para exibir no ícone do carrinho
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};
