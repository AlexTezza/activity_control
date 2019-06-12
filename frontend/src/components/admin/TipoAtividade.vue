<template>
    <div class="tipo-atividade-form">
        <label style="font-weight:bold">
            Cadastro de tipo atividade
        </label>
        <div class="tipo-atividade-form-cadastro">
            <b-form-row>
                <div class="col-12 col-md-6">
                    <input id="tipo-atividade-id" type="hidden" v-model="tipoAtividade.id" />
                    <b-form-group label="Descricao: *" label-for="tipo-atividade-descricao">
                        <b-form-input
                            :readonly="mode === 'remove'"
                            id="tipo-atividade-descricao"
                            type="text"
                            v-model="tipoAtividade.descricao" required
                            placeholder="Informe a Descrição..." />
                    </b-form-group>
                </div>
                <div class="col-12 col-md-3">
                    <b-form-group label="Função: *" label-for="tipo-atividade-funcao">
                        <b-form-select v-if="mode === 'save'"
                            id="tipo-atividade-funcao"
                            :options="funcoes"
                            v-model="tipoAtividade.funcao.id">

                            <template slot="first">
                                <option first :value="null">-- Selecione --</option>
                            </template>
                        </b-form-select>

                        <b-form-input v-else
                            id="tipo-atividade-funcao" type="text"
                            v-model="tipoAtividade.funcao.descricao"
                            readonly />
                    </b-form-group>
                </div>

                <div class="col-12 col-md-3">
                    <input id="tipo-atividade-sigla" type="hidden" v-model="tipoAtividade.sigla" />
                    <b-form-group label="Sigla: *" label-for="tipo-atividade-sigla">
                        <b-form-input
                            :readonly="mode === 'remove'"
                            id="tipo-atividade-sigla"
                            type="text"
                            v-model="tipoAtividade.sigla" required
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
                <b-table :items=tipoAtividades :fields=fields hover striped responsive small outlined>
                    <template slot="editar" slot-scope="data">
                        <b-button
                            variant="outline-primary"
                            @click="loadTipoAtividade(data.item)"
                            v-b-tooltip.hover title="Editar tipo atividade">
                            <i class="fa fa-pencil"></i>
                        </b-button>
                    </template>
                    <template slot="remover" slot-scope="data">
                        <b-button
                            variant="outline-danger"
                            @click="loadTipoAtividade(data.item, 'remove')"
                            v-b-tooltip.hover title="Remover tipo atividade">
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

const initialTipoAtividade = {
    descricao: "",
    funcao: {
        id: null,
        text: ""
    },
    sigla: ""
}

export default {
    name: 'TipoAtividade',
    components: { PageTitle },
    data: function() {
        return {
            mode: 'save',
            tipoAtividade: { ...initialTipoAtividade },
            tipoAtividades: [],
            funcoes: [],
            page: 1,
            limit: 0,
            count: 0,
            fields: [
                { key: 'descricao', label: 'Descrição', sortable: true },
                { key: 'funcao.descricao', label: 'Funcão', sortable: true },
                { key: 'sigla', label: 'Sigla', sortable: true },
                { key: 'editar', label: 'Editar', class: 'text-center'},
                { key: 'remover', label: 'Remover', class: 'text-center'},
            ]
        }
    },
    methods: {
        loadTipoAtividades() {
            const url = `${baseApiUrl}/tipoAtividade?page=${this.page}`
            axios.get(url).then(res => {
                this.tipoAtividades = res.data.data
                this.count = res.data.count
                this.limit = res.data.limit
            })
        },
        loadTipoAtividade(tipoAtividade, mode = 'save') {
            this.mode = mode
            this.tipoAtividade = { ...tipoAtividade }
        },
        save() {
            const method = this.tipoAtividade.id ? 'put' : 'post'
            const id = this.tipoAtividade.id ? `/${this.tipoAtividade.id}` : ''

            axios[method](`${baseApiUrl}/tipoAtividade${id}`, this.tipoAtividade)
                .then(() => {
                    this.$toasted.global.defaultSuccess()
                    this.reset()
                })
                .catch(showError)
        },
        remove() {
            const id = this.tipoAtividade.id
            axios.delete(`${baseApiUrl}/tipoAtividade/${id}`)
                .then(() => {
                    this.$toasted.global.defaultSuccess()
                    this.reset()
                })
                .catch(showError)
        },
        reset() {
            this.mode = 'save'
            this.tipoAtividade = { ...initialTipoAtividade }
            this.tipoAtividade.funcao.id = null
            this.loadTipoAtividades()
        },
        loadFuncoes() {
            const url = `${baseApiUrl}/funcao`
            axios.get(url).then(res => {
                this.funcoes = res.data.data.map(funcao => {
                    return { value: funcao.id, text: funcao.descricao }
                })
            })
        },
    },
    watch: {
        page() {
            this.loadTipoAtividades()
        }
    },
    mounted() {
        this.loadTipoAtividades()
        this.loadFuncoes()
    }
}
</script>
