import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

type ProxyRequestData = Record<string, unknown> | undefined;

export async function proxyRequest<T = unknown>(
  url: string,
  method: 'GET' | 'POST',
  data?: ProxyRequestData,
): Promise<T> {
  try {
    const config: AxiosRequestConfig = {
      method,
      url,
    };

    if (method === 'POST') {
      config.data = data;
    } else if (data && Object.keys(data).length > 0) {
      config.params = data;
    }

    const response: AxiosResponse<T> = await axios(config);
    return response.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error(`❌ Ошибка проксирования запроса к ${url}:`, err.message);
      if (err.response?.data) {
        console.error('💥 Ответ от сервиса:', err.response.data);
      }
    } else {
      console.error(`❌ Неизвестная ошибка при проксировании запроса к ${url}`);
    }
    throw new Error('Ошибка при проксировании запроса через Gateway');
  }
}
