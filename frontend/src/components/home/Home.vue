<template>
    <div class="home">
        <PageTitle icon="fa fa-home" main="Dashboard"
            sub="Gráficos de hora" />

        <b-form-row>
            <div class="chart-view">
                <Charts />
            </div>
        </b-form-row>
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
}

</style>
