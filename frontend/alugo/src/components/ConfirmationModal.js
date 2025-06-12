// alugo/frontend/alugo/src/components/ConfirmationModal.js
import React from 'react';
import './ConfirmationModal.css'; // Estilos para o modal
import '../App.css'; // Para usar as classes de botões (primary, danger, outline)

function ConfirmationModal({ message, onConfirm, onCancel, confirmText = 'OK', cancelText = 'Cancelar', showCancel = true }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <p className="modal-message">{message}</p>
        <div className="modal-actions">
          {showCancel && (
            <button className="outline" onClick={onCancel}>
              {cancelText}
            </button>
          )}
          <button className="primary" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;
