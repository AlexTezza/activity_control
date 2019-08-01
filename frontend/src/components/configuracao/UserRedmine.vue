<template>
    <div class="redmine-form">
        <label style="font-weight:bold">
            Configurações para integração com o Redmine
        </label>
        <br/>
        <br/>
        <div class="redmine-form-cadastro">
            <b-form-row>
                <div class="col-12 col-md-12">
                     <b-form-group label="Redmine:" label-for="search-redmine">
                        <b-form-select
                            id="search-redmine"
                            :options="redmines"
                            v-model="redmine.redmineId" >

                            <template slot="first">
                                <option first :value="null">-- Selecione --</option>
                            </template>
                        </b-form-select>
                        <i class="infoIcon fa fa-info-circle"></i>
                        <span class="obs">A troca do Redmine acarretará em problemas de sincronização caso deseje modificar tarefas já sincronizadas!</Span>
                    </b-form-group>
                </div>

                <div class="col-12 col-md-12">
                    <b-form-group label="API do usuário:" label-for="redmine-api">
                        <b-form-input
                            id="redmine-api"
                            type="text"
                            v-model="redmine.redmineApiKey" required
                            placeholder="Informe a chave da API do seu usuário no Redmine..." />
                    </b-form-group>
                </div>

                <div class="col-12 col-md-12">
                    <b-form-checkbox id="redmine-allowSync" v-model="redmine.redmineAllowSync"
                        class="mt-3 mb-3">
                        Permitir sincronizar automaticamente a cada lançamento/atualização de horas?
                    </b-form-checkbox>
                </div>



                <div class="col-12 col-md-12">
                    <b-button variant="primary" @click="save">
                        Salvar
                    </b-button>
                </div>
            </b-form-row>
        </div>
    </div>
</template>

<script>
import PageTitle from '../template/PageTitle'
import { baseApiUrl, showError, userKey } from '@/global'
import axios from 'axios'

export default {
    name: 'UserRedmine',
    components: { PageTitle },
    computed: {
        usuarioLogado: function() {
            // Pega o usuário logado
            const json = localStorage.getItem(userKey)
            // Transforma o json em objeto
            return JSON.parse(json)
        },
    },
    data: function() {
        return {
            redmine: {},
            redmines: []
        }
    },
    methods: {
        loadRedmine() {
            this.redmine = { ...this.usuarioLogado}
        },
        save() {
            axios.put(`${baseApiUrl}/configuracoes/${this.usuarioLogado.id}`, {...this.redmine})
                .then(response => {
                    if (response) {
                        this.$toasted.global.defaultSuccess();
                        localStorage.setItem(userKey, JSON.stringify(this.redmine));
                    }
                })
                .catch(showError => {
                    console.log(showError);
                    console.log(this.$toasted.global);
                })
        },
        loadRedmines() {
            const url = `${baseApiUrl}/redmines?active=true`
            axios.get(url).then(res => {
                this.redmines = res.data.map(rm => {
                    return { value: rm.id, text: rm.description }
                })
            })
        },
    },
    mounted() {
        this.loadRedmine()
        this.loadRedmines()
    }
}
</script>

<style>

</style>
