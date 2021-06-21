import {
  BlendType,
  IAnimateOption,
  IAttribute,
  IBlendOptions,
  ICameraService,
  IElements,
  IFontService,
  IGlobalConfigService,
  IIconService,
  ILayer,
  ILayerConfig,
  ILayerModel,
  ILayerService,
  IMapService,
  IModel,
  IModelUniform,
  IRendererService,
  IShaderModuleService,
  IStyleAttributeService,
  ITexture2D,
  ITexture2DInitializationOptions,
  lazyInject,
  Triangulation,
  TYPES,
} from '@antv/l7-core';
import { BlendTypes } from '../utils/blend';
import { getSize } from '../utils/dataMappingStyle';

interface IDataLayout {
  widthCount: number;
  heightCount: number;
  widthStep: number;
  widthStart: number;
  heightStep: number;
  heightStart: number;
}
export default class BaseModel<ChildLayerStyleOptions = {}>
  implements ILayerModel {
  public triangulation: Triangulation;

  // style texture data mapping
  public createTexture2D: (
    options: ITexture2DInitializationOptions,
  ) => ITexture2D;
  public dataLayout: IDataLayout = {
    // 默认值
    widthCount: 1024,
    heightCount: 1,
    widthStep: 1 / 1024,
    widthStart: 1 / 2048,
    heightStep: 1,
    heightStart: 0.5,
  };

  protected layer: ILayer;

  @lazyInject(TYPES.IGlobalConfigService)
  protected readonly configService: IGlobalConfigService;

  // @lazyInject(TYPES.IIconService)
  // protected readonly iconService: IIconService;

  // @lazyInject(TYPES.IFontService)
  // protected readonly fontService: IFontService;

  @lazyInject(TYPES.IShaderModuleService)
  protected readonly shaderModuleService: IShaderModuleService;

  protected rendererService: IRendererService;
  protected iconService: IIconService;
  protected fontService: IFontService;
  protected styleAttributeService: IStyleAttributeService;
  protected mapService: IMapService;
  protected cameraService: ICameraService;
  protected layerService: ILayerService;

  protected opacityTexture: ITexture2D;
  protected strokeOpacityTexture: ITexture2D;
  protected strokeTexture: ITexture2D;
  protected strokeWidthTexture: ITexture2D;
  // style texture data mapping

  constructor(layer: ILayer) {
    this.layer = layer;
    this.rendererService = layer
      .getContainer()
      .get<IRendererService>(TYPES.IRendererService);
    this.styleAttributeService = layer
      .getContainer()
      .get<IStyleAttributeService>(TYPES.IStyleAttributeService);
    this.mapService = layer.getContainer().get<IMapService>(TYPES.IMapService);
    this.iconService = layer
      .getContainer()
      .get<IIconService>(TYPES.IIconService);
    this.fontService = layer
      .getContainer()
      .get<IFontService>(TYPES.IFontService);
    this.cameraService = layer
      .getContainer()
      .get<ICameraService>(TYPES.ICameraService);
    this.layerService = layer
      .getContainer()
      .get<ILayerService>(TYPES.ILayerService);

    // 注册 Attribute
    this.registerBuiltinAttributes();
    // 开启动画
    this.startModelAnimate();

    const { createTexture2D } = this.rendererService;
    this.createTexture2D = createTexture2D;
    // 根据数据长度构建样式数据映射到纹理上时需要到布局数值 为纹理贴图映射样式数据做准备工作
    this.initEncodeDataLayout(this.layer.getEncodedData().length);
  }

  /**
   * 根据数据长度构建样式数据映射到纹理上时需要到布局数值
   * @param dataLength
   */
  public initEncodeDataLayout(dataLength: number) {
    const { width: widthCount, height: heightCount } = getSize(dataLength);
    this.dataLayout.widthCount = widthCount;
    this.dataLayout.heightCount = heightCount;

    this.dataLayout.widthStep = 1 / widthCount;
    this.dataLayout.widthStart = this.dataLayout.widthStep / 2;
    this.dataLayout.heightStep = 1 / heightCount;
    this.dataLayout.heightStart = this.dataLayout.heightStep / 2;
  }

  public getBlend(): IBlendOptions {
    const { blend = 'normal' } = this.layer.getLayerConfig();
    return BlendTypes[BlendType[blend]] as IBlendOptions;
  }
  public getDefaultStyle(): unknown {
    return {};
  }
  public getUninforms(): IModelUniform {
    throw new Error('Method not implemented.');
  }

  public getAnimateUniforms(): IModelUniform {
    return {};
  }

  public needUpdate(): boolean {
    return false;
  }
  public buildModels(): IModel[] {
    throw new Error('Method not implemented.');
  }
  public initModels(): IModel[] {
    throw new Error('Method not implemented.');
  }
  public clearModels() {
    return;
  }
  public getAttribute(): {
    attributes: {
      [attributeName: string]: IAttribute;
    };
    elements: IElements;
  } {
    throw new Error('Method not implemented.');
  }
  public render() {
    throw new Error('Method not implemented.');
  }
  protected registerBuiltinAttributes() {
    throw new Error('Method not implemented.');
  }
  protected animateOption2Array(option: IAnimateOption): number[] {
    return [
      option.enable ? 0 : 1.0,
      option.duration || 4.0,
      option.interval || 0.2,
      option.trailLength || 0.1,
    ];
  }
  protected startModelAnimate() {
    const { animateOption } = this.layer.getLayerConfig() as ILayerConfig;
    if (animateOption.enable) {
      this.layer.setAnimateStartTime();
    }
  }
}
