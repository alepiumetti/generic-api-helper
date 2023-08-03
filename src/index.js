import ajax from "./axios";
const methodCallers = {
  post: async (url, data) => {
    if (data) {
      return await ajax.post(url, data);
    } else {
      return await ajax.post(url);
    }
  },
  get: async (url, data) => {
    if (data) {
      return await ajax.get(url, { params: data });
    } else {
      return await ajax.get(url);
    }
  },
  put: async (url, data) => {
    if (data) {
      return await ajax.put(url, data);
    } else {
      return await ajax.put(url);
    }
  },
  delete: async (url, data) => {
    if (data) {
      return await ajax.delete(url, { params: data });
    } else {
      return await ajax.delete(url);
    }
  },
};
/**
 * @description Esta función es utilizada para hacer queries de manera abstracta.
 * @async
 * @param {string} method - Metodo HTTP
 * @param {string} url - Uniform Resource Locator (URL Del endpoint)
 * @param {Object} data - Objecto a utilizar como parametro en el req.body o req.query
 */

export async function httpCRUDEndpoint(method, url, data = null) {
  // TODO: Hay que ver si podemos agregar en nginx alguna especie de redireccion a un 503
  // en caso de que no este disponible el servidor.
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
  let notACRUDMethod = false;
  method = method.toLocaleLowerCase();
  if (!method in methodCallers) {
    notACRUDMethod = true;
  }
  if (!notACRUDMethod) {
    try {
      console.log(method);
      let key = methodCallers[`${method}`];
      console.log(key);
      let res = await methodCallers[`${method}`](url, data);
      return res.data;
    } catch (error) {
      console.error("Error en: api.helper.js - postBombas() - Error", error);
      // Una cosa tipica del objeto "AxiosInstance" es que tiene una propiedad particular,
      // y es la de "defaults".
      if (typeof res === "object" && res !== null && "defaults" in res) {
        return error.res.data;
      } else {
        return mockupResponse.error(
          "Error desconocido, si el error persiste, contactar al soporte."
        );
      }
    }
  } else {
    let errorMessage = `[api.helper.js] ${method} not a valid HTTP Method for CRUD operations, must be: ${Object.keys(
      methodCallers
    ).join(" | ")}`;
    console.error(errorMessage);
    return mockupResponse.error(errorMessage);
  }
}
