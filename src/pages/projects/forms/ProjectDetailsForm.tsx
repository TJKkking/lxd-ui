import { FC, useState } from "react";
import {
  CheckboxInput,
  Col,
  Icon,
  Input,
  Row,
  Select,
  Tooltip,
} from "@canonical/react-components";
import { FormikProps } from "formik/dist/types";
import { getProjectKey } from "util/projectConfigFields";
import { isProjectEmpty } from "util/projects";
import { LxdProject } from "types/project";
import AutoExpandingTextArea from "components/AutoExpandingTextArea";
import ScrollableForm from "components/ScrollableForm";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import { useTranslation } from "react-i18next";

export interface ProjectDetailsFormValues {
  name: string;
  description?: string;
  restricted: boolean;
  features_images?: boolean;
  features_profiles?: boolean;
  features_networks?: boolean;
  features_networks_zones?: boolean;
  features_storage_buckets?: boolean;
  features_storage_volumes?: boolean;
  readOnly: boolean;
  entityType: "project";
}

export const projectDetailPayload = (values: ProjectDetailsFormValues) => {
  return {
    name: values.name,
    description: values.description,
  };
};

export const projectDetailRestrictionPayload = (
  values: ProjectDetailsFormValues,
) => {
  const boolToPayload = (value?: boolean) => {
    if (value === undefined) {
      return undefined;
    }
    return value ? "true" : "false";
  };

  return {
    [getProjectKey("restricted")]: boolToPayload(values.restricted),
    [getProjectKey("features_images")]: boolToPayload(values.features_images),
    [getProjectKey("features_profiles")]: boolToPayload(
      values.features_profiles,
    ),
    [getProjectKey("features_networks")]: boolToPayload(
      values.features_networks,
    ),
    [getProjectKey("features_networks_zones")]: boolToPayload(
      values.features_networks_zones,
    ),
    [getProjectKey("features_storage_buckets")]: boolToPayload(
      values.features_storage_buckets,
    ),
    [getProjectKey("features_storage_volumes")]: boolToPayload(
      values.features_storage_volumes,
    ),
  };
};

interface Props {
  formik: FormikProps<ProjectDetailsFormValues>;
  project?: LxdProject;
  isEdit: boolean;
}

