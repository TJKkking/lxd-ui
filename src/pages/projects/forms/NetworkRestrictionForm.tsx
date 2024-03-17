import { FC } from "react";
import { Textarea } from "@canonical/react-components";
import { getConfigurationRow } from "components/ConfigurationRow";
import ScrollableConfigurationTable from "components/forms/ScrollableConfigurationTable";
import { ProjectFormValues } from "pages/projects/CreateProject";
import { FormikProps } from "formik/dist/types";
import { getProjectKey } from "util/projectConfigFields";
import { useTranslation } from "react-i18next";

export interface NetworkRestrictionFormValues {
  restricted_network_access?: string;
  restricted_network_subnets?: string;
  restricted_network_uplinks?: string;
  restricted_network_zones?: string;
}

export const networkRestrictionPayload = (
  values: NetworkRestrictionFormValues,
) => {
  return {
    [getProjectKey("restricted_network_access")]:
      values.restricted_network_access,
    [getProjectKey("restricted_network_subnets")]:
      values.restricted_network_subnets,
    [getProjectKey("restricted_network_uplinks")]:
      values.restricted_network_uplinks,
    [getProjectKey("restricted_network_zones")]:
      values.restricted_network_zones,
  };
};

interface Props {
  formik: FormikProps<ProjectFormValues>;
}

const NetworkRestrictionForm: FC<Props> = ({ formik }) => {
  const { t } = useTranslation();
  return (
    <ScrollableConfigurationTable
      rows={[
        getConfigurationRow({
          formik,
          name: "restricted_network_access",
          label: t("available-networks"),
          defaultValue: "",
          children: <Textarea placeholder={t("enter-network-names")} />,
        }),

        getConfigurationRow({
          formik,
          name: "restricted_network_subnets",
          label: t("network-subnets"),
          defaultValue: "",
          children: <Textarea placeholder={t("enter-network-subnets")} />,
        }),

        getConfigurationRow({
          formik,
          name: "restricted_network_uplinks",
          label: t("network-uplinks"),
          defaultValue: "",
          children: <Textarea placeholder={t("enter-network-names")} />,
        }),

        getConfigurationRow({
          formik,
          name: "restricted_network_zones",
          label: t("network-zones"),
          defaultValue: "",
          children: <Textarea placeholder={t("enter-network-zones")} />,
        }),
      ]}
    />
  );
};

export default NetworkRestrictionForm;
