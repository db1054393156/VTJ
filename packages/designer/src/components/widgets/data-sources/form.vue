<template>
  <XDialogForm
    width="1000px"
    height="600px"
    :title="title"
    :model="model"
    :form-props="{ tooltipMessage: false }"
    :submit-method="submit">
    <XField
      name="ref"
      label="引用API"
      editor="select"
      required
      :disabled="!!props.item"
      :options="apiOptions"
      :props="{ filterable: true }"
      @change="onRefChange">
      <template #option="{ option }">
        {{ option.data.label }}
        <i>[ {{ option.data.name }} ]</i>
      </template>
    </XField>
    <XField
      name="name"
      label="调用名称"
      required
      tip="名称为英文驼峰格式"
      :disabled="!!props.item"
      :rules="{
        message: '名称格式错误',
        pattern: NAME_REGEX
      }"></XField>
    <XField name="label" label="备注说明" required></XField>
    <XField name="transform.value" label="转换函数" editor="none">
      <Editor
        v-model="(model.transform as JSFunction).value"
        height="200px"
        dark></Editor>
    </XField>
    <XField name="test.value" label="测试用例" editor="none">
      <Editor
        v-model="(model.test as JSFunction).value"
        height="100px"
        dark></Editor>
    </XField>
    <template #extra>
      <ElButton :loading="loading" type="warning" @click="runTest">
        运行测试用例
      </ElButton>
    </template>
    <ElDrawer
      v-if="showResult"
      class="v-drawer"
      v-model="showResult"
      title="测试用例运行结果"
      direction="btt"
      append-to-body
      size="80%">
      <Editor
        :model-value="runResult"
        border
        dark
        height="100%"
        lang="json"></Editor>
    </ElDrawer>
  </XDialogForm>
</template>
<script lang="ts" setup>
  import { computed, ref } from 'vue';
  import { XDialogForm, XField } from '@vtj/ui';
  import { ElButton, ElDrawer } from 'element-plus';
  import {
    type DataSourceSchema,
    BlockModel,
    type JSFunction
  } from '@vtj/core';
  import { type Context, parseExpression } from '@vtj/renderer';
  import { logger } from '@vtj/utils';
  import Editor from '../../editor';
  import { NAME_REGEX } from '../../../constants';
  import { expressionValidate, notify } from '../../../utils';
  import { useDataSources } from '../../hooks';

  export interface Props {
    context: Context | null;
    current: BlockModel | null;
    item?: DataSourceSchema;
  }

  defineOptions({
    name: 'DataSourceDialogForm'
  });

  const props = defineProps<Props>();
  const { apis } = useDataSources();

  const createEmtpyModel = () => {
    return {
      type: 'api',
      ref: '',
      name: '',
      label: '',
      transform: {
        type: 'JSFunction',
        value: `(res) => {
    /* 在这里可对接口返回数据进行转换  */
    return res;
}`
      },
      test: {
        type: 'JSFunction',
        value: `() => this.runApi({
    /* 在这里可输入接口参数  */
})`
      }
    } as DataSourceSchema;
  };

  const model = ref<DataSourceSchema>(
    Object.assign(createEmtpyModel(), props.item)
  );
  const loading = ref(false);
  const runResult = ref('');
  const showResult = ref(false);

  const apiOptions = computed(() => {
    return apis.value.map((api) => {
      return {
        label: api.label || '',
        value: api.id,
        data: api
      };
    });
  });

  const title = computed(() => (props.item ? '编辑数据源' : '新增数据源'));

  const onRefChange = (val: string) => {
    const api = apis.value.find((api) => api.id === val);
    if (api) {
      model.value.name = api.name;
      model.value.label = api.label || '';
    }
  };

  const submit = async (data: any) => {
    const { transform, test, name } = data;
    if (!props.current) return false;
    if (!props.item && props.current.dataSources[name]) {
      notify(`名称【${name}】已经存在，请更换名称`);
      return false;
    }

    if (transform?.value) {
      const ret = expressionValidate(transform, props.context, true);
      if (!ret) {
        return false;
      }
    } else {
      data.transform = undefined;
    }
    if (test?.value) {
      const ret = expressionValidate(test, props.context, true);
      if (!ret) {
        return false;
      }
    } else {
      data.test = undefined;
    }

    props.current?.setDataSource(data);
    return true;
  };

  const runTest = async () => {
    if (!props.context) return;

    if (!model.value.ref) {
      notify('请先选择API');
      return;
    }

    if (!model.value.test?.value) {
      notify('请先填写测试用例');
      return;
    }
    const ret = expressionValidate(model.value.test, props.context, true);
    if (!ret) {
      return;
    }

    const runApi = async (...args: any[]) => {
      const api = props.context?.$apis[model.value.ref];
      if (api) {
        return await api.apply(api, args);
      } else {
        logger.warn(`API【${model.value.ref}】不存在`);
      }
    };

    const run = parseExpression(model.value.test, {
      runApi
    });

    const transform = model.value.transform?.value
      ? parseExpression(model.value.transform, {}, true)
      : (v: any) => v;

    loading.value = true;
    try {
      const result = await run();
      runResult.value = JSON.stringify(await transform(result), null, 2);
    } catch (e) {
      logger.error(e);
    }
    loading.value = false;
    showResult.value = true;
  };
</script>
