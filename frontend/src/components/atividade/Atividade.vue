<template>
    <div class="atividade-form">
        <PageTitle icon="" main="Atividades"
            sub="Cadastro de Atividades" />
        <div class="atividade-form-cadastro">
            <b-form-row>
                <div class="col-12 col-md-8">
                    <input id="atividade-id" type="hidden" v-model="atividade.id" />
                    <b-form-group label="Descricao: *" label-for="atividade-descricao">
                        <b-form-input 
                            :readonly="mode === 'remove'"
                            id="atividade-descricao" 
                            type="text"
                            v-model="atividade.descricao" required
                            placeholder="Informe a Descrição..." />
                    </b-form-group>
                </div>
                <div class="col-12 col-md-4">
                    <b-form-group label="Tipo atividade: *" label-for="atividade-tipoAtividade">
                        <b-form-select v-if="mode === 'save'"
                            id="atividade-tipoAtividade"
                            :options="tipoAtividades"
                            v-model="atividade.tipoAtividade.id">

                            <template slot="first">
                                <option first :value="null">-- Selecione --</option>
                            </template>
                        </b-form-select>
                        <b-form-input v-else
                            id="atividade-tipoAtividade" type="text"
                            v-model="atividade.tipoAtividade.descricao"
                            readonly />
                    </b-form-group>
                </div>
                <div class="col-12 col-md-3">
                    <b-form-group label="Data: *" label-for="atividade-data">
                        <b-form-input
                            :readonly="mode === 'remove'"
                            id="atividade-data" 
                            type="date"
                            v-model="atividade.data" required />
                    </b-form-group>
                </div>
                <div class="col-12 col-md-3">
                    <b-form-group label="Hora início: *" label-for="atividade-horaInicio">
                        <b-form-input
                            :readonly="mode === 'remove'"
                            id="atividade-horaInicio" 
                            type="time"
                            v-model="atividade.horaInicio" required />
                    </b-form-group>
                </div>
                <div class="col-12 col-md-3">
                    <b-form-group label="Hora fim: *" label-for="atividade-horaFim">
                        <b-form-input
                            :readonly="mode === 'remove'"
                            id="atividade-horaFim" 
                            type="time"
                            v-model="atividade.horaFim" required />
                    </b-form-group>
                </div>
                <div class="rcol-12 col-md-3">
                    <b-form-group label="Duração: (em minutos)" label-for="atividade-duracao">
                        <b-form-input 
                            id="atividade-duracao" 
                            type="text"
                            v-model="atividade.duracao"
                            placeholder="0 minuto(s)"
                            disabled />
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

            <b-card no-body class="mb-1">
                <b-card-header header-tag="header" class="p-0" role="tab">
                    <b-button @click="toggleCollapse" v-b-toggle.accordion variant="light">Pesquisa
                        <i class="fa fa-lg" :class="icon"></i>
                    </b-button>
                </b-card-header>
                <b-collapse id="accordion" accordion="my-accordion" role="tabpanel">
                    <b-card-body>
                        <b-form-row>
                            <div class="rcol-12 col-md-7">
                                <b-form-group label="Descricao:" label-for="search-descricao">
                                    <b-form-input
                                        id="search-descricao" 
                                        type="text"
                                        v-model="search.descricao"
                                        placeholder="Pesquise pela descrição..."
                                        @keyup.native.enter="onEnter" />
                                </b-form-group>
                            </div>
                            <div class="rcol-12 col-md-2">
                                <b-form-group label="Tipo atividade:" label-for="search-tipoAtividade">
                                    <b-form-select
                                        id="search-tipoAtividade"
                                        :options="tipoAtividades"
                                        v-model="search.tipoAtividade.id" >

                                        <template slot="first">
                                            <option first :value="null">-- Selecione --</option>
                                        </template>
                                    </b-form-select>
                                </b-form-group>
                            </div>
                            <div class="rcol-12 col-md-2">
                                <b-form-group label="Data:" label-for="search-data">
                                    <b-form-input
                                        id="search-data" 
                                        type="date"
                                        v-model="search.data"
                                        @keyup.native.enter="onEnter" />
                                </b-form-group>
                            </div>
                            <div class="col-12 col-md-1" id="search-buttons">
                                <b-button variant="danger" class="mr-1" @click="resetSearch">
                                    <i class="fa fa-remove"></i>
                                </b-button>
                                <b-button variant="primary" @click="pressSearchAtividades">
                                    <i class="fa fa-search"></i>
                                </b-button>
                            </div>
                        </b-form-row>
                    </b-card-body>
                </b-collapse>
            </b-card>
            <hr>
            <b-table hover striped responsive :items=atividades :fields=fields res>
                <template slot="actions" slot-scope="data">
                    <b-button variant="warning" @click="loadAtividade(data.item)" class="mr-2">
                        <i class="fa fa-pencil"></i>
                    </b-button>
                    <b-button variant="danger" @click="loadAtividade(data.item, 'remove')">
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

const date = new Date()
const day = date.getDate()
const month = date.getMonth() + 1
const year = date.getFullYear()
const today = `${year}-${month < 10 ? "0" + (month) : month}-${day < 10 ? "0" + (day) : day}`

const initialAtividade = {
    descricao: "",
    tipoAtividade: {
        id: null,
        descricao: ""
    },
    data: today,
    horaInicio: "00:00",
    horaFim: "00:00",
    duracao: '0'
}

const initialSearch = {
    descricao: null,
    tipoAtividade: {
        id: null,
        descricao: ""
    },
    data: null
}

