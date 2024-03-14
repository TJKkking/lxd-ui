import { FC, useState } from "react";
import { LxdOperation } from "types/operation";
import { cancelOperation } from "api/operations";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { ConfirmationButton, useNotify } from "@canonical/react-components";
import { useToastNotification } from "context/toastNotificationProvider";
import { useTranslation } from "react-i18next";

interface Props {
  operation: LxdOperation;
  project?: string;
}

const CancelOperationBtn: FC<Props> = ({ operation, project }) => {
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const handleCancel = () => {
    setLoading(true);
    cancelOperation(operation.id)
      .then(() => {
        toastNotify.success(
          t("operationCancelled", { description: operation.description }),
        );
      })
      .catch((e) => {
        notify.failure(t("operation-cancellation-failed"), e);
      })
      .finally(() => {
        setLoading(false);
        void queryClient.invalidateQueries({
          queryKey: project
            ? [queryKeys.operations, project]
            : [queryKeys.operations],
        });
      });
  };

  return operation.status !== t("running") ? null : (
    <ConfirmationButton
      onHoverText={
        operation.may_cancel
          ? t("cancel-operation")
          : t("cannot-cancel-operation-at-this-stage")
      }
      className="u-no-margin--bottom"
      loading={isLoading}
      disabled={!operation.may_cancel}
      confirmationModalProps={{
        title: t("confirm-cancel"),
        children: <p>{t("this-will-cancel-the-operation")}</p>,
        confirmButtonLabel: t("cancel-operation"),
        onConfirm: handleCancel,
        cancelButtonLabel: t("go-back"),
      }}
      shiftClickEnabled
      showShiftClickHint
    >
      <span>{t("cancel")}</span>
    </ConfirmationButton>
  );
};

export default CancelOperationBtn;
