import { getCookie }
from "@/lib/cookies";

import { ROLE }
from "@/config/role.config";

export const isMasterEditable =
  () => {

    const role =
      getCookie("role");

    return (
      role === ROLE.ADMIN
    );
};