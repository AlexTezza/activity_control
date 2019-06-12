<template>
    <div class="funcao-form">
        <label style="font-weight:bold">
            Cadastro de função
        </label>
        <div class="funcao-form-cadastro">
            <b-form-row>
                <div class="col-12 col-md-9">
                    <input id="funcao-id" type="hidden" v-model="funcao.id" />
                    <b-form-group label="Descricao: *" label-for="funcao-descricao">
                        <b-form-input 
                            :readonly="mode === 'remove'"
                            id="funcao-descricao" 
                            type="text"
                            v-model="funcao.descricao" required
                            placeholder="Informe a Descrição..." />
                    </b-form-group>
                </div>
                <div class="col-12 col-md-3">
                    <input id="funcao-sigla" type="hidden" v-model="funcao.sigla" />
                    <b-form-group label="Sigla: *" label-for="funcao-sigla">
                        <b-form-input 
                            :readonly="mode === 'remove'"
                            id="funcao-sigla" 
                            type="text"
                            v-model="funcao.sigla" required
                            placeholder="Informe a sigla..." />
                    </b-form-group>
                </div>
                <div class="col-12 col-md-12 text-right">
                    <b-button
                        @click="reset">
                        Cancelar
                    </b-button>
                    <b-button
                        class="ml-2"
                        variant="primary"
                        v-if="mode === 'save'"
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
                <b-table :items=funcoes :fields=fields hover striped responsive small outlined>
                    <template slot="editar" slot-scope="data">
                        <b-button
                            variant="outline-primary"
                            @click="loadFunction(data.item)"
                            v-b-tooltip.hover title="Editar função">
                            <i class="fa fa-pencil"></i>
                        </b-button>
                    </template>
                    <template slot="remover" slot-scope="data">
                        <b-button
                            variant="outline-danger"
                            @click="loadFunction(data.item, 'remove')"
                            v-b-tooltip.hover title="Remover função">
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

const initialFunction = {
    descricao: "",
    sigla: ""
}

export default {
    name: 'funcao',
    components: { PageTitle },
    data: function() {
        return {
            mode: 'save',
            funcao: { ...initialFunction },
            funcoes: [],
            page: 1,
            limit: 0,
            count: 0,
            fields: [
                { key: 'descricao', label: 'Descrição', sortable: true },
                { key: 'sigla', label: 'Sigla', sortable: true },
                { key: 'editar', label: 'Editar', class: 'text-center'},
                { key: 'remover', label: 'Remover', class: 'text-center'},
            ]
        }
    },
    methods: {
        loadFunctions() {
            const url = `${baseApiUrl}/funcao?page=${this.page}`
            axios.get(url).then(res => {
                this.funcoes = res.data.data
                this.count = res.data.count
                this.limit = res.data.limit
            })
        },
        loadFunction(funcao, mode = 'save') {
            this.mode = mode
            this.funcao = { ...funcao }
        },
        save() {
            const method = this.funcao.id ? 'put' : 'post'
            const id = this.funcao.id ? `/${this.funcao.id}` : ''

            axios[method](`${baseApiUrl}/funcao${id}`, this.funcao)
                .then(() => {
                    this.$toasted.global.defaultSuccess()
                    this.reset()
                })
                .catch(showError)
        },
        remove() {
            const id = this.funcao.id
            axios.delete(`${baseApiUrl}/funcao/${id}`)
                .then(() => {
                    this.$toasted.global.defaultSuccess()
                    this.reset()
                })
                .catch(showError)
        },
        reset() {
            this.mode = 'save'
            this.funcao = { ...initialFunction }
            this.loadFunctions()
        }
    },
    watch: {
        page() {
            this.loadFunctions()
        }
    },
    mounted() {
        this.loadFunctions()
    }
}
</script>