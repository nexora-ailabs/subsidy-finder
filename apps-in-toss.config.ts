import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'check-my-saju',
  brand: {
    primaryColor: '#FF5C8A', // 화면에 노출될 앱의 기본 색상으로 바꿔주세요.
  },
  permissions: [],
  webBundleDir: 'dist',
});
