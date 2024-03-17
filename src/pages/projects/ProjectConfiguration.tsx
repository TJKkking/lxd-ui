import { FC } from "react";
import { useParams } from "react-router-dom";
import EditProject from "pages/projects/EditProject";
import Loader from "components/Loader";
import { useProject } from "context/project";
import { useTranslation } from "react-i18next";

const ProjectConfiguration: FC = () => {
  const { project: projectName } = useParams<{ project: string }>();

  const { t } = useTranslation();

  if (!projectName) {
    return <>{t("missing-project")}</>;
  }

  const { project, isLoading } = useProject();

  if (isLoading) {
    return <Loader />;
  }

  return project ? (
    <EditProject project={project} key={project.name} />
  ) : (
    <>{t("loading-project-failed")}</>
  );
};

export default ProjectConfiguration;
