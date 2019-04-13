<template>
    <div class="home">
        <PageTitle icon="fa fa-home" main="Dashboard"
            sub="Gráficos de hora" />

        <b-form-row>
            <div class="chart-view">
                <ColumnChart />
            </div>
        </b-form-row>
    </div>
</template>

<script>
import PageTitle from '../template/PageTitle'

import ColumnChart from './charts/ColumnChart'

export default {
    name: 'Home',
    components: { 
        PageTitle, 
        ColumnChart
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
}

</style>
