import path from 'path'

export default {
  test: {
    globals: true,
    coverage: {
      provider: 'istanbul',
      reporter: ['html'],
      enable: true,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    },
  },
}
