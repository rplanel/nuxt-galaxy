import { createError } from 'h3'
import type { Client } from './client'

export class Histories {

    #client: Client

    constructor(client: Client) {
        this.#client = client
    }
    public async createHistory(name: string) {
        try {
            const galaxyHistory = await this.#client.api<{ id: string }>()(
                "api/histories",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: `name=${name}`,
                });
            return galaxyHistory;
        } catch (error) {
            console.log(error)
            throw createError({
                statusCode: 500,
                // statusMessage: getErrorMessage(error),
            });
        }
    }

    public async deleteHistory(historyId: string) {
        try {
            const galaxyHistory = await this.#client.api<{ id: string }>()(`api/histories/${historyId}`, {
                method: "DELETE",
                body: { purge: true },
            });
            return galaxyHistory;
        } catch (error) {
            throw createError({
                statusCode: 500,
                // statusMessage: getErrorMessage(error),
            });
        }
    }
}