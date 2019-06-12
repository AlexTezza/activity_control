<template>
    <div class="home">
        <PageTitle
            main="Dashboard"
            sub="Gráficos de hora"
            icon="fa fa-pie-chart" />
        <b-container fluid>
            <b-form-row v-if="!user.admin">
                <div class="chart-view">
                    <Charts />
                </div>
            </b-form-row>

            <div v-else class="admin-pages-tabs">
                <b-card no-body>
                    <b-tabs card>
                        <b-tab title="Meus indicadores">
                            <b-form-row>
                                <div class="chart-view">
                                    <Charts />
                                </div>
                            </b-form-row>
                        </b-tab>
                        <b-tab title="Indicador Colaboradores">
                            <b-form-row>
                                <div class="chart-view">
                                    <ColaboratorsChart />
                                </div>
                            </b-form-row>
                        </b-tab>
                    </b-tabs>
                </b-card>
            </div>
        </b-container>
    </div>
</template>

<script>
import PageTitle from '../template/PageTitle'
import { mapState } from 'vuex' 
import Charts from './charts/Charts'
import ColaboratorsChart from './ColaboratorsChart'

export default {
    name: 'Home',
    components: { 
        PageTitle, 
        Charts,
        ColaboratorsChart
    },
    data: function() {
        return {
        }
    },
    computed: mapState(['user']),
    methods: {
        getStats() {
        }
    },
    mounted() {
        this.getStats()
    }
}
</script>

<style>

.chart-view {
	width: 100%;
    margin: 20px;
}

</style>
