import { FC, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LxdProject } from "types/project";
import { deleteProject } from "api/projects";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import ItemName from "components/ItemName";
import { isProjectEmpty } from "util/projects";
import { useDeleteIcon } from "context/useDeleteIcon";
import {
  ConfirmationButton,
  Icon,
  useNotify,
} from "@canonical/react-components";
import classnames from "classnames";
import { useToastNotification } from "context/toastNotificationProvider";
import { useTranslation } from "react-i18next";

interface Props {
  project: LxdProject;
}

const DeleteProjectBtn: FC<Props> = ({ project }) => {
  const isDeleteIcon = useDeleteIcon();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { t } = useTranslation();

  const isDefaultProject = project.name === "default";
  const isEmpty = isProjectEmpty(project);
  const getHoverText = () => {
    if (isDefaultProject) {
      return t("the-default-project-cannot-be-deleted");
    }
    if (!isEmpty) {
      return t("non-empty-projects-cannot-be-deleted");
    }
    return t("delete-project");
  };

  const handleDelete = () => {
    setLoading(true);
    deleteProject(project)
      .then(() => {
        navigate(`/ui/project/default/instances`);
        toastNotify.success(t("projectDeleted", { name: project.name }));
      })
      .catch((e) => {
        setLoading(false);
        notify.failure(t("project-deletion-failed"), e);
      })
      .finally(() => {
        void queryClient.invalidateQueries({
          queryKey: [queryKeys.projects],
        });
      });
  };

  return (
    <ConfirmationButton
      onHoverText={getHoverText()}
      appearance={isDeleteIcon ? "base" : "default"}
      className={classnames("u-no-margin--bottom", {
        "has-icon": isDeleteIcon,
      })}
      loading={isLoading}
      disabled={isDefaultProject || !isEmpty}
      confirmationModalProps={{
        title: t("confirm-delete"),
        confirmButtonLabel: t("delete"),
        onConfirm: handleDelete,
        children: (
          <p>
            {t("this-will-permanently-delete-project")}{" "}
            <ItemName item={project} bold />.<br />
            {t("this-action-cannot-be-undone-and-can-result-in-data-loss")}
          </p>
        ),
      }}
      shiftClickEnabled
      showShiftClickHint
    >
      {isDeleteIcon && <Icon name="delete" />}
      {!isDeleteIcon && <span>{t("delete-project")}</span>}
    </ConfirmationButton>
  );
};

export default DeleteProjectBtn;
