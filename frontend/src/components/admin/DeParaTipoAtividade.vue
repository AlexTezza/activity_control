<template>
    <div class="deparatipoatividade-form">
        <PageTitle icon="" main=""
            sub="De-Para entre tipos de atividade local e do Redmine" />
        <b-form>
            <b-container class="bv-example-row">
                <b-row v-for="(tipoAtividade, index) in tipoAtividadeArray" v-bind:key="index">
                    <b-col class="bcol rcol-12 col-md-3"><span class="tipoAtividade">{{tipoAtividade.descricao}}</span></b-col>
                    <b-col class="rcol-12 col-md-4">
                        <b-form-select
                            id="select-tipoAtividade"
                            :options="redmines"
                            v-model="tiposAtividade" >

                            <template slot="first">
                                <option first :value="null">-- Selecione --</option>
                            </template>
                        </b-form-select>
                    </b-col>
                </b-row>
            </b-container>

            <b-row>
                <b-col xl="12">
                    <b-button variant="primary" @click="save">Salvar</b-button>
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
            tipoAtividadeArray: [],
        }
    },
    methods: {
        loadTiposAtividade() {
            const url = `${baseApiUrl}/tipoAtividade`;
            axios.get(url).then(res => {
                this.tipoAtividadeArray = res.data.data;
            })
        },
        save() {
            console.log('not implemented');
        },
    },
    mounted() {
        this.loadTiposAtividade();
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
