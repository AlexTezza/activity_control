<template>
    <div class="redmine-form">
        <label style="font-weight:bold">
            Cadastro e integração com Redmine
        </label>
        <b-form>
            <b-form-checkbox id="redmine-active" v-model="redmine.active"
                class="mt-3 mb-3" >
                Registro ativo ?
            </b-form-checkbox>
            <input id="redmine-id" type="hidden" v-model="redmine.id" />
            <b-row>
                <b-col md="6" sm="12">
                    <b-form-group label="Descrição:" label-for="redmine-description">
                        <b-form-input id="redmine-description" type="text"
                            v-model="redmine.description" required
                            placeholder="Informe a descrição deste Redmine..." />
                    </b-form-group>
                </b-col>
                <b-col md="6" sm="12">
                    <b-form-group label="URL: *" label-for="redmine-url">
                        <b-form-input id="redmine-url" type="text"
                            v-model="redmine.url" required
                            :readonly="mode === 'update'"
                            placeholder="Informe a URL do Redmine..." />
                    </b-form-group>
                </b-col>
            </b-row>

            <b-row v-if="mode !== 'update'">
                <b-col md="12" sm="12">
                    <b-form-group label="Chave de acesso a API: *" label-for="redmine-apikey">
                        <b-form-input id="redmine-apikey" type="text"
                            v-model="redmine.apikey" required
                            placeholder="Informe a chave de acesso à API do Redmine de qualquer usuário..." />
                        <i class="infoIcon fa fa-info-circle"></i>
                        <span class="obs">Esta chave de acesso será usada somente para buscar os tipos de atividades do Redmine e em seguida será descartada</Span>

                    </b-form-group>
                </b-col>
            </b-row>
            <br/>
            <b-row>
                <b-col xl="12">
                    <b-button variant="primary" @click="save">Salvar</b-button>
                    <b-button class="ml-2" @click="reset">Cancelar</b-button>
                </b-col>
            </b-row>
        </b-form>
        <hr>
        <b-table hover striped :items=redmines :fields=fields >
            <template slot="edit" slot-scope="data">
                <b-button variant="warning" @click="loadRedmine(data.item)" class="mr-2">
                    <i class="fa fa-pencil"></i>
                </b-button>
            </template>
        </b-table>
        <b-pagination size="md" v-model="page" :total-rows="count" :per-page="limit">

        </b-pagination>
    </div>
</template>

<script>
import { baseApiUrl, showError } from '@/global'
import PageTitle from '../template/PageTitle'
import axios from 'axios'

const initialRedmine = {
    description: "",
    url: "",
    active: true,
    apikey: ""
}

export default {
    name: 'Usuario',
    components: { PageTitle },
    data: function() {
        return {
            mode: 'save',
            redmine: { ...initialRedmine },
            redmines: [],
            page: 1,
            limit: 0,
            count: 0,
            fields: [
                { key: 'description', label: 'Descrição', sortable: true },
                { key: 'url', label: 'Url', sortable: true },
                { key: 'active', label: 'Ativo', sortable: true,
                    formatter: value => value ? 'Sim' : 'Não' },
                { key: 'edit', label: 'Editar' }
            ]
        }
    },
    methods: {
        isValidURL(str) {
            var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
                '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
                '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
                '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
                '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
                '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
            return !!pattern.test(str);
        },
        loadRedmines() {
            const url = `${baseApiUrl}/redmines?page=${this.page}`
            axios.get(url).then(res => {
                this.redmines = res.data
                this.count = res.data.count
                this.limit = res.data.limit
            })
        },
        loadRedmine(redmine, mode = 'update') {
            this.mode = mode
            this.redmine = { ...redmine }
        },
        save() {
            const method = this.redmine.id ? 'put' : 'post'
            const id = this.redmine.id ? `/${this.redmine.id}` : ''
            if (this.isValidURL(this.redmine.url)) {
                axios[method](`${baseApiUrl}/redmines${id}`, this.redmine)
                    .then(() => {
                        this.$toasted.global.defaultSuccess()
                        this.reset()
                    })
                    .catch(showError)
            } else {
                this.$toasted.show('URL inválida', {type: 'error', icon: 'times'});
            }
        },
        reset() {
            this.mode = 'save'
            this.redmine = { ...initialRedmine }
            this.loadRedmines()
        },

    },
    mounted() {
        this.loadRedmines()
    }
}
</script>

<style>
    .obs {
        color: darkorange
    }

    .infoIcon {
        color: darkorange;
        border-radius: 15px;
        padding-left: 3px;
        padding-right: 5px;
    }
</style>
