import { FC, useState } from "react";
import { deleteImageBulk } from "api/images";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { ConfirmationButton } from "@canonical/react-components";
import { useEventQueue } from "context/eventQueue";
import { getPromiseSettledCounts } from "util/helpers";
import { pluralize } from "util/instanceBulkActions";
import { useToastNotification } from "context/toastNotificationProvider";
import { useTranslation } from "react-i18next";

interface Props {
  fingerprints: string[];
  project: string;
  onStart: () => void;
  onFinish: () => void;
}

const BulkDeleteImageBtn: FC<Props> = ({
  fingerprints,
  project,
  onStart,
  onFinish,
}) => {
  const eventQueue = useEventQueue();
  const toastNotify = useToastNotification();
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const { t } = useTranslation();

  const count = fingerprints.length;

  const handleDelete = () => {
    setLoading(true);
    onStart();
    void deleteImageBulk(fingerprints, project, eventQueue).then((results) => {
      const { fulfilledCount, rejectedCount } =
        getPromiseSettledCounts(results);
      if (fulfilledCount === count) {
        toastNotify.success(
          <>
            <b>{fingerprints.length}</b>{" "}
            {pluralize("image", fingerprints.length)} deleted.
          </>,
        );
      } else if (rejectedCount === count) {
        toastNotify.failure(
          t("image-bulk-deletion-failed"),
          undefined,
          <>
            <b>{count}</b> {pluralize("image", count)} t('could-not-be-deleted')
          </>,
        );
      } else {
        toastNotify.failure(
          t("image-bulk-deletion-partially-failed"),
          undefined,
          <>
            <b>{fulfilledCount}</b> {pluralize("image", fulfilledCount)}{" "}
            deleted.
            <br />
            <b>{rejectedCount}</b> {pluralize("image", rejectedCount)}{" "}
            t('could-not-be-deleted')
          </>,
        );
      }
      void queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === queryKeys.images,
      });
      setLoading(false);
      onFinish();
    });
  };

  return (
    <ConfirmationButton
      loading={isLoading}
      confirmationModalProps={{
        title: t("confirm-delete"),
        children: (
          <p>
            t('this-will-permanently-delete'){" "}
            <b>
              {fingerprints.length} {pluralize("image", fingerprints.length)}
            </b>
            .<br />
            {t("this-action-cannot-be-undone-and-can-result-in-data-loss")}
          </p>
        ),
        confirmButtonLabel: t("delete"),
        onConfirm: handleDelete,
      }}
      appearance=""
      className="u-no-margin--bottom"
      disabled={isLoading}
      shiftClickEnabled
      showShiftClickHint
    >
      {t("delete")} {pluralize("image", fingerprints.length)}
    </ConfirmationButton>
  );
};

export default BulkDeleteImageBtn;
