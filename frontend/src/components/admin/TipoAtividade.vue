<template>
    <div class="tipo-atividade-form">
        <PageTitle icon="" main=""
            sub="Cadastro de Tipo Atividade" />
        <div class="tipo-atividade-form-cadastro">
            <b-form-row>
                <div class="col-12 col-md-9">
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

                <div class="col-12 col-md-12">
                    <b-button variant="primary" v-if="mode === 'save'"
                        @click="save">Salvar</b-button>
                    <b-button variant="danger" v-if="mode === 'remove'"
                        @click="remove">Excluir</b-button>
                    <b-button class="ml-2" @click="reset">Cancelar</b-button>
                </div>
            </b-form-row>
            <hr>
            <b-table hover striped responsive :items=tipoAtividades :fields=fields res>
                <template slot="actions" slot-scope="data">
                    <b-button variant="warning" @click="loadTipoAtividade(data.item)" class="mr-2">
                        <i class="fa fa-pencil"></i>
                    </b-button>
                    <b-button variant="danger" @click="loadTipoAtividade(data.item, 'remove')">
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
import { baseApiUrl, showError } from '@/global'
import axios from 'axios'

const initialTipoAtividade = {
    descricao: "",
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
            page: 1,
            limit: 0,
            count: 0,
            fields: [
                { key: 'descricao', label: 'Descrição', sortable: true },
                { key: 'sigla', label: 'Sigla', sortable: true },
                { key: 'actions', label: 'Ações' }
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
            this.loadTipoAtividades()
        }
    },
    watch: {
        page() {
            this.loadTipoAtividades()
        }
    },
    mounted() {
        this.loadTipoAtividades()
    }
}
</script>

<style>

</style>