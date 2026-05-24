import { describe, it, expect, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createWebHistory, createMemoryHistory, RouterView } from 'vue-router'
import { defineComponent } from 'vue'

const HomeView  = defineComponent({ name: 'HomeView',  template: '<div>Home</div>' })
const LoginView = defineComponent({ name: 'LoginView', template: '<div>Login</div>' })
const AboutView = defineComponent({ name: 'AboutView', template: '<div>About</div>' })

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/about',
    name: 'about',
    component: () => Promise.resolve(AboutView), // simule le lazy loading
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
  },
]
function buildRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes,
  })
}

describe('Router — Tests Unitaires', () => {

 
  it('1 — le router a exactement 3 routes', () => {
    expect(routes).toHaveLength(3)
  })

 
  it("2 — la route '/' a le nom 'home'", () => {
    const home = routes.find(r => r.path === '/')
    expect(home).toBeDefined()
    expect(home.name).toBe('home')
  })

  
  it("3 — la route '/about' a le nom 'about'", () => {
    const about = routes.find(r => r.path === '/about')
    expect(about).toBeDefined()
    expect(about.name).toBe('about')
  })

  
  it("4 — la route '/login' a le nom 'login'", () => {
    const login = routes.find(r => r.path === '/login')
    expect(login).toBeDefined()
    expect(login.name).toBe('login')
  })

  
  it('5 — AboutView utilise le lazy loading (component est une fonction)', () => {
    const about = routes.find(r => r.path === '/about')
    expect(typeof about.component).toBe('function')
  })

  
  it("6 — push({ name: 'login' }) navigue vers '/login'", async () => {
    const router = buildRouter()
    await router.push({ name: 'login' })
    expect(router.currentRoute.value.path).toBe('/login')
    expect(router.currentRoute.value.name).toBe('login')
  })

  
  it("7 — une route inconnue retourne un tableau matched vide", async () => {
    const router = buildRouter()
    await router.push('/cette-route-nexiste-pas')
    expect(router.currentRoute.value.matched).toHaveLength(0)
  })
})

describe("Router — Tests d'Intégration", () => {

 
  const App = defineComponent({ template: '<RouterView />' })

  let router

  beforeEach(() => {
    router = buildRouter()
  })

  
  it('8 — "/" affiche HomeView', async () => {
    await router.push('/')
    await router.isReady()

    const wrapper = mount(App, { global: { plugins: [router] } })
    await flushPromises()

    expect(wrapper.html()).toContain('Home')
  })

  
  it('9 — "/login" affiche LoginView', async () => {
    await router.push('/login')
    await router.isReady()

    const wrapper = mount(App, { global: { plugins: [router] } })
    await flushPromises()

    expect(wrapper.html()).toContain('Login')
  })

  
  it('10 — "/about" affiche AboutView (lazy loading)', async () => {
    await router.push('/about')
    await router.isReady()

    const wrapper = mount(App, { global: { plugins: [router] } })
    await flushPromises() 
    expect(wrapper.html()).toContain('About')
  })
})