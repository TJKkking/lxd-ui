import { FC } from "react";
import ItemName from "components/ItemName";
import { LxdOperation } from "types/operation";
import InstanceLink from "pages/instances/InstanceLink";
import { getInstanceName, getProjectName } from "util/operations";
import { useTranslation } from "react-i18next";

interface Props {
  operation: LxdOperation;
}

const OperationInstanceName: FC<Props> = ({ operation }) => {
  const { t } = useTranslation();
  const projectName = getProjectName(operation);

  const instanceName = getInstanceName(operation);
  if (!instanceName) {
    return null;
  }

  const linkableDescriptions = [
    t("restarting-instance"),
    t("starting-instance"),
    t("stopping-instance"),
    t("unfreezing-instance"),
    t("freezing-instance"),
    t("snapshotting-instance"),
    t("restoring-snapshot"),
    // "Deleting snapshot",  broken response, see https://github.com/lxc/lxd/issues/11713
    // "Updating snapshot",  broken response, see https://github.com/lxc/lxd/issues/11713
    t("updating-instance"),
    t("renaming-instance"),
    t("executing-command"),
    t("showing-console"),
  ];
  const isLinkable =
    (operation.status === t("success") &&
      operation.description === t("creating-instance")) ||
    linkableDescriptions.includes(operation.description);

  if (isLinkable && projectName) {
    return (
      <InstanceLink
        instance={{
          name: instanceName,
          project: projectName,
        }}
      />
    );
  }

  return (
    <ItemName
      item={{
        name: instanceName,
      }}
    />
  );
};
export default OperationInstanceName;
