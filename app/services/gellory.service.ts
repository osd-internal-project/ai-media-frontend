import { AxiosInstance } from "axios";

const GalleryServices = (axiosInstance: AxiosInstance) => {
  const baseUrl = "/gallery";
  return {
        deleteById: async (id: string) => {
          return await axiosInstance
            .delete(`${baseUrl}/${id}`)
            .then((res) => res.data)
            .catch((err) => {
              console.log(err);
              throw err;
            });
        },
    findAll: async () => {
      return await axiosInstance
        .get(`${baseUrl}`)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return;
        });
    },

    findById: async (
      projectId: string,
      organizationId: string,
      page: number,
      pageSize: number,
      status?: boolean,
      options?: { hideFailed?: boolean }
    ) => {
      return await axiosInstance
        .get(`${baseUrl}/${projectId}`, {
          params: {
            organizationId,
            page,
            pageSize,
            status,
            ...(options?.hideFailed && { hideFailed: true }),
          },
        })
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return;
        });
    },
    findActivityById: async (
      projectId: string,
      page: number,
      pageSize: number
    ) => {
      return await axiosInstance
        .get(`${baseUrl}/activity/${projectId}`, {
          params: {
            page,
            pageSize,
          },
        })
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return;
        });
    },
    /**
     * Trigger a file download for a gallery item. The core endpoint 302-redirects
     * to a presigned TOS URL (with `Content-Disposition: attachment`), so the
     * bytes stream straight from object storage to the browser instead of being
     * proxied through the API pod. Navigating an anchor (not an XHR) avoids a
     * cross-origin body read, so no TOS CORS config is required.
     *
     * @param id - Gallery item id.
     * @param organizationId - Owning organization id.
     * @param fileName - Optional download filename (server sets Content-Disposition).
     */
    downloadFile: (id: string, organizationId: string, fileName?: string) => {
      const params = new URLSearchParams({ organizationId });
      if (fileName) params.set("filename", fileName);
      const base = axiosInstance.defaults.baseURL ?? "";
      const link = document.createElement("a");
      link.href = `${base}${baseUrl}/download/${id}?${params.toString()}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    },
    updateShareOptions: async (
      taskId: string,
      imageUrl: string,
      status: boolean
    ) => {
      const base = {
        imageUrl,
        status,
      };
      return await axiosInstance
        .patch(`${baseUrl}/task/${taskId}`, { body: base })
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return;
        });
    },
    updateStatus: async (taskId: string, status: boolean) => {
      const base = {
        status,
      };
      return await axiosInstance
        .patch(`${baseUrl}/${taskId}`, { body: base })
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          throw err
        });
    },
  };
};

export default GalleryServices;
