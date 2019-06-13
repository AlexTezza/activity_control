<template>
    <header class="header">
        <a class="toggle" @click="toggleMenu" v-if="!hideToggle">
            <i class="fa fa-lg" :class="icon"></i>
        </a>
        <div class="myTimeLogo" v-if="!hideLogo">
            <router-link to="/">
                <img src="@/assets/myTimeLogo.png" width="130px" alt="myTime" />
            </router-link>
        </div>
        <UserDropdown v-if="!hideUserDropdown" />
    </header>
</template>

<script>
import UserDropdown from './UserDropdown'

export default {
    name: 'Header',
    components: { UserDropdown },
    props: {
        hideToggle: Boolean,
        hideUserDropdown: Boolean,
        hideLogo: Boolean,
    },
    computed: {
        icon() {
            return this.$store.state.isMenuVisible ? "fa-angle-left" : "fa-bars"
        }
    },
    methods: {
        toggleMenu() {
            this.$store.commit('toggleMenu')
        }
    }
}
</script>

<style>
    .header {
        grid-area: header;
        background: rgb(15, 56, 89);
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .myTimeLogo {
        padding-left: 15px;
        flex-grow: 1;
    }

    .division {
        height: 60px;
        border-right: 1px solid rgba(255,255,255,.3);
    }

    header.header > a.toggle {
        width: 60px;
        height: 100%;
        color: #fff;
        justify-self: flex-start;
        text-decoration: none;
        display: flex;
        justify-content: center;
        align-items: center;
        border-right: 1px solid rgba(255,255,255,.3);
    }

    header.header > a.toggle:hover {
        color: #fff;
        background-color: rgba(0, 0, 0, 0.2);
        cursor: pointer;
    }
</style>
