<template>
  <ElForm
    ref="formRef"
    class="x-form"
    :inline="props.inline"
    :model="model"
    @keyup.enter="submit"
    @submit.stop.prevent
    v-bind="$attrs">
    <slot></slot>
    <XField v-if="props.footer" editor="none" class="x-form__footer" label=" ">
      <template #editor>
        <slot name="footer">
          <ElButton
            v-if="props.submitText"
            :loading="loading"
            type="primary"
            @click="submit">
            {{ props.submitText }}
          </ElButton>
          <ElButton
            v-if="props.resetText"
            type="default"
            @click="() => reset()">
            {{ props.resetText }}
          </ElButton>
          <slot name="action"></slot>
        </slot>
      </template>
    </XField>
  </ElForm>
</template>
<script lang="ts" setup>
  import {
    provide,
    getCurrentInstance,
    watch,
    ref,
    reactive,
    toRaw
  } from 'vue';
  import { ElForm, ElButton } from 'element-plus';
  import {
    formProps,
    formInstanceKey,
    type FormEmits,
    type FormModel,
    formModelKey
  } from './types';
  import { XField } from '../../';

  defineOptions({
    name: 'XForm'
  });

  const props = defineProps(formProps);
  const emit = defineEmits<FormEmits>();
  const instance = getCurrentInstance();
  const formRef = ref();
  const model = reactive<FormModel>(props.model || {});
  const loading = ref(false);

  provide(formInstanceKey, instance);
  provide(formModelKey, model);

  watch(model, () => {
    emit('change', toRaw(model));
  });

  watch(
    () => props.model,
    (v) => {
      Object.assign(model, v);
    },
    { deep: true }
  );

  const submit = async () => {
    const ret = await formRef.value.validate().catch(() => false);
    if (ret) {
      emit('submit', toRaw(model));
      if (props.submitMethod) {
        loading.value = true;
        await props.submitMethod(toRaw(model));
        loading.value = false;
      }
    }
  };

  const reset = (fields?: string[] | string) => {
    formRef.value.resetFields(fields);
    emit('reset');
  };

  defineExpose({
    formRef,
    model,
    submit,
    reset
  });
</script>
