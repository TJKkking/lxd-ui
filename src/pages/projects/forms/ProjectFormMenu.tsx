import { FC } from "react";
import MenuItem from "components/forms/FormMenuItem";
import { Button } from "@canonical/react-components";
import { useTranslation } from "react-i18next";

export const PROJECT_DETAILS = "Project details";
export const RESOURCE_LIMITS = "Resource limits";
export const CLUSTERS = "Clusters";
export const INSTANCES = "Instances";
export const DEVICE_USAGE = "Device usage";
export const NETWORKS = "Networks";

interface Props {
  isRestrictionsOpen: boolean;
  toggleRestrictionsOpen: () => void;
  isRestrictionsDisabled: boolean;
  active: string;
  setActive: (val: string) => void;
}

const ProjectFormMenu: FC<Props> = ({
  isRestrictionsOpen,
  toggleRestrictionsOpen,
  isRestrictionsDisabled,
  active,
  setActive,
}) => {
  const menuItemProps = {
    active,
    setActive,
  };

  const { t } = useTranslation();

  return (
    <div className="p-side-navigation--accordion form-navigation">
      <nav aria-label={t("project-form-navigation")}>
        <ul className="p-side-navigation__list">
          <MenuItem label={t("project-details")} {...menuItemProps} />
          <MenuItem label={t("resource-limits")} {...menuItemProps} />
          <li className="p-side-navigation__item">
            <Button
              type="button"
              className="p-side-navigation__accordion-button"
              aria-expanded={isRestrictionsOpen ? "true" : "false"}
              onClick={toggleRestrictionsOpen}
              disabled={isRestrictionsDisabled}
            >
              {t("restrictions")}
            </Button>
            <ul
              className="p-side-navigation__list"
              aria-expanded={isRestrictionsOpen ? "true" : "false"}
            >
              <MenuItem label={t("clusters")} {...menuItemProps} />
              <MenuItem label={t("instances")} {...menuItemProps} />
              <MenuItem label={t("device-usage")} {...menuItemProps} />
              <MenuItem label={t("networks")} {...menuItemProps} />
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default ProjectFormMenu;
