<template>
  <div ref="chartRef" :style="styleComputed"></div>
</template>
<script lang="ts" setup>
  import { ref, computed } from 'vue';
  import { chartProps } from './types';
  import { getSizeValue } from '../../utils';
  import { useChart } from './useChart';

  defineOptions({
    name: 'XChart'
  });

  const props = defineProps(chartProps);
  const chartRef = ref();
  const { echartsInstance, echarts } = useChart(chartRef, props);
  const styleComputed = computed(() => {
    return {
      width: getSizeValue(props.width),
      height: getSizeValue(props.height)
    };
  });

  defineExpose({
    chartRef,
    echartsInstance,
    echarts
  });
</script>
