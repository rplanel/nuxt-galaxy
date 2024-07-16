import { eventHandler, readBody } from 'h3'
import { Client } from '../utils/client'
import { useRuntimeConfig } from '#imports'

export default eventHandler(async (event) => {
    const body = await readBody(event);
    const { public: { galaxy: { url } }, galaxy: { apiKey } } = useRuntimeConfig()
    const client = new Client(apiKey, url)
    client.histories().createHistory(body.name)
})