export default {
    name: 'Atividade',
    components: { PageTitle },
    data: function() {
        return {
            mode: 'save',
            modeListagem: null,
            atividade: { ...initialAtividade },
            search : { ...initialSearch },
            atividades: [],
            tipoAtividades: [],
            page: 1,
            limit: 0,
            count: 0,
            fields: [
                { key: 'descricao', label: 'Descrição', sortable: true },
                { key: 'tipoAtividade.descricao', label: 'Tipo atividade', sortable: true },
                { key: 'data', label: 'Data', sortable: true,
                    formatter: value => {
                        value = value.split("-", 3)
                        return `${value[2]}/${value[1]}/${value[0]}`
                    }
                },
                { key: 'horaInicio', label: 'Hora início', sortable: true },
                { key: 'horaFim', label: 'Hora fim', sortable: true },
                { key: 'duracao', label: 'Duração', sortable: true,
                    formatter: value => `${value} minuto(s)` },
                { key: 'actions', label: 'Ações' }
            ]
        }
    },
    computed: {
        usuarioLogado: function() {
            // Pega o usuário logado
            const json = localStorage.getItem(userKey)
            // Transforma o json em objeto
            return JSON.parse(json)
        },
        icon() {
            return this.$store.state.isCollapseVisible ? "fa-angle-up" : "fa-angle-down"
        }
    },
    methods: {
        loadAtividades() {
            const url = `${baseApiUrl}/atividade?page=${this.page}&usuario=${this.usuarioLogado.id}`
            axios.get(url).then(res => {
                this.atividades = res.data.data
                this.count = res.data.count
                this.limit = res.data.limit
            })
        },
        loadAtividade(atividade, mode = 'save') {
            this.mode = mode
            this.atividade = { ...atividade }
        },
        save() {
            const method = this.atividade.id ? 'put' : 'post'
            const id = this.atividade.id ? `/${this.atividade.id}` : ''
            this.atividade.idUsuario = this.usuarioLogado.id;
            axios[method](`${baseApiUrl}/atividade${id}`, this.atividade)
                .then(() => {
                    this.$toasted.global.defaultSuccess()
                    this.reset()
                })
                .catch(showError)
        },
        remove() {
            const id = this.atividade.id
            axios.delete(`${baseApiUrl}/atividade/${id}`)
                .then(() => {
                    this.$toasted.global.defaultSuccess()
                    this.reset()
                })
                .catch(showError)
        },
        reset() {
            this.mode = 'save'
            this.atividade = { ...initialAtividade }
            this.atividade.tipoAtividade.id = null
            this.loadAtividades()
        },
        pressSearchAtividades() {
            this.page = 1
            this.searchAtividades()
        },
        searchAtividades() {
            const descricao = this.search.descricao ? this.search.descricao : null
            const idTipoAtividade = this.search.tipoAtividade.id ? this.search.tipoAtividade.id : null
            const data = this.search.data ? this.search.data : null

            const url = `${baseApiUrl}/atividades/search/${this.page}/${this.usuarioLogado.id}/${descricao}/${idTipoAtividade}/${data}`
            axios.get(url).then(res => {
                this.atividades = res.data.data
                this.count = res.data.count
                this.limit = res.data.limit

                if (this.modeListagem || this.modeListagem !== 'normal') {
                    this.modeListagem = 'search'
                }
            })
        },
        resetSearch() {
            this.search = { ...initialSearch }
            this.search.tipoAtividade.id = null
            this.modeListagem = 'normal'
        },
        loadTipoAtividades() {
            const url = `${baseApiUrl}/tipoAtividade`
            axios.get(url).then(res => {
                this.tipoAtividades = res.data.data.map(tipoCategoria => {
                    return { value: tipoCategoria.id, text: tipoCategoria.descricao }
                })
            })
        },
        updateDuracao() {
            let duracao = 0;
            if (this.atividade.horaInicio !== "" && this.atividade.horaFim !== "") {
                var horaInicio = parseInt(this.atividade.horaInicio.split(':')[0])
                var minInicio = parseInt(this.atividade.horaInicio.split(':')[1])
                var horaFim = parseInt(this.atividade.horaFim.split(':')[0])
                var minFim = parseInt(this.atividade.horaFim.split(':')[1])
        
                var horaDiferanca = (horaFim - horaInicio) * 60
                var minDiferanca = minFim - minInicio

                duracao = horaDiferanca + minDiferanca
            }
            this.atividade.duracao = duracao
        },
        updateHoraFim(value) {
            if (this.atividade.horaFim === initialAtividade.horaFim
                || this.atividade.horaFim === value) {
                this.atividade.horaFim = this.atividade.horaInicio
            }
        },
        toggleCollapse() {
            this.$store.commit('toggleCollapse')
        },
        onEnter: function() {
            this.pressSearchAtividades()
        }
    },
    watch: {
        page() {
            if (this.modeListagem || this.modeListagem === 'search') {
                this.searchAtividades()
            } else {
                this.loadAtividades()
            }
        },
        'atividade.horaInicio': [
            'updateDuracao', 
            function(value, oldValue) {
                this.updateHoraFim(oldValue)
            }
        ],
        'atividade.horaFim': 'updateDuracao'
    },
    mounted() {
        this.loadAtividades()
        this.loadTipoAtividades()
    }
}
</script>

<style>
    .atividade-form-cadastro {
        padding: 15px;
        background-color: white;
    }

    #search-buttons {
        padding-top: 31px;
    }

</style>