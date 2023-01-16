import { apiCall } from "./util.js"

const LoginComponent = {
  data() {
    return {
      password: '',
    }
  },
  methods: {
    async onSubmit() {
      const out = await apiCall('POST', '/auth/login', {
        password: this.password
      })
      if (!out.error) {
        this.$router.push('/dashboard')
      }
    }
  },
  template:
    `<div class="container" style="max-width: 340px;" >
    <div id="login">
        <div class="pt-5 pb-4">
            <div class="text-center">
                <h1>Login</h1>
            </div>
        </div>
        <div>
            <form action="login" method="post" @submit.prevent="onSubmit">
            <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input type="password" class="form-control" id="password" name="password" required v-model="password">
            </div>
            <div class="d-grid">
                <button class="btn btn-success" type="submit">Submit</button>
            </div>
        </form>
    </div>
</div>
</div>`
}
export default LoginComponent