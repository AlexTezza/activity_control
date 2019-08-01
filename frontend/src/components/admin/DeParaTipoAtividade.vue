<template>
    <div class="deparatipoatividade-form">
        <label style="font-weight:bold">
            De-Para entre tipos de atividade local e do Redmine
        </label>
        <br/>
        <br/>

        <b-form>
            <b-form-group label="Redmine:" label-for="select-redmine">
                <b-form-select
                    id="select-redmine"
                    :options="redmines"
                    v-model="redmineId" >
                    <template slot="first">
                        <option first :value="null">-- Selecione --</option>
                    </template>
                </b-form-select>
            </b-form-group>

            <b-container v-if="redmineId" class="bv-example-row">
                <b-row v-for="(tipoAtividade, index) in tipoAtividadeArray" v-bind:key="index" :id=index>
                    <b-col class="bcol rcol-12 col-md-3">
                        <span class="tipoAtividade">{{tipoAtividade.descricao}}</span>
                    </b-col>
                    <b-col class="rcol-12 col-md-4">
                        <b-form-select
                            :options="redmineActivities"
                            @change="onChangeSelect({[tipoAtividade.id]: $event})"
                            v-model="mapDePara[tipoAtividade.id]" >

                            <template slot="first">
                                <option first :value="null">-- Selecione --</option>
                            </template>
                        </b-form-select>
                    </b-col>
                </b-row>
            </b-container>
            <br/>
            <b-row>
                <b-col xl="12">
                    <b-button variant="primary" @click="save">Salvar</b-button>
                    <b-button class="ml-2" @click="loadDePara">Cancelar</b-button>
                </b-col>
            </b-row>
        </b-form>
        <hr>
    </div>
</template>

<script>
import { baseApiUrl, showError } from '@/global'
import PageTitle from '../template/PageTitle'
import axios from 'axios'

export default {
    name: 'DeParaTipoAtividade',
    components: { PageTitle },
    data: function() {
        return {
            mode: 'save',
            redmines: [],
            redmineId: '',
            tipoAtividadeArray: [],
            redmineActivities: [],
            mapDePara: {},
            ultimoSelecionado: '',
        }
    },
    methods: {
        loadTiposAtividade() {
            const url = `${baseApiUrl}/tipoAtividade`;
            axios.get(url).then(res => {
                this.tipoAtividadeArray = res.data.data;
            })
        },
        loadRedmines() {
            const url = `${baseApiUrl}/redmines?active=true`
            this.mapDePara = {};
            axios.get(url).then(res => {
                this.redmines = res.data.map(rm => {
                    return { value: rm.id, text: rm.description }
                })
            })
        },
        loadRedmineActivities() {
            if (this.redmineId) {
                const url = `${baseApiUrl}/redmineActivities?redmineId=${this.redmineId}`;
                axios.get(url).then(res => {
                    this.redmineActivities = res.data.map(e => {
                        return {
                            value: e.id,
                            text: e.description,
                        }
                    });
                })
            }
        },
        loadDePara() {
            if (this.redmineId) {
                this.mapDePara = {};
                const url = `${baseApiUrl}/deParaAtividades?redmineId=${this.redmineId}`;
                axios.get(url).then(res => {
                    const mapDeParaArray = res.data.map(e => {
                        return {
                            [e.tipoAtividadeId]: e.redmineActivitiesId
                        };
                    });

                    for (var i = 0; i < mapDeParaArray.length; ++i) {
                        const chave = Object.keys(mapDeParaArray[i])[0];
                        const valor = Object.values(mapDeParaArray[i])[0]
                        this.mapDePara[chave] = valor;
                    }
                    this.$forceUpdate();
                })
            }
        },
        save() {
            const url = `${baseApiUrl}/deParaAtividades?redmineId=${this.redmineId}`;
            axios.post(url, this.mapDePara).then(res => {
                this.$toasted.global.defaultSuccess();
            })
            .catch(showError)
        },
        onChangeSelect(ultimoObjetoDePara) {
            this.ultimoSelecionado = ultimoObjetoDePara;
        },
    },
    watch: {
        redmineId() {
            this.loadRedmineActivities();
            this.loadDePara();
        },
        mapDePara() {
            const ultimoSelecionado = this.ultimoSelecionado;
            const valorSelecionado = Object.values(this.ultimoSelecionado)[0];
            const chaveSelecionada = Object.keys(this.ultimoSelecionado)[0];

            const valorARemover = Object.entries(this.mapDePara).find(keyValue => {
                const key = keyValue[0];
                const value = keyValue[1];

                if (value === valorSelecionado && key !== chaveSelecionada) {
                    return true;
                }
                return false;
            });

            if (valorARemover) {
                this.mapDePara[valorARemover[0]] = "";
            }
        }
    },
    mounted() {
        this.loadTiposAtividade();
        this.loadRedmines();
        this.loadDePara();
    }
}
</script>

<style>
    .bcol {
        border: 1px solid rgb(206, 212, 218);
        border-radius: 5px;
        padding-top: 6px;
    }
</style>
