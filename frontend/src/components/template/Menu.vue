<template>
    <aside class="menu-area" v-show="isMenuVisible">
        <nav class="menu">
            <router-link class="menu-item" to="/">
                <i class="fa fa"> Inicio </i>
            </router-link>
            <router-link class="menu-item" to="/atividade">
                <i class="fa fa"> Atividades </i>
            </router-link>
            <router-link class="menu-item" to="/mobile/access">
                <i class="fa fa"> Acesso Mobile </i>
            </router-link>
        </nav>
    </aside>
</template>

<script>
import { mapState } from 'vuex'

export default {
    name: 'Menu',
    components: {},
    computed: mapState(['isMenuVisible']),
    data: function() {
        return {
        }
    },
    methods: {
    },
    mounted() {
    }
}
</script>

<style>
    aside.menu-area {
        background-color: #1d1515;
        box-shadow:
            2px 0 10px 0 rgba(0, 0, 0, 0.12),
            2px 0 10px 0 rgba(0, 0, 0, 0.09);
    }

    .menu a {
        display: block;
        text-decoration: none;
        color: #FFF;
        padding: 15px;
    }

    .menu-item {
        display: inline;
    }

    .menu a i {
        font-size: 1.2rem;
        font-weight: 400;
        font-family: "Lato", sans-serif;
    }

    .menu a:hover {
        background: rgb(65, 65, 65);
        color: #FFF;
        font-weight: 600;
    }

</style>
