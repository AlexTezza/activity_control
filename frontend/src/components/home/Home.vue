<template>
    <div class="home">
        <PageTitle
            main="Dashboard"
            sub="Gráficos de hora"
            icon="fa fa-pie-chart" />
        <b-container v-if="!user.admin" fluid>
            <b-form-row>
                <div class="chart-view">
                    <UserChart />
                </div>
            </b-form-row>
        </b-container>
        <div v-else class="admin-pages-tabs">
            <b-card no-body>
                <b-tabs card>
                    <b-tab title="Meus indicadores">
                        <b-form-row>
                            <div class="chart-view">
                                <UserChart />
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
    </div>
</template>

<script>
import PageTitle from '../template/PageTitle'
import { mapState } from 'vuex'
import UserChart from './charts/UserChart'
import ColaboratorsChart from './charts/admin/ColaboratorsChart'

export default {
    name: 'Home',
    components: {
        PageTitle,
        UserChart,
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
