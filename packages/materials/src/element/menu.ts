import type { MaterialDescription } from '@vtj/core';
const Menu: MaterialDescription[] = [
  {
    name: 'ElMenu',
    label: '导航菜单',

    doc: 'https://element-plus.org/zh-CN/component/menu.html',
    categoryId: 'nav',
    package: 'element-plus',
    props: [
      {
        name: 'mode',
        defaultValue: 'vertical',
        setters: 'SelectSetter',
        options: ['horizontal', 'vertical']
      },
      {
        name: 'collapse',
        defaultValue: false,
        setters: 'BooleanSetter'
      },
      {
        name: 'ellipsis',
        defaultValue: true,
        setters: 'BooleanSetter'
      },
      {
        name: 'backgroundColor',
        defaultValue: '#ffffff',
        setters: 'ColorSetter'
      },
      {
        name: 'textColor',
        defaultValue: '#303133',
        setters: 'ColorSetter'
      },
      {
        name: 'activeTextColor',
        defaultValue: '#409EFF',
        setters: 'ColorSetter'
      },
      {
        name: 'defaultActive',
        defaultValue: '',
        setters: 'InputSetter'
      },
      {
        name: 'defaultOpeneds',
        defaultValue: '',
        setters: 'JSONSetter'
      },
      {
        name: 'uniqueOpened',
        defaultValue: false,
        setters: 'BooleanSetter'
      },
      {
        name: 'menuTrigger',
        defaultValue: 'hover',
        setters: 'SelectSetter',
        options: ['hover', 'click']
      },
      {
        name: 'router',
        defaultValue: false,
        setters: 'BooleanSetter'
      },
      {
        name: 'collapseTransition',
        defaultValue: true,
        setters: 'BooleanSetter'
      }
    ],
    events: [
      {
        name: 'select'
      },
      {
        name: 'open'
      },
      {
        name: 'close'
      }
    ],
    snippet: {
      props: {
        mode: 'horizontal'
      },
      children: [
        {
          name: 'ElMenuItem',
          children: '菜单项一',
          props: {
            index: '1'
          }
        },
        {
          name: 'ElSubMenu',
          props: {
            index: '2'
          },
          children: [
            {
              name: 'component',
              slot: 'title',
              props: {
                is: 'div'
              },
              children: '子菜单'
            },
            {
              name: 'ElMenuItem',
              children: '子菜单项一',
              props: {
                index: '2-1'
              }
            },
            {
              name: 'ElMenuItem',
              children: '子菜单项二',
              props: {
                index: '2-2'
              }
            }
          ]
        },
        {
          name: 'ElMenuItem',
          children: '菜单项三',
          props: {
            index: '3'
          }
        }
      ]
    }
  },
  {
    name: 'ElSubMenu',
    label: '导航子菜单',

    categoryId: 'nav',
    package: 'element-plus',
    props: [
      {
        name: 'index',
        defaultValue: '',
        setters: 'InputSetter'
      },
      {
        name: 'popperClass',
        defaultValue: '',
        setters: 'InputSetter'
      },
      {
        name: 'showTimeout',
        defaultValue: 300,
        setters: 'NumberSetter'
      },
      {
        name: 'hideTimeout',
        defaultValue: 300,
        setters: 'NumberSetter'
      },
      {
        name: 'disabled',
        defaultValue: false,
        setters: 'BooleanSetter'
      },
      {
        name: 'popperOffset',
        defaultValue: 6,
        setters: 'NumberSetter'
      },
      {
        name: 'expandCloseIcon',
        defaultValue: '',
        setters: ['InputSetter']
      },
      {
        name: 'expandOpenIcon',
        defaultValue: '',
        setters: ['InputSetter']
      },
      {
        name: 'collapseCloseIcon',
        defaultValue: '',
        setters: ['InputSetter']
      },
      {
        name: 'collapseOpenIcon',
        defaultValue: '',
        setters: ['InputSetter']
      }
    ],
    slots: [
      {
        name: 'default'
      },
      {
        name: 'title'
      }
    ],
    snippet: {
      children: [
        {
          name: 'component',
          slot: 'title',
          props: {
            is: 'div'
          },
          children: '子菜单'
        },
        {
          name: 'ElMenuItem',
          children: '子菜单项一'
        }
      ]
    }
  },
  {
    name: 'ElMenuItem',
    label: '导航菜单项',

    categoryId: 'nav',
    package: 'element-plus',
    props: [
      {
        name: 'index',
        defaultValue: null,
        setters: 'InputSetter'
      },
      {
        name: 'route',
        defaultValue: '',
        setters: 'JSONSetter'
      },
      {
        name: 'disabled',
        defaultValue: false,
        setters: 'BooleanSetter'
      }
    ],
    events: [
      {
        name: 'click'
      }
    ],
    slots: [
      {
        name: 'default'
      },
      {
        name: 'title'
      }
    ],
    snippet: {
      children: '菜单项'
    }
  },
  {
    name: 'ElMenuItemGroup',
    label: '导航菜单组',

    categoryId: 'nav',
    package: 'element-plus',
    props: [
      {
        name: 'title',
        defaultValue: '',
        setters: 'InputSetter'
      }
    ],
    slots: [
      {
        name: 'default'
      },
      {
        name: 'title'
      }
    ],
    snippet: {
      props: {
        title: '分组一'
      },
      children: [
        {
          name: 'ElMenuItem',
          children: '子菜单项一'
        },
        {
          name: 'ElMenuItem',
          children: '子菜单项一'
        }
      ]
    }
  }
];

export default Menu;
