<template>
    <div class="home">
        <PageTitle icon="fa fa-home" main="Dashboard"
            sub="Gráficos de hora" />
    </div>
</template>

<script>
import PageTitle from '../template/PageTitle'

export default {
    name: 'Home',
    components: { PageTitle },
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

</style>
