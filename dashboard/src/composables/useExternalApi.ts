import axios, { AxiosRequestConfig } from "axios";

export const useExternalApi = async (options: {
  config: AxiosRequestConfig<unknown>;
}) => {
  try {
    const response = await axios(options.config);
    const { data } = response;

    return {
      data,
      error: null,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const { response } = error;
      const message = `${response?.statusText}. ${error.message}`;
      const reason = response?.data?.error_details.message;

      return {
        data: null,
        error: {
          message,
          reason,
        },
      };
    }

    return {
      data: null,
      error: {
        message: error.message,
      },
    };
  }
};