const ProjectDetailsForm: FC<Props> = ({ formik, project, isEdit }) => {
  const { hasProjectsNetworksZones, hasStorageBuckets } =
    useSupportedFeatures();

  const { t } = useTranslation();

  const figureFeatures = () => {
    if (
      formik.values.features_images === undefined &&
      formik.values.features_profiles === undefined &&
      formik.values.features_networks === undefined &&
      formik.values.features_networks_zones === undefined &&
      formik.values.features_storage_buckets === undefined &&
      formik.values.features_storage_volumes === undefined
    ) {
      return "default";
    }
    if (
      formik.values.features_images !== true ||
      formik.values.features_profiles !== true ||
      formik.values.features_networks !== false ||
      formik.values.features_networks_zones !== false ||
      formik.values.features_storage_buckets !== true ||
      formik.values.features_storage_volumes !== true
    ) {
      return "customised";
    }
    return "default";
  };
  const [features, setFeatures] = useState(figureFeatures());

  const isDefaultProject = formik.values.name === "default";
  const readOnly = formik.values.readOnly;
  const isNonEmpty = project ? !isProjectEmpty(project) : false;
  const hadFeaturesNetwork = project?.config["features.networks"] === "true";
  const hadFeaturesNetworkZones =
    project?.config["features.networks.zones"] === "true";

  return (
    <ScrollableForm>
      <Row>
        <Col size={12}>
          <Input
            id="name"
            name="name"
            type="text"
            label={t("project-name")}
            placeholder={t("enter-name")}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.name}
            error={formik.touched.name ? formik.errors.name : null}
            disabled={formik.values.name === "default" || isEdit}
            help={
              formik.values.name !== "default" &&
              t("click-the-name-in-the-header-to-rename-the-project")
            }
            required
          />
          <AutoExpandingTextArea
            id="description"
            name="description"
            label={t("description")}
            placeholder={t("enter-description")}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.description}
            disabled={formik.values.readOnly}
            dynamicHeight
          />
          <Select
            id="features"
            name="features"
            label={t("features")}
            onChange={(e) => {
              setFeatures(e.target.value);
              void formik.setFieldValue("features_images", true);
              void formik.setFieldValue("features_profiles", true);
              void formik.setFieldValue("features_networks", false);
              void formik.setFieldValue("features_networks_zones", false);
              void formik.setFieldValue("features_storage_buckets", true);
              void formik.setFieldValue("features_storage_volumes", true);
            }}
            value={features}
            options={[
              {
                label: "Default LXD",
                value: "default",
              },
              {
                label: t("customised"),
                value: "customised",
              },
            ]}
            disabled={
              readOnly ||
              isDefaultProject ||
              (isNonEmpty && hadFeaturesNetwork) ||
              (isNonEmpty && hadFeaturesNetworkZones)
            }
          />
          {features === "customised" && (
            <>
              {t("allow-the-following-features")}
              <CheckboxInput
                id="features_images"
                name="features_images"
                label={t("images")}
                onChange={() =>
                  void formik.setFieldValue(
                    "features_images",
                    !formik.values.features_images,
                  )
                }
                checked={formik.values.features_images}
                disabled={readOnly || isDefaultProject || isNonEmpty}
              />
              <CheckboxInput
                id="features_profiles"
                name="features_profiles"
                label={
                  <>
                    {t("profiles")}
                    <Tooltip
                      className="checkbox-label-tooltip"
                      message={t(
                        "allow-profiles-to-enable-custom-n-restrictions-on-a-project-level",
                      )}
                    >
                      <Icon name="info--dark" />
                    </Tooltip>
                  </>
                }
                onChange={() => {
                  const newValue = !formik.values.features_profiles;
                  void formik.setFieldValue("features_profiles", newValue);
                  if (!newValue) {
                    void formik.setFieldValue("restricted", false);
                  }
                }}
                checked={formik.values.features_profiles}
                disabled={readOnly || isDefaultProject || isNonEmpty}
              />
              <CheckboxInput
                id="features_networks"
                name="features_networks"
                label={t("networks")}
                onChange={() =>
                  void formik.setFieldValue(
                    "features_networks",
                    !formik.values.features_networks,
                  )
                }
                checked={formik.values.features_networks}
                disabled={readOnly || isDefaultProject || isNonEmpty}
              />
              {hasProjectsNetworksZones && (
                <CheckboxInput
                  id="features_networks_zones"
                  name="features_networks_zones"
                  label={t("network-zones")}
                  onChange={() =>
                    void formik.setFieldValue(
                      "features_networks_zones",
                      !formik.values.features_networks_zones,
                    )
                  }
                  checked={formik.values.features_networks_zones}
                  disabled={
                    readOnly ||
                    isDefaultProject ||
                    (isNonEmpty && hadFeaturesNetworkZones)
                  }
                />
              )}
              {hasStorageBuckets && (
                <CheckboxInput
                  id="features_storage_buckets"
                  name="features_storage_buckets"
                  label={t("storage-buckets")}
                  onChange={() =>
                    void formik.setFieldValue(
                      "features_storage_buckets",
                      !formik.values.features_storage_buckets,
                    )
                  }
                  checked={formik.values.features_storage_buckets}
                  disabled={readOnly || isDefaultProject || isNonEmpty}
                />
              )}
              <CheckboxInput
                id="features_storage_volumes"
                name="features_storage_volumes"
                label={t("storage-volumes")}
                onChange={() =>
                  void formik.setFieldValue(
                    "features_storage_volumes",
                    !formik.values.features_storage_volumes,
                  )
                }
                checked={formik.values.features_storage_volumes}
                disabled={readOnly || isDefaultProject || isNonEmpty}
              />
            </>
          )}
          <hr />
          <CheckboxInput
            id="custom_restrictions"
            name="custom_restrictions"
            label={
              <>
                {t("allow-custom-restrictions-on-a-project-level")}
                <Tooltip
                  className="checkbox-label-tooltip"
                  message={t(
                    "custom-restrictions-are-only-available-n-to-projects-with-enabled-profiles",
                  )}
                >
                  <Icon name="info--dark" />
                </Tooltip>
              </>
            }
            onChange={() =>
              void formik.setFieldValue("restricted", !formik.values.restricted)
            }
            checked={formik.values.restricted}
            disabled={
              formik.values.readOnly ||
              (formik.values.features_profiles === false &&
                features === "customised")
            }
          />
        </Col>
      </Row>
    </ScrollableForm>
  );
};

export default ProjectDetailsForm;
