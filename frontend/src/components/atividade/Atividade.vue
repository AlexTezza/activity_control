
<template>
    <div class="atividade-form">
        <PageTitle
            icon="fa fa-tasks"
            main="Atividades"
            sub="Cadastro de Atividades"
            showButton="showButton"
            v-bind:action="showModal"
            textButton="Adicionar"
            textTooltipButton="Adicionar atividade" />
        <div class="atividade-form-cadastro">
            <div class="pb-2 col-12">
                <b-button
                    id="search-activity-button"
                    @click="toggleCollapse"
                    variant="dark"
                    v-b-toggle.accordion>
                        Pesquisa
                    <i class="fa fa-lg" :class="icon"></i>
                </b-button>
                <b-tooltip ref="tooltip" target="search-activity-button" placement="bottomright">
                    Pesquisar atividade(s)
                </b-tooltip>
            </div>
            <div class="col-12">
                <b-collapse id="accordion" accordion="my-accordion" role="tabpanel">
                    <b-card footer-tag="footer">
                        <b-form-row>
                            <div class="col-12 col-md-2">
                                <b-form-group label="Task: #" label-for="search-tarefa">
                                    <b-form-input
                                        id="search-tarefa"
                                        type="number"
                                        v-model="search.tarefa"
                                        placeholder="Nº Task do Redmine..." />
                                </b-form-group>
                            </div>
                            <div class="col-12 col-md-10">
                                <b-form-group label="Descrição:" label-for="search-descricao">
                                    <b-form-input
                                        id="search-descricao"
                                        type="text"
                                        v-model="search.descricao"
                                        placeholder="Pesquise pela descrição..."
                                        @keyup.native.enter="onEnter" />
                                </b-form-group>
                            </div>
                        </b-form-row>
                        <b-form-row>
                            <div class="col-12 col-md-4">
                                <b-form-group label="Tipo atividade:" label-for="search-tipoAtividade">
                                    <b-form-select
                                        id="search-tipoAtividade"
                                        v-model="search.tipoAtividade.id" >
                                        <template slot="first">
                                            <option first :value="null">-- Selecione --</option>

                                            <optgroup v-for="(func) in functions" v-bind:key="func.id" :label="func.description">
                                                <option v-for="(item) in filterItemsByFunction(func.id, tipoAtividades)"
                                                    v-bind:key="item.value"
                                                    :value="item.value">{{item.text}}
                                                </option>
                                            </optgroup>

                                        </template>
                                    </b-form-select>
                                </b-form-group>
                            </div>
                            <div class="col-12 col-md-4">
                                <b-form-group label="Data de:" label-for="search-data-of">
                                    <b-form-input
                                        id="search-data-of"
                                        type="date"
                                        v-model="search.dataDe"
                                        @keyup.native.enter="onEnter" />
                                </b-form-group>
                            </div>
                            <div class="col-12 col-md-4">
                                <b-form-group label="Até:" label-for="search-data-until">
                                    <b-form-input
                                        id="search-data-until"
                                        type="date"
                                        v-model="search.dataAte"
                                        @keyup.native.enter="onEnter" />
                                </b-form-group>
                            </div>
                        </b-form-row>
                        <b-row align-v="center" slot="footer">
                            <b-col>
                                Total de horas: {{search.horaTotal}}
                            </b-col>
                            <b-col class="text-right">
                                <b-button
                                    variant="light"
                                    class="mr-1"
                                    @click="resetSearch"
                                    v-b-tooltip.hover title="Limpar pesquisa">
                                    <i class="fa fa-remove"></i>
                                    Limpar
                                </b-button>
                                <b-button
                                    variant="primary"
                                    @click="pressSearchAtividades"
                                    v-b-tooltip.hover title="Pesquisar">
                                    <i class="fa fa-search"></i>
                                    Pesquisar
                                </b-button>
                            </b-col>
                        </b-row>
                    </b-card>
                </b-collapse>
            </div>
            <div class="pt-4 col-12">
                <b-table :items=atividades :fields=fields hover striped responsive small outlined>
                    <template slot="editar" slot-scope="data">
                        <b-button
                            variant="outline-primary"
                            @click="loadAtividade(data.item)"
                            class="mr-2"
                            v-b-tooltip.hover title="Editar atividade">
                            <i class="fa fa-pencil"></i>
                        </b-button>
                    </template>
                    <template slot="remover" slot-scope="data">
                        <b-button
                            variant="outline-danger"
                            @click="loadAtividade(data.item, 'remove')"
                            v-b-tooltip.hover title="Remover atividade">
                            <i class="fa fa-trash"></i>
                        </b-button>
                    </template>
                    <template class="sync-column" slot="sync" slot-scope="data">
                        <b-button v-b-tooltip.hover
                            title="Lançar nova atividade no Redmine"
                            v-if="data.item.redmineSyncPendency === 'insert' || (!data.item.redmineSyncPendency && data.item.tarefa && !data.item.redmineTaskId)"
                            variant="outline-success"
                            @click="saveInRedmine(data.item, 'insert')"
                            class="mr-2">
                            <i class="fa fa-paper-plane"></i>
                        </b-button>
                        <b-button v-b-tooltip.hover
                            title="Atualizar atividade no Redmine"
                            v-if="data.item.redmineSyncPendency === 'update'"
                            variant="outline-success"
                            @click="saveInRedmine(data.item, 'update')"
                            class="mr-2">
                            <i class="fa fa-retweet"></i>
                        </b-button>
                        <b-button v-b-tooltip.hover
                            title="Remover este lançamento do Redmine"
                            v-if="data.item.redmineSyncPendency === 'remove'"
                            variant="outline-success"
                            @click="saveInRedmine(data.item, 'remove')"
                            class="mr-2">
                            <i class="fa fa-trash"></i>
                        </b-button>
                        <b-button v-b-tooltip.hover
                            title="Remover atividade de uma tarefa antiga e lançar em uma nova tarefa no Redmine"
                            v-if="data.item.redmineSyncPendency === 'replace'"
                            variant="outline-success"
                            @click="saveInRedmine(data.item, 'replace')"
                            class="mr-2">
                            <i class="fa fa-exchange"></i>
                        </b-button>
                        <i id="sync-check"
                            v-b-tooltip.hover
                            title="Sincronizado"
                            class="fa fa-check"
                            v-if="!data.item.redmineSyncPendency && data.item.tarefa && data.item.redmineTaskId">
                        </i>
                    </template>
                </b-table>
                <b-pagination size="md" v-model="page" :total-rows="count" :per-page="limit"></b-pagination>
            </div>
        </div>
        <div>
            <b-modal
                ref="add-activities-modal"
                title="Atividade(s)"
                @hidden="cancel"
                size="lg"
                hide-footer
                centered>
                <div class="d-block">
                    <b-container fluid>
                        <b-form-row>
                            <input id="atividade-id" type="hidden" v-model="atividade.id" />
                            <div class="col-12 col-md-2">
                                <b-form-group label="Task: #" label-for="atividade-tarefa">
                                    <b-form-input
                                        :readonly="mode === 'remove'"
                                        id="atividade-tarefa"
                                        type="number"
                                        v-model="atividade.tarefa"
                                        placeholder="Nº Task do Redmine..."
                                        autofocus />
                                </b-form-group>
                            </div>
                            <div class="col-12 col-md-7">
                                <b-form-group label="Descrição: *" label-for="atividade-descricao">
                                    <b-form-input
                                        :readonly="mode === 'remove'"
                                        id="atividade-descricao"
                                        type="text"
                                        v-model="atividade.descricao"
                                        placeholder="Informe a Descrição..."
                                        required />
                                </b-form-group>
                            </div>
                            <div class="col-12 col-md-3">
                                <b-form-group label="Tipo atividade: *" label-for="atividade-tipoAtividade">
                                    <b-form-select
                                        v-if="mode === 'save'"
                                        id="atividade-tipoAtividade"
                                        v-model="atividade.tipoAtividade.id">
                                        <template slot="first">
                                            <option first :value="null">
                                                -- Selecione --
                                            </option>
                                            <optgroup v-for="(func) in functions" v-bind:key="func.id" :label="func.description">
                                                <option v-for="(item) in filterItemsByFunction(func.id, tipoAtividades)"
                                                    v-bind:key="item.value"
                                                    :value="item.value">{{item.text}}</option>
                                            </optgroup>
                                        </template>
                                    </b-form-select>
                                    <b-form-input
                                        v-else
                                        id="atividade-tipoAtividade"
                                        type="text"
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
                                        v-model="atividade.data"
                                        required />
                                </b-form-group>
                            </div>
                            <div class="col-12 col-md-3">
                                <b-form-group label="Hora início: *" label-for="atividade-horaInicio">
                                    <b-form-input
                                        :readonly="mode === 'remove'"
                                        id="atividade-horaInicio"
                                        type="time"
                                        v-model="atividade.horaInicio"
                                        required />
                                </b-form-group>
                            </div>
                            <div class="col-12 col-md-3">
                                <b-form-group label="Hora fim: *" label-for="atividade-horaFim">
                                    <b-form-input
                                        :readonly="mode === 'remove'"
                                        id="atividade-horaFim"
                                        type="time"
                                        v-model="atividade.horaFim"
                                        required />
                                </b-form-group>
                            </div>
                            <div class="col-12 col-md-3">
                                <b-form-group label="Duração: (em minutos)" label-for="atividade-duracao">
                                    <b-form-input
                                        id="atividade-duracao"
                                        type="text"
                                        v-model="atividade.duracao"
                                        placeholder="0 minuto(s)"
                                        disabled />
                                </b-form-group>
                            </div>
                        </b-form-row>
                    </b-container>
                    <b-container class="pt-3" fluid>
                        <b-row>
                            <b-col>
                                <b-button @click="cancel">
                                    Cancelar
                                </b-button>
                            </b-col>
                            <b-col>
                                <div class="float-right">
                                    <b-button variant="success" v-if="mode === 'save'" @click="save(saveAndContinue = true)">
                                        Salvar e continuar
                                    </b-button>
                                    <b-button class="ml-2" variant="primary" v-if="mode === 'save'" @click="save(saveAndContinue = false)">
                                        Salvar
                                    </b-button>
                                    <b-button variant="danger" v-if="mode === 'remove'" @click="remove">
                                        Excluir
                                    </b-button>
                                </div>
                            </b-col>
                        </b-row>
                    </b-container>
                 </div>
            </b-modal>
        </div>
    </div>
