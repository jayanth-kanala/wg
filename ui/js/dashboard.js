import { apiCall, bytes } from "./util.js"

export let intervalId;

const DashboardComponent = {
  data() {
    return {
      name: "",
      clients: [],
      qrcode: '',
      downloadUrl: '',
      toggle: '',
      bytes
    }
  },
  created() {
    this.getClients()
    intervalId = setInterval(this.getClients, 1000);
  },
  methods: {
    async getClients() {
      const out = await apiCall('GET', '/clients')
      if (!out.error) {
        this.clients = out.data
      }
    },
    async addClient(e) {
      if (!e.target.value) return false;
      const out = await apiCall('POST', '/clients', {
        name: this.name
      });
      e.target.value = ''
      this.name = ''
      if (!out.error) {
        this.clients = out.data
      }
    },
    async deleteClient(e) {
      const id = e.target.closest(".card").getAttribute('id');
      const out = await apiCall('DELETE', `/clients/${id}`);
      if (!out.error) {
        this.clients = out.data
      }
    },
    async downloadQR(e) {
      const id = e.target.closest(".card").getAttribute('id');
      this.qrcode = `/clients/${id}/qrcode`
    },
    async toggleClientOnOff(e) {
      const id = e.target.closest(".card").getAttribute('id');
      let out;
      if (e.target.checked) {
        out = await apiCall('PUT', `/clients/${id}/enable`);
      } else {
        out = await apiCall('PUT', `/clients/${id}/disable`);
      }
      if (!out.error) {
        this.clients = out.data
      }
    },
    async logout() {
      clearInterval(intervalId);
      await apiCall('POST', '/auth/logout')
      this.$router.push('/')
    }
  },
  template:
    `<div class="my-5">
      <a href="" @click.prevent="logout" class="float-end">Logout</a>
        <h1>Clients</h1>
        <input class="form-control mb-2" @keyup.enter="addClient" autofocus placeholder="Enter client name" v-model="name">
        <div class="card" v-for="client in clients" :key="client.id" :id="client.id">
          <div class="card-body">
            <div class="card-title">{{client.name}}</div>
            <div class="card-subtitle">
              {{client.address}}, {{client.address6}}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-down" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1z"/>
              </svg>
                {{bytes(client.transferTx)}}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-up" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5z"/>
              </svg>
                {{bytes(client.transferRx)}}
              <a href="#" style="color:inherit" @click.prevent class="float-end mx-2" >
                <span @click="deleteClient">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                    <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                  </svg>
                </span>
              </a>
              <a href="#" style="color:inherit" @click.prevent class="float-end mx-2" >
                <span @click="downloadQR" data-bs-toggle="modal" data-bs-target="#staticBackdrop">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-qr-code" viewBox="0 0 16 16">
                    <path d="M2 2h2v2H2V2Z"/>
                    <path d="M6 0v6H0V0h6ZM5 1H1v4h4V1ZM4 12H2v2h2v-2Z"/>
                    <path d="M6 10v6H0v-6h6Zm-5 1v4h4v-4H1Zm11-9h2v2h-2V2Z"/>
                    <path d="M10 0v6h6V0h-6Zm5 1v4h-4V1h4ZM8 1V0h1v2H8v2H7V1h1Zm0 5V4h1v2H8ZM6 8V7h1V6h1v2h1V7h5v1h-4v1H7V8H6Zm0 0v1H2V8H1v1H0V7h3v1h3Zm10 1h-1V7h1v2Zm-1 0h-1v2h2v-1h-1V9Zm-4 0h2v1h-1v1h-1V9Zm2 3v-1h-1v1h-1v1H9v1h3v-2h1Zm0 0h3v1h-2v1h-1v-2Zm-4-1v1h1v-2H7v1h2Z"/>
                    <path d="M7 12h1v3h4v1H7v-4Zm9 2v2h-3v-1h2v-1h1Z"/>
                  </svg>
                </span>
              </a>
              <a :href="'/clients/'+client.id+'/download'" download style="color:inherit" class="float-end mx-2">
                <span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-download" viewBox="0 0 16 16">
                    <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                    <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                  </svg>
                </span>
              </a>
              <div class="form-check form-switch float-end mx-2">
                <input class="form-check-input" type="checkbox" role="switch" :id="client.id+1" checked v-model="client.enabled" @change="toggleClientOnOff" :key="client.id">
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Modal -->
      <div class="modal fade" width="576px" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-fullscreen-sm-down">
          <div class="modal-content w-auto">
            <div class="modal-header">
              <h1 class="modal-title fs-5" id="staticBackdropLabel">Scan the QR Code</h1>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
            <img :src="qrcode"/>
            </div>
            <div class="modal-footer">
              <!-- <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>-->
            </div>
          </div>
        </div>
      </div>`
}
export default DashboardComponent