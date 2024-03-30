import {
  createApp,
  onMounted,
  onUnmounted,
  unref,
  inject,
  shallowReactive,
  ref,
  nextTick,
  triggerRef,
  type ShallowReactive,
  type InjectionKey,
  type MaybeRef,
  type App,
  type Ref
} from 'vue';
import {
  Base,
  ProjectModel,
  BlockModel,
  HistoryModel,
  emitter,
  EVENT_BLOCK_CHANGE,
  EVENT_NODE_CHANGE,
  EVENT_PROJECT_BLOCKS_CHANGE,
  EVENT_PROJECT_PAGES_CHANGE,
  EVENT_PROJECT_DEPS_CHANGE,
  EVENT_PROJECT_CHANGE,
  EVENT_PROJECT_ACTIVED,
  EVENT_PROJECT_PUBLISH,
  EVENT_PROJECT_FILE_PUBLISH,
  EVENT_HISTORY_CHANGE,
  EVENT_HISTORY_LOAD,
  // EVENT_PROJECT_APIS_CHANGE,
  type Service,
  type Emitter,
  type ProjectSchema,
  type BlockFile,
  type ProjectModelEvent,
  type PageFile,
  type HistoryItem,
  type HistoryModelEvent
} from '@vtj/core';
import {
  type Context,
  ContextMode,
  Provider,
  type ProvideAdapter
} from '@vtj/renderer';
import { logger } from '@vtj/utils';
import { SkeletonWrapper, type SkeletonWrapperInstance } from '../wrappers';
import { depsManager } from '../managers';
import { Simulator } from './simulator';
import { Assets } from './assets';
import { message } from '../utils';

export const engineKey: InjectionKey<ShallowReactive<Engine>> =
  Symbol('VtjEngine');

export interface EngineOptions {
  container: MaybeRef<HTMLElement | undefined>;
  service: Service;
  project?: Partial<ProjectSchema>;
  dependencies?: Record<string, () => Promise<any>>;
  materials?: Record<string, () => Promise<any>>;
  materialPath?: string;
  globals?: Record<string, any>;
  adapter?: ProvideAdapter;
}

export class Engine extends Base {
  public app?: App;
  public skeleton?: SkeletonWrapperInstance | null;
  public container: MaybeRef<HTMLElement | undefined>;
  public service: Service;
  public assets: Assets;
  public simulator: Simulator;
  public emitter: Emitter = emitter;
  public project: Ref<ProjectModel | null> = ref(null);
  public current: Ref<BlockModel | null> = ref(null);
  public context: Ref<Context | null> = ref(null);
  public isEmptyCurrent: Ref<boolean> = ref(false);
  public history: Ref<HistoryModel | null> = ref(null);
  public provider: Provider;
  /**
   * 当current变化时，更新该值，用于通知组件更新
   */
  public changed: Ref<symbol> = ref(Symbol());
  constructor(options: EngineOptions) {
    super();
    const {
      container,
      service,
      project = {},
      globals = {},
      dependencies,
      materials,
      materialPath = './'
    } = options;
    this.container = container;
    this.service = service;
    this.provider = new Provider({
      mode: ContextMode.Design,
      globals,
      project,
      service,
      dependencies,
      materials,
      materialPath
    });
    this.assets = new Assets(this.service);
    this.simulator = new Simulator({
      engine: this,
      materialPath
    });

    this.bindEvents();
    this.init(project as ProjectSchema);
    onMounted(this.render.bind(this));
    onUnmounted(this.dispose.bind(this));
  }
  private async init(project: ProjectSchema) {
    const dsl = await this.service.init(project).catch((e) => {
      logger.warn('VTJEngine service init fail.', e);
      return null;
    });
    if (dsl) {
      dsl.dependencies = depsManager.merge(dsl.dependencies || []);
      this.project.value = new ProjectModel(dsl);
      this.saveMaterials();
      this.triggerReady();
    }
  }
  private render() {
    const container = unref(this.container);
    if (container) {
      const app = createApp(SkeletonWrapper);
      app.provide(engineKey, shallowReactive(this));
      app.mount(container);
      this.app = app;
    } else {
      logger.warn('VTJEngine constructor param [ container ] is undefined');
    }
  }

  private bindEvents() {
    emitter.on(EVENT_PROJECT_CHANGE, (e) => this.saveProject(e));
    emitter.on(EVENT_PROJECT_BLOCKS_CHANGE, (e) => this.saveBlockFile(e));
    emitter.on(EVENT_PROJECT_PAGES_CHANGE, (e) => this.saveBlockFile(e));
    emitter.on(EVENT_PROJECT_DEPS_CHANGE, () => this.saveMaterials());
    emitter.on(EVENT_PROJECT_ACTIVED, (e) => this.activeFile(e));
    emitter.on(EVENT_PROJECT_PUBLISH, () => this.publish());
    emitter.on(EVENT_PROJECT_FILE_PUBLISH, () => this.publishCurrent());
    emitter.on(EVENT_BLOCK_CHANGE, (e) => this.changeFile(e));
    emitter.on(EVENT_NODE_CHANGE, () => this.changeCurrentFile());
    emitter.on(EVENT_HISTORY_CHANGE, (e) => this.saveHistory(e));
    emitter.on(EVENT_HISTORY_LOAD, (e) => this.loadHistory(e));
  }

  private async activeFile(e: ProjectModelEvent) {
    await nextTick();
    const project = e.model;
    const file = e.model.currentFile;
    if (file) {
      if (project.isPageFile(file) && !!file.raw) {
        return;
      }
      const dsl = await this.service.getFile(file.id);
      if (dsl) {
        file.dsl = dsl;
      }
    }

    if (file?.dsl) {
      const block = new BlockModel(file.dsl);
      this.updateCurrent(block);
      this.initHistory(block);
    } else {
      this.updateCurrent(null);
    }
    triggerRef(this.project);
  }

