import { FC, useState } from "react";
import { deleteProfile } from "api/profiles";
import { useNavigate } from "react-router-dom";
import { LxdProfile } from "types/profile";
import ItemName from "components/ItemName";
import { useDeleteIcon } from "context/useDeleteIcon";
import {
  ConfirmationButton,
  Icon,
  useNotify,
} from "@canonical/react-components";
import classnames from "classnames";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { useToastNotification } from "context/toastNotificationProvider";
import { useTranslation } from "react-i18next";

interface Props {
  profile: LxdProfile;
  project: string;
  featuresProfiles: boolean;
}

const DeleteProfileBtn: FC<Props> = ({
  profile,
  project,
  featuresProfiles,
}) => {
  const isDeleteIcon = useDeleteIcon();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleDelete = () => {
    setLoading(true);
    deleteProfile(profile.name, project)
      .then(() => {
        void queryClient.invalidateQueries({
          queryKey: [queryKeys.projects, project],
        });
        navigate(`/ui/project/${project}/profiles`);
        toastNotify.success(t("profileDeleted", { name: profile.name }));
      })
      .catch((e) => {
        setLoading(false);
        notify.failure(t("profile-deletion-failed"), e);
      });
  };

  const isDefaultProfile = profile.name === "default";
  const getHoverText = () => {
    if (!featuresProfiles) {
      return t("modifications-are-only-available-in-the-default-project");
    }
    if (isDefaultProfile) {
      return t("the-default-profile-cannot-be-deleted");
    }
    return t("delete-profile");
  };

  return (
    <ConfirmationButton
      onHoverText={getHoverText()}
      appearance={isDeleteIcon ? "base" : "default"}
      className={classnames("u-no-margin--bottom", {
        "has-icon": isDeleteIcon,
      })}
      disabled={isDefaultProfile || !featuresProfiles}
      loading={isLoading}
      confirmationModalProps={{
        title: t("confirm-delete"),
        confirmButtonLabel: t("delete"),
        onConfirm: handleDelete,
        children: (
          <p>
            {t("this-will-permanently-delete-profile")}{" "}
            <ItemName item={profile} bold />.<br />
            {t("this-action-cannot-be-undone-and-can-result-in-data-loss")}
          </p>
        ),
      }}
      shiftClickEnabled
      showShiftClickHint
    >
      {isDeleteIcon && <Icon name="delete" />}
      {!isDeleteIcon && <span>t('delete')</span>}
    </ConfirmationButton>
  );
};

export default DeleteProfileBtn;
