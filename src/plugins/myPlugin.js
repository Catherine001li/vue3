export default {
    install: (app, options) => {
    console.log('oprion', options)
      app.config.globalProperties.$showPlugin = key => {
        return 'this is plugin function params: ' + key
      },
      app.mixin({
        created() {
            console.log('this is a myPlugin')
        }
      })
      console.log('app', app)
    }
}