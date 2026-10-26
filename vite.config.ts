import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

import aitDevtools from "@apps-in-toss/devtools/unplugin";

// https://vite.dev/config/
export default defineConfig({
  plugins: [aitDevtools.vite(), react()],
  // localhost가 IPv6(::1)로만 열려 127.0.0.1로 접속이 안 되는 문제를 막고, 같은 와이파이의 폰에서도 열 수 있게 한다
  server: {
    host: true,
  },
})
