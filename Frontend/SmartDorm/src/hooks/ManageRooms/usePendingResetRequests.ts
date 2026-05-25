import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import { API_BASE } from "../../config";

export const usePendingResetRequests =
  () => {

    const [count, setCount] =
      useState(0);

    useEffect(() => {

      const fetchCount =
        async () => {

          try {

            const res =
              await api.get(`${API_BASE}/auth/admin/reset-requests/count`);
            
            setCount(
              res.data.count || 0
            );

          } catch (err) {

            console.error(
              "RESET REQUEST COUNT ERROR:",
              err
            );

          }

        };

      fetchCount();

    }, []);

    return count;
  };