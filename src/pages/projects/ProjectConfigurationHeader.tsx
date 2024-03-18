import { FC, useState } from "react";
import { useNavigate } from "react-router-dom";
import RenameHeader, { RenameHeaderValues } from "components/RenameHeader";
import { LxdProject } from "types/project";
import { renameProject } from "api/projects";
import * as Yup from "yup";
import { useFormik } from "formik";
import { checkDuplicateName } from "util/helpers";
import DeleteProjectBtn from "./actions/DeleteProjectBtn";
import HelpLink from "components/HelpLink";
import { useEventQueue } from "context/eventQueue";
import { useDocs } from "context/useDocs";
import { useToastNotification } from "context/toastNotificationProvider";
import { useTranslation } from "react-i18next";

interface Props {
  project: LxdProject;
}

const ProjectConfigurationHeader: FC<Props> = ({ project }) => {
  const docBaseLink = useDocs();
  const eventQueue = useEventQueue();
  const navigate = useNavigate();
  const toastNotify = useToastNotification();
  const controllerState = useState<AbortController | null>(null);

  const { t } = useTranslation();

  const RenameSchema = Yup.object().shape({
    name: Yup.string()
      .test(
        "deduplicate",
        t("a-project-with-this-name-already-exists"),
        (value) =>
          project.name === value ||
          checkDuplicateName(value, "", controllerState, "projects"),
      )
      .required(t("project-name-is-required")),
  });

  const formik = useFormik<RenameHeaderValues>({
    initialValues: {
      name: project.name,
      isRenaming: false,
    },
    validationSchema: RenameSchema,
    onSubmit: (values) => {
      if (project.name === values.name) {
        void formik.setFieldValue("isRenaming", false);
        formik.setSubmitting(false);
        return;
      }
      void renameProject(project.name, values.name)
        .then((operation) =>
          eventQueue.set(
            operation.metadata.id,
            () => {
              navigate(`/ui/project/${values.name}/configuration`);
              toastNotify.success(
                t("projectRenamed", {
                  oldName: project.name,
                  newName: values.name,
                }),
              );
              void formik.setFieldValue("isRenaming", false);
            },
            (msg) =>
              toastNotify.failure(
                t("projectRenamingFailed", { name: project.name }),
                new Error(msg),
              ),
            () => formik.setSubmitting(false),
          ),
        )
        .catch((e) => {
          formik.setSubmitting(false);
          toastNotify.failure(
            t("projectRenamingFailed", { name: project.name }),
            e,
          );
        });
    },
  });

  return (
    <RenameHeader
      name={project.name}
      parentItems={[
        <HelpLink
          key="project-configuration"
          href={`${docBaseLink}/reference/projects/`}
          title={t("learn-more-about-project-configuration")}
        >
          {t("project-configuration")}
        </HelpLink>,
      ]}
      renameDisabledReason={
        project.name === "default"
          ? t("cannot-rename-the-default-project")
          : undefined
      }
      controls={<DeleteProjectBtn project={project} />}
      isLoaded={Boolean(project)}
      formik={formik}
    />
  );
};

export default ProjectConfigurationHeader;
