<template>
    <div class="page-title">
        <b-container fluid>
            <b-row>
                <div class="icon-container pl-2">
                    <i class="icon" v-if="icon" :class="icon"></i>
                </div>
                <b-col cols="8">
                    <h5>
                        {{ main }}
                    </h5>
                    <h6>{{ sub }}</h6>
                </b-col>
                <b-col class="button-action" v-if="showButton">
                    <b-button
                        id="add-activity-button"
                        variant="primary"
                        @click="action">
                        {{textButton}}
                    </b-button>
                    <b-tooltip ref="tooltip" target="add-activity-button" placement="bottomleft">
                        {{textTooltipButton}}
                    </b-tooltip>
                </b-col>
            </b-row>
        </b-container>
    </div>
</template>

<script>
export default {
    name: 'PageTitle',
    props: ['icon', 'main', 'sub', 'showButton', 'action', 'textButton', 'textTooltipButton'],
}
</script>

<style>
    .page-title {
        background-color: #fff;
        width: 100%;
        padding: 5px 10px 5px 10px;
        box-shadow: 0 6px 6px -6px gray;
    }

    .button-action {
        text-align: end;
        align-self: center
    }

    .icon-container {
        align-content: center;
        align-self: center;
    }

    .icon {
        font-size: 32px;
    }
</style>
