type HttpClientVerb = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export default class HttpClient {
   private baseUrl: string;

   constructor(baseUrl: string) {
      this.baseUrl = baseUrl;
   }

   private getOptions (verb: HttpClientVerb, body?: unknown): RequestInit {
      return {
         method: verb,
         headers: {
            'Content-Type': 'application/json',
            'Acept': 'application/json'
         },
         body: body ? JSON.stringify(body) : null,
      }
   }

   async get(path: string) {
      return fetch(`${this.baseUrl}/${path}`, this.getOptions('GET'));
   }
   async post(path: string, body: unknown) {
      return fetch(`${this.baseUrl}/${path}`, this.getOptions('POST', body));
   }
   async put(path: string, body: unknown) {
      return fetch(`${this.baseUrl}/${path}`, this.getOptions('PUT', body));
   }
   async delete(path: string) {
      return fetch(`${this.baseUrl}/${path}`, this.getOptions('DELETE'));
   }

}