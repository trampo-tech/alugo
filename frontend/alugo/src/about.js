import React from 'react';
import './App.css';

function AboutPage() {
  return (
    <div className="app">
      <header className="header">
        <div className="logo">Rental Platform</div>
      </header>

      <section className="hero">
        <h1>Sobre nós</h1>
        <p style={{ maxWidth: '700px', margin: '0 auto', fontSize: '1.1rem' }}>
          Nosso objetivo é conectar pessoas que querem alugar e oferecer itens de forma prática e segura.
          A plataforma permite que você encontre o que precisa perto de você, pagando por dia de uso.
        </p>
      </section>

      <section className="actions">
        <div className="card-action">
          <h3>Como funciona</h3>
          <p>
            • Cadastre-se como locador ou locatário<br />
            • Publique seus itens ou encontre o que precisa<br />
            • Faça o aluguel com segurança e reputação<br />
            • Retorne o item e avalie a experiência
          </p>
        </div>
        <div className="card-action">
          <h3>Transparência e segurança</h3>
          <p>
            Todos os usuários são verificados e a plataforma mantém registros de transações, avaliações e suporte contínuo.
          </p>
        </div>
      </section>
    </div>
  );
}

export default AboutPage;
