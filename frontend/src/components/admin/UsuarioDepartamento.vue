<template>
    <div class="usuario-departamento-form">
        <PageTitle icon="" main=""
            sub="Vínculo entre Usuários e Departamentos" />
        <div class="usuario-departamento-form-cadastro">
            <b-form-row>
                <div class="col-12 col-md-6">
                    <input id="usuario-departamento-id" type="hidden" v-model="usuarioDepartamento.id" />
                    <b-form-group label="Departamento: *" label-for="usuario-departamento-departamento">
                        <b-form-select v-if="mode === 'save'"
                            id="usuario-departamento-departamento"
                            :options="departamentos"
                            v-model="usuarioDepartamento.departamento.id">

                            <template slot="first">
                                <option first :value="null">-- Selecione --</option>
                            </template>
                        </b-form-select>
                        <b-form-input v-else
                            id="usuario-departamento-departamento" type="text"
                            v-model="usuarioDepartamento.departamento.descricao"
                            readonly />
                    </b-form-group>
                </div>

                <div class="col-12 col-md-6">
                    <b-form-group label="Usuário: *" label-for="usuario-departamento-usuario">
                        <b-form-select v-if="mode === 'save'"
                            id="usuario-departamento-usuario"
                            :options="usuarios"
                            v-model="usuarioDepartamento.usuario.id">

                            <template slot="first">
                                <option first :value="null">-- Selecione --</option>
                            </template>
                        </b-form-select>
                        <b-form-input v-else
                            id="usuario-departamento-usuario" type="text"
                            v-model="usuarioDepartamento.usuario.nome"
                            readonly />
                    </b-form-group>
                </div>

                <div class="col-12 col-md-12">
                    <b-button variant="primary" v-if="mode === 'save'"
                        @click="save">Salvar</b-button>
                    <b-button variant="danger" v-if="mode === 'remove'"
                        @click="remove">Excluir</b-button>
                    <b-button class="ml-2" @click="reset">Cancelar</b-button>
                </div>
            </b-form-row>
            <hr>
            <b-table hover striped responsive :items=usuariosDepartamentos :fields=fields res>
                <template slot="actions" slot-scope="data">
                    <b-button variant="warning" @click="loadUsuarioDepartamento(data.item)" class="mr-2">
                        <i class="fa fa-pencil"></i>
                    </b-button>
                    <b-button variant="danger" @click="loadUsuarioDepartamento(data.item, 'remove')">
                        <i class="fa fa-trash"></i>
                    </b-button>
                </template>
            </b-table>
            <b-pagination size="md" v-model="page" :total-rows="count" :per-page="limit">

            </b-pagination>
        </div>
    </div>
</template>

<script>
import PageTitle from '../template/PageTitle'
import { baseApiUrl, showError, userKey } from '@/global'
import axios from 'axios'

const initialUsuarioDepartamento = {
    departamento: {
        id: null,
        descricao: ""
    },
    usuario: {
        id: null,
        descricao: ""
    }
}

export default {
    name: 'UsuarioDepartamento',
    components: { PageTitle },
    data: function() {
        return {
            mode: 'save',
            usuarioDepartamento: { ...initialUsuarioDepartamento },
            usuariosDepartamentos: [],
            departamentos: [],
            usuarios: [],
            page: 1,
            limit: 0,
            count: 0,
            fields: [
                { key: 'departamento.descricao', label: 'Departamento', sortable: true },
                { key: 'usuario.nome', label: 'Nome usuário', sortable: true },
                { key: 'actions', label: 'Ações' }
            ]
        }
    },
    methods: {
        loadUsuariosDepartamentos() {
            const url = `${baseApiUrl}/usuarioDepartamento?page=${this.page}`
            axios.get(url).then(res => {
                this.usuariosDepartamentos = res.data.data
                this.count = res.data.count
                this.limit = res.data.limit
            })
        },
        loadUsuarioDepartamento(usuarioDepartamento, mode = 'save') {
            this.mode = mode
            this.usuarioDepartamento = { ...usuarioDepartamento }
        },
        save() {
            const method = this.usuarioDepartamento.id ? 'put' : 'post'
            const id = this.usuarioDepartamento.id ? `/${this.usuarioDepartamento.id}` : ''
            axios[method](`${baseApiUrl}/usuarioDepartamento${id}`, this.usuarioDepartamento)
                .then(() => {
                    this.$toasted.global.defaultSuccess()
                    this.reset()
                })
                .catch(showError)
        },
        remove() {
            console.log(this.usuarioDepartamento)
            const id = this.usuarioDepartamento.id
            axios.delete(`${baseApiUrl}/usuarioDepartamento/${id}`)
                .then(() => {
                    this.$toasted.global.defaultSuccess()
                    this.reset()
                })
                .catch(showError)
        },
        reset() {
            this.mode = 'save'
            this.usuarioDepartamento = { ...initialUsuarioDepartamento }
            this.usuarioDepartamento.departamento.id = null
            this.usuarioDepartamento.usuario.id = null
            this.loadUsuariosDepartamentos()
        },
        loadDepartamentos() {
            const url = `${baseApiUrl}/departamento`
            axios.get(url).then(res => {
                this.departamentos = res.data.data.map(departamento => {
                    return { value: departamento.id, text: departamento.descricao }
                })
            })
        },
        loadUsuarios() {
            const url = `${baseApiUrl}/usuarios`
            axios.get(url).then(res => {
                this.usuarios = res.data.map(usuario => {
                    return { value: usuario.id, text: usuario.nome }
                })
            })
        }
    },
    mounted() {
        this.loadUsuariosDepartamentos()
        this.loadDepartamentos()
        this.loadUsuarios()
    }
}
</script>

<style>

</style>