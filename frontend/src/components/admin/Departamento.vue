<template>
    <div class="departamento-form">
        <PageTitle icon="" main=""
            sub="Cadastro de Departamento" />
        <div class="departamento-form-cadastro">
            <b-form-row>
                <div class="col-12 col-md-6">
                    <input id="departamento-id" type="hidden" v-model="departamento.id" />
                    <b-form-group label="Descricao: *" label-for="departamento-descricao">
                        <b-form-input 
                            :readonly="mode === 'remove'"
                            id="departamento-descricao" 
                            type="text"
                            v-model="departamento.descricao" required
                            placeholder="Informe a Descrição..." />
                    </b-form-group>
                </div>

                <div class="col-12 col-md-2">
                    <input id="departamento-sigla" type="hidden" v-model="departamento.sigla" />
                    <b-form-group label="Sigla: *" label-for="departamento-sigla">
                        <b-form-input 
                            :readonly="mode === 'remove'"
                            id="departamento-sigla" 
                            type="text"
                            v-model="departamento.sigla" required
                            placeholder="Informe a sigla..." />
                    </b-form-group>
                </div>

                <div class="col-12 col-md-4">
                    <b-form-group label="Responsável: *" label-for="departamento-usuario">
                        <b-form-select v-if="mode === 'save'"
                            id="departamento-usuario"
                            :options="usuarios"
                            v-model="departamento.usuario.id">

                            <template slot="first">
                                <option first :value="null">-- Selecione --</option>
                            </template>
                        </b-form-select>
                        <b-form-input v-else
                            id="departamento-usuario" type="text"
                            v-model="departamento.usuario.nome"
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
            <b-table hover striped responsive :items=departamentos :fields=fields res>
                <template slot="actions" slot-scope="data">
                    <b-button variant="warning" @click="loadDepartamento(data.item)" class="mr-2">
                        <i class="fa fa-pencil"></i>
                    </b-button>
                    <b-button variant="danger" @click="loadDepartamento(data.item, 'remove')">
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

const initialDepartamento = {
    descricao: "",
    sigla: "",
    usuario: {
        id: null,
        nome: ""
    }
}

export default {
    name: 'Departamento',
    components: { PageTitle },
    data: function() {
        return {
            mode: 'save',
            departamento: { ...initialDepartamento },
            departamentos: [],
            usuarios: [],
            page: 1,
            limit: 0,
            count: 0,
            fields: [
                { key: 'descricao', label: 'Descrição', sortable: true },
                { key: 'sigla', label: 'Sigla', sortable: true },
                { key: 'usuario.nome', label: 'Responsável', sortable: true },
                { key: 'actions', label: 'Ações' }
            ]
        }
    },
    methods: {
        loadDepartamentos() {
            const url = `${baseApiUrl}/departamento?page=${this.page}`
            axios.get(url).then(res => {
                this.departamentos = res.data.data
                this.count = res.data.count
                this.limit = res.data.limit
            })
        },
        loadDepartamento(departamento, mode = 'save') {
            this.mode = mode
            this.departamento = { ...departamento }
        },
        save() {
            const method = this.departamento.id ? 'put' : 'post'
            const id = this.departamento.id ? `/${this.departamento.id}` : ''

            axios[method](`${baseApiUrl}/departamento${id}`, this.departamento)
                .then(() => {
                    this.$toasted.global.defaultSuccess()
                    this.reset()
                })
                .catch(showError)
        },
        remove() {
            const id = this.departamento.id
            axios.delete(`${baseApiUrl}/departamento/${id}`)
                .then(() => {
                    this.$toasted.global.defaultSuccess()
                    this.reset()
                })
                .catch(showError)
        },
        reset() {
            this.mode = 'save'
            this.departamento = { ...initialDepartamento }
            this.departamento.usuario.id = null
            this.loadDepartamentos()
        },
        loadUsuarios() {
            const url = `${baseApiUrl}/usuarios`
            axios.get(url).then(res => {
                this.usuarios = res.data.map(usuario => {
                    return { value: usuario.id, text: usuario.nome }
                })
            })
        },
    },
    watch: {
        page() {
            this.loadDepartamentos()
        }
    },
    mounted() {
        this.loadDepartamentos()
        this.loadUsuarios()
    }
}
</script>

<style>

</style>