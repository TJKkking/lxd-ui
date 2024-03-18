import React, { FC, ReactNode, useEffect, useState } from "react";
import MenuItem from "components/forms/FormMenuItem";
import { Button, useNotify } from "@canonical/react-components";
import { updateMaxHeight } from "util/updateMaxHeight";
import useEventListener from "@use-it/event-listener";
import { hasDiskError, hasNetworkError } from "util/instanceValidation";
import { InstanceAndProfileFormikProps } from "components/forms/instanceAndProfileFormValues";
import YamlConfirmation from "components/forms/YamlConfirmation";
import { useTranslation } from "react-i18next";

// export const MAIN_CONFIGURATION = "Main configuration";
// export const DISK_DEVICES = "Disk devices";
// export const NETWORK_DEVICES = "Network devices";
// export const RESOURCE_LIMITS = "Resource limits";
// export const SECURITY_POLICIES = "Security policies";
// export const SNAPSHOTS = "Snapshots";
// export const CLOUD_INIT = "Cloud init";
// export const YAML_CONFIGURATION = "YAML configuration";

export const MAIN_CONFIGURATION = "主配置";
export const DISK_DEVICES = "磁盘设备";
export const NETWORK_DEVICES = "网络设备";
export const RESOURCE_LIMITS = "资源限制";
export const SECURITY_POLICIES = "安全策略";
export const SNAPSHOTS = "快照";
export const CLOUD_INIT = "Cloud init";
export const YAML_CONFIGURATION = "YAML 配置";

interface Props {
  isConfigOpen: boolean;
  toggleConfigOpen: () => void;
  active: string;
  setActive: (val: string) => void;
  hasName: boolean;
  formik: InstanceAndProfileFormikProps;
}

const ProfileFormMenu: FC<Props> = ({
  isConfigOpen,
  toggleConfigOpen,
  active,
  setActive,
  hasName,
  formik,
}) => {
  const notify = useNotify();
  const [confirmModal, setConfirmModal] = useState<ReactNode | null>(null);
  const { t } = useTranslation();

  const menuItemProps = {
    active,
    setActive: (val: string) => {
      if (Boolean(formik.values.yaml) && val !== YAML_CONFIGURATION) {
        const handleConfirm = () => {
          void formik.setFieldValue("yaml", undefined);
          setConfirmModal(null);
          setActive(val);
        };

        setConfirmModal(
          <YamlConfirmation
            onConfirm={handleConfirm}
            close={() => setConfirmModal(null)}
          />,
        );
      } else {
        setActive(val);
      }
    },
  };

  const disableReason = hasName
    ? undefined
    : t("please-enter-a-profile-name-to-enable-this-section");

  const resize = () => {
    updateMaxHeight("form-navigation", "p-bottom-controls");
  };
  useEffect(resize, [notify.notification?.message]);
  useEventListener("resize", resize);

  return (
    <div className="p-side-navigation--accordion form-navigation">
      {confirmModal}
      <nav aria-label={t("profile-form-navigation")}>
        <ul className="p-side-navigation__list">
          <MenuItem label={MAIN_CONFIGURATION} {...menuItemProps} />
          <li className="p-side-navigation__item">
            <Button
              type="button"
              className="p-side-navigation__accordion-button"
              aria-expanded={isConfigOpen ? "true" : "false"}
              onClick={toggleConfigOpen}
              disabled={Boolean(disableReason)}
              title={disableReason}
            >
              {t("advanced")}
            </Button>
            <ul
              className="p-side-navigation__list"
              aria-expanded={isConfigOpen ? "true" : "false"}
            >
              <MenuItem
                label={DISK_DEVICES}
                hasError={hasDiskError(formik)}
                {...menuItemProps}
              />
              <MenuItem
                label={NETWORK_DEVICES}
                hasError={hasNetworkError(formik)}
                {...menuItemProps}
              />
              <MenuItem label={RESOURCE_LIMITS} {...menuItemProps} />
              <MenuItem label={SECURITY_POLICIES} {...menuItemProps} />
              <MenuItem label={SNAPSHOTS} {...menuItemProps} />
              <MenuItem label={CLOUD_INIT} {...menuItemProps} />
            </ul>
          </li>
          <MenuItem
            label={YAML_CONFIGURATION}
            disableReason={disableReason}
            {...menuItemProps}
          />
        </ul>
      </nav>
    </div>
  );
};

export default ProfileFormMenu;
