import * as lib from '../index'

describe('lib external API', () => {
    it('should expose the request and set methods', () => {
        expect(lib.api.request).toBeDefined()
        expect(lib.api.set).toBeDefined()
    })
})
