import { FC, useState } from "react";
import { deleteImage } from "api/images";
import { LxdImage } from "types/image";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { ConfirmationButton, Icon } from "@canonical/react-components";
import { useEventQueue } from "context/eventQueue";
import { useToastNotification } from "context/toastNotificationProvider";
import { useTranslation } from "react-i18next";

interface Props {
  image: LxdImage;
  project: string;
}

const DeleteImageBtn: FC<Props> = ({ image, project }) => {
  const eventQueue = useEventQueue();
  const toastNotify = useToastNotification();
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const { t } = useTranslation();

  const handleDelete = () => {
    setLoading(true);
    void deleteImage(image, project)
      .then((operation) =>
        eventQueue.set(
          operation.metadata.id,
          () => {
            void queryClient.invalidateQueries({
              queryKey: [queryKeys.images],
            });
            void queryClient.invalidateQueries({
              queryKey: [queryKeys.projects, project],
            });
            toastNotify.success(
              t("imageDeleted", { description: image.properties.description }),
            );
          },
          (msg) =>
            toastNotify.failure(
              t("imageDeletionFailed", {
                description: image.properties.description,
              }),
              new Error(msg),
            ),
          () => setLoading(false),
        ),
      )
      .catch((e) => {
        toastNotify.failure(
          t("imageDeletionFailed", {
            description: image.properties.description,
          }),
          e,
        );
        setLoading(false);
      });
  };

  return (
    <ConfirmationButton
      loading={isLoading}
      confirmationModalProps={{
        title: t("confirm-delete"),
        children: (
          <p>
            t('this-will-permanently-delete-image'){" "}
            <b>{image.properties.description}</b>.<br />
            {t("this-action-cannot-be-undone-and-can-result-in-data-loss")}
          </p>
        ),
        confirmButtonLabel: t("delete"),
        onConfirm: handleDelete,
      }}
      className="has-icon"
      appearance="base"
      disabled={isLoading}
      shiftClickEnabled
      showShiftClickHint
    >
      <Icon name="delete" />
    </ConfirmationButton>
  );
};

export default DeleteImageBtn;
