<template>
    <div class="home">
        <PageTitle
            main="Dashboard"
            sub="Gráficos de hora"
            icon="fa fa-pie-chart" />
        <b-container fluid>
            <b-form-row>
                <div class="chart-view">
                    <Charts />
                </div>
            </b-form-row>
        </b-container>
    </div>
</template>

<script>
import PageTitle from '../template/PageTitle'
import Charts from './charts/Charts'

export default {
    name: 'Home',
    components: {
        PageTitle,
        Charts
    },
    data: function() {
        return {
        }
    },
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
