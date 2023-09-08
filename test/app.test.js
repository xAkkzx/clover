
const app = require('../app')
const request = require('supertest')
const assert = require('assert')

describe('Simple test', () => {
    it('GET works with 200', async () => {
         // arrange
         const url = '/'
         // act
         const res = await request(app).get(url).send()
         // assert
         assert.strictEqual(res.status, 200)
    })

    it('GET api/search works with 200', async () => {
        // arrange
        const url = '/api/search'
        // act
        const res = await request(app).get(url).send()
        // assert
        assert.strictEqual(res.status, 200)
   })
})