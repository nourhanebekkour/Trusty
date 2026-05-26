<template>
  <aside class="professional-sidebar">
    <div class="professional-sidebar__brand">
      <div class="professional-sidebar__logo">P</div>

      <div>
        <h2>Professional</h2>
        <span>Company area</span>
      </div>
    </div>

    <nav class="professional-sidebar__nav">
      <RouterLink to="/professional" exact-active-class="active">
        Dashboard
      </RouterLink>

      <RouterLink to="/professional/internships" active-class="active">
        Internships
      </RouterLink>

      <RouterLink to="/professional/projects" active-class="active">
        Projects
      </RouterLink>

      <RouterLink to="/professional/students" active-class="active">
        Students
      </RouterLink>

      <RouterLink to="/professional/documents" active-class="active">
        Documents
      </RouterLink>

      <RouterLink to="/professional/profile" active-class="active">
        Profile
      </RouterLink>
    </nav>

    <div class="professional-sidebar__note">
      <strong>Access level</strong>
      <p>
        Professional users can supervise and comment, but they cannot officially validate internships or projects.
      </p>
    </div>
  </aside>
</template>

<script setup>
</script>

<style scoped>
.professional-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 30;
  width: 260px;
  height: 100vh;
  background: #1f3f38;
  color: #ffffff;
  padding: 24px 18px;
  display: flex;
  flex-direction: column;
}

.professional-sidebar__brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 36px;
}

.professional-sidebar__logo {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: #d8b76a;
  color: #1f3f38;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 22px;
}

.professional-sidebar__brand h2 {
  margin: 0;
  font-size: 18px;
}

.professional-sidebar__brand span {
  font-size: 12px;
  color: #d8d1c4;
}

.professional-sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.professional-sidebar__nav a {
  text-decoration: none;
  color: #f7f2e8;
  padding: 12px 14px;
  border-radius: 12px;
  font-size: 14px;
  transition: 0.2s ease;
}

.professional-sidebar__nav a:hover {
  background: rgba(255, 255, 255, 0.12);
}

.professional-sidebar__nav a.active {
  background: #ffffff;
  color: #1f3f38;
  font-weight: 700;
}

.professional-sidebar__note {
  margin-top: auto;
  background: rgba(255, 255, 255, 0.1);
  padding: 14px;
  border-radius: 14px;
}

.professional-sidebar__note strong {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
}

.professional-sidebar__note p {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: #eee7da;
}

@media (max-width: 900px) {
  .professional-sidebar {
    display: none;
  }
}
</style>