import { FC, ReactNode } from "react";
import { Input, Notification, Select } from "@canonical/react-components";
import { optionYesNo } from "util/instanceOptions";
import {
  InstanceAndProfileFormikProps,
  InstanceAndProfileFormValues,
} from "./instanceAndProfileFormValues";
import { getConfigurationRow } from "components/ConfigurationRow";
import ScrollableConfigurationTable from "components/forms/ScrollableConfigurationTable";
import { getInstanceKey } from "util/instanceConfigFields";
import { optionRenderer } from "util/formFields";
import SnapshotScheduleInput from "components/SnapshotScheduleInput";
import { useProject } from "context/project";
import { isSnapshotsDisabled } from "util/snapshots";
import SnapshotDiabledWarningLink from "components/SnapshotDiabledWarningLink";
import { useTranslation } from "react-i18next";

export interface SnapshotFormValues {
  snapshots_pattern?: string;
  snapshots_expiry?: string;
  snapshots_schedule?: string;
  snapshots_schedule_stopped?: string;
}

export const snapshotsPayload = (values: InstanceAndProfileFormValues) => {
  return {
    [getInstanceKey("snapshots_pattern")]: values.snapshots_pattern,
    [getInstanceKey("snapshots_schedule_stopped")]:
      values.snapshots_schedule_stopped,
    [getInstanceKey("snapshots_schedule")]: values.snapshots_schedule,
    [getInstanceKey("snapshots_expiry")]: values.snapshots_expiry,
  };
};

interface Props {
  formik: InstanceAndProfileFormikProps;
  children?: ReactNode;
}

const InstanceSnapshotsForm: FC<Props> = ({ formik }) => {
  const { project } = useProject();
  const snapshotDisabled = isSnapshotsDisabled(project);
  const { t } = useTranslation();

  return (
    <>
      {snapshotDisabled && (
        <Notification
          severity="caution"
          title={t("snapshotCreationDisabled", { projectName: project?.name })}
        >
          <SnapshotDiabledWarningLink project={project} />
        </Notification>
      )}
      <ScrollableConfigurationTable
        rows={[
          getConfigurationRow({
            formik,
            label: t("snapshot-name-pattern"),
            name: "snapshots_pattern",
            defaultValue: "",
            children: (
              <Input placeholder={t("enter-name-pattern")} type="text" />
            ),
          }),

          getConfigurationRow({
            formik,
            label: t("expire-after"),
            name: "snapshots_expiry",
            defaultValue: "",
            children: (
              <Input placeholder={t("enter-expiry-expression")} type="text" />
            ),
          }),

          getConfigurationRow({
            formik,
            label: t("snapshot-stopped-instances"),
            name: "snapshots_schedule_stopped",
            defaultValue: "",
            readOnlyRenderer: (val) => optionRenderer(val, optionYesNo),
            children: <Select options={optionYesNo} />,
          }),

          getConfigurationRow({
            formik,
            label: t("schedule"),
            name: "snapshots_schedule",
            defaultValue: "",
            children: (
              <SnapshotScheduleInput
                value={formik.values.snapshots_schedule}
                setValue={(val) =>
                  void formik.setFieldValue("snapshots_schedule", val)
                }
              />
            ),
          }),
        ]}
      />
    </>
  );
};

export default InstanceSnapshotsForm;
