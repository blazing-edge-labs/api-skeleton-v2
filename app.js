const app = new (require('koa'))()
const router = new (require('koa-router'))()

app.silent = process.env.LOG < 3
app.use(require('koa-response-time')())
app.use(require('koa-conditional-get')())
app.use(require('koa-etag')())
app.use(require('koa-helmet')())
app.use(require('kcors')())
app.use(require('koa-bodyparser')())
app.use(require('middleware/error'))

router.use(require('route/index').routes())
router.use(require('route/user').routes())
router.use('/admin', require('route/superadmin').routes())

app.use(router.routes())

app.use(async function (ctx, next) {
  ctx.throw(404)
  await next()
})

module.exports = app
