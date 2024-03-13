import { FC, useState } from "react";
import {
  ActionButton,
  Button,
  ContextualMenu,
  EmptyState,
  Icon,
  RadioInput,
  useNotify,
} from "@canonical/react-components";
import InstanceGraphicConsole from "./InstanceGraphicConsole";
import { LxdInstance } from "types/instance";
import InstanceTextConsole from "./InstanceTextConsole";
import { useInstanceStart } from "util/instanceStart";
import {
  sendAltF4,
  sendAltTab,
  sendCtrlAltDel,
} from "../../lib/spice/src/inputs";
import AttachIsoBtn from "pages/instances/actions/AttachIsoBtn";
import NotificationRow from "components/NotificationRow";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import { useTranslation } from "react-i18next";

interface Props {
  instance: LxdInstance;
}

const InstanceConsole: FC<Props> = ({ instance }) => {
  const { t } = useTranslation();
  const notify = useNotify();
  const isVm = instance.type === "virtual-machine";
  const [isGraphic, setGraphic] = useState(isVm);
  const { hasCustomVolumeIso } = useSupportedFeatures();

  const isRunning = instance.status === t("running");

  const onFailure = (title: string, e: unknown, message?: string) => {
    notify.failure(title, e, message);
  };

  const showNotRunningInfo = () => {
    notify.info(
      t("start-the-instance-to-interact-with-the-text-console"),
      t("instance-not-running"),
    );
  };

  let handleFullScreen = () => {
    /**/
  };

  const onChildMount = (childHandleFullScreen: () => void) => {
    handleFullScreen = childHandleFullScreen;
  };

  const setGraphicConsole = (isGraphic: boolean) => {
    notify.clear();
    setGraphic(isGraphic);
  };

  const { handleStart, isLoading } = useInstanceStart(instance);

  return (
    <div className="instance-console-tab">
      {isVm && (
        <div className="p-panel__controls">
          <div className="console-radio-wrapper">
            <RadioInput
              labelClassName="right-margin"
              label={t("graphic")}
              checked={isGraphic}
              onChange={() => setGraphicConsole(true)}
            />
            <RadioInput
              label={t("text-console")}
              checked={!isGraphic}
              onChange={() => setGraphicConsole(false)}
            />
          </div>
          {isGraphic && isRunning && (
            <div>
              {hasCustomVolumeIso && <AttachIsoBtn instance={instance} />}
              <Button
                className="u-no-margin--bottom"
                onClick={() => handleFullScreen()}
              >
                <span>{t("fullscreen")}</span>
              </Button>
              <ContextualMenu
                hasToggleIcon
                toggleLabel={t("shortcuts")}
                toggleClassName="u-no-margin--bottom"
                links={[
                  {
                    children: t("send-ctrl-alt-del"),
                    onClick: () => sendCtrlAltDel(window.spice_connection),
                  },
                  {
                    children: t("send-alt-tab"),
                    onClick: () => sendAltTab(window.spice_connection),
                  },
                  {
                    children: t("send-alt-f4"),
                    onClick: () => sendAltF4(window.spice_connection),
                  },
                ]}
              />
            </div>
          )}
        </div>
      )}
      <NotificationRow />
      {isGraphic && !isRunning && (
        <EmptyState
          className="empty-state"
          image={<Icon name="containers" className="empty-state-icon" />}
          title={t("instance-stopped")}
        >
          <p>{t("start-the-instance-to-access-the-graphic-console")}</p>
          <ActionButton
            appearance="positive"
            loading={isLoading}
            onClick={handleStart}
          >
            {t("start-instance")}
          </ActionButton>
        </EmptyState>
      )}
      {isGraphic && isRunning && (
        <div className="spice-wrapper">
          <InstanceGraphicConsole
            instance={instance}
            onMount={onChildMount}
            onFailure={onFailure}
          />
        </div>
      )}
      {!isGraphic && (
        <InstanceTextConsole
          instance={instance}
          onFailure={onFailure}
          showNotRunningInfo={showNotRunningInfo}
        />
      )}
    </div>
  );
};

export default InstanceConsole;
