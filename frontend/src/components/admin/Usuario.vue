<template>
    <div class="usuario-form">
        <PageTitle icon="" main=""
            sub="Cadastro de Usuário" />
        <b-form>
            <input id="usuario-id" type="hidden" v-model="usuario.id" />
            <b-row>
                <b-col md="6" sm="12">
                    <b-form-group label="Nome:" label-for="usuario-nome">
                        <b-form-input id="usuario-nome" type="text"
                            v-model="usuario.nome" required
                            :readonly="mode === 'remove'"
                            placeholder="Informe o Nome do Usuário..." />
                    </b-form-group>
                </b-col>
                <b-col md="6" sm="12">
                    <b-form-group label="E-mail:" label-for="usuario-email">
                        <b-form-input id="usuario-email" type="text"
                            v-model="usuario.email" required
                            :readonly="mode === 'remove'"
                            placeholder="Informe o E-mail do Usuário..." />
                    </b-form-group>
                </b-col>
            </b-row>
            <b-form-checkbox id="usuario-admin" v-model="usuario.admin" 
                class="mt-3 mb-3" v-show="mode === 'save'" >
                Administrador?
            </b-form-checkbox>
            <b-row v-show="mode === 'save'">
                <b-col md="6" sm="12">
                    <b-form-group label="Senha:" label-for="usuario-senha">
                        <b-form-input id="usuario-senha" type="password"
                            v-model="usuario.senha" required
                            placeholder="Informe a Senha do Usuário..." />
                    </b-form-group>
                </b-col>
                <b-col md="6" sm="12">
                    <b-form-group label="Confirmação de Senha:" label-for="usuario-confirmacaoSenha">
                        <b-form-input id="usuario-confirmacaoSenha" type="password"
                            v-model="usuario.confirmacaoSenha" required
                            placeholder="Confirme a Senha do Usuário..." />
                    </b-form-group>
                </b-col>
            </b-row>
            <b-row>
                <b-col xl="12">
                    <b-button variant="primary" v-if="mode === 'save'"
                        @click="save">Salvar</b-button>
                    <b-button variant="danger" v-if="mode === 'remove'"
                        @click="remove">Excluir</b-button>
                    <b-button class="ml-2" @click="reset">Cancelar</b-button>
                </b-col>
            </b-row>
        </b-form>
        <hr>
        <b-table hover striped :items=usuarios :fields=fields >
            <template slot="actions" slot-scope="data">
                <b-button variant="warning" @click="loadUsuario(data.item)" class="mr-2">
                    <i class="fa fa-pencil"></i>
                </b-button>
                <b-button variant="danger" @click="loadUsuario(data.item, 'remove')">
                    <i class="fa fa-trash"></i>
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

const initialUsuario = {
    nome: "",
    email: "",
    senha: "",
    confirmacaoSenha: "",
    admin: Boolean
}

export default {
    name: 'Usuario',
    components: { PageTitle },
    data: function() {
        return {
            mode: 'save',
            usuario: { ...initialUsuario },
            usuarios: [],
            page: 1,
            limit: 0,
            count: 0,
            fields: [
                { key: 'nome', label: 'Nome', sortable: true },
                { key: 'email', label: 'E-mail', sortable: true },
                { key: 'admin', label: 'Administrador', sortable: true,
                    formatter: value => value ? 'Sim' : 'Não' },
                { key: 'actions', label: 'Ações' }
            ]
        }
    },
    methods: {
        loadUsuarios() {
            const url = `${baseApiUrl}/usuarios?page=${this.page}`
            axios.get(url).then(res => {
                this.usuarios = res.data
                this.count = res.data.count
                this.limit = res.data.limit
            })
        },
        loadUsuario(usuario, mode = 'save') {
            this.mode = mode
            this.usuario = { ...usuario }
        },
        save() {
            const method = this.usuario.id ? 'put' : 'post'
            const id = this.usuario.id ? `/${this.usuario.id}` : ''
            axios[method](`${baseApiUrl}/usuarios${id}`, this.usuario)
                .then(() => {
                    this.$toasted.global.defaultSuccess()
                    this.reset()
                })
                .catch(showError)
        },
        remove() {
            const id = this.usuario.id
            axios.delete(`${baseApiUrl}/usuarios/${id}`)
                .then(() => {
                    this.$toasted.global.defaultSuccess()
                    this.reset()
                })
                .catch(showError)
        },
        reset() {
            this.mode = 'save'
            this.usuario = { ...initialUsuario }
            this.loadUsuarios()
        },
        
    },
    watch: {
        page() {
            this.loadAtividades()
        }
    },
    mounted() {
        this.loadUsuarios()
    }
}
</script>

<style>

</style>
