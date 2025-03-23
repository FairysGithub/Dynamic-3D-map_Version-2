<script lang="ts" setup>
/** 3D行政边界（省、市、县） **/
import { storeToRefs } from 'pinia'
import { nextTick, onMounted } from 'vue'
import { registerComponentRef } from '@/commons/utils/refs/index'
import { usePageStore } from '@/commons/stores/pageStore'

const useInitScene = () => {
    const pageStore = usePageStore()
    const { currentPage } = storeToRefs(pageStore)

    onMounted(() => {
        nextTick(() => {
            /** 全局事件 页面加载完成时 */
            window.SHJParseEvent(currentPage.value.globalEvent, 'on-page-loaded', null)
        })
    })

    return { currentPage }
}

const { currentPage } = useInitScene()

/** 配置参数 */
const sceneOption = {"backButtonLeft":50,"backButtonBottom":5,"debugger":false,"orbitControls":{"panSpeed":1,"minPolarAngle":0,"maxPolarAngle":75,"enablePan":true,"minDistance":50,"maxDistance":300,"enableDamping":true,"enableZoom":true,"zoomSpeed":1},"widgets":[],"scene":{"geojson":"","translateZ":0,"isDrilling":false,"defaultMapAdcode":520000,"background":"#C7B3B3","translateY":0,"translateX":0,"defaultMap":"china","x":0,"y":0,"z":0,"isBackground":true},"light":{"pointLight2":{"intensity":60,"color":"#ffffff","distance":30,"show":true,"x":-4,"y":8,"z":43},"ambientLight":{"intensity":1,"color":"#FFFFFF","show":true},"directionalLight":{"intensity":2,"color":"#ffffff","show":true,"position":{"x":-22,"y":128,"z":-20},"target":{"position":{"x":0,"y":0,"z":0}}},"pointLight1":{"intensity":60,"color":"#ffffff","distance":24,"show":true,"x":1,"y":19,"z":7}},"backButtonCss":{"backgroundColor":"#1F5EFF","borderColor":"#0088FFC3","fontFamily":"SHJ-SourceHanSansSC-Regular-otf","color":"#FFFFFF","borderRadius":4,"backgroundImage":"","borderWidth":1,"backgroundSize":"cover","fontSize":12,"fontStyle":"normal","borderStyle":"solid","fontWeight":600},"backButton":true,"particle":{"material":{"size":10,"color":"#FFFFFF","opacity":0.3},"num":10,"show":true,"range":200,"dir":"up","speed":0.1},"floor":{"quan":{"color":"#007BFF","show":true},"gaoguang":{"color":"#FFFFFF","show":true},"gridRipple":{"diffuseWidth":20,"color":"#566A78","diffuseOpacity":0.5,"alphaMap":"/map3d/gridRippleAlphaMap.png","repeat":100,"show":true,"diffuseSpeed":30,"diffuseColor":"#566A78","opacity":0.1,"map":"/map3d/gridRippleMap.png"},"rotateBorder":{"rotateBorder1":{"size":1.18,"color":"#445057","texture":"/map3d/rotateBorder1Map.png","show":true,"rotateSpeed":1,"opacity":0.2},"rotateBorder2":{"size":1.12,"color":"#445057","texture":"/map3d/rotateBorder2Map.png","show":true,"rotateSpeed":-4,"opacity":0.4}}},"camera":{"position":{"x":0,"y":163,"z":77},"target":[0,0,0]},"widgetControlStyle":{"backgroundColor":"#00000000","borderColor":"#5B687559","color":"#D9D9D9","backgroundImage":"","show":false,"active":{"backgroundColor":"#00000000","borderColor":"#498B91","color":"#E8E8E8","backgroundImage":"","borderWidth":1,"fontSize":12,"fontStyle":"normal","borderStyle":"solid","fontWeight":600},"fontStyle":"normal","hover":{"backgroundColor":"#00000000","borderColor":"#498B91","color":"#E8E8E8","backgroundImage":"","borderWidth":1,"fontSize":12,"fontStyle":"normal","borderStyle":"solid","fontWeight":600},"fontFamily":"SHJ-pangMenZhengDaoCuShuTi-Regular-woff","top":50,"borderRadius":4,"left":95,"borderWidth":1,"gap":12,"width":100,"backgroundSize":"cover","fontSize":12,"borderStyle":"solid","fontWeight":600,"direction":"column","height":26},"map":{"hoverLineColor":"#CCCCCC","depth":3,"titleLabel":{"offsetX":0,"fontFamily":"SHJ-pangMenZhengDaoCuShuTi-Regular-woff","offsetY":3,"color":"#000000","bottom":2,"show":true,"fontSize":53.50000000000011,"gaodeAPI":"f7d75cd912376e5ade47187998ebbd31"},"backgroundImg":{"color":"#DBF0FF","src":"https://lganv-1304359499.cos.ap-beijing.myqcloud.com/lg_cos_static/users/1899986829344653313/pages/QfrrcFZmij3yLU5N8brz/QQ图片-20250313215958862.jpg","alphaMap":"https://lganv-1304359499.cos.ap-beijing.myqcloud.com/lg_cos_static/system/users/pages/wt6khEBBTXuoIdBAAc0w/yuan3-20241127103341559.webp","rotation":[90,-180,180],"show":false,"scale":[0.5700000000000001,0.5700000000000001,0.5700000000000001],"position":[-8.7,0.10000000000000003,11.7],"opacity":1},"mirrorShow":true,"sideMaterial":{"color":"#ABD8FF","opacity":0.5,"map":"/map3d/sideMap.png"},"arealabel":{"fontFamily":"SHJ-pangMenZhengDaoCuShuTi-Regular-woff","color":"#8CBABA","bottom":2,"show":true,"fontSize":35.8},"lineColor":"#838587","topMaterial":{"emissive":"#000000","color":"#A6A6A6","hoverOpacity":1,"normalMap":"/map3d/topNormal.jpg","opacity":1,"map":"/map3d/v0c4mcq1wb_1668504678013_xbiq3me36-20241127095841928.jpg"},"storkeAnimation":{"color":"#FFFFFF","top":1,"texture":"/map3d/pathLine.png","radius":0.2,"speed":0.3,"segments":1000},"hoverDepth":1.5}}
/** 数据源 */
const sceneSources = []
</script>
<template>
    <div class="shj-scene">
        <!-- 使用@shjjs/visual-ui全局组件，basic-option暴漏所有参数可修改，sources为指定数据源 -->
        <zv-scene-map3d
            :ref="registerComponentRef(`scene-map3d-7`)"
            :basic-option="sceneOption"
            :sources="sceneSources"
            :use-events="currentPage.globalEvent"
        ></zv-scene-map3d>
    </div>
</template>
<style lang="scss" scoped>
.shj-scene {
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: -1;
}
</style>