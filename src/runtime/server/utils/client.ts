import { Histories } from "./histories"
import { $fetch } from 'ofetch';
import type { NitroFetchRequest, $Fetch } from 'nitropack'



export class Client {
  #apiKey: string
  url: string
  api: <T>() => $Fetch<T, NitroFetchRequest>

  constructor(apiKey: string, url: string) {
    this.#apiKey = apiKey
    this.url = url
    console.log(this.#apiKey)
    const fetch = $fetch.create({
      baseURL: this.url, headers: {
        "x-api-key": this.#apiKey,
        "accept": "application/json",
        "Content-Type": "application/json",
      }
    })
    this.api = <T>() => {
      return fetch as $Fetch<T, NitroFetchRequest>
    }
  }

  histories() {
    return new Histories(this)
  }
  

}
