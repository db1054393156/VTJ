<template>
  <div class="designer" ref="container"></div>
</template>
<script lang="ts" setup>
  import { ref, watch } from 'vue';
  import { useRoute } from 'vue-router';
  import { Engine, widgetManager, LocalService, ProjectModel } from '../../src';

  const route = useRoute();
  const container = ref();
  const service = new LocalService();

  widgetManager.set('Switcher', {
    props: {
      onClick: (project: ProjectModel) => {
        const pathname = location.pathname;
        let url = pathname === '/@vtj/pro/' ? '/' : pathname;
        const file = project.currentFile;
        if (file && file.type === 'page' && project.homepage !== file.id) {
          url = `${url}#/page/${file.id}`;
        }
        window.open(url, 'VTJProject');
      }
    }
  });

  widgetManager.set('Previewer', {
    props: {
      path: (block: any) => {
        const pathname = location.pathname;
        return `${pathname}#/preview/${block.id}`;
      }
    }
  });

  const engine = new Engine({
    container,
    service
  });

  engine.ready(() => {
    engine.openFile(route.query.id as string);
  });

  watch(
    () => route.query.id,
    (id) => {
      engine.openFile(id as string);
    }
  );
</script>
<style lang="scss" scoped>
  .designer {
    width: 100%;
    height: 100%;
  }
</style>
