<template>
    <div class="user-config-page">
        <PageTitle icon="fa fa-cogs" main="Configurações"
            sub="Configurações do usuário" />
        <div class="user-config-pages-tabs">
            <b-card no-body>
                <b-tabs card>
                    <b-tab title="Redmine">
                        <UserRedmine />
                    </b-tab>
                </b-tabs>
            </b-card>
        </div>
    </div>
</template>

<script>
import PageTitle from '../template/PageTitle'
import UserRedmine from './UserRedmine'

export default {
    name: 'UserConfigPages',
    components: { PageTitle, UserRedmine }
}
</script>

<style>

</style>
