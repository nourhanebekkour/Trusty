<template>
  <footer class="professor-footer">
    <div>
      <strong>TRUSTY</strong>
      <p>Plateforme de portfolios numériques adaptatifs et certifiés.</p>
    </div>

    <div>
      <strong>Plateforme</strong>
      <p>Comment ça marche</p>
      <p>Sécurité et certification</p>
      <p>Tarifs</p>
    </div>

    <div>
      <strong>Support</strong>
      <p>Centre d’aide</p>
      <p>Contact</p>
      <p>Mentions légales</p>
    </div>
  </footer>
</template>

<style scoped>
.professor-footer {
  margin-left: 235px;
  background: #0D2B2B;
  color: #D6EDE8;
  padding: 28px;
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr;
  gap: 24px;
  font-size: 12px;
}

.professor-footer strong {
  display: block;
  margin-bottom: 8px;
  color: #ffffff;
}

.professor-footer p {
  margin: 5px 0;
  color: #D6EDE8;
  opacity: 0.85;
}
</style>