</template>

<script>
import PageTitle from '../template/PageTitle'
import { baseApiUrl, showError, userKey } from '@/global'
import axios from 'axios'
import moment from 'moment'

const today = moment().format('YYYY-MM-DD')

const initialAtividade = {
    tarefa: null,
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
    tarefa: null,
    descricao: null,
    tipoAtividade: {
        id: null,
        descricao: ""
    },
    dataDe: today,
    dataAte: null,
    horaTotal: 0
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
            functions: [],
            tipoAtividades: [],
            page: 1,
            limit: 0,
            count: 0,
            fields: []
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
        setGridColumns() {
            let array = [
                { key: 'tarefa', label: 'Task', sortable: true },
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
                { key: 'editar', label: 'Editar', class: 'text-center' },
                { key: 'remover', label: 'Remover', class: 'text-center' },
            ];

            if (this.usuarioLogado.redmineApiKey) {
                array.push({ key: 'sync', label: 'Redmine' });
            }

            this.fields = array;
        },
        loadAtividades() {
            const url = `${baseApiUrl}/atividade?page=${this.page}&usuario=${this.usuarioLogado.id}`
            axios.get(url).then(res => {
                this.atividades = res.data.data
                this.count = res.data.count
                this.limit = res.data.limit
            })
        },
        loadAtividade(atividade, mode = 'save') {
            this.showModal()
            this.mode = mode
            this.atividade = { ...atividade }
        },
        save(saveAndContinue = false) {
            const method = this.atividade.id ? 'put' : 'post'
            const id = this.atividade.id ? `/${this.atividade.id}` : ''
            this.atividade.idUsuario = this.usuarioLogado.id;

            axios[method](`${baseApiUrl}/atividade${id}`, this.atividade)
                .then(() => {
                    this.$toasted.global.defaultSuccess()
                    this.reset()
                    if (!saveAndContinue) {
                        this.hideModal()
                    }
                })
                .catch(showError)
        },
        saveInRedmine(item, operation) {
            return axios.post(`${baseApiUrl}/redmine/sync/${operation}`, item).then(() => {
                this.$toasted.global.defaultSuccess();
                this.reset()
            }).catch(showError)
        },
        remove() {
            const id = this.atividade.id
            axios.delete(`${baseApiUrl}/atividade/${id}`)
                .then(() => {
                    this.$toasted.global.defaultSuccess()
                    this.reset()
                    this.hideModal()
                })
                .catch(showError)
        },
        reset() {
            let selectedDate = this.atividade.data
            let lastUntilHour = this.atividade.horaFim

            this.mode = 'save'
            this.atividade = { ...initialAtividade }
            this.atividade.data = selectedDate
            this.atividade.horaInicio = lastUntilHour
            this.atividade.horaFim = lastUntilHour
            this.atividade.tipoAtividade.id = null

            this.loadAtividades()
        },
        cancel() {
            this.reset();
            this.hideModal();
        },
        pressSearchAtividades() {
            this.page = 1
            this.searchAtividades()
        },
        searchAtividades() {
            const tarefa = this.search.tarefa && this.search.tarefa !== "" ? this.search.tarefa : null
            const descricao = this.search.descricao ? this.search.descricao : null
            const idTipoAtividade = this.search.tipoAtividade.id ? this.search.tipoAtividade.id : null
            const dataDe = this.search.dataDe ? this.search.dataDe : null
            const dataAte = this.search.dataAte ? this.search.dataAte : null

            const url =
                `${baseApiUrl}/atividades/search/${this.page}/${this.usuarioLogado.id}/${tarefa}/${descricao}/${idTipoAtividade}/${dataDe}/${dataAte}`

            axios.get(url).then(res => {
                this.atividades = res.data.data
                this.count = res.data.count
                this.limit = res.data.limit
                this.search.horaTotal = res.data.amount

                if (this.modeListagem || this.modeListagem !== 'normal') {
                    this.modeListagem = 'search'
                }
            })
        },
        resetSearch() {
            this.search = { ...initialSearch }
            this.search.tipoAtividade.id = null
            this.search.horaTotal = 0
            this.modeListagem = null
            this.data = today
            this.loadAtividades()
        },
        loadTipoAtividades() {
            const url = `${baseApiUrl}/getAll/tipoAtividade`
            axios.get(url).then(res => {
                this.tipoAtividades = res.data.map(tipoCategoria => {
                    return {
                        value: tipoCategoria.id,
                        text: tipoCategoria.descricao,
                        idFuncao: tipoCategoria.idFuncao
                    }
                })
            })
        },
        loadFunctions() {
            const url = `${baseApiUrl}/getAll/funcao`
            axios.get(url).then(res => {
                this.functions = res.data.map(funcao => {
                    return { id: funcao.id, description: funcao.descricao }
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
        updateHoraFim() {
            if (this.atividade.duracao < 0) {
                this.atividade.horaFim = this.atividade.horaInicio
            }
        },
        toggleCollapse() {
            this.$store.commit('toggleCollapse')
        },
        onEnter: function() {
            this.pressSearchAtividades()
        },
        showModal() {
            this.$refs['add-activities-modal'].show()
        },
        hideModal() {
            this.$refs['add-activities-modal'].hide()
        },
        filterItemsByFunction: function(idFunction, items) {
            return items.filter(function(item) {
                return item.idFuncao == idFunction
            })
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
            function() {
                this.updateHoraFim()
            }
        ],
        'atividade.horaFim': 'updateDuracao'
    },
    mounted() {
        this.loadAtividades()
        this.loadFunctions()
        this.loadTipoAtividades()
        this.setGridColumns()
    }
}
</script>

<style>
    .atividade-form-cadastro {
        margin-top: 10px;
        padding: 15px;
        background-color: white;
    }

    #search-buttons {
        padding-top: 31px;
    }

    #sync-check {
        color: green;
        font-size: large;
    }

</style>
