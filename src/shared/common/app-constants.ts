import type { AppThemeState } from 'bilitoolkit-api-types';

/**
 * 应用常量
 */
export const AppConstants = {
  // 主题相关
  THEME: {
    // 默认备选的主题色
    DEFAULT_PRIMARY_COLORS: [
      '#6284DF',
      '#474747',
      '#B04040',
      '#F7A456',
      '#D39C1F',
      '#079307',
      '#21AB86',
      '#00AEEC',
      '#FB7299',
    ],
    // 默认的主题色下标
    DEFAULT_PRIMARY_COLOR_INDEX: 0,
  },
}

/**
 * 默认的应用主题状态
 */
export const defaultAppThemeState: AppThemeState = {
  currPrimaryColorIndex: AppConstants.THEME.DEFAULT_PRIMARY_COLOR_INDEX,
  primaryColor: AppConstants.THEME.DEFAULT_PRIMARY_COLORS[AppConstants.THEME.DEFAULT_PRIMARY_COLOR_INDEX],
  themeMode: 'light',
  bgMode: 'default',
  dark: false,
}
