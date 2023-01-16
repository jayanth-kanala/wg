import LoginComponent from "./login.js";
import DashboardComponent from "./dashboard.js";

// set theme
let isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
function setTheme(isDarkMode) {
  let themeEle = document.getElementById("theme");
  if (isDarkMode) {
    themeEle.setAttribute('data-bs-theme', 'dark');
  } else {
    themeEle.setAttribute('data-bs-theme', 'light');
  }
}
// change theme listener
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
  setTheme(event.matches)
});
// setTheme
setTheme(isDarkMode);

// Each route should map to a component.
const routes = [
  { path: '/', component: LoginComponent },
  { path: '/dashboard', component: DashboardComponent },
]

// 3. Create the router instance and pass the `routes` option
// You can pass in additional options here, but let's
// keep it simple for now.
const router = VueRouter.createRouter({
  // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
  history: VueRouter.createWebHashHistory(),
  routes, // short for `routes: routes`
})
// vue init
const { createApp } = Vue
app = createApp({
  name: "App",
  components: {
    LoginComponent,
    DashboardComponent
  },
});
app.use(router)
app.mount('#app')
export {router}
