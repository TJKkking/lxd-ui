import { FC, useState } from "react";
import { useNavigate } from "react-router-dom";
import ItemName from "components/ItemName";
import { deleteClusterGroup } from "api/cluster";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import { ConfirmationButton, useNotify } from "@canonical/react-components";
import { useToastNotification } from "context/toastNotificationProvider";
import { useTranslation } from "react-i18next";

interface Props {
  group: string;
}

const DeleteClusterGroupBtn: FC<Props> = ({ group }) => {
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const handleDelete = () => {
    setLoading(true);
    deleteClusterGroup(group)
      .then(() => {
        navigate(`/ui/cluster`);
        toastNotify.success(t("clusterGroupDeleted", { group: group }));
      })
      .catch((e) => {
        setLoading(false);
        notify.failure(t("cluster-group-deletion-failed"), e);
      })
      .finally(() => {
        void queryClient.invalidateQueries({
          queryKey: [queryKeys.cluster, queryKeys.groups],
        });
      });
  };

  const isDefaultGroup = group === "default";
  const getHoverText = () => {
    if (isDefaultGroup) {
      return t("the-default-cluster-group-cannot-be-deleted");
    }
    return t("delete-cluster-group");
  };

  return (
    <ConfirmationButton
      onHoverText={getHoverText()}
      appearance=""
      loading={isLoading}
      confirmationModalProps={{
        title: t("confirm-delete"),
        confirmMessage: (
          <p>
            {t("this-will-permanently-delete-cluster-group")}{" "}
            <ItemName item={{ name: group }} bold />. <br />
            {t("this-action-cannot-be-undone-and-can-result-in-data-loss")}
          </p>
        ),
        confirmButtonLabel: t("delete"),
        onConfirm: handleDelete,
      }}
      disabled={isDefaultGroup}
      shiftClickEnabled
      showShiftClickHint
    >
      <span>t('delete-cluster-group')</span>
    </ConfirmationButton>
  );
};

export default DeleteClusterGroupBtn;