  private async changeFile(e: BlockModel) {
    await nextTick();
    const dsl = e.toDsl();
    this.service.saveFile(dsl);
    this.updateCurrent(e);
    this.history.value?.add(dsl);
    triggerRef(this.history);
  }

  private changeCurrentFile() {
    this.saveCurrentFile();
    if (this.current.value) {
      this.history.value?.add(this.current.value.toDsl());
      triggerRef(this.history);
    }
  }

  private async updateCurrent(
    block: BlockModel | null,
    isTrigger: boolean = true
  ) {
    this.current.value = block;
    await nextTick();
    this.context.value = this.simulator.renderer?.context || null;
    this.isEmptyCurrent.value = this.current.value?.nodes.length === 0;
    this.changed.value = Symbol();
    if (isTrigger) {
      triggerRef(this.context);
    }
  }

  private async saveProject(e: ProjectModelEvent) {
    const project = e.model;
    const dsl = project.toDsl();
    await this.service.saveProject(dsl);
    triggerRef(this.project);
  }

  private async saveBlockFile(e: ProjectModelEvent) {
    const type = e.type;
    const project = e.model;
    if (type === 'create') {
      const file = e.data as BlockFile | PageFile;
      if (project.isPageFile(file) && !!file.raw) {
        await this.service.createRawPage(file);
        message(`源码文件已经生成：/.vtj/vue/${file.id}.vue`, 'success');
      } else {
        file.dsl && (await this.service.saveFile(file.dsl));
      }
    }

    if (type === 'update') {
      const file = e.data as BlockFile | PageFile;
      if (project.isPageFile(file) && (file.dir || file.raw)) {
        return;
      }
      const dsl = await this.service.getFile(file.id);
      if (dsl) {
        dsl.name = file.name;
        await this.service.saveFile(dsl);
      }
    }

    if (type === 'delete') {
      const file = e.data as BlockFile | PageFile;
      if (file && project.isPageFile(file) && !!file.raw) {
        await this.service.removeRawPage(file.id);
      } else {
        if (!(file as PageFile).dir) {
          await this.service.removeFile(file.id);
          await this.service.removeHistory(file.id);
        }
      }
    }

    if (type === 'clone') {
      const { page, newPage } = e.data;
      const dsl = await this.service.getFile(page.id);
      if (dsl) {
        dsl.id = newPage.id;
        dsl.name = newPage.name;
        await this.service.saveFile(dsl);
      }
    }
    triggerRef(this.project);
  }

  private async saveMaterials() {
    await nextTick();
    this.simulator.ready(() => {
      const project = this.project.value;
      if (project) {
        // this.assets.load([]);
        const map = this.assets.componentMap;
        this.service.saveMaterials(project.toDsl(), map);
      }
    });
  }

  private saveCurrentFile() {
    const current = this.current.value;
    if (current) {
      this.updateCurrent(current);
      this.service.saveFile(current.toDsl());
    }
  }

  private async initHistory(block: BlockModel | null) {
    if (block) {
      const dsl = await this.service.getHistory(block.id).catch(() => null);
      this.history.value = new HistoryModel(
        Object.assign(dsl || {}, { id: block.id })
      );
    } else {
      this.history.value = null;
    }
  }

  private async saveHistory(e: HistoryModelEvent) {
    const type = e.type;
    const history = e.model;
    if (type === 'create') {
      await this.service.saveHistoryItem(history.id as string, e.data);
    }
    if (type === 'delete') {
      await this.service.removeHistoryItem(
        history.id as string,
        e.data as string[]
      );
    }

    if (type === 'clear') {
      await this.service.removeHistoryItem(history.id as string, e.data);
    }

    const dsl = history.toDsl();
    await this.service.saveHistory(dsl);
    triggerRef(this.history);
  }

  private async loadHistory(e: HistoryModelEvent) {
    const history = e.model;
    const data = e.data as HistoryItem;
    const item = await this.service.getHistoryItem(history.id, data.id);
    if (item && item.dsl) {
      const block = new BlockModel(item.dsl);
      await this.updateCurrent(block);
      triggerRef(this.history);
    }
  }

  private async publish() {
    const project = this.project.value;
    if (project) {
      const dsl = {
        ...project.toDsl(),
        pages: project.getPages()
      };
      const ret = await this.service.publish(dsl);
      if (ret) {
        message('整站发布成功', 'success');
      }
    }
  }

  private async publishCurrent() {
    const project = this.project.value;
    const current = project?.currentFile;
    if (project && current) {
      const dsl = {
        ...project.toDsl(),
        pages: project.getPages()
      };
      const ret = await this.service.publishFile(dsl, current);
      if (ret) {
        message('发布成功', 'success');
      }
    }
  }

  dispose() {
    this.emitter.all.clear();
    this.simulator.dispose();
    if (this.app) {
      this.app.unmount();
      this.container = undefined;
    }
  }

  async openFile(fileId?: string) {
    const project = this.project.value;
    const apps = this.skeleton?.getRegion('Apps');
    const id = fileId || project?.homepage;
    if (!project || !apps || !id) return;

    const page = project.getPage(id);
    if (page && !page.raw) {
      apps.regionRef?.setActive('Pages');
      this.simulator.ready(() => {
        project.active(page);
      });
    }

    const block = project.getBlock(id);
    if (block) {
      apps.regionRef?.setActive('Blocks');
      this.simulator?.ready(() => {
        project.active(block);
      });
    }
  }
}

export function useEngine() {
  const engine = inject(engineKey, null);
  if (!engine) {
    logger.error('VTJEngine is not exist');
  }
  return engine as ShallowReactive<Engine>;
}
