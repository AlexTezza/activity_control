<template>
    <div class="auth-content">
        <div class="auth-modal">
            <img src="@/assets/myTimeLogoBlue.png" width="200" alt="Logo" />
            <hr>
            <div class="auth-title">{{ showSignup ? 'Cadastro' : 'Login' }}</div>
            <input
                v-if="showSignup"
                v-model="usuario.nome"
                placeholder="Nome"
                v-on:keyup.enter="onEnter">
            <input
                v-model="usuario.email"
                name="email"
                type="text"
                placeholder="E-mail"
                v-on:keyup.enter="onEnter">
            <input
                v-model="usuario.senha"
                name="senha"
                type="password"
                placeholder="Senha"
                v-on:keyup.enter="onEnter">
            <input
                v-if="showSignup"
                v-model="usuario.confirmacaoSenha"
                type="password"
                placeholder="Confirme a Senha"
                v-on:keyup.enter="onEnter">

            <b-button v-if="showSignup" @click="sinup" class="rounded-0" variant="primary" block >Registrar</b-button>
            <b-button v-else @click="signin" class="rounded-0" variant="primary" block>Entrar</b-button>

            <a href @click.prevent="showSignup = !showSignup">
                <span v-if="showSignup">Já tem cadastro? Acesse o Login!</span>
                <span v-else>Não tem cadastro? Registre-se aqui!</span>
            </a>
        </div>
    </div>
</template>

<script>
import { baseApiUrl, showError, userKey } from '@/global'
import axios from 'axios'

export default {
    name: 'Auth',
    data: function() {
        return {
            showSignup: false,
            usuario: {}
        }
    },
    methods: {
        signin() {
            axios.post(`${baseApiUrl}/signin`, this.usuario)
                .then(res => {
                    this.$store.commit('setUser', res.data)
                    localStorage.setItem(userKey, JSON.stringify(res.data))
                    this.$router.push({ path: '/' })
                })
                .catch(showError)
        },
        signup() {
            axios.post(`${baseApiUrl}/signup`, this.usuario)
                .then(() => {
                    this.$toasted.global.defaultSuccess()
                    this.usuario = {}
                    this.showSignup = false
                })
                .catch(showError)
        },
        onEnter: function() {
            this.showSignup ? this.signup() : this.signin()
        }
    }

}
</script>

<style>
    .auth-content {
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        background: rgb(15, 56, 89);
    }

    .auth-modal {
        background-color: #FFF;
        width: 350px;
        padding: 35px;
        box-shadow: 0 1px 5px rgba(0, 0, 0, 0.15);

        display: flex;
        flex-direction: column;
        align-items: center;
    }


    .auth-title {
        font-size: 1.2rem;
        font-weight: 100;
        margin-top: 10px;
        margin-bottom: 15px;
    }

    .auth-modal input {
        border: 1px solid #BBB;
        width: 100%;
        margin-bottom: 15px;
        padding: 3px 8px;
        outline: none;
    }

    .auth-modal button {
        align-self: flex-end;
        background-color: #2460ae;
        color: #FFF;
        padding: 5px 15px;
    }

    .auth-modal a {
        margin-top: 35px;
    }

    .auth-modal hr {
        border: 0;
        width: 100%;
        height: 1px;
        background-image: linear-gradient(to right,
            rgba(120, 120, 120, 0),
            rgba(120, 120, 120, 0.75),
            rgba(120, 120, 120, 0));
    }
</style>
