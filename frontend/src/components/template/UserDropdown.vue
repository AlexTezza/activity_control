<template>
    <div id="user-dropdown" class="user-dropdown">
        <div class="user-button" @click="onChangeDropDown">
            <span class="user-dropdown-img">
                <Gravatar :email="user.email" alt="User" />
                <label class="user-name">{{userName}}</label>
            </span>
            <i class="fa fa-angle-down"></i>
        </div>
        <div class="user-dropdown-content"
            v-if='showDropdownContent'
            @click="onChangeDropDown"
            @mouseleave="onChangeDropDown">
            <router-link to="/admin" v-if="user.admin">
                <i class="fa fa-cog"></i>
                Administração
            </router-link>
            <a href @click.prevent="logout">
                <i class="fa fa-sign-out"></i>
                Sair
            </a>
        </div>
    </div>
</template>

<script>
import { userKey } from '@/global'
import { mapState } from 'vuex'
import Gravatar from 'vue-gravatar'

export default {
    name: 'UserDropdown',
    components: { Gravatar },
    data: function() {
        return {
            userName: '',
            showDropdownContent: false,
        }
    },
    computed: mapState(['user']),
    methods: {
        formatUserName() {
            let user = this.user.nome
            let userNameArray = user.split(' ')
            let lastPosition = userNameArray.length - 1

            if (lastPosition > 0) {
                if (lastPosition === 1) {
                    this.userName = this.user.nome
                } else {
                    this.userName = `${userNameArray[0]} ${userNameArray[lastPosition]}`
                }
            } else {
                this.userName = userNameArray[0]
            }

        },
        logout() {
            localStorage.removeItem(userKey)
            this.$store.commit('setUser', null)
            this.$router.push({ name: 'auth' })
        },
        onChangeDropDown: function() {
            this.showDropdownContent = !this.showDropdownContent;
        },
    },
    mounted() {
        this.formatUserName()
    }
}
</script>

<style>
    .user-dropdown {
        position: relative;
        height: 100%;
        cursor: pointer;
    }

    .user-button {
        display: flex;
        align-items: center;
        color: #fff;
        font-weight: 100;
        height: 100%;
        padding: 0px 20px;
    }

    .user-dropdown:hover {
        background-color: rgba(0, 0, 0, 0.2);
    }

    .user-dropdown-img {
        margin: 0px 10px;
        position: relative;
    }

    .user-dropdown-img > img {
        max-height: 38px;
        border-radius: 50%;
    }

    .user-dropdown-content {
        display: block;
        position: absolute;
        right: 0px;
        background-color: #f9f9f9;
        min-width: 170px;
        box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
        z-index: 1;
    }

    .user-dropdown-content a {
        text-decoration: none;
        color: #000;
        padding: 10px;
        display: block;
    }

    .user-dropdown-content a:hover {
        text-decoration: none;
        color: #000;
        background-color: #EDEDED;
    }

    .user-name {
        cursor: pointer;
        margin: 10px;
        font-weight: 200;
    }

</style>
