<script setup>
const name = 'NavBar'
</script>

<template>
  <div class="nav-bar">
    <p>NavBar</p>
  </div>
</template>

<style scoped>
.nav-bar {
  height: var(--navbar-height);
  display: flex;
  align-items: center;
  padding: 0 16px;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}
</style>
