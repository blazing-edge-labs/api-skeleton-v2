const joi = require('joi')
const router = new (require('koa-router'))()

const consts = require('const')
const auth = require('middleware/auth')
const roleUser = require('middleware/roleUser')
const responder = require('middleware/responder')
const validate = require('middleware/validate')
const adminRepo = require('repo/superadmin')
const resources = adminRepo.resourceList

router.use(responder)
router.use(auth)
router.use(roleUser.gte(consts.roleUser.superadmin))

resources.forEach(resource => {
  router.get(`/${resource}/many`, validate('query', {
    ids: joi.array().items(joi.number().integer()),
  }), async (ctx) => {
    const {ids} = ctx.v.query
    ctx.state.r = await adminRepo[resource].getMany(ids)
  })

  router.get(`/${resource}`, validate('query', {
    sort: joi.array().items(joi.string()).length(2),
    page: joi.number(),
    perPage: joi.number(),
    filter: joi.object(),
  }), async function (ctx) {
    const {query} = ctx.v
    const count = await adminRepo[resource].getAllCount()
    ctx.state.r = {
      items: await adminRepo[resource].getAll(query),
      count: count[0].total,
    }
  })

  router.get(`/${resource}/:id`, validate('param', {
    id: joi.number().integer().positive().required(),
  }), async function (ctx) {
    const {id} = ctx.v.param
    ctx.state.r = await adminRepo[resource].getById(id)
  })

  router.put(`/${resource}/:id`, validate('param', {
    id: joi.number().integer().positive().required(),
  }), async function (ctx) {
    const {id} = ctx.v.param
    ctx.state.r = await adminRepo[resource].update(id, ctx.request.body)
  })

  router.post(`/${resource}`, async (ctx) => {
    ctx.state.r = await adminRepo[resource].create(ctx.request.body)
  })

  router.del(`/${resource}/:id`, validate('param', {
    id: joi.number().integer().positive().required(),
  }), async function (ctx) {
    const {id} = ctx.v.param
    await adminRepo[resource].remove(id)
    ctx.state.r = {}
  })
})

module.exports = router
