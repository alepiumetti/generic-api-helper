# Generic API helper for Axios

- [Generic API helper for Axios](#generic-api-helper-for-axios)
      - [Como usar](#como-usar)
      - [Funcionamiento](#funcionamiento)




En la mayoria de los casos usamos 4 endpoints y 4 HTTP Methods para todo, `POST, GET, PUT, DELETE`. Entonces ¿Por qué deberiamos tener una función para cada caso, si la gran mayoría de los funcionamientos son iguales? De tener `putProductos, getCategorias, deletePedidos` pasamos una función para cada HTTP method que utilizamos: `httpCRUDEndpoint`, simplemente con poner `httpCRUDEndpoint('put', '/api/productos', {id: ObjectId})` hacemos lo mismo que crear una función especifica para cada endpoint.

Admite tres parametros, `method`, `url`, `data`.
```javascript
/**
 * @description Esta función es utilizada para hacer queries de manera abstracta.
 * @async
 * @param {string} method - Metodo HTTP. Case insensitive, se transforma usando toLocaleLowerCase)
 * @param {string} url - Uniform Resource Locator (URL Del endpoint)
 * @param {Object} data - Objecto a utilizar como parametro en el req.body o req.query
 */
```
## Cómo usar

Simplemente llamamos al endpoint con la URL y el método que necesitemos.Acá un ejemplo con `getProductos`.

### Ejemplos 

```javascript
const apiHelper = require("generic-api-helper"); //Importamos el apiHelper

export const getProductos = async (params) => {
  return await apiHelper.httpCRUDEndpoint("get", "/api/productos", params);
};
```
Como podemos ver, no es necesario ni siquiera envoler el helper en una función `async`. Simplemente podemos hacer en nuestro componente de React algo como:
`let data = await apiHelper.httpCRUDEndpoint("get", "/api/productos", params);`

```javascript
import httpCRUDEndpoint from "generic-api-helper"; //Importamos el apiHelper

export const getProductos = async (params) => {
  return await httpCRUDEndpoint("get", "/api/productos", params);
};

// httpCRUDEndpoint(method, url, params);


```

## Funcionamiento

**TL;DR** `httpCRUDEndpoint` es una funcion `async` que nos permite elaborar peticiónes usando una `AxiosInstance` mapeando el string pasado en `method` a unas funciones cuyo key value son del tipo `"delete": async (url, data) => {AxiosInstance.delete(...)}` en un `JSON`.

Primero armamos un mapeo de las llamadas con cada HTTP Method y lo llamamos method callers.
```javascript
const methodCallers = {
  post: async (url, data) => {
    if (data) {
      return await ajax.post(url, data);
    } else {
      return await ajax.post(url);
    }
  },
  get: async (url, data) => {...},
  put:  async (url, data) => {...},
  delete:  async (url, data) => {...},
};
```
Luego preparamos dos mockup answers, una para cuando tenemos un error de `JavaScript` y otra para cuando tenemos un error de axios o una `AxiosInstance` error (Esta parte necesita refactorizarse un poco, ver [Handling errors| Axios](https://axios-http.com/docs/handling_errors)).
```javascript
let mockupResponse = {
    serviceUnavailable: {
      data: {
        error: {
          message: "Servidor inalcanzable",
        },
      },
    },
    error: (msg) => {
      return {
        data: {
          error: {
            message: msg,
          },
        },
      };
    },
  };
```
y adicionalmente, una variable que actuará de flag por si no pasamos un método HTTP válido

`let notACRUDMethod = false; //Se pondrá en true si method no es "post, get, put, delete"`

