//native svg handling (so react knows to read .svg files as components)
declare module "*.svg" {
  import * as React from "react";
  import { SvgProps } from "react-native-svg";
  const content: React.FC<SvgProps>;
  export default content;
}

declare module 'react-native-masonry-list' {
  import { ComponentType } from 'react';
  import { FlatListProps, ImageSourcePropType, ViewStyle } from 'react-native';

  export interface MasonryListItem {
    id?: string | number;
    source: ImageSourcePropType;
    [key: string]: any;
  }

  export interface MasonryListProps<T = MasonryListItem> extends Partial<FlatListProps<T>> {
    images: T[];
    columns?: number;
    spacing?: number;
    imageContainerStyle?: ViewStyle;
    onPressImage?: (item: T) => void;
    customImageComponent?: ComponentType<any>;
    customImageProps?: object;
  }

  const MasonryList: ComponentType<MasonryListProps>;
  export default MasonryList;
}
