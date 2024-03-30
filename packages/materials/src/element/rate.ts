import type { MaterialDescription } from '@vtj/core';
const Rate: MaterialDescription = {
  name: 'ElRate',
  label: '评分',

  childIncludes: false,
  categoryId: 'form',
  doc: 'https://element-plus.org/zh-CN/component/rate.html',
  package: 'element-plus',
  props: [
    {
      name: 'modelValue',
      defaultValue: 0,
      setters: 'NumberSetter'
    },
    {
      name: 'max',
      defaultValue: 5,
      setters: 'NumberSetter'
    },
    {
      name: 'size',
      defaultValue: 'default',
      options: ['large', 'default', 'small'],
      setters: 'SelectSetter'
    },
    {
      name: 'disabled',
      defaultValue: false,
      setters: 'BooleanSetter'
    },
    {
      name: 'allowHalf',
      defaultValue: false,
      setters: 'BooleanSetter'
    },
    {
      name: 'lowThreshold',
      defaultValue: 2,
      title: '低分和中等分数的界限值， 值本身被划分在低分中',
      label: '低分界限',
      setters: 'NumberSetter'
    },
    {
      name: 'highThreshold',
      defaultValue: 4,
      title: '高分和中等分数的界限值， 值本身被划分在高分中',
      label: '高分界限',
      setters: 'NumberSetter'
    },
    {
      name: 'colors',
      defaultValue: ['#F7BA2A', '#F7BA2A', '#F7BA2A'],
      setters: 'JSONSetter'
    },
    {
      name: 'voidColor',
      defaultValue: '#C6D1DE',
      setters: 'ColorSetter'
    },
    {
      name: 'disabledVoidColor',
      defaultValue: '#EFF2F7',
      label: 'disabledColor',
      setters: 'ColorSetter'
    },
    {
      name: 'icons',
      defaultValue: ['StarFilled', 'StarFilled', 'StarFilled'],
      setters: 'JSONSetter'
    },
    {
      name: 'voidIcon',
      defaultValue: 'Star',
      setters: 'InputSetter'
    },
    {
      name: 'disabledVoidIcon',
      defaultValue: 'StarFilled',
      label: 'disabledIcon',
      setters: 'InputSetter'
    },
    {
      name: 'showText',
      defaultValue: false,
      setters: 'BooleanSetter'
    },
    {
      name: 'showScore',
      defaultValue: false,
      setters: 'BooleanSetter'
    },
    {
      name: 'textColor',
      defaultValue: '#1F2D3D',
      setters: 'ColorSetter'
    },
    {
      name: 'texts',
      defaultValue: [
        'Extremely bad',
        'Disappointed',
        'Fair',
        'Satisfied',
        'Surprise'
      ],
      setters: 'JSONSetter'
    },
    {
      name: 'scoreTemplate',
      defaultValue: '',
      setters: 'InputSetter'
    }
  ],
  events: ['change', 'update:modelValue']
};

export default Rate;
