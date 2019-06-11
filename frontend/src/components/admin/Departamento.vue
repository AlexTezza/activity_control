<template>
    <div class="departamento-form">
        <label style="font-weight:bold">
            Cadastro de departamento
        </label>
        <div class="departamento-form-cadastro">
            <b-form-row>
                <div class="col-12 col-md-6">
                    <input id="departamento-id" type="hidden" v-model="departamento.id" />
                    <b-form-group label="Descricao: *" label-for="departamento-descricao">
                        <b-form-input
                            :readonly="mode === 'remove'"
                            id="departamento-descricao"
                            type="text"
                            v-model="departamento.descricao"
                            placeholder="Informe a Descrição..."
                            required />
                    </b-form-group>
                </div>
                <div class="col-12 col-md-2">
                    <input id="departamento-sigla" type="hidden" v-model="departamento.sigla" />
                    <b-form-group label="Sigla: *" label-for="departamento-sigla">
                        <b-form-input
                            :readonly="mode === 'remove'"
                            id="departamento-sigla"
                            type="text"
                            v-model="departamento.sigla"
                            placeholder="Informe a sigla..."
                            required />
                    </b-form-group>
                </div>
                <div class="col-12 col-md-4">
                    <b-form-group label="Responsável: *" label-for="departamento-usuario">
                        <b-form-select v-if="mode === 'save'"
                            id="departamento-usuario"
                            :options="usuarios"
                            v-model="departamento.usuario.id">
                            <template slot="first">
                                <option first :value="null">
                                    -- Selecione --
                                </option>
                            </template>
                        </b-form-select>
                        <b-form-input v-else
                            id="departamento-usuario"
                            type="text"
                            v-model="departamento.usuario.nome"
                            readonly />
                    </b-form-group>
                </div>
                <div class="col-12 col-md-12 text-right">
                    <b-button @click="reset">Cancelar</b-button>
                    <b-button
                        class="ml-2"
                        variant="primary" v-if="mode === 'save'"
                        @click="save">
                        Salvar
                    </b-button>
                    <b-button
                        class="ml-2"
                        variant="danger"
                        v-if="mode === 'remove'"
                        @click="remove">
                        Excluir
                    </b-button>
                </div>
            </b-form-row>
            <div class="pt-4">
                <b-table :items=departamentos :fields=fields hover striped responsive small outlined>
                    <template slot="editar" slot-scope="data">
                        <b-button
                            variant="outline-primary"
                            @click="loadDepartamento(data.item)"
                            v-b-tooltip.hover title="Editar departamento">
                            <i class="fa fa-pencil"></i>
                        </b-button>
                    </template>
                    <template slot="remover" slot-scope="data">
                        <b-button
                            variant="outline-danger"
                            @click="loadDepartamento(data.item, 'remove')"
                            title="Remover departamento"
                            v-b-tooltip.hover>
                            <i class="fa fa-trash"></i>
                        </b-button>
                    </template>
                </b-table>
                <b-pagination
                    size="md"
                    v-model="page"
                    :total-rows="count"
                    :per-page="limit">
                </b-pagination>
            </div>
        </div>
    </div>
</template>

<script>
import PageTitle from '../template/PageTitle'
import { baseApiUrl, showError } from '@/global'
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
                { key: 'editar', label: 'Editar', class: 'text-center'},
                { key: 'remover', label: 'Remover', class: 'text-center'},
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
