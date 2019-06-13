<template>
    <footer class="footer">
        <span> © myTime - 2019</span>
    </footer>
</template>

<script>
export default {
    name: 'Footer'
}
</script>

<style>
    .footer {
        grid-area: footer;
        background-color: rgb(15, 56, 89);;
        color: #FFF;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        padding-right: 10px;
    }
</style